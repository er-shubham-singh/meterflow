export function formatCurrency(amount, currency = 'INR') {
  if (amount === undefined || amount === null || isNaN(amount)) return '₹0.00';
  // Always enforce Indian Rupee formatting (INR) across the entire platform
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 4
  }).format(amount);
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
