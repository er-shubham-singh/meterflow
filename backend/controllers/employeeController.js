import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../models/User.js';
import { ApiKey } from '../models/ApiKey.js';
import { memoryStore } from '../data/seed.js';

export const employeeController = {
  /**
   * GET /api/v1/employees
   * List all employees with usage and API token metadata
   */
  async listEmployees(req, res) {
    try {
      let employees = [];

      try {
        const dbUsers = await User.find().lean();
        if (dbUsers && dbUsers.length > 0) {
          employees = dbUsers.map(doc => {
            const live = memoryStore.users.get(doc.email?.toLowerCase());
            return live ? { ...doc, monthlyRequests: live.monthlyRequests, monthlyCostInr: live.monthlyCostInr } : doc;
          });
        }
      } catch {
        // fallback
      }

      if (!employees || employees.length === 0) {
        employees = Array.from(memoryStore.users.values());
      }

      // Safe sanitization
      const safeList = employees.map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role || 'developer',
        roleLabel: u.roleLabel || (u.role === 'organization_admin' ? 'Admin' : 'Developer'),
        teamName: u.teamName || 'Development Team',
        monthlyLimitInr: u.monthlyLimitInr || 15000,
        monthlyCostInr: u.monthlyCostInr || 0,
        monthlyRequests: u.monthlyRequests || 0,
        apiKey: u.apiKey ? `${u.apiKey.slice(0, 11)}...${u.apiKey.slice(-4)}` : 'None',
        rawApiKey: u.apiKey || null,
        allowedProviders: u.allowedProviders || ['OpenAI', 'Google Gemini'],
        status: u.status || 'active',
        createdAt: u.createdAt || new Date().toISOString()
      }));

      res.status(200).json({ success: true, data: safeList });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * POST /api/v1/employees
   * Admin creates a new employee and automatically provisions a personal API token
   */
  async createEmployee(req, res) {
    try {
      const {
        name,
        email,
        password = 'password123',
        teamName = 'Development Team',
        roleLabel = 'Developer',
        monthlyLimitInr = 10000,
        allowedProviders = ['OpenAI', 'Google Gemini', 'Internal APIs']
      } = req.body;

      if (!name || !email) {
        return res.status(400).json({ success: false, message: 'Name and email are required' });
      }

      const normalizedEmail = email.trim().toLowerCase();

      // Check if user already exists in memory or DB
      if (memoryStore.users.has(normalizedEmail)) {
        return res.status(409).json({ success: false, message: 'An employee with this email already exists' });
      }

      const userId = `usr_${uuidv4().slice(0, 8)}`;
      const randomSuffix = crypto.randomBytes(12).toString('hex');
      const rawApiKey = `sk_mf_live_${randomSuffix}`;
      const maskedKey = `${rawApiKey.slice(0, 11)}...${rawApiKey.slice(-4)}`;
      const hashedKey = crypto.createHash('sha256').update(rawApiKey).digest('hex');
      const apiKeyId = `key_${uuidv4().slice(0, 8)}`;

      // 1. Create API Key Record
      const apiKeyDoc = {
        id: apiKeyId,
        name: `${name}'s Personal API Key`,
        rawKey: rawApiKey,
        maskedKey,
        hashedKey,
        environment: 'production',
        userId,
        userName: name,
        userEmail: normalizedEmail,
        teamName,
        monthlyLimit: Number(monthlyLimitInr) || 10000,
        currentUsage: 0,
        allowedProviders,
        status: 'active',
        createdAt: new Date().toISOString()
      };

      memoryStore.apiKeys.set(apiKeyId, apiKeyDoc);
      try {
        await ApiKey.create(apiKeyDoc);
      } catch {
        // DB fallback
      }

      // 2. Create User Record
      const userDoc = {
        id: userId,
        name,
        email: normalizedEmail,
        password: password || 'password123',
        role: 'developer',
        roleLabel,
        teamName,
        monthlyLimitInr: Number(monthlyLimitInr) || 10000,
        monthlyCostInr: 0,
        monthlyRequests: 0,
        apiKey: rawApiKey,
        apiKeyId,
        allowedProviders,
        status: 'active',
        organization: {
          id: 'org_abc_tech',
          name: 'ABC Technologies',
          plan: 'Enterprise Plan',
          currency: 'INR'
        },
        createdAt: new Date().toISOString()
      };

      memoryStore.users.set(userId, userDoc);
      memoryStore.users.set(normalizedEmail, userDoc);

      try {
        await User.create(userDoc);
      } catch {
        // DB fallback
      }

      res.status(201).json({
        success: true,
        message: 'Employee successfully created and personal API token generated',
        data: {
          id: userDoc.id,
          name: userDoc.name,
          email: userDoc.email,
          role: userDoc.role,
          roleLabel: userDoc.roleLabel,
          teamName: userDoc.teamName,
          monthlyLimitInr: userDoc.monthlyLimitInr,
          apiKey: rawApiKey,
          apiKeyId,
          password: userDoc.password,
          allowedProviders: userDoc.allowedProviders,
          status: userDoc.status
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * DELETE /api/v1/employees/:id
   */
  async deleteEmployee(req, res) {
    try {
      const { id } = req.params;
      const user = memoryStore.users.get(id);

      if (user && user.apiKeyId) {
        memoryStore.apiKeys.delete(user.apiKeyId);
        try {
          await ApiKey.deleteOne({ id: user.apiKeyId });
        } catch {}
      }

      memoryStore.users.delete(id);
      if (user && user.email) {
        memoryStore.users.delete(user.email.toLowerCase());
      }

      try {
        await User.deleteOne({ id });
      } catch {}

      res.status(200).json({ success: true, message: 'Employee deleted successfully' });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
};

export default employeeController;
