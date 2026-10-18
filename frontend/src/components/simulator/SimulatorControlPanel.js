'use client';

import { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { Zap, Play, Square, FastForward, Activity } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

export default function SimulatorControlPanel({ onSimulationUpdate }) {
  const { showToast } = useToast();
  const [isRunning, setIsRunning] = useState(false);
  const [rate, setRate] = useState(25);
  const [scenario, setScenario] = useState('mixed');
  const [burstLoading, setBurstLoading] = useState(false);
  const [lastBurstResult, setLastBurstResult] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchStatus = async () => {
      try {
        const res = await api.getSimulatorStatus();
        if (isMounted && res.data) {
          setIsRunning(res.data.running);
          setRate(res.data.rate);
          setScenario(res.data.scenario);
        }
      } catch (err) { // eslint-disable-line no-unused-vars
        // fallback
      }
    };
    fetchStatus();
    return () => { isMounted = false; };
  }, []);

  const handleToggleRunning = async () => {
    try {
      if (isRunning) {
        await api.stopSimulator();
        setIsRunning(false);
        showToast('Workload generator stopped', 'info');
      } else {
        await api.startSimulator(rate, scenario);
        setIsRunning(true);
        showToast('Continuous traffic stream started', 'success');
      }
      if (onSimulationUpdate) onSimulationUpdate();
    } catch (err) {
      showToast('Error toggling simulator: ' + err.message, 'error');
    }
  };

  const handleTriggerBurst = async (count) => {
    setBurstLoading(true);
    try {
      const res = await api.triggerBurst(count, scenario);
      setLastBurstResult(res.data);
      showToast(`Injected instant burst of ${count} events!`, 'success');
      if (onSimulationUpdate) onSimulationUpdate();
    } catch (err) {
      showToast('Error triggering burst: ' + err.message, 'error');
    } finally {
      setBurstLoading(false);
    }
  };

  return (
    <div className="glass-panel w-full p-6 sm:p-7 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)]">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-extrabold text-[var(--text-heading)] flex items-center gap-2">
            <Zap size={20} className="text-emerald-400" />
            <span>High-Throughput Workload Generator</span>
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Simulate realistic multi-tenant consumption events directly into the API listener.
          </p>
        </div>

        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
          isRunning 
            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' 
            : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
        }`}>
          {isRunning ? 'Streaming Live Traffic' : 'Generator Idle'}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Scenario Selection */}
        <div>
          <label className="block text-xs font-semibold text-[var(--text-muted)] mb-2">
            Workload Scenario Preset:
          </label>
          <div className="flex flex-col gap-2">
            {[
              { id: 'mixed', label: 'Mixed Multi-Tenant', desc: 'LLM tokens, API calls, GPU compute, MAU users' },
              { id: 'ai_tokens', label: 'AI LLM Inference Surge', desc: 'Claude 3.5 Sonnet & GPT-4o prompt/completion tokens' },
              { id: 'api_calls', label: 'High-Volume API Invocations', desc: 'gRPC & REST edge gateway events' },
              { id: 'compute_hours', label: 'Dedicated GPU Clusters', desc: 'NVIDIA A100 & cloud compute runtime' }
            ].map((s) => (
              <label
                key={s.id}
                className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                  scenario === s.id
                    ? 'bg-emerald-500/10 border-emerald-500/40 shadow-sm'
                    : 'bg-[var(--bg-secondary)] border-[var(--border-subtle)] hover:border-[var(--border-medium)]'
                }`}
              >
                <input
                  type="radio"
                  name="scenario"
                  value={s.id}
                  checked={scenario === s.id}
                  onChange={(e) => setScenario(e.target.value)}
                  className="mt-0.5 accent-emerald-500"
                />
                <div>
                  <strong className="text-xs sm:text-sm text-[var(--text-heading)] block font-semibold">{s.label}</strong>
                  <span className="text-[11px] text-[var(--text-subtle)]">{s.desc}</span>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Streaming Rate & Continuous Controls */}
        <div className="flex flex-col justify-between gap-5">
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-semibold text-[var(--text-muted)]">
                Continuous Ingestion Rate:
              </label>
              <span className="text-sm font-extrabold text-emerald-400 font-mono">
                {rate} evt/s
              </span>
            </div>

            <input
              type="range"
              min="5"
              max="150"
              step="5"
              value={rate}
              onChange={(e) => setRate(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer h-2 bg-[var(--bg-inset)] rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-[var(--text-subtle)] mt-1 font-mono">
              <span>5 evt/s</span>
              <span>75 evt/s</span>
              <span>150 evt/s</span>
            </div>

            <div className="mt-5">
              <button
                onClick={handleToggleRunning}
                className={`w-full py-3 px-4 rounded-xl font-bold text-sm text-white cursor-pointer flex items-center justify-center gap-2 transition-all shadow-md ${
                  isRunning 
                    ? 'bg-rose-500 hover:bg-rose-400 shadow-rose-500/20' 
                    : 'bg-emerald-500 hover:bg-emerald-400 shadow-emerald-500/20'
                }`}
              >
                {isRunning ? <Square size={16} /> : <Play size={16} />}
                <span>{isRunning ? 'Stop Continuous Streaming' : 'Start Continuous Stream'}</span>
              </button>
            </div>
          </div>

          {/* Quick Burst Section */}
          <div className="p-4 bg-[var(--bg-inset)] border border-[var(--border-subtle)] rounded-xl">
            <div className="text-xs font-semibold text-[var(--text-muted)] mb-2.5">
              Inject Instant Traffic Bursts:
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[50, 150, 300].map((count) => (
                <button
                  key={count}
                  disabled={burstLoading}
                  onClick={() => handleTriggerBurst(count)}
                  className="py-2.5 px-3 min-h-[44px] rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-[var(--border-medium)] text-[var(--text-main)] text-xs font-semibold cursor-pointer flex items-center justify-center gap-1.5 transition-all disabled:opacity-50 disabled:cursor-wait"
                >
                  <FastForward size={12} className="text-cyan-400" />
                  <span>+{count}</span>
                </button>
              ))}
            </div>

            {lastBurstResult && (
              <div className="mt-2.5 text-[11px] text-emerald-400 font-mono">
                Burst: {lastBurstResult.ingested} events in {lastBurstResult.durationMs}ms ({lastBurstResult.throughputPerSec} evt/s)
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
