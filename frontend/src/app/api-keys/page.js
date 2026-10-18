'use client';

import { useState, useEffect, useCallback } from 'react';
import Header from '@/components/layout/Header';
import { api } from '@/services/api';
import { 
  KeyRound, 
  Plus, 
  Copy, 
  Check, 
  Trash2, 
  ArrowUpRight, 
  Layers, 
  Activity, 
  Clock, 
  CheckCircle2,
  Lock,
  User,
  ShieldAlert,
  X
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';

export default function ApiKeysPage() {
  const { showToast, showConfirm } = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copiedKeyId, setCopiedKeyId] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyEnv, setNewKeyEnv] = useState('production');
  const [createdRawKey, setCreatedRawKey] = useState(null);

  const loadData = useCallback(async () => {
    try {
      const res = await api.getEmployeeDashboard();
      if (res && res.data) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load employee dashboard:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedKeyId(id);
    setTimeout(() => setCopiedKeyId(null), 2000);
  };

  const handleRevoke = async (id) => {
    const confirmed = await showConfirm({
      title: 'Revoke API Key',
      message: 'Are you sure you want to revoke this API Key? Any application using it will fail immediately.',
      confirmText: 'Revoke Key',
      isDestructive: true
    });
    if (!confirmed) return;
    try {
      await api.revokeApiKey(id);
      showToast('API key revoked successfully', 'success');
      loadData();
    } catch (err) {
      showToast('Error revoking key: ' + err.message, 'error');
    }
  };

  const handleCreateKey = async (e) => {
    e.preventDefault();
    if (!newKeyName.trim()) {
      showToast('Please provide a name for this API key', 'error');
      return;
    }
    try {
      const res = await api.createApiKey({
        name: newKeyName,
        environment: newKeyEnv,
        monthlyLimit: newKeyEnv === 'production' ? 20000 : 5000
      });
      if (res.data && res.data.rawKey) {
        setCreatedRawKey(res.data.rawKey);
        showToast('API key generated successfully!', 'success');
      }
      loadData();
    } catch (err) {
      showToast('Error creating API key: ' + err.message, 'error');
    }
  };

  const employeeName = data?.employeeName || 'Amit Kumar';
  const role = data?.role || 'Developer';
  const myUsage = data?.myUsageThisMonth || 12450;
  const myCost = data?.estimatedCostInr || 850;
  const monthlyLimit = data?.monthlyLimit || 20000;
  const limitPercent = data?.limitPercent || 62;
  const usageByApi = data?.usageByApi || [
    { name: 'OpenAI', requests: 6230, percent: 50, color: '#10B981' },
    { name: 'Internal API', requests: 3450, percent: 28, color: '#2563EB' },
    { name: 'Brevo (Email)', requests: 1820, percent: 15, color: '#6366F1' },
    { name: 'Google Maps', requests: 950, percent: 7, color: '#F59E0B' }
  ];
  const recentRequests = data?.recentRequests || [
    { time: '10:24 AM', api: 'OpenAI', status: 200 },
    { time: '10:22 AM', api: 'Internal API', status: 200 },
    { time: '10:21 AM', api: 'Brevo', status: 200 },
    { time: '10:18 AM', api: 'Google Maps', status: 200 },
    { time: '10:15 AM', api: 'OpenAI', status: 200 }
  ];
  const apiKeys = data?.apiKeys || [];

  return (
    <div className="w-full min-h-screen bg-[#F4F6F9] text-slate-800">
      <Header
        title="Employee Dashboard / API Keys"
        subtitle={`Personal API credentials & consumption quota — ${employeeName} (${role})`}
        onRefresh={loadData}
      />

      <main className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto flex flex-col gap-6">
        {/* Top Row: My Usage, Monthly Limit, My API Keys (Matching Panel 5) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: My Usage (This Month) */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
            <div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                My Usage (This Month)
              </div>
              <div className="text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
                {myUsage.toLocaleString()} <span className="text-sm font-semibold text-slate-400">Requests</span>
              </div>
              <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-emerald-600">
                <ArrowUpRight size={14} />
                <span>+10% from last week</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-400 font-medium">Estimated Cost</div>
                <div className="text-xl font-bold text-emerald-600 font-mono">₹{myCost.toLocaleString()}</div>
              </div>
              <div className="flex items-center gap-1 text-xs font-semibold text-emerald-600">
                <ArrowUpRight size={13} />
                <span>+8%</span>
              </div>
            </div>
          </div>

          {/* Card 2: Monthly Limit Radial Gauge */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col items-center justify-between text-center">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 self-start">
              Monthly Limit
            </div>

            <div className="relative w-36 h-36 rounded-full flex items-center justify-center border-[12px] border-slate-100 border-t-blue-600 border-r-blue-600 border-b-blue-600 shadow-inner my-2">
              <div className="text-center">
                <div className="text-2xl font-black text-slate-900 font-mono">{limitPercent}%</div>
                <div className="text-[10px] text-slate-400 font-bold uppercase">Utilized</div>
              </div>
            </div>

            <div className="text-xs font-semibold text-slate-600 font-mono">
              <span className="text-slate-900 font-bold">{myUsage.toLocaleString()}</span> / {monthlyLimit.toLocaleString()}
            </div>
          </div>

          {/* Card 3: My API Keys with Create Button */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                My API Keys
              </div>
              <button
                onClick={() => { setShowCreateModal(true); setCreatedRawKey(null); }}
                className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-1.5 px-3 rounded-lg cursor-pointer transition-all shadow-sm"
              >
                <Plus size={13} />
                <span>Create New API Key</span>
              </button>
            </div>

            <div className="flex flex-col gap-3 flex-1 justify-center">
              {apiKeys.slice(0, 2).map((key) => (
                <div key={key.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                  <div className="min-w-0 flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                      <KeyRound size={16} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-800 truncate">{key.name}</div>
                      <div className="text-[11px] font-mono text-slate-400 truncate">{key.maskedKey}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleCopy(key.id, key.rawKey || key.maskedKey)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 rounded cursor-pointer transition-colors"
                      title="Copy API Key"
                    >
                      {copiedKeyId === key.id ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                    </button>
                    <button
                      onClick={() => handleRevoke(key.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded cursor-pointer transition-colors"
                      title="Revoke API Key"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-[11px] text-slate-400 mt-3 pt-3 border-t border-slate-100 flex items-center gap-1.5">
              <Lock size={12} className="text-emerald-600" />
              <span>Keys are hashed at rest via SHA-256</span>
            </div>
          </div>
        </div>

        {/* Bottom Row: Usage by API & Recent Requests (Matching Panel 5) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Usage by API */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Usage by API</h3>

            <div className="flex flex-col gap-4 flex-1 justify-around">
              {usageByApi.map((apiItem, idx) => (
                <div key={idx} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-800">{apiItem.name}</span>
                    <span className="font-mono text-slate-500">
                      <strong className="text-slate-900">{apiItem.requests.toLocaleString()}</strong> ({apiItem.percent}%)
                    </span>
                  </div>

                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden flex">
                    <div 
                      style={{ width: `${apiItem.percent}%`, backgroundColor: apiItem.color || '#2563EB' }}
                      className="h-full rounded-full transition-all duration-500"
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Requests */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900">Recent Requests</h3>
              <span className="text-xs text-blue-600 font-semibold cursor-pointer">View All</span>
            </div>

            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase">
                    <th className="py-2 px-1">Time</th>
                    <th className="py-2 px-2">API</th>
                    <th className="py-2 px-1 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {recentRequests.map((req, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-1 text-slate-400 font-mono">{req.time}</td>
                      <td className="py-3 px-2 font-bold text-slate-800">{req.api}</td>
                      <td className="py-3 px-1 text-center">
                        <span className="inline-block px-2.5 py-0.5 rounded text-[10px] font-bold font-mono bg-emerald-50 text-emerald-600 border border-emerald-200">
                          {req.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Create Key Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 w-full max-w-md shadow-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <KeyRound size={18} className="text-blue-600" />
                <span>Create New API Key</span>
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X size={18} />
              </button>
            </div>

            {createdRawKey ? (
              <div className="flex flex-col gap-4">
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs">
                  <div className="font-bold flex items-center gap-1.5 mb-1">
                    <CheckCircle2 size={14} className="text-emerald-600" />
                    <span>API Key Generated!</span>
                  </div>
                  Please copy your key now. For security purposes, it will never be displayed again.
                </div>

                <div className="p-3 bg-slate-900 text-emerald-400 font-mono text-xs rounded-xl flex items-center justify-between break-all">
                  <span>{createdRawKey}</span>
                  <button 
                    onClick={() => handleCopy('new', createdRawKey)}
                    className="p-1.5 text-slate-300 hover:text-white shrink-0 ml-2 cursor-pointer"
                  >
                    {copiedKeyId === 'new' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  </button>
                </div>

                <button
                  onClick={() => setShowCreateModal(false)}
                  className="w-full py-3 min-h-[44px] bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl cursor-pointer transition-all shadow-sm"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleCreateKey} noValidate className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Key Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Staging Integration Key"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Environment</label>
                  <select
                    value={newKeyEnv}
                    onChange={(e) => setNewKeyEnv(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs font-semibold text-slate-900 outline-none focus:border-blue-500"
                  >
                    <option value="production">Production (20,000 reqs/mo)</option>
                    <option value="development">Development (5,000 reqs/mo)</option>
                  </select>
                </div>

                <div className="flex gap-2 justify-end mt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2.5 min-h-[44px] border border-slate-300 text-slate-700 font-semibold text-xs rounded-xl cursor-pointer hover:bg-slate-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 min-h-[44px] bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl cursor-pointer shadow-sm transition-all"
                  >
                    Generate Key
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
