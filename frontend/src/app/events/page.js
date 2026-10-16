'use client';

import { useState, useEffect, useCallback } from 'react';
import Header from '@/components/layout/Header';
import LiveEventTable from '@/components/events/LiveEventTable';
import EventPayloadModal from '@/components/events/EventPayloadModal';
import { api } from '@/services/api';
import { Filter, RefreshCw } from 'lucide-react';

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [filterType, setFilterType] = useState('ALL');
  const [loading, setLoading] = useState(true);

  const fetchEvents = useCallback(async () => {
    try {
      const res = await api.getRecentEvents(100);
      if (res.data) setEvents(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();

    let eventSource;
    try {
      eventSource = api.createEventSource();
      eventSource.onmessage = (e) => {
        try {
          const payload = JSON.parse(e.data);
          if (payload.type === 'EVENT_INGESTED' && payload.event) {
            setEvents((prev) => [payload.event, ...prev.slice(0, 99)]);
          } else if (payload.type === 'USAGE_RESET') {
            setEvents([]);
          }
        } catch (err) {
          console.error(err);
        }
      };
    } catch (err) {
      console.warn(err);
    }

    return () => {
      if (eventSource) eventSource.close();
    };
  }, [fetchEvents]);

  const filteredEvents = events.filter((e) => {
    if (filterType === 'ALL') return true;
    return e.eventType?.startsWith(filterType);
  });

  return (
    <div>
      <Header
        title="Live API Event Listener"
        subtitle="Real-time telemetry stream showing high-throughput raw API ingestion"
        onRefresh={fetchEvents}
      />

      <main className="page-container">
        {/* Controls bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <Filter size={16} color="var(--text-muted)" />
            <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '600' }}>Filter:</span>
            {['ALL', 'ai.', 'api.', 'cloud.', 'user.', 'storage.'].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                style={{
                  background: filterType === type ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-card)',
                  border: filterType === type ? '1px solid var(--emerald-500)' : '1px solid var(--border-subtle)',
                  color: filterType === type ? 'var(--emerald-400)' : 'var(--text-muted)',
                  padding: '5px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {type === 'ALL' ? 'All Events' : type.replace('.', '').toUpperCase()}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-subtle)' }}>
              Showing {filteredEvents.length} events
            </span>
            <button
              onClick={fetchEvents}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-main)',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <RefreshCw size={12} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Live Table */}
        <LiveEventTable
          events={filteredEvents}
          onInspectEvent={(evt) => setSelectedEvent(evt)}
        />
      </main>

      {selectedEvent && (
        <EventPayloadModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </div>
  );
}
