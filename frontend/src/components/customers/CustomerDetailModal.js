import { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { X, FileText, ExternalLink, ShieldCheck } from 'lucide-react';
import { formatCurrency, formatCompactNumber, formatMeterName } from '@/utils/formatters';
import { useToast } from '@/context/ToastContext';

export default function CustomerDetailModal({ customer, onClose, onInvoiceGenerated }) {
  const { showToast } = useToast();
  const [usageData, setUsageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [invoicing, setInvoicing] = useState(false);

  useEffect(() => {
    if (!customer) return;
    let isMounted = true;
    const fetchUsage = async () => {
      try {
        const res = await api.getCustomerUsage(customer.id);
        if (isMounted && res.data) {
          setUsageData(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchUsage();
    return () => { isMounted = false; };
  }, [customer]);

  if (!customer) return null;

  const handleGenerateInvoice = async () => {
    setInvoicing(true);
    try {
      const res = await api.generateInvoice(customer.id);
      showToast('Invoice generated and synced to billing feed!', 'success');
      if (onInvoiceGenerated) onInvoiceGenerated(res.data);
      onClose();
    } catch (err) {
      showToast('Error generating invoice: ' + err.message, 'error');
    } finally {
      setInvoicing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-panel w-full max-w-2xl bg-[var(--bg-secondary)] border border-[var(--border-medium)] rounded-2xl p-6 max-h-[80vh] overflow-y-auto shadow-2xl">
        <div className="flex items-start justify-between mb-5">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-[var(--text-heading)]">
                {customer.company || customer.name}
              </h2>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                {customer.planName || 'Enterprise'}
              </span>
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Account: <code className="text-indigo-400 font-mono">{customer.id}</code> &bull; Email: {customer.email}
            </p>
          </div>

          <button
            onClick={onClose}
            aria-label="Close modal"
            className="bg-transparent border-0 text-[var(--text-muted)] hover:text-[var(--text-heading)] cursor-pointer p-1 rounded-md transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {loading ? (
          <div className="p-10 text-center text-[var(--text-muted)] text-sm">
            Calculating consumption metrics...
          </div>
        ) : usageData ? (
          <div>
            {/* Total Accrual Summary */}
            <div className="bg-[var(--bg-inset)] border border-[var(--border-subtle)] rounded-xl p-5 mb-6 flex items-center justify-between flex-wrap gap-3">
              <div>
                <span className="text-[11px] text-[var(--text-subtle)] uppercase font-semibold">
                  Total Accrued (Current Cycle)
                </span>
                <div className="text-3xl font-extrabold text-emerald-400 font-mono mt-0.5">
                  {formatCurrency(usageData.financialSummary?.totalAccrued, 'INR')}
                </div>
                <div className="text-xs text-[var(--text-muted)] mt-0.5">
                  Base Plan: {formatCurrency(usageData.financialSummary?.baseFee)} + Usage: {formatCurrency(usageData.financialSummary?.usageCost)}
                </div>
              </div>

              <div className="text-right">
                <span className="text-[11px] text-[var(--text-subtle)] uppercase font-semibold">
                  Budget Utilization
                </span>
                <div className="text-xl font-bold text-[var(--text-heading)] mt-0.5">
                  {usageData.financialSummary?.percentOfBudget}%
                </div>
                <div className="text-[11px] text-[var(--text-muted)]">
                  Cap: {formatCurrency(customer.budgetLimit)}
                </div>
              </div>
            </div>

            {/* Itemized Line Items */}
            <h4 className="text-sm font-bold text-[var(--text-heading)] mb-3">
              Metered Line Items & Tiers:
            </h4>

            <div className="flex flex-col gap-2.5 mb-6">
              {(usageData.metrics || []).map((m, idx) => (
                <div
                  key={idx}
                  className="p-3 px-4 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-lg flex items-center justify-between hover:border-[var(--border-medium)] transition-all"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <strong className="text-xs sm:text-sm text-[var(--text-heading)] font-semibold">{formatMeterName(m.meterName)}</strong>
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                        {m.pricingModel}
                      </span>
                    </div>
                    <div className="text-[11px] text-[var(--text-subtle)] mt-1">
                      Raw: {m.quantity.toLocaleString()} {m.unit} &bull; Billable: {m.billableQuantity.toLocaleString()} {m.unit}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm sm:text-base font-bold text-emerald-400 font-mono">
                      {formatCurrency(m.amount)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Action Bar */}
            <div className="flex justify-end gap-3 border-t border-[var(--border-subtle)] pt-4 flex-wrap">
              <button
                onClick={onClose}
                className="px-4 py-2.5 min-h-[44px] bg-[var(--bg-card)] hover:bg-[var(--bg-hover-subtle)] border border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-heading)] rounded-lg text-xs font-semibold cursor-pointer transition-all"
              >
                Close
              </button>
              <button
                disabled={invoicing}
                onClick={handleGenerateInvoice}
                className="px-5 py-3 min-h-[44px] bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/20 cursor-pointer flex items-center gap-2 transition-all disabled:opacity-70 disabled:cursor-wait"
              >
                <FileText size={15} />
                <span>{invoicing ? 'Syncing to Stripe...' : 'Finalize Invoice & Push Billing Feed'}</span>
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
