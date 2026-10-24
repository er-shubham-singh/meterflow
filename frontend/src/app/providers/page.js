'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import { api } from '@/services/api';
import { 
  Server, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Plus, 
  ExternalLink, 
  Bot, 
  Sparkles, 
  Cloud, 
  Mail, 
  Phone, 
  CreditCard, 
  Layers,
  X,
  Zap,
  Check
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';

const ICONS = {
  OpenAI: Bot,
  'Google AI (Gemini)': Sparkles,
  'Azure AI': Cloud,
  Twilio: Phone,
  Brevo: Mail,
  Razorpay: CreditCard,
  'AWS Cloud Services': Server,
  'Internal Orders API': Layers,
  'Internal Users API': Layers
};

/**
 * ProvidersPage Component (FIGMA SPEC #03 & TICKET-03)
 * Connected API Ecosystem Section with dedicated Empty State Layout when 0 providers are connected.
 * - Container Alignment: Vertically and horizontally centered within section box (padding: 32px 16px).
 * - Graphic Placeholder: 120px x 120px neutral vector illustration representing microservice & API connections.
 * - Typography & CTA:
 *   Heading: "No API Providers Connected Yet" (16px Medium/Bold, Color: #0F172A)
 *   Body Text: "Connect OpenAI, Anthropic, or custom internal endpoints to track real-time telemetry and costs."
 *   Primary Button: + Connect First Provider
 */
export default function ProvidersPage() {
  const { addToast } = useToast();
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [previewEmptyState, setPreviewEmptyState] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    providerType: 'openai',
    endpoint: '',
    description: ''
  });

  const fetchProviders = () => {
    api.getProviders()
      .then(res => {
        if (res && res.data) setProviders(res.data);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  const handleConnectProvider = (e) => {
    e.preventDefault();
    if (!formData.name) {
      addToast('Please enter a provider name', 'error');
      return;
    }
    const newProvider = {
      id: `prov_${Date.now()}`,
      name: formData.name,
      description: formData.description || 'Custom connected edge API endpoint',
      status: 'healthy',
      uptimePercent: '99.99',
      latencyMs: '1.2'
    };
    setProviders(prev => [newProvider, ...prev]);
    setIsConnectModalOpen(false);
    setPreviewEmptyState(false);
    setFormData({ name: '', providerType: 'openai', endpoint: '', description: '' });
    addToast(`${newProvider.name} successfully connected to gateway!`, 'success');
  };

  const displayedProviders = previewEmptyState ? [] : providers;

  return (
    <div className="w-full min-h-screen bg-[#F4F6F9] text-slate-800">
      <Header
        title="API Providers"
        subtitle="Manage connected third-party integrations and internal services"
        onRefresh={fetchProviders}
      />

      <main className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto flex flex-col gap-6">
        {/* Section Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900">Connected API Ecosystem</h2>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                {displayedProviders.length} Active
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {displayedProviders.length} Connected APIs (Third-party, Internal Microservices & LLM Routers)
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Toggle to simulate / audit Empty State per Figma Spec #03 */}
            <button
              onClick={() => setPreviewEmptyState(prev => !prev)}
              className="text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-all cursor-pointer shadow-xs"
              title="Toggle Empty State view to audit Figma Spec #03"
            >
              {previewEmptyState ? '← Show Connected Providers' : 'Audit Empty State'}
            </button>

            <button
              onClick={() => setIsConnectModalOpen(true)}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2 px-4 rounded-xl shadow-md shadow-blue-600/20 cursor-pointer transition-all active:scale-95"
            >
              <Plus size={14} />
              <span>Connect New Provider</span>
            </button>
          </div>
        </div>

        {/* Empty State Layout (FIGMA SPEC #03 & TICKET-03) */}
        {displayedProviders.length === 0 ? (
          <div
            className="bg-white rounded-2xl border border-slate-200/80 shadow-sm flex flex-col items-center justify-center text-center p-8 sm:p-12 my-2 transition-all animate-in fade-in zoom-in-95 duration-200"
            style={{ padding: '32px 16px' }}
            data-testid="api-providers-empty-state"
          >
            {/* 120px x 120px Neutral Vector Illustration */}
            <div 
              className="w-[120px] h-[120px] rounded-3xl bg-slate-50 border border-slate-200/80 flex items-center justify-center mb-5 relative shadow-inner"
              style={{ width: '120px', height: '120px' }}
            >
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-500/5 to-indigo-500/5 pointer-events-none" />
              <svg 
                width="72" 
                height="72" 
                viewBox="0 0 72 72" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Microservice Node 1 */}
                <rect x="8" y="10" width="24" height="20" rx="6" stroke="#94A3B8" strokeWidth="2.5" fill="#FFFFFF" />
                <circle cx="16" cy="20" r="3" fill="#3B82F6" />
                <rect x="22" y="17" width="6" height="2" rx="1" fill="#CBD5E1" />
                <rect x="22" y="21" width="4" height="2" rx="1" fill="#E2E8F0" />

                {/* Microservice Node 2 */}
                <rect x="40" y="10" width="24" height="20" rx="6" stroke="#94A3B8" strokeWidth="2.5" fill="#FFFFFF" />
                <circle cx="48" cy="20" r="3" fill="#10B981" />
                <rect x="54" y="17" width="6" height="2" rx="1" fill="#CBD5E1" />
                <rect x="54" y="21" width="4" height="2" rx="1" fill="#E2E8F0" />

                {/* Central Gateway Node */}
                <rect x="24" y="42" width="24" height="20" rx="6" stroke="#2563EB" strokeWidth="2.5" fill="#EFF6FF" />
                <circle cx="36" cy="52" r="3.5" fill="#2563EB" />

                {/* Connecting Bus Line */}
                <path d="M20 30V36H36V42" stroke="#94A3B8" strokeWidth="2" strokeDasharray="3 3" />
                <path d="M52 30V36H36" stroke="#94A3B8" strokeWidth="2" strokeDasharray="3 3" />
              </svg>
            </div>

            {/* Typography per Figma Spec #03 */}
            <h3 className="text-base font-bold text-[#0F172A] mb-1.5">
              No API Providers Connected Yet
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed mb-6 font-normal">
              Connect OpenAI, Anthropic, or custom internal endpoints to track real-time telemetry and costs.
            </p>

            {/* Primary Action Button */}
            <button
              onClick={() => setIsConnectModalOpen(true)}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm py-2.5 px-5 rounded-xl shadow-md shadow-blue-600/20 cursor-pointer active:scale-95 transition-all"
            >
              <Plus size={16} />
              <span>+ Connect First Provider</span>
            </button>
          </div>
        ) : (
          /* Grid of Connected Providers */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {displayedProviders.map((p) => {
              const Icon = ICONS[p.name] || Server;
              return (
                <div key={p.id} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                        <Icon size={20} />
                      </div>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        p.status === 'healthy' 
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' 
                          : 'bg-amber-50 text-amber-600 border border-amber-200'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${p.status === 'healthy' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                        {p.status === 'healthy' ? 'Healthy' : 'Monitoring'}
                      </span>
                    </div>

                    <div className="text-sm font-bold text-slate-900">{p.name}</div>
                    <div className="text-xs text-slate-500 mt-1 line-clamp-2">{p.description}</div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Uptime</span>
                      <span className="font-bold text-slate-800 font-mono">{p.uptimePercent}%</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block font-medium">Latency</span>
                      <span className="font-bold text-emerald-600 font-mono">{p.latencyMs}ms</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Connect Provider Modal */}
      {isConnectModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md p-6 flex flex-col gap-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Plus size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Connect API Provider</h3>
                  <p className="text-[11px] text-slate-400">Configure real-time gateway ingestion & cost tracking</p>
                </div>
              </div>
              <button
                onClick={() => setIsConnectModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleConnectProvider} className="flex flex-col gap-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Provider or Service Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Anthropic Claude, OpenAI, Custom Microservice"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-blue-500 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Provider Type</label>
                <select
                  value={formData.providerType}
                  onChange={(e) => setFormData({ ...formData, providerType: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-blue-500 focus:bg-white transition-all cursor-pointer"
                >
                  <option value="openai">OpenAI (GPT-4o, o1, mini)</option>
                  <option value="anthropic">Anthropic (Claude 3.5 Sonnet / Haiku)</option>
                  <option value="internal">Internal Core Microservice / VPC</option>
                  <option value="google">Google Gemini Pro / Flash</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Upstream Target URL / Endpoint</label>
                <input
                  type="text"
                  placeholder="https://api.anthropic.com or http://internal-service.local:8080"
                  value={formData.endpoint}
                  onChange={(e) => setFormData({ ...formData, endpoint: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-blue-500 focus:bg-white transition-all font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Generative AI completions, edge routing & live token showback"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-blue-500 focus:bg-white transition-all"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 mt-2">
                <button
                  type="button"
                  onClick={() => setIsConnectModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-600/20 active:scale-95 transition-all"
                >
                  Connect Provider
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
