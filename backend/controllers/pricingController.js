import mongoose from 'mongoose';
import { PricingPlan } from '../models/PricingPlan.js';
import { PricingEngine } from '../services/pricingEngine.js';
import { memoryStore } from '../data/seed.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * ==============================================================================
 * 💳 PRICING CONTROLLER (MVC)
 * ==============================================================================
 * Manages rate cards, tiered plans, and mathematical cost simulations
 * using the Mongoose PricingPlan model.
 * ==============================================================================
 */
export class PricingController {
  /**
   * GET /api/v1/pricing-plans
   * Retrieves all pricing plans from MongoDB
   */
  static async getAll(req, res, next) {
    try {
      let plans = [];
      if (mongoose.connection.readyState === 1) {
        plans = await PricingPlan.find().lean();
      }
      if (!plans || plans.length === 0) {
        const seen = new Set();
        plans = [];
        for (const p of memoryStore.pricingPlans.values()) {
          if (!seen.has(p.code)) {
            seen.add(p.code);
            plans.push(p);
          }
        }
      }

      return res.status(200).json({ status: 'success', count: plans.length, data: plans });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/pricing-plans/:id
   * Retrieves single pricing plan
   */
  static async getById(req, res, next) {
    try {
      let plan = null;
      if (mongoose.connection.readyState === 1) {
        plan = await PricingPlan.findOne({
          $or: [{ id: req.params.id }, { code: req.params.id }]
        }).lean();
      }

      if (!plan) {
        plan = memoryStore.pricingPlans.get(req.params.id) || null;
      }

      if (!plan) {
        return res.status(404).json({ status: 'error', message: 'Pricing plan not found' });
      }

      return res.status(200).json({ status: 'success', data: plan });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/v1/pricing-plans
   * Creates a new pricing plan with multi-meter rate cards
   */
  static async create(req, res, next) {
    try {
      const { name, code, description, baseFee, currency, rateCards } = req.body;
      if (!name || !code) {
        return res.status(400).json({ status: 'error', message: 'name and code are required fields' });
      }

      const planData = {
        id: `plan_${uuidv4().slice(0, 8)}`,
        name,
        code,
        description: description || '',
        baseFee: baseFee ? Number(baseFee) : 0,
        currency: currency || 'USD',
        rateCards: rateCards || []
      };

      if (mongoose.connection.readyState === 1) {
        const newPlan = new PricingPlan(planData);
        await newPlan.save();
      }

      memoryStore.pricingPlans.set(planData.id, planData);
      memoryStore.pricingPlans.set(planData.code, planData);

      return res.status(201).json({ status: 'success', data: planData });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/v1/pricing-plans/simulate
   * Simulates graduated, volume, or package tier calculation for any arbitrary usage
   */
  static simulateRateCard(req, res, next) {
    try {
      const { rateCard, quantity } = req.body;
      if (!rateCard || quantity === undefined) {
        return res.status(400).json({ status: 'error', message: 'rateCard and quantity are required' });
      }

      const calculation = PricingEngine.calculateRateCardCost(rateCard, Number(quantity));
      return res.status(200).json({ status: 'success', data: calculation });
    } catch (err) {
      next(err);
    }
  }
}

export default PricingController;
