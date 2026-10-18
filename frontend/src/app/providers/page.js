'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import { api } from '@/services/api';
import { Server, CheckCircle2, AlertTriangle, ShieldCheck, Plus, ExternalLink, Bot, Sparkles, Cloud, Mail, Phone, CreditCard, Layers } from 'lucide-react';

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

export default function ProvidersPage() {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getProviders()
      .then(res => {
        if (res && res.data) setProviders(res.data);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="w-full min-h-screen bg-[#F4F6F9] text-slate-800">
      <Header
        title="API Providers"
        subtitle="Manage connected third-party integrations and internal services"
      />

      <main className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto flex flex-col gap-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Connected API Ecosystem</h2>
            <p className="text-xs text-slate-500 mt-0.5">8 Connected APIs (3 Third-party, 5 Internal Microservices)</p>
          </div>

          <button className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2 px-4 rounded-xl shadow-md shadow-blue-600/20 cursor-pointer transition-all">
            <Plus size={14} />
            <span>Connect New Provider</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {providers.map((p) => {
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
      </main>
    </div>
  );
}
