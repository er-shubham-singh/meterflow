'use client';

import { useState, useEffect } from 'react';
import { api, API_BASE } from '@/services/api';
import { Zap, RefreshCw, Trash2, Cpu, Menu, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

export default function Header({ title, subtitle, onRefresh }) {
  const { theme, toggleTheme, toggleMobileNav } = useTheme();
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
    <header className="app-header" style={{
      height: '70px',
      borderBottom: '1px solid var(--border-subtle)',
      background: 'var(--bg-header)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 32px',
      position: 'sticky',
      top: 0,
      zIndex: 30,
      transition: 'background-color 0.2s ease, border-color 0.2s ease'
    }}>
      {/* Left: Mobile Menu Toggle + Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          onClick={toggleMobileNav}
          className="mobile-menu-btn"
          aria-label="Open navigation menu"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-main)',
            width: '38px',
            height: '38px',
            borderRadius: '8px',
            cursor: 'pointer',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Menu size={20} />
        </button>

        <div>
          <h1 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-heading)', margin: 0 }}>
            {title || 'Dashboard'}
          </h1>
          {subtitle && (
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0, marginTop: '2px' }}>
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Right Controls */}
      <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Live Ticker */}
        <div className="header-ticker" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: 'var(--bg-inset)',
          border: '1px solid var(--border-subtle)',
          padding: '6px 14px',
          borderRadius: '20px'
        }}>
          <span className="pulse-indicator"></span>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '500' }}>Rate:</span>
          <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--emerald-400)', fontFamily: 'var(--font-mono)' }}>
            {telemetry.eventsPerSecond} <span style={{ fontSize: '10px', color: 'var(--text-subtle)' }}>evt/s</span>
          </span>
        </div>

        {/* Quick Burst Button */}
        <button
          onClick={handleQuickBurst}
          disabled={isBursting}
          title="Send a batch of 100 mixed meter events to the ingestion pipeline"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.18) 0%, rgba(99, 102, 241, 0.18) 100%)',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            color: 'var(--emerald-400)',
            padding: '7px 12px',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: '600',
            cursor: isBursting ? 'wait' : 'pointer',
            transition: 'all 0.2s',
            opacity: isBursting ? 0.7 : 1
          }}
        >
          <Zap size={14} />
          <span className="burst-btn-text">{isBursting ? 'Ingesting...' : 'Burst (100)'}</span>
        </button>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label="Toggle dark/light theme"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-main)',
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: 'var(--shadow-card)'
          }}
        >
          {theme === 'dark' ? (
            <Sun size={17} color="#f59e0b" />
          ) : (
            <Moon size={17} color="#6366f1" />
          )}
        </button>

        {/* Reset Usage Button */}
        <button
          onClick={handleResetUsage}
          disabled={isResetting}
          title="Reset all customer usage and event counters"
          aria-label="Reset usage counters"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'transparent',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-muted)',
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          <Trash2 size={16} />
        </button>

        {/* Backend Node Status */}
        <div className="header-node-status" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '12px',
          color: 'var(--text-muted)',
          paddingLeft: '10px',
          borderLeft: '1px solid var(--border-subtle)'
        }}>
          <Cpu size={14} color="var(--violet-400)" />
          <span style={{ fontSize: '11px', fontWeight: '500' }}>
            {API_BASE.includes('localhost') ? ':5001' : 'Render Live'}
          </span>
        </div>
      </div>
    </header>
  );
}
