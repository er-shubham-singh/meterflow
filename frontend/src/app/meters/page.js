'use client';

import { useState, useEffect, useCallback } from 'react';
import Header from '@/components/layout/Header';
import MeterCard from '@/components/meters/MeterCard';
import CreateMeterModal from '@/components/meters/CreateMeterModal';
import Pagination from '@/components/common/Pagination';
import { api } from '@/services/api';
import { Plus } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

export default function MetersPage() {
  const { showToast, showConfirm } = useToast();
  const [meters, setMeters] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(6);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });

  const loadMeters = useCallback(async (targetPage = page) => {
    try {
      const res = await api.getMeters(targetPage, limit);
      if (res && res.data) {
        setMeters(res.data);
        if (res.pagination) {
          setPagination({
            total: res.pagination.total ?? res.data.length,
            totalPages: res.pagination.totalPages ?? 1,
            page: res.pagination.page ?? targetPage,
            limit: res.pagination.limit ?? limit
          });
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  useEffect(() => {
    loadMeters(page);
    const interval = setInterval(() => {
      loadMeters(page);
    }, 4000);
    return () => clearInterval(interval);
  }, [page, loadMeters]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
    loadMeters(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteMeter = async (meterId) => {
    const confirmed = await showConfirm({
      title: 'Delete Consumption Meter',
      message: 'Are you sure you want to delete this meter? Historical events mapped to this meter may be affected.',
      confirmText: 'Delete Meter',
      isDestructive: true
    });
    if (!confirmed) return;
    try {
      await api.deleteMeter(meterId);
      showToast('Consumption meter deleted', 'success');
      loadMeters(page);
    } catch (err) {
      showToast('Error deleting meter: ' + err.message, 'error');
    }
  };

  return (
    <div className="w-full min-h-screen">
      <Header
        title="Consumption Meters & Aggregation Formulas"
        subtitle="Define how high-throughput API events are aggregated into billable usage metrics"
        onRefresh={() => loadMeters(page)}
      />

      <main className="page-container w-full max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Banner with Action */}
        <div className="glass-panel p-6 sm:p-7 mb-7 flex items-center justify-between flex-wrap gap-4 rounded-xl border border-emerald-500/25 bg-gradient-to-br from-emerald-500/10 via-transparent to-indigo-500/10">
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-[var(--text-heading)] mb-1">
              Real-time Sliding Window Aggregations
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-muted)]">
              Supports SUM (tokens, compute runtime), MAX (peak storage), UNIQUE_COUNT (MAU users), and COUNT.
            </p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-3 px-5 min-h-[44px] rounded-xl cursor-pointer flex items-center gap-2 text-xs sm:text-sm transition-all shadow-md shadow-emerald-500/20 shrink-0"
          >
            <Plus size={16} />
            <span>Define New Meter</span>
          </button>
        </div>

        {/* Meters Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {meters.map((meter) => (
            <MeterCard
              key={meter.id}
              meter={meter}
              onDelete={handleDeleteMeter}
            />
          ))}
        </div>

        {/* Pagination */}
        <Pagination
          page={page}
          totalPages={pagination.totalPages}
          total={pagination.total}
          limit={limit}
          onPageChange={handlePageChange}
        />
      </main>

      {showCreateModal && (
        <CreateMeterModal
          onClose={() => setShowCreateModal(false)}
          onCreated={() => loadMeters(page)}
        />
      )}
    </div>
  );
}
