'use client';

import Header from '@/components/layout/Header';
import ApiPlayground from '@/components/playground/ApiPlayground';

export default function PlaygroundPage() {
  return (
    <div>
      <Header
        title="API Ingestion Playground"
        subtitle="Developer console to test POST /api/v1/events and benchmark listener latency"
      />

      <main className="page-container">
        <ApiPlayground />
      </main>
    </div>
  );
}
