'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Bell, 
  Calendar, 
  Download, 
  Search, 
  Menu, 
  Zap, 
  RefreshCw,
  ChevronDown,
  MoreVertical,
  Check
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { useCurrency } from '@/context/CurrencyContext';
import { api } from '@/services/api';

const CURRENCIES = [
  { id: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { id: 'USD', symbol: '$', name: 'US Dollar' },
  { id: 'EUR', symbol: '€', name: 'Euro' }
];

export default function Header({ 
  title = 'Dashboard', 
  subtitle = 'Overview of your API usage and costs', 
  onRefresh, 
  onExport 
}) {
  const { toggleMobileNav } = useTheme();
  const { currency, setCurrency } = useCurrency();
  const [currentUser, setCurrentUser] = useState({
    name: 'Rahul Sharma',
    roleLabel: 'Admin'
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isBursting, setIsBursting] = useState(false);

  // Mobile Dropdowns
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);
  const [isActionsOpen, setIsActionsOpen] = useState(false);

  const currencyMenuRef = useRef(null);
  const actionsMenuRef = useRef(null);

  useEffect(() => {
    api.getMe()
      .then(res => {
        if (res.data) setCurrentUser(res.data);
      })
      .catch(() => {});
  }, []);

  // Handle outside clicks and ESC key for dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (currencyMenuRef.current && !currencyMenuRef.current.contains(event.target)) {
        setIsCurrencyOpen(false);
      }
      if (actionsMenuRef.current && !actionsMenuRef.current.contains(event.target)) {
        setIsActionsOpen(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsCurrencyOpen(false);
        setIsActionsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
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

  const getCurrencySymbol = (id) => {
    const match = CURRENCIES.find(c => c.id === id);
    return match ? match.symbol : '₹';
  };

  return (
    <header className="h-[64px] border-b border-[var(--border-subtle)] bg-[var(--bg-header)] flex items-center justify-between sticky top-0 z-30 w-full px-3 sm:px-6 transition-colors shadow-sm">
      {/* Left: Mobile Menu Toggle + Title with Responsive Sizing */}
      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1 mr-2">
        <button
          onClick={toggleMobileNav}
          className="md:hidden bg-[var(--bg-secondary)] hover:bg-[var(--bg-inset)] border border-[var(--border-subtle)] text-[var(--text-main)] w-9 h-9 rounded-xl flex items-center justify-center shrink-0 cursor-pointer shadow-sm active:scale-95 transition-all"
          aria-label="Open navigation menu"
        >
          <Menu size={18} />
        </button>

        <div className="min-w-0 flex-1">
          <h1 className="text-sm sm:text-base md:text-lg font-bold text-[var(--text-heading)] m-0 leading-tight truncate" title={title}>
            {title}
          </h1>
          {subtitle && (
            <p className="text-[11px] sm:text-xs text-[var(--text-muted)] m-0 truncate hidden sm:block">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Mobile Right Controls: Compact Currency Dropdown + Quick Actions Dropdown + Avatar */}
      <div className="flex md:hidden items-center gap-1.5 shrink-0">
        {/* Mobile Currency Dropdown */}
        <div className="relative" ref={currencyMenuRef}>
          <button
            onClick={() => {
              setIsCurrencyOpen(prev => !prev);
              setIsActionsOpen(false);
            }}
            className="flex items-center gap-1 bg-[var(--bg-inset)] hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-[var(--border-subtle)] text-[var(--text-heading)] px-2 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all shadow-sm active:scale-95"
            aria-label="Change currency"
            aria-expanded={isCurrencyOpen}
          >
            <span className="text-blue-600 dark:text-blue-400 font-extrabold">{getCurrencySymbol(currency)}</span>
            <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-200">{currency}</span>
            <ChevronDown size={12} className={`text-slate-400 transition-transform duration-150 ${isCurrencyOpen ? 'rotate-180' : ''}`} />
          </button>

          {isCurrencyOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-44 bg-[var(--bg-card)] backdrop-blur-xl border border-[var(--border-subtle)] rounded-xl shadow-2xl p-1 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-2.5 py-1 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                Display Currency
              </div>
              {CURRENCIES.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    setCurrency(c.id);
                    setIsCurrencyOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                    currency === c.id
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-[var(--text-main)] hover:bg-[var(--bg-hover-subtle)]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-5 text-center font-bold ${currency === c.id ? 'text-white' : 'text-blue-500'}`}>{c.symbol}</span>
                    <span>{c.name}</span>
                  </div>
                  {currency === c.id && <Check size={14} className="text-white" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Mobile Quick Actions Menu (Pulse, Export, Refresh, Notifications) */}
        <div className="relative" ref={actionsMenuRef}>
          <button
            onClick={() => {
              setIsActionsOpen(prev => !prev);
              setIsCurrencyOpen(false);
            }}
            className={`relative w-8 h-8 rounded-lg border border-[var(--border-subtle)] flex items-center justify-center cursor-pointer transition-all active:scale-95 shadow-sm ${
              isActionsOpen 
                ? 'bg-blue-600 text-white border-blue-600' 
                : 'bg-[var(--bg-inset)] hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
            aria-label="More actions"
            aria-expanded={isActionsOpen}
          >
            <MoreVertical size={16} />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-blue-600 border border-white dark:border-slate-900"></span>
          </button>

          {isActionsOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-56 bg-[var(--bg-card)] backdrop-blur-xl border border-[var(--border-subtle)] rounded-xl shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 flex flex-col gap-0.5">
              <div className="px-2.5 py-1 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                Quick Actions
              </div>

              {/* Quick Test Pulse */}
              <button
                onClick={() => {
                  handleQuickBurst();
                  setIsActionsOpen(false);
                }}
                disabled={isBursting}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 cursor-pointer transition-colors text-left"
              >
                <Zap size={14} className="text-blue-600 dark:text-blue-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-bold">{isBursting ? 'Sending Pulse...' : 'Send Test Pulse'}</div>
                  <div className="text-[10px] text-slate-400 font-normal truncate">Mock gateway event</div>
                </div>
              </button>

              {/* Export CSV */}
              <button
                onClick={() => {
                  handleExportClick();
                  setIsActionsOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-semibold text-[var(--text-main)] hover:bg-[var(--bg-hover-subtle)] cursor-pointer transition-colors text-left"
              >
                <Download size={14} className="text-slate-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-bold">Export CSV</div>
                  <div className="text-[10px] text-[var(--text-muted)] font-normal truncate">Download telemetry report</div>
                </div>
              </button>

              {/* Refresh Metrics */}
              <button
                onClick={() => {
                  handleManualRefresh();
                  setIsActionsOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-semibold text-[var(--text-main)] hover:bg-[var(--bg-hover-subtle)] cursor-pointer transition-colors text-left"
              >
                <RefreshCw size={14} className={`text-slate-500 shrink-0 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
                <div className="flex-1 min-w-0">
                  <div className="font-bold">{isRefreshing ? 'Refreshing...' : 'Refresh Metrics'}</div>
                  <div className="text-[10px] text-[var(--text-muted)] font-normal truncate">Sync live database usage</div>
                </div>
              </button>

              <div className="my-1 border-t border-[var(--border-subtle)]" />

              {/* Notifications Alert item */}
              <div className="px-2.5 py-2 rounded-lg bg-[var(--bg-inset)] flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <Bell size={13} className="text-blue-500 shrink-0" />
                  <span className="text-xs font-medium text-[var(--text-main)] truncate">Notifications</span>
                </div>
                <span className="px-1.5 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-bold shrink-0">2 new</span>
              </div>
            </div>
          )}
        </div>

        {/* Mobile User Profile Avatar */}
        <div 
          className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-sm shrink-0 border border-white/20"
          title={`${currentUser.name || 'Rahul Sharma'} (${currentUser.roleLabel || 'Admin'})`}
        >
          {currentUser.name ? currentUser.name[0] : 'R'}
        </div>
      </div>

      {/* Desktop Controls (Full Enterprise Bar for md: and above) */}
      <div className="hidden md:flex items-center gap-2 sm:gap-2.5 shrink-0 ml-auto">
        {/* Global Multi-Currency Selector (INR ₹ / USD $ / EUR €) */}
        <div className="flex items-center bg-[var(--bg-inset)] border border-[var(--border-subtle)] rounded-lg p-0.5 shadow-sm">
          {CURRENCIES.map((c) => (
            <button
              key={c.id}
              onClick={() => setCurrency(c.id)}
              className={`px-2 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
                currency === c.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              title={`Switch currency to ${c.id}`}
            >
              <span>{c.symbol}</span>
              <span className="hidden xl:inline ml-0.5">{c.id}</span>
            </button>
          ))}
        </div>

        {/* Search Input (Hidden on tablets, visible on large desktop) */}
        <div className="relative hidden xl:block w-44 lg:w-52">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search APIs, keys..."
            className="w-full bg-[var(--bg-inset)] border border-[var(--border-subtle)] focus:border-blue-500 text-xs text-[var(--text-main)] pl-8 pr-3 py-1.5 rounded-lg outline-none transition-all placeholder:text-slate-400"
          />
        </div>

        {/* Date Filter Range */}
        <div className="hidden md:flex items-center gap-1.5 bg-[var(--bg-inset)] border border-[var(--border-subtle)] px-2.5 py-1.5 rounded-lg text-xs font-medium text-[var(--text-muted)]">
          <Calendar size={13} className="text-blue-500" />
          <span>Oct 1 - Oct 31, 2026</span>
        </div>

        {/* Export Button */}
        <button
          onClick={handleExportClick}
          className="flex items-center gap-1.5 bg-white dark:bg-slate-800 border border-[var(--border-subtle)] hover:bg-slate-50 dark:hover:bg-slate-700 text-[var(--text-heading)] px-2.5 py-1.5 min-h-[34px] rounded-lg text-xs font-semibold cursor-pointer transition-all shadow-sm"
          title="Export CSV Report"
        >
          <Download size={13} className="text-slate-600 dark:text-slate-300" />
          <span className="hidden sm:inline">Export</span>
        </button>

        {/* Quick Test Pulse */}
        <button
          onClick={handleQuickBurst}
          disabled={isBursting}
          className="flex items-center gap-1 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/60 px-2.5 py-1.5 min-h-[34px] rounded-lg text-xs font-semibold cursor-pointer transition-all disabled:opacity-50"
          title="Send a quick live test API pulse"
        >
          <Zap size={13} className="text-blue-600 dark:text-blue-400" />
          <span className="hidden lg:inline">{isBursting ? 'Pulse...' : 'Test Pulse'}</span>
        </button>

        {/* Refresh Button */}
        <button
          onClick={handleManualRefresh}
          className="w-8 h-8 rounded-lg border border-[var(--border-subtle)] hover:bg-[var(--bg-inset)] flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 cursor-pointer transition-all"
          title="Refresh metrics"
        >
          <RefreshCw size={14} className={isRefreshing ? 'animate-spin text-blue-600' : ''} />
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button
            className="w-8 h-8 rounded-lg border border-[var(--border-subtle)] hover:bg-[var(--bg-inset)] flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 cursor-pointer transition-all"
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
