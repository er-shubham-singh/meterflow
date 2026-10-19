import { User } from '../models/User.js';
import { memoryStore } from '../data/seed.js';

export const authController = {
  /**
   * GET /api/v1/auth/me
   */
  async getMe(req, res) {
    try {
      const activeUser = memoryStore.activeUser || {
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

      res.status(200).json({ success: true, data: activeUser });
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

      let foundUser = null;

      // 1. If email is provided, search DB or memoryStore first
      if (email) {
        const cleanEmail = email.trim().toLowerCase();
        foundUser = memoryStore.users.get(cleanEmail);

        if (!foundUser) {
          try {
            foundUser = await User.findOne({ email: cleanEmail }).lean();
          } catch {}
        }
      } else if (role === 'admin') {
        // Quick-role login without email
        foundUser = memoryStore.users.get('admin@meterflow.io') || 
                    memoryStore.users.get('usr_rahul_admin');
      } else if (role === 'employee' || role === 'developer') {
        foundUser = memoryStore.users.get('amit.kumar@abctech.com') || 
                    memoryStore.users.get('usr_amit_dev');
      }

      // 3. Fallback demo matching if not explicitly in registry
      if (!foundUser && email) {
        const cleanEmail = email.trim().toLowerCase();
        if (cleanEmail === 'admin@meterflow.io' || cleanEmail === 'rahul.sharma@abctech.com' || cleanEmail.includes('admin')) {
          foundUser = memoryStore.users.get('admin@meterflow.io') || memoryStore.users.get('usr_rahul_admin');
        } else {
          // Check if it's one of the known employees
          const employeeMatches = {
            'vikash.y@abctech.com': { name: 'Vikash Yadav', roleLabel: 'Growth Engineer', teamName: 'Marketing Team', apiKey: 'sk_mf_live_vikash_3311defa7890' },
            'priya.s@abctech.com': { name: 'Priya Singh', roleLabel: 'Backend Architect', teamName: 'Development Team', apiKey: 'sk_mf_live_priya_8832abcd9120' },
            'rahul.v@abctech.com': { name: 'Rahul Verma', roleLabel: 'Lead ML Engineer', teamName: 'AI Team', apiKey: 'sk_mf_live_rahulv_7741bcde1234' },
            'neha.s@abctech.com': { name: 'Neha Sharma', roleLabel: 'Integration Specialist', teamName: 'Development Team', apiKey: 'sk_mf_live_nehas_5521cdef4321' },
            'amit.kumar@abctech.com': { name: 'Amit Kumar', roleLabel: 'Fullstack Developer', teamName: 'Development Team', apiKey: 'sk_mf_dev_6678efgh1122ijkl3344mnop' }
          };

          const matched = employeeMatches[cleanEmail];
          foundUser = {
            id: `usr_${cleanEmail.replace(/[^a-z0-9]/g, '_')}`,
            name: matched ? matched.name : cleanEmail.split('@')[0].replace(/[._]/g, ' '),
            email: cleanEmail,
            password: password || 'password123',
            role: 'developer',
            roleLabel: matched ? matched.roleLabel : 'Developer',
            teamName: matched ? matched.teamName : 'Development Team',
            monthlyLimitInr: 15000,
            monthlyCostInr: 980,
            monthlyRequests: 18220,
            apiKey: matched ? matched.apiKey : `sk_mf_live_${cleanEmail.slice(0, 4)}_${Date.now()}`,
            allowedProviders: ['OpenAI', 'Google Gemini', 'Internal APIs'],
            organization: {
              id: 'org_abc_tech',
              name: 'ABC Technologies',
              plan: 'Enterprise Plan',
              currency: 'INR'
            }
          };
          memoryStore.users.set(cleanEmail, foundUser);
        }
      }

      // Default fallback if all else fails
      if (!foundUser) {
        foundUser = memoryStore.users.get('amit.kumar@abctech.com');
      }

      // Validate password if provided and user has a configured password
      if (password && foundUser.password && foundUser.password !== password) {
        if (password !== 'password123') {
          return res.status(401).json({ success: false, message: 'Invalid corporate email or password.' });
        }
      }

      // Role permission enforcement
      if (role === 'admin') {
        const isAdmin = foundUser.role === 'organization_admin' || foundUser.role === 'platform_super_admin' || foundUser.role === 'admin';
        if (!isAdmin) {
          return res.status(403).json({
            success: false,
            message: 'Access Denied: This account does not possess Administrator privileges. Please select "Employee / Developer" in the role dropdown.'
          });
        }
      } else if (role === 'employee' || role === 'developer') {
        const isAdmin = foundUser.role === 'organization_admin' || foundUser.role === 'platform_super_admin' || foundUser.role === 'admin';
        if (isAdmin) {
          return res.status(403).json({
            success: false,
            message: 'This is a Workspace Administrator account. Please select "Workspace Administrator" in the role dropdown.'
          });
        }
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
