'use client';

import { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { X, FileText, ExternalLink, ShieldCheck } from 'lucide-react';
import { formatCurrency, formatCompactNumber } from '@/utils/formatters';

export default function CustomerDetailModal({ customer, onClose, onInvoiceGenerated }) {
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
      if (onInvoiceGenerated) onInvoiceGenerated(res.data);
      onClose();
    } catch (err) {
      alert('Error generating invoice: ' + err.message);
    } finally {
      setInvoicing(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '20px'
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '720px',
        background: '#0d131f',
        border: '1px solid var(--border-medium)',
        borderRadius: '16px',
        padding: '28px',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#fff' }}>
                {customer.company || customer.name}
              </h2>
              <span className="badge-tag badge-emerald">{customer.planName || 'Enterprise'}</span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
              Account: <code style={{ color: '#818cf8' }}>{customer.id}</code> &bull; Email: {customer.email}
            </p>
          </div>

          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Calculating consumption metrics...
          </div>
        ) : usageData ? (
          <div>
            {/* Total Accrual Summary */}
            <div style={{
              background: 'rgba(15, 23, 42, 0.7)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-subtle)', textTransform: 'uppercase', fontWeight: '600' }}>
                  Total Accrued (Current Cycle)
                </span>
                <div style={{ fontSize: '32px', fontWeight: '800', color: '#10b981', fontFamily: 'var(--font-mono)' }}>
                  {formatCurrency(usageData.financialSummary?.totalAccrued, usageData.plan?.currency)}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Base Plan: {formatCurrency(usageData.financialSummary?.baseFee)} + Usage: {formatCurrency(usageData.financialSummary?.usageCost)}
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-subtle)', textTransform: 'uppercase', fontWeight: '600' }}>
                  Budget Utilization
                </span>
                <div style={{ fontSize: '22px', fontWeight: '700', color: '#f8fafc', marginTop: '2px' }}>
                  {usageData.financialSummary?.percentOfBudget}%
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  Cap: {formatCurrency(customer.budgetLimit)}
                </div>
              </div>
            </div>

            {/* Itemized Line Items */}
            <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#fff', marginBottom: '12px' }}>
              Metered Line Items & Tiers:
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
              {(usageData.metrics || []).map((m, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '12px 16px',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <strong style={{ fontSize: '13px', color: '#f8fafc' }}>{m.meterName}</strong>
                      <span className="badge-tag badge-cyan" style={{ fontSize: '9px', padding: '1px 5px' }}>
                        {m.pricingModel}
                      </span>
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-subtle)', marginTop: '3px' }}>
                      Raw: {m.quantity.toLocaleString()} {m.unit} &bull; Billable: {m.billableQuantity.toLocaleString()} {m.unit}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '15px', fontWeight: '700', color: '#10b981', fontFamily: 'var(--font-mono)' }}>
                      {formatCurrency(m.amount)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Action Bar */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
              <button
                onClick={onClose}
                style={{
                  padding: '10px 16px',
                  background: 'transparent',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-muted)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '13px'
                }}
              >
                Close
              </button>
              <button
                disabled={invoicing}
                onClick={handleGenerateInvoice}
                style={{
                  padding: '10px 20px',
                  background: '#10b981',
                  border: 'none',
                  color: '#022c22',
                  borderRadius: '8px',
                  fontWeight: '700',
                  fontSize: '13px',
                  cursor: invoicing ? 'wait' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <FileText size={16} />
                <span>{invoicing ? 'Syncing to Stripe...' : 'Finalize Invoice & Push Billing Feed'}</span>
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
