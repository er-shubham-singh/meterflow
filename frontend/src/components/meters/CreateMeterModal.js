'use client';

import { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { api } from '@/services/api';

export default function CreateMeterModal({ onClose, onCreated }) {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    eventType: 'ai.completion',
    aggregationType: 'SUM',
    valueProperty: 'tokens',
    unit: 'tokens',
    description: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.createMeter(formData);
      if (onCreated) onCreated();
      onClose();
    } catch (err) {
      alert('Error creating meter: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '16px'
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '520px',
        maxHeight: '90vh',
        overflowY: 'auto',
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-medium)',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: 'var(--shadow-lg)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-heading)' }}>Define Consumption Meter</h3>
          <button
            onClick={onClose}
            aria-label="Close modal"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '4px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>Meter Name</label>
            <input
              required
              type="text"
              style={{ width: '100%' }}
              placeholder="e.g. OpenAI Audio Seconds"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>Meter Code (Slug)</label>
              <input
                required
                type="text"
                style={{ width: '100%' }}
                placeholder="e.g. audio_seconds_sum"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>Event Type</label>
              <input
                required
                type="text"
                style={{ width: '100%' }}
                placeholder="e.g. audio.transcribe"
                value={formData.eventType}
                onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>Aggregation Type</label>
              <select
                style={{ width: '100%' }}
                value={formData.aggregationType}
                onChange={(e) => setFormData({ ...formData, aggregationType: e.target.value })}
              >
                <option value="SUM">SUM (Totals values)</option>
                <option value="COUNT">COUNT (Event instances)</option>
                <option value="MAX">MAX (Peak watermark)</option>
                <option value="UNIQUE_COUNT">UNIQUE_COUNT (Unique users/IPs)</option>
                <option value="WEIGHTED_AVG">WEIGHTED_AVG (Weighted average)</option>
                <option value="LATEST">LATEST (Most recent)</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>Target Property</label>
              <input
                required
                type="text"
                style={{ width: '100%' }}
                placeholder="e.g. seconds or tokens"
                value={formData.valueProperty}
                onChange={(e) => setFormData({ ...formData, valueProperty: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>Unit Label</label>
            <input
              type="text"
              style={{ width: '100%' }}
              placeholder="e.g. seconds, tokens, requests"
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>Description</label>
            <textarea
              rows={2}
              style={{ width: '100%', resize: 'vertical' }}
              placeholder="What does this meter measure?"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: '12px',
              background: 'var(--emerald-500)',
              color: '#ffffff',
              fontWeight: '700',
              padding: '12px',
              borderRadius: '8px',
              border: 'none',
              cursor: loading ? 'wait' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <Plus size={18} />
            <span>{loading ? 'Creating Meter...' : 'Create Meter'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
