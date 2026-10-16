'use client';

import { Activity } from 'lucide-react';

export default function ThroughputChart({ throughputHistory = [] }) {
  const maxVal = Math.max(10, ...throughputHistory.map(h => h.count || 0));
  const data = throughputHistory.length > 0 ? throughputHistory : Array(30).fill({ count: 0 });

  return (
    <div className="glass-panel" style={{ padding: '24px', marginBottom: '28px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Activity size={18} color="#10b981" />
          <h2 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-heading)' }}>
            Event Ingestion Throughput (Past 30s)
          </h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Peak: <strong style={{ color: '#34d399' }}>{maxVal} evt/s</strong>
          </span>
          <span className="badge-tag badge-emerald">Realtime Stream</span>
        </div>
      </div>

      {/* SVG Histogram / Bar Chart */}
      <div style={{
        height: '110px',
        display: 'flex',
        alignItems: 'flex-end',
        gap: '4px',
        paddingTop: '10px',
        borderBottom: '1px solid var(--border-subtle)'
      }}>
        {data.slice(-30).map((item, idx) => {
          const heightPercent = Math.max(4, Math.round(((item.count || 0) / maxVal) * 100));
          const isLatest = idx === data.length - 1;

          return (
            <div
              key={idx}
              title={`${item.count || 0} events/sec`}
              style={{
                flex: 1,
                height: `${heightPercent}%`,
                background: isLatest 
                  ? 'linear-gradient(to top, #10b981, #34d399)' 
                  : 'linear-gradient(to top, rgba(16, 185, 129, 0.4), rgba(99, 102, 241, 0.7))',
                borderRadius: '3px 3px 0 0',
                transition: 'height 0.3s ease, background 0.3s ease',
                position: 'relative'
              }}
            />
          );
        })}
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: '8px',
        fontSize: '11px',
        color: 'var(--text-subtle)'
      }}>
        <span>30s ago</span>
        <span>15s ago</span>
        <span style={{ color: '#10b981' }}>Now (Live)</span>
      </div>
    </div>
  );
}
