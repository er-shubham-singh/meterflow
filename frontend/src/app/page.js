'use client';

import { useState, useEffect, useCallback } from 'react';
import Header from '@/components/layout/Header';
import MetricsOverview from '@/components/dashboard/MetricsOverview';
import ThroughputChart from '@/components/dashboard/ThroughputChart';
import LiveEventTable from '@/components/events/LiveEventTable';
import CustomerCard from '@/components/customers/CustomerCard';
import EventPayloadModal from '@/components/events/EventPayloadModal';
import CustomerDetailModal from '@/components/customers/CustomerDetailModal';
import { api } from '@/services/api';
import { Layers, Activity, Users, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const [telemetry, setTelemetry] = useState(null);
  const [meters, setMeters] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [recentEvents, setRecentEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [telRes, metRes, custRes, evtRes] = await Promise.all([
        api.getTelemetry().catch(() => ({ telemetry: {} })),
        api.getMeters().catch(() => ({ data: [] })),
        api.getCustomers().catch(() => ({ data: [] })),
        api.getRecentEvents(15).catch(() => ({ data: [] }))
      ]);

      if (telRes.telemetry) setTelemetry(telRes.telemetry);
      if (metRes.data) setMeters(metRes.data);
      if (custRes.data) setCustomers(custRes.data);
      if (evtRes.data) setRecentEvents(evtRes.data);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();

    // Listen to real-time events via Server-Sent Events (SSE)
    let eventSource;
    try {
      eventSource = api.createEventSource();
      eventSource.onmessage = (e) => {
        try {
          const payload = JSON.parse(e.data);
          if (payload.type === 'EVENT_INGESTED' && payload.event) {
            setRecentEvents((prev) => [payload.event, ...prev.slice(0, 14)]);
          } else if (payload.type === 'USAGE_RESET') {
            loadData();
          }
        } catch (err) {
          console.error('SSE parse error:', err);
        }
      };
    } catch (err) {
      console.warn('SSE connection fallback to polling:', err);
    }

    const interval = setInterval(loadData, 4000);

    return () => {
      if (eventSource) eventSource.close();
      clearInterval(interval);
    };
  }, [loadData]);

  const totalRevenue = customers.reduce((acc, c) => acc + (c.currentTotalAccrued || 0), 0);

  const handleGenerateInvoice = async (customerId) => {
    try {
      await api.generateInvoice(customerId);
      alert('Invoice generated and webhook dispatched to Stripe Billing!');
      loadData();
    } catch (err) {
      alert('Error generating invoice: ' + err.message);
    }
  };

  return (
    <div className="w-full min-h-screen">
      <Header
        title="Metering Engine Overview"
        subtitle="High-throughput API event listener & complex consumption calculator"
        onRefresh={loadData}
      />

      <main className="page-container">
        {/* KPI Stat Cards */}
        <MetricsOverview
          telemetry={telemetry}
          metersCount={meters.length}
          totalAccruedRevenue={totalRevenue}
          customersCount={customers.length}
        />

        {/* Throughput Histogram */}
        <ThroughputChart throughputHistory={telemetry?.throughputHistory || []} />

        {/* Two-Column Grid: Customers Usage & Live Event Stream */}
        <div className="dashboard-grid w-full min-w-0 max-w-full">
          {/* Customer Usage Accounts */}
          <div className="live-accounts-column w-full min-w-0 max-w-full">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Users size={18} className="text-cyan-400" />
                <h2 className="text-sm sm:text-base font-bold text-[var(--text-heading)]">
                  Live Accounts & Accrued Usage
                </h2>
              </div>
              <Link
                href="/customers"
                className="text-xs text-emerald-400 hover:text-emerald-300 no-underline flex items-center gap-1 font-semibold transition-colors"
              >
                <span>View All ({customers.length})</span>
                <ArrowRight size={12} />
              </Link>
            </div>

            <div className="flex flex-col gap-4 w-full min-w-0 max-w-full">
              {customers.slice(0, 3).map((cust) => (
                <CustomerCard
                  key={cust.id}
                  customer={cust}
                  onSelect={(c) => setSelectedCustomer(c)}
                  onGenerateInvoice={handleGenerateInvoice}
                />
              ))}
            </div>
          </div>

          {/* Live Ingestion Stream Preview */}
          <div className="live-stream-column w-full min-w-0 max-w-full">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Activity size={18} className="text-emerald-400" />
                <h2 className="text-sm sm:text-base font-bold text-[var(--text-heading)]">
                  Live Ingestion Stream
                </h2>
              </div>
              <Link
                href="/events"
                className="text-xs text-emerald-400 hover:text-emerald-300 no-underline flex items-center gap-1 font-semibold transition-colors"
              >
                <span>Full Telemetry Stream</span>
                <ArrowRight size={12} />
              </Link>
            </div>

            <LiveEventTable
              events={recentEvents}
              onInspectEvent={(evt) => setSelectedEvent(evt)}
            />
          </div>
        </div>
      </main>

      {/* Modals */}
      {selectedEvent && (
        <EventPayloadModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}

      {selectedCustomer && (
        <CustomerDetailModal
          customer={selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
          onInvoiceGenerated={() => {
            loadData();
            setSelectedCustomer(null);
          }}
        />
      )}
    </div>
  );
}
