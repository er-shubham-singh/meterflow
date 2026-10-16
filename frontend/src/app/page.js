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
    <div>
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
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '24px' }}>
          {/* Customer Usage Accounts */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={18} color="#38bdf8" />
                <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#fff' }}>
                  Live Accounts & Accrued Usage
                </h2>
              </div>
              <Link
                href="/customers"
                style={{
                  fontSize: '12px',
                  color: '#34d399',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontWeight: '600'
                }}
              >
                <span>View All ({customers.length})</span>
                <ArrowRight size={12} />
              </Link>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Activity size={18} color="#10b981" />
                <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#fff' }}>
                  Live Ingestion Stream
                </h2>
              </div>
              <Link
                href="/events"
                style={{
                  fontSize: '12px',
                  color: '#34d399',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontWeight: '600'
                }}
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
