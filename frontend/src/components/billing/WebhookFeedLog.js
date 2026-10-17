'use client';

import { Radio, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { formatCurrency, formatTimestamp } from '@/utils/formatters';

export default function WebhookFeedLog({ webhookLogs = [] }) {
  if (webhookLogs.length === 0) {
    return (
      <div className="glass-panel p-8 text-center text-[var(--text-muted)] rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)]">
        No outbound billing feed webhooks dispatched yet. Generate an invoice to feed directly into billing systems.
      </div>
    );
  }

  return (
    <div className="glass-panel overflow-hidden w-full min-w-0 max-w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)]">
      <div className="px-5 py-4 border-b border-[var(--border-subtle)] flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Radio size={16} className="text-emerald-400" />
          <h3 className="text-sm font-bold text-[var(--text-heading)]">Direct Billing System Outbound Feeds</h3>
        </div>
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
          HMAC-SHA256 Signed
        </span>
      </div>

      <div className="max-h-[350px] overflow-y-auto divide-y divide-[var(--border-subtle)]">
        {webhookLogs.map((log) => (
          <div
            key={log.id}
            className="p-4 px-5 flex items-center justify-between flex-wrap gap-2.5 hover:bg-[var(--bg-hover-subtle)] transition-colors"
          >
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 uppercase">
                  {log.provider}
                </span>
                <strong className="text-xs sm:text-sm text-[var(--text-heading)] font-semibold">
                  {log.customer} &ndash; {log.invoiceNumber}
                </strong>
              </div>
              <div className="text-[11px] text-[var(--text-subtle)] font-mono">
                Signature: {log.signature} &bull; Latency: {log.responseTimeMs}ms
              </div>
            </div>

            <div className="text-right">
              <div className="text-sm font-bold text-emerald-400 font-mono">
                {formatCurrency(log.totalAmount, 'INR')}
              </div>
              <div className="flex items-center gap-1 text-[11px] text-emerald-400 justify-end mt-0.5">
                <CheckCircle2 size={12} />
                <span>HTTP {log.statusCode} OK</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
