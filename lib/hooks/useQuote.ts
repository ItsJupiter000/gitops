"use client";

import { useState, useEffect, useCallback } from 'react';
import { Quote } from '@/lib/types';

interface RealQuote extends Quote {
  currency?: string;
  fiftyTwoWeekHigh?: number;
  fiftyTwoWeekLow?: number;
}

export function useQuote(symbol: string | null, refreshInterval = 15000) {
  const [quote, setQuote] = useState<RealQuote | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchQuote = useCallback(async () => {
    if (!symbol) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/quote?symbol=${encodeURIComponent(symbol)}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setQuote(data as RealQuote);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Fetch failed';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [symbol]);

  useEffect(() => {
    fetchQuote();
    if (!refreshInterval) return;
    const id = setInterval(fetchQuote, refreshInterval);
    return () => clearInterval(id);
  }, [fetchQuote, refreshInterval]);

  return { quote, loading, error, refetch: fetchQuote };
}

export function useBatchQuotes(symbols: string[], refreshInterval = 20000) {
  const [quotes, setQuotes] = useState<Record<string, RealQuote>>({});
  const [loading, setLoading] = useState(false);

  const fetchAll = useCallback(async () => {
    if (!symbols.length) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/quotes-batch?symbols=${symbols.map(encodeURIComponent).join(',')}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setQuotes(prev => ({ ...prev, ...data }));
    } catch (e) {
      console.error('Batch quote fetch failed:', e);
    } finally {
      setLoading(false);
    }
  }, [symbols.join(',')]); // eslint-disable-line

  useEffect(() => {
    fetchAll();
    if (!refreshInterval) return;
    const id = setInterval(fetchAll, refreshInterval);
    return () => clearInterval(id);
  }, [fetchAll, refreshInterval]);

  return { quotes, loading, refetch: fetchAll };
}
