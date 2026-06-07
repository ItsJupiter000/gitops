"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { createChart, ColorType, IChartApi, ISeriesApi } from "lightweight-charts";
import { OHLCV, TimeFrame } from "@/lib/types";
import { Loader2 } from "lucide-react";

const TIMEFRAMES: TimeFrame[] = ['1D', '5D', '1M', '3M', '1Y', '5Y'];

async function fetchChartData(symbol: string, period: TimeFrame): Promise<OHLCV[]> {
  const res = await fetch(`/api/chart?symbol=${encodeURIComponent(symbol)}&period=${period}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data.quotes as OHLCV[];
}

export default function CandlestickChart({ symbol }: { symbol: string }) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const [activePeriod, setActivePeriod] = useState<TimeFrame>('3M');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize chart once
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#94a3b8',
      },
      grid: {
        vertLines: { color: 'rgba(255, 255, 255, 0.05)' },
        horzLines: { color: 'rgba(255, 255, 255, 0.05)' },
      },
      crosshair: {
        mode: 0,
        vertLine: { color: 'rgba(255, 255, 255, 0.2)', width: 1, style: 1 },
        horzLine: { color: 'rgba(255, 255, 255, 0.2)', width: 1, style: 1 },
      },
      timeScale: {
        borderColor: 'rgba(255, 255, 255, 0.1)',
        timeVisible: true,
      },
      rightPriceScale: {
        borderColor: 'rgba(255, 255, 255, 0.1)',
      },
      autoSize: true,
    });

    chartRef.current = chart;

    const series = chart.addCandlestickSeries({
      upColor: '#00d4aa',
      downColor: '#ff4d6d',
      borderVisible: false,
      wickUpColor: '#00d4aa',
      wickDownColor: '#ff4d6d',
    });

    seriesRef.current = series;

    return () => {
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, []); // mount only once

  // Load real data when symbol or period changes
  const loadData = useCallback(async () => {
    if (!seriesRef.current) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchChartData(symbol, activePeriod);
      if (!data.length) throw new Error('No chart data returned');
      // lightweight-charts requires time to be sorted ascending
      const sorted = [...data].sort((a, b) => (a.time as number) - (b.time as number));
      seriesRef.current.setData(sorted as Parameters<typeof seriesRef.current.setData>[0]);
      chartRef.current?.timeScale().fitContent();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Chart load failed';
      setError(msg);
      console.error('[CandlestickChart]', msg);
    } finally {
      setLoading(false);
    }
  }, [symbol, activePeriod]);

  useEffect(() => {
    // Small delay so the chart is rendered in DOM first
    const t = setTimeout(loadData, 100);
    return () => clearTimeout(t);
  }, [loadData]);

  return (
    <div className="w-full h-full relative flex flex-col">
      {/* Timeframe Controls */}
      <div className="absolute top-2 left-2 z-10 flex gap-1.5">
        {TIMEFRAMES.map((tf) => (
          <button
            key={tf}
            onClick={() => setActivePeriod(tf)}
            className={`px-2.5 py-1 text-xs font-medium rounded transition-colors border
              ${activePeriod === tf
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-secondary/80 text-secondary-foreground hover:bg-primary hover:text-primary-foreground border-border'}`}
          >
            {tf}
          </button>
        ))}
      </div>

      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/50 backdrop-blur-sm rounded-lg">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      )}

      {/* Error overlay */}
      {error && !loading && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-2 text-muted-foreground">
          <p className="text-sm text-destructive">Failed to load chart data</p>
          <p className="text-xs">{error}</p>
          <button onClick={loadData} className="text-xs text-primary hover:underline">Retry</button>
        </div>
      )}

      <div className="w-full h-full" ref={chartContainerRef} />
    </div>
  );
}
