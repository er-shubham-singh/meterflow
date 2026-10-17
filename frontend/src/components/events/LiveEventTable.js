'use client';

import { Code } from 'lucide-react';
import { formatTimestamp } from '@/utils/formatters';

export default function LiveEventTable({ events = [], onInspectEvent }) {
  if (events.length === 0) {
    return (
      <div className="glass-panel p-10 text-center text-[var(--text-muted)] rounded-xl border border-[var(--border-subtle)]">
        <p className="mb-3 text-sm">Waiting for incoming API telemetry events...</p>
        <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-semibold uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
          API Listener Active
        </span>
      </div>
    );
  }

  const getEventBadgeClass = (eventType) => {
    if (eventType?.startsWith('ai.')) return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
    if (eventType?.startsWith('api.')) return 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30';
    if (eventType?.startsWith('cloud.')) return 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30';
    return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
  };

  return (
    <div className="glass-panel overflow-hidden w-full min-w-0 max-w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)]">
      <div className="table-responsive w-full max-w-full min-w-0 overflow-x-auto">
        <table className="enterprise-table w-full">
          <thead>
            <tr>
              <th className="py-3 px-4 text-left font-semibold text-[var(--text-muted)] uppercase text-[11px] tracking-wider border-b border-[var(--border-subtle)] whitespace-nowrap">Time</th>
              <th className="py-3 px-4 text-left font-semibold text-[var(--text-muted)] uppercase text-[11px] tracking-wider border-b border-[var(--border-subtle)] whitespace-nowrap">Event ID</th>
              <th className="py-3 px-4 text-left font-semibold text-[var(--text-muted)] uppercase text-[11px] tracking-wider border-b border-[var(--border-subtle)] whitespace-nowrap">Customer</th>
              <th className="py-3 px-4 text-left font-semibold text-[var(--text-muted)] uppercase text-[11px] tracking-wider border-b border-[var(--border-subtle)] whitespace-nowrap">Type</th>
              <th className="py-3 px-4 text-left font-semibold text-[var(--text-muted)] uppercase text-[11px] tracking-wider border-b border-[var(--border-subtle)] whitespace-nowrap">Key Metric</th>
              <th className="py-3 px-4 text-left font-semibold text-[var(--text-muted)] uppercase text-[11px] tracking-wider border-b border-[var(--border-subtle)] whitespace-nowrap">Status</th>
              <th className="py-3 px-4 text-right font-semibold text-[var(--text-muted)] uppercase text-[11px] tracking-wider border-b border-[var(--border-subtle)] whitespace-nowrap">Payload</th>
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
                <tr key={evt.id || idx} className={`transition-colors hover:bg-[var(--bg-hover-subtle)] border-b border-[var(--border-subtle)] ${isLatest ? 'new-row-flash' : ''}`}>
                  <td className="py-3 px-4 font-mono text-[11px] text-[var(--text-subtle)] whitespace-nowrap">
                    {formatTimestamp(evt.timestamp || evt.processedAt)}
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-indigo-400 whitespace-nowrap">
                    {evt.id ? evt.id.slice(0, 14) + '...' : '--'}
                  </td>
                  <td className="py-3 px-4 font-semibold text-[var(--text-heading)] whitespace-nowrap">
                    {evt.customerId}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border ${getEventBadgeClass(evt.eventType)}`}>
                      {evt.eventType}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-[var(--text-main)] font-medium whitespace-nowrap text-xs">
                    {metricSnippet}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      METERED
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <button
                      onClick={() => onInspectEvent && onInspectEvent(evt)}
                      title="View Raw JSON"
                      className="bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-[var(--border-medium)] text-[var(--text-muted)] hover:text-[var(--text-main)] py-1 px-2.5 rounded-md cursor-pointer inline-flex items-center gap-1 text-xs font-mono transition-colors"
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
