'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import { api } from '@/services/api';
import { Users, Search, Plus, Filter, ArrowUpRight, IndianRupee } from 'lucide-react';

const EMPLOYEES_DATA = [
  { id: 1, name: 'Rahul Verma', email: 'rahul.v@abctech.com', team: 'AI Team', role: 'Lead ML Engineer', requests: 48230, costInr: 3450, status: 'active' },
  { id: 2, name: 'Priya Singh', email: 'priya.s@abctech.com', team: 'Development Team', role: 'Backend Architect', requests: 32450, costInr: 2120, status: 'active' },
  { id: 3, name: 'Amit Kumar', email: 'amit.k@abctech.com', team: 'Development Team', role: 'Fullstack Developer', requests: 28120, costInr: 1890, status: 'active' },
  { id: 4, name: 'Neha Sharma', email: 'neha.s@abctech.com', team: 'Development Team', role: 'Integration Specialist', requests: 21340, costInr: 1250, status: 'active' },
  { id: 5, name: 'Vikash Yadav', email: 'vikash.y@abctech.com', team: 'Marketing Team', role: 'Growth Engineer', requests: 18220, costInr: 980, status: 'active' },
  { id: 6, name: 'Ananya Roy', email: 'ananya.r@abctech.com', team: 'AI Team', role: 'Data Scientist', requests: 16500, costInr: 890, status: 'active' },
  { id: 7, name: 'Kunal Patel', email: 'kunal.p@abctech.com', team: 'Development Team', role: 'DevOps Lead', requests: 14200, costInr: 720, status: 'active' },
  { id: 8, name: 'Sneha Deshmukh', email: 'sneha.d@abctech.com', team: 'Marketing Team', role: 'CRM Manager', requests: 12800, costInr: 640, status: 'active' }
];

export default function EmployeesPage() {
  const [search, setSearch] = useState('');

  const filtered = EMPLOYEES_DATA.filter(e => 
    e.name.toLowerCase().includes(search.toLowerCase()) || 
    e.team.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-full min-h-screen bg-[#F4F6F9] text-slate-800">
      <Header
        title="Employees & Members"
        subtitle="Internal showback attribution & API consumption limits across 28 team members"
      />

      <main className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto flex flex-col gap-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="relative w-72">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Filter by employee or team..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 outline-none focus:border-blue-500 shadow-sm"
            />
          </div>

          <button className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-md shadow-blue-600/20 cursor-pointer transition-all">
            <Plus size={14} />
            <span>Invite Employee</span>
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold text-slate-400 uppercase">
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Team</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4 text-right">Requests (Oct)</th>
                  <th className="py-3 px-4 text-right">Cost Showback (₹)</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium">
                {filtered.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{emp.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{emp.email}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-700">{emp.team}</td>
                    <td className="py-3 px-4 text-slate-500">{emp.role}</td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900 font-mono">
                      {emp.requests.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-emerald-600 font-mono">
                      ₹{emp.costInr.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
                        Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
