import mongoose from 'mongoose';
import { Meter } from '../models/Meter.js';
import { PricingPlan } from '../models/PricingPlan.js';
import { Customer } from '../models/Customer.js';
import { AGGREGATION_TYPES, PRICING_MODELS } from '../config/constants.js';
import { meteringEngine } from '../services/meteringEngine.js';

// Fallback in-memory registries when MongoDB is disconnected or booting
export const memoryStore = {
  meters: new Map(),
  pricingPlans: new Map(),
  customers: new Map(),
  invoices: new Map(),
  webhookLogs: []
};

// 1. Initial Seed Fixtures
const SEED_METERS = [
  {
    id: 'mtr_llm_tokens',
    code: 'llm_tokens_total',
    name: 'LLM Generative Tokens',
    description: 'Total token consumption across prompt and completion inferences',
    eventType: 'ai.completion',
    aggregationType: AGGREGATION_TYPES.SUM,
    valueProperty: 'tokens',
    unit: 'tokens',
    active: true
  },
  {
    id: 'mtr_api_calls',
    code: 'api_requests_total',
    name: 'API Gateway Invocations',
    description: 'High-throughput HTTP/gRPC requests ingested through edge gateways',
    eventType: 'api.request',
    aggregationType: AGGREGATION_TYPES.COUNT,
    valueProperty: 'units',
    unit: 'requests',
    active: true
  },
  {
    id: 'mtr_gpu_compute',
    code: 'gpu_compute_hours',
    name: 'GPU & Cloud Compute Hours',
    description: 'Total dedicated GPU cluster and vCPU compute runtime',
    eventType: 'cloud.compute',
    aggregationType: AGGREGATION_TYPES.SUM,
    valueProperty: 'vCpuHours',
    unit: 'vCPU-hrs',
    active: true
  },
  {
    id: 'mtr_active_users',
    code: 'monthly_active_users',
    name: 'Monthly Active Users (MAU)',
    description: 'Deduplicated unique user identities interacting within the cycle',
    eventType: 'user.session',
    aggregationType: AGGREGATION_TYPES.UNIQUE_COUNT,
    valueProperty: 'userId',
    unit: 'users',
    active: true
  },
  {
    id: 'mtr_hot_storage',
    code: 'hot_storage_peak',
    name: 'Peak Data Lake Storage',
    description: 'High watermark storage footprint across S3 and vector databases',
    eventType: 'storage.snapshot',
    aggregationType: AGGREGATION_TYPES.MAX,
    valueProperty: 'storageGb',
    unit: 'GB',
    active: true
  }
];

const SEED_PLANS = [
  {
    id: 'plan_enterprise_ai',
    name: 'Enterprise AI & Scale',
    code: 'enterprise-ai-scale',
    description: 'Designed for high-scale AI applications with tiered graduated pricing',
    baseFee: 39999.00,
    currency: 'INR',
    active: true,
    rateCards: [
      {
        meterCode: 'llm_tokens_total',
        pricingModel: PRICING_MODELS.GRADUATED,
        freeAllowance: 100000,
        tiers: [
          { upTo: 500000, unitPrice: 0.0020 },
          { upTo: 2500000, unitPrice: 0.0015 },
          { upTo: null, unitPrice: 0.0008 }
        ]
      },
      {
        meterCode: 'api_requests_total',
        pricingModel: PRICING_MODELS.PACKAGE,
        freeAllowance: 50000,
        packageSize: 10000,
        packagePrice: 400.00
      },
      {
        meterCode: 'gpu_compute_hours',
        pricingModel: PRICING_MODELS.FLAT_FEE,
        freeAllowance: 50,
        unitPrice: 20.00
      },
      {
        meterCode: 'monthly_active_users',
        pricingModel: PRICING_MODELS.GRADUATED,
        freeAllowance: 500,
        tiers: [
          { upTo: 5000, unitPrice: 6.50 },
          { upTo: null, unitPrice: 3.25 }
        ]
      },
      {
        meterCode: 'hot_storage_peak',
        pricingModel: PRICING_MODELS.FLAT_FEE,
        freeAllowance: 100,
        unitPrice: 2.50
      }
    ]
  },
  {
    id: 'plan_fintech_throughput',
    name: 'FinTech High-Throughput',
    code: 'fintech-throughput',
    description: 'Volume discount pricing designed for banking and financial gateways',
    baseFee: 79999.00,
    currency: 'INR',
    active: true,
    rateCards: [
      {
        meterCode: 'api_requests_total',
        pricingModel: PRICING_MODELS.VOLUME,
        freeAllowance: 100000,
        tiers: [
          { upTo: 500000, unitPrice: 0.0008 },
          { upTo: 5000000, unitPrice: 0.0004 },
          { upTo: null, unitPrice: 0.0002 }
        ]
      },
      {
        meterCode: 'llm_tokens_total',
        pricingModel: PRICING_MODELS.GRADUATED,
        freeAllowance: 50000,
        tiers: [
          { upTo: 1000000, unitPrice: 0.0018 },
          { upTo: null, unitPrice: 0.0010 }
        ]
      }
    ]
  },
  {
    id: 'plan_growth_dev',
    name: 'Growth Developer',
    code: 'growth-developer',
    description: 'Pay-as-you-go starter plan for fast-growing startups',
    baseFee: 3999.00,
    currency: 'INR',
    active: true,
    rateCards: [
      {
        meterCode: 'llm_tokens_total',
        pricingModel: PRICING_MODELS.FLAT_FEE,
        freeAllowance: 25000,
        unitPrice: 0.0025
      },
      {
        meterCode: 'api_requests_total',
        pricingModel: PRICING_MODELS.FLAT_FEE,
        freeAllowance: 10000,
        unitPrice: 0.0012
      }
    ]
  }
];

const SEED_CUSTOMERS = [
  {
    id: 'cust_anthropic_res',
    name: 'Anthropic AI Research',
    company: 'Anthropic PBC',
    email: 'billing@anthropic.com',
    billingEmail: 'billing@anthropic.com',
    planId: 'plan_enterprise_ai',
    budgetLimit: 1000000,
    currentPeriodStart: new Date(Date.now() - 14 * 86400000)
  },
  {
    id: 'cust_scale_ai',
    name: 'Scale Data Systems',
    company: 'Scale AI Corp',
    email: 'accounts@scale.ai',
    billingEmail: 'accounts@scale.ai',
    planId: 'plan_enterprise_ai',
    budgetLimit: 650000,
    currentPeriodStart: new Date(Date.now() - 20 * 86400000)
  },
  {
    id: 'cust_acme_corp',
    name: 'Acme Global FinTech',
    company: 'Acme Payments International',
    email: 'finance@acmepayments.com',
    billingEmail: 'finance@acmepayments.com',
    planId: 'plan_fintech_throughput',
    budgetLimit: 1500000,
    currentPeriodStart: new Date(Date.now() - 8 * 86400000)
  },
  {
    id: 'cust_hyperion_labs',
    name: 'Hyperion Cloud Labs',
    company: 'Hyperion Labs Ltd',
    email: 'ops@hyperionlabs.io',
    billingEmail: 'ops@hyperionlabs.io',
    planId: 'plan_growth_dev',
    budgetLimit: 120000,
    currentPeriodStart: new Date(Date.now() - 3 * 86400000)
  }
];

/**
 * Seeds Mongoose collections and memory registers
 */
export async function seedInitialData() {
  // Always register in memory store for instant zero-latency retrieval
  for (const m of SEED_METERS) {
    memoryStore.meters.set(m.id, m);
    memoryStore.meters.set(m.code, m);
    meteringEngine.registerMeterDefinition(m);
  }

  for (const p of SEED_PLANS) {
    memoryStore.pricingPlans.set(p.id, p);
    memoryStore.pricingPlans.set(p.code, p);
  }

  for (const c of SEED_CUSTOMERS) {
    memoryStore.customers.set(c.id, c);
  }

  // If MongoDB is actively connected, persist directly into Mongoose collections
  if (mongoose.connection.readyState === 1) {
    try {
      console.log('🌱 [Seeder] Populating Mongoose MongoDB collections...');
      for (const m of SEED_METERS) {
        await Meter.findOneAndUpdate({ code: m.code }, { $set: m }, { upsert: true, new: true });
      }
      for (const p of SEED_PLANS) {
        await PricingPlan.findOneAndUpdate({ code: p.code }, { $set: p }, { upsert: true, new: true });
      }
      for (const c of SEED_CUSTOMERS) {
        await Customer.findOneAndUpdate({ id: c.id }, { $set: c }, { upsert: true, new: true });
      }
      console.log('✅ [Seeder] Seed fixtures saved into MongoDB collections via Mongoose.');
    } catch (err) {
      console.warn('[Seeder] Notice during Mongoose collection seeding:', err.message);
    }
  }
}

export default seedInitialData;
