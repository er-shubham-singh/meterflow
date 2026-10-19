/**
 * MeterFlow Platform Credentials Directory (Frontend Reference)
 */
export const METERFLOW_CREDENTIALS = {
  admin: {
    role: 'organization_admin',
    roleLabel: 'Admin',
    name: 'Rahul Sharma',
    email: 'admin@meterflow.io',
    password: 'password123',
    apiKey: 'sk_mf_admin_9921fa84c20b',
    organization: 'ABC Technologies',
    defaultLandingPage: '/'
  },
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
      apiKey: 'sk_mf_dev_6678efgh1122ijkl3344mnop',
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
      apiKey: 'sk_mf_live_priya_8832abcd9120',
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
      apiKey: 'sk_mf_live_rahulv_7741bcde1234',
      defaultLandingPage: '/employee-portal'
    }
  ]
};

export default METERFLOW_CREDENTIALS;
