import './globals.css';
import { ThemeProvider } from '@/context/ThemeContext';
import AppShell from '@/components/layout/AppShell';

export const metadata = {
  title: 'MeterFlow - Usage-Based Pricing & Metering Engine',
  description: 'High-throughput API event listener that calculates complex consumption metrics and feeds directly into billing systems.',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const stored = localStorage.getItem('meterflow_theme');
                if (stored === 'light' || stored === 'dark') {
                  document.documentElement.setAttribute('data-theme', stored);
                } else if (window.matchMedia('(prefers-color-scheme: light)').matches) {
                  document.documentElement.setAttribute('data-theme', 'light');
                } else {
                  document.documentElement.setAttribute('data-theme', 'dark');
                }
              } catch (e) {}
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
