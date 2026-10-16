'use client';

import { Code } from 'lucide-react';
import { formatTimestamp } from '@/utils/formatters';

export default function LiveEventTable({ events = [], onInspectEvent }) {
  if (events.length === 0) {
    return (
      <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
        <p style={{ marginBottom: '12px' }}>Waiting for incoming API telemetry events...</p>
        <span className="badge-tag badge-emerald">API Listener Active</span>
      </div>
    );
  }

  return (
    <div className="glass-panel" style={{ overflow: 'hidden' }}>
      <div className="table-responsive">
        <table className="enterprise-table">
          <thead>
            <tr>
              <th>Time</th>
              <th>Event ID</th>
              <th>Customer</th>
              <th>Type</th>
              <th>Key Metric</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Payload</th>
            </tr>
          </thead>
          <tbody>
            {events.map((evt, idx) => {
              const isLatest = idx === 0;
              const props = evt.properties || {};

              let metricSnippet = '--';
              if (props.tokens) metricSnippet = `${Number(props.tokens).toLocaleString()} tokens`;
              else if (props.vCpuHours) metricSnippet = `${props.vCpuHours} vCPU-hrs`;
              else if (props.storageGb) metricSnippet = `${props.storageGb} GB`;
              else if (props.userId) metricSnippet = `User: ${props.userId}`;
              else if (props.endpoint) metricSnippet = `${props.endpoint}`;

              return (
                <tr key={evt.id || idx} className={isLatest ? 'new-row-flash' : ''}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-subtle)', whiteSpace: 'nowrap' }}>
                    {formatTimestamp(evt.timestamp || evt.processedAt)}
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--violet-400)', whiteSpace: 'nowrap' }}>
                    {evt.id ? evt.id.slice(0, 14) + '...' : '--'}
                  </td>
                  <td style={{ fontWeight: '600', color: 'var(--text-heading)', whiteSpace: 'nowrap' }}>
                    {evt.customerId}
                  </td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <span className={`badge-tag ${
                      evt.eventType?.startsWith('ai.') ? 'badge-emerald' :
                      evt.eventType?.startsWith('api.') ? 'badge-cyan' :
                      evt.eventType?.startsWith('cloud.') ? 'badge-violet' : 'badge-amber'
                    }`}>
                      {evt.eventType}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-main)', fontWeight: '500', whiteSpace: 'nowrap' }}>
                    {metricSnippet}
                  </td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '11px',
                      color: 'var(--emerald-400)',
                      fontWeight: '600'
                    }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }}></span>
                      METERED
                    </span>
                  </td>
                  <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <button
                      onClick={() => onInspectEvent && onInspectEvent(evt)}
                      title="View Raw JSON"
                      style={{
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-subtle)',
                        color: 'var(--text-muted)',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '11px',
                        transition: 'all 0.15s'
                      }}
                    >
                      <Code size={12} />
                      <span>JSON</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
