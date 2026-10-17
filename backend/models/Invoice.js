import mongoose from 'mongoose';
import { INVOICE_STATUS } from '../config/constants.js';

/**
 * ==============================================================================
 * 🧾 INVOICE (BILLING RECORD) MONGOOSE SCHEMA & MODEL
 * ==============================================================================
 * Represents a formalized billing invoice generated from consumption aggregations.
 * Maps to the "invoices" collection in MongoDB NoSQL database.
 * ==============================================================================
 */
const invoiceSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      unique: true,
      required: true,
      index: true
    },
    invoiceNumber: {
      type: String,
      unique: true,
      required: true,
      index: true
    },
    customerId: {
      type: String,
      required: true,
      index: true
    },
    customerName: {
      type: String,
      required: true
    },
    planId: {
      type: String
    },
    planName: {
      type: String
    },
    periodStart: {
      type: Date,
      required: true
    },
    periodEnd: {
      type: Date,
      default: Date.now
    },
    // Detailed itemized consumption line items with tier steps
    lineItems: {
      type: [mongoose.Schema.Types.Mixed],
      default: []
    },
    subtotal: {
      type: Number,
      required: true,
      default: 0
    },
    tax: {
      type: Number,
      default: 0
    },
    total: {
      type: Number,
      required: true,
      default: 0
    },
    currency: {
      type: String,
      default: 'INR'
    },
    status: {
      type: String,
      enum: Object.values(INVOICE_STATUS),
      default: INVOICE_STATUS.FINALIZED
    },
    // Details of direct webhook sync into external billing systems
    billingSystemSync: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

// Export the Invoice model (Mongoose Table / Collection) for use in Controllers
export const Invoice = mongoose.models.Invoice || mongoose.model('Invoice', invoiceSchema);
export default Invoice;
