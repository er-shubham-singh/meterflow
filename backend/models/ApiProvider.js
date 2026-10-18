import mongoose from 'mongoose';

const apiProviderSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  category: { type: String, enum: ['ai', 'email', 'sms', 'payments', 'cloud', 'maps', 'internal'], required: true },
  isInternal: { type: Boolean, default: false },
  baseUrl: { type: String, required: true },
  description: { type: String },
  icon: { type: String },
  status: { type: String, enum: ['healthy', 'degraded', 'offline'], default: 'healthy' },
  uptimePercent: { type: Number, default: 99.9 },
  latencyMs: { type: Number, default: 1.8 },
  totalRequestsMonth: { type: Number, default: 0 },
  estimatedCostMonthInr: { type: Number, default: 0 },
  active: { type: Boolean, default: true }
}, {
  timestamps: true
});

export const ApiProvider = mongoose.models.ApiProvider || mongoose.model('ApiProvider', apiProviderSchema);
export default ApiProvider;
