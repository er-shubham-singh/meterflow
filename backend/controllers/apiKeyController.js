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
      const employeeData = memoryStore.employeeDashboard || {
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
      };

      res.status(200).json({
        success: true,
        data: {
          ...employeeData,
          apiKeys: keys
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
};

export default apiKeyController;
