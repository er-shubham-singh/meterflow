'use client';

import { useState } from 'react';
import Header from '@/components/layout/Header';
import { FolderTree, Plus, Users, IndianRupee, ArrowUpRight, CheckCircle2 } from 'lucide-react';

const TEAMS_DATA = [
  {
    id: 'team_dev',
    name: 'Development Team',
    lead: 'Priya Singh',
    membersCount: 16,
    budgetLimitInr: 20000,
    currentSpentInr: 8330,
    percentage: 41,
    apisConnected: ['OpenAI', 'Google Gemini', 'Internal APIs']
  },
  {
    id: 'team_ai',
    name: 'AI Team',
    lead: 'Rahul Verma',
    membersCount: 8,
    budgetLimitInr: 10000,
    currentSpentInr: 4120,
    percentage: 41,
    apisConnected: ['OpenAI', 'Azure AI', 'AWS Bedrock']
  },
  {
    id: 'team_mkt',
    name: 'Marketing Team',
    lead: 'Vikash Yadav',
    membersCount: 4,
    budgetLimitInr: 5000,
    currentSpentInr: 1230,
    percentage: 25,
    apisConnected: ['Brevo (Email)', 'Twilio', 'Razorpay']
  }
];

export default function TeamsPage() {
  return (
    <div className="w-full min-h-screen bg-[#F4F6F9] text-slate-800">
      <Header
        title="Teams & Departments"
        subtitle="Manage organizational units, showback allocation & monthly API limits"
      />

      <main className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto flex flex-col gap-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Active Teams</h2>
            <p className="text-xs text-slate-500 mt-0.5">3 Departments under ABC Technologies</p>
          </div>

          <button className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-md shadow-blue-600/20 cursor-pointer transition-all">
            <Plus size={14} />
            <span>Create New Team</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TEAMS_DATA.map((team) => (
            <div key={team.id} className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <FolderTree size={20} />
                  </div>
                  <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                    <Users size={13} /> {team.membersCount} members
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900">{team.name}</h3>
                <p className="text-xs text-slate-400 mt-0.5">Lead: {team.lead}</p>

                <div className="mt-5 p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                  <div className="flex justify-between text-xs font-semibold mb-2">
                    <span className="text-slate-600">Monthly Budget</span>
                    <span className="font-mono text-slate-900">
                      <strong>₹{team.currentSpentInr.toLocaleString()}</strong> / ₹{team.budgetLimitInr.toLocaleString()}
                    </span>
                  </div>

                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div 
                      style={{ width: `${team.percentage}%` }}
                      className="h-full bg-emerald-500 rounded-full"
                    ></div>
                  </div>

                  <div className="flex justify-between text-[10px] text-slate-400 font-medium mt-1.5">
                    <span>{team.percentage}% utilized</span>
                    <span className="text-emerald-600 font-bold">Within Budget</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span className="truncate max-w-[180px]">
                  {team.apisConnected.join(', ')}
                </span>
                <span className="text-blue-600 font-semibold cursor-pointer hover:underline">
                  Configure →
                </span>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
