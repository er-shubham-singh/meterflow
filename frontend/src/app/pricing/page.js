'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import PlanCard from '@/components/pricing/PlanCard';
import InteractiveTierCalculator from '@/components/pricing/InteractiveTierCalculator';
import { api } from '@/services/api';

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
    <div className="w-full min-h-screen">
      <Header
        title="Pricing Plans & Rate Cards"
        subtitle="Manage graduated usage tiers, package blocks, and flat fees"
        onRefresh={loadPlans}
      />

      <main className="page-container w-full max-w-7xl mx-auto">
        {/* Interactive Calculator Section */}
        <div className="mb-8">
          <InteractiveTierCalculator selectedPlan={selectedPlan} />
        </div>

        {/* Plans Grid */}
        <div className="mb-6">
          <h2 className="text-lg sm:text-xl font-extrabold text-[var(--text-heading)] mb-4">
            Enterprise Rate Card Plans ({plans.length})
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
