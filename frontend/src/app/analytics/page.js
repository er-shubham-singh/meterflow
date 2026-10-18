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
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
          <h3 className="text-base font-bold text-slate-900 mb-4">Volume by Endpoint & Model</h3>
          <div className="overflow-x-auto">
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
