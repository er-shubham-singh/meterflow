import { memoryStore } from '../data/seed.js';

export const authController = {
  /**
   * GET /api/v1/auth/me
   */
  async getMe(req, res) {
    try {
      const activeUser = memoryStore.activeUser || {
        id: 'usr_rahul_sharma',
        name: 'Rahul Sharma',
        email: 'rahul.sharma@abctech.com',
        role: 'organization_admin',
        roleLabel: 'Admin',
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
   * POST /api/v1/auth/switch-role
   * Allows fast switching between Admin and Developer
   */
  async switchRole(req, res) {
    try {
      const { role } = req.body;
      if (role === 'developer') {
        memoryStore.activeUser = {
          id: 'usr_amit_kumar',
          name: 'Amit Kumar',
          email: 'amit.kumar@abctech.com',
          role: 'developer',
          roleLabel: 'Developer',
          teamName: 'Development Team',
          organization: {
            id: 'org_abc_tech',
            name: 'ABC Technologies',
            plan: 'Enterprise Plan',
            currency: 'INR'
          }
        };
      } else {
        memoryStore.activeUser = {
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
        };
      }

      res.status(200).json({
        success: true,
        message: `Switched active role to ${memoryStore.activeUser.roleLabel}`,
        data: memoryStore.activeUser
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * POST /api/v1/auth/login
   */
  async login(req, res) {
    try {
      const { email } = req.body;
      if (email && email.includes('amit')) {
        memoryStore.activeUser = {
          id: 'usr_amit_kumar',
          name: 'Amit Kumar',
          email: 'amit.kumar@abctech.com',
          role: 'developer',
          roleLabel: 'Developer',
          teamName: 'Development Team',
          organization: {
            id: 'org_abc_tech',
            name: 'ABC Technologies',
            plan: 'Enterprise Plan',
            currency: 'INR'
          }
        };
      } else {
        memoryStore.activeUser = {
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
        };
      }

      res.status(200).json({
        success: true,
        token: `mf_session_${Date.now()}`,
        data: memoryStore.activeUser
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
};

export default authController;
