'use client';

import { useState, useEffect, useCallback } from 'react';
import Header from '@/components/layout/Header';
import InvoiceList from '@/components/billing/InvoiceList';
import WebhookFeedLog from '@/components/billing/WebhookFeedLog';
import Pagination from '@/components/common/Pagination';
import { api } from '@/services/api';
import { FileText, RefreshCw, Radio } from 'lucide-react';

export default function BillingPage() {
  const [invoices, setInvoices] = useState([]);
  const [webhooks, setWebhooks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Invoices pagination state
  const [invoicePage, setInvoicePage] = useState(1);
  const [invoiceLimit] = useState(5);
  const [invoicePagination, setInvoicePagination] = useState({ total: 0, totalPages: 1 });

  // Webhooks pagination state
  const [webhookPage, setWebhookPage] = useState(1);
  const [webhookLimit] = useState(5);
  const [webhookPagination, setWebhookPagination] = useState({ total: 0, totalPages: 1 });

  const loadInvoices = useCallback(async (targetPage = invoicePage) => {
    try {
      const res = await api.getInvoices(null, targetPage, invoiceLimit);
      if (res && res.data) {
        setInvoices(res.data);
        if (res.pagination) {
          setInvoicePagination({
            total: res.pagination.total ?? res.data.length,
            totalPages: res.pagination.totalPages ?? 1,
            page: res.pagination.page ?? targetPage,
            limit: res.pagination.limit ?? invoiceLimit
          });
        }
      }
    } catch (err) {
      console.error('Failed to load invoices:', err);
    }
  }, [invoicePage, invoiceLimit]);

  const loadWebhooks = useCallback(async (targetPage = webhookPage) => {
    try {
      const res = await api.getWebhookLogs(targetPage, webhookLimit);
      if (res && res.data) {
        setWebhooks(res.data);
        if (res.pagination) {
          setWebhookPagination({
            total: res.pagination.total ?? res.data.length,
            totalPages: res.pagination.totalPages ?? 1,
            page: res.pagination.page ?? targetPage,
            limit: res.pagination.limit ?? webhookLimit
          });
        }
      }
    } catch (err) {
      console.error('Failed to load webhooks:', err);
    }
  }, [webhookPage, webhookLimit]);

  const loadBillingData = useCallback(async () => {
    setLoading(true);
    await Promise.all([loadInvoices(invoicePage), loadWebhooks(webhookPage)]);
    setLoading(false);
  }, [loadInvoices, loadWebhooks, invoicePage, webhookPage]);

  useEffect(() => {
    loadBillingData();

    let eventSource;
    try {
      eventSource = api.createEventSource();
      eventSource.onmessage = (e) => {
        try {
          const payload = JSON.parse(e.data);
          if (payload.type === 'INVOICE_GENERATED' || payload.type === 'BILLING_FEED_SYNCED') {
            loadInvoices(invoicePage);
            loadWebhooks(webhookPage);
          }
        } catch (err) {
          console.error(err);
        }
      };
    } catch (err) {
      console.warn(err);
    }

    const interval = setInterval(() => {
      loadInvoices(invoicePage);
      loadWebhooks(webhookPage);
    }, 5000);

    return () => {
      if (eventSource) eventSource.close();
      clearInterval(interval);
    };
  }, [invoicePage, webhookPage, loadInvoices, loadWebhooks, loadBillingData]);

  const handleInvoicePageChange = (newPage) => {
    setInvoicePage(newPage);
    loadInvoices(newPage);
  };

  const handleWebhookPageChange = (newPage) => {
    setWebhookPage(newPage);
    loadWebhooks(newPage);
  };

  return (
    <div className="w-full min-h-screen">
      <Header
        title="Invoices & Billing System Feeds"
        subtitle="Itemized customer invoices and automated webhook feeds into Stripe, NetSuite & external ERPs"
        onRefresh={loadBillingData}
      />

      <main className="page-container w-full max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Invoices Section */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <FileText size={18} className="text-emerald-400" />
              <h2 className="text-base sm:text-lg font-extrabold text-[var(--text-heading)]">
                Generated Customer Invoices ({invoicePagination.total || invoices.length})
              </h2>
            </div>
            <button
              onClick={() => loadInvoices(invoicePage)}
              className="flex items-center gap-1.5 bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-[var(--border-medium)] text-[var(--text-heading)] px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer transition-all"
            >
              <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>
          </div>

          <InvoiceList invoices={invoices} />

          <Pagination
            page={invoicePage}
            totalPages={invoicePagination.totalPages}
            total={invoicePagination.total}
            limit={invoiceLimit}
            onPageChange={handleInvoicePageChange}
          />
        </section>

        {/* Webhook Audit Log Section */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <Radio size={18} className="text-cyan-400" />
              <h2 className="text-base sm:text-lg font-extrabold text-[var(--text-heading)]">
                Outbound Webhook Feeds & Audits ({webhookPagination.total || webhooks.length})
              </h2>
            </div>
            <button
              onClick={() => loadWebhooks(webhookPage)}
              className="flex items-center gap-1.5 bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-[var(--border-medium)] text-[var(--text-heading)] px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer transition-all"
            >
              <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>
          </div>

          <WebhookFeedLog webhookLogs={webhooks} />

          <Pagination
            page={webhookPage}
            totalPages={webhookPagination.totalPages}
            total={webhookPagination.total}
            limit={webhookLimit}
            onPageChange={handleWebhookPageChange}
          />
        </section>
      </main>
    </div>
  );
}
