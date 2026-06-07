"use client";

import { useAppStore } from "@/lib/store";
import { useState } from "react";
import PriceHeader from "@/components/stock/PriceHeader";
import dynamic from 'next/dynamic';
import FundamentalsTab from "@/components/stock/FundamentalsTab";
import NewsTab from "@/components/stock/NewsTab";
import { useQuote } from "@/lib/hooks/useQuote";

const CandlestickChart = dynamic(() => import("../charts/CandlestickChart"), { ssr: false });

type Tab = 'overview' | 'fundamentals' | 'news' | 'actions' | 'ownership' | 'peers';

function formatLargeNum(num: number | undefined, currency = 'USD') {
  if (num == null) return '--';
  const sym = currency === 'INR' ? '₹' : '$';
  if (num >= 1e12) return `${sym}${(num / 1e12).toFixed(2)}T`;
  if (num >= 1e9) return `${sym}${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e7) return `${sym}${(num / 1e7).toFixed(2)}Cr`;
  if (num >= 1e6) return `${sym}${(num / 1e6).toFixed(2)}M`;
  return `${sym}${num.toLocaleString()}`;
}

function formatVolume(vol: number | undefined) {
  if (vol == null) return '--';
  if (vol >= 1e7) return (vol / 1e7).toFixed(2) + ' Cr';
  if (vol >= 1e5) return (vol / 1e5).toFixed(2) + ' L';
  if (vol >= 1e3) return (vol / 1e3).toFixed(1) + 'K';
  return String(vol);
}

export default function StockDashboard() {
  const { selectedStock } = useAppStore();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const { quote } = useQuote(selectedStock?.symbol ?? null, 15000);

  if (!selectedStock) {
    return (
      <div className="flex-1 h-full flex flex-col items-center justify-center text-muted-foreground">
        <div className="w-16 h-16 rounded-full bg-secondary/30 flex items-center justify-center mb-4">
          <svg className="w-8 h-8 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
          </svg>
        </div>
        <p>Select a stock from your watchlist to view details</p>
      </div>
    );
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'fundamentals', label: 'Fundamentals' },
    { id: 'news', label: 'News & Filings' },
    { id: 'actions', label: 'Corporate Actions' },
    { id: 'ownership', label: 'Ownership' },
    { id: 'peers', label: 'Peers' }
  ];

  const currency = quote?.currency ?? (selectedStock.exchange === 'NSE' || selectedStock.exchange === 'BSE' ? 'INR' : 'USD');

  const overviewStats = [
    { label: 'Volume', value: formatVolume(quote?.volume) },
    { label: 'Market Cap', value: formatLargeNum(quote?.marketCap, currency) },
    { label: '52W High', value: quote?.high != null ? `${currency === 'INR' ? '₹' : '$'}${((quote as { fiftyTwoWeekHigh?: number }).fiftyTwoWeekHigh ?? quote.high).toFixed(2)}` : '--' },
    { label: '52W Low', value: quote?.low != null ? `${currency === 'INR' ? '₹' : '$'}${((quote as { fiftyTwoWeekLow?: number }).fiftyTwoWeekLow ?? quote.low).toFixed(2)}` : '--' },
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Sticky Header */}
      <div className="flex-shrink-0 bg-background/95 backdrop-blur-md border-b border-border z-20">
        <div className="p-6">
          <PriceHeader stock={selectedStock} />
        </div>

        {/* Tab Navigation */}
        <div className="flex px-6 gap-6 overflow-x-auto custom-scrollbar border-t border-border/50 pt-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 text-sm font-medium transition-colors whitespace-nowrap relative
                ${activeTab === tab.id ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="h-[400px] glass-panel p-4 flex items-center justify-center">
                <CandlestickChart symbol={selectedStock.symbol} />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {overviewStats.map(stat => (
                  <div key={stat.label} className="glass-card p-4">
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                    <div className="text-xl font-mono mt-1">{stat.value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'fundamentals' && (
            <FundamentalsTab symbol={selectedStock.symbol} />
          )}

          {activeTab === 'news' && (
            <NewsTab symbol={selectedStock.symbol} />
          )}

          {(activeTab === 'actions' || activeTab === 'ownership' || activeTab === 'peers') && (
            <div className="glass-panel p-6 flex items-center justify-center min-h-[400px] text-muted-foreground">
              {tabs.find(t => t.id === activeTab)?.label} — Coming Soon
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
