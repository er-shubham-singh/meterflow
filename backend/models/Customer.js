import mongoose from 'mongoose';

/**
 * ==============================================================================
 * 👤 CUSTOMER (TENANT ACCOUNT) MONGOOSE SCHEMA & MODEL
 * ==============================================================================
 * Represents an enterprise billable account tracked by the metering engine.
 * Maps to the "customers" collection in MongoDB NoSQL database.
 * ==============================================================================
 */
const customerSchema = new mongoose.Schema(
  {
    // Unique public account identifier (e.g., "cust_anthropic_res")
    id: {
      type: String,
      unique: true,
      required: true,
      index: true
    },
    // Primary contact or account name
    name: {
      type: String,
      required: true,
      trim: true
    },
    // Legal organization or tenant name
    company: {
      type: String,
      trim: true
    },
    // Primary account email
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    // Email for invoice dispatches
    billingEmail: {
      type: String,
      trim: true,
      lowercase: true
    },
    // Reference ID of assigned PricingPlan
    planId: {
      type: String,
      required: true,
      default: 'plan_enterprise_ai',
      index: true
    },
    // Real-time spending threshold / budget cap in INR
    budgetLimit: {
      type: Number,
      default: 500000,
      min: 0
    },
    // Start of the current billing cycle
    currentPeriodStart: {
      type: Date,
      default: Date.now
    },
    // Flexible tenant metadata
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
    versionKey: false
  }
);

// Export the Customer model (Mongoose Table / Collection) for use in Controllers
export const Customer = mongoose.models.Customer || mongoose.model('Customer', customerSchema);
export default Customer;
