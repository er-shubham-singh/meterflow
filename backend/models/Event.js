import mongoose from 'mongoose';

/**
 * ==============================================================================
 * 📡 EVENT (USAGE RECORD) MONGOOSE SCHEMA & MODEL
 * ==============================================================================
 * Stores raw, high-throughput billable API events ingested through edge gateways.
 * Maps to the "events" collection in MongoDB NoSQL database.
 * Indexed by customerId, eventType, timestamp, and idempotencyKey.
 * ==============================================================================
 */
const eventSchema = new mongoose.Schema(
  {
    // Unique public event ID (e.g., "evt_8f192b49c0182...")
    id: {
      type: String,
      unique: true,
      required: true,
      index: true
    },
    // The billable customer/tenant ID (e.g. "cust_anthropic_res")
    customerId: {
      type: String,
      required: true,
      index: true
    },
    // Event category matching a Meter (e.g. "ai.completion", "api.request")
    eventType: {
      type: String,
      required: true,
      index: true
    },
    // Consumption properties (tokens, compute time, endpoint, userId, etc.)
    properties: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    // Event generation timestamp
    timestamp: {
      type: Date,
      default: Date.now,
      index: true
    },
    // Deduplication idempotency key to prevent double billing
    idempotencyKey: {
      type: String,
      unique: true,
      required: true,
      index: true
    },
    // Internal timestamp when ingested by listener
    processedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

// Compound indexes for rapid high-throughput customer queries
eventSchema.index({ customerId: 1, eventType: 1, timestamp: -1 });

// Export the Event model (Mongoose Table / Collection) for use in Controllers
export const Event = mongoose.models.Event || mongoose.model('Event', eventSchema);
export default Event;
