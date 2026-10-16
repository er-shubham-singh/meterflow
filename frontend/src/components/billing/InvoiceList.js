'use client';

import { FileText, ExternalLink, CheckCircle } from 'lucide-react';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { api } from '@/services/api';

export default function InvoiceList({ invoices = [], onSelectInvoice }) {
  if (invoices.length === 0) {
    return (
      <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
        No invoices generated yet. Click &quot;Bill Now&quot; on any customer or generate one below.
      </div>
    );
  }

  return (
    <div className="glass-panel" style={{ overflow: 'hidden' }}>
      <table className="enterprise-table">
        <thead>
          <tr>
            <th>Invoice #</th>
            <th>Customer</th>
            <th>Billing Period</th>
            <th>Line Items</th>
            <th>Total Accrued</th>
            <th>Billing Sync</th>
            <th style={{ textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((inv) => (
            <tr key={inv.id}>
              <td style={{ fontFamily: 'var(--font-mono)', fontWeight: '700', color: '#818cf8' }}>
                {inv.invoiceNumber}
              </td>
              <td style={{ fontWeight: '600', color: '#f8fafc' }}>
                {inv.customerName}
              </td>
              <td style={{ fontSize: '12px', color: 'var(--text-subtle)' }}>
                {formatDate(inv.periodStart)} – {formatDate(inv.periodEnd)}
              </td>
              <td>
                <span className="badge-tag badge-cyan">
                  {inv.lineItems?.length || 0} meters
                </span>
              </td>
              <td style={{ fontWeight: '700', color: '#10b981', fontFamily: 'var(--font-mono)', fontSize: '14px' }}>
                {formatCurrency(inv.total, inv.currency)}
              </td>
              <td>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '11px',
                  color: '#34d399',
                  fontWeight: '600'
                }}>
                  <CheckCircle size={12} color="#10b981" />
                  Synced to Stripe
                </span>
              </td>
              <td style={{ textAlign: 'right' }}>
                <a
                  href={api.getInvoiceHtmlUrl(inv.id)}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--border-subtle)',
                    color: '#cbd5e1',
                    padding: '5px 10px',
                    borderRadius: '6px',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '11px',
                    fontWeight: '600'
                  }}
                >
                  <FileText size={12} />
                  <span>Print View</span>
                  <ExternalLink size={10} />
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
