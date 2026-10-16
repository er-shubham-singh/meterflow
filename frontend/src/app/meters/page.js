'use client';

import { useState, useEffect, useCallback } from 'react';
import Header from '@/components/layout/Header';
import MeterCard from '@/components/meters/MeterCard';
import CreateMeterModal from '@/components/meters/CreateMeterModal';
import { api } from '@/services/api';
import { Plus, Layers, Sparkles } from 'lucide-react';

export default function MetersPage() {
  const [meters, setMeters] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadMeters = useCallback(async () => {
    try {
      const res = await api.getMeters();
      if (res.data) setMeters(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMeters();
    const interval = setInterval(loadMeters, 3000);
    return () => clearInterval(interval);
  }, [loadMeters]);

  const handleDeleteMeter = async (meterId) => {
    if (!confirm('Are you sure you want to delete this meter?')) return;
    try {
      await api.deleteMeter(meterId);
      loadMeters();
    } catch (err) {
      alert('Error deleting meter: ' + err.message);
    }
  };

  return (
    <div>
      <Header
        title="Consumption Meters & Aggregation Formulas"
        subtitle="Define how high-throughput API events are aggregated into billable usage metrics"
        onRefresh={loadMeters}
      />

      <main className="page-container">
        {/* Banner with Action */}
        <div className="glass-panel" style={{
          padding: '24px 28px',
          marginBottom: '28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(99, 102, 241, 0.08) 100%)',
          border: '1px solid rgba(16, 185, 129, 0.2)'
        }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#fff', marginBottom: '4px' }}>
              Real-time Sliding Window Aggregations
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Supports SUM (tokens, compute runtime), MAX (peak storage), UNIQUE_COUNT (MAU users), and COUNT.
            </p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            style={{
              background: '#10b981',
              color: '#022c22',
              fontWeight: '700',
              padding: '10px 18px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '13px'
            }}
          >
            <Plus size={16} />
            <span>Define New Meter</span>
          </button>
        </div>

        {/* Meters Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: '24px'
        }}>
          {meters.map((meter) => (
            <MeterCard
              key={meter.id}
              meter={meter}
              onDelete={handleDeleteMeter}
            />
          ))}
        </div>
      </main>

      {showCreateModal && (
        <CreateMeterModal
          onClose={() => setShowCreateModal(false)}
          onCreated={loadMeters}
        />
      )}
    </div>
  );
}
