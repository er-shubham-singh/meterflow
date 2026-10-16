'use client';

import Sidebar from '@/components/layout/Sidebar';
import { useTheme } from '@/context/ThemeContext';

export default function AppShell({ children }) {
  const { mobileNavOpen, setMobileNavOpen } = useTheme();

  return (
    <div className="app-shell">
      {/* Desktop Sidebar */}
      <div className="sidebar-desktop">
        <Sidebar isMobile={false} />
      </div>

      {/* Mobile Drawer Backdrop Overlay */}
      {mobileNavOpen && (
        <div
          className="mobile-drawer-overlay"
          onClick={() => setMobileNavOpen(false)}
        />
      )}

      {/* Mobile Drawer Sidebar */}
      {mobileNavOpen && (
        <div className="mobile-drawer">
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
