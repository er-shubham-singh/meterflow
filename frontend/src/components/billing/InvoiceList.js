'use client';

import { FileText, ExternalLink, CheckCircle } from 'lucide-react';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { api } from '@/services/api';

export default function InvoiceList({ invoices = [], onSelectInvoice }) {
  if (invoices.length === 0) {
    return (
      <div className="glass-panel p-10 text-center text-[var(--text-muted)] rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)]">
        No invoices generated yet. Click &quot;Bill Now&quot; on any customer or generate one below.
      </div>
    );
  }

  return (
    <div className="glass-panel overflow-hidden w-full min-w-0 max-w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)]">
      <div className="table-responsive w-full max-w-full min-w-0 overflow-x-auto">
        <table className="enterprise-table w-full">
          <thead>
            <tr>
              <th className="py-3 px-4 text-left font-semibold text-[var(--text-muted)] uppercase text-[11px] tracking-wider border-b border-[var(--border-subtle)] whitespace-nowrap">Invoice #</th>
              <th className="py-3 px-4 text-left font-semibold text-[var(--text-muted)] uppercase text-[11px] tracking-wider border-b border-[var(--border-subtle)] whitespace-nowrap">Customer</th>
              <th className="py-3 px-4 text-left font-semibold text-[var(--text-muted)] uppercase text-[11px] tracking-wider border-b border-[var(--border-subtle)] whitespace-nowrap">Billing Period</th>
              <th className="py-3 px-4 text-left font-semibold text-[var(--text-muted)] uppercase text-[11px] tracking-wider border-b border-[var(--border-subtle)] whitespace-nowrap">Line Items</th>
              <th className="py-3 px-4 text-left font-semibold text-[var(--text-muted)] uppercase text-[11px] tracking-wider border-b border-[var(--border-subtle)] whitespace-nowrap">Total Accrued</th>
              <th className="py-3 px-4 text-left font-semibold text-[var(--text-muted)] uppercase text-[11px] tracking-wider border-b border-[var(--border-subtle)] whitespace-nowrap">Billing Sync</th>
              <th className="py-3 px-4 text-right font-semibold text-[var(--text-muted)] uppercase text-[11px] tracking-wider border-b border-[var(--border-subtle)] whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <tr key={inv.id} className="transition-colors hover:bg-[var(--bg-hover-subtle)] border-b border-[var(--border-subtle)]">
                <td className="py-3 px-4 font-mono font-bold text-indigo-400 whitespace-nowrap text-xs">
                  {inv.invoiceNumber}
                </td>
                <td className="py-3 px-4 font-semibold text-[var(--text-heading)] whitespace-nowrap text-sm">
                  {inv.customerName}
                </td>
                <td className="py-3 px-4 text-xs text-[var(--text-subtle)] whitespace-nowrap">
                  {formatDate(inv.periodStart)} – {formatDate(inv.periodEnd)}
                </td>
                <td className="py-3 px-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                    {inv.lineItems?.length || 0} meters
                  </span>
                </td>
                <td className="py-3 px-4 font-bold text-emerald-400 font-mono text-sm whitespace-nowrap">
                  {formatCurrency(inv.total, 'INR')}
                </td>
                <td className="py-3 px-4 whitespace-nowrap">
                  <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
                    <CheckCircle size={13} className="text-emerald-400" />
                    <span>Synced to Stripe</span>
                  </span>
                </td>
                <td className="py-3 px-4 text-right whitespace-nowrap">
                  <a
                    href={api.getInvoiceHtmlUrl(inv.id)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] hover:border-[var(--border-medium)] text-[var(--text-heading)] px-3 py-1.5 rounded-md text-xs font-semibold transition-all hover:shadow-sm"
                  >
                    <FileText size={12} />
                    <span>Print View</span>
                    <ExternalLink size={10} className="text-[var(--text-muted)]" />
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
