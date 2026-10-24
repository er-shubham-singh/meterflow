'use client';

import { useState, useEffect, useCallback } from 'react';
import Header from '@/components/layout/Header';
import { api } from '@/services/api';
import { 
  ShieldCheck, 
  Users, 
  Activity, 
  IndianRupee, 
  Layers, 
  ArrowUpRight, 
  CheckCircle2, 
  AlertTriangle,
  Server,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import CircularMetricCard from '@/components/dashboard/CircularMetricCard';

export default function PlatformAdminPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const res = await api.getPlatformOverview();
      if (res && res.data) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load platform overview:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const metrics = data?.metrics || {
    totalCustomers: 125,
    totalCustomersChange: '+8 this month',
    totalApiRequests: '4.2M',
    totalApiRequestsChange: '+12%',
    monthlyRevenue: '₹2,45,000',
    monthlyRevenueChange: '+18%',
    activeApis: 32,
    activeApisDetail: '18 third-party, 14 internal'
  };

  const topCustomers = data?.topCustomers || [
    { id: 1, customer: 'ABC Technologies', requests: '1.2M', revenueInr: 85000 },
    { id: 2, customer: 'REI/VANTA Tech', requests: '850K', revenueInr: 52000 },
    { id: 3, customer: 'NOVA Solutions', requests: '620K', revenueInr: 38000 },
    { id: 4, customer: 'Pearl Organisation', requests: '450K', revenueInr: 28000 },
    { id: 5, customer: 'AI Future Gen', requests: '320K', revenueInr: 21000 }
  ];

  const providerHealth = data?.providerHealth || [
    { provider: 'OpenAI', uptime: '99.9%', status: 'healthy', latency: '1.2ms' },
    { provider: 'Google Gemini', uptime: '99.8%', status: 'healthy', latency: '1.4ms' },
    { provider: 'Twilio', uptime: '99.9%', status: 'healthy', latency: '2.1ms' },
    { provider: 'Brevo', uptime: '99.7%', status: 'healthy', latency: '1.9ms' },
    { provider: 'Razorpay', uptime: '99.4%', status: 'degraded', latency: '4.8ms' }
  ];

  const platformUsageTrend = data?.platformUsageTrend || [
    { date: 'Oct 1', requests: 95000, revenue: 6200 },
    { date: 'Oct 5', requests: 120000, revenue: 7800 },
    { date: 'Oct 10', requests: 145000, revenue: 9200 },
    { date: 'Oct 15', requests: 130000, revenue: 8400 },
    { date: 'Oct 20', requests: 175000, revenue: 11500 },
    { date: 'Oct 25', requests: 190000, revenue: 12800 },
    { date: 'Oct 31', requests: 210000, revenue: 14200 }
  ];

  return (
    <div className="w-full min-h-screen bg-[#F4F6F9] text-slate-800">
      <Header
        title="Platform Overview"
        subtitle="Monitor overall platform usage, multi-tenant billing and provider health"
        onRefresh={loadData}
      />

      <main className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto flex flex-col gap-6">
        {/* Top 4 Stat Cards (Matching Panel 3) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {/* Total Customers */}
          <CircularMetricCard
            title="Total Customers"
            subtitle="Enterprise Tenants"
            badgeText="Registered"
            badgeVariant="blue"
            percentage={88}
            percentageLabel="GROWTH"
            strokeColor="#2563EB"
            textColor="#2563EB"
            metric={`${metrics.totalCustomers} Accounts`}
            subtext={metrics.totalCustomersChange}
            icon={Users}
          />

          {/* Total API Requests */}
          <CircularMetricCard
            title="Total API Requests"
            subtitle="Platform Throughput"
            badgeText="Live Ingestion"
            badgeVariant="emerald"
            percentage={94}
            percentageLabel="CAPACITY"
            strokeColor="#10B981"
            textColor="#059669"
            metric={`${metrics.totalApiRequests} Requests`}
            subtext={metrics.totalApiRequestsChange}
            icon={Activity}
          />

          {/* Monthly Revenue */}
          <CircularMetricCard
            title="Monthly Revenue"
            subtitle="Gross Showback Run-Rate"
            badgeText="MRR"
            badgeVariant="purple"
            percentage={78}
            percentageLabel="TARGET"
            strokeColor="#7C3AED"
            textColor="#7C3AED"
            metric={metrics.monthlyRevenue}
            subtext={metrics.monthlyRevenueChange}
            icon={IndianRupee}
          />

          {/* Active APIs */}
          <CircularMetricCard
            title="Active APIs"
            subtitle="Gateway Integrations"
            badgeText="Health"
            badgeVariant="cyan"
            percentage={100}
            percentageLabel="ONLINE"
            strokeColor="#0284C7"
            textColor="#0284C7"
            metric={`${metrics.activeApis} Active APIs`}
            subtext={metrics.activeApisDetail}
            icon={Layers}
          />
        </div>

        {/* Platform Usage & Revenue Chart (Matching Panel 3) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
            <div>
              <h2 className="text-base font-bold text-slate-900">Platform Usage & Revenue</h2>
              <p className="text-xs text-slate-500 mt-0.5">Aggregated multi-tenant throughput vs gross platform billings in INR (₹)</p>
            </div>

            <div className="flex items-center gap-4 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-blue-600">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span> API Requests
              </span>
              <span className="flex items-center gap-1.5 text-emerald-600">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Revenue (₹)
              </span>
            </div>
          </div>

          {/* Chart Display */}
          <div className="h-64 w-full relative flex flex-col justify-end pt-4">
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-40">
              <div className="border-b border-dashed border-slate-200 w-full flex justify-between text-[10px] text-slate-400"><span>200K reqs</span><span>₹15K</span></div>
              <div className="border-b border-dashed border-slate-200 w-full flex justify-between text-[10px] text-slate-400"><span>150K reqs</span><span>₹10K</span></div>
              <div className="border-b border-dashed border-slate-200 w-full flex justify-between text-[10px] text-slate-400"><span>100K reqs</span><span>₹5K</span></div>
              <div className="border-b border-slate-200 w-full flex justify-between text-[10px] text-slate-400"><span>0</span><span>₹0</span></div>
            </div>

            <div className="relative z-10 flex items-end justify-between gap-3 h-48 px-4">
              {platformUsageTrend.map((pt, idx) => {
                const heightPercent = Math.min(100, Math.max(20, (pt.requests / 220000) * 100));
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group relative cursor-pointer">
                    <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] py-1 px-2 rounded pointer-events-none whitespace-nowrap z-20 shadow-lg">
                      <div className="font-bold">{pt.date}</div>
                      <div>{pt.requests.toLocaleString()} reqs • ₹{pt.revenue.toLocaleString()}</div>
                    </div>

                    <div 
                      style={{ height: `${heightPercent}%` }}
                      className="w-full max-w-[28px] bg-gradient-to-t from-blue-700 to-blue-500 rounded-t-md group-hover:from-blue-800 transition-all shadow-sm"
                    ></div>

                    <span className="text-[10px] text-slate-400 mt-2 font-medium">
                      {pt.date}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Row: Top Customers (Left) & API Provider Health (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Customers Table */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900">Top Customers</h3>
              <span className="text-xs text-blue-600 font-semibold cursor-pointer">View All</span>
            </div>

            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase">
                    <th className="py-2 px-1">#</th>
                    <th className="py-2 px-2">Customer</th>
                    <th className="py-2 px-2 text-right">Requests</th>
                    <th className="py-2 px-2 text-right">Revenue (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {topCustomers.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-1 font-bold text-slate-400 font-mono">{c.id}</td>
                      <td className="py-3 px-2 font-bold text-slate-800">{c.customer}</td>
                      <td className="py-3 px-2 text-right font-bold text-slate-900 font-mono">{c.requests}</td>
                      <td className="py-3 px-2 text-right font-bold text-emerald-600 font-mono">
                        ₹{c.revenueInr.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* API Provider Health Table */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900">API Provider Health</h3>
              <span className="text-xs text-blue-600 font-semibold cursor-pointer">View All</span>
            </div>

            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase">
                    <th className="py-2 px-2">Provider</th>
                    <th className="py-2 px-2 text-center">Status</th>
                    <th className="py-2 px-2 text-right">Uptime</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {providerHealth.map((p, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-2 font-bold text-slate-800 flex items-center gap-2">
                        <Server size={14} className="text-slate-400" />
                        <span>{p.provider}</span>
                      </td>
                      <td className="py-3 px-2 text-center">
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold">
                          <span className={`w-2 h-2 rounded-full ${p.status === 'healthy' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                          <span className={p.status === 'healthy' ? 'text-emerald-700' : 'text-amber-700'}>
                            {p.status === 'healthy' ? 'Operational' : 'Degraded'}
                          </span>
                        </span>
                      </td>
                      <td className="py-3 px-2 text-right font-bold text-slate-900 font-mono">{p.uptime}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
