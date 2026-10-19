import mongoose from 'mongoose';
import { Meter } from '../models/Meter.js';
import { PricingPlan } from '../models/PricingPlan.js';
import { Customer } from '../models/Customer.js';
import { User } from '../models/User.js';
import { AGGREGATION_TYPES, PRICING_MODELS } from '../config/constants.js';
import { meteringEngine } from '../services/meteringEngine.js';

// Fallback in-memory registries when MongoDB is disconnected or booting
export const memoryStore = {
  users: new Map(),
  meters: new Map(),
  pricingPlans: new Map(),
  customers: new Map(),
  invoices: new Map(),
  webhookLogs: [],
  apiKeys: new Map(),
  apiProviders: new Map(),
  activeUser: {
    id: 'usr_rahul_sharma',
    name: 'Rahul Sharma',
    email: 'rahul.sharma@abctech.com',
    role: 'organization_admin',
    roleLabel: 'Admin',
    teamName: 'Leadership',
    organization: {
      id: 'org_abc_tech',
      name: 'ABC Technologies',
      plan: 'Enterprise Plan',
      currency: 'INR'
    }
  },
  companyDashboard: {
    totalRequests: 245230,
    totalRequestsChange: '+12% from last month',
    totalCost: 12450,
    totalCostChange: '+8% from last month',
    activeEmployees: 28,
    activeEmployeesChange: '+2 new this month',
    connectedApis: 8,
    connectedApisDetail: '3 third-party, 5 internal'
  },
  usageTrend: [
    { date: 'Oct 1', requests: 4200, cost: 210 },
    { date: 'Oct 3', requests: 6800, cost: 340 },
    { date: 'Oct 5', requests: 5900, cost: 295 },
    { date: 'Oct 7', requests: 7400, cost: 370 },
    { date: 'Oct 9', requests: 8900, cost: 445 },
    { date: 'Oct 11', requests: 6200, cost: 310 },
    { date: 'Oct 13', requests: 9500, cost: 475 },
    { date: 'Oct 15', requests: 11200, cost: 560 },
    { date: 'Oct 17', requests: 10400, cost: 520 },
    { date: 'Oct 19', requests: 8800, cost: 440 },
    { date: 'Oct 21', requests: 12100, cost: 605 },
    { date: 'Oct 23', requests: 13400, cost: 670 },
    { date: 'Oct 25', requests: 11900, cost: 595 },
    { date: 'Oct 27', requests: 14200, cost: 710 },
    { date: 'Oct 29', requests: 15600, cost: 780 },
    { date: 'Oct 31', requests: 16800, cost: 840 }
  ],
  providerDistribution: [
    { name: 'OpenAI', percentage: 40, requests: 98092, color: '#10B981' },
    { name: 'Internal APIs', percentage: 25, requests: 61307, color: '#2563EB' },
    { name: 'Google Maps', percentage: 15, requests: 36784, color: '#F59E0B' },
    { name: 'Brevo (Email)', percentage: 10, requests: 24523, color: '#6366F1' },
    { name: 'Razorpay', percentage: 5, requests: 12261, color: '#06B6D4' },
    { name: 'Others', percentage: 5, requests: 12263, color: '#94A3B8' }
  ],
  topEmployees: [
    { id: 1, name: 'Rahul Verma', requests: 48230, costInr: 3450, role: 'Lead ML Engineer', team: 'AI Team' },
    { id: 2, name: 'Priya Singh', requests: 32450, costInr: 2120, role: 'Backend Architect', team: 'Development Team' },
    { id: 3, name: 'Amit Kumar', requests: 28120, costInr: 1890, role: 'Fullstack Developer', team: 'Development Team' },
    { id: 4, name: 'Neha Sharma', requests: 21340, costInr: 1250, role: 'Integration Specialist', team: 'Development Team' },
    { id: 5, name: 'Vikash Yadav', requests: 18220, costInr: 980, role: 'Frontend Engineer', team: 'Marketing Team' }
  ],
  recentActivity: [
    { id: 'act_1', time: '10:24 AM', employee: 'Rahul Verma', api: 'OpenAI', status: 200 },
    { id: 'act_2', time: '10:22 AM', employee: 'Priya Singh', api: 'Internal API', status: 200 },
    { id: 'act_3', time: '10:21 AM', employee: 'Amit Kumar', api: 'Google Maps', status: 200 },
    { id: 'act_4', time: '10:20 AM', employee: 'Rahul Verma', api: 'Brevo', status: 200 },
    { id: 'act_5', time: '10:18 AM', employee: 'Neha Sharma', api: 'Razorpay', status: 429 }
  ],
  budgetStatus: [
    { name: 'Company Budget', spent: 12450, limit: 50000, percentage: 24, status: 'normal' },
    { name: 'Development Team', spent: 8330, limit: 20000, percentage: 41, status: 'normal' },
    { name: 'AI Team', spent: 4120, limit: 10000, percentage: 41, status: 'normal' },
    { name: 'Marketing Team', spent: 1230, limit: 5000, percentage: 25, status: 'normal' }
  ],
  platformOverview: {
    totalCustomers: 125,
    totalCustomersChange: '+8 this month',
    totalApiRequests: '4.2M',
    totalApiRequestsChange: '+12%',
    monthlyRevenue: '₹2,45,000',
    monthlyRevenueChange: '+18%',
    activeApis: 32,
    activeApisDetail: '18 third-party, 14 internal'
  },
  platformUsageTrend: [
    { date: 'Oct 1', requests: 95000, revenue: 6200 },
    { date: 'Oct 5', requests: 120000, revenue: 7800 },
    { date: 'Oct 10', requests: 145000, revenue: 9200 },
    { date: 'Oct 15', requests: 130000, revenue: 8400 },
    { date: 'Oct 20', requests: 175000, revenue: 11500 },
    { date: 'Oct 25', requests: 190000, revenue: 12800 },
    { date: 'Oct 31', requests: 210000, revenue: 14200 }
  ],
  platformTopCustomers: [
    { id: 1, customer: 'ABC Technologies', requests: '1.2M', revenueInr: 85000 },
    { id: 2, customer: 'REI/VANTA Tech', requests: '850K', revenueInr: 52000 },
    { id: 3, customer: 'NOVA Solutions', requests: '620K', revenueInr: 38000 },
    { id: 4, customer: 'Pearl Organisation', requests: '450K', revenueInr: 28000 },
    { id: 5, customer: 'AI Future Gen', requests: '320K', revenueInr: 21000 }
  ],
  providerHealth: [
    { provider: 'OpenAI', uptime: '99.9%', status: 'healthy', latency: '1.2ms' },
    { provider: 'Google Gemini', uptime: '99.8%', status: 'healthy', latency: '1.4ms' },
    { provider: 'Twilio', uptime: '99.9%', status: 'healthy', latency: '2.1ms' },
    { provider: 'Brevo', uptime: '99.7%', status: 'healthy', latency: '1.9ms' },
    { provider: 'Razorpay', uptime: '99.4%', status: 'degraded', latency: '4.8ms' }
  ],
  employeeDashboard: {
    employeeName: 'Amit Kumar',
    role: 'Developer',
    team: 'Development Team',
    myUsageThisMonth: 12450,
    myUsageChange: '+10%',
    estimatedCostInr: 850,
    estimatedCostChange: '+8%',
    monthlyLimit: 20000,
    limitPercent: 62,
    usageByApi: [
      { name: 'OpenAI', requests: 6230, percent: 50, color: '#10B981' },
      { name: 'Internal API', requests: 3450, percent: 28, color: '#2563EB' },
      { name: 'Brevo (Email)', requests: 1820, percent: 15, color: '#6366F1' },
      { name: 'Google Maps', requests: 950, percent: 7, color: '#F59E0B' }
    ],
    recentRequests: [
      { time: '10:24 AM', api: 'OpenAI', endpoint: '/v1/chat/completions', status: 200 },
      { time: '10:22 AM', api: 'Internal API', endpoint: '/v1/orders', status: 200 },
      { time: '10:21 AM', api: 'Brevo', endpoint: '/v3/smtp/email', status: 200 },
      { time: '10:18 AM', api: 'Google Maps', endpoint: '/maps/api/geocode', status: 200 },
      { time: '10:15 AM', api: 'OpenAI', endpoint: '/v1/embeddings', status: 200 }
    ]
  }
};

// Initial API Providers
const SEED_PROVIDERS = [
  { id: 'prv_openai', name: 'OpenAI', category: 'ai', isInternal: false, baseUrl: 'https://api.openai.com', status: 'healthy', uptimePercent: 99.9, latencyMs: 1.2, description: 'GPT-4o, GPT-4o-mini & Embeddings', icon: 'Bot' },
  { id: 'prv_gemini', name: 'Google AI (Gemini)', category: 'ai', isInternal: false, baseUrl: 'https://generativelanguage.googleapis.com', status: 'healthy', uptimePercent: 99.8, latencyMs: 1.4, description: 'Gemini 1.5 Pro & Flash models', icon: 'Sparkles' },
  { id: 'prv_azure', name: 'Azure AI', category: 'cloud', isInternal: false, baseUrl: 'https://eastus.api.cognitive.microsoft.com', status: 'healthy', uptimePercent: 99.9, latencyMs: 1.8, description: 'Enterprise Cognitive Services', icon: 'Cloud' },
  { id: 'prv_twilio', name: 'Twilio', category: 'sms', isInternal: false, baseUrl: 'https://api.twilio.com', status: 'healthy', uptimePercent: 99.9, latencyMs: 2.1, description: 'SMS, Voice & OTP Verification', icon: 'Phone' },
  { id: 'prv_brevo', name: 'Brevo', category: 'email', isInternal: false, baseUrl: 'https://api.brevo.com', status: 'healthy', uptimePercent: 99.7, latencyMs: 1.9, description: 'Transactional Emails & Webhooks', icon: 'Mail' },
  { id: 'prv_razorpay', name: 'Razorpay', category: 'payments', isInternal: false, baseUrl: 'https://api.razorpay.com', status: 'degraded', uptimePercent: 99.4, latencyMs: 4.8, description: 'UPI, NetBanking & Cards INR', icon: 'CreditCard' },
  { id: 'prv_aws', name: 'AWS Cloud Services', category: 'cloud', isInternal: false, baseUrl: 'https://aws.amazon.com', status: 'healthy', uptimePercent: 99.9, latencyMs: 1.1, description: 'Lambda, S3 & Bedrock Proxies', icon: 'Server' },
  { id: 'prv_internal_orders', name: 'Internal Orders API', category: 'internal', isInternal: true, baseUrl: 'http://internal-mesh.local/v1/orders', status: 'healthy', uptimePercent: 99.99, latencyMs: 0.8, description: 'Company Order Processing Service', icon: 'Layers' },
  { id: 'prv_internal_users', name: 'Internal Users API', category: 'internal', isInternal: true, baseUrl: 'http://internal-mesh.local/v1/users', status: 'healthy', uptimePercent: 99.99, latencyMs: 0.6, description: 'Core Auth & Employee Registry', icon: 'Users' }
];

// Initial API Keys matching Panel 5
const SEED_API_KEYS = [
  {
    id: 'key_prod_01',
    name: 'Production Key',
    rawKey: 'sk_mf_prod_1234abcd5678efgh9012ijkl',
    maskedKey: 'sk_mf_1234...abcd',
    hashedKey: '8f93e2b2c8a14b09e20a59f1d',
    environment: 'production',
    userName: 'Amit Kumar',
    userId: 'usr_amit_kumar',
    teamName: 'Development Team',
    monthlyLimit: 20000,
    currentUsage: 12450,
    status: 'active',
    lastUsedAt: new Date(Date.now() - 2 * 60000).toISOString(),
    createdAt: '2026-10-01T00:00:00.000Z'
  },
  {
    id: 'key_dev_01',
    name: 'Development Key',
    rawKey: 'sk_mf_dev_6678efgh1122ijkl3344mnop',
    maskedKey: 'sk_mf_6678...efgh',
    hashedKey: '3a5b7c9d1e2f4a6b8c0d2e4f6',
    environment: 'development',
    userName: 'Amit Kumar',
    userId: 'usr_amit_kumar',
    teamName: 'Development Team',
    monthlyLimit: 5000,
    currentUsage: 820,
    status: 'active',
    lastUsedAt: new Date(Date.now() - 15 * 60000).toISOString(),
    createdAt: '2026-10-05T00:00:00.000Z'
  }
];

// Existing Meters
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
      }
    ]
  }
];

const SEED_CUSTOMERS = [
  {
    id: 'cust_abc_tech',
    name: 'ABC Technologies',
    company: 'ABC Technologies Pvt Ltd',
    email: 'admin@abctech.com',
    billingEmail: 'finance@abctech.com',
    planId: 'plan_enterprise_ai',
    budgetLimit: 50000,
    currentTotalAccrued: 12450,
    currentPeriodStart: new Date(Date.now() - 18 * 86400000)
  }
];

const SEED_USERS = [
  {
    id: 'usr_rahul_admin',
    name: 'Rahul Sharma',
    email: 'admin@meterflow.io',
    password: 'password123',
    role: 'organization_admin',
    roleLabel: 'Admin',
    teamName: 'Executive Leadership',
    monthlyLimitInr: 100000,
    monthlyCostInr: 12450,
    monthlyRequests: 245230,
    apiKey: 'sk_mf_admin_9921fa84c20b',
    allowedProviders: ['OpenAI', 'Google Gemini', 'Azure AI', 'Twilio', 'Brevo', 'Internal Orders API'],
    organization: {
      id: 'org_abc_tech',
      name: 'ABC Technologies',
      plan: 'Enterprise Plan',
      currency: 'INR'
    },
    status: 'active'
  },
  {
    id: 'usr_amit_dev',
    name: 'Amit Kumar',
    email: 'amit.kumar@abctech.com',
    password: 'password123',
    role: 'developer',
    roleLabel: 'Fullstack Developer',
    teamName: 'Development Team',
    monthlyLimitInr: 20000,
    monthlyCostInr: 1890,
    monthlyRequests: 28120,
    apiKey: 'sk_mf_dev_6678efgh1122ijkl3344mnop',
    allowedProviders: ['OpenAI', 'Google Gemini', 'Internal APIs'],
    organization: {
      id: 'org_abc_tech',
      name: 'ABC Technologies',
      plan: 'Enterprise Plan',
      currency: 'INR'
    },
    status: 'active'
  },
  {
    id: 'usr_priya_arch',
    name: 'Priya Singh',
    email: 'priya.s@abctech.com',
    password: 'password123',
    role: 'developer',
    roleLabel: 'Backend Architect',
    teamName: 'Development Team',
    monthlyLimitInr: 20000,
    monthlyCostInr: 2120,
    monthlyRequests: 32450,
    apiKey: 'sk_mf_live_priya_8832abcd9120',
    allowedProviders: ['OpenAI', 'Azure AI', 'AWS Bedrock'],
    organization: {
      id: 'org_abc_tech',
      name: 'ABC Technologies',
      plan: 'Enterprise Plan',
      currency: 'INR'
    },
    status: 'active'
  },
  {
    id: 'usr_rahul_ml',
    name: 'Rahul Verma',
    email: 'rahul.v@abctech.com',
    password: 'password123',
    role: 'developer',
    roleLabel: 'Lead ML Engineer',
    teamName: 'AI Team',
    monthlyLimitInr: 25000,
    monthlyCostInr: 3450,
    monthlyRequests: 48230,
    apiKey: 'sk_mf_live_rahulv_7741bcde1234',
    allowedProviders: ['OpenAI', 'Google Gemini', 'Azure AI'],
    organization: {
      id: 'org_abc_tech',
      name: 'ABC Technologies',
      plan: 'Enterprise Plan',
      currency: 'INR'
    },
    status: 'active'
  },
  {
    id: 'usr_neha_int',
    name: 'Neha Sharma',
    email: 'neha.s@abctech.com',
    password: 'password123',
    role: 'developer',
    roleLabel: 'Integration Specialist',
    teamName: 'Development Team',
    monthlyLimitInr: 15000,
    monthlyCostInr: 1250,
    monthlyRequests: 21340,
    apiKey: 'sk_mf_live_nehas_5521cdef4321',
    allowedProviders: ['Brevo', 'Twilio', 'Internal Orders API'],
    organization: {
      id: 'org_abc_tech',
      name: 'ABC Technologies',
      plan: 'Enterprise Plan',
      currency: 'INR'
    },
    status: 'active'
  },
  {
    id: 'usr_vikash_mkt',
    name: 'Vikash Yadav',
    email: 'vikash.y@abctech.com',
    password: 'password123',
    role: 'developer',
    roleLabel: 'Growth Engineer',
    teamName: 'Marketing Team',
    monthlyLimitInr: 10000,
    monthlyCostInr: 980,
    monthlyRequests: 18220,
    apiKey: 'sk_mf_live_vikash_3311defa7890',
    allowedProviders: ['Brevo', 'Twilio', 'Razorpay'],
    organization: {
      id: 'org_abc_tech',
      name: 'ABC Technologies',
      plan: 'Enterprise Plan',
      currency: 'INR'
    },
    status: 'active'
  }
];

/**
 * Seeds Mongoose collections and memory registers
 */
export async function seedInitialData() {
  // 1. Populate memory store
  for (const u of SEED_USERS) {
    memoryStore.users.set(u.id, u);
    memoryStore.users.set(u.email.toLowerCase(), u);
  }

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

  for (const prv of SEED_PROVIDERS) {
    memoryStore.apiProviders.set(prv.id, prv);
  }

  for (const key of SEED_API_KEYS) {
    memoryStore.apiKeys.set(key.id, key);
  }

  // 2. If MongoDB is actively connected, persist directly into Mongoose collections
  if (mongoose.connection.readyState === 1) {
    try {
      console.log('🌱 [Seeder] Populating Mongoose MongoDB collections...');
      for (const u of SEED_USERS) {
        await User.findOneAndUpdate({ email: u.email.toLowerCase() }, { $set: u }, { upsert: true, new: true });
      }
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
