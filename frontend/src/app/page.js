'use client';

import { useState, useEffect, useCallback } from 'react';
import Header from '@/components/layout/Header';
import { api } from '@/services/api';
import { 
  Activity, 
  ArrowUpRight, 
  Users, 
  Layers, 
  IndianRupee, 
  TrendingUp, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Zap,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('daily'); // 'daily' | 'weekly'

  const loadData = useCallback(async () => {
    try {
      const res = await api.getCompanyDashboard();
      if (res && res.data) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load company dashboard:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 4000);
    return () => clearInterval(interval);
  }, [loadData]);

  const metrics = data?.metrics || {
    totalRequests: 245230,
    totalRequestsChange: '+12% from last month',
    totalCost: 12450,
    totalCostChange: '+8% from last month',
    activeEmployees: 28,
    activeEmployeesChange: '+2 new this month',
    connectedApis: 8,
    connectedApisDetail: '3 third-party, 5 internal',
    organization: 'ABC Technologies',
    plan: 'Enterprise Plan'
  };

  const usageTrend = data?.usageTrend || [];
  const providerDistribution = data?.providerDistribution || [];
  const topEmployees = data?.topEmployees || [];
  const recentActivity = data?.recentActivity || [];
  const budgetStatus = data?.budgetStatus || [];

  return (
    <div className="w-full min-h-screen bg-[#F4F6F9] text-slate-800">
      <Header
        title="Dashboard"
        subtitle="Overview of your API usage and costs"
        onRefresh={loadData}
      />

      <main className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto flex flex-col gap-6">
        {/* Top 4 KPI Stat Cards (Matching Panel 2) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {/* 1. Total API Requests */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between text-xs font-medium text-slate-500 mb-2">
              <span>Total API Requests</span>
              <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                <Activity size={16} />
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-mono">
              {metrics.totalRequests ? metrics.totalRequests.toLocaleString() : '245,230'}
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-emerald-600">
              <ArrowUpRight size={14} />
              <span>{metrics.totalRequestsChange || '+12% from last month'}</span>
            </div>
          </div>

          {/* 2. Total Cost (Estimated) in INR */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between text-xs font-medium text-slate-500 mb-2">
              <span>Total Cost (Estimated)</span>
              <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                <IndianRupee size={16} />
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-mono">
              ₹{metrics.totalCost ? metrics.totalCost.toLocaleString() : '12,450'}
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-emerald-600">
              <ArrowUpRight size={14} />
              <span>{metrics.totalCostChange || '+8% from last month'}</span>
            </div>
          </div>

          {/* 3. Active Employees */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between text-xs font-medium text-slate-500 mb-2">
              <span>Active Employees</span>
              <span className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
                <Users size={16} />
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-mono">
              {metrics.activeEmployees || 28}
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-emerald-600">
              <ArrowUpRight size={14} />
              <span>{metrics.activeEmployeesChange || '+2 new this month'}</span>
            </div>
          </div>

          {/* 4. Connected APIs */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between text-xs font-medium text-slate-500 mb-2">
              <span>Connected APIs</span>
              <span className="p-1.5 rounded-lg bg-cyan-50 text-cyan-600">
                <Layers size={16} />
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-mono">
              {metrics.connectedApis || 8}
            </div>
            <div className="mt-2 text-xs font-medium text-slate-500">
              {metrics.connectedApisDetail || '3 third-party, 5 internal'}
            </div>
          </div>
        </div>

        {/* Charts Row: API Usage Trend (Left) & Usage by API Provider (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Chart: API Usage Trend (2 Cols) */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
              <div>
                <h2 className="text-base font-bold text-slate-900">API Usage Trend</h2>
                <p className="text-xs text-slate-500 mt-0.5">Requests and estimated billing in Indian Rupees (₹)</p>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-3 text-xs font-semibold mr-2">
                  <span className="flex items-center gap-1.5 text-blue-600">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span> Requests
                  </span>
                  <span className="flex items-center gap-1.5 text-emerald-600">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Cost (₹)
                  </span>
                </div>

                <div className="inline-flex rounded-lg bg-slate-100 p-0.5 text-xs font-medium">
                  <button
                    onClick={() => setTimeframe('daily')}
                    className={`px-3 py-1 rounded-md transition-all ${timeframe === 'daily' ? 'bg-white shadow-sm text-slate-900 font-bold' : 'text-slate-500 hover:text-slate-900'}`}
                  >
                    Daily
                  </button>
                  <button
                    onClick={() => setTimeframe('weekly')}
                    className={`px-3 py-1 rounded-md transition-all ${timeframe === 'weekly' ? 'bg-white shadow-sm text-slate-900 font-bold' : 'text-slate-500 hover:text-slate-900'}`}
                  >
                    Weekly
                  </button>
                </div>
              </div>
            </div>

            {/* Custom SVG Bar & Trend Chart */}
            <div className="h-64 w-full relative flex flex-col justify-end pt-4">
              {/* Background horizontal grid lines */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-40">
                <div className="border-b border-dashed border-slate-200 w-full flex justify-between text-[10px] text-slate-400"><span>20,000 reqs</span><span>₹1,000</span></div>
                <div className="border-b border-dashed border-slate-200 w-full flex justify-between text-[10px] text-slate-400"><span>15,000 reqs</span><span>₹750</span></div>
                <div className="border-b border-dashed border-slate-200 w-full flex justify-between text-[10px] text-slate-400"><span>10,000 reqs</span><span>₹500</span></div>
                <div className="border-b border-dashed border-slate-200 w-full flex justify-between text-[10px] text-slate-400"><span>5,000 reqs</span><span>₹250</span></div>
                <div className="border-b border-slate-200 w-full flex justify-between text-[10px] text-slate-400"><span>0</span><span>₹0</span></div>
              </div>

              {/* Bars and Line container */}
              <div className="relative z-10 flex items-end justify-between gap-1 sm:gap-2 h-48 px-2">
                {usageTrend.map((item, idx) => {
                  const barHeightPercent = Math.min(100, Math.max(15, (item.requests / 20000) * 100));
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group relative cursor-pointer">
                      {/* Tooltip on hover */}
                      <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] py-1 px-2 rounded pointer-events-none whitespace-nowrap z-20 shadow-lg">
                        <div className="font-bold">{item.date}</div>
                        <div>{item.requests.toLocaleString()} reqs • ₹{item.cost}</div>
                      </div>

                      {/* Bar for Requests */}
                      <div 
                        style={{ height: `${barHeightPercent}%` }}
                        className="w-full max-w-[18px] bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-sm group-hover:from-blue-700 group-hover:to-blue-500 transition-all shadow-sm"
                      ></div>

                      {/* Date label */}
                      <span className="text-[10px] text-slate-400 mt-2 font-medium truncate hidden sm:block">
                        {item.date.replace('Oct ', '')}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Chart: Usage by API Provider (1 Col Donut) */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900">Usage by API Provider</h2>
              <Link href="/providers" className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1">
                <span>View All</span>
                <ChevronRight size={13} />
              </Link>
            </div>

            {/* Donut representation with center metric */}
            <div className="relative flex items-center justify-center my-4">
              <div className="relative w-44 h-44 rounded-full flex items-center justify-center border-[14px] border-emerald-500 border-r-blue-600 border-b-amber-500 border-l-purple-500 shadow-inner">
                <div className="text-center">
                  <div className="text-2xl font-black text-slate-900 font-mono">245K</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Requests</div>
                </div>
              </div>
            </div>

            {/* Provider Breakdown List */}
            <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
              {providerDistribution.map((p, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs py-0.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color || '#2563EB' }}></span>
                    <span className="font-semibold text-slate-700">{p.name}</span>
                  </div>
                  <span className="font-bold text-slate-900 font-mono">{p.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom 3-Column Section: Top Employees, Recent Activity, Budget Status */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Card 1: Top Employees by Usage */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900">Top Employees by Usage</h3>
              <Link href="/employees" className="text-xs text-blue-600 font-semibold hover:underline">
                View All
              </Link>
            </div>

            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase">
                    <th className="py-2 px-1">#</th>
                    <th className="py-2 px-2">Employee</th>
                    <th className="py-2 px-2 text-right">Requests</th>
                    <th className="py-2 px-2 text-right">Cost (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {topEmployees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-1 font-bold text-slate-400 font-mono">{emp.id}</td>
                      <td className="py-2.5 px-2">
                        <div className="font-bold text-slate-800">{emp.name}</div>
                        <div className="text-[10px] text-slate-400">{emp.team}</div>
                      </td>
                      <td className="py-2.5 px-2 text-right font-bold text-slate-900 font-mono">
                        {emp.requests.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-2 text-right font-bold text-emerald-600 font-mono">
                        ₹{emp.costInr.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Card 2: Recent API Activity */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900">Recent API Activity</h3>
              <Link href="/events" className="text-xs text-blue-600 font-semibold hover:underline">
                View All
              </Link>
            </div>

            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase">
                    <th className="py-2 px-1">Time</th>
                    <th className="py-2 px-2">Employee</th>
                    <th className="py-2 px-2">API</th>
                    <th className="py-2 px-1 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {recentActivity.map((act) => (
                    <tr key={act.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-1 text-slate-400 font-mono whitespace-nowrap">{act.time}</td>
                      <td className="py-2.5 px-2 font-semibold text-slate-800 whitespace-nowrap">{act.employee}</td>
                      <td className="py-2.5 px-2 text-slate-600 font-medium whitespace-nowrap">{act.api}</td>
                      <td className="py-2.5 px-1 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                          act.status === 200 
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' 
                            : 'bg-rose-50 text-rose-600 border border-rose-200'
                        }`}>
                          {act.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Card 3: Budget Status */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900">Budget Status</h3>
              <Link href="/budgets" className="text-xs text-blue-600 font-semibold hover:underline">
                Manage
              </Link>
            </div>

            <div className="flex flex-col gap-4 flex-1 justify-around">
              {budgetStatus.map((b, idx) => (
                <div key={idx} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-800">{b.name}</span>
                    <span className="font-mono text-slate-500">
                      <strong className="text-slate-900">₹{b.spent.toLocaleString()}</strong> / ₹{b.limit.toLocaleString()}
                    </span>
                  </div>

                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden flex">
                    <div 
                      style={{ width: `${b.percentage}%` }}
                      className={`h-full rounded-full ${
                        b.percentage > 85 ? 'bg-rose-500' : b.percentage > 60 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                    ></div>
                  </div>

                  <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                    <span>{b.percentage}% of allocation</span>
                    <span className={b.percentage > 85 ? 'text-rose-500 font-bold' : 'text-slate-400'}>
                      {b.percentage > 85 ? 'Warning: High' : 'Normal'}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span>Billing Cycle: Oct 1 - Oct 31, 2026</span>
              <span className="text-emerald-600 font-semibold flex items-center gap-1">
                <CheckCircle2 size={12} /> Live Active
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
