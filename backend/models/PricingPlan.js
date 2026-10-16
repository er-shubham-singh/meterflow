import mongoose from 'mongoose';
import { PRICING_MODELS } from '../config/constants.js';

/**
 * Tier step sub-schema for graduated & volume pricing
 */
const tierStepSchema = new mongoose.Schema(
  {
    upTo: {
      type: Number,
      default: null // null means infinity / unbounded final tier
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0
    }
  },
  { _id: false }
);

/**
 * Rate card sub-schema mapping a Meter to its pricing structure
 */
const rateCardSchema = new mongoose.Schema(
  {
    meterCode: {
      type: String,
      required: true
    },
    meterId: {
      type: String
    },
    pricingModel: {
      type: String,
      required: true,
      enum: Object.values(PRICING_MODELS),
      default: PRICING_MODELS.GRADUATED
    },
    // Units included for free before billing kicks in
    freeAllowance: {
      type: Number,
      default: 0
    },
    // For package pricing (e.g. 10,000 units per package)
    packageSize: {
      type: Number,
      default: 1000
    },
    packagePrice: {
      type: Number,
      default: 0
    },
    // Flat unit price if not tiered
    unitPrice: {
      type: Number,
      default: 0
    },
    // Tiers for GRADUATED or VOLUME models
    tiers: [tierStepSchema]
  },
  { _id: false }
);

/**
 * ==============================================================================
 * 💳 PRICING PLAN MONGOOSE SCHEMA & MODEL
 * ==============================================================================
 * Defines subscription base fees, multi-meter rate cards, and tiered pricing.
 * Maps to the "pricingplans" collection in MongoDB NoSQL database.
 * ==============================================================================
 */
const pricingPlanSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      unique: true,
      required: true,
      index: true
    },
    // Plan title (e.g. "Enterprise AI & Scale")
    name: {
      type: String,
      required: true,
      trim: true
    },
    // Unique slug (e.g. "enterprise-ai-scale")
    code: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      index: true
    },
    description: {
      type: String,
      default: ''
    },
    // Recurring subscription base price
    baseFee: {
      type: Number,
      required: true,
      default: 0,
      min: 0
    },
    currency: {
      type: String,
      default: 'USD',
      uppercase: true
    },
    // Array of rate cards for each meter
    rateCards: [rateCardSchema],
    active: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

// Export the PricingPlan model (Mongoose Table / Collection) for use in Controllers
export const PricingPlan = mongoose.models.PricingPlan || mongoose.model('PricingPlan', pricingPlanSchema);
export default PricingPlan;
