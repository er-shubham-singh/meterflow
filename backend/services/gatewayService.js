import { v4 as uuidv4 } from 'uuid';
import { memoryStore } from '../data/seed.js';
import { meteringEngine } from './meteringEngine.js';

/**
 * Rates per unit in INR (₹)
 */
const PROVIDER_RATES = {
  openai: { base: 0.05, perToken: 0.00015 },
  gemini: { base: 0.04, perToken: 0.00010 },
  brevo: { base: 0.08, perEmail: 0.08 },
  twilio: { base: 0.35, perSms: 0.35 },
  razorpay: { base: 2.00, perTxn: 2.00 },
  aws: { base: 0.12, perHour: 1.50 },
  azure: { base: 0.06, perToken: 0.00012 },
  internal: { base: 0.00, perReq: 0.00 }
};

export const gatewayService = {
  /**
   * Process a proxy request from API Playground or external client
   */
  async processRequest({ apiKey, provider = 'openai', method = 'POST', endpoint = '/v1/chat/completions', headers = {}, body = {} }) {
    const startTime = Date.now();
    const normalizedProvider = (provider || 'openai').toLowerCase().trim();

    // 1. Verify API Key
    let keyDoc = null;
    if (apiKey) {
      keyDoc = Array.from(memoryStore.apiKeys.values()).find(k => 
        k.maskedKey === apiKey || k.rawKey === apiKey || apiKey.startsWith('sk_mf_')
      );
    }

    if (!keyDoc) {
      // Default fallback demo key if testing directly in playground without auth
      keyDoc = Array.from(memoryStore.apiKeys.values())[0] || {
        id: 'key_prod_01',
        name: 'Production Key',
        userName: 'Amit Kumar',
        userId: 'usr_amit_kumar',
        teamName: 'Development Team',
        monthlyLimit: 20000,
        currentUsage: 12450
      };
    }

    // 2. Check quota limit
    if (keyDoc.currentUsage >= keyDoc.monthlyLimit) {
      const errResponse = {
        error: {
          message: `Monthly request quota of ${keyDoc.monthlyLimit.toLocaleString()} requests exceeded for this API key.`,
          type: 'quota_exceeded',
          code: 'rate_limit_exceeded',
          budgetStatus: '100% utilized'
        }
      };
      return {
        statusCode: 429,
        latencyMs: 1.2,
        data: errResponse
      };
    }

    // 3. Compute realistic tokens, units and cost in INR
    let promptTokens = 12;
    let completionTokens = 45;
    let totalTokens = 57;
    let costInr = 0.05;

    if (body && typeof body === 'object') {
      const promptText = JSON.stringify(body.messages || body.prompt || body);
      promptTokens = Math.max(8, Math.round(promptText.length / 4));
      completionTokens = Math.floor(Math.random() * 60) + 30;
      totalTokens = promptTokens + completionTokens;
    }

    const rateConfig = PROVIDER_RATES[normalizedProvider] || PROVIDER_RATES.openai;
    costInr = Number((rateConfig.base + (rateConfig.perToken || 0) * totalTokens).toFixed(4));

    // 4. Formulate realistic response payload based on provider
    let responsePayload = {};
    const executionId = uuidv4().slice(0, 10);

    if (normalizedProvider === 'openai') {
      responsePayload = {
        id: `chatcmpl-${executionId}`,
        object: 'chat.completion',
        created: Math.floor(Date.now() / 1000),
        model: body.model || 'gpt-4o-mini',
        choices: [
          {
            index: 0,
            message: {
              role: 'assistant',
              content: 'Machine learning is a subset of artificial intelligence where algorithms learn patterns from data to make predictions or decisions without explicit programming.'
            },
            finish_reason: 'stop'
          }
        ],
        usage: {
          prompt_tokens: promptTokens,
          completion_tokens: completionTokens,
          total_tokens: totalTokens
        },
        meterflow_meta: {
          provider: 'OpenAI',
          cost_inr: `₹${costInr}`,
          authenticated_user: keyDoc.userName,
          team: keyDoc.teamName
        }
      };
    } else if (normalizedProvider === 'gemini') {
      responsePayload = {
        candidates: [
          {
            content: {
              parts: [{ text: 'Google Gemini response processed through MeterFlow secure proxy.' }],
              role: 'model'
            },
            finishReason: 'STOP'
          }
        ],
        usageMetadata: {
          promptTokenCount: promptTokens,
          candidatesTokenCount: completionTokens,
          totalTokenCount: totalTokens
        },
        meterflow_meta: {
          provider: 'Google Gemini',
          cost_inr: `₹${costInr}`
        }
      };
    } else if (normalizedProvider === 'brevo') {
      costInr = 0.08;
      responsePayload = {
        messageId: `<${executionId}@smtp-relay.brevo.com>`,
        status: 'queued',
        recipientCount: 1,
        meterflow_meta: {
          provider: 'Brevo (Email)',
          cost_inr: `₹${costInr}`
        }
      };
    } else if (normalizedProvider === 'twilio') {
      costInr = 0.35;
      responsePayload = {
        sid: `SM${executionId}89ab2`,
        status: 'delivered',
        direction: 'outbound-api',
        price: '0.35',
        priceUnit: 'INR',
        meterflow_meta: {
          provider: 'Twilio (SMS & Voice)',
          cost_inr: `₹${costInr}`
        }
      };
    } else if (normalizedProvider === 'razorpay') {
      costInr = 2.00;
      responsePayload = {
        id: `order_${executionId}`,
        entity: 'order',
        amount: 50000,
        amount_paid: 0,
        amount_due: 50000,
        currency: 'INR',
        receipt: `rcpt_${executionId}`,
        status: 'created',
        meterflow_meta: {
          provider: 'Razorpay',
          cost_inr: `₹${costInr}`
        }
      };
    } else {
      // Internal or Custom API
      costInr = 0.00;
      responsePayload = {
        status: 'success',
        service: 'MeterFlow Internal Orders API',
        data: {
          orderId: `ORD-${executionId.toUpperCase()}`,
          fulfillmentStatus: 'PROCESSED',
          timestamp: new Date().toISOString()
        },
        meterflow_meta: {
          provider: 'Internal API',
          cost_inr: '₹0.00 (Company Internal Showback)'
        }
      };
    }

    const latencyMs = Math.round(Date.now() - startTime + (Math.random() * 8 + 1.2));

    // 5. Ingest usage event asynchronously into pipeline
    const eventPayload = {
      eventId: `evt_gw_${uuidv4()}`,
      customerId: 'cust_abc_tech',
      eventType: 'api.request',
      properties: {
        provider: normalizedProvider,
        endpoint,
        method,
        statusCode: 200,
        tokens: totalTokens,
        units: 1,
        costInr,
        employeeName: keyDoc.userName,
        employeeId: keyDoc.userId,
        apiKeyId: keyDoc.id,
        teamName: keyDoc.teamName,
        latencyMs
      },
      timestamp: new Date().toISOString()
    };

    // Update in-memory counters immediately
    keyDoc.currentUsage = (keyDoc.currentUsage || 0) + 1;
    keyDoc.lastUsedAt = new Date();

    if (memoryStore.companyDashboard) {
      memoryStore.companyDashboard.totalRequests += 1;
      memoryStore.companyDashboard.totalCost += costInr;
    }

    // Add to recent activity table
    if (memoryStore.recentActivity) {
      const nowStr = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
      memoryStore.recentActivity.unshift({
        id: `act_${Date.now()}`,
        time: nowStr,
        employee: keyDoc.userName,
        api: normalizedProvider === 'openai' ? 'OpenAI' : normalizedProvider === 'gemini' ? 'Google Gemini' : normalizedProvider.toUpperCase(),
        status: 200
      });
      if (memoryStore.recentActivity.length > 25) {
        memoryStore.recentActivity.pop();
      }
    }

    // Send through telemetry engine
    meteringEngine.processEvent(eventPayload);

    return {
      statusCode: 200,
      latencyMs,
      data: responsePayload
    };
  }
};

export default gatewayService;
