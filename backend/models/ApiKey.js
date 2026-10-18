import mongoose from 'mongoose';

const apiKeySchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  prefix: { type: String, required: true, default: 'sk_mf_' },
  hashedKey: { type: String, required: true },
  maskedKey: { type: String, required: true },
  environment: { type: String, enum: ['production', 'development', 'staging'], default: 'production' },
  organizationId: { type: String, required: true, default: 'org_abc_tech' },
  userId: { type: String, required: true, default: 'usr_amit_kumar' },
  userEmail: { type: String, default: 'amit.kumar@abctech.com' },
  userName: { type: String, default: 'Amit Kumar' },
  teamId: { type: String, default: 'team_dev' },
  teamName: { type: String, default: 'Development Team' },
  allowedProviders: [{ type: String }],
  monthlyLimit: { type: Number, default: 20000 },
  currentUsage: { type: Number, default: 12450 },
  status: { type: String, enum: ['active', 'revoked', 'expired'], default: 'active' },
  lastUsedAt: { type: Date, default: Date.now },
  expiresAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
}, {
  timestamps: true,
  toJSON: { virtuals: true }
});

apiKeySchema.index({ organizationId: 1, status: 1 });
apiKeySchema.index({ hashedKey: 1 });

export const ApiKey = mongoose.models.ApiKey || mongoose.model('ApiKey', apiKeySchema);
export default ApiKey;
