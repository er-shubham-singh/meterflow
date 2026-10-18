import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { type: String, enum: ['platform_super_admin', 'organization_owner', 'organization_admin', 'developer', 'viewer'], default: 'developer' },
  organizationId: { type: String, default: 'org_abc_tech' },
  teamId: { type: String, default: 'team_dev' },
  teamName: { type: String, default: 'Development Team' },
  avatarUrl: { type: String },
  monthlyRequests: { type: Number, default: 0 },
  monthlyCostInr: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'inactive', 'pending'], default: 'active' }
}, {
  timestamps: true
});

export const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;
