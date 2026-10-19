import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, default: 'password123' },
  role: { 
    type: String, 
    enum: ['platform_super_admin', 'organization_owner', 'organization_admin', 'developer', 'viewer'], 
    default: 'developer' 
  },
  roleLabel: { type: String, default: 'Developer' },
  organizationId: { type: String, default: 'org_abc_tech' },
  teamId: { type: String, default: 'team_dev' },
  teamName: { type: String, default: 'Development Team' },
  avatarUrl: { type: String },
  apiKey: { type: String },
  apiKeyId: { type: String },
  monthlyLimitInr: { type: Number, default: 10000 },
  monthlyCostInr: { type: Number, default: 0 },
  monthlyRequests: { type: Number, default: 0 },
  allowedProviders: [{ type: String }],
  status: { type: String, enum: ['active', 'inactive', 'pending'], default: 'active' }
}, {
  timestamps: true,
  toJSON: { virtuals: true }
});

export const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;
