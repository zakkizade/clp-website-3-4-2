"use client"

import { createContext, useContext, useEffect, useMemo, useState } from "react"

type CurrencyContextValue = { currency: string; setCurrency: (currency: string) => void }
const CurrencyContext = createContext<CurrencyContextValue | null>(null)

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState("INR")
  useEffect(() => {
    const saved = window.localStorage.getItem("clp-currency")
    if (saved) setCurrencyState(saved)
  }, [])
  const value = useMemo(() => ({ currency, setCurrency: (next: string) => { setCurrencyState(next); window.localStorage.setItem("clp-currency", next) } }), [currency])
  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>
}

export function useCurrency() {
  const context = useContext(CurrencyContext)
  if (!context) throw new Error("useCurrency must be used inside CurrencyProvider")
  return context
}
