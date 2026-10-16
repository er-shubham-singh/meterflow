import mongoose from 'mongoose';
import { meteringEngine } from './meteringEngine.js';
import { Customer } from '../models/Customer.js';
import { memoryStore } from '../data/seed.js';

/**
 * ==============================================================================
 * 🚀 SIMULATOR SERVICE
 * ==============================================================================
 * High-throughput synthetic traffic generator for multi-tenant billing simulation.
 * Ingests events asynchronously into the metering engine pipeline.
 * ==============================================================================
 */
class SimulatorService {
  constructor() {
    this.intervalId = null;
    this.isRunning = false;
    this.currentRate = 20; // events/sec
    this.activeScenario = 'mixed';
  }

  async _getCustomers() {
    let customers = [];
    if (mongoose.connection.readyState === 1) {
      try {
        customers = await Customer.find().lean();
      } catch {
        customers = [];
      }
    }
    if (!customers || customers.length === 0) {
      customers = Array.from(memoryStore.customers.values());
    }
    return customers;
  }

  start(rate = 20, scenario = 'mixed') {
    if (this.isRunning) {
      this.stop();
    }
    this.isRunning = true;
    this.currentRate = Math.min(Math.max(1, rate), 250);
    this.activeScenario = scenario;

    const intervalMs = Math.max(10, Math.floor(1000 / this.currentRate));
    const batchSize = Math.max(1, Math.floor(this.currentRate / (1000 / intervalMs)));

    this.intervalId = setInterval(async () => {
      const customers = await this._getCustomers();
      if (customers.length === 0) return;

      const events = [];
      for (let i = 0; i < batchSize; i++) {
        const randCust = customers[Math.floor(Math.random() * customers.length)];
        events.push(this.generateSyntheticEvent(randCust.id, this.activeScenario));
      }
      meteringEngine.processBatch(events);
    }, intervalMs);

    return {
      running: true,
      rate: this.currentRate,
      scenario: this.activeScenario
    };
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    return { running: false };
  }

  async triggerBurst(count = 100, scenario = 'mixed', customerId = null) {
    const customers = await this._getCustomers();
    if (customers.length === 0) return { error: 'No customers found' };

    const events = [];
    for (let i = 0; i < count; i++) {
      const targetCustId = customerId || customers[Math.floor(Math.random() * customers.length)].id;
      events.push(this.generateSyntheticEvent(targetCustId, scenario));
    }

    const result = await meteringEngine.processBatch(events);
    return {
      burstCompleted: true,
      requestedCount: count,
      ingested: result.ingested,
      duplicates: result.duplicates,
      durationMs: result.durationMs,
      throughputPerSec: result.durationMs > 0 ? Math.round((result.ingested / result.durationMs) * 1000) : result.ingested
    };
  }

  generateSyntheticEvent(customerId, scenario = 'mixed') {
    const scenarios = ['ai_tokens', 'api_calls', 'compute_hours', 'unique_users', 'storage_gb'];
    const chosen = scenario === 'mixed' ? scenarios[Math.floor(Math.random() * scenarios.length)] : scenario;

    switch (chosen) {
      case 'ai_tokens': {
        const models = ['claude-3-5-sonnet', 'gpt-4o', 'llama-3.3-70b', 'deepseek-v3'];
        const model = models[Math.floor(Math.random() * models.length)];
        const promptTokens = Math.floor(120 + Math.random() * 1500);
        const completionTokens = Math.floor(50 + Math.random() * 800);
        const totalTokens = promptTokens + completionTokens;

        return {
          customerId,
          eventType: 'ai.completion',
          properties: {
            model,
            promptTokens,
            completionTokens,
            tokens: totalTokens,
            costEstimated: Number((totalTokens * 0.000015).toFixed(6)),
            latencyMs: Math.floor(200 + Math.random() * 600)
          },
          timestamp: new Date().toISOString()
        };
      }

      case 'api_calls': {
        const endpoints = ['/v1/inference', '/v1/embeddings', '/v1/vector/search', '/v1/models'];
        return {
          customerId,
          eventType: 'api.request',
          properties: {
            endpoint: endpoints[Math.floor(Math.random() * endpoints.length)],
            statusCode: 200,
            region: ['us-east-1', 'eu-west-1', 'ap-southeast-1'][Math.floor(Math.random() * 3)],
            durationMs: Math.floor(15 + Math.random() * 90),
            units: 1
          },
          timestamp: new Date().toISOString()
        };
      }

      case 'compute_hours': {
        return {
          customerId,
          eventType: 'cloud.compute',
          properties: {
            instanceType: ['gpu.a100.80gb', 'cpu.c6i.8xlarge', 't4.micro'][Math.floor(Math.random() * 3)],
            vCpuHours: Number((0.1 + Math.random() * 0.9).toFixed(3)),
            memoryGbHours: Number((0.5 + Math.random() * 3.5).toFixed(2)),
            clusterId: `cluster-prod-${Math.floor(Math.random() * 8)}`
          },
          timestamp: new Date().toISOString()
        };
      }

      case 'unique_users': {
        const userId = `usr_${Math.floor(1000 + Math.random() * 9000)}`;
        return {
          customerId,
          eventType: 'user.session',
          properties: {
            userId,
            ip: `192.168.1.${Math.floor(Math.random() * 255)}`,
            country: 'US',
            device: 'desktop'
          },
          timestamp: new Date().toISOString()
        };
      }

      case 'storage_gb': {
        return {
          customerId,
          eventType: 'storage.snapshot',
          properties: {
            bucket: 'enterprise-data-lake',
            storageGb: Number((50 + Math.random() * 450).toFixed(2)),
            tier: 'hot'
          },
          timestamp: new Date().toISOString()
        };
      }

      default:
        return {
          customerId,
          eventType: 'api.request',
          properties: { count: 1 },
          timestamp: new Date().toISOString()
        };
    }
  }

  getStatus() {
    return {
      running: this.isRunning,
      rate: this.currentRate,
      scenario: this.activeScenario
    };
  }
}

export const simulatorService = new SimulatorService();
export default simulatorService;
