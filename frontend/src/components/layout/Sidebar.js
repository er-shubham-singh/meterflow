'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
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
  UserCheck,
  LogOut,
  Sparkles,
  Home
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

const ADMIN_NAV_ITEMS = [
  { href: '/admin', label: 'Platform Overview', icon: ShieldCheck, badge: 'Admin' },
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/providers', label: 'API Providers', icon: Server, badge: '8 Connected' },
  { href: '/api-keys', label: 'API Keys', icon: KeyRound },
  { href: '/employees', label: 'Employees & Access', icon: Users, badge: 'Team' },
  { href: '/teams', label: 'Teams', icon: FolderTree },
  { href: '/analytics', label: 'Usage Analytics', icon: BarChart3 },
  { href: '/budgets', label: 'Budgets & Alerts', icon: PieChart },
  { href: '/billing', label: 'Invoices & Plans', icon: ReceiptText },
  { href: '/playground', label: 'API Playground', icon: Terminal, badge: 'Test' },
  { href: '/docs', label: 'API Docs', icon: BookOpen },
  { href: '/landing', label: 'Public Website', icon: Globe }
];

const EMPLOYEE_NAV_ITEMS = [
  { href: '/employee-portal', label: 'Employee Portal', icon: Home, badge: 'My Key' },
  { href: '/api-keys', label: 'My API Keys', icon: KeyRound },
  { href: '/playground', label: 'API Playground', icon: Terminal, badge: 'Test' },
  { href: '/docs', label: 'API Docs & SDKs', icon: BookOpen },
  { href: '/landing', label: 'Public Website', icon: Globe }
];

export default function Sidebar({ isMobile = false }) {
  const pathname = usePathname();
  const router = useRouter();
  const { setMobileNavOpen } = useTheme();
  const { user, isAdmin, isEmployee, quickLogin, logout } = useAuth();
  const { addToast } = useToast();

  const handleRoleToggle = async () => {
    const nextRole = isAdmin ? 'employee' : 'admin';
    const res = await quickLogin(nextRole);
    if (res.success) {
      addToast(`Switched view to ${res.data.name} (${res.data.roleLabel || res.data.role})`, 'info');
      if (nextRole === 'employee') {
        router.push('/employee-portal');
      } else {
        router.push('/admin');
      }
    }
  };

  const handleLogout = async () => {
    await logout();
    addToast('Logged out successfully', 'info');
    router.push('/login');
  };

  const handleNavClick = () => {
    if (isMobile) {
      setMobileNavOpen(false);
    }
  };

  const navItems = isAdmin ? ADMIN_NAV_ITEMS : EMPLOYEE_NAV_ITEMS;

  return (
    <aside
      className={`flex flex-col bg-[#0B132B] text-slate-300 transition-colors duration-200 ${
        isMobile
          ? 'w-full h-full max-h-[100dvh] relative shadow-none border-0 overflow-hidden'
          : 'w-64 shrink-0 h-screen sticky top-0 z-40 border-r border-slate-800/80 shadow-2xl'
      }`}
    >
      {/* Brand Header */}
      <div className="p-4 sm:p-5 border-b border-slate-800/80 flex items-center justify-between gap-3 shrink-0">
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
            className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-800/60 border border-slate-700 text-slate-400 hover:text-white cursor-pointer transition-colors shrink-0 active:scale-95"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Organization Badge & Role Indicator */}
      <div className="p-3 mx-3 my-2 bg-slate-900/90 border border-slate-800 rounded-xl flex items-center gap-3 shrink-0">
        <div className={`w-9 h-9 rounded-lg text-white font-bold text-sm flex items-center justify-center shrink-0 ${
          isAdmin ? 'bg-purple-600/90' : 'bg-emerald-600/90'
        }`}>
          {isAdmin ? 'A' : 'E'}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-xs font-bold text-white truncate">
            {isAdmin ? 'ABC Technologies' : (user?.teamName || 'Development Team')}
          </div>
          <div className="text-[10px] text-blue-400 font-medium truncate flex items-center gap-1">
            <span>{isAdmin ? 'Admin Workspace' : 'Employee Portal'}</span>
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="px-3 py-2 flex-1 overflow-y-auto overscroll-contain min-h-0 flex flex-col gap-1">
        {navItems.map((item) => {
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

      {/* Active User Status & Quick Role Switcher Pill */}
      <div className="p-3 m-3 bg-slate-900/90 border border-slate-800 rounded-xl flex flex-col gap-2 shrink-0">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 rounded-full bg-blue-600/30 border border-blue-500/50 flex items-center justify-center text-[10px] text-blue-300 font-bold">
              {user?.name ? user.name[0] : 'U'}
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-bold text-white truncate">{user?.name || 'Rahul Sharma'}</div>
              <div className="text-[9px] text-slate-400 font-medium capitalize truncate">
                {user?.roleLabel || user?.role || 'Admin'}
              </div>
            </div>
          </div>

          <button
            onClick={handleRoleToggle}
            title={`Switch to ${isAdmin ? 'Employee' : 'Admin'} view`}
            className="px-2 py-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 rounded text-[10px] font-bold cursor-pointer transition-colors shrink-0 flex items-center gap-1"
          >
            <UserCheck size={11} />
            <span>Switch</span>
          </button>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[10px]">
          <Link href="/login" className="text-slate-400 hover:text-white flex items-center gap-1 no-underline">
            <span>Change Login</span>
          </Link>

          <button
            onClick={handleLogout}
            className="text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer bg-transparent border-0"
          >
            <LogOut size={11} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
