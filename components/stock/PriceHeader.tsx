"use client";

import { Stock } from "@/lib/types";
import { ArrowDown, ArrowUp, Bookmark, Bell, Share2, RefreshCw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useQuote } from "@/lib/hooks/useQuote";

function formatCurrency(price: number, currency = 'INR') {
  if (currency === 'INR') return `₹${price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatVolume(vol: number) {
  if (vol >= 1e7) return (vol / 1e7).toFixed(2) + ' Cr';
  if (vol >= 1e5) return (vol / 1e5).toFixed(2) + ' L';
  if (vol >= 1e3) return (vol / 1e3).toFixed(1) + 'K';
  return vol.toString();
}

export default function PriceHeader({ stock }: { stock: Stock }) {
  const { quote, loading, error, refetch } = useQuote(stock.symbol, 15000);
  const [flash, setFlash] = useState<'up' | 'down' | null>(null);
  const prevPriceRef = useRef<number | null>(null);

  // Flash animation when price changes
  useEffect(() => {
    if (!quote) return;
    if (prevPriceRef.current !== null) {
      const dir = quote.price > prevPriceRef.current ? 'up' : quote.price < prevPriceRef.current ? 'down' : null;
      if (dir) {
        setFlash(dir);
        const t = setTimeout(() => setFlash(null), 1200);
        return () => clearTimeout(t);
      }
    }
    prevPriceRef.current = quote.price;
  }, [quote?.price]);

  const currency = (quote as { currency?: string } | null)?.currency ?? (stock.exchange === 'NSE' || stock.exchange === 'BSE' ? 'INR' : 'USD');
  const isPositive = (quote?.change ?? 0) >= 0;

  return (
    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">{stock.symbol.split('.')[0]}</h1>
          <span className="px-2 py-0.5 rounded text-xs font-medium bg-secondary text-secondary-foreground border border-border">
            {stock.exchange}
          </span>
          {stock.sector && (
            <span className="px-2 py-0.5 rounded text-xs text-muted-foreground border border-border">
              {stock.sector}
            </span>
          )}
        </div>
        <div className="text-lg text-muted-foreground">{stock.name}</div>

        {/* OHLC row */}
        {quote && (
          <div className="flex flex-wrap gap-x-5 gap-y-1 mt-2 text-xs text-muted-foreground font-mono">
            <span>O <strong className="text-foreground">{formatCurrency(quote.open, currency)}</strong></span>
            <span>H <strong className="text-primary">{formatCurrency(quote.high, currency)}</strong></span>
            <span>L <strong className="text-destructive">{formatCurrency(quote.low, currency)}</strong></span>
            <span>PC <strong className="text-foreground">{formatCurrency(quote.prevClose, currency)}</strong></span>
            <span>Vol <strong className="text-foreground">{formatVolume(quote.volume)}</strong></span>
          </div>
        )}
      </div>

      <div className="flex flex-col md:items-end">
        <div className="flex items-center gap-4 mb-2">
          {loading && !quote ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span className="text-lg">Fetching live price…</span>
            </div>
          ) : error && !quote ? (
            <div className="text-destructive text-sm">
              ⚠ Failed to load price
              <button onClick={refetch} className="ml-2 underline text-xs">Retry</button>
            </div>
          ) : quote ? (
            <>
              <div className="relative">
                <div className={`absolute -inset-2 rounded-lg z-0 pointer-events-none transition-colors duration-1000 ${flash === 'up' ? 'bg-primary/20' : flash === 'down' ? 'bg-destructive/20' : 'bg-transparent'}`} />
                <span className="relative z-10 text-4xl font-mono font-bold tracking-tight text-foreground">
                  {formatCurrency(quote.price, currency)}
                </span>
              </div>

              <div className={`flex flex-col items-end ${isPositive ? 'text-primary' : 'text-destructive'}`}>
                <div className="flex items-center gap-1 font-semibold text-lg">
                  {isPositive ? <ArrowUp className="w-5 h-5" /> : <ArrowDown className="w-5 h-5" />}
                  {Math.abs(quote.change).toFixed(2)}
                </div>
                <div className="font-medium">
                  ({isPositive ? '+' : '-'}{Math.abs(quote.changePercent).toFixed(2)}%)
                </div>
              </div>
            </>
          ) : null}
        </div>

        <div className="flex items-center gap-2 mt-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
            Buy
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-destructive text-destructive-foreground font-semibold rounded-lg hover:bg-destructive/90 transition-colors shadow-lg shadow-destructive/20">
            Sell
          </button>
          <div className="w-px h-8 bg-border mx-2"></div>
          <button
            onClick={refetch}
            title="Refresh price"
            className={`p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary transition-colors ${loading ? 'animate-spin' : ''}`}
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          <button className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary transition-colors" title="Add to Watchlist">
            <Bookmark className="w-5 h-5" />
          </button>
          <button className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary transition-colors" title="Set Alert">
            <Bell className="w-5 h-5" />
          </button>
          <button className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary transition-colors" title="Share">
            <Share2 className="w-5 h-5" />
          </button>
        </div>

        {/* Live indicator */}
        <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          Live · refreshes every 15s
        </div>
      </div>
    </div>
  );
}
