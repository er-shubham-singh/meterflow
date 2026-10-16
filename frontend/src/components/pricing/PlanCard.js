'use client';

import { Calculator, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';

export default function PlanCard({ plan, onSelectPlan, isSelected }) {
  return (
    <div className="glass-panel" style={{
      padding: '28px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      border: isSelected ? '2px solid #10b981' : '1px solid var(--border-subtle)',
      background: isSelected ? 'rgba(16, 185, 129, 0.05)' : 'var(--bg-card)'
    }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#fff' }}>{plan.name}</h3>
          <span className="badge-tag badge-violet">{plan.code}</span>
        </div>

        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '20px' }}>
          {plan.description}
        </p>

        {/* Base Subscription Fee */}
        <div style={{ marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid var(--border-subtle)' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-subtle)', textTransform: 'uppercase', fontWeight: '600' }}>
            Base Recurring Platform Fee
          </span>
          <div style={{ fontSize: '28px', fontWeight: '800', color: '#10b981', marginTop: '2px' }}>
            {formatCurrency(plan.baseFee, plan.currency)}
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '400' }}> / cycle</span>
          </div>
        </div>

        {/* Rate Cards Breakdown */}
        <div>
          <span style={{ fontSize: '11px', color: 'var(--text-subtle)', textTransform: 'uppercase', fontWeight: '600', display: 'block', marginBottom: '10px' }}>
            Meter Rate Cards ({plan.rateCards?.length || 0})
          </span>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {(plan.rateCards || []).map((rc, idx) => (
              <div
                key={idx}
                style={{
                  background: 'rgba(15, 23, 42, 0.5)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '8px',
                  padding: '10px 12px',
                  fontSize: '12px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <strong style={{ color: '#f8fafc' }}>{rc.meterCode}</strong>
                  <span className={`badge-tag ${
                    rc.pricingModel === 'GRADUATED' ? 'badge-emerald' :
                    rc.pricingModel === 'VOLUME' ? 'badge-cyan' : 'badge-amber'
                  }`} style={{ fontSize: '9px', padding: '1px 5px' }}>
                    {rc.pricingModel}
                  </span>
                </div>

                <div style={{ fontSize: '11px', color: 'var(--text-subtle)' }}>
                  {rc.freeAllowance ? `Includes ${rc.freeAllowance.toLocaleString()} free units. ` : ''}
                  {rc.tiers ? `${rc.tiers.length} tiered steps` : rc.packageSize ? `$${rc.packagePrice} per ${rc.packageSize.toLocaleString()} block` : `$${rc.unitPrice} per unit`}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ marginTop: '24px' }}>
        <button
          onClick={() => onSelectPlan && onSelectPlan(plan)}
          style={{
            width: '100%',
            padding: '10px',
            borderRadius: '8px',
            border: '1px solid var(--border-subtle)',
            background: isSelected ? '#10b981' : 'rgba(255, 255, 255, 0.05)',
            color: isSelected ? '#022c22' : '#fff',
            fontWeight: '600',
            fontSize: '13px',
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          {isSelected ? <CheckCircle2 size={16} /> : <Calculator size={16} />}
          <span>{isSelected ? 'Currently Selected' : 'Test in Calculator'}</span>
        </button>
      </div>
    </div>
  );
}
