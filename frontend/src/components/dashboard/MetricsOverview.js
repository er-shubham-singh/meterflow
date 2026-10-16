'use client';

import { Activity, DollarSign, Layers, ShieldCheck, Zap } from 'lucide-react';
import { formatCurrency, formatCompactNumber } from '@/utils/formatters';

export default function MetricsOverview({ telemetry, metersCount, totalAccruedRevenue, customersCount }) {
  const cards = [
    {
      title: 'Total Ingested Events',
      value: formatCompactNumber(telemetry?.totalIngested || 0),
      subtext: `${telemetry?.eventsPerSecond || 0} events/sec right now`,
      icon: Activity,
      color: '#10b981',
      bgGlow: 'rgba(16, 185, 129, 0.12)'
    },
    {
      title: 'Current Accrued Revenue',
      value: formatCurrency(totalAccruedRevenue || 0),
      subtext: `Across ${customersCount || 0} active accounts`,
      icon: DollarSign,
      color: '#38bdf8',
      bgGlow: 'rgba(56, 189, 248, 0.12)'
    },
    {
      title: 'Active Consumption Meters',
      value: metersCount || 5,
      subtext: 'SUM, MAX, UNIQUE_COUNT, AVG',
      icon: Layers,
      color: '#818cf8',
      bgGlow: 'rgba(129, 140, 248, 0.12)'
    },
    {
      title: 'Idempotency Filtered',
      value: formatCompactNumber(telemetry?.totalDuplicatesDropped || 0),
      subtext: 'Duplicate billable events dropped',
      icon: ShieldCheck,
      color: '#fbbf24',
      bgGlow: 'rgba(251, 191, 36, 0.12)'
    }
  ];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
      gap: '20px',
      marginBottom: '28px'
    }}>
      {cards.map((c, i) => {
        const Icon = c.icon;
        return (
          <div
            key={i}
            className="glass-panel"
            style={{
              padding: '20px 24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '600' }}>
                {c.title}
              </span>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: c.bgGlow,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Icon size={18} color={c.color} />
              </div>
            </div>

            <div>
              <div style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-heading)', letterSpacing: '-0.02em', marginBottom: '4px' }}>
                {c.value}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-subtle)' }}>
                {c.subtext}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
