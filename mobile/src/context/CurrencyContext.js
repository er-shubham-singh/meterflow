import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { formatCurrency as formatCurrencyUtil } from '../utils/formatters';

const STORAGE_KEY_CURRENCY = 'meterflow_mobile_currency';

export const CURRENCIES = [
  { code: 'INR', symbol: '₹', label: 'INR (₹)' },
  { code: 'USD', symbol: '$', label: 'USD ($)' },
  { code: 'EUR', symbol: '€', label: 'EUR (€)' },
];

const CurrencyContext = createContext({
  currency: 'INR',
  setCurrency: () => {},
  formatCurrency: (amount) => '₹0.00',
});

export function CurrencyProvider({ children }) {
  const [currency, setCurrencyState] = useState('INR');

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY_CURRENCY)
      .then((saved) => {
        if (saved && (saved === 'INR' || saved === 'USD' || saved === 'EUR')) {
          setCurrencyState(saved);
        }
      })
      .catch(() => {});
  }, []);

  const setCurrency = async (newCurrency) => {
    setCurrencyState(newCurrency);
    try {
      await AsyncStorage.setItem(STORAGE_KEY_CURRENCY, newCurrency);
    } catch {}
  };

  const formatCurrency = (amount) => {
    return formatCurrencyUtil(amount, currency);
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}
