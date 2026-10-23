import { User } from '../models/User.js';
import { memoryStore } from '../data/seed.js';

export const authController = {
  /**
   * GET /api/v1/auth/me
   */
  async getMe(req, res) {
    try {
      const authHeader = req.headers.authorization || '';
      const rawToken = authHeader.replace(/^Bearer\s+/i, '');
      let activeUser = null;
      if (rawToken) {
        for (const u of memoryStore.users.values()) {
          if (u.apiKey === rawToken || (rawToken.startsWith('mf_session_') && rawToken.includes(u.id))) {
            activeUser = u;
            break;
          }
        }
      }
      if (!activeUser) {
        activeUser = memoryStore.activeUser;
      }
      if (activeUser && (activeUser.email || activeUser.id)) {
        const liveUser = memoryStore.users.get((activeUser.email || '').toLowerCase()) || 
                         memoryStore.users.get(activeUser.id);
        if (liveUser) {
          activeUser = { ...activeUser, ...liveUser };
        }
      }

      if (!activeUser) {
        activeUser = memoryStore.users.get('admin@meterflow.io') || memoryStore.users.get('usr_rahul_admin');
      }

      // Ensure computed remaining telemetry is populated
      const monthlyRequests = activeUser.monthlyRequests || 0;
      const requestLimit = activeUser.monthlyRequestLimit || 50000;
      const requestsRemaining = Math.max(0, requestLimit - monthlyRequests);

      const monthlyCostInr = Number((activeUser.monthlyCostInr || 0).toFixed(2));
      const monthlyLimitInr = activeUser.monthlyLimitInr || (activeUser.role === 'organization_admin' ? 500000 : 15000);
      const remainingBudgetInr = Math.max(0, Number((monthlyLimitInr - monthlyCostInr).toFixed(2)));

      const tokensLimit = activeUser.tokensLimit || 250000;
      const tokensUsed = activeUser.tokensUsed || Math.round(monthlyRequests * 12);
      const tokensRemaining = Math.max(0, tokensLimit - tokensUsed);

      const enrichedUser = {
        ...activeUser,
        monthlyRequests,
        monthlyRequestLimit: requestLimit,
        requestsRemaining,
        monthlyCostInr,
        monthlyLimitInr,
        remainingBudgetInr,
        tokensLimit,
        tokensUsed,
        tokensRemaining
      };

      res.status(200).json({ success: true, data: enrichedUser });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * POST /api/v1/auth/login
   * Authenticate as Admin or Employee with credentials or quick-role
   */
  async login(req, res) {
    try {
      const { email, password, role } = req.body;
      const cleanEmail = (email || '').trim().toLowerCase();
      const isAdminSelected = role === 'admin' || role === 'organization_admin' || cleanEmail.includes('admin');

      let foundUser = null;

      // 1. Search memory store or MongoDB if email provided
      if (cleanEmail) {
        foundUser = memoryStore.users.get(cleanEmail);

        if (!foundUser) {
          try {
            foundUser = await User.findOne({ email: cleanEmail }).lean();
          } catch {}
        }
      }

      // 2. Fallback / On-demand Account Creation
      if (!foundUser) {
        if (isAdminSelected) {
          // Administrator profile
          const templateAdmin = memoryStore.users.get('admin@meterflow.io') || memoryStore.users.get('usr_rahul_admin');
          foundUser = {
            id: cleanEmail ? `usr_${cleanEmail.replace(/[^a-z0-9]/g, '_')}` : 'usr_rahul_admin',
            name: cleanEmail ? cleanEmail.split('@')[0].replace(/[._]/g, ' ') : (templateAdmin?.name || 'Rahul Sharma'),
            email: cleanEmail || 'admin@meterflow.io',
            password: password || 'password123',
            role: 'organization_admin',
            roleLabel: 'Organization Administrator',
            teamName: 'Executive Leadership',
            monthlyLimitInr: 500000,
            monthlyCostInr: 42100,
            monthlyRequests: 342000,
            apiKey: 'sk_mf_admin_9921fa84c20b',
            allowedProviders: ['OpenAI', 'Google Gemini', 'Azure AI', 'Twilio', 'Brevo', 'Anthropic', 'Internal APIs'],
            organization: {
              id: 'org_abc_tech',
              name: 'ABC Technologies',
              plan: 'Enterprise Plan',
              currency: 'INR'
            },
            status: 'active'
          };
        } else {
          // Employee / Developer profile
          const employeeMatches = {
            'vikash.y@abctech.com': { name: 'Vikash Yadav', roleLabel: 'Growth Engineer', teamName: 'Marketing Team', apiKey: 'sk_mf_live_vikash_3311defa7890' },
            'priya.s@abctech.com': { name: 'Priya Singh', roleLabel: 'Backend Architect', teamName: 'Development Team', apiKey: 'sk_mf_live_priya_8832abcd9120' },
            'rahul.v@abctech.com': { name: 'Rahul Verma', roleLabel: 'Lead ML Engineer', teamName: 'AI Team', apiKey: 'sk_mf_live_rahulv_7741bcde1234' },
            'neha.s@abctech.com': { name: 'Neha Sharma', roleLabel: 'Integration Specialist', teamName: 'Development Team', apiKey: 'sk_mf_live_nehas_5521cdef4321' },
            'amit.kumar@abctech.com': { name: 'Amit Kumar', roleLabel: 'Fullstack Developer', teamName: 'Development Team', apiKey: 'sk_mf_dev_6678efgh1122ijkl3344mnop' }
          };

          const matched = employeeMatches[cleanEmail];
          foundUser = {
            id: cleanEmail ? `usr_${cleanEmail.replace(/[^a-z0-9]/g, '_')}` : 'usr_amit_dev',
            name: matched ? matched.name : (cleanEmail ? cleanEmail.split('@')[0].replace(/[._]/g, ' ') : 'Amit Kumar'),
            email: cleanEmail || 'amit.kumar@abctech.com',
            password: password || 'password123',
            role: 'developer',
            roleLabel: matched ? matched.roleLabel : 'Developer',
            teamName: matched ? matched.teamName : 'Development Team',
            monthlyLimitInr: 20000,
            monthlyCostInr: 1890,
            monthlyRequests: 28120,
            apiKey: matched ? matched.apiKey : `sk_mf_dev_live_${Date.now()}`,
            allowedProviders: ['OpenAI', 'Google Gemini', 'Internal APIs'],
            organization: {
              id: 'org_abc_tech',
              name: 'ABC Technologies',
              plan: 'Enterprise Plan',
              currency: 'INR'
            },
            status: 'active'
          };
        }

        if (cleanEmail) {
          memoryStore.users.set(cleanEmail, foundUser);
        }
      }

      // 3. Strictly enforce selected role and update session password
      if (isAdminSelected) {
        foundUser.role = 'organization_admin';
        foundUser.roleLabel = 'Organization Administrator';
      } else {
        foundUser.role = 'developer';
        foundUser.roleLabel = foundUser.roleLabel || 'Developer';
      }

      if (password) {
        foundUser.password = password;
      }

      // Update active user state
      memoryStore.activeUser = {
        ...foundUser,
        organization: foundUser.organization || {
          id: 'org_abc_tech',
          name: 'ABC Technologies',
          plan: 'Enterprise Plan',
          currency: 'INR'
        }
      };

      const token = `mf_session_${foundUser.id}_${Date.now()}`;

      res.status(200).json({
        success: true,
        message: `Successfully logged in as ${foundUser.name} (${foundUser.roleLabel || foundUser.role})`,
        token,
        data: memoryStore.activeUser
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * POST /api/v1/auth/switch-role
   * Instant toggle between Admin and Employee for rapid evaluation
   */
  async switchRole(req, res) {
    try {
      const { role } = req.body;
      if (role === 'developer' || role === 'employee') {
        memoryStore.activeUser = memoryStore.users.get('amit.kumar@abctech.com') || {
          id: 'usr_amit_dev',
          name: 'Amit Kumar',
          email: 'amit.kumar@abctech.com',
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
          }
        };
      } else {
        memoryStore.activeUser = memoryStore.users.get('admin@meterflow.io') || {
          id: 'usr_rahul_admin',
          name: 'Rahul Sharma',
          email: 'admin@meterflow.io',
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
          }
        };
      }

      res.status(200).json({
        success: true,
        message: `Switched active role to ${memoryStore.activeUser.roleLabel || memoryStore.activeUser.role}`,
        data: memoryStore.activeUser
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * POST /api/v1/auth/logout
   */
  async logout(req, res) {
    try {
      res.status(200).json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
};

export default authController;
