'use client';

import { Activity, IndianRupee, Layers, ShieldCheck } from 'lucide-react';
import { formatCurrency, formatCompactNumber } from '@/utils/formatters';

export default function MetricsOverview({ telemetry, metersCount, totalAccruedRevenue, customersCount }) {
  const cards = [
    {
      title: 'Total Ingested Events',
      value: formatCompactNumber(telemetry?.totalIngested || 0),
      subtext: `${telemetry?.eventsPerSecond || 0} events/sec right now`,
      icon: Activity,
      color: '#10b981',
      bgGlow: 'bg-emerald-500/15 text-emerald-400'
    },
    {
      title: 'Current Accrued Revenue',
      value: formatCurrency(totalAccruedRevenue || 0),
      subtext: `Across ${customersCount || 0} active accounts`,
      icon: IndianRupee,
      color: '#38bdf8',
      bgGlow: 'bg-cyan-500/15 text-cyan-400'
    },
    {
      title: 'Active Consumption Meters',
      value: metersCount || 5,
      subtext: 'SUM, MAX, UNIQUE_COUNT, AVG',
      icon: Layers,
      color: '#818cf8',
      bgGlow: 'bg-indigo-500/15 text-indigo-400'
    },
    {
      title: 'Idempotency Filtered',
      value: formatCompactNumber(telemetry?.totalDuplicatesDropped || 0),
      subtext: 'Duplicate billable events dropped',
      icon: ShieldCheck,
      color: '#fbbf24',
      bgGlow: 'bg-amber-500/15 text-amber-400'
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 mb-7 w-full min-w-0 max-w-full">
      {cards.map((c, i) => {
        const Icon = c.icon;
        return (
          <div
            key={i}
            className="glass-panel w-full min-w-0 box-border p-3.5 sm:p-6 flex flex-col justify-between relative overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] hover:border-[var(--border-medium)] transition-all duration-200"
          >
            <div className="flex items-center justify-between mb-2.5 sm:mb-3 gap-2">
              <span className="text-[11px] sm:text-sm text-[var(--text-muted)] font-semibold truncate">
                {c.title}
              </span>
              <div className={`w-7 h-7 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center shrink-0 ${c.bgGlow}`}>
                <Icon size={16} className="sm:hidden" />
                <Icon size={18} className="hidden sm:block" />
              </div>
            </div>

            <div>
              <div className="text-lg sm:text-3xl font-extrabold text-[var(--text-heading)] tracking-tight mb-0.5 sm:mb-1 font-mono">
                {c.value}
              </div>
              <div className="text-[10px] sm:text-xs text-[var(--text-subtle)] truncate">
                {c.subtext}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
