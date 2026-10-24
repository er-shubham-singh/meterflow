import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { memoryStore } from '../data/seed.js';

export const apiKeyController = {
  /**
   * GET /api/v1/api-keys
   * List API keys
   */
  async listApiKeys(req, res) {
    try {
      const keys = Array.from(memoryStore.apiKeys.values());
      res.status(200).json({ success: true, data: keys });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * POST /api/v1/api-keys
   * Create a new scoped API key
   */
  async createApiKey(req, res) {
    try {
      const { name, environment = 'production', monthlyLimit = 20000 } = req.body;
      if (!name) {
        return res.status(400).json({ success: false, message: 'API Key name is required' });
      }

      const randomSuffix = crypto.randomBytes(16).toString('hex');
      const rawKey = `sk_mf_${environment === 'production' ? 'prod_' : 'dev_'}${randomSuffix}`;
      const maskedKey = `${rawKey.slice(0, 11)}...${rawKey.slice(-4)}`;
      const hashedKey = crypto.createHash('sha256').update(rawKey).digest('hex');

      const keyDoc = {
        id: `key_${uuidv4().slice(0, 8)}`,
        name,
        rawKey, // Returned once upon creation
        maskedKey,
        hashedKey,
        environment,
        userName: 'Amit Kumar',
        userId: 'usr_amit_kumar',
        teamName: 'Development Team',
        monthlyLimit: Number(monthlyLimit) || 20000,
        currentUsage: 0,
        status: 'active',
        lastUsedAt: null,
        createdAt: new Date().toISOString()
      };

      memoryStore.apiKeys.set(keyDoc.id, keyDoc);

      res.status(201).json({
        success: true,
        message: 'API Key created successfully. Store this key safely as it will not be displayed again.',
        data: keyDoc
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * POST /api/v1/api-keys/:id/revoke
   * Revoke an existing API key
   */
  async revokeApiKey(req, res) {
    try {
      const { id } = req.params;
      const keyDoc = memoryStore.apiKeys.get(id);
      if (!keyDoc) {
        return res.status(404).json({ success: false, message: 'API Key not found' });
      }

      keyDoc.status = 'revoked';
      memoryStore.apiKeys.set(id, keyDoc);

      res.status(200).json({ success: true, message: 'API key revoked successfully', data: keyDoc });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * GET /api/v1/api-keys/employee-dashboard
   * Metrics for Screen 5 (Employee Dashboard / API Keys)
   */
  async getEmployeeDashboard(req, res) {
    try {
      const keys = Array.from(memoryStore.apiKeys.values());
      const authHeader = req.headers.authorization || '';
      const rawToken = authHeader.replace(/^Bearer\s+/i, '');

      let active = null;
      if (rawToken) {
        for (const u of memoryStore.users.values()) {
          if (u.apiKey === rawToken || (rawToken.startsWith('mf_session_') && rawToken.includes(u.id))) {
            active = u;
            break;
          }
        }
      }
      if (!active) {
        active = memoryStore.activeUser;
      }
      if (active && (active.email || active.id)) {
        const live = memoryStore.users.get((active.email || '').toLowerCase()) || memoryStore.users.get(active.id);
        if (live) active = { ...active, ...live };
      }
      if (!active || active.role === 'organization_admin') {
        const devUser = memoryStore.users.get('vikash.y@abctech.com') || memoryStore.users.get('usr_vikash_mkt');
        if (devUser) active = devUser;
      }

      const isDev = active && (active.role === 'developer' || active.role === 'employee');

      const employeeName = active?.name || 'Vikash Yadav';
      const role = active?.roleLabel || (isDev ? 'Growth Engineer' : 'Developer');
      const team = active?.teamName || 'Marketing Team';
      const monthlyLimit = active?.monthlyLimitInr || 10000;
      const myUsageThisMonth = active?.monthlyRequests || 18220;
      const monthlyRequestLimit = active?.monthlyRequestLimit || 50000;
      const requestsRemaining = active?.requestsRemaining ?? Math.max(0, monthlyRequestLimit - myUsageThisMonth);

      const tokensLimit = active?.tokensLimit || 250000;
      const tokensUsed = active?.tokensUsed ?? 0;
      const tokensRemaining = active?.tokensRemaining ?? Math.max(0, tokensLimit - tokensUsed);

      const estimatedCostInr = Number((active?.monthlyCostInr || 980).toFixed(2));
      const remainingBudgetInr = Math.max(0, Number((monthlyLimit - estimatedCostInr).toFixed(2)));
      const limitPercent = Math.min(100, Math.round((estimatedCostInr / monthlyLimit) * 100));

      // Dynamic quota utilization calculation (Audit Fix & TICKET-01)
      const requestQuotaLimit = 10000;
      const utilizationPercentage = Math.round((myUsageThisMonth / requestQuotaLimit) * 100);
      const isOverBudget = utilizationPercentage >= 100;
      const cardState = isOverBudget ? 'overBudget' : 'normal';

      // Get recent activity for this employee
      const recent = (memoryStore.recentActivity || []).filter(a => a.employee === employeeName).slice(0, 10);
      const recentRequests = recent.length > 0 ? recent.map(r => ({
        time: r.time,
        api: r.api,
        endpoint: r.api === 'OpenAI' ? '/v1/chat/completions' : r.api === 'Brevo' ? '/v3/smtp/email' : '/v1/gateway/proxy',
        status: r.status
      })) : [
        { time: 'Just now', api: 'Brevo', endpoint: '/v3/smtp/email', status: 200 },
        { time: '10:24 AM', api: 'Twilio', endpoint: '/v1/messages', status: 200 },
        { time: '10:18 AM', api: 'Razorpay', endpoint: '/v1/orders', status: 200 }
      ];

      res.status(200).json({
        success: true,
        data: {
          employeeName,
          role,
          team,
          myUsageThisMonth,
          myUsageChange: '+12%',
          monthlyRequestLimit,
          requestsRemaining,
          requestQuotaLimit,
          utilizationPercentage,
          isOverBudget,
          cardState,
          tokensLimit,
          tokensUsed,
          tokensRemaining,
          estimatedCostInr,
          estimatedCostChange: '+8%',
          monthlyLimit,
          limitPercent,
          remainingBudgetInr,
          apiKey: isDev ? active.apiKey : 'sk_mf_live_vikash_3311defa7890',
          allowedProviders: isDev && active.allowedProviders ? active.allowedProviders : ['Brevo', 'Twilio', 'Razorpay', 'OpenAI'],
          usageByApi: [
            { name: 'Brevo (Email)', requests: Math.round(myUsageThisMonth * 0.45), percent: 45, color: '#6366F1' },
            { name: 'Twilio (SMS)', requests: Math.round(myUsageThisMonth * 0.35), percent: 35, color: '#10B981' },
            { name: 'Razorpay', requests: Math.round(myUsageThisMonth * 0.20), percent: 20, color: '#2563EB' }
          ],
          recentRequests,
          apiKeys: keys
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
};

export default apiKeyController;
