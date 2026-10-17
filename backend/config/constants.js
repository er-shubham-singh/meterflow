export const AGGREGATION_TYPES = {
  SUM: 'SUM',
  COUNT: 'COUNT',
  MAX: 'MAX',
  UNIQUE_COUNT: 'UNIQUE_COUNT',
  WEIGHTED_AVG: 'WEIGHTED_AVG',
  LATEST: 'LATEST'
};

export const PRICING_MODELS = {
  GRADUATED: 'GRADUATED',      // Different rates per usage tier
  VOLUME: 'VOLUME',            // Single rate for entire volume based on tier reached
  PACKAGE: 'PACKAGE',          // Billed per block of units (e.g., $10 per 10k units)
  FLAT_FEE: 'FLAT_FEE'         // Fixed base recurring charge
};

export const INVOICE_STATUS = {
  DRAFT: 'DRAFT',
  FINALIZED: 'FINALIZED',
  SYNCED_TO_BILLING: 'SYNCED_TO_BILLING',
  PAID: 'PAID'
};

export const DEFAULT_CONFIG = {
  PORT: process.env.PORT || 5001,
  INGESTION_BATCH_LIMIT: 1000,
  IDEMPOTENCY_CACHE_SIZE: 50000,
  BILLING_CYCLE_DAYS: 30,
  DEFAULT_CURRENCY: 'INR'
};
