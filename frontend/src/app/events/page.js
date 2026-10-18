'use client';

import { useState, useEffect, useCallback } from 'react';
import Header from '@/components/layout/Header';
import LiveEventTable from '@/components/events/LiveEventTable';
import EventPayloadModal from '@/components/events/EventPayloadModal';
import Pagination from '@/components/common/Pagination';
import { api } from '@/services/api';
import { Filter, RefreshCw, Radio, Pause, Play } from 'lucide-react';

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [filterType, setFilterType] = useState('ALL');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(15);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [pausedBufferCount, setPausedBufferCount] = useState(0);

  const fetchEvents = useCallback(async (targetPage = page, type = filterType) => {
    try {
      setLoading(true);
      const res = await api.getRecentEvents(limit, targetPage, null, type === 'ALL' ? null : type);
      if (res && res.data) {
        setEvents(res.data);
        setPagination({
          total: res.pagination?.total ?? res.total ?? res.data.length,
          totalPages: res.pagination?.totalPages ?? res.totalPages ?? 1,
          page: res.pagination?.page ?? res.page ?? targetPage,
          limit: res.pagination?.limit ?? res.limit ?? limit
        });
      }
    } catch (err) {
      console.error('Failed to fetch events:', err);
    } finally {
      setLoading(false);
    }
  }, [page, limit, filterType]);

  useEffect(() => {
    fetchEvents(page, filterType);

    let eventSource;
    try {
      eventSource = api.createEventSource();
      eventSource.onmessage = (e) => {
        try {
          const payload = JSON.parse(e.data);
          if (payload.type === 'EVENT_INGESTED' && payload.event) {
            if (isPaused) {
              setPausedBufferCount((c) => c + 1);
              return;
            }

            setPagination((prev) => {
              const newTotal = prev.total + 1;
              return {
                ...prev,
                total: newTotal,
                totalPages: Math.max(1, Math.ceil(newTotal / limit))
              };
            });

            // If we are on page 1 and the event passes the filter, prepend it
            if (page === 1) {
              const matchesFilter = filterType === 'ALL' || payload.event.eventType?.startsWith(filterType);
              if (matchesFilter) {
                setEvents((prev) => [payload.event, ...prev.slice(0, limit - 1)]);
              }
            }
          } else if (payload.type === 'USAGE_RESET') {
            setEvents([]);
            setPagination({ total: 0, totalPages: 1 });
            setPausedBufferCount(0);
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
  }, [page, limit, filterType, fetchEvents, isPaused]);

  const handleTogglePause = () => {
    if (isPaused) {
      setIsPaused(false);
      setPausedBufferCount(0);
      fetchEvents(page, filterType);
    } else {
      setIsPaused(true);
    }
  };

  const handleFilterChange = (type) => {
    setFilterType(type);
    setPage(1);
    fetchEvents(1, type);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    fetchEvents(newPage, filterType);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="w-full min-h-screen">
      <Header
        title="Live API Event Listener"
        subtitle="Real-time telemetry stream showing high-throughput raw API ingestion with paginated history"
        onRefresh={() => fetchEvents(page, filterType)}
      />

      <main className="page-container w-full max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Controls bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-5 gap-3 flex-wrap bg-[var(--bg-card)] border border-[var(--border-subtle)] p-3.5 rounded-xl">
          <div className="flex items-center gap-2 flex-wrap">
            <Filter size={15} className="text-[var(--text-muted)]" />
            <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mr-1">Filter:</span>
            {['ALL', 'ai.', 'api.', 'cloud.', 'user.', 'storage.'].map((type) => {
              const isActive = filterType === type;
              return (
                <button
                  key={type}
                  onClick={() => handleFilterChange(type)}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 font-bold shadow-sm'
                      : 'bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-heading)] hover:border-[var(--border-medium)]'
                  }`}
                >
                  {type === 'ALL' ? 'All Events' : type.replace('.', '').toUpperCase()}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2.5 self-end sm:self-auto flex-wrap">
            {/* Pause / Resume Controls (P3.1) */}
            <button
              onClick={handleTogglePause}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer border ${
                isPaused
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                  : 'bg-[var(--bg-secondary)] text-[var(--text-heading)] border-[var(--border-subtle)] hover:border-[var(--border-medium)]'
              }`}
              title={isPaused ? 'Resume live stream' : 'Pause live stream to inspect events'}
            >
              {isPaused ? <Play size={12} className="text-amber-300" /> : <Pause size={12} className="text-slate-400" />}
              <span>{isPaused ? `Resume (${pausedBufferCount} buffered)` : 'Pause Stream'}</span>
            </button>

            <div className="flex items-center gap-1.5 text-xs text-[var(--text-subtle)] bg-[var(--bg-secondary)] px-2.5 py-1.5 rounded-md border border-[var(--border-subtle)]">
              <Radio size={12} className={isPaused ? 'text-amber-400' : 'text-emerald-400 animate-pulse'} />
              <span>{isPaused ? 'Stream Paused' : 'Live Ingest'}</span>
            </div>
            <button
              onClick={() => fetchEvents(page, filterType)}
              className="flex items-center gap-1.5 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] hover:border-[var(--border-medium)] text-[var(--text-heading)] px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer"
            >
              <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Live Table */}
        <LiveEventTable
          events={events}
          onInspectEvent={(evt) => setSelectedEvent(evt)}
        />

        {/* Pagination */}
        <Pagination
          page={page}
          totalPages={pagination.totalPages}
          total={pagination.total}
          limit={limit}
          onPageChange={handlePageChange}
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
