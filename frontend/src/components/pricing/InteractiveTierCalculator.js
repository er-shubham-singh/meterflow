'use client';

import { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { formatCurrency } from '@/utils/formatters';
import { Sparkles } from 'lucide-react';

export default function InteractiveTierCalculator({ selectedPlan }) {
  const [selectedRateCardIndex, setSelectedRateCardIndex] = useState(0);
  const [quantity, setQuantity] = useState(750000);
  const [calculation, setCalculation] = useState(null);
  const [loading, setLoading] = useState(false);

  const rateCards = selectedPlan?.rateCards || [];
  const currentRateCard = rateCards[selectedRateCardIndex] || rateCards[0];

  useEffect(() => {
    if (!currentRateCard) return;

    let isMounted = true;
    const runCalculation = async () => {
      setLoading(true);
      try {
        const res = await api.simulatePricing(currentRateCard, quantity);
        if (isMounted && res.data) {
          setCalculation(res.data);
        }
      } catch (err) { // eslint-disable-line no-unused-vars
        // handle silently
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    const timeout = setTimeout(runCalculation, 250);
    return () => {
      isMounted = false;
      clearTimeout(timeout);
    };
  }, [currentRateCard, quantity]);

  if (!currentRateCard) {
    return (
      <div className="glass-panel p-6 rounded-xl border border-[var(--border-subtle)] text-[var(--text-muted)] text-sm">
        No rate card available to simulate.
      </div>
    );
  }

  return (
    <div className="glass-panel w-full p-6 sm:p-7 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)]">
      <div className="flex items-center justify-between mb-5 flex-wrap gap-2.5">
        <div>
          <h3 className="text-lg font-extrabold text-[var(--text-heading)] flex items-center gap-2">
            <Sparkles size={18} className="text-emerald-400" />
            Interactive Tier Simulation Engine
          </h3>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Simulate consumption across Graduated, Volume, and Package rate cards in real-time.
          </p>
        </div>
        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
          {selectedPlan?.name || 'Selected Plan'}
        </span>
      </div>

      {/* Select Meter to Calculate */}
      <div className="mb-5">
        <label className="block text-xs text-[var(--text-muted)] font-medium mb-2">
          Choose Meter Rate Card:
        </label>
        <div className="flex gap-2 flex-wrap">
          {rateCards.map((rc, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedRateCardIndex(idx)}
              className={`py-1.5 px-3 rounded-lg text-xs font-semibold cursor-pointer transition-all duration-150 ${
                selectedRateCardIndex === idx
                  ? 'bg-emerald-500/15 border border-emerald-500 text-emerald-400 shadow-sm'
                  : 'bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-muted)] hover:border-[var(--border-medium)] hover:text-[var(--text-main)]'
              }`}
            >
              {rc.meterCode} ({rc.pricingModel})
            </button>
          ))}
        </div>
      </div>

      {/* Slider & Input */}
      <div className="mb-7 bg-[var(--bg-inset)] p-4 sm:p-5 rounded-xl border border-[var(--border-subtle)]">
        <div className="interactive-calc-controls flex justify-between items-center mb-2.5 gap-2.5 flex-wrap">
          <span className="text-xs sm:text-sm text-[var(--text-muted)] font-semibold">
            Simulated Consumed Units:
          </span>
          <div className="flex items-center gap-2 max-w-full">
            <input
              type="number"
              className="w-36 max-w-full text-right text-sm sm:text-base font-bold font-mono py-1.5 px-2.5 rounded-lg bg-[var(--bg-input)] border border-[var(--border-medium)] text-[var(--text-main)] focus:border-emerald-500 focus:outline-none"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(0, Number(e.target.value) || 0))}
            />
            <span className="text-xs text-[var(--text-muted)]">units</span>
          </div>
        </div>

        <input
          type="range"
          min="0"
          max="5000000"
          step="25000"
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          className="w-full accent-emerald-500 cursor-pointer h-2 bg-[var(--border-medium)] rounded-lg appearance-none mt-2"
        />
        <div className="flex justify-between text-[10px] text-[var(--text-subtle)] font-mono mt-1">
          <span>0 units</span>
          <span>1.0M</span>
          <span>2.5M</span>
          <span>5.0M units</span>
        </div>
      </div>

      {/* Real-time Calculation Breakdown */}
      {calculation && (
        <div>
          <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
            <h4 className="text-sm font-bold text-[var(--text-heading)]">
              Graduated Tier Mathematical Breakdown:
            </h4>
            <div className="text-lg sm:text-xl font-extrabold text-emerald-400 font-mono">
              Total: {formatCurrency(calculation.totalCost)}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {(calculation.tierBreakdown || []).map((t, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 sm:p-3.5 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-lg flex-wrap gap-2 transition-colors hover:border-[var(--border-medium)]"
              >
                <div>
                  <div className="font-semibold text-[var(--text-heading)] text-xs sm:text-sm">
                    Tier {t.tier}: Range {t.range}
                  </div>
                  <div className="text-xs text-[var(--text-subtle)] mt-0.5">
                    {t.unitsConsumed.toLocaleString()} units @ ₹{t.unitPrice} per unit
                  </div>
                </div>

                <div className="text-sm sm:text-base font-bold text-[var(--text-main)] font-mono">
                  {formatCurrency(t.cost)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
