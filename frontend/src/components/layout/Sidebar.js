'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Server, 
  KeyRound, 
  Users, 
  FolderTree, 
  BarChart3, 
  PieChart, 
  ReceiptText, 
  Terminal, 
  BookOpen, 
  ShieldCheck, 
  Globe,
  Zap, 
  X,
  UserCheck
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { api } from '@/services/api';

const NAV_ITEMS = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/providers', label: 'API Providers', icon: Server, badge: '8 Connected' },
  { href: '/api-keys', label: 'API Keys', icon: KeyRound },
  { href: '/employees', label: 'Employees', icon: Users, badge: '28' },
  { href: '/teams', label: 'Teams', icon: FolderTree },
  { href: '/analytics', label: 'Usage Analytics', icon: BarChart3 },
  { href: '/budgets', label: 'Budgets & Alerts', icon: PieChart },
  { href: '/billing', label: 'Invoices', icon: ReceiptText },
  { href: '/playground', label: 'API Playground', icon: Terminal, badge: 'Test' },
  { href: '/docs', label: 'API Docs', icon: BookOpen },
  { href: '/admin', label: 'Platform Overview', icon: ShieldCheck, badge: 'Admin' },
  { href: '/landing', label: 'Public Website', icon: Globe }
];

export default function Sidebar({ isMobile = false }) {
  const pathname = usePathname();
  const { setMobileNavOpen } = useTheme();
  const [currentUser, setCurrentUser] = useState({
    name: 'Rahul Sharma',
    roleLabel: 'Admin',
    role: 'organization_admin'
  });

  useEffect(() => {
    api.getMe()
      .then(res => {
        if (res.data) setCurrentUser(res.data);
      })
      .catch(() => {});
  }, []);

  const handleRoleToggle = async () => {
    const nextRole = currentUser.role === 'developer' ? 'admin' : 'developer';
    try {
      const res = await api.switchRole(nextRole);
      if (res.data) {
        setCurrentUser(res.data);
      }
    } catch {
      setCurrentUser(prev => ({
        ...prev,
        role: nextRole,
        roleLabel: nextRole === 'developer' ? 'Developer' : 'Admin',
        name: nextRole === 'developer' ? 'Amit Kumar' : 'Rahul Sharma'
      }));
    }
  };

  const handleNavClick = () => {
    if (isMobile) {
      setMobileNavOpen(false);
    }
  };

  return (
    <aside
      className={`flex flex-col shrink-0 h-screen sticky top-0 z-40 bg-[#0B132B] text-slate-300 transition-colors duration-200 ${
        isMobile ? 'w-full relative shadow-none border-0' : 'w-64 border-r border-slate-800/80 shadow-2xl'
      }`}
    >
      {/* Brand Header */}
      <div className="p-4 sm:p-5 border-b border-slate-800/80 flex items-center justify-between gap-3">
        <Link href="/" className="flex items-center gap-3 min-w-0 no-underline">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/30 shrink-0">
            <Zap size={18} className="text-white fill-white" />
          </div>
          <div className="min-w-0">
            <div className="text-lg font-black tracking-tight text-white leading-tight">
              Meter<span className="text-blue-500">Flow</span>
            </div>
          </div>
        </Link>

        {isMobile && (
          <button
            onClick={() => setMobileNavOpen(false)}
            aria-label="Close navigation"
            className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-800/60 border border-slate-700 text-slate-400 hover:text-white cursor-pointer transition-colors shrink-0"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Organization Badge (Matching Panel 2) */}
      <div className="p-3 mx-3 my-2 bg-slate-900/90 border border-slate-800 rounded-xl flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-purple-600/80 text-white font-bold text-sm flex items-center justify-center shrink-0">
          A
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-xs font-bold text-white truncate">ABC Technologies</div>
          <div className="text-[10px] text-blue-400 font-medium truncate">Enterprise Plan</div>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="px-3 py-2 flex-1 overflow-y-auto flex flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={handleNavClick}
              className={`flex items-center justify-between py-2 px-3 rounded-xl text-xs font-semibold transition-all duration-150 no-underline ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <Icon size={16} className={isActive ? 'text-white' : 'text-slate-400'} />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge && (
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                  isActive 
                    ? 'bg-blue-700 text-white' 
                    : 'bg-slate-800 text-slate-300'
                }`}>
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Role Switcher Pill & Active User Status */}
      <div className="p-3 m-3 bg-slate-900/90 border border-slate-800 rounded-xl flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 rounded-full bg-blue-600/30 border border-blue-500/50 flex items-center justify-center text-[10px] text-blue-300 font-bold">
              {currentUser.name ? currentUser.name[0] : 'U'}
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-bold text-white truncate">{currentUser.name}</div>
              <div className="text-[9px] text-slate-400 font-medium capitalize">{currentUser.roleLabel || currentUser.role}</div>
            </div>
          </div>
          <button
            onClick={handleRoleToggle}
            title="Switch between Admin and Developer view"
            className="px-2 py-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 rounded text-[10px] font-bold cursor-pointer transition-colors shrink-0 flex items-center gap-1"
          >
            <UserCheck size={11} />
            <span>Switch</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
