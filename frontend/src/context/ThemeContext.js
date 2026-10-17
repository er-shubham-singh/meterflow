'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext({
  theme: 'dark',
  toggleTheme: () => {},
  setTheme: () => {},
  mobileNavOpen: false,
  setMobileNavOpen: () => {},
  toggleMobileNav: () => {}
});

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState('dark');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('meterflow_theme_active');
      if (stored === 'light') {
        setThemeState('light');
        document.documentElement.setAttribute('data-theme', 'light');
      } else {
        setThemeState('dark');
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('meterflow_theme_active', 'dark');
      }
    } catch (e) {
      setThemeState('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mobileNavOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') setMobileNavOpen(false);
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [mobileNavOpen]);

  const setTheme = (newTheme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem('meterflow_theme_active', newTheme);
      document.documentElement.setAttribute('data-theme', newTheme);
    } catch (e) {
      // storage unavailable
    }
  };

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
  };

  const toggleMobileNav = () => {
    setMobileNavOpen((prev) => !prev);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme,
        setTheme,
        mobileNavOpen,
        setMobileNavOpen,
        toggleMobileNav,
        mounted
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
