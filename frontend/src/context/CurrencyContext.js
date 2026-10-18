'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const CurrencyContext = createContext({
  currency: 'INR',
  setCurrency: () => {},
  format: (amount) => '₹0.00'
});

export const CURRENCY_SYMBOLS = {
  INR: '₹',
  USD: '$',
  EUR: '€'
};

const RATES = {
  INR: 1,
  USD: 0.012,
  EUR: 0.011
};

export function CurrencyProvider({ children }) {
  const [currency, setCurrencyState] = useState('INR');

  useEffect(() => {
    try {
      const stored = localStorage.getItem('meterflow_currency');
      if (stored && ['INR', 'USD', 'EUR'].includes(stored)) {
        setCurrencyState(stored);
      }
    } catch {
      // ignore storage error
    }
  }, []);

  const setCurrency = (c) => {
    setCurrencyState(c);
    try {
      localStorage.setItem('meterflow_currency', c);
    } catch {
      // ignore storage error
    }
  };

  const format = (amountInINR) => {
    if (amountInINR === undefined || amountInINR === null || isNaN(amountInINR)) {
      return `${CURRENCY_SYMBOLS[currency] || '₹'}0.00`;
    }
    const rate = RATES[currency] || 1;
    const converted = amountInINR * rate;
    const locale = currency === 'INR' ? 'en-IN' : currency === 'USD' ? 'en-US' : 'de-DE';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(converted);
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, format }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    return {
      currency: 'INR',
      setCurrency: () => {},
      format: (amount) => `₹${Number(amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
    };
  }
  return context;
}
