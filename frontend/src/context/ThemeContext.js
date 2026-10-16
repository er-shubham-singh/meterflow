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
      const stored = localStorage.getItem('meterflow_theme');
      if (stored === 'light' || stored === 'dark') {
        setThemeState(stored);
        document.documentElement.setAttribute('data-theme', stored);
      } else {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const initial = prefersDark ? 'dark' : 'light';
        setThemeState(initial);
        document.documentElement.setAttribute('data-theme', initial);
      }
    } catch (e) {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
    setMounted(true);
  }, []);

  const setTheme = (newTheme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem('meterflow_theme', newTheme);
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
