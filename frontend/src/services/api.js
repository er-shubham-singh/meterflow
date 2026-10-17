export const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1').replace(/\/+$/, '');

async function handleResponse(res) {
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `API Error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

export const api = {
  // Telemetry & Health
  async getHealth() {
    const res = await fetch(`${API_BASE}/health`);
    return handleResponse(res);
  },

  async getTelemetry() {
    const res = await fetch(`${API_BASE}/events/telemetry`);
    return handleResponse(res);
  },

  // Events Ingestion
  async ingestEvent(eventPayload) {
    const res = await fetch(`${API_BASE}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventPayload)
    });
    return handleResponse(res);
  },

  async ingestBatch(eventsArray) {
    const res = await fetch(`${API_BASE}/events/batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ events: eventsArray })
    });
    return handleResponse(res);
  },

  async getRecentEvents(limit = 20, page = 1, customerId = null, eventType = null) {
    const url = new URL(`${API_BASE}/events`);
    url.searchParams.set('limit', limit);
    if (page) url.searchParams.set('page', page);
    if (customerId) url.searchParams.set('customerId', customerId);
    if (eventType && eventType !== 'ALL') url.searchParams.set('eventType', eventType);
    const res = await fetch(url.toString());
    return handleResponse(res);
  },

  async resetAllUsage() {
    const res = await fetch(`${API_BASE}/events/reset`, { method: 'POST' });
    return handleResponse(res);
  },

  // Meters
  async getMeters(page = null, limit = null) {
    const url = new URL(`${API_BASE}/meters`);
    if (page) url.searchParams.set('page', page);
    if (limit) url.searchParams.set('limit', limit);
    const res = await fetch(url.toString());
    return handleResponse(res);
  },

  async createMeter(meterData) {
    const res = await fetch(`${API_BASE}/meters`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(meterData)
    });
    return handleResponse(res);
  },

  async deleteMeter(id) {
    const res = await fetch(`${API_BASE}/meters/${id}`, { method: 'DELETE' });
    return handleResponse(res);
  },

  // Pricing Plans
  async getPricingPlans() {
    const res = await fetch(`${API_BASE}/pricing-plans`);
    return handleResponse(res);
  },

  async simulatePricing(rateCard, quantity) {
    const res = await fetch(`${API_BASE}/pricing-plans/simulate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rateCard, quantity })
    });
    return handleResponse(res);
  },

  // Customers
  async getCustomers(page = null, limit = null, search = '') {
    const url = new URL(`${API_BASE}/customers`);
    if (page) url.searchParams.set('page', page);
    if (limit) url.searchParams.set('limit', limit);
    if (search) url.searchParams.set('search', search);
    const res = await fetch(url.toString());
    return handleResponse(res);
  },

  async getCustomerUsage(customerId) {
    const res = await fetch(`${API_BASE}/customers/${customerId}/usage`);
    return handleResponse(res);
  },

  async createCustomer(customerData) {
    const res = await fetch(`${API_BASE}/customers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(customerData)
    });
    return handleResponse(res);
  },

  // Billing & Invoices
  async getInvoices(customerId = null, page = null, limit = null) {
    const url = new URL(`${API_BASE}/billing/invoices`);
    if (customerId) url.searchParams.set('customerId', customerId);
    if (page) url.searchParams.set('page', page);
    if (limit) url.searchParams.set('limit', limit);
    const res = await fetch(url.toString());
    return handleResponse(res);
  },

  async generateInvoice(customerId) {
    const res = await fetch(`${API_BASE}/billing/invoices/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customerId })
    });
    return handleResponse(res);
  },

  async getWebhookLogs(page = null, limit = null) {
    const url = new URL(`${API_BASE}/billing/webhooks`);
    if (page) url.searchParams.set('page', page);
    if (limit) url.searchParams.set('limit', limit);
    const res = await fetch(url.toString());
    return handleResponse(res);
  },

  getInvoiceHtmlUrl(invoiceId) {
    return `${API_BASE}/billing/invoices/${invoiceId}/html`;
  },

  // Simulator
  async startSimulator(rate, scenario) {
    const res = await fetch(`${API_BASE}/simulator/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rate, scenario })
    });
    return handleResponse(res);
  },

  async stopSimulator() {
    const res = await fetch(`${API_BASE}/simulator/stop`, { method: 'POST' });
    return handleResponse(res);
  },

  async triggerBurst(count = 50, scenario = 'mixed', customerId = null) {
    const res = await fetch(`${API_BASE}/simulator/burst`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ count, scenario, customerId })
    });
    return handleResponse(res);
  },

  async getSimulatorStatus() {
    const res = await fetch(`${API_BASE}/simulator/status`);
    return handleResponse(res);
  },

  // Live SSE stream helper
  createEventSource() {
    return new EventSource(`${API_BASE}/events/stream`);
  }
};
