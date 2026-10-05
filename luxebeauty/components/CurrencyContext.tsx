"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type Currency = "EUR" | "USD" | "GBP";

const RATES: Record<Currency, number> = { EUR: 1, USD: 1.08, GBP: 0.86 };
const SYMBOLS: Record<Currency, string> = { EUR: "€", USD: "$", GBP: "£" };

interface CurrencyContextValue {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  formatPrice: (eur: number) => string;
}

const CurrencyContext = createContext<CurrencyContextValue>({
  currency: "EUR",
  setCurrency: () => {},
  formatPrice: (eur) => `€${eur}`,
});

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>("EUR");

  useEffect(() => {
    const stored = localStorage.getItem("luxe-currency") as Currency | null;
    if (stored && stored in RATES) setCurrencyState(stored);
  }, []);

  function setCurrency(c: Currency) {
    setCurrencyState(c);
    localStorage.setItem("luxe-currency", c);
  }

  function formatPrice(eur: number): string {
    const converted = Math.round(eur * RATES[currency]);
    return `${SYMBOLS[currency]}${converted}`;
  }

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatPrice }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export const useCurrency = () => useContext(CurrencyContext);
