'use client';

import { Activity } from 'lucide-react';

export default function ThroughputChart({ throughputHistory = [] }) {
  const maxVal = Math.max(10, ...throughputHistory.map(h => h.count || 0));
  const data = throughputHistory.length > 0 ? throughputHistory : Array(30).fill({ count: 0 });

  return (
    <div className="glass-panel w-full min-w-0 max-w-full box-border p-4 sm:p-6 mb-7 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)]">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Activity size={18} className="text-emerald-400" />
          <h2 className="text-sm sm:text-base font-bold text-[var(--text-heading)]">
            Event Ingestion Throughput (Past 30s)
          </h2>
        </div>
        <div className="flex items-center gap-3 sm:gap-4">
          <span className="text-xs text-[var(--text-muted)]">
            Peak: <strong className="text-emerald-400 font-mono font-bold">{maxVal} evt/s</strong>
          </span>
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">Realtime Stream</span>
        </div>
      </div>

      {/* SVG Histogram / Bar Chart */}
      <div className="h-[110px] flex items-end gap-1 pt-2.5 border-b border-[var(--border-subtle)]">
        {data.slice(-30).map((item, idx) => {
          const heightPercent = Math.max(4, Math.round(((item.count || 0) / maxVal) * 100));
          const isLatest = idx === data.length - 1;

          return (
            <div
              key={idx}
              title={`${item.count || 0} events/sec`}
              className={`flex-1 rounded-t transition-all duration-300 relative ${
                isLatest
                  ? 'bg-gradient-to-t from-emerald-500 to-emerald-400 shadow-sm shadow-emerald-500/40'
                  : 'bg-gradient-to-t from-emerald-500/30 to-indigo-500/60'
              }`}
              style={{ height: `${heightPercent}%` }}
            />
          );
        })}
      </div>

      <div className="flex justify-between mt-2 text-[11px] text-[var(--text-subtle)] font-mono">
        <span>30s ago</span>
        <span>15s ago</span>
        <span className="text-emerald-400 font-semibold">Now (Live)</span>
      </div>
    </div>
  );
}
