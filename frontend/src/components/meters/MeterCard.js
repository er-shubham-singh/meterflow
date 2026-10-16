'use client';

import { Layers, Activity, Filter, Trash2 } from 'lucide-react';
import { formatCompactNumber } from '@/utils/formatters';

export default function MeterCard({ meter, onDelete }) {
  const getAggColor = (type) => {
    switch (type) {
      case 'SUM': return 'badge-emerald';
      case 'MAX': return 'badge-amber';
      case 'COUNT': return 'badge-cyan';
      case 'UNIQUE_COUNT': return 'badge-violet';
      case 'WEIGHTED_AVG': return 'badge-rose';
      default: return 'badge-emerald';
    }
  };

  return (
    <div className="glass-panel" style={{
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      position: 'relative'
    }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div>
            <span className={`badge-tag ${getAggColor(meter.aggregationType)}`} style={{ marginBottom: '8px' }}>
              {meter.aggregationType}
            </span>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-heading)', marginTop: '4px' }}>
              {meter.name}
            </h3>
            <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--violet-400)', marginTop: '2px' }}>
              {meter.code}
            </div>
          </div>

          {onDelete && (
            <button
              onClick={() => onDelete(meter.id)}
              title="Delete meter"
              aria-label="Delete meter"
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-subtle)',
                cursor: 'pointer',
                padding: '4px'
              }}
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>

        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: '1.4' }}>
          {meter.description || 'Calculates billable consumption metrics.'}
        </p>

        {/* Aggregation Formula Box */}
        <div style={{
          background: 'var(--bg-inset)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '8px',
          padding: '10px 12px',
          marginBottom: '16px',
          fontSize: '11px',
          fontFamily: 'var(--font-mono)'
        }}>
          <div style={{ color: 'var(--text-subtle)', marginBottom: '2px', fontSize: '10px' }}>AGGREGATION RULE:</div>
          <div style={{ color: 'var(--cyan-400)' }}>
            {meter.aggregationType}(<strong>{meter.eventType}</strong>.{meter.valueProperty})
          </div>
          {meter.filterField && (
            <div style={{ color: 'var(--amber-400)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Filter size={10} /> filter: {meter.filterField} == &quot;{meter.filterValue}&quot;
            </div>
          )}
        </div>
      </div>

      {/* Current Aggregated Usage Ticker */}
      <div style={{
        borderTop: '1px solid var(--border-subtle)',
        paddingTop: '14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div>
          <div style={{ fontSize: '10px', color: 'var(--text-subtle)', textTransform: 'uppercase', fontWeight: '600' }}>
            Current Total Metered
          </div>
          <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--emerald-400)', fontFamily: 'var(--font-mono)' }}>
            {formatCompactNumber(meter.currentValue || 0)} <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{meter.unit}</span>
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '10px', color: 'var(--text-subtle)', textTransform: 'uppercase', fontWeight: '600' }}>
            Events
          </div>
          <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-heading)' }}>
            {meter.eventCount || 0}
          </div>
        </div>
      </div>
    </div>
  );
}
