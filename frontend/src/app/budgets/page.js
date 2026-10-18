'use client';

import { useState } from 'react';
import Header from '@/components/layout/Header';
import { PieChart, AlertTriangle, Bell, Plus, CheckCircle2, ShieldAlert } from 'lucide-react';

const BUDGETS = [
  { id: 1, name: 'Company Overall Budget', scope: 'Organization', spent: 12450, limit: 50000, percentage: 24, alertThreshold: 80, status: 'safe' },
  { id: 2, name: 'Development Team Pool', scope: 'Team', spent: 8330, limit: 20000, percentage: 41, alertThreshold: 85, status: 'safe' },
  { id: 3, name: 'AI Models (OpenAI & Gemini)', scope: 'Team', spent: 4120, limit: 10000, percentage: 41, alertThreshold: 80, status: 'safe' },
  { id: 4, name: 'Marketing Automation Pool', scope: 'Team', spent: 1230, limit: 5000, percentage: 25, alertThreshold: 75, status: 'safe' }
];

export default function BudgetsPage() {
  return (
    <div className="w-full min-h-screen bg-[#F4F6F9] text-slate-800">
      <Header
        title="Budgets & Alert Rules"
        subtitle="Prevent unexpected API overages and set real-time threshold notifications"
      />

      <main className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto flex flex-col gap-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Active Budget Pools</h2>
            <p className="text-xs text-slate-500 mt-0.5">Automated webhook alerts dispatch when consumption exceeds 80% of allocation</p>
          </div>

          <button className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-md shadow-blue-600/20 cursor-pointer transition-all">
            <Plus size={14} />
            <span>Create Budget Pool</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {BUDGETS.map((b) => (
            <div key={b.id} className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">{b.scope}</span>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                    <CheckCircle2 size={12} /> Within Limit
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900">{b.name}</h3>

                <div className="my-5">
                  <div className="flex justify-between text-xs font-semibold mb-2">
                    <span className="text-slate-500">Spent This Cycle</span>
                    <span className="font-mono text-slate-900">
                      <strong>₹{b.spent.toLocaleString()}</strong> / ₹{b.limit.toLocaleString()}
                    </span>
                  </div>

                  <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden flex">
                    <div 
                      style={{ width: `${b.percentage}%` }}
                      className="h-full bg-emerald-500 rounded-full"
                    ></div>
                  </div>

                  <div className="flex justify-between text-[11px] text-slate-400 font-medium mt-2">
                    <span>{b.percentage}% utilized</span>
                    <span>Alert triggers at {b.alertThreshold}%</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                  <Bell size={13} className="text-slate-400" />
                  <span>Slack & Email Webhook Active</span>
                </span>
                <span className="text-blue-600 font-bold hover:underline cursor-pointer">
                  Edit Rules
                </span>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
