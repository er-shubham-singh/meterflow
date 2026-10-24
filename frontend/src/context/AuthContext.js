'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '@/services/api';

const AuthContext = createContext({
  user: null,
  token: null,
  loading: true,
  isAdmin: true,
  isEmployee: false,
  login: async () => {},
  quickLogin: async () => {},
  logout: async () => {},
  refreshUser: async () => {}
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState({
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
  });
  const [token, setToken] = useState('mf_session_init');
  const [loading, setLoading] = useState(true);

  // Sync on mount
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('meterflow_token');
      const storedUser = localStorage.getItem('meterflow_user');

      if (storedToken && storedUser) {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      }
    } catch {
      // storage unavailable
    }

    // Refresh from backend with periodic background sync
    const syncUser = () => {
      api.getMe()
        .then(res => {
          if (res && res.data) {
            setUser(res.data);
            try {
              localStorage.setItem('meterflow_user', JSON.stringify(res.data));
            } catch {}
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    };

    syncUser();
    const interval = setInterval(syncUser, 3000);
    return () => clearInterval(interval);
  }, []);

  const login = async (credentials) => {
    try {
      const res = await api.login(credentials);
      if (res.success && res.data) {
        setUser(res.data);
        setToken(res.token);
        try {
          localStorage.setItem('meterflow_token', res.token);
          localStorage.setItem('meterflow_user', JSON.stringify(res.data));
        } catch {}
        return { success: true, data: res.data };
      }
      return { success: false, message: res.message || 'Login failed' };
    } catch (err) {
      return { success: false, message: err.message || 'Login failed' };
    }
  };

  const quickLogin = async (role) => {
    try {
      const res = await api.login({ role });
      if (res.success && res.data) {
        setUser(res.data);
        setToken(res.token);
        try {
          localStorage.setItem('meterflow_token', res.token);
          localStorage.setItem('meterflow_user', JSON.stringify(res.data));
        } catch {}
        return { success: true, data: res.data };
      }
      return { success: false, message: res.message };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch {}
    try {
      localStorage.removeItem('meterflow_token');
      localStorage.removeItem('meterflow_user');
    } catch {}
    // Set to null or guest state
    setUser(null);
    setToken(null);
  };

  const refreshUser = async () => {
    try {
      const res = await api.getMe();
      if (res.data) {
        setUser(res.data);
        try {
          localStorage.setItem('meterflow_user', JSON.stringify(res.data));
        } catch {}
      }
    } catch {}
  };

  const isAdmin = user?.role === 'organization_admin' || user?.role === 'platform_super_admin' || user?.role === 'organization_owner';
  const isEmployee = !isAdmin;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAdmin,
        isEmployee,
        login,
        quickLogin,
        logout,
        refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
