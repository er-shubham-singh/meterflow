import mongoose from 'mongoose';
import { AGGREGATION_TYPES } from '../config/constants.js';

/**
 * ==============================================================================
 * ⏱️ METER (CONSUMPTION RULE) MONGOOSE SCHEMA & MODEL
 * ==============================================================================
 * Defines how incoming raw API events translate into billable units
 * using sliding window aggregations (SUM, MAX, COUNT, UNIQUE_COUNT, etc.).
 * Maps to the "meters" collection in MongoDB NoSQL database.
 * ==============================================================================
 */
const meterSchema = new mongoose.Schema(
  {
    // Unique ID
    id: {
      type: String,
      unique: true,
      required: true,
      index: true
    },
    // Unique programmatic code slug (e.g. "llm_tokens_total", "api_requests_total")
    code: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      index: true
    },
    // Human-readable display title
    name: {
      type: String,
      required: true,
      trim: true
    },
    // Explanation of what this consumption meter measures
    description: {
      type: String,
      default: ''
    },
    // Event type ingested from API (e.g. "ai.completion", "api.request")
    eventType: {
      type: String,
      required: true,
      index: true
    },
    // Mathematical aggregation rule
    aggregationType: {
      type: String,
      required: true,
      enum: Object.values(AGGREGATION_TYPES),
      default: AGGREGATION_TYPES.SUM
    },
    // The event property to extract and aggregate (e.g. "tokens", "vCpuHours", "storageGb")
    valueProperty: {
      type: String,
      required: true,
      default: 'value'
    },
    // Optional filter criteria property (e.g. "model" or "region")
    filterField: {
      type: String,
      default: null
    },
    // Value required to match filter (e.g. "claude-3-5-sonnet")
    filterValue: {
      type: String,
      default: null
    },
    // Label for presentation (e.g. "tokens", "requests", "vCPU-hrs", "users")
    unit: {
      type: String,
      default: 'units'
    },
    // Is meter currently active in the ingestion pipeline
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

// Export the Meter model (Mongoose Table / Collection) for use in Controllers
export const Meter = mongoose.models.Meter || mongoose.model('Meter', meterSchema);
export default Meter;
