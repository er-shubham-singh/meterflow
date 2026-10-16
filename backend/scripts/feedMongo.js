import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env
dotenv.config({ path: path.join(__dirname, '../.env') });

import { Meter } from '../models/Meter.js';
import { PricingPlan } from '../models/PricingPlan.js';
import { Customer } from '../models/Customer.js';
import { Event } from '../models/Event.js';
import { Invoice } from '../models/Invoice.js';
import { WebhookLog } from '../models/WebhookLog.js';
import { AGGREGATION_TYPES, PRICING_MODELS, INVOICE_STATUS } from '../config/constants.js';

const mongoUri = process.env.MONGO_URI;

async function feedDatabase() {
  console.log('=======================================================');
  console.log('🍃 Feeding Seed Data into MongoDB Atlas Collection...');
  console.log(`Connecting to: ${mongoUri.replace(/:([^:@]{4})[^:@]*@/, ':****@')}`);
  console.log('=======================================================');

  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000
    });
    console.log('✅ Connected to MongoDB Atlas successfully!\n');

    // 1. Feed Meters
    console.log('📦 1. Seeding Consumption Meters (collections: "meters")...');
    const meters = [
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

    for (const m of meters) {
      await Meter.findOneAndUpdate({ code: m.code }, { $set: m }, { upsert: true, new: true });
    }
    console.log(`   ✓ Seeded ${meters.length} meters.`);

    // 2. Feed Pricing Plans
    console.log('\n💳 2. Seeding Pricing Plans (collections: "pricingplans")...');
    const plans = [
      {
        id: 'plan_enterprise_ai',
        name: 'Enterprise AI & Scale',
        code: 'enterprise-ai-scale',
        description: 'Designed for high-scale AI applications with tiered graduated pricing',
        baseFee: 499.00,
        currency: 'USD',
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
            packagePrice: 5.00
          },
          {
            meterCode: 'gpu_compute_hours',
            pricingModel: PRICING_MODELS.FLAT_FEE,
            freeAllowance: 50,
            unitPrice: 0.25
          },
          {
            meterCode: 'monthly_active_users',
            pricingModel: PRICING_MODELS.GRADUATED,
            freeAllowance: 500,
            tiers: [
              { upTo: 5000, unitPrice: 0.08 },
              { upTo: null, unitPrice: 0.04 }
            ]
          },
          {
            meterCode: 'hot_storage_peak',
            pricingModel: PRICING_MODELS.FLAT_FEE,
            freeAllowance: 100,
            unitPrice: 0.03
          }
        ]
      },
      {
        id: 'plan_fintech_throughput',
        name: 'FinTech High-Throughput',
        code: 'fintech-throughput',
        description: 'Volume discount pricing designed for banking and financial gateways',
        baseFee: 999.00,
        currency: 'USD',
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
        baseFee: 49.00,
        currency: 'USD',
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

    for (const p of plans) {
      await PricingPlan.findOneAndUpdate({ code: p.code }, { $set: p }, { upsert: true, new: true });
    }
    console.log(`   ✓ Seeded ${plans.length} pricing plans.`);

    // 3. Feed Customers
    console.log('\n👤 3. Seeding Customer Tenant Accounts (collections: "customers")...');
    const customers = [
      {
        id: 'cust_anthropic_res',
        name: 'Anthropic AI Research',
        company: 'Anthropic PBC',
        email: 'billing@anthropic.com',
        billingEmail: 'billing@anthropic.com',
        planId: 'plan_enterprise_ai',
        budgetLimit: 12500,
        currentPeriodStart: new Date(Date.now() - 14 * 86400000)
      },
      {
        id: 'cust_scale_ai',
        name: 'Scale Data Systems',
        company: 'Scale AI Corp',
        email: 'accounts@scale.ai',
        billingEmail: 'accounts@scale.ai',
        planId: 'plan_enterprise_ai',
        budgetLimit: 8000,
        currentPeriodStart: new Date(Date.now() - 20 * 86400000)
      },
      {
        id: 'cust_acme_corp',
        name: 'Acme Global FinTech',
        company: 'Acme Payments International',
        email: 'finance@acmepayments.com',
        billingEmail: 'finance@acmepayments.com',
        planId: 'plan_fintech_throughput',
        budgetLimit: 20000,
        currentPeriodStart: new Date(Date.now() - 8 * 86400000)
      },
      {
        id: 'cust_hyperion_labs',
        name: 'Hyperion Cloud Labs',
        company: 'Hyperion Labs Ltd',
        email: 'ops@hyperionlabs.io',
        billingEmail: 'ops@hyperionlabs.io',
        planId: 'plan_growth_dev',
        budgetLimit: 1500,
        currentPeriodStart: new Date(Date.now() - 3 * 86400000)
      }
    ];

    for (const c of customers) {
      await Customer.findOneAndUpdate({ id: c.id }, { $set: c }, { upsert: true, new: true });
    }
    console.log(`   ✓ Seeded ${customers.length} customer accounts.`);

    // 4. Feed Initial Telemetry Events
    console.log('\n📡 4. Seeding Initial Billable Telemetry Events (collections: "events")...');
    const initialEvents = [
      {
        id: 'evt_init_ai_001',
        customerId: 'cust_anthropic_res',
        eventType: 'ai.completion',
        properties: { model: 'claude-3-5-sonnet', tokens: 18450, promptTokens: 12000, completionTokens: 6450 },
        timestamp: new Date(Date.now() - 60000),
        idempotencyKey: 'idem_ai_001'
      },
      {
        id: 'evt_init_ai_002',
        customerId: 'cust_scale_ai',
        eventType: 'ai.completion',
        properties: { model: 'gpt-4o', tokens: 42100, promptTokens: 30000, completionTokens: 12100 },
        timestamp: new Date(Date.now() - 50000),
        idempotencyKey: 'idem_ai_002'
      },
      {
        id: 'evt_init_api_001',
        customerId: 'cust_acme_corp',
        eventType: 'api.request',
        properties: { endpoint: '/v1/payments/settle', units: 1, region: 'us-east-1' },
        timestamp: new Date(Date.now() - 40000),
        idempotencyKey: 'idem_api_001'
      },
      {
        id: 'evt_init_cloud_001',
        customerId: 'cust_anthropic_res',
        eventType: 'cloud.compute',
        properties: { instanceType: 'gpu.a100.80gb', vCpuHours: 8.5 },
        timestamp: new Date(Date.now() - 30000),
        idempotencyKey: 'idem_cloud_001'
      },
      {
        id: 'evt_init_storage_001',
        customerId: 'cust_scale_ai',
        eventType: 'storage.snapshot',
        properties: { bucket: 'vector-embeddings', storageGb: 350.25 },
        timestamp: new Date(Date.now() - 20000),
        idempotencyKey: 'idem_storage_001'
      }
    ];

    for (const evt of initialEvents) {
      await Event.findOneAndUpdate({ id: evt.id }, { $set: evt }, { upsert: true, new: true });
    }
    console.log(`   ✓ Seeded ${initialEvents.length} initial telemetry events.`);

    // 5. Feed Initial Invoices & Webhook Feeds
    console.log('\n🧾 5. Seeding Initial Invoices & Billing Feeds (collections: "invoices", "webhooklogs")...');
    const invoiceNumber = `INV-${new Date().getFullYear()}-108241`;
    const invoiceData = {
      id: 'inv_init_demo_01',
      invoiceNumber,
      customerId: 'cust_anthropic_res',
      customerName: 'Anthropic PBC',
      planId: 'plan_enterprise_ai',
      planName: 'Enterprise AI & Scale',
      periodStart: new Date(Date.now() - 30 * 86400000),
      periodEnd: new Date(),
      lineItems: [
        {
          meterCode: 'llm_tokens_total',
          meterName: 'LLM Generative Tokens',
          unit: 'tokens',
          aggregationType: 'SUM',
          quantity: 480000,
          billableQuantity: 380000,
          freeAllowance: 100000,
          pricingModel: 'GRADUATED',
          tierBreakdown: [{ tier: 1, range: '0 – 500,000', unitsConsumed: 380000, unitPrice: 0.002, cost: 760.00 }],
          amount: 760.00
        },
        {
          meterCode: 'api_requests_total',
          meterName: 'API Gateway Invocations',
          unit: 'requests',
          aggregationType: 'COUNT',
          quantity: 95000,
          billableQuantity: 45000,
          freeAllowance: 50000,
          pricingModel: 'PACKAGE',
          tierBreakdown: [{ tier: 1, range: '5 blocks of 10,000', unitsConsumed: 45000, unitPrice: 5.00, cost: 25.00 }],
          amount: 25.00
        }
      ],
      subtotal: 1284.00,
      tax: 0,
      total: 1284.00,
      currency: 'USD',
      status: INVOICE_STATUS.FINALIZED,
      billingSystemSync: {
        provider: 'Stripe Billing System',
        syncedAt: new Date().toISOString(),
        syncStatus: 'SUCCESS',
        externalReferenceId: 'stripe_sub_demo_seed_498'
      }
    };

    await Invoice.findOneAndUpdate({ id: invoiceData.id }, { $set: invoiceData }, { upsert: true, new: true });
    console.log('   ✓ Seeded invoice: ' + invoiceNumber);

    const webhookData = {
      id: 'wh_init_demo_01',
      timestamp: new Date(),
      invoiceNumber,
      customer: 'Anthropic PBC',
      totalAmount: 1284.00,
      currency: 'USD',
      provider: 'Stripe Billing API & NetSuite',
      signature: 't=1730000000,v1=9fa8102b489c...',
      status: 'DELIVERED',
      statusCode: 200,
      responseTimeMs: 24,
      payload: {
        id: 'evt_hook_seed_01',
        type: 'billing.usage_record.created',
        invoiceNumber,
        total: 1284.00
      }
    };

    await WebhookLog.findOneAndUpdate({ id: webhookData.id }, { $set: webhookData }, { upsert: true, new: true });
    console.log('   ✓ Seeded webhook billing feed log.');

    console.log('\n=======================================================');
    console.log('🎉 MongoDB Atlas Seeding Completed Successfully!');
    console.log('=======================================================');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error feeding database:', err.message);
    process.exit(1);
  }
}

feedDatabase();
