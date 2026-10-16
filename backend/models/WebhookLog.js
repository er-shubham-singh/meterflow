import mongoose from 'mongoose';

/**
 * ==============================================================================
 * 📦 WEBHOOK LOG (BILLING FEED AUDIT TRAIL) MONGOOSE SCHEMA & MODEL
 * ==============================================================================
 * Records all outbound webhook dispatches to external billing systems
 * (such as Stripe Billing Usage Record APIs or Oracle NetSuite ERP).
 * Maps to the "webhooklogs" collection in MongoDB NoSQL database.
 * ==============================================================================
 */
const webhookLogSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      unique: true,
      required: true,
      index: true
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true
    },
    invoiceNumber: {
      type: String,
      required: true
    },
    customer: {
      type: String,
      required: true
    },
    totalAmount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'USD'
    },
    provider: {
      type: String,
      required: true
    },
    signature: {
      type: String,
      required: true
    },
    status: {
      type: String,
      default: 'DELIVERED'
    },
    statusCode: {
      type: Number,
      default: 200
    },
    responseTimeMs: {
      type: Number,
      default: 0
    },
    payload: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

// Export the WebhookLog model (Mongoose Table / Collection) for use in Controllers
export const WebhookLog = mongoose.models.WebhookLog || mongoose.model('WebhookLog', webhookLogSchema);
export default WebhookLog;
