import './globals.css';
import { ThemeProvider } from '@/context/ThemeContext';
import AppShell from '@/components/layout/AppShell';

export const metadata = {
  title: 'MeterFlow - Usage-Based Pricing & Metering Engine',
  description: 'High-throughput API event listener that calculates complex consumption metrics and feeds directly into billing systems.'
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#07090e'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const stored = localStorage.getItem('meterflow_theme_active');
                if (stored === 'light') {
                  document.documentElement.setAttribute('data-theme', 'light');
                } else {
                  document.documentElement.setAttribute('data-theme', 'dark');
                  localStorage.setItem('meterflow_theme_active', 'dark');
                }
              } catch (e) {
                document.documentElement.setAttribute('data-theme', 'dark');
              }
            `
          }}
        />
      </head>
      <body>
        <ThemeProvider>
          <AppShell>
            {children}
          </AppShell>
        </ThemeProvider>
      </body>
    </html>
  );
}
