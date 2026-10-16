import './globals.css';
import Sidebar from '@/components/layout/Sidebar';

export const metadata = {
  title: 'MeterFlow - Usage-Based Pricing & Metering Engine',
  description: 'High-throughput API event listener that calculates complex consumption metrics and feeds directly into billing systems.'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="app-shell">
          <Sidebar />
          <div className="main-content">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
