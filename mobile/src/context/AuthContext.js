import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../services/api';

const STORAGE_KEY_USER = 'meterflow_mobile_user';
const STORAGE_KEY_TOKEN = 'meterflow_mobile_token';

const AuthContext = createContext({
  user: null,
  token: null,
  loading: true,
  isAdmin: false,
  isEmployee: false,
  login: async () => {},
  logout: async () => {},
  refreshUser: async () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize from storage & sync with backend on launch
  useEffect(() => {
    async function initAuth() {
      try {
        const storedToken = await AsyncStorage.getItem(STORAGE_KEY_TOKEN);
        const storedUser = await AsyncStorage.getItem(STORAGE_KEY_USER);

        if (storedToken && storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setToken(storedToken);
        }

        // Fetch fresh user profile from backend
        const res = await api.getMe();
        if (res && res.data) {
          setUser(res.data);
          await AsyncStorage.setItem(STORAGE_KEY_USER, JSON.stringify(res.data));
        }
      } catch (err) {
        // storage or network unavailable, continue
      } finally {
        setLoading(false);
      }
    }

    initAuth();
  }, []);

  const login = async ({ email, password, role }) => {
    try {
      const res = await api.login({ email, password, role });
      
      if (res.success && res.data) {
        const userData = res.data;
        const isRoleAdmin = userData.role === 'organization_admin' || 
                            userData.role === 'platform_super_admin' || 
                            userData.role === 'admin';

        // Directly honor selected role from login screen
        if (role === 'admin') {
          userData.role = 'organization_admin';
          userData.roleLabel = 'Organization Administrator';
        } else if (role === 'employee' || role === 'developer') {
          userData.role = 'developer';
          userData.roleLabel = 'Developer';
        }

        setUser(userData);
        setToken(res.token || `mf_token_${Date.now()}`);

        await AsyncStorage.setItem(STORAGE_KEY_USER, JSON.stringify(userData));
        if (res.token) {
          await AsyncStorage.setItem(STORAGE_KEY_TOKEN, res.token);
        }

        return { success: true, data: userData };
      }

      return { success: false, message: res.message || 'Authentication failed' };
    } catch (err) {
      return { success: false, message: err.message || 'Login failed. Please check network connection.' };
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch {}
    
    try {
      await AsyncStorage.removeItem(STORAGE_KEY_TOKEN);
      await AsyncStorage.removeItem(STORAGE_KEY_USER);
    } catch {}

    setUser(null);
    setToken(null);
  };

  const refreshUser = async () => {
    try {
      const res = await api.getMe();
      if (res && res.data) {
        setUser(res.data);
        await AsyncStorage.setItem(STORAGE_KEY_USER, JSON.stringify(res.data));
      }
    } catch {}
  };

  const isAdmin = user?.role === 'organization_admin' || user?.role === 'platform_super_admin' || user?.role === 'admin';
  const isEmployee = !isAdmin && user !== null;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAdmin,
        isEmployee,
        login,
        logout,
        refreshUser,
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
