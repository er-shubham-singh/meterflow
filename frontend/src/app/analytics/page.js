'use client';

import { useState } from 'react';
import Header from '@/components/layout/Header';
import { BarChart3, TrendingUp, Calendar, Download, Filter, ArrowUpRight } from 'lucide-react';

export default function AnalyticsPage() {
  const [selectedRange, setSelectedRange] = useState('30d');

  return (
    <div className="w-full min-h-screen bg-[#F4F6F9] text-slate-800">
      <Header
        title="Usage Analytics"
        subtitle="In-depth telemetry breakdowns, token volume distribution & cost showback"
      />

      <main className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto flex flex-col gap-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Historical Consumption Analytics</h2>
            <p className="text-xs text-slate-500 mt-0.5">Real-time aggregation with sub-2ms ledger recalculation</p>
          </div>

          <div className="flex items-center gap-2">
            {['7d', '30d', '90d'].map((r) => (
              <button
                key={r}
                onClick={() => setSelectedRange(r)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                  selectedRange === r
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900'
                }`}
              >
                {r === '7d' ? 'Last 7 Days' : r === '30d' ? 'Last 30 Days' : 'Last Quarter'}
              </button>
            ))}
          </div>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="text-xs font-bold text-slate-400 uppercase">Total Tokens Processed</div>
            <div className="text-3xl font-extrabold text-slate-900 font-mono mt-1">14.8M</div>
            <div className="text-xs text-emerald-600 font-semibold mt-1">+14.2% vs previous period</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="text-xs font-bold text-slate-400 uppercase">Median Ingestion Latency</div>
            <div className="text-3xl font-extrabold text-emerald-600 font-mono mt-1">1.4ms</div>
            <div className="text-xs text-slate-500 font-medium mt-1">99.9th percentile: 3.8ms</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="text-xs font-bold text-slate-400 uppercase">Idempotency Precision</div>
            <div className="text-3xl font-extrabold text-blue-600 font-mono mt-1">100%</div>
            <div className="text-xs text-slate-500 font-medium mt-1">0 duplicate billings recorded</div>
          </div>
        </div>

        {/* Breakdown table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Volume by Endpoint & Model</h3>
              <p className="text-xs text-slate-500 mt-0.5">Real-time edge gateway throughput and model consumption</p>
            </div>
            <span className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
              5 Connected Endpoints
            </span>
          </div>

          {/* Mobile Stacked Cards Layout (<768px viewports per FIGMA SPEC #02) */}
          <div className="block md:hidden space-y-3" data-testid="mobile-volume-cards">
            {[
              { provider: 'OpenAI', endpoint: '/v1/chat/completions (gpt-4o-mini)', invocations: '98,092', latency: '1.2ms', cost: '₹4,980', status: 'Healthy' },
              { provider: 'Internal Orders', endpoint: '/v1/internal/orders', invocations: '61,307', latency: '0.8ms', cost: '₹0.00 (Showback)', status: 'Active' },
              { provider: 'Google AI', endpoint: '/v1/models/gemini-pro:generateContent', invocations: '36,784', latency: '1.4ms', cost: '₹2,840', status: 'Healthy' },
              { provider: 'Brevo', endpoint: '/v3/smtp/email', invocations: '24,523', latency: '1.9ms', cost: '₹1,960', status: 'Healthy' },
              { provider: 'Razorpay', endpoint: '/v1/orders', invocations: '12,261', latency: '4.8ms', cost: '₹2,450', status: 'Monitoring' }
            ].map((item, idx) => (
              <div key={idx} className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 flex flex-col gap-2.5 shadow-xs">
                {/* Header Row: Provider Left (14px Bold), Invocations Pill Right */}
                <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-200/60">
                  <span className="font-bold text-sm text-slate-900">{item.provider}</span>
                  <span className="font-mono font-bold text-xs bg-white border border-slate-200 text-slate-800 px-2.5 py-0.5 rounded-full shadow-xs">
                    {item.invocations} calls
                  </span>
                </div>

                {/* Body Grid: 2-Column Details */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Endpoint & Model</span>
                    <span className="font-mono text-[11px] text-slate-600 truncate block mt-0.5" title={item.endpoint}>
                      {item.endpoint}
                    </span>
                    <div className="text-[11px] text-emerald-600 font-mono font-semibold mt-1">
                      ⚡ {item.latency} avg latency
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Accrued Cost</span>
                    <span className="font-black text-sm text-emerald-600 font-mono block mt-0.5">
                      {item.cost}
                    </span>
                    <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      item.status === 'Healthy' || item.status === 'Active'
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                        : 'bg-amber-50 text-amber-600 border border-amber-200'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                </div>

                {/* Action Footer: Touch-friendly button (min-height 44px) */}
                <button
                  type="button"
                  className="w-full min-h-[44px] flex items-center justify-center gap-2 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 font-bold text-xs rounded-xl shadow-xs transition-all active:scale-[0.98] cursor-pointer mt-0.5"
                >
                  <span>View Endpoint Telemetry</span>
                  <span className="text-slate-400 font-mono text-[11px]">→</span>
                </button>
              </div>
            ))}
          </div>

          {/* Desktop Table (md: and above) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase">
                  <th className="py-2.5 px-3">Provider</th>
                  <th className="py-2.5 px-3">Endpoint</th>
                  <th className="py-2.5 px-3 text-right">Invocations</th>
                  <th className="py-2.5 px-3 text-right">Avg Latency</th>
                  <th className="py-2.5 px-3 text-right">Accrued Cost (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                <tr className="hover:bg-slate-50/80">
                  <td className="py-3 px-3 font-bold text-slate-900">OpenAI</td>
                  <td className="py-3 px-3 font-mono text-slate-500">/v1/chat/completions (gpt-4o-mini)</td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">98,092</td>
                  <td className="py-3 px-3 text-right font-mono text-emerald-600">1.2ms</td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-emerald-600">₹4,980</td>
                </tr>
                <tr className="hover:bg-slate-50/80">
                  <td className="py-3 px-3 font-bold text-slate-900">Internal Orders</td>
                  <td className="py-3 px-3 font-mono text-slate-500">/v1/internal/orders</td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">61,307</td>
                  <td className="py-3 px-3 text-right font-mono text-emerald-600">0.8ms</td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-slate-500">₹0.00 (Showback)</td>
                </tr>
                <tr className="hover:bg-slate-50/80">
                  <td className="py-3 px-3 font-bold text-slate-900">Google AI</td>
                  <td className="py-3 px-3 font-mono text-slate-500">/v1/models/gemini-pro:generateContent</td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">36,784</td>
                  <td className="py-3 px-3 text-right font-mono text-emerald-600">1.4ms</td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-emerald-600">₹2,840</td>
                </tr>
                <tr className="hover:bg-slate-50/80">
                  <td className="py-3 px-3 font-bold text-slate-900">Brevo</td>
                  <td className="py-3 px-3 font-mono text-slate-500">/v3/smtp/email</td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">24,523</td>
                  <td className="py-3 px-3 text-right font-mono text-emerald-600">1.9ms</td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-emerald-600">₹1,960</td>
                </tr>
                <tr className="hover:bg-slate-50/80">
                  <td className="py-3 px-3 font-bold text-slate-900">Razorpay</td>
                  <td className="py-3 px-3 font-mono text-slate-500">/v1/orders</td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">12,261</td>
                  <td className="py-3 px-3 text-right font-mono text-amber-600">4.8ms</td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-emerald-600">₹2,450</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
