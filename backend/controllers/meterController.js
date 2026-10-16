import mongoose from 'mongoose';
import { Meter } from '../models/Meter.js';
import { Customer } from '../models/Customer.js';
import { MeterView } from '../views/meterView.js';
import { meteringEngine } from '../services/meteringEngine.js';
import { memoryStore } from '../data/seed.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * ==============================================================================
 * ⏱️ METER CONTROLLER (MVC)
 * ==============================================================================
 * Manages consumption meter rules, formula definitions, and aggregation metrics
 * using the Mongoose Meter model.
 * ==============================================================================
 */
export class MeterController {
  /**
   * GET /api/v1/meters
   * Retrieves all consumption meters with their active aggregated totals
   */
  static async getAll(req, res, next) {
    try {
      let meters = [];
      if (mongoose.connection.readyState === 1) {
        meters = await Meter.find().lean();
      }
      if (!meters || meters.length === 0) {
        // Deduplicate code slugs
        const seen = new Set();
        meters = [];
        for (const m of memoryStore.meters.values()) {
          if (!seen.has(m.code)) {
            seen.add(m.code);
            meters.push(m);
          }
        }
      }

      let customers = [];
      if (mongoose.connection.readyState === 1) {
        customers = await Customer.find().lean();
      }
      if (!customers || customers.length === 0) {
        customers = Array.from(memoryStore.customers.values());
      }

      // Gather current real-time aggregated total across all customers
      const aggregatesMap = {};
      for (const m of meters) {
        let totalVal = 0;
        let eventCount = 0;
        for (const c of customers) {
          const agg = meteringEngine.getAggregationForCustomer(c.id, m.code);
          totalVal += agg.value;
          eventCount += agg.eventCount;
        }
        aggregatesMap[m.code] = { value: totalVal, eventCount };
      }

      return res.status(200).json(MeterView.formatList(meters, aggregatesMap));
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/meters/:id
   * Retrieves single meter by ID or unique code slug
   */
  static async getById(req, res, next) {
    try {
      let meter = null;
      if (mongoose.connection.readyState === 1) {
        meter = await Meter.findOne({
          $or: [{ id: req.params.id }, { code: req.params.id }]
        }).lean();
      }

      if (!meter) {
        meter = memoryStore.meters.get(req.params.id) || null;
      }

      if (!meter) {
        return res.status(404).json({ status: 'error', message: `Meter "${req.params.id}" not found` });
      }

      return res.status(200).json(MeterView.formatSingle(meter));
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/v1/meters
   * Creates a new consumption meter in MongoDB
   */
  static async create(req, res, next) {
    try {
      const { code, name, description, eventType, aggregationType, valueProperty, filterField, filterValue, unit } = req.body;

      if (!code || !name || !eventType) {
        return res.status(400).json({ status: 'error', message: 'code, name, and eventType are required' });
      }

      if (memoryStore.meters.has(code)) {
        return res.status(409).json({ status: 'error', message: `Meter with code "${code}" already exists` });
      }

      const meterData = {
        id: `mtr_${uuidv4().slice(0, 8)}`,
        code,
        name,
        description: description || '',
        eventType,
        aggregationType: aggregationType || 'SUM',
        valueProperty: valueProperty || 'value',
        filterField: filterField || null,
        filterValue: filterValue || null,
        unit: unit || 'units',
        active: true
      };

      if (mongoose.connection.readyState === 1) {
        const newMeter = new Meter(meterData);
        await newMeter.save();
      }

      memoryStore.meters.set(meterData.id, meterData);
      memoryStore.meters.set(meterData.code, meterData);
      meteringEngine.registerMeterDefinition(meterData);

      return res.status(201).json(MeterView.formatSingle(meterData));
    } catch (err) {
      next(err);
    }
  }

  /**
   * PUT /api/v1/meters/:id
   * Updates an existing meter configuration
   */
  static async update(req, res, next) {
    try {
      let updated = null;
      if (mongoose.connection.readyState === 1) {
        updated = await Meter.findOneAndUpdate(
          { $or: [{ id: req.params.id }, { code: req.params.id }] },
          { $set: req.body },
          { new: true }
        ).lean();
      }

      const existing = memoryStore.meters.get(req.params.id);
      if (existing) {
        Object.assign(existing, req.body);
        updated = existing;
      }

      if (!updated) {
        return res.status(404).json({ status: 'error', message: 'Meter not found' });
      }

      meteringEngine.registerMeterDefinition(updated);
      return res.status(200).json(MeterView.formatSingle(updated));
    } catch (err) {
      next(err);
    }
  }

  /**
   * DELETE /api/v1/meters/:id
   * Removes a meter definition
   */
  static async delete(req, res, next) {
    try {
      if (mongoose.connection.readyState === 1) {
        await Meter.findOneAndDelete({
          $or: [{ id: req.params.id }, { code: req.params.id }]
        });
      }

      const exists = memoryStore.meters.delete(req.params.id);
      if (!exists) {
        return res.status(404).json({ status: 'error', message: 'Meter not found' });
      }

      return res.status(200).json({ status: 'success', message: 'Meter deleted' });
    } catch (err) {
      next(err);
    }
  }
}

export default MeterController;
