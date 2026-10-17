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
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-panel w-full max-w-lg max-h-[90vh] overflow-y-auto bg-[var(--bg-secondary)] border border-[var(--border-medium)] rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-[var(--text-heading)]">Define Consumption Meter</h3>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="bg-transparent border-0 text-[var(--text-muted)] hover:text-[var(--text-heading)] cursor-pointer p-1 rounded-md transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1.5">Meter Name</label>
            <input
              required
              type="text"
              className="w-full px-3 py-2 bg-[var(--bg-card)] border border-[var(--border-subtle)] focus:border-emerald-500 rounded-lg text-sm text-[var(--text-heading)] outline-none"
              placeholder="e.g. OpenAI Audio Seconds"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1.5">Meter Code (Slug)</label>
              <input
                required
                type="text"
                className="w-full px-3 py-2 bg-[var(--bg-card)] border border-[var(--border-subtle)] focus:border-emerald-500 rounded-lg text-sm text-[var(--text-heading)] outline-none font-mono"
                placeholder="e.g. audio_seconds_sum"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1.5">Event Type</label>
              <input
                required
                type="text"
                className="w-full px-3 py-2 bg-[var(--bg-card)] border border-[var(--border-subtle)] focus:border-emerald-500 rounded-lg text-sm text-[var(--text-heading)] outline-none font-mono"
                placeholder="e.g. audio.transcribe"
                value={formData.eventType}
                onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1.5">Aggregation Type</label>
              <select
                className="w-full px-3 py-2 bg-[var(--bg-card)] border border-[var(--border-subtle)] focus:border-emerald-500 rounded-lg text-sm text-[var(--text-heading)] outline-none"
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
              <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1.5">Target Property</label>
              <input
                required
                type="text"
                className="w-full px-3 py-2 bg-[var(--bg-card)] border border-[var(--border-subtle)] focus:border-emerald-500 rounded-lg text-sm text-[var(--text-heading)] outline-none font-mono"
                placeholder="e.g. seconds or tokens"
                value={formData.valueProperty}
                onChange={(e) => setFormData({ ...formData, valueProperty: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1.5">Unit Label</label>
            <input
              type="text"
              className="w-full px-3 py-2 bg-[var(--bg-card)] border border-[var(--border-subtle)] focus:border-emerald-500 rounded-lg text-sm text-[var(--text-heading)] outline-none"
              placeholder="e.g. seconds, tokens, requests"
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1.5">Description</label>
            <textarea
              rows={2}
              className="w-full px-3 py-2 bg-[var(--bg-card)] border border-[var(--border-subtle)] focus:border-emerald-500 rounded-lg text-sm text-[var(--text-heading)] outline-none resize-y"
              placeholder="What does this meter measure?"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-3 w-full bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-2.5 px-4 rounded-lg cursor-pointer flex items-center justify-center gap-2 text-sm shadow-md shadow-emerald-500/20 transition-all disabled:opacity-70 disabled:cursor-wait"
          >
            <Plus size={18} />
            <span>{loading ? 'Creating Meter...' : 'Create Meter'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
