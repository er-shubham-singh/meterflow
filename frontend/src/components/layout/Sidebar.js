'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Activity, 
  Gauge, 
  Layers, 
  Calculator, 
  Users, 
  FileText, 
  Zap, 
  Terminal, 
  Radio,
  X,
  Sun,
  Moon,
  Sparkles
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

const NAV_ITEMS = [
  { href: '/', label: 'Overview', icon: Gauge },
  { href: '/onboarding', label: 'Onboarding Portal', icon: Sparkles, badge: 'New' },
  { href: '/events', label: 'Live Stream', icon: Activity, badge: 'Live' },
  { href: '/meters', label: 'Meters & Aggregations', icon: Layers },
  { href: '/pricing', label: 'Pricing & Rate Cards', icon: Calculator },
  { href: '/customers', label: 'Customer Usage', icon: Users },
  { href: '/billing', label: 'Invoices & Feeds', icon: FileText },
  { href: '/simulator', label: 'Traffic Generator', icon: Zap },
  { href: '/playground', label: 'API Playground', icon: Terminal },
];

export default function Sidebar({ isMobile = false }) {
  const pathname = usePathname();
  const { theme, toggleTheme, setMobileNavOpen } = useTheme();

  const handleNavClick = () => {
    if (isMobile) {
      setMobileNavOpen(false);
    }
  };

  return (
    <aside
      className={`flex flex-col shrink-0 h-screen sticky top-0 z-40 bg-[var(--bg-sidebar)] transition-colors duration-200 ${
        isMobile ? 'w-full relative shadow-none border-0' : 'w-64 border-r border-[var(--border-subtle)] shadow-xl'
      }`}
    >
      {/* Brand Header */}
      <div className="p-4 sm:p-5 border-b border-[var(--border-subtle)] flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-emerald-500/25 shrink-0">
            <Zap size={20} className="text-white" />
          </div>
          <div className="min-w-0">
            <div className="text-base font-extrabold tracking-tight text-[var(--text-heading)] leading-tight truncate">
              Meter<span className="text-emerald-400">Flow</span>
            </div>
            <div className="text-[11px] text-[var(--text-subtle)] font-medium leading-tight truncate">
              Usage Pricing Engine
            </div>
          </div>
        </div>

        {isMobile && (
          <button
            onClick={() => setMobileNavOpen(false)}
            aria-label="Close navigation"
            className="w-8 h-8 rounded-lg flex items-center justify-center bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-[var(--border-medium)] text-[var(--text-muted)] hover:text-[var(--text-heading)] cursor-pointer transition-colors shrink-0"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Navigation List */}
      <nav className="p-3.5 flex-1 overflow-y-auto flex flex-col gap-1">
        <div className="text-[10px] font-bold text-[var(--text-subtle)] uppercase tracking-wider px-3 pb-2">
          Metering Platform
        </div>

        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={handleNavClick}
              className={`flex items-center justify-between py-2.5 px-3 rounded-lg text-xs sm:text-sm font-medium transition-all duration-150 no-underline ${
                isActive
                  ? 'bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/25 shadow-sm'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-heading)] hover:bg-[var(--bg-hover-subtle)]'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <Icon size={18} className={isActive ? 'text-emerald-400' : 'text-[var(--text-subtle)]'} />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge && (
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5 shrink-0">
                  <span className="pulse-indicator w-1.5 h-1.5"></span>
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Engine Status & Theme Switcher Footer */}
      <div className="p-3.5 m-3 mb-8 bg-[var(--bg-inset)] border border-[var(--border-subtle)] rounded-xl flex flex-col gap-2.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-[var(--text-muted)] font-medium">Engine Mode</span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
            <Radio size={10} /> ESM MVC
          </span>
        </div>

        {/* Theme Switcher in Sidebar */}
        <button
          onClick={toggleTheme}
          className="flex items-center justify-between py-2 px-2.5 bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-[var(--border-medium)] rounded-lg text-[var(--text-main)] text-xs font-semibold cursor-pointer transition-all duration-150 shadow-sm"
        >
          <div className="flex items-center gap-2">
            {theme === 'dark' ? <Moon size={14} className="text-indigo-400" /> : <Sun size={14} className="text-amber-500" />}
            <span>{theme === 'dark' ? 'Dark Theme' : 'Light Theme'}</span>
          </div>
          <span className="text-[10px] text-[var(--text-subtle)] uppercase font-bold">
            Switch
          </span>
        </button>

        <div className="text-[11px] text-[var(--text-subtle)] leading-tight">
          High-throughput event engine with multi-mode rate cards.
        </div>
      </div>
    </aside>
  );
}
