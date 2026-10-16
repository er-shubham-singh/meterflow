'use client';

import { useState, useEffect } from 'react';
import { api, API_BASE } from '@/services/api';
import { Zap, RefreshCw, Trash2, Cpu } from 'lucide-react';

export default function Header({ title, subtitle, onRefresh }) {
  const [telemetry, setTelemetry] = useState({ eventsPerSecond: 0, totalIngested: 0 });
  const [isBursting, setIsBursting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchTelemetry = async () => {
      try {
        const res = await api.getTelemetry();
        if (isMounted && res.telemetry) {
          setTelemetry(res.telemetry);
        }
      } catch (err) { // eslint-disable-line no-unused-vars
        // fallback
      }
    };

    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 2000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleQuickBurst = async () => {
    setIsBursting(true);
    try {
      await api.triggerBurst(100, 'mixed');
      if (onRefresh) onRefresh();
    } catch (err) {
      alert('Error triggering burst: ' + err.message);
    } finally {
      setTimeout(() => setIsBursting(false), 600);
    }
  };

  const handleResetUsage = async () => {
    if (!confirm('Are you sure you want to reset all usage counters and idempotency state?')) return;
    setIsResetting(true);
    try {
      await api.resetAllUsage();
      if (onRefresh) onRefresh();
    } catch (err) {
      alert('Error resetting usage: ' + err.message);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <header style={{
      height: '70px',
      borderBottom: '1px solid var(--border-subtle)',
      background: 'rgba(9, 13, 22, 0.8)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 32px',
      position: 'sticky',
      top: 0,
      zIndex: 30
    }}>
      <div>
        <h1 style={{ fontSize: '18px', fontWeight: '700', color: '#fff' }}>{title || 'Dashboard'}</h1>
        {subtitle && <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{subtitle}</p>}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Live Ticker */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: 'rgba(15, 23, 42, 0.6)',
          border: '1px solid var(--border-subtle)',
          padding: '6px 14px',
          borderRadius: '20px'
        }}>
          <span className="pulse-indicator"></span>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '500' }}>Throughput:</span>
          <span style={{ fontSize: '13px', fontWeight: '700', color: '#10b981', fontFamily: 'var(--font-mono)' }}>
            {telemetry.eventsPerSecond} <span style={{ fontSize: '10px', color: 'var(--text-subtle)' }}>evt/s</span>
          </span>
        </div>

        {/* Quick Burst Button */}
        <button
          onClick={handleQuickBurst}
          disabled={isBursting}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(99, 102, 241, 0.15) 100%)',
            border: '1px solid rgba(16, 185, 129, 0.35)',
            color: '#34d399',
            padding: '7px 14px',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: '600',
            cursor: isBursting ? 'wait' : 'pointer',
            transition: 'all 0.2s',
            opacity: isBursting ? 0.7 : 1
          }}
        >
          <Zap size={14} />
          <span>{isBursting ? 'Ingesting Burst...' : 'Burst (100 Evts)'}</span>
        </button>

        {/* Reset Usage */}
        <button
          onClick={handleResetUsage}
          disabled={isResetting}
          title="Reset all customer usage and event counters"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'transparent',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-muted)',
            width: '34px',
            height: '34px',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          <Trash2 size={15} />
        </button>

        {/* Backend Node Status */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '12px',
          color: 'var(--text-muted)',
          paddingLeft: '8px',
          borderLeft: '1px solid var(--border-subtle)'
        }}>
          <Cpu size={14} color="#818cf8" />
          <span style={{ fontSize: '11px', fontWeight: '500' }}>
            API: {API_BASE.includes('localhost') ? ':5001' : 'Render Live'}
          </span>
        </div>
      </div>
    </header>
  );
}
