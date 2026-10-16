'use client';

import { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { formatCurrency } from '@/utils/formatters';
import { Sparkles, ArrowRight } from 'lucide-react';

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
    return <div className="glass-panel" style={{ padding: '24px' }}>No rate card available to simulate.</div>;
  }

  return (
    <div className="glass-panel" style={{ padding: '28px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-heading)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={18} color="#10b981" />
            Interactive Tier Simulation Engine
          </h3>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Simulate consumption across Graduated, Volume, and Package rate cards in real-time.
          </p>
        </div>
        <span className="badge-tag badge-emerald">{selectedPlan?.name || 'Selected Plan'}</span>
      </div>

      {/* Select Meter to Calculate */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>
          Choose Meter Rate Card:
        </label>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {rateCards.map((rc, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedRateCardIndex(idx)}
              style={{
                background: selectedRateCardIndex === idx ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-card)',
                border: selectedRateCardIndex === idx ? '1px solid var(--emerald-500)' : '1px solid var(--border-subtle)',
                color: selectedRateCardIndex === idx ? 'var(--emerald-400)' : 'var(--text-muted)',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {rc.meterCode} ({rc.pricingModel})
            </button>
          ))}
        </div>
      </div>

      {/* Slider & Input */}
      <div style={{ marginBottom: '28px', background: 'var(--bg-inset)', padding: '20px', borderRadius: '10px' }}>
        <div className="interactive-calc-controls" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', gap: '10px' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '600' }}>
            Simulated Consumed Units:
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="number"
              style={{ width: '160px', textAlign: 'right', fontSize: '15px', fontWeight: '700' }}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(0, Number(e.target.value) || 0))}
            />
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>units</span>
          </div>
        </div>

        <input
          type="range"
          min="0"
          max="5000000"
          step="25000"
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          style={{ width: '100%', accentColor: '#10b981', cursor: 'pointer' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-subtle)', marginTop: '4px' }}>
          <span>0 units</span>
          <span>1.0M</span>
          <span>2.5M</span>
          <span>5.0M units</span>
        </div>
      </div>

      {/* Real-time Calculation Breakdown */}
      {calculation && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-heading)' }}>Graduated Tier Mathematical Breakdown:</h4>
            <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--emerald-400)' }}>
              Total: {formatCurrency(calculation.totalCost)}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {(calculation.tierBreakdown || []).map((t, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '8px',
                  flexWrap: 'wrap',
                  gap: '8px'
                }}
              >
                <div>
                  <div style={{ fontWeight: '600', color: 'var(--text-heading)', fontSize: '13px' }}>
                    Tier {t.tier}: Range {t.range}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-subtle)', marginTop: '2px' }}>
                    {t.unitsConsumed.toLocaleString()} units @ ${t.unitPrice} per unit
                  </div>
                </div>

                <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>
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
