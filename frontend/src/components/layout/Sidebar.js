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
  Moon
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

const NAV_ITEMS = [
  { href: '/', label: 'Overview', icon: Gauge },
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
    <aside style={{
      width: isMobile ? '100%' : '260px',
      background: 'var(--bg-sidebar)',
      borderRight: isMobile ? 'none' : '1px solid var(--border-subtle)',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      position: isMobile ? 'relative' : 'sticky',
      top: 0,
      height: '100vh',
      zIndex: 40,
      boxShadow: isMobile ? 'none' : 'var(--shadow-card)'
    }}>
      {/* Brand Header */}
      <div style={{
        padding: '20px 20px',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #10b981 0%, #6366f1 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px rgba(16, 185, 129, 0.4)'
          }}>
            <Zap size={20} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: '16px', fontWeight: '800', letterSpacing: '-0.02em', color: 'var(--text-heading)' }}>
              Meter<span style={{ color: '#10b981' }}>Flow</span>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-subtle)', fontWeight: '500' }}>
              Usage Pricing Engine
            </div>
          </div>
        </div>

        {isMobile && (
          <button
            onClick={() => setMobileNavOpen(false)}
            aria-label="Close navigation"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '6px'
            }}
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Navigation List */}
      <nav style={{ padding: '20px 12px', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div style={{ 
          fontSize: '10px', 
          fontWeight: '700', 
          color: 'var(--text-subtle)', 
          textTransform: 'uppercase', 
          letterSpacing: '0.08em',
          padding: '0 12px 8px 12px' 
        }}>
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
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px',
                borderRadius: '8px',
                color: isActive ? 'var(--text-heading)' : 'var(--text-muted)',
                backgroundColor: isActive ? 'rgba(16, 185, 129, 0.12)' : 'transparent',
                border: isActive ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid transparent',
                textDecoration: 'none',
                fontSize: '13px',
                fontWeight: isActive ? '600' : '500',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Icon size={18} color={isActive ? '#10b981' : 'var(--text-subtle)'} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span style={{
                  fontSize: '9px',
                  fontWeight: '700',
                  padding: '2px 6px',
                  borderRadius: '10px',
                  background: 'rgba(16, 185, 129, 0.2)',
                  color: 'var(--emerald-400)',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <span className="pulse-indicator" style={{ width: '5px', height: '5px' }}></span>
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Engine Status & Theme Switcher Footer */}
      <div style={{
        padding: '14px',
        margin: '12px',
        background: 'var(--bg-inset)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '10px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600' }}>Engine Mode</span>
          <span className="badge-tag badge-emerald" style={{ fontSize: '10px', padding: '1px 6px' }}>
            <Radio size={10} /> ESM MVC
          </span>
        </div>

        {/* Theme Switcher in Sidebar */}
        <button
          onClick={toggleTheme}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '7px 10px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '6px',
            color: 'var(--text-main)',
            fontSize: '12px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {theme === 'dark' ? <Moon size={14} color="#818cf8" /> : <Sun size={14} color="#f59e0b" />}
            <span>{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
          </div>
          <span style={{ fontSize: '10px', color: 'var(--text-subtle)', textTransform: 'uppercase', fontWeight: '700' }}>
            Toggle
          </span>
        </button>

        <div style={{ fontSize: '11px', color: 'var(--text-subtle)' }}>
          High-throughput event engine with multi-mode rate cards.
        </div>
      </div>
    </aside>
  );
}
