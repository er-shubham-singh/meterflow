'use client';

import { FileText, ExternalLink, CheckCircle, Download, Calendar, Layers } from 'lucide-react';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { api } from '@/services/api';

/**
 * InvoiceList Component (FIGMA SPEC #02 & TICKET-02)
 * Replaces dense horizontal data tables on mobile (<768px) with stacked mobile cards
 * to prevent horizontal overflow and table clipping.
 * - Header Row: Invoice # (14px Bold) left, Status Pill right.
 * - Body Grid: 2-Column key-value layout for secondary details.
 * - Action Footer: Full-width touch-friendly buttons with min 44px height.
 */
export default function InvoiceList({ invoices = [], onSelectInvoice }) {
  if (invoices.length === 0) {
    return (
      <div className="glass-panel p-10 text-center text-[var(--text-muted)] rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)]">
        No invoices generated yet. Click &quot;Bill Now&quot; on any customer or generate one below.
      </div>
    );
  }

  const handleExportCsv = (inv) => {
    const headers = "InvoiceNumber,Customer,PeriodStart,PeriodEnd,Total_INR,Status\n";
    const row = `"${inv.invoiceNumber}","${inv.customerName}","${inv.periodStart}","${inv.periodEnd}",${inv.total},"Synced to Stripe"\n`;
    const blob = new Blob([headers + row], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${inv.invoiceNumber || 'invoice'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full min-w-0 max-w-full">
      {/* Mobile Stacked Cards Layout (<768px viewports) */}
      <div className="block md:hidden space-y-3.5" data-testid="mobile-invoices-cards">
        {invoices.map((inv) => (
          <div
            key={inv.id}
            className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-4 shadow-sm flex flex-col gap-3 transition-all"
          >
            {/* Header Row: Identifier Left (14px Bold), Status Pill Right */}
            <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-[var(--border-subtle)]">
              <div className="flex items-center gap-2 min-w-0">
                <FileText size={16} className="text-indigo-400 shrink-0" />
                <span className="font-mono font-bold text-sm text-indigo-400 truncate">
                  {inv.invoiceNumber}
                </span>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shrink-0">
                <CheckCircle size={12} className="text-emerald-400" />
                <span>Synced to Stripe</span>
              </span>
            </div>

            {/* Body Grid: 2-Column Key-Value Layout */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-[11px] font-medium text-[var(--text-muted)] block uppercase tracking-wider">
                  Customer
                </span>
                <span className="font-bold text-[var(--text-heading)] text-sm truncate block mt-0.5">
                  {inv.customerName}
                </span>
                <div className="mt-2">
                  <span className="text-[11px] font-medium text-[var(--text-muted)] block uppercase tracking-wider">
                    Line Items
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 mt-0.5">
                    <Layers size={11} />
                    {inv.lineItems?.length || 0} meters
                  </span>
                </div>
              </div>

              <div>
                <span className="text-[11px] font-medium text-[var(--text-muted)] block uppercase tracking-wider">
                  Total Accrued
                </span>
                <span className="font-extrabold text-emerald-400 font-mono text-base block mt-0.5">
                  {formatCurrency(inv.total, 'INR')}
                </span>
                <div className="mt-2">
                  <span className="text-[11px] font-medium text-[var(--text-muted)] block uppercase tracking-wider">
                    Billing Period
                  </span>
                  <span className="text-[11px] text-[var(--text-subtle)] flex items-center gap-1 mt-0.5">
                    <Calendar size={11} className="text-slate-400 shrink-0" />
                    <span>{formatDate(inv.periodStart)} – {formatDate(inv.periodEnd)}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Action Footer: Touch-Friendly Buttons (Min Height 44px) */}
            <div className="pt-2 border-t border-[var(--border-subtle)] flex flex-col sm:flex-row gap-2 mt-1">
              <a
                href={api.getInvoiceHtmlUrl(inv.id)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full min-h-[44px] flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all active:scale-[0.98] no-underline"
              >
                <FileText size={14} />
                <span>Open Print View</span>
                <ExternalLink size={12} className="opacity-80" />
              </a>
              <button
                onClick={() => handleExportCsv(inv)}
                className="w-full min-h-[44px] flex items-center justify-center gap-2 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] hover:border-[var(--border-medium)] text-[var(--text-heading)] font-semibold text-xs rounded-xl transition-all active:scale-[0.98] cursor-pointer"
              >
                <Download size={14} className="text-slate-400" />
                <span>Download CSV</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Dense Table Layout (md: and above) */}
      <div className="hidden md:block glass-panel overflow-hidden w-full min-w-0 max-w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)]">
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
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleExportCsv(inv)}
                        title="Download Invoice CSV"
                        className="inline-flex items-center gap-1 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] hover:border-[var(--border-medium)] text-[var(--text-muted)] hover:text-[var(--text-heading)] px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer"
                      >
                        <Download size={11} />
                        <span className="hidden sm:inline">CSV</span>
                      </button>
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
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
