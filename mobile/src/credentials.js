export const METERFLOW_CREDENTIALS = {
  admin: {
    role: 'organization_admin',
    roleLabel: 'Organization Administrator',
    name: 'Rahul Sharma',
    email: 'admin@meterflow.io',
    password: 'password123',
    apiKey: 'sk_mf_admin_9921fa84c20b',
    organization: 'ABC Technologies',
    plan: 'Enterprise Plan',
    monthlyLimitInr: 100000,
    capabilities: [
      'Manage all API Providers & Edge Gateways',
      'Create, revoke, and inspect all Company API Keys',
      'Add & manage Employees with auto-generated API Tokens',
      'Manage Teams, Monthly Budgets, and Showback limits',
      'Access Invoicing, Billing Records, and CSV Exports',
      'Full Platform Admin Overview & Global Telemetry'
    ],
    defaultLandingPage: 'Dashboard'
  },
  employees: [
    {
      id: 'usr_vikash_mkt',
      name: 'Vikash Yadav',
      email: 'vikash.y@abctech.com',
      password: 'password123',
      role: 'developer',
      roleLabel: 'Growth Engineer',
      teamName: 'Marketing Team',
      monthlyLimitInr: 10000,
      monthlyCostInr: 980,
      monthlyRequests: 18220,
      apiKey: 'sk_mf_live_vikash_3311defa7890',
      allowedProviders: ['Brevo', 'Twilio', 'Razorpay'],
      defaultLandingPage: 'EmployeePortal'
    },
    {
      id: 'usr_amit_dev',
      name: 'Amit Kumar',
      email: 'amit.kumar@abctech.com',
      password: 'password123',
      role: 'developer',
      roleLabel: 'Fullstack Developer',
      teamName: 'Development Team',
      monthlyLimitInr: 20000,
      monthlyCostInr: 1890,
      monthlyRequests: 28120,
      apiKey: 'sk_mf_dev_6678efgh1122ijkl3344mnop',
      allowedProviders: ['OpenAI', 'Google Gemini', 'Internal APIs'],
      defaultLandingPage: 'EmployeePortal'
    },
    {
      id: 'usr_priya_arch',
      name: 'Priya Singh',
      email: 'priya.s@abctech.com',
      password: 'password123',
      role: 'developer',
      roleLabel: 'Backend Architect',
      teamName: 'Development Team',
      monthlyLimitInr: 20000,
      monthlyCostInr: 2120,
      monthlyRequests: 32450,
      apiKey: 'sk_mf_live_priya_8832abcd9120',
      allowedProviders: ['OpenAI', 'Azure AI', 'AWS Bedrock'],
      defaultLandingPage: 'EmployeePortal'
    },
    {
      id: 'usr_rahul_ml',
      name: 'Rahul Verma',
      email: 'rahul.v@abctech.com',
      password: 'password123',
      role: 'developer',
      roleLabel: 'Lead ML Engineer',
      teamName: 'AI Team',
      monthlyLimitInr: 25000,
      monthlyCostInr: 3450,
      monthlyRequests: 48230,
      apiKey: 'sk_mf_live_rahulv_7741bcde1234',
      allowedProviders: ['OpenAI', 'Google Gemini', 'Azure AI'],
      defaultLandingPage: 'EmployeePortal'
    },
    {
      id: 'usr_neha_int',
      name: 'Neha Sharma',
      email: 'neha.s@abctech.com',
      password: 'password123',
      role: 'developer',
      roleLabel: 'Integration Specialist',
      teamName: 'Development Team',
      monthlyLimitInr: 15000,
      monthlyCostInr: 1250,
      monthlyRequests: 21340,
      apiKey: 'sk_mf_live_nehas_5521cdef4321',
      allowedProviders: ['Brevo', 'Twilio', 'Internal Orders API'],
      defaultLandingPage: 'EmployeePortal'
    }
  ]
};
