'use client';

import Header from '@/components/layout/Header';
import SimulatorControlPanel from '@/components/simulator/SimulatorControlPanel';

export default function SimulatorPage() {
  return (
    <div className="w-full min-h-screen">
      <Header
        title="High-Throughput Traffic Simulator"
        subtitle="Benchmark the ingestion listener with synthetic multi-tenant workloads"
      />

      <main className="page-container">
        <SimulatorControlPanel />
      </main>
    </div>
  );
}
