"use client";

import { useAppStore } from "@/lib/store";
import { Stock } from "@/lib/types";
import { useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowUp, Loader2 } from "lucide-react";

interface WatchlistItemProps {
  stock: Stock;
  isSelected: boolean;
  quote?: {
    price: number;
    change: number;
    changePercent: number;
    currency?: string;
  } | null;
  loading?: boolean;
}

export default function WatchlistItem({ stock, isSelected, quote, loading }: WatchlistItemProps) {
  const { setSelectedStock } = useAppStore();
  const [flash, setFlash] = useState<'up' | 'down' | null>(null);
  const prevPriceRef = useRef<number | null>(null);

  // Flash effect on price change
  useEffect(() => {
    if (!quote) return;
    if (prevPriceRef.current !== null && prevPriceRef.current !== quote.price) {
      const dir = quote.price > prevPriceRef.current ? 'up' : 'down';
      setFlash(dir);
      const t = setTimeout(() => setFlash(null), 1000);
      return () => clearTimeout(t);
    }
    prevPriceRef.current = quote.price;
  }, [quote?.price]);

  const isPositive = (quote?.change ?? 0) >= 0;
  const currency = quote?.currency ?? (stock.symbol.endsWith('.NS') || stock.symbol.endsWith('.BO') ? 'INR' : 'USD');
  const symbol = currency === 'INR' ? '₹' : '$';

  return (
    <button
      onClick={() => setSelectedStock(stock)}
      className={`w-full text-left px-4 py-3 border-b border-border transition-colors group relative
        ${isSelected ? 'bg-primary/5 border-l-2 border-l-primary' : 'hover:bg-secondary/30 border-l-2 border-l-transparent'}`}
    >
      <div className={`absolute inset-0 z-0 pointer-events-none ${flash === 'up' ? 'price-flash-up' : flash === 'down' ? 'price-flash-down' : ''}`} />

      <div className="relative z-10 flex justify-between items-center">
        <div>
          <div className="font-semibold text-foreground">
            {stock.symbol.split('.')[0]}
          </div>
          <div className="text-xs text-muted-foreground truncate max-w-[120px]">
            {stock.name}
          </div>
        </div>

        <div className="text-right">
          {loading && !quote ? (
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground ml-auto" />
          ) : quote ? (
            <>
              <div className="font-mono font-medium text-foreground">
                {symbol}{quote.price.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className={`text-xs font-medium flex items-center justify-end gap-0.5 ${isPositive ? 'text-primary' : 'text-destructive'}`}>
                {isPositive ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                {Math.abs(quote.change).toFixed(2)} ({Math.abs(quote.changePercent).toFixed(2)}%)
              </div>
            </>
          ) : (
            <div className="text-xs text-muted-foreground">--</div>
          )}
        </div>
      </div>
    </button>
  );
}
