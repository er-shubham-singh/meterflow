import { memoryStore } from '../data/seed.js';

export const analyticsController = {
  /**
   * GET /api/v1/analytics/company-dashboard
   * Returns complete metrics for Screen 2 (Company / Customer Dashboard)
   */
  async getCompanyDashboard(req, res) {
    try {
      const dashboard = memoryStore.companyDashboard || {
        totalRequests: 245230,
        totalRequestsChange: '+12% from last month',
        totalCost: 12450,
        totalCostChange: '+8% from last month',
        activeEmployees: 28,
        activeEmployeesChange: '+2 new this month',
        connectedApis: 8,
        connectedApisDetail: '3 third-party, 5 internal'
      };

      const usageTrend = memoryStore.usageTrend || [];
      const providerDistribution = memoryStore.providerDistribution || [];
      const topEmployees = memoryStore.topEmployees || [];
      const recentActivity = memoryStore.recentActivity || [];
      const budgetStatus = memoryStore.budgetStatus || [];

      res.status(200).json({
        success: true,
        data: {
          metrics: {
            totalRequests: dashboard.totalRequests,
            totalRequestsChange: dashboard.totalRequestsChange,
            totalCost: Math.round(dashboard.totalCost),
            totalCostChange: dashboard.totalCostChange,
            activeEmployees: dashboard.activeEmployees,
            activeEmployeesChange: dashboard.activeEmployeesChange,
            connectedApis: dashboard.connectedApis,
            connectedApisDetail: dashboard.connectedApisDetail,
            currency: '₹',
            organization: 'ABC Technologies',
            plan: 'Enterprise Plan'
          },
          usageTrend,
          providerDistribution,
          topEmployees,
          recentActivity,
          budgetStatus
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * GET /api/v1/analytics/platform-overview
   * Returns complete metrics for Screen 3 (Internal Admin Panel / Platform Overview)
   */
  async getPlatformOverview(req, res) {
    try {
      const platformData = memoryStore.platformOverview || {
        totalCustomers: 125,
        totalCustomersChange: '+8 this month',
        totalApiRequests: '4.2M',
        totalApiRequestsChange: '+12%',
        monthlyRevenue: '₹2,45,000',
        monthlyRevenueChange: '+18%',
        activeApis: 32,
        activeApisDetail: '18 third-party, 14 internal'
      };

      const topCustomers = memoryStore.platformTopCustomers || [];
      const providerHealth = memoryStore.providerHealth || [];
      const platformUsageTrend = memoryStore.platformUsageTrend || [];

      res.status(200).json({
        success: true,
        data: {
          metrics: platformData,
          topCustomers,
          providerHealth,
          platformUsageTrend
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
};

export default analyticsController;
