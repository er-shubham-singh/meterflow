'use client';

import { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { Zap, Play, Square, FastForward, Activity } from 'lucide-react';

export default function SimulatorControlPanel({ onSimulationUpdate }) {
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
      } else {
        await api.startSimulator(rate, scenario);
        setIsRunning(true);
      }
      if (onSimulationUpdate) onSimulationUpdate();
    } catch (err) {
      alert('Error toggling simulator: ' + err.message);
    }
  };

  const handleTriggerBurst = async (count) => {
    setBurstLoading(true);
    try {
      const res = await api.triggerBurst(count, scenario);
      setLastBurstResult(res.data);
      if (onSimulationUpdate) onSimulationUpdate();
    } catch (err) {
      alert('Error triggering burst: ' + err.message);
    } finally {
      setBurstLoading(false);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '28px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Zap size={20} color="#10b981" />
            High-Throughput Workload Generator
          </h2>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Simulate realistic multi-tenant consumption events directly into the API listener.
          </p>
        </div>

        <span className={`badge-tag ${isRunning ? 'badge-emerald' : 'badge-amber'}`}>
          {isRunning ? 'Streaming Live Traffic' : 'Generator Idle'}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '28px' }}>
        {/* Scenario Selection */}
        <div>
          <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: '600' }}>
            Workload Scenario Preset:
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              { id: 'mixed', label: 'Mixed Multi-Tenant', desc: 'LLM tokens, API calls, GPU compute, MAU users' },
              { id: 'ai_tokens', label: 'AI LLM Inference Surge', desc: 'Claude 3.5 Sonnet & GPT-4o prompt/completion tokens' },
              { id: 'api_calls', label: 'High-Volume API Invocations', desc: 'gRPC & REST edge gateway events' },
              { id: 'compute_hours', label: 'Dedicated GPU Clusters', desc: 'NVIDIA A100 & cloud compute runtime' }
            ].map((s) => (
              <label
                key={s.id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  background: scenario === s.id ? 'rgba(16, 185, 129, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                  border: scenario === s.id ? '1px solid #10b981' : '1px solid var(--border-subtle)',
                  cursor: 'pointer'
                }}
              >
                <input
                  type="radio"
                  name="scenario"
                  value={s.id}
                  checked={scenario === s.id}
                  onChange={(e) => setScenario(e.target.value)}
                  style={{ marginTop: '2px', accentColor: '#10b981' }}
                />
                <div>
                  <strong style={{ fontSize: '13px', color: '#f8fafc', display: 'block' }}>{s.label}</strong>
                  <span style={{ fontSize: '11px', color: 'var(--text-subtle)' }}>{s.desc}</span>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Streaming Rate & Continuous Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>
                Continuous Ingestion Rate:
              </label>
              <span style={{ fontSize: '14px', fontWeight: '800', color: '#10b981', fontFamily: 'var(--font-mono)' }}>
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
              style={{ width: '100%', accentColor: '#10b981', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-subtle)', marginTop: '4px' }}>
              <span>5 evt/s</span>
              <span>75 evt/s</span>
              <span>150 evt/s</span>
            </div>

            <div style={{ marginTop: '20px' }}>
              <button
                onClick={handleToggleRunning}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '8px',
                  border: 'none',
                  background: isRunning ? '#f43f5e' : '#10b981',
                  color: isRunning ? '#fff' : '#022c22',
                  fontWeight: '700',
                  fontSize: '14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.2s'
                }}
              >
                {isRunning ? <Square size={16} /> : <Play size={16} />}
                <span>{isRunning ? 'Stop Continuous Streaming' : 'Start Continuous Stream'}</span>
              </button>
            </div>
          </div>

          {/* Quick Burst Section */}
          <div style={{
            marginTop: '20px',
            padding: '16px',
            background: 'rgba(15, 23, 42, 0.5)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '10px'
          }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600', marginBottom: '10px' }}>
              Inject Instant Traffic Bursts:
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
              {[50, 150, 300].map((count) => (
                <button
                  key={count}
                  disabled={burstLoading}
                  onClick={() => handleTriggerBurst(count)}
                  style={{
                    padding: '8px',
                    borderRadius: '6px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--border-subtle)',
                    color: '#cbd5e1',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: burstLoading ? 'wait' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px'
                  }}
                >
                  <FastForward size={12} color="#38bdf8" />
                  <span>+{count}</span>
                </button>
              ))}
            </div>

            {lastBurstResult && (
              <div style={{ marginTop: '10px', fontSize: '11px', color: '#34d399', fontFamily: 'var(--font-mono)' }}>
                Burst: {lastBurstResult.ingested} events in {lastBurstResult.durationMs}ms ({lastBurstResult.throughputPerSec} evt/s)
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
