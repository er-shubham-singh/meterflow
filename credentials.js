/**
 * MeterFlow Platform Credentials & Authentication Directory
 *
 * Use these credentials to sign in at: http://localhost:3000/login
 * Select the appropriate Account Role (Workspace Administrator or Employee / Developer).
 * Note: Credentials and demo shortcuts are kept confidential in this file to prevent
 * unauthorized privilege escalation on the public login page.
 */

export const METERFLOW_CREDENTIALS = {
  // ==========================================
  // 1. ADMINISTRATOR ACCOUNT (Full Platform Access)
  // ==========================================
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
    defaultLandingPage: '/'
  },

  // ==========================================
  // 2. EMPLOYEE / DEVELOPER ACCOUNTS (Personal Portal)
  // ==========================================
  employees: [
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
      capabilities: [
        'Access Employee Developer Portal',
        'View & copy personal API Token',
        'Track personal monthly budget & quota',
        'Test endpoints directly in API Playground',
        'View quickstart code snippets (cURL, Python, Node.js)'
      ],
      defaultLandingPage: '/employee-portal'
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
      defaultLandingPage: '/employee-portal'
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
      defaultLandingPage: '/employee-portal'
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
      defaultLandingPage: '/employee-portal'
    },
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
      defaultLandingPage: '/employee-portal'
    }
  ],

  // ==========================================
  // 3. API GATEWAY TESTING QUICKSTART
  // ==========================================
  apiGateway: {
    endpoint: 'http://localhost:5001/api/v1/gateway/proxy',
    exampleCurl: `curl -X POST http://localhost:5001/api/v1/gateway/proxy \\
  -H "Authorization: Bearer sk_mf_dev_6678efgh1122ijkl3344mnop" \\
  -H "Content-Type: application/json" \\
  -d '{
    "provider": "openai",
    "body": {
      "model": "gpt-4o-mini",
      "messages": [{"role": "user", "content": "Hello from employee token"}]
    }
  }'`
  }
};

export default METERFLOW_CREDENTIALS;
