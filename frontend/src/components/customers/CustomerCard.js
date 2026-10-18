'use client';

import { Building2, CreditCard, AlertTriangle, FileText, ChevronRight } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';

export default function CustomerCard({ customer, onSelect, onGenerateInvoice }) {
  const accrued = customer?.currentTotalAccrued || 0;
  const budget = customer?.budgetLimit || 500000;
  const percentUsed = Math.min(100, Math.round((accrued / budget) * 100));
  const isBudgetWarning = percentUsed >= 80;

  const getBarColorClass = () => {
    if (percentUsed > 90) return 'bg-rose-500';
    if (percentUsed > 75) return 'bg-amber-400';
    return 'bg-emerald-500';
  };

  return (
    <div className="glass-panel w-full min-w-0 max-w-full box-border p-5 sm:p-6 flex flex-col justify-between rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] hover:border-[var(--border-medium)] transition-all duration-200">
      <div>
        {/* Header Row */}
        <div className="flex justify-between items-start gap-3 mb-3.5">
          <div className="min-w-0 flex-1 overflow-hidden">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 pulse-indicator shrink-0" />
              <h3 className="text-sm sm:text-base font-bold text-[var(--text-heading)] truncate m-0">
                {customer?.company || customer?.name || 'Customer Account'}
              </h3>
            </div>
            <div className="text-xs text-[var(--text-muted)] truncate pl-4">
              {customer?.email || 'N/A'}
            </div>
          </div>
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 shrink-0">
            {customer?.planName || 'Enterprise'}
          </span>
        </div>

        {/* Real-time Accrued Cost Container */}
        <div className="my-3 bg-[var(--bg-inset)] p-4 rounded-xl border border-[var(--border-subtle)]">
          <div className="flex justify-between items-center text-[11px] font-semibold uppercase tracking-wider text-[var(--text-subtle)] mb-1.5 gap-2">
            <span>Realtime Accrued Usage</span>
            <span className={`font-mono text-xs ${isBudgetWarning ? 'text-amber-400 font-bold' : 'text-[var(--text-muted)]'}`}>
              Budget: {formatCurrency(budget)}
            </span>
          </div>

          <div className="text-2xl sm:text-3xl font-extrabold text-[var(--text-heading)] font-mono tracking-tight my-1">
            {formatCurrency(accrued)}
          </div>

          {/* Budget progress bar track */}
          <div className="mt-3 mb-2">
            <div className="h-2 bg-[var(--border-subtle)] rounded-full overflow-hidden w-full">
              <div
                className={`h-full rounded-full transition-all duration-500 ${getBarColorClass()}`}
                style={{ width: `${Math.max(2, percentUsed)}%` }}
              />
            </div>
          </div>

          {/* Cycle cap details */}
          <div className="flex justify-between items-center text-[11px] text-[var(--text-subtle)]">
            <span>Cycle Cap</span>
            <span className={`font-semibold font-mono ${isBudgetWarning ? 'text-amber-400' : 'text-emerald-400'}`}>
              {percentUsed}% consumed
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2.5 mt-4 pt-3 border-t border-[var(--border-subtle)] w-full">
        <button
          type="button"
          onClick={() => onSelect && onSelect(customer)}
          className="flex-1 py-2.5 px-3.5 min-h-[44px] bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-[var(--border-medium)] hover:text-emerald-400 text-[var(--text-main)] rounded-xl text-xs font-semibold cursor-pointer flex items-center justify-center gap-1.5 transition-all duration-150 shadow-sm my-0.5"
        >
          <span>View Breakdown</span>
          <ChevronRight size={14} />
        </button>

        <button
          type="button"
          onClick={() => onGenerateInvoice && onGenerateInvoice(customer?.id)}
          className="py-2.5 px-4 min-h-[44px] bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs cursor-pointer flex items-center justify-center gap-1.5 transition-all duration-150 shrink-0 shadow-md shadow-emerald-500/20 active:scale-95 my-0.5"
        >
          <FileText size={14} />
          <span>Bill Now</span>
        </button>
      </div>
    </div>
  );
}
