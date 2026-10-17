'use client';

import { Filter, Trash2 } from 'lucide-react';
import { formatCompactNumber } from '@/utils/formatters';

export default function MeterCard({ meter, onDelete }) {
  const getAggBadgeClass = (type) => {
    switch (type) {
      case 'SUM':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      case 'MAX':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      case 'COUNT':
        return 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30';
      case 'UNIQUE_COUNT':
        return 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30';
      case 'WEIGHTED_AVG':
        return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
      default:
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
    }
  };

  return (
    <div className="glass-panel w-full p-5 sm:p-6 flex flex-col justify-between relative rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] transition-all duration-200 hover:border-[var(--border-medium)]">
      <div>
        <div className="flex items-start justify-between mb-3 gap-2">
          <div className="min-w-0 flex-1">
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border uppercase tracking-wide mb-2 ${getAggBadgeClass(meter.aggregationType)}`}>
              {meter.aggregationType}
            </span>
            <h3 className="text-base font-bold text-[var(--text-heading)] mt-1 truncate">
              {meter.name}
            </h3>
            <div className="text-xs font-mono text-indigo-400 mt-0.5 truncate">
              {meter.code}
            </div>
          </div>

          {onDelete && (
            <button
              onClick={() => onDelete(meter.id)}
              title="Delete meter"
              aria-label="Delete meter"
              className="bg-transparent border-0 text-[var(--text-subtle)] hover:text-rose-400 cursor-pointer p-1.5 rounded transition-colors shrink-0"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>

        <p className="text-xs text-[var(--text-muted)] mb-4 leading-relaxed line-clamp-2">
          {meter.description || 'Calculates billable consumption metrics.'}
        </p>

        {/* Aggregation Formula Box */}
        <div className="bg-[var(--bg-inset)] border border-[var(--border-subtle)] rounded-lg p-2.5 sm:p-3 mb-4 text-xs font-mono">
          <div className="text-[var(--text-subtle)] text-[10px] uppercase font-semibold mb-1">
            AGGREGATION RULE:
          </div>
          <div className="text-cyan-400 truncate">
            {meter.aggregationType}(<strong className="text-cyan-300">{meter.eventType}</strong>.{meter.valueProperty})
          </div>
          {meter.filterField && (
            <div className="text-amber-400 mt-1 flex items-center gap-1 text-[11px]">
              <Filter size={11} className="shrink-0" />
              <span className="truncate">filter: {meter.filterField} == &quot;{meter.filterValue}&quot;</span>
            </div>
          )}
        </div>
      </div>

      {/* Current Aggregated Usage Ticker */}
      <div className="border-t border-[var(--border-subtle)] pt-3.5 flex items-center justify-between">
        <div>
          <div className="text-[10px] text-[var(--text-subtle)] uppercase font-semibold tracking-wider">
            Current Total Metered
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-emerald-400 font-mono mt-0.5">
            {formatCompactNumber(meter.currentValue || 0)}{' '}
            <span className="text-xs font-normal text-[var(--text-muted)]">{meter.unit}</span>
          </div>
        </div>

        <div className="text-right">
          <div className="text-[10px] text-[var(--text-subtle)] uppercase font-semibold tracking-wider">
            Events
          </div>
          <div className="text-sm sm:text-base font-bold text-[var(--text-heading)] font-mono mt-0.5">
            {meter.eventCount || 0}
          </div>
        </div>
      </div>
    </div>
  );
}
