'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import PlanCard from '@/components/pricing/PlanCard';
import InteractiveTierCalculator from '@/components/pricing/InteractiveTierCalculator';
import { api } from '@/services/api';
import { Calculator, Sparkles } from 'lucide-react';

export default function PricingPage() {
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadPlans = async () => {
    try {
      const res = await api.getPricingPlans();
      if (res.data) {
        setPlans(res.data);
        if (!selectedPlan && res.data.length > 0) {
          setSelectedPlan(res.data[0]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlans();
  }, []);

  return (
    <div>
      <Header
        title="Pricing Plans & Rate Cards"
        subtitle="Manage graduated usage tiers, package blocks, and flat fees"
        onRefresh={loadPlans}
      />

      <main className="page-container">
        {/* Interactive Calculator Section */}
        <div style={{ marginBottom: '32px' }}>
          <InteractiveTierCalculator selectedPlan={selectedPlan} />
        </div>

        {/* Plans Grid */}
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#fff', marginBottom: '16px' }}>
            Enterprise Rate Card Plans ({plans.length})
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '24px'
          }}>
            {plans.map((p) => (
              <PlanCard
                key={p.id}
                plan={p}
                isSelected={selectedPlan?.id === p.id}
                onSelectPlan={(plan) => setSelectedPlan(plan)}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
