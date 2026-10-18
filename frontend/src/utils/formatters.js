export function formatCurrency(amount, currency = 'INR') {
  if (amount === undefined || amount === null || isNaN(amount)) {
    if (currency === 'USD') return '$0.00';
    if (currency === 'EUR') return '€0.00';
    return '₹0.00';
  }

  let converted = Number(amount);
  let locale = 'en-IN';
  if (currency === 'USD') {
    converted = amount * 0.012;
    locale = 'en-US';
  } else if (currency === 'EUR') {
    converted = amount * 0.011;
    locale = 'de-DE';
  }

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency || 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(converted);
}

export function formatCompactNumber(num) {
  if (num === undefined || num === null || isNaN(num)) return '0';
  if (num >= 1000000) {
    return (num / 1000000).toFixed(2) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k';
  }
  return Number(num).toLocaleString();
}

export function formatTimestamp(isoString) {
  if (!isoString) return '--';
  const d = new Date(isoString);
  return d.toLocaleTimeString('en-US', { hour12: false }) + '.' + String(d.getMilliseconds()).padStart(3, '0');
}

export function formatDate(isoString) {
  if (!isoString) return '--';
  return new Date(isoString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

export function formatRelativeTime(isoString) {
  if (!isoString) return '';
  const diffSec = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
  if (diffSec < 5) return 'just now';
  if (diffSec < 60) return `${diffSec}s ago`;
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  return `${Math.floor(diffSec / 3600)}h ago`;
}

export function formatMeterName(code) {
  if (!code) return '';
  const MAP = {
    llm_tokens_total: 'LLM Tokens Total',
    api_requests_total: 'API Requests Total',
    gpu_compute_hours: 'GPU Compute Hours',
    monthly_active_users: 'Monthly Active Users',
    hot_storage_peak: 'Hot Storage Peak'
  };
  if (MAP[code]) return MAP[code];
  return code
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

