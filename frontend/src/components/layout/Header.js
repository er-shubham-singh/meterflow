'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api, API_BASE } from '@/services/api';
import { Zap, RefreshCw, Trash2, Cpu, Menu, Sun, Moon, Sparkles } from 'lucide-react';
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
    <header className="app-header h-[70px] border-b border-[var(--border-subtle)] bg-[var(--bg-header)] backdrop-blur-md flex items-center justify-between sticky top-0 z-40 w-full max-w-full box-border transition-colors px-4 sm:px-6">
      {/* Left: Mobile Menu Toggle + Title */}
      <div className="header-brand-section flex items-center gap-2.5 min-w-0 flex-1 overflow-hidden mr-2">
        <button
          onClick={toggleMobileNav}
          className="mobile-menu-btn bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-main)] w-9 h-9 rounded-lg cursor-pointer flex items-center justify-center shrink-0"
          aria-label="Open navigation menu"
        >
          <Menu size={20} />
        </button>

        <div className="header-title-group min-w-0 flex-1 overflow-hidden">
          <h1 className="header-title text-sm sm:text-base font-bold text-[var(--text-heading)] m-0 truncate">
            {title || 'Dashboard'}
          </h1>
          {subtitle && (
            <p className="header-subtitle text-xs text-[var(--text-muted)] m-0 mt-0.5 truncate">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Right Controls */}
      <div className="header-actions flex items-center gap-2 shrink-0 ml-auto">
        {/* Live Ticker */}
        <div className="header-ticker flex items-center gap-2.5 bg-[var(--bg-inset)] border border-[var(--border-subtle)] py-1.5 px-3.5 rounded-full">
          <span className="pulse-indicator"></span>
          <span className="text-xs text-[var(--text-muted)] font-medium">Rate:</span>
          <span className="text-xs font-bold text-emerald-400 font-mono">
            {telemetry.eventsPerSecond} <span className="text-[10px] text-[var(--text-subtle)]">evt/s</span>
          </span>
        </div>

        {/* Onboarding Quick Link */}
        <Link
          href="/onboarding"
          title="Open Customer Onboarding Portal & Architecture Wizard"
          className="header-onboarding-btn hidden lg:flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/30 hover:border-emerald-500/60 text-emerald-400 py-1.5 px-3 rounded-lg text-xs font-semibold cursor-pointer transition-all shrink-0"
        >
          <Sparkles size={13} />
          <span>Onboarding</span>
        </Link>

        {/* Quick Burst Button */}
        <button
          onClick={handleQuickBurst}
          disabled={isBursting}
          title="Send a batch of 100 mixed meter events to the ingestion pipeline"
          className="header-burst-btn flex items-center justify-center gap-1.5 bg-gradient-to-br from-emerald-500/20 to-indigo-500/20 border border-emerald-500/40 hover:border-emerald-500/60 text-emerald-400 py-1.5 px-3 rounded-lg text-xs font-semibold cursor-pointer transition-all hover:shadow-sm shadow-emerald-500/10 disabled:opacity-70 disabled:cursor-wait shrink-0"
        >
          <Zap size={14} />
          <span className="burst-btn-text">{isBursting ? 'Ingesting...' : 'Burst (100)'}</span>
        </button>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label="Toggle dark/light theme"
          className="flex items-center justify-center bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-[var(--border-medium)] text-[var(--text-main)] w-9 h-9 rounded-lg cursor-pointer transition-all shadow-sm shrink-0"
        >
          {theme === 'dark' ? (
            <Sun size={17} className="text-amber-400" />
          ) : (
            <Moon size={17} className="text-indigo-400" />
          )}
        </button>

        {/* Reset Usage Button */}
        <button
          onClick={handleResetUsage}
          disabled={isResetting}
          title="Reset all customer usage and event counters"
          aria-label="Reset usage counters"
          className="flex items-center justify-center bg-transparent border border-[var(--border-subtle)] hover:border-rose-500/50 hover:text-rose-400 text-[var(--text-muted)] w-9 h-9 rounded-lg cursor-pointer transition-all shrink-0"
        >
          <Trash2 size={16} />
        </button>

        {/* Backend Node Status */}
        <div className="header-node-status flex items-center gap-1.5 text-xs text-[var(--text-muted)] pl-2.5 border-l border-[var(--border-subtle)]">
          <Cpu size={14} className="text-indigo-400" />
          <span className="text-[11px] font-medium">
            {API_BASE.includes('localhost') ? ':5001' : 'Render Live'}
          </span>
        </div>
      </div>
    </header>
  );
}
