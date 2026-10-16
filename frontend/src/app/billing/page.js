'use client';

import { useState, useEffect, useCallback } from 'react';
import Header from '@/components/layout/Header';
import InvoiceList from '@/components/billing/InvoiceList';
import WebhookFeedLog from '@/components/billing/WebhookFeedLog';
import { api } from '@/services/api';
import { FileText, Radio, Send, RefreshCw } from 'lucide-react';

export default function BillingPage() {
  const [invoices, setInvoices] = useState([]);
  const [webhooks, setWebhooks] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadBillingData = useCallback(async () => {
    try {
      const [invRes, whRes] = await Promise.all([
        api.getInvoices().catch(() => ({ data: [] })),
        api.getWebhookLogs().catch(() => ({ data: [] }))
      ]);

      if (invRes.data) setInvoices(invRes.data);
      if (whRes.data) setWebhooks(whRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBillingData();

    let eventSource;
    try {
      eventSource = api.createEventSource();
      eventSource.onmessage = (e) => {
        try {
          const payload = JSON.parse(e.data);
          if (payload.type === 'INVOICE_GENERATED' || payload.type === 'BILLING_FEED_SYNCED') {
            loadBillingData();
          }
        } catch (err) {
          console.error(err);
        }
      };
    } catch (err) {
      console.warn(err);
    }

    const interval = setInterval(loadBillingData, 4000);
    return () => {
      if (eventSource) eventSource.close();
      clearInterval(interval);
    };
  }, [loadBillingData]);

  return (
    <div>
      <Header
        title="Invoices & Billing System Feeds"
        subtitle="Itemized customer invoices and automated webhook feeds into Stripe, NetSuite & external ERPs"
        onRefresh={loadBillingData}
      />

      <main className="page-container">
        {/* Invoices Section */}
        <div style={{ marginBottom: '36px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={18} color="#10b981" />
              <h2 style={{ fontSize: '16px', fontWeight: '800', color: '#fff' }}>
                Generated Customer Invoices ({invoices.length})
              </h2>
            </div>
            <button
              onClick={loadBillingData}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-subtle)',
                color: '#fff',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              <RefreshCw size={12} />
              <span>Refresh</span>
            </button>
          </div>

          <InvoiceList invoices={invoices} />
        </div>

        {/* Webhook Audit Log Section */}
        <div>
          <WebhookFeedLog webhookLogs={webhooks} />
        </div>
      </main>
    </div>
  );
}
