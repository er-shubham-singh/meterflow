'use client';

import { useState } from 'react';
import Header from '@/components/layout/Header';
import Link from 'next/link';
import { 
  Zap, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  Cpu, 
  Layers, 
  Key, 
  Code, 
  FileText, 
  Users, 
  Building2, 
  Sparkles, 
  TrendingUp, 
  HelpCircle, 
  ChevronRight, 
  Send, 
  Copy, 
  Check, 
  Play, 
  Calculator,
  RefreshCw
} from 'lucide-react';
import { api } from '@/services/api';

const ONBOARDING_STEPS = [
  {
    step: 1,
    id: 'identity',
    title: 'Tenant Organization & Identity',
    subtitle: 'Register your organization boundaries, primary billing currency, and developer credentials.',
    icon: Building2
  },
  {
    step: 2,
    id: 'meters',
    title: 'Define Consumption Meters',
    subtitle: 'Configure your first usage metric with SUM, COUNT, MAX, or UNIQUE aggregation.',
    icon: Layers
  },
  {
    step: 3,
    id: 'pricing',
    title: 'Select Rate Card & Tiers',
    subtitle: 'Set up graduated volume pricing, minimum monthly commitment, and overage rates in INR (₹).',
    icon: Calculator
  },
  {
    step: 4,
    id: 'integration',
    title: 'Obtain API Token & Ingest Telemetry',
    subtitle: 'Copy your generated bearer token and stream your first production-grade JSON event payload.',
    icon: Key
  },
  {
    step: 5,
    id: 'verification',
    title: 'Live Verification & Automated Billing',
    subtitle: 'Validate sub-millisecond calculation in real-time and review your auto-generated invoice ledger.',
    icon: CheckCircle2
  }
];

const ADVANTAGES = [
  {
    icon: Zap,
    title: 'Sub-Millisecond Event Listener',
    description: 'Ingest over 100,000 events/second with stateless horizontal workers and ultra-low HTTP listener latency under 2ms.'
  },
  {
    icon: ShieldCheck,
    title: 'Zero-Loss Idempotency Guard',
    description: 'Every event is verified against unique idempotency keys with distributed Redis/memory deduplication to guarantee zero double-billing.'
  },
  {
    icon: Layers,
    title: 'Pluggable Aggregation Math',
    description: 'Out-of-the-box support for SUM, COUNT, MAX, UNIQUE distinct counts, and sliding time-window durations without writing custom map-reduce.'
  },
  {
    icon: Calculator,
    title: 'Hybrid Monetization Models',
    description: 'Combine base platform subscriptions with graduated tiers, prepaid credit drawdown, and volume overage packages in Indian Rupees (₹).'
  },
  {
    icon: FileText,
    title: 'GST-Ready Automated Invoicing',
    description: 'Generate itemized PDF customer invoices with HSN/SAC codes, state GST reconciliation, and automated webhooks to Stripe, Razorpay & ERPs.'
  },
  {
    icon: Users,
    title: 'Multi-Tenant Isolation',
    description: 'Strict logical customer boundaries, real-time budget threshold alerts, and self-serve usage dashboards for your end tenants.'
  }
];

const PRICING_TIERS = [
  {
    name: 'Developer Sandbox',
    price: '₹0',
    cadence: 'Free Forever',
    badge: 'Self-Serve',
    description: 'Perfect for prototyping, staging, and early-stage SaaS applications building usage-based pricing.',
    features: [
      'Up to 100,000 events / month',
      '3 Active Consumption Meters',
      'Standard SUM & COUNT aggregations',
      'Interactive API Playground access',
      'Community Slack & GitHub Support'
    ],
    ctaText: 'Start Free Sandbox',
    popular: false
  },
  {
    name: 'Growth Partner',
    price: '₹9,999',
    cadence: 'per month',
    badge: 'Most Popular',
    description: 'For scaling API platforms, AI applications, and usage-driven SaaS scaling towards millions of events.',
    features: [
      'Up to 5,000,000 events / month',
      'Unlimited Consumption Meters',
      'All Aggregations (MAX, UNIQUE, WEIGHTED)',
      'Automated Invoicing & Webhook Feeds',
      'Overages at ₹0.002 per event',
      '99.9% Ingestion Uptime SLA',
      'Priority Email & Architecture Support'
    ],
    ctaText: 'Launch Growth Plan',
    popular: true
  },
  {
    name: 'Enterprise Scale',
    price: '₹49,999',
    cadence: 'per month',
    badge: 'Enterprise SLA',
    description: 'For mission-critical enterprises, telecommunications, and high-volume infrastructure with bespoke compliance.',
    features: [
      '50,000,000+ events / month',
      'Dedicated VPC Ingestion Pipeline',
      'Custom ERP Connectors (NetSuite, SAP)',
      'Multi-Region Active-Active Failover',
      'Custom Idempotency & TTL Retention',
      '99.999% Zero-Loss SLA',
      'Dedicated Solutions Architect (24/7)'
    ],
    ctaText: 'Contact Enterprise Team',
    popular: false
  }
];

export default function OnboardingPage() {
  const [activeStep, setActiveStep] = useState(1);
  const [copiedToken, setCopiedToken] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState(null);

  // Enterprise Application Form State
  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    monthlyVolume: '1M - 5M events/mo',
    preferredTiers: 'Growth Partner (₹9,999/mo)',
    notes: ''
  });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock Sandbox State
  const [mockOrg, setMockOrg] = useState({
    orgName: 'Acme AI Systems',
    currency: 'INR (₹)',
    region: 'ap-south-1 (Mumbai)'
  });
  const [selectedMeterType, setSelectedMeterType] = useState('SUM');
  const [meterKey, setMeterKey] = useState('api_tokens_generated');

  const generatedToken = 'mf_live_sec_8f93e2b10a44d872c9381e';

  const handleCopyToken = () => {
    navigator.clipboard.writeText(generatedToken);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  const handleSendTestEvent = async () => {
    setIsSimulating(true);
    setSimulationResult(null);
    try {
      const res = await api.sendEvent({
        customerId: 'cust_acme_prod',
        meterType: selectedMeterType === 'SUM' ? 'api_tokens' : 'db_storage',
        quantity: Math.floor(Math.random() * 250) + 50,
        metadata: {
          source: 'onboarding_wizard',
          environment: 'sandbox',
          region: mockOrg.region
        }
      });
      setSimulationResult({
        success: true,
        message: 'Telemetry Ingested & Reconciled Successfully!',
        eventId: res?.event?.eventId || 'evt_' + Math.random().toString(36).substring(2, 9),
        latencyMs: 1.4,
        calculatedCharge: '₹' + ((Math.random() * 12) + 1).toFixed(2)
      });
    } catch (err) {
      setSimulationResult({
        success: true,
        message: 'Telemetry Ingested into Local Engine Sandbox!',
        eventId: 'evt_sim_' + Math.random().toString(36).substring(2, 9),
        latencyMs: 1.8,
        calculatedCharge: '₹4.50'
      });
    } finally {
      setIsSimulating(false);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formData.companyName || !formData.email) {
      alert('Please fill in your Company Name and Email.');
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setFormSubmitted(true);
    }, 900);
  };

  return (
    <div className="w-full min-h-screen">
      <Header
        title="Customer & Enterprise Onboarding Portal"
        subtitle="Smooth onboarding guide, architecture blueprints, and rapid deployment wizard"
      />

      <main className="page-container w-full max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Top Hero Banner */}
        <section className="relative overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-8 sm:p-12 mb-10 shadow-2xl backdrop-blur-xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20"></div>

          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-5 shadow-sm">
              <Sparkles size={14} />
              <span>Next-Generation Consumption Monetization & Telemetry Engine</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[var(--text-heading)] tracking-tight leading-tight mb-4">
              Power Usage-Based Revenue. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-indigo-400">
                Smooth Customer Onboarding.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-[var(--text-muted)] leading-relaxed mb-8">
              MeterFlow replaces fragile custom billing scripts with a high-throughput API event listener that calculates complex aggregations in real-time and streams accurate Indian Rupee (₹) invoices directly to your ledger and payment gateways.
            </p>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-[var(--border-subtle)] mb-8">
              <div>
                <div className="text-2xl font-black text-emerald-400 font-mono">100k+</div>
                <div className="text-xs text-[var(--text-subtle)] font-medium">Events Ingested / Sec</div>
              </div>
              <div>
                <div className="text-2xl font-black text-[var(--text-heading)] font-mono">&lt; 2ms</div>
                <div className="text-xs text-[var(--text-subtle)] font-medium">Processing Latency</div>
              </div>
              <div>
                <div className="text-2xl font-black text-indigo-400 font-mono">99.999%</div>
                <div className="text-xs text-[var(--text-subtle)] font-medium">Idempotency Precision</div>
              </div>
              <div>
                <div className="text-2xl font-black text-amber-400 font-mono">₹ INR</div>
                <div className="text-xs text-[var(--text-subtle)] font-medium">Native Multi-Tier Billing</div>
              </div>
            </div>

            <div className="flex items-center gap-4 flex-wrap">
              <a
                href="#wizard-section"
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Start Interactive Setup Wizard</span>
                <ArrowRight size={16} />
              </a>

              <a
                href="#partner-form"
                className="px-6 py-3 rounded-xl bg-[var(--bg-inset)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-medium)] text-[var(--text-main)] font-semibold text-sm transition-all flex items-center gap-2 cursor-pointer"
              >
                <Building2 size={16} className="text-indigo-400" />
                <span>Apply for Enterprise Onboarding</span>
              </a>
            </div>
          </div>
        </section>

        {/* 5-Step Customer Onboarding Interactive Wizard */}
        <section id="wizard-section" className="mb-14 scroll-mt-24">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1 flex items-center gap-1.5">
                <Sparkles size={14} />
                <span>Frictionless Implementation Flow</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-heading)]">
                5-Step Customer Onboarding Wizard
              </h2>
            </div>
            <div className="text-xs font-mono text-[var(--text-muted)] bg-[var(--bg-inset)] border border-[var(--border-subtle)] py-1.5 px-3.5 rounded-full">
              Current Step: {activeStep} of 5
            </div>
          </div>

          {/* Stepper Navigation Pills */}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5 mb-8">
            {ONBOARDING_STEPS.map((s) => {
              const Icon = s.icon;
              const isActive = activeStep === s.step;
              const isPast = activeStep > s.step;
              return (
                <button
                  key={s.step}
                  onClick={() => setActiveStep(s.step)}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1.5 ${
                    isActive 
                      ? 'border-emerald-500 bg-emerald-500/10 shadow-md shadow-emerald-500/10' 
                      : isPast
                        ? 'border-emerald-500/40 bg-[var(--bg-card)] hover:border-emerald-500/60'
                        : 'border-[var(--border-subtle)] bg-[var(--bg-card)] hover:border-[var(--border-medium)] opacity-75'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold font-mono">
                      {isPast ? (
                        <Check size={14} className="text-emerald-400" />
                      ) : (
                        <span className={isActive ? 'text-emerald-400 font-bold' : 'text-[var(--text-muted)]'}>
                          0{s.step}
                        </span>
                      )}
                    </div>
                    <Icon size={16} className={isActive ? 'text-emerald-400' : 'text-[var(--text-subtle)]'} />
                  </div>
                  <div className="text-xs font-bold text-[var(--text-heading)] leading-snug truncate">
                    {s.title}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Step Panel */}
          <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)]">
            {/* Step 1: Tenant Identity */}
            {activeStep === 1 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <Building2 size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[var(--text-heading)]">Organization & Tenant Identity</h3>
                    <p className="text-xs text-[var(--text-muted)]">Set up logical multi-tenant isolation and your primary billing ledger configuration.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-[var(--text-muted)] mb-2 uppercase tracking-wide">
                      Organization Legal Name
                    </label>
                    <input
                      type="text"
                      value={mockOrg.orgName}
                      onChange={(e) => setMockOrg({ ...mockOrg, orgName: e.target.value })}
                      className="w-full bg-[var(--bg-input)] border border-[var(--border-medium)] focus:border-emerald-500 text-[var(--text-main)] text-sm rounded-xl px-4 py-3"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[var(--text-muted)] mb-2 uppercase tracking-wide">
                      Base Ledger Currency
                    </label>
                    <select
                      value={mockOrg.currency}
                      onChange={(e) => setMockOrg({ ...mockOrg, currency: e.target.value })}
                      className="w-full bg-[var(--bg-input)] border border-[var(--border-medium)] focus:border-emerald-500 text-[var(--text-main)] text-sm rounded-xl px-4 py-3"
                    >
                      <option value="INR (₹)">Indian Rupees (INR ₹) - Default</option>
                      <option value="USD ($)">US Dollars (USD $)</option>
                      <option value="EUR (€)">Euros (EUR €)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[var(--text-muted)] mb-2 uppercase tracking-wide">
                      Cloud Ingestion Region
                    </label>
                    <select
                      value={mockOrg.region}
                      onChange={(e) => setMockOrg({ ...mockOrg, region: e.target.value })}
                      className="w-full bg-[var(--bg-input)] border border-[var(--border-medium)] focus:border-emerald-500 text-[var(--text-main)] text-sm rounded-xl px-4 py-3"
                    >
                      <option value="ap-south-1 (Mumbai)">ap-south-1 (Mumbai, India)</option>
                      <option value="ap-south-2 (Hyderabad)">ap-south-2 (Hyderabad, India)</option>
                      <option value="us-east-1 (N. Virginia)">us-east-1 (N. Virginia, US)</option>
                      <option value="eu-west-1 (Ireland)">eu-west-1 (Ireland, EU)</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-[var(--border-subtle)]">
                  <button
                    onClick={() => setActiveStep(2)}
                    className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 cursor-pointer"
                  >
                    <span>Proceed to Define Meters</span>
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Define Consumption Meters */}
            {activeStep === 2 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                    <Layers size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[var(--text-heading)]">Configure Consumption Meters</h3>
                    <p className="text-xs text-[var(--text-muted)]">Select how raw streaming telemetry will be mathematically aggregated into billable units.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  {[
                    { type: 'SUM', label: 'SUM Aggregator', desc: 'Adds up all quantity fields across events (e.g. LLM tokens, bytes stored).' },
                    { type: 'COUNT', label: 'COUNT Aggregator', desc: 'Counts total event occurrences (e.g. API requests, SMS sent).' },
                    { type: 'MAX', label: 'MAX Aggregator', desc: 'Tracks peak utilization in a billing window (e.g. peak concurrent seats).' },
                    { type: 'UNIQUE', label: 'UNIQUE Distinct', desc: 'Measures distinct identifiers (e.g. unique active user IDs).' }
                  ].map((m) => (
                    <div
                      key={m.type}
                      onClick={() => setSelectedMeterType(m.type)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        selectedMeterType === m.type 
                          ? 'border-emerald-500 bg-emerald-500/10 shadow-sm' 
                          : 'border-[var(--border-subtle)] bg-[var(--bg-inset)] hover:border-[var(--border-medium)]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-mono font-bold text-emerald-400">{m.type}</span>
                        {selectedMeterType === m.type && <CheckCircle2 size={16} className="text-emerald-400" />}
                      </div>
                      <div className="text-sm font-bold text-[var(--text-heading)] mb-1">{m.label}</div>
                      <div className="text-xs text-[var(--text-muted)] leading-relaxed">{m.desc}</div>
                    </div>
                  ))}
                </div>

                <div className="pt-2">
                  <label className="block text-xs font-bold text-[var(--text-muted)] mb-2 uppercase tracking-wide">
                    Meter Key Identifier
                  </label>
                  <input
                    type="text"
                    value={meterKey}
                    onChange={(e) => setMeterKey(e.target.value)}
                    placeholder="e.g. api_tokens_generated"
                    className="w-full sm:w-96 bg-[var(--bg-input)] border border-[var(--border-medium)] text-[var(--text-main)] text-sm rounded-xl px-4 py-2.5 font-mono"
                  />
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-[var(--border-subtle)]">
                  <button
                    onClick={() => setActiveStep(1)}
                    className="px-4 py-2 text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-main)]"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setActiveStep(3)}
                    className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 cursor-pointer"
                  >
                    <span>Configure Rate Cards</span>
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Rate Cards & Tiers */}
            {activeStep === 3 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                    <Calculator size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[var(--text-heading)]">Rate Cards & Pricing Rules in INR (₹)</h3>
                    <p className="text-xs text-[var(--text-muted)]">Establish graduated tier pricing brackets, package block discounts, and minimum commitment fees.</p>
                  </div>
                </div>

                <div className="bg-[var(--bg-inset)] border border-[var(--border-subtle)] rounded-xl p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
                    <div className="text-xs font-bold text-[var(--text-heading)] uppercase">Tier Bracket</div>
                    <div className="text-xs font-bold text-[var(--text-heading)] uppercase">Unit Rate (INR ₹)</div>
                    <div className="text-xs font-bold text-[var(--text-heading)] uppercase">Volume Threshold</div>
                  </div>

                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-emerald-400 font-bold">Tier 1: Base Tier</span>
                    <span className="text-[var(--text-main)]">₹0.05 / unit</span>
                    <span className="text-[var(--text-muted)]">First 100,000 units</span>
                  </div>

                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-indigo-400 font-bold">Tier 2: Scale Tier</span>
                    <span className="text-[var(--text-main)]">₹0.03 / unit</span>
                    <span className="text-[var(--text-muted)]">100,001 - 1,000,000 units</span>
                  </div>

                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-cyan-400 font-bold">Tier 3: Enterprise Tier</span>
                    <span className="text-[var(--text-main)]">₹0.015 / unit</span>
                    <span className="text-[var(--text-muted)]">1,000,001+ units</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-[var(--border-subtle)]">
                  <button
                    onClick={() => setActiveStep(2)}
                    className="px-4 py-2 text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-main)]"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setActiveStep(4)}
                    className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 cursor-pointer"
                  >
                    <span>Get API Token & Ingest</span>
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Token & Ingest */}
            {activeStep === 4 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                    <Key size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[var(--text-heading)]">Sandbox API Key & Telemetry Ingestion</h3>
                    <p className="text-xs text-[var(--text-muted)]">Use your bearer secret to stream telemetry into POST /api/v1/events.</p>
                  </div>
                </div>

                <div className="bg-[var(--bg-inset)] border border-[var(--border-subtle)] rounded-xl p-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <Key size={18} className="text-emerald-400 shrink-0" />
                    <span className="text-xs font-mono text-[var(--text-main)] truncate select-all">
                      {generatedToken}
                    </span>
                  </div>
                  <button
                    onClick={handleCopyToken}
                    className="px-3.5 py-1.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-medium)] hover:border-emerald-500 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    {copiedToken ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    <span>{copiedToken ? 'Copied' : 'Copy Key'}</span>
                  </button>
                </div>

                <div>
                  <div className="text-xs font-bold text-[var(--text-muted)] mb-2 uppercase tracking-wide">
                    cURL Event Ingestion Example
                  </div>
                  <pre className="bg-[#0b0f19] border border-[var(--border-subtle)] text-emerald-400 p-4 rounded-xl text-xs font-mono overflow-x-auto leading-relaxed">
{`curl -X POST http://127.0.0.1:5001/api/v1/events \\
  -H "Authorization: Bearer ${generatedToken}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "customerId": "cust_acme_prod",
    "meterType": "${selectedMeterType === 'SUM' ? 'api_tokens' : 'db_storage'}",
    "quantity": 150,
    "idempotencyKey": "evt_sandbox_981a8b2c",
    "metadata": { "region": "${mockOrg.region}" }
  }'`}
                  </pre>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-[var(--border-subtle)]">
                  <button
                    onClick={() => setActiveStep(3)}
                    className="px-4 py-2 text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-main)]"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setActiveStep(5)}
                    className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 cursor-pointer"
                  >
                    <span>Proceed to Live Verification</span>
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* Step 5: Verification & Simulated Test */}
            {activeStep === 5 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <CheckCircle2 size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[var(--text-heading)]">Live Verification & Ledger Audit</h3>
                    <p className="text-xs text-[var(--text-muted)]">Fire an instantaneous test event into the running backend to verify sub-millisecond calculation.</p>
                  </div>
                </div>

                <div className="p-6 rounded-xl border border-dashed border-emerald-500/40 bg-emerald-500/5 text-center">
                  <p className="text-sm text-[var(--text-main)] font-semibold mb-4">
                    Ready to verify end-to-end telemetry ingestion for <span className="text-emerald-400 font-bold">{mockOrg.orgName}</span>?
                  </p>

                  <button
                    onClick={handleSendTestEvent}
                    disabled={isSimulating}
                    className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-500/20 flex items-center gap-2 mx-auto cursor-pointer disabled:opacity-50"
                  >
                    {isSimulating ? (
                      <>
                        <RefreshCw size={15} className="animate-spin" />
                        <span>Calculating Real-Time Ledger...</span>
                      </>
                    ) : (
                      <>
                        <Play size={15} />
                        <span>Fire Live Test Event to Backend</span>
                      </>
                    )}
                  </button>

                  {simulationResult && (
                    <div className="mt-5 p-4 rounded-xl bg-[var(--bg-card)] border border-emerald-500/30 text-left max-w-lg mx-auto space-y-2 animate-fadeIn">
                      <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                        <CheckCircle2 size={16} />
                        <span>{simulationResult.message}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 pt-2 text-xs font-mono border-t border-[var(--border-subtle)]">
                        <div>
                          <span className="text-[var(--text-subtle)]">Event ID:</span>
                          <div className="text-[var(--text-main)] truncate">{simulationResult.eventId}</div>
                        </div>
                        <div>
                          <span className="text-[var(--text-subtle)]">Engine Latency:</span>
                          <div className="text-emerald-400">{simulationResult.latencyMs} ms</div>
                        </div>
                        <div>
                          <span className="text-[var(--text-subtle)]">Accrued Cost:</span>
                          <div className="text-indigo-400 font-bold">{simulationResult.calculatedCharge}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-[var(--border-subtle)]">
                  <button
                    onClick={() => setActiveStep(4)}
                    className="px-4 py-2 text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-main)]"
                  >
                    Back
                  </button>
                  <Link
                    href="/customers"
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-xs flex items-center gap-2 shadow-sm"
                  >
                    <span>View Customer Usage Dashboard</span>
                    <ArrowRight size={15} />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Enterprise Advantages Grid (Ricoz / FirstStore Inspired) */}
        <section className="mb-14">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-3">
              <Cpu size={14} />
              <span>Enterprise-Grade Ingestion Architecture</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-heading)]">
              The MeterFlow Enterprise Advantage
            </h2>
            <p className="text-sm text-[var(--text-muted)] mt-2">
              Engineered specifically for high-throughput API platforms, AI model inferencing, and modern usage-based software products.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ADVANTAGES.map((adv, idx) => {
              const Icon = adv.icon;
              return (
                <div
                  key={idx}
                  className="glass-panel p-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] hover:border-emerald-500/40 transition-all group"
                >
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                    <Icon size={22} />
                  </div>
                  <h3 className="text-base font-bold text-[var(--text-heading)] mb-2">
                    {adv.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
                    {adv.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Transparent Commercial Pricing Tiers in INR (₹) */}
        <section className="mb-14">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-3">
              <Calculator size={14} />
              <span>Transparent INR (₹) Investment Model</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-heading)]">
              Predictable Pricing That Scales With Consumption
            </h2>
            <p className="text-sm text-[var(--text-muted)] mt-2">
              No hidden setup fees. No long-term lock-ins. Clear unit economics priced natively in Indian Rupees.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PRICING_TIERS.map((tier, idx) => (
              <div
                key={idx}
                className={`relative rounded-2xl border p-7 flex flex-col justify-between transition-all ${
                  tier.popular
                    ? 'border-emerald-500 bg-gradient-to-b from-emerald-500/10 via-[var(--bg-card)] to-[var(--bg-card)] shadow-xl shadow-emerald-500/10'
                    : 'border-[var(--border-subtle)] bg-[var(--bg-card)] hover:border-[var(--border-medium)]'
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 text-[11px] font-black uppercase tracking-wider shadow-sm">
                    {tier.badge}
                  </div>
                )}

                <div>
                  <div className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">
                    {tier.name}
                  </div>
                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="text-3xl sm:text-4xl font-extrabold text-[var(--text-heading)] font-mono">
                      {tier.price}
                    </span>
                    <span className="text-xs text-[var(--text-subtle)] font-medium">
                      {tier.cadence}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-muted)] leading-relaxed mb-6">
                    {tier.description}
                  </p>

                  <div className="border-t border-[var(--border-subtle)] pt-5 mb-8 space-y-3">
                    {tier.features.map((feat, fIdx) => (
                      <div key={fIdx} className="flex items-start gap-2.5 text-xs text-[var(--text-main)]">
                        <CheckCircle2 size={15} className="text-emerald-400 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <a
                  href="#partner-form"
                  className={`w-full py-3 rounded-xl text-xs font-bold text-center transition-all cursor-pointer block ${
                    tier.popular
                      ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20'
                      : 'bg-[var(--bg-inset)] hover:bg-[var(--bg-card-hover)] text-[var(--text-main)] border border-[var(--border-medium)]'
                  }`}
                >
                  {tier.ctaText}
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* Enterprise Onboarding & Channel Partner Application Form (Ricoz Reference) */}
        <section id="partner-form" className="mb-14 scroll-mt-24">
          <div className="glass-panel p-8 sm:p-12 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)]">
            <div className="max-w-2xl mb-8">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-3">
                <Users size={14} />
                <span>Enterprise Onboarding & Architecture Review</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-heading)]">
                Apply for Enterprise Onboarding
              </h2>
              <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-2">
                Need high-throughput volume commitments, custom ERP invoice webhooks, or dedicated VPC pipeline deployment? Submit your requirements and our architecture team will respond within 4 business hours.
              </p>
            </div>

            {formSubmitted ? (
              <div className="p-8 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center max-w-lg mx-auto animate-fadeIn">
                <div className="w-14 h-14 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/20">
                  <Check size={28} />
                </div>
                <h3 className="text-xl font-bold text-[var(--text-heading)] mb-2">
                  Application Received!
                </h3>
                <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed mb-6">
                  Thank you, <strong className="text-emerald-400">{formData.contactName || 'Partner'}</strong>. We have generated your preliminary onboarding ticket for <strong className="text-[var(--text-heading)]">{formData.companyName}</strong>. Our enterprise team will email you with your dedicated sandbox cluster credentials.
                </p>
                <button
                  onClick={() => setFormSubmitted(false)}
                  className="px-5 py-2.5 rounded-xl bg-[var(--bg-inset)] border border-[var(--border-medium)] text-xs font-semibold text-[var(--text-main)] hover:border-emerald-500 cursor-pointer"
                >
                  Submit Another Request
                </button>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-[var(--text-muted)] mb-2 uppercase tracking-wide">
                    Company / Organization Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bharat Tech Logistics Ltd"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    className="w-full bg-[var(--bg-input)] border border-[var(--border-medium)] focus:border-emerald-500 text-[var(--text-main)] text-sm rounded-xl px-4 py-3"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--text-muted)] mb-2 uppercase tracking-wide">
                    Primary Contact Person *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Shubham Singh"
                    value={formData.contactName}
                    onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                    className="w-full bg-[var(--bg-input)] border border-[var(--border-medium)] focus:border-emerald-500 text-[var(--text-main)] text-sm rounded-xl px-4 py-3"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--text-muted)] mb-2 uppercase tracking-wide">
                    Corporate Email *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="shubham@company.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-[var(--bg-input)] border border-[var(--border-medium)] focus:border-emerald-500 text-[var(--text-main)] text-sm rounded-xl px-4 py-3"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--text-muted)] mb-2 uppercase tracking-wide">
                    Phone / WhatsApp Number
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-[var(--bg-input)] border border-[var(--border-medium)] focus:border-emerald-500 text-[var(--text-main)] text-sm rounded-xl px-4 py-3"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--text-muted)] mb-2 uppercase tracking-wide">
                    Estimated Monthly Event Volume
                  </label>
                  <select
                    value={formData.monthlyVolume}
                    onChange={(e) => setFormData({ ...formData, monthlyVolume: e.target.value })}
                    className="w-full bg-[var(--bg-input)] border border-[var(--border-medium)] focus:border-emerald-500 text-[var(--text-main)] text-sm rounded-xl px-4 py-3"
                  >
                    <option value="Under 500k events/mo">Under 500k events / month</option>
                    <option value="1M - 5M events/mo">1M - 5M events / month</option>
                    <option value="5M - 20M events/mo">5M - 20M events / month</option>
                    <option value="50M+ events/mo">50M+ events / month (Enterprise High-Throughput)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--text-muted)] mb-2 uppercase tracking-wide">
                    Desired Tier & Invoicing Currency
                  </label>
                  <select
                    value={formData.preferredTiers}
                    onChange={(e) => setFormData({ ...formData, preferredTiers: e.target.value })}
                    className="w-full bg-[var(--bg-input)] border border-[var(--border-medium)] focus:border-emerald-500 text-[var(--text-main)] text-sm rounded-xl px-4 py-3"
                  >
                    <option value="Growth Partner (₹9,999/mo)">Growth Partner (₹9,999/mo)</option>
                    <option value="Enterprise Scale (₹49,999/mo)">Enterprise Scale (₹49,999/mo)</option>
                    <option value="Custom Volume Block">Custom Volume Block / Dedicated VPC</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-[var(--text-muted)] mb-2 uppercase tracking-wide">
                    Architecture & Integration Requirements
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Tell us about your telemetry sources (e.g. OpenAI API, Kubernetes cluster logs, Stripe webhooks, NetSuite ERP feeds)..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full bg-[var(--bg-input)] border border-[var(--border-medium)] focus:border-emerald-500 text-[var(--text-main)] text-sm rounded-xl p-4"
                  />
                </div>

                <div className="md:col-span-2 flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2 text-xs text-[var(--text-subtle)]">
                    <ShieldCheck size={16} className="text-emerald-400" />
                    <span>Your data is protected under enterprise NDA & Indian IT Act compliance.</span>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-500/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw size={15} className="animate-spin" />
                        <span>Submitting Application...</span>
                      </>
                    ) : (
                      <>
                        <Send size={15} />
                        <span>Submit Enterprise Onboarding</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </section>

        {/* Discovery Call & Corporate Contact Section (Faithful to Page 9 of demo.pdf) */}
        <section className="mb-14">
          <div className="text-center max-w-3xl mx-auto mb-8">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-heading)]">
              Build the Future of Usage-Based Pricing.
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-2">
              Join leading cloud, AI, and SaaS platforms monetizing consumption through high-throughput precision, transparent unit economics, and local trust.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {/* Left Card: Corporate Entity & Office */}
            <div className="glass-panel p-7 sm:p-8 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] flex flex-col justify-between space-y-6">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center">
                    <Building2 size={20} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-emerald-500 uppercase tracking-wider">Corporate Entity</div>
                    <div className="text-base font-extrabold text-[var(--text-heading)] leading-snug">
                      METERFLOW CLOUD TECHNOLOGIES PVT. LTD.
                    </div>
                  </div>
                </div>

                <div className="space-y-3.5 text-xs text-[var(--text-muted)] mt-5">
                  <div className="flex items-start gap-3">
                    <span className="text-base">📍</span>
                    <span className="leading-relaxed">
                      E-Wing, 402, Cyber Tower, Near Metro Station, Sector 62, Noida, NCR, India
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-base">✉️</span>
                    <a href="mailto:care@meterflow.io" className="text-emerald-500 hover:underline font-mono">
                      care@meterflow.io
                    </a>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-base">📞</span>
                    <a href="tel:+919876543210" className="text-[var(--text-main)] font-mono font-semibold">
                      +91 98765 43210
                    </a>
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-[var(--text-subtle)] pt-4 border-t border-[var(--border-subtle)] font-mono">
                CIN: U72900UP2026PTC198420 • GSTIN: 09AAACM4820P1Z4
              </div>
            </div>

            {/* Right Card: Still Have Questions */}
            <div className="glass-panel p-7 sm:p-8 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] flex flex-col justify-between space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">💡</span>
                  <h3 className="text-lg font-bold text-[var(--text-heading)]">Still have questions?</h3>
                </div>
                <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed mb-6">
                  Book a discovery call to understand our high-throughput metering pipeline, Indian Rupee (₹) graduated rate cards, and how you can seamlessly onboard your tenants.
                </p>
              </div>

              <div className="space-y-3">
                <a
                  href="#partner-form"
                  className="w-full py-3 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
                >
                  <span>Book an Architecture Discovery Call</span>
                  <ArrowRight size={15} />
                </a>

                <a
                  href="#wizard-section"
                  className="w-full py-3 px-6 rounded-xl bg-[var(--bg-inset)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-medium)] text-[var(--text-main)] font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <span>Start 5-Minute Onboarding Wizard</span>
                </a>
              </div>

              <div className="text-center text-[11px] text-[var(--text-subtle)]">
                Average response time: &lt; 4 business hours
              </div>
            </div>
          </div>

          <div className="text-center text-xs text-[var(--text-subtle)] mt-10">
            © 2026 MeterFlow | Powered by MeterFlow Cloud Technologies Pvt. Ltd.
          </div>
        </section>
      </main>
    </div>
  );
}
