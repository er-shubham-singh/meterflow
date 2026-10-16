'use client';

import { Building2, CreditCard, AlertTriangle, FileText, ChevronRight } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';

export default function CustomerCard({ customer, onSelect, onGenerateInvoice }) {
  const accrued = customer.currentTotalAccrued || 0;
  const budget = customer.budgetLimit || 5000;
  const percentUsed = Math.min(100, Math.round((accrued / budget) * 100));
  const isBudgetWarning = percentUsed >= 80;

  return (
    <div className="glass-panel" style={{
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      position: 'relative'
    }}>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#fff' }}>{customer.company || customer.name}</h3>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{customer.email}</div>
          </div>
          <span className="badge-tag badge-emerald" style={{ fontSize: '10px' }}>
            {customer.planName || 'Enterprise'}
          </span>
        </div>

        {/* Real-time Accrued Cost */}
        <div style={{ margin: '16px 0', background: 'rgba(15, 23, 42, 0.5)', padding: '14px', borderRadius: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-subtle)', textTransform: 'uppercase', fontWeight: '600' }}>
              Realtime Accrued Usage
            </span>
            <span style={{ fontSize: '11px', color: isBudgetWarning ? '#fbbf24' : 'var(--text-muted)' }}>
              Budget: {formatCurrency(budget)}
            </span>
          </div>

          <div style={{ fontSize: '24px', fontWeight: '800', color: '#fff', fontFamily: 'var(--font-mono)' }}>
            {formatCurrency(accrued)}
          </div>

          {/* Budget progress bar */}
          <div style={{
            height: '6px',
            background: 'rgba(255, 255, 255, 0.08)',
            borderRadius: '4px',
            overflow: 'hidden',
            marginTop: '8px'
          }}>
            <div style={{
              width: `${percentUsed}%`,
              height: '100%',
              background: percentUsed > 90 ? '#f43f5e' : percentUsed > 75 ? '#fbbf24' : '#10b981',
              borderRadius: '4px',
              transition: 'width 0.3s'
            }} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginTop: '6px' }}>
            <span style={{ color: 'var(--text-subtle)' }}>Cycle Cap</span>
            <span style={{ color: isBudgetWarning ? '#fbbf24' : '#34d399', fontWeight: '600' }}>
              {percentUsed}% consumed
            </span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
        <button
          onClick={() => onSelect && onSelect(customer)}
          style={{
            flex: 1,
            padding: '8px 12px',
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid var(--border-subtle)',
            color: '#cbd5e1',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}
        >
          <span>View Breakdown</span>
          <ChevronRight size={14} />
        </button>

        <button
          onClick={() => onGenerateInvoice && onGenerateInvoice(customer.id)}
          style={{
            padding: '8px 14px',
            background: '#10b981',
            border: 'none',
            color: '#022c22',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: '700',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <FileText size={14} />
          <span>Bill Now</span>
        </button>
      </div>
    </div>
  );
}
