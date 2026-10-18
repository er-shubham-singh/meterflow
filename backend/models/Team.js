import mongoose from 'mongoose';

const teamSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  organizationId: { type: String, required: true, default: 'org_abc_tech' },
  leadName: { type: String },
  leadEmail: { type: String },
  membersCount: { type: Number, default: 1 },
  monthlyBudgetInr: { type: Number, required: true, default: 20000 },
  currentSpentInr: { type: Number, default: 0 },
  active: { type: Boolean, default: true }
}, {
  timestamps: true
});

export const Team = mongoose.models.Team || mongoose.model('Team', teamSchema);
export default Team;
