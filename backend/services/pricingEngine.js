import mongoose from 'mongoose';
import { PRICING_MODELS } from '../config/constants.js';
import { PricingPlan } from '../models/PricingPlan.js';
import { Meter } from '../models/Meter.js';
import { Customer } from '../models/Customer.js';
import { meteringEngine } from './meteringEngine.js';
import { memoryStore } from '../data/seed.js';

/**
 * ==============================================================================
 * 🧮 PRICING ENGINE SERVICE
 * ==============================================================================
 * Calculates consumption costs across complex pricing structures:
 * - Graduated Tiers (marginal rates per usage block)
 * - Volume Tiers (single rate applied to all volume based on tier reached)
 * - Package Blocks (e.g. $5 per 10,000 units)
 * - Free Allowances (deducts included units prior to billing)
 * ==============================================================================
 */
export class PricingEngine {
  /**
   * Calculates consumption line items and total accrued cost for a customer.
   */
  static async calculateCustomerUsage(customerId) {
    let customer = null;
    if (mongoose.connection.readyState === 1) {
      customer = await Customer.findOne({
        $or: [{ id: customerId }, { _id: customerId.match(/^[0-9a-fA-F]{24}$/) ? customerId : null }]
      }).lean();
    }
    if (!customer) {
      customer = memoryStore.customers.get(customerId);
    }

    if (!customer) {
      throw new Error(`Customer ${customerId} not found`);
    }

    let plan = null;
    if (mongoose.connection.readyState === 1) {
      plan = (await PricingPlan.findOne({ id: customer.planId }).lean()) ||
             (await PricingPlan.findOne().lean());
    }
    if (!plan) {
      plan = memoryStore.pricingPlans.get(customer.planId) ||
             Array.from(memoryStore.pricingPlans.values())[0];
    }

    if (!plan) {
      throw new Error(`Pricing plan not found for customer`);
    }

    const lineItems = [];
    let usageTotal = 0;

    for (const rateCard of plan.rateCards || []) {
      let meter = null;
      if (mongoose.connection.readyState === 1) {
        meter = await Meter.findOne({
          $or: [{ code: rateCard.meterCode }, { id: rateCard.meterId }]
        }).lean();
      }
      if (!meter) {
        meter = memoryStore.meters.get(rateCard.meterCode) || memoryStore.meters.get(rateCard.meterId);
      }

      const meterCode = meter ? meter.code : rateCard.meterCode;
      const meterName = meter ? meter.name : meterCode;
      const unit = meter ? meter.unit : 'units';
      const aggregationType = meter ? meter.aggregationType : 'SUM';

      const agg = meteringEngine.getAggregationForCustomer(customer.id, meterCode);
      const rawQuantity = agg.value;

      const calculation = this.calculateRateCardCost(rateCard, rawQuantity);

      lineItems.push({
        meterId: meter ? meter.id : null,
        meterCode,
        meterName,
        unit,
        aggregationType,
        quantity: rawQuantity,
        billableQuantity: calculation.billableQuantity,
        freeAllowance: rateCard.freeAllowance || 0,
        pricingModel: rateCard.pricingModel,
        tierBreakdown: calculation.tierBreakdown,
        amount: calculation.totalCost
      });

      usageTotal += calculation.totalCost;
    }

    const subtotal = Number(((plan.baseFee || 0) + usageTotal).toFixed(2));
    const tax = 0;
    const total = subtotal + tax;

    return {
      customer,
      plan,
      lineItems,
      baseFee: plan.baseFee || 0,
      usageTotal: Number(usageTotal.toFixed(2)),
      subtotal,
      tax,
      total,
      currency: plan.currency || 'USD',
      budgetLimit: customer.budgetLimit || 5000,
      isBudgetExceeded: total >= (customer.budgetLimit || 5000)
    };
  }

  /**
   * Calculates cost for a specific rate card given a raw consumed quantity.
   */
  static calculateRateCardCost(rateCard, quantity) {
    const freeAllowance = Number(rateCard.freeAllowance || 0);
    const billableQuantity = Math.max(0, quantity - freeAllowance);

    if (billableQuantity === 0) {
      return {
        billableQuantity: 0,
        totalCost: 0,
        tierBreakdown: []
      };
    }

    switch (rateCard.pricingModel) {
      case PRICING_MODELS.GRADUATED:
        return this._calculateGraduatedTiers(rateCard.tiers || [], billableQuantity);

      case PRICING_MODELS.VOLUME:
        return this._calculateVolumeTiers(rateCard.tiers || [], billableQuantity);

      case PRICING_MODELS.PACKAGE:
        return this._calculatePackage(rateCard, billableQuantity);

      case PRICING_MODELS.FLAT_FEE:
      default: {
        const rate = Number(rateCard.unitPrice || 0);
        const cost = billableQuantity * rate;
        return {
          billableQuantity,
          totalCost: Number(cost.toFixed(4)),
          tierBreakdown: [{ tier: 1, range: 'All units', unitsConsumed: billableQuantity, unitPrice: rate, cost: Number(cost.toFixed(4)) }]
        };
      }
    }
  }

  static _calculateGraduatedTiers(tiers, quantity) {
    let remaining = quantity;
    let totalCost = 0;
    const tierBreakdown = [];
    let previousUpTo = 0;

    for (let i = 0; i < tiers.length; i++) {
      const tier = tiers[i];
      const tierCapacity = tier.upTo === null || tier.upTo === undefined ? Infinity : (tier.upTo - previousUpTo);
      const unitsInThisTier = Math.min(remaining, tierCapacity);

      if (unitsInThisTier > 0) {
        const cost = unitsInThisTier * tier.unitPrice;
        totalCost += cost;
        tierBreakdown.push({
          tier: i + 1,
          range: `${previousUpTo.toLocaleString()} – ${tier.upTo ? tier.upTo.toLocaleString() : '∞'}`,
          unitsConsumed: unitsInThisTier,
          unitPrice: tier.unitPrice,
          cost: Number(cost.toFixed(4))
        });
        remaining -= unitsInThisTier;
      }

      if (tier.upTo !== null && tier.upTo !== undefined) {
        previousUpTo = tier.upTo;
      }

      if (remaining <= 0) break;
    }

    return {
      billableQuantity: quantity,
      totalCost: Number(totalCost.toFixed(4)),
      tierBreakdown
    };
  }

  static _calculateVolumeTiers(tiers, quantity) {
    let matchedTier = tiers[0];
    for (const tier of tiers) {
      if (tier.upTo === null || tier.upTo === undefined || quantity <= tier.upTo) {
        matchedTier = tier;
        break;
      }
    }

    const unitPrice = matchedTier ? matchedTier.unitPrice : 0;
    const totalCost = quantity * unitPrice;

    return {
      billableQuantity: quantity,
      totalCost: Number(totalCost.toFixed(4)),
      tierBreakdown: [{
        tier: 1,
        range: matchedTier?.upTo ? `Up to ${matchedTier.upTo.toLocaleString()}` : 'Unlimited',
        unitsConsumed: quantity,
        unitPrice,
        cost: Number(totalCost.toFixed(4))
      }]
    };
  }

  static _calculatePackage(rateCard, quantity) {
    const packageSize = Number(rateCard.packageSize || 1000);
    const packagePrice = Number(rateCard.packagePrice || 10);
    const packagesCount = Math.ceil(quantity / packageSize);
    const totalCost = packagesCount * packagePrice;

    return {
      billableQuantity: quantity,
      totalCost: Number(totalCost.toFixed(4)),
      tierBreakdown: [{
        tier: 1,
        range: `${packagesCount} blocks of ${packageSize.toLocaleString()}`,
        unitsConsumed: quantity,
        unitPrice: packagePrice,
        cost: totalCost
      }]
    };
  }
}

export default PricingEngine;
