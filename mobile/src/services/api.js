import AsyncStorage from '@react-native-async-storage/async-storage';
import { CONFIG } from '../constants/config';

async function request(endpoint, options = {}) {
  const baseUrl = await CONFIG.getApiBaseUrl();
  const url = `${baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
  
  let token = null;
  try {
    token = await AsyncStorage.getItem('meterflow_mobile_token');
  } catch {}

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000); // 12s timeout

    const res = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    const contentType = res.headers.get('content-type') || '';
    let data;
    if (contentType.includes('application/json')) {
      data = await res.json();
    } else {
      data = { message: await res.text() };
    }

    if (!res.ok) {
      throw new Error(data.message || data.error?.message || `HTTP ${res.status}: ${res.statusText}`);
    }

    return data;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error(`Connection timeout: Could not reach MeterFlow server at ${url}. Make sure your phone and laptop are on the same Wi-Fi.`);
    }
    throw new Error(error.message || `Failed to connect to ${url}`);
  }
}

export const api = {
  // Auth
  async login(credentials) {
    return request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
  },

  async getMe() {
    return request('/auth/me');
  },

  async logout() {
    return request('/auth/logout', { method: 'POST' });
  },

  async switchRole(role) {
    return request('/auth/switch-role', {
      method: 'POST',
      body: JSON.stringify({ role })
    });
  },

  // Analytics & Dashboard
  async getCompanyDashboard() {
    return request('/analytics/company-dashboard');
  },

  async getPlatformOverview() {
    return request('/analytics/platform-overview');
  },

  async getTelemetry() {
    return request('/events/telemetry');
  },

  // Employee Portal & Keys
  async getEmployeeDashboard() {
    return request('/api-keys/employee-dashboard');
  },

  async getApiKeys() {
    return request('/api-keys');
  },

  async createApiKey(payload) {
    return request('/api-keys', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async revokeApiKey(id) {
    return request(`/api-keys/${id}/revoke`, { method: 'POST' });
  },

  // Employees Management
  async getEmployees() {
    return request('/employees');
  },

  async createEmployee(payload) {
    return request('/employees', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async deleteEmployee(id) {
    return request(`/employees/${id}`, { method: 'DELETE' });
  },

  // Gateway Proxy
  async sendGatewayProxy(payload) {
    return request('/gateway/proxy', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async proxyRequest(payload) {
    return this.sendGatewayProxy(payload);
  },

  // Providers
  async getProviders() {
    return request('/providers');
  },

  // Health
  async getHealth() {
    return request('/health');
  }
};
