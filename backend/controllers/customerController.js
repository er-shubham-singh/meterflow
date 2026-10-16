import mongoose from 'mongoose';
import { Customer } from '../models/Customer.js';
import { PricingPlan } from '../models/PricingPlan.js';
import { PricingEngine } from '../services/pricingEngine.js';
import { BillingView } from '../views/billingView.js';
import { memoryStore } from '../data/seed.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * ==============================================================================
 * 👤 CUSTOMER CONTROLLER (MVC)
 * ==============================================================================
 * Orchestrates multi-tenant customer management using Mongoose Customer model
 * with automatic fallback when database is connecting or offline.
 * ==============================================================================
 */
export class CustomerController {
  /**
   * GET /api/v1/customers
   * Retrieves all customers with their real-time accrued usage total
   */
  static async getAll(req, res, next) {
    try {
      let customers = [];
      if (mongoose.connection.readyState === 1) {
        customers = await Customer.find().lean();
      }
      if (!customers || customers.length === 0) {
        customers = Array.from(memoryStore.customers.values());
      }

      // Attach real-time accrued total calculated by PricingEngine
      const data = await Promise.all(
        customers.map(async (c) => {
          try {
            const calc = await PricingEngine.calculateCustomerUsage(c.id);
            return {
              ...c,
              currentTotalAccrued: calc.total,
              currency: calc.currency,
              planName: calc.plan?.name || 'Enterprise'
            };
          } catch {
            return {
              ...c,
              currentTotalAccrued: 0,
              currency: 'USD',
              planName: 'Enterprise'
            };
          }
        })
      );

      return res.status(200).json({ status: 'success', count: data.length, data });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/customers/:id
   * Retrieves single customer by ID
   */
  static async getById(req, res, next) {
    try {
      let customer = null;
      if (mongoose.connection.readyState === 1) {
        customer = await Customer.findOne({
          $or: [{ id: req.params.id }, { _id: req.params.id.match(/^[0-9a-fA-F]{24}$/) ? req.params.id : null }]
        }).lean();
      }

      if (!customer) {
        customer = memoryStore.customers.get(req.params.id) || null;
      }

      if (!customer) {
        return res.status(404).json({ status: 'error', message: `Customer ${req.params.id} not found` });
      }

      return res.status(200).json({ status: 'success', data: customer });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/customers/:id/usage
   * Calculates live consumption and financial summary for the billing period
   */
  static async getUsageSummary(req, res, next) {
    try {
      let customer = null;
      if (mongoose.connection.readyState === 1) {
        customer = await Customer.findOne({
          $or: [{ id: req.params.id }, { _id: req.params.id.match(/^[0-9a-fA-F]{24}$/) ? req.params.id : null }]
        }).lean();
      }

      if (!customer) {
        customer = memoryStore.customers.get(req.params.id) || null;
      }

      if (!customer) {
        return res.status(404).json({ status: 'error', message: `Customer ${req.params.id} not found` });
      }

      const calculation = await PricingEngine.calculateCustomerUsage(customer.id);

      return res.status(200).json(
        BillingView.formatCustomerUsage(
          customer,
          calculation.plan,
          calculation.lineItems,
          calculation.total
        )
      );
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/v1/customers
   * Creates a new billable tenant account in MongoDB
   */
  static async create(req, res, next) {
    try {
      const { name, email, company, planId, budgetLimit, billingEmail } = req.body;
      if (!name || !email) {
        return res.status(400).json({ status: 'error', message: 'name and email are required fields' });
      }

      const defaultPlan = memoryStore.pricingPlans.get('plan_enterprise_ai');

      const customerData = {
        id: `cust_${uuidv4().slice(0, 8)}`,
        name,
        email,
        company: company || name,
        billingEmail: billingEmail || email,
        planId: planId || (defaultPlan ? defaultPlan.id : 'plan_enterprise_ai'),
        budgetLimit: budgetLimit ? Number(budgetLimit) : 5000,
        currentPeriodStart: new Date()
      };

      if (mongoose.connection.readyState === 1) {
        const newCustomer = new Customer(customerData);
        await newCustomer.save();
      }

      memoryStore.customers.set(customerData.id, customerData);
      return res.status(201).json({ status: 'success', data: customerData });
    } catch (err) {
      next(err);
    }
  }

  /**
   * PUT /api/v1/customers/:id
   * Updates an existing customer profile
   */
  static async update(req, res, next) {
    try {
      let updated = null;
      if (mongoose.connection.readyState === 1) {
        updated = await Customer.findOneAndUpdate(
          { $or: [{ id: req.params.id }, { _id: req.params.id.match(/^[0-9a-fA-F]{24}$/) ? req.params.id : null }] },
          { $set: req.body },
          { new: true }
        ).lean();
      }

      const existing = memoryStore.customers.get(req.params.id);
      if (existing) {
        Object.assign(existing, req.body);
        updated = existing;
      }

      if (!updated) {
        return res.status(404).json({ status: 'error', message: `Customer ${req.params.id} not found` });
      }

      return res.status(200).json({ status: 'success', data: updated });
    } catch (err) {
      next(err);
    }
  }
}

export default CustomerController;
