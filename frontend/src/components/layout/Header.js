'use client';

import { useState, useEffect } from 'react';
import { 
  Bell, 
  Calendar, 
  Download, 
  Search, 
  Menu, 
  Zap, 
  RefreshCw,
  Sun,
  Moon
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { useCurrency } from '@/context/CurrencyContext';
import { api } from '@/services/api';

export default function Header({ 
  title = 'Dashboard', 
  subtitle = 'Overview of your API usage and costs', 
  onRefresh, 
  onExport 
}) {
  const { theme, toggleTheme, toggleMobileNav } = useTheme();
  const { currency, setCurrency } = useCurrency();
  const [currentUser, setCurrentUser] = useState({
    name: 'Rahul Sharma',
    roleLabel: 'Admin'
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isBursting, setIsBursting] = useState(false);

  useEffect(() => {
    api.getMe()
      .then(res => {
        if (res.data) setCurrentUser(res.data);
      })
      .catch(() => {});
  }, []);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    if (onRefresh) await onRefresh();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleQuickBurst = async () => {
    setIsBursting(true);
    try {
      await api.sendGatewayProxy({
        provider: 'openai',
        body: { model: 'gpt-4o-mini', messages: [{ role: 'user', content: 'Telemetry pulse' }] }
      });
      if (onRefresh) onRefresh();
    } catch {
      // fallback
    } finally {
      setTimeout(() => setIsBursting(false), 400);
    }
  };

  const handleExportClick = () => {
    if (onExport) {
      onExport();
      return;
    }
    // Default CSV export
    const csvContent = "data:text/csv;charset=utf-8,Date,Requests,Cost_INR,Provider\n2026-10-18,245230,12450,OpenAI\n";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `meterflow_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <header className="h-[68px] border-b border-[var(--border-subtle)] bg-[var(--bg-header)] flex items-center justify-between sticky top-0 z-30 w-full px-4 sm:px-6 transition-colors shadow-sm">
      {/* Left: Mobile Menu Toggle + Title with Fluid Typography */}
      <div className="flex items-center gap-3 min-w-0 pr-2">
        <button
          onClick={toggleMobileNav}
          className="md:hidden bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-[var(--text-main)] w-9 h-9 rounded-lg flex items-center justify-center shrink-0 cursor-pointer"
          aria-label="Open menu"
        >
          <Menu size={18} />
        </button>

        <div className="min-w-0">
          <h1 className="text-[clamp(0.85rem,2.5vw,1.15rem)] font-bold text-[var(--text-heading)] m-0 leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs text-[var(--text-muted)] m-0 truncate hidden sm:block">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Right Controls (Matching Panel 2 + Multi-Currency Selector) */}
      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 ml-auto">
        {/* Global Multi-Currency Selector (INR ₹ / USD $ / EUR €) */}
        <div className="flex items-center bg-[var(--bg-inset)] border border-[var(--border-subtle)] rounded-lg p-0.5 shadow-sm">
          {[
            { id: 'INR', symbol: '₹' },
            { id: 'USD', symbol: '$' },
            { id: 'EUR', symbol: '€' }
          ].map((c) => (
            <button
              key={c.id}
              onClick={() => setCurrency(c.id)}
              className={`px-2 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
                currency === c.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title={`Switch currency to ${c.id}`}
            >
              <span>{c.symbol}</span>
              <span className="hidden xl:inline ml-0.5">{c.id}</span>
            </button>
          ))}
        </div>

        {/* Search Input (Hidden on mobile) */}
        <div className="relative hidden xl:block w-44 lg:w-52">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search APIs, keys..."
            className="w-full bg-[var(--bg-inset)] border border-[var(--border-subtle)] focus:border-blue-500 text-xs text-[var(--text-main)] pl-8 pr-3 py-1.5 rounded-lg outline-none transition-all placeholder:text-slate-400"
          />
        </div>

        {/* Date Filter Range (Matching Panel 2: Oct 1, 2026 - Oct 31, 2026) */}
        <div className="hidden md:flex items-center gap-1.5 bg-[var(--bg-inset)] border border-[var(--border-subtle)] px-2.5 py-1.5 rounded-lg text-xs font-medium text-[var(--text-muted)]">
          <Calendar size={13} className="text-blue-500" />
          <span>Oct 1 - Oct 31, 2026</span>
        </div>

        {/* Export Button (Matching Panel 2) */}
        <button
          onClick={handleExportClick}
          className="flex items-center gap-1.5 bg-white border border-[var(--border-subtle)] hover:bg-slate-50 text-[var(--text-heading)] px-2.5 py-1.5 min-h-[34px] rounded-lg text-xs font-semibold cursor-pointer transition-all shadow-sm"
          title="Export CSV Report"
        >
          <Download size={13} className="text-slate-600" />
          <span className="hidden sm:inline">Export</span>
        </button>

        {/* Quick Test Pulse */}
        <button
          onClick={handleQuickBurst}
          disabled={isBursting}
          className="flex items-center gap-1 bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 px-2.5 py-1.5 min-h-[34px] rounded-lg text-xs font-semibold cursor-pointer transition-all disabled:opacity-50"
          title="Send a quick live test API pulse"
        >
          <Zap size={13} className="text-blue-600" />
          <span className="hidden lg:inline">{isBursting ? 'Pulse...' : 'Test Pulse'}</span>
        </button>

        {/* Refresh Button */}
        <button
          onClick={handleManualRefresh}
          className="w-8 h-8 rounded-lg border border-[var(--border-subtle)] hover:bg-[var(--bg-inset)] flex items-center justify-center text-slate-500 hover:text-slate-900 cursor-pointer transition-all"
          title="Refresh metrics"
        >
          <RefreshCw size={14} className={isRefreshing ? 'animate-spin text-blue-600' : ''} />
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button
            className="w-8 h-8 rounded-lg border border-[var(--border-subtle)] hover:bg-[var(--bg-inset)] flex items-center justify-center text-slate-500 hover:text-slate-900 cursor-pointer transition-all"
            title="Notifications"
          >
            <Bell size={15} />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-blue-600"></span>
          </button>
        </div>

        {/* User Profile Avatar Pill */}
        <div className="flex items-center gap-2 pl-2 border-l border-[var(--border-subtle)]">
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-sm">
            {currentUser.name ? currentUser.name[0] : 'R'}
          </div>
          <div className="hidden lg:block text-left">
            <div className="text-xs font-bold text-[var(--text-heading)] leading-tight">
              {currentUser.name || 'Rahul Sharma'}
            </div>
            <div className="text-[10px] text-slate-400 font-medium">
              {currentUser.roleLabel || 'Admin'}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
