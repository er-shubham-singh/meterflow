'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import { api } from '@/services/api';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/context/AuthContext';
import { useCurrency } from '@/context/CurrencyContext';
import { 
  Users, 
  Search, 
  Plus, 
  KeyRound, 
  Copy, 
  Check, 
  Trash2, 
  X, 
  ShieldCheck, 
  CheckCircle2, 
  Sparkles,
  UserPlus,
  ArrowUpRight,
  ExternalLink,
  Wallet,
  Activity,
  Zap,
  TrendingDown
} from 'lucide-react';

const INITIAL_EMPLOYEES = [
  { id: 'usr_rahul_ml', name: 'Rahul Verma', email: 'rahul.v@abctech.com', teamName: 'AI Team', roleLabel: 'Lead ML Engineer', monthlyRequests: 48230, monthlyCostInr: 3450, monthlyLimitInr: 25000, apiKey: 'sk_mf_live_rahulv_7741bcde1234', status: 'active' },
  { id: 'usr_priya_arch', name: 'Priya Singh', email: 'priya.s@abctech.com', teamName: 'Development Team', roleLabel: 'Backend Architect', monthlyRequests: 32450, monthlyCostInr: 2120, monthlyLimitInr: 20000, apiKey: 'sk_mf_live_priya_8832abcd9120', status: 'active' },
  { id: 'usr_amit_dev', name: 'Amit Kumar', email: 'amit.kumar@abctech.com', teamName: 'Development Team', roleLabel: 'Fullstack Developer', monthlyRequests: 28120, monthlyCostInr: 1890, monthlyLimitInr: 20000, apiKey: 'sk_mf_dev_6678efgh1122ijkl3344mnop', status: 'active' },
  { id: 'usr_neha_int', name: 'Neha Sharma', email: 'neha.s@abctech.com', teamName: 'Development Team', roleLabel: 'Integration Specialist', monthlyRequests: 21340, monthlyCostInr: 1250, monthlyLimitInr: 15000, apiKey: 'sk_mf_live_nehas_5521cdef4321', status: 'active' },
  { id: 'usr_vikash_mkt', name: 'Vikash Yadav', email: 'vikash.y@abctech.com', teamName: 'Marketing Team', roleLabel: 'Growth Engineer', monthlyRequests: 18220, monthlyCostInr: 980, monthlyLimitInr: 10000, apiKey: 'sk_mf_live_vikash_3311defa7890', status: 'active' }
];

export default function EmployeesPage() {
  const { addToast } = useToast();
  const { formatCurrency } = useCurrency();
  const { quickLogin } = useAuth();

  const [employees, setEmployees] = useState(INITIAL_EMPLOYEES);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  // Add Employee Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: 'password123',
    teamName: 'Development Team',
    roleLabel: 'Fullstack Developer',
    monthlyLimitInr: 15000,
    allowedProviders: ['OpenAI', 'Google Gemini', 'Internal APIs']
  });

  // Success Credential Dialog
  const [createdData, setCreatedData] = useState(null);
  const [copiedKeyId, setCopiedKeyId] = useState(null);

  const fetchEmployees = async () => {
    try {
      const res = await api.getEmployees();
      if (res && res.data && res.data.length > 0) {
        setEmployees(res.data);
      }
    } catch {
      // fallback to initial
    }
  };

  useEffect(() => {
    fetchEmployees();
    const interval = setInterval(fetchEmployees, 2500);
    return () => clearInterval(interval);
  }, []);

  const handleCreateEmployee = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      addToast('Please enter employee name and email', 'warning');
      return;
    }

    setLoading(true);
    try {
      const res = await api.createEmployee(formData);
      setLoading(false);

      if (res.success && res.data) {
        addToast(`Employee ${formData.name} added and API token generated!`, 'success');
        setIsAddModalOpen(false);
        setCreatedData({
          ...res.data,
          password: formData.password || 'password123'
        });
        fetchEmployees();
        // Reset form
        setFormData({
          name: '',
          email: '',
          password: 'password123',
          teamName: 'Development Team',
          roleLabel: 'Fullstack Developer',
          monthlyLimitInr: 15000,
          allowedProviders: ['OpenAI', 'Google Gemini', 'Internal APIs']
        });
      } else {
        addToast(res.message || 'Failed to create employee', 'error');
      }
    } catch (err) {
      setLoading(false);
      addToast(err.message || 'Error creating employee', 'error');
    }
  };

  const handleDeleteEmployee = async (id, name) => {
    if (!confirm(`Are you sure you want to remove employee ${name} and revoke their API token?`)) return;

    try {
      await api.deleteEmployee(id);
      addToast(`Employee ${name} removed.`, 'info');
      setEmployees(prev => prev.filter(e => e.id !== id));
    } catch (err) {
      addToast('Error removing employee', 'error');
    }
  };

  const handleCopyKey = (key, id) => {
    navigator.clipboard.writeText(key);
    setCopiedKeyId(id);
    addToast('API Key copied to clipboard!', 'success');
    setTimeout(() => setCopiedKeyId(null), 2000);
  };

  const handleCopyAllCredentials = () => {
    if (!createdData) return;
    const text = `MeterFlow Employee Access:\nName: ${createdData.name}\nEmail: ${createdData.email}\nPassword: ${createdData.password}\nAPI Token: ${createdData.apiKey}\nPortal: http://localhost:3000/login`;
    navigator.clipboard.writeText(text);
    addToast('All login credentials & API key copied!', 'success');
  };

  const filtered = employees.filter(e => 
    e.name?.toLowerCase().includes(search.toLowerCase()) || 
    e.email?.toLowerCase().includes(search.toLowerCase()) ||
    e.teamName?.toLowerCase().includes(search.toLowerCase())
  );

  const totalLimit = employees.reduce((sum, e) => sum + (Number(e.monthlyLimitInr) || 0), 0);
  const totalSpent = employees.reduce((sum, e) => sum + (Number(e.monthlyCostInr) || 0), 0);
  const totalRemaining = Math.max(0, totalLimit - totalSpent);
  const totalRequests = employees.reduce((sum, e) => sum + (Number(e.monthlyRequests) || 0), 0);
  const overallRemainingPercent = totalLimit > 0 ? Math.round((totalRemaining / totalLimit) * 100) : 100;

  return (
    <div className="w-full min-h-screen bg-[#F4F6F9] text-slate-800">
      <Header
        title="Employees & Internal API Access"
        subtitle="Manage developer access, provision scoped API tokens, and monitor real-time remaining quota"
        onRefresh={fetchEmployees}
      />

      <main className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto flex flex-col gap-6">
        {/* Top 4 Summary Metrics Cards with Live Remaining Pool */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Total Allocated Budget</span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Wallet size={16} />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 mt-2 font-mono">
              {formatCurrency(totalLimit)}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Across {employees.length} provisioned members
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Total Cost Spent</span>
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <ArrowUpRight size={16} />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 mt-2 font-mono">
              {formatCurrency(totalSpent)}
            </div>
            <div className="text-[11px] text-indigo-600 font-semibold mt-1">
              {totalLimit > 0 ? ((totalSpent / totalLimit) * 100).toFixed(1) : 0}% of budget utilized
            </div>
          </div>

          {/* Card 3: REMAINING QUOTA POOL */}
          <div className="bg-white p-5 rounded-2xl border border-emerald-200 shadow-sm flex flex-col justify-between bg-gradient-to-br from-white to-emerald-50/40">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-emerald-800">Remaining Quota Balance</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                Live Pool
              </span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-emerald-600 mt-2 font-mono">
              {formatCurrency(totalRemaining)}
            </div>
            <div className="text-[11px] text-emerald-700 font-semibold mt-1">
              {overallRemainingPercent}% quota remaining available
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Total Gateway Invocations</span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <Activity size={16} />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 mt-2 font-mono">
              {totalRequests.toLocaleString()}
            </div>
            <div className="text-[11px] text-amber-600 font-semibold mt-1 flex items-center gap-1">
              <Zap size={12} />
              <span>Real-time showback telemetry</span>
            </div>
          </div>
        </div>

        {/* Top Control Bar */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="relative w-72">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, email, or team..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 outline-none focus:border-blue-500 shadow-sm"
              />
            </div>
            <div className="text-xs text-slate-500 font-semibold hidden sm:block">
              Total: {employees.length} Members
            </div>
          </div>

          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-md shadow-blue-600/20 cursor-pointer transition-all active:scale-95"
          >
            <UserPlus size={15} />
            <span>Add Employee & Provision Token</span>
          </button>
        </div>

        {/* Employees Table with Prominent Remaining Quota */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold text-slate-400 uppercase">
                  <th className="py-3.5 px-4">Employee</th>
                  <th className="py-3.5 px-4">Personal API Key / Token</th>
                  <th className="py-3.5 px-4">Team & Department</th>
                  <th className="py-3.5 px-4">Role Title</th>
                  <th className="py-3.5 px-4 text-right">Monthly Limit</th>
                  <th className="py-3.5 px-4 text-right">Cost Spent</th>
                  <th className="py-3.5 px-4 text-right bg-emerald-50/70 text-emerald-900 font-bold border-x border-emerald-200/60">
                    Remaining Quota
                  </th>
                  <th className="py-3.5 px-4 text-right">Invocations</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium">
                {filtered.map((emp) => {
                  const keyString = emp.rawApiKey || emp.apiKey || 'sk_mf_live_...';
                  const isCopied = copiedKeyId === emp.id;

                  const limit = Number(emp.monthlyLimitInr) || 15000;
                  const spent = Number(emp.monthlyCostInr) || 0;
                  const remaining = Math.max(0, limit - spent);
                  const percentRemaining = Math.max(0, Math.min(100, Math.round((remaining / limit) * 100)));
                  const requests = Number(emp.monthlyRequests) || 0;

                  return (
                    <tr key={emp.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{emp.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{emp.email}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="inline-flex items-center gap-1.5 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg font-mono text-[11px] text-slate-700">
                          <KeyRound size={12} className="text-blue-500 shrink-0" />
                          <span className="truncate max-w-[140px]">{keyString}</span>
                          <button
                            onClick={() => handleCopyKey(keyString, emp.id)}
                            className="text-slate-400 hover:text-slate-800 cursor-pointer ml-1"
                            title="Copy API Key"
                          >
                            {isCopied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                          </button>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 font-semibold">{emp.teamName || 'Development Team'}</td>
                      <td className="py-3.5 px-4 text-slate-500">{emp.roleLabel || 'Developer'}</td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-700">
                        {formatCurrency(limit)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-slate-700 font-mono">
                        {formatCurrency(spent)}
                      </td>
                      {/* Highlighted Remaining Quota Cell */}
                      <td className="py-3.5 px-4 text-right font-mono bg-emerald-50/40 border-x border-emerald-200/60">
                        <div className="font-black text-xs sm:text-sm text-emerald-700">
                          {formatCurrency(remaining)}
                        </div>
                        <div className="flex items-center justify-end gap-1.5 mt-1">
                          <div className="w-16 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-300 ${
                                percentRemaining < 20 ? 'bg-rose-500' : percentRemaining < 50 ? 'bg-amber-500' : 'bg-emerald-500'
                              }`}
                              style={{ width: `${percentRemaining}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-bold text-slate-500">{percentRemaining}% left</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-700">
                        {requests.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
                          {emp.status || 'Active'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleDeleteEmployee(emp.id, emp.name)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer transition-colors"
                            title="Revoke and delete employee"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Modal 1: Add Employee Form */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 flex flex-col gap-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <UserPlus size={16} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 leading-tight">Add New Employee</h3>
                  <p className="text-xs text-slate-500">Will automatically provision login credentials & API key</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateEmployee} className="flex flex-col gap-4">
              {/* Name */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-700">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vikram Batra"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-700">Corporate Email *</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. vikram.b@abctech.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>

              {/* Temporary Password */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-700 flex justify-between">
                  <span>Initial Password</span>
                  <span className="text-[10px] text-slate-400">Employee can change after login</span>
                </label>
                <input
                  type="text"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>

              {/* Team and Role in 2 Columns */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-700">Team / Department</label>
                  <select
                    value={formData.teamName}
                    onChange={(e) => setFormData({ ...formData, teamName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none focus:border-blue-500"
                  >
                    <option value="Development Team">Development Team</option>
                    <option value="AI Team">AI Team</option>
                    <option value="Marketing Team">Marketing Team</option>
                    <option value="Infrastructure">DevOps & Cloud</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-700">Role Title</label>
                  <input
                    type="text"
                    value={formData.roleLabel}
                    onChange={(e) => setFormData({ ...formData, roleLabel: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* Monthly API Limit */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-700 flex justify-between">
                  <span>Monthly API Limit (₹ INR)</span>
                  <span className="text-[10px] text-slate-400">Gateway soft-cap showback</span>
                </label>
                <input
                  type="number"
                  value={formData.monthlyLimitInr}
                  onChange={(e) => setFormData({ ...formData, monthlyLimitInr: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>

              <div className="p-3 rounded-xl bg-blue-50 text-blue-900 border border-blue-200 text-xs flex items-center gap-2">
                <Sparkles size={16} className="text-blue-600 shrink-0" />
                <span>Submitting will generate a secure production API key and account credentials immediately.</span>
              </div>

              <div className="flex items-center justify-end gap-3 mt-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-600/20 cursor-pointer transition-all disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create & Issue Key'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Success Credentials & Generated Token Display */}
      {createdData && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg p-6 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 leading-tight">Employee Added Successfully!</h3>
                  <p className="text-xs text-slate-500">Share these credentials with the team member</p>
                </div>
              </div>
              <button
                onClick={() => setCreatedData(null)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="bg-slate-900 text-slate-100 p-4 rounded-xl border border-slate-800 flex flex-col gap-2.5 font-mono text-xs">
              <div className="flex justify-between items-center py-1 border-b border-slate-800">
                <span className="text-slate-400 font-sans">Full Name:</span>
                <span className="font-bold text-white">{createdData.name}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-800">
                <span className="text-slate-400 font-sans">Login Email:</span>
                <span className="text-blue-400 font-bold">{createdData.email}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-800">
                <span className="text-slate-400 font-sans">Initial Password:</span>
                <span className="text-amber-400 font-bold">{createdData.password}</span>
              </div>
              <div className="flex flex-col gap-1 py-1">
                <span className="text-slate-400 font-sans">Personal API Key Token:</span>
                <div className="p-2 bg-slate-950 rounded-lg text-emerald-400 select-all break-all border border-slate-800">
                  {createdData.apiKey}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-1">
              <button
                onClick={handleCopyAllCredentials}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Copy size={14} />
                <span>Copy Credentials & Token</span>
              </button>
              <button
                onClick={() => setCreatedData(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
