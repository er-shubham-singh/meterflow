'use client';

import { Radio, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { formatCurrency, formatTimestamp } from '@/utils/formatters';

export default function WebhookFeedLog({ webhookLogs = [] }) {
  if (webhookLogs.length === 0) {
    return (
      <div className="glass-panel" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
        No outbound billing feed webhooks dispatched yet. Generate an invoice to feed directly into billing systems.
      </div>
    );
  }

  return (
    <div className="glass-panel" style={{ overflow: 'hidden' }}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Radio size={16} color="#10b981" />
          <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#fff' }}>Direct Billing System Outbound Feeds</h3>
        </div>
        <span className="badge-tag badge-emerald">HMAC-SHA256 Signed</span>
      </div>

      <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
        {webhookLogs.map((log) => (
          <div
            key={log.id}
            style={{
              padding: '14px 20px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span className="badge-tag badge-violet" style={{ fontSize: '10px' }}>
                  {log.provider}
                </span>
                <strong style={{ fontSize: '13px', color: '#f8fafc' }}>
                  {log.customer} &ndash; {log.invoiceNumber}
                </strong>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-subtle)', fontFamily: 'var(--font-mono)' }}>
                Signature: {log.signature} &bull; Latency: {log.responseTimeMs}ms
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '14px', fontWeight: '700', color: '#10b981', fontFamily: 'var(--font-mono)' }}>
                {formatCurrency(log.totalAmount, log.currency)}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#34d399', justifyContent: 'flex-end', marginTop: '2px' }}>
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
