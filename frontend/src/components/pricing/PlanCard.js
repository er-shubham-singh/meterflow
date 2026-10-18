'use client';

import { Calculator, CheckCircle2 } from 'lucide-react';
import { formatCurrency, formatMeterName } from '@/utils/formatters';

export default function PlanCard({ plan, onSelectPlan, isSelected }) {
  const getPricingModelBadge = (model) => {
    switch (model) {
      case 'GRADUATED':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      case 'VOLUME':
        return 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30';
      default:
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
    }
  };

  return (
    <div
      className={`glass-panel w-full p-6 sm:p-7 flex flex-col justify-between rounded-xl transition-all duration-200 ${
        isSelected
          ? 'border-2 border-emerald-500 bg-emerald-500/10 shadow-lg shadow-emerald-500/10'
          : 'border border-[var(--border-subtle)] bg-[var(--bg-card)] hover:border-[var(--border-medium)]'
      }`}
    >
      <div>
        <div className="flex items-center justify-between mb-2 gap-2">
          <h3 className="text-lg font-extrabold text-[var(--text-heading)] truncate">{plan.name}</h3>
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 shrink-0">
            {plan.code}
          </span>
        </div>

        <p className="text-xs text-[var(--text-muted)] mb-5 leading-relaxed line-clamp-2">
          {plan.description}
        </p>

        {/* Base Subscription Fee */}
        <div className="mb-5 pb-4 border-b border-[var(--border-subtle)]">
          <span className="text-[11px] text-[var(--text-subtle)] uppercase font-semibold tracking-wider block">
            Base Recurring Platform Fee
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 mt-1 font-mono">
            {formatCurrency(plan.baseFee, 'INR')}
            <span className="text-xs text-[var(--text-muted)] font-normal font-sans"> / cycle</span>
          </div>
        </div>

        {/* Rate Cards Breakdown */}
        <div>
          <span className="text-[11px] text-[var(--text-subtle)] uppercase font-semibold tracking-wider block mb-2.5">
            Meter Rate Cards ({plan.rateCards?.length || 0})
          </span>

          <div className="flex flex-col gap-2">
            {(plan.rateCards || []).map((rc, idx) => (
              <div
                key={idx}
                className="bg-[var(--bg-inset)] border border-[var(--border-subtle)] rounded-lg p-2.5 sm:p-3 text-xs"
              >
                <div className="flex justify-between items-center mb-1 gap-2">
                  <strong className="text-[var(--text-heading)] font-semibold truncate">{formatMeterName(rc.meterCode)}</strong>
                  <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-semibold border uppercase tracking-wider shrink-0 ${getPricingModelBadge(rc.pricingModel)}`}>
                    {rc.pricingModel}
                  </span>
                </div>

                <div className="text-[11px] text-[var(--text-subtle)]">
                  {rc.freeAllowance ? `Includes ${rc.freeAllowance.toLocaleString()} free units. ` : ''}
                  {rc.tiers
                    ? `${rc.tiers.length} tiered steps`
                    : rc.packageSize
                    ? `₹${rc.packagePrice} per ${rc.packageSize.toLocaleString()} block`
                    : `₹${rc.unitPrice} per unit`}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6">
        <button
          onClick={() => onSelectPlan && onSelectPlan(plan)}
          className={`w-full py-2.5 px-4 rounded-lg font-semibold text-xs sm:text-sm cursor-pointer transition-all duration-150 flex items-center justify-center gap-2 ${
            isSelected
              ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
              : 'bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-[var(--border-medium)] text-[var(--text-main)] hover:bg-[var(--bg-card-hover)]'
          }`}
        >
          {isSelected ? <CheckCircle2 size={16} /> : <Calculator size={16} />}
          <span>{isSelected ? 'Currently Selected' : 'Test in Calculator'}</span>
        </button>
      </div>
    </div>
  );
}
