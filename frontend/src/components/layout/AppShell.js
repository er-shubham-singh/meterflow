'use client';

import { usePathname } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import { useTheme } from '@/context/ThemeContext';

export default function AppShell({ children }) {
  const pathname = usePathname();
  const { mobileNavOpen, setMobileNavOpen } = useTheme();

  // Standalone pages (Login and Public Landing) don't render the dashboard sidebar
  const isStandalonePage = pathname === '/login' || pathname === '/landing';
  if (isStandalonePage) {
    return <main className="w-full min-h-screen">{children}</main>;
  }

  return (
    <div className="app-shell">
      {/* Desktop Sidebar */}
      <div className="sidebar-desktop">
        <Sidebar isMobile={false} />
      </div>

      {/* Mobile Drawer Backdrop Overlay */}
      {mobileNavOpen && (
        <div
          className="mobile-drawer-overlay fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm md:hidden touch-none"
          onClick={() => setMobileNavOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Drawer Sidebar */}
      {mobileNavOpen && (
        <div className="mobile-drawer fixed inset-y-0 left-0 z-50 w-[285px] max-w-[85vw] h-[100dvh] max-h-[100dvh] bg-[#0B132B] flex flex-col overflow-hidden md:hidden shadow-2xl">
          <Sidebar isMobile={true} />
        </div>
      )}

      {/* Main Content Viewport */}
      <div className="main-content">
        {children}
      </div>
    </div>
  );
}
