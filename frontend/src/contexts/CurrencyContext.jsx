import React, { createContext, useState, useContext } from 'react';

const EXCHANGE_RATE = 55;
const CurrencyContext = createContext();

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState('ETB');

  const toggleCurrency = () => {
    setCurrency(prev => (prev === 'ETB' ? 'USD' : 'ETB'));
  };

  const convert = (amountETB) => {
    return currency === 'ETB' ? amountETB : amountETB / EXCHANGE_RATE;
  };

  const formatPrice = (amountETB) => {
    const value = convert(amountETB);
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <CurrencyContext.Provider value={{ currency, toggleCurrency, convert, formatPrice }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) throw new Error('useCurrency must be used within CurrencyProvider');
  return context;
};