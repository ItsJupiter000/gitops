"use client";

import { useAppStore } from "@/lib/store";
import { Plus, ChevronDown, MoreVertical, Search, X, Loader2 } from "lucide-react";
import WatchlistItem from "./WatchlistItem";
import { useState, useEffect, useCallback, useRef } from "react";
import { Stock } from "@/lib/types";

interface LiveQuote {
  price: number;
  change: number;
  changePercent: number;
  currency?: string;
}

interface SearchResult {
  symbol: string;
  name: string;
  exchange: string;
  sector?: string;
}

export default function WatchlistPanel() {
  const { watchlists, activeWatchlistId, setActiveWatchlistId, selectedStock, addStockToWatchlist } = useAppStore();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [quotes, setQuotes] = useState<Record<string, LiveQuote>>({});
  const [quotesLoading, setQuotesLoading] = useState(false);
  const searchDebounceRef = useRef<NodeJS.Timeout | null>(null);

  const activeWatchlist = watchlists.find(w => w.id === activeWatchlistId) || watchlists[0];

  // Fetch batch quotes for all items in active watchlist
  const fetchQuotes = useCallback(async () => {
    const symbols = activeWatchlist?.items.map(i => i.symbol) ?? [];
    if (!symbols.length) return;
    setQuotesLoading(true);
    try {
      const res = await fetch(`/api/quotes-batch?symbols=${symbols.map(encodeURIComponent).join(',')}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setQuotes(prev => ({ ...prev, ...data }));
    } catch (e) {
      console.error('Watchlist batch quote error:', e);
    } finally {
      setQuotesLoading(false);
    }
  }, [activeWatchlist?.items.map(i => i.symbol).join(',')]); // eslint-disable-line

  // Initial + periodic refresh (every 20s)
  useEffect(() => {
    fetchQuotes();
    const id = setInterval(fetchQuotes, 20000);
    return () => clearInterval(id);
  }, [fetchQuotes]);

  // Debounced search
  useEffect(() => {
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    searchDebounceRef.current = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
        const data = await res.json();
        setSearchResults(data.results ?? []);
      } catch {
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 400);
  }, [searchQuery]);

  const handleAddStock = (result: SearchResult) => {
    const stock: Stock = {
      symbol: result.symbol,
      name: result.name,
      exchange: result.exchange,
      sector: result.sector,
    };
    addStockToWatchlist(activeWatchlistId, stock);
    setSearchQuery('');
    setSearchResults([]);
  };

  return (
    <div className="flex flex-col h-full bg-card/30 border-r border-border backdrop-blur-sm">
      {/* Header & Watchlist Selector */}
      <div className="p-4 border-b border-border flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-md z-10">
        <div className="relative">
          <button
            className="flex items-center gap-2 text-lg font-bold hover:text-primary transition-colors"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            {activeWatchlist?.name}
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          </button>

          {isDropdownOpen && (
            <div className="absolute top-full left-0 mt-2 w-48 bg-popover border border-border rounded-lg shadow-xl z-50 py-1">
              {watchlists.map(w => (
                <button
                  key={w.id}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-secondary/50 transition-colors ${activeWatchlistId === w.id ? 'text-primary font-medium' : 'text-foreground'}`}
                  onClick={() => {
                    setActiveWatchlistId(w.id);
                    setIsDropdownOpen(false);
                  }}
                >
                  {w.name}
                </button>
              ))}
              <div className="border-t border-border mt-1 pt-1">
                <button className="w-full text-left px-4 py-2 text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
                  <Plus className="w-3 h-3" /> Create new list
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1">
          {quotesLoading && <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />}
          <button className="p-2 text-muted-foreground hover:text-foreground rounded-md hover:bg-secondary/50 transition-all">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search Bar with Autocomplete */}
      <div className="p-3 border-b border-border relative">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search & add symbols..."
            className="w-full bg-secondary/50 border border-border rounded-lg pl-9 pr-9 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all text-foreground placeholder:text-muted-foreground"
          />
          {searchLoading && <Loader2 className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-muted-foreground" />}
          {searchQuery && !searchLoading && (
            <button
              onClick={() => { setSearchQuery(''); setSearchResults([]); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Dropdown results */}
        {searchResults.length > 0 && (
          <div className="absolute left-3 right-3 top-full mt-1 bg-popover border border-border rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto">
            {searchResults.map(result => (
              <button
                key={result.symbol}
                onClick={() => handleAddStock(result)}
                className="w-full text-left px-4 py-2.5 hover:bg-secondary/50 transition-colors border-b border-border/50 last:border-0"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm text-foreground">{result.symbol}</span>
                  <span className="text-xs text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">{result.exchange}</span>
                </div>
                <div className="text-xs text-muted-foreground truncate">{result.name}</div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* List Items */}
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col">
          {activeWatchlist?.items.map((stock) => (
            <WatchlistItem
              key={stock.symbol}
              stock={stock}
              isSelected={selectedStock?.symbol === stock.symbol}
              quote={quotes[stock.symbol] as LiveQuote | undefined}
              loading={quotesLoading && !quotes[stock.symbol]}
            />
          ))}

          {activeWatchlist?.items.length === 0 && (
            <div className="p-8 text-center text-muted-foreground text-sm flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-secondary/50 flex items-center justify-center">
                <Search className="w-5 h-5 opacity-50" />
              </div>
              <p>This watchlist is empty.</p>
              <p className="text-xs">Use the search bar above to add stocks</p>
            </div>
          )}
        </div>
      </div>

      {/* Live badge */}
      <div className="px-4 py-2 border-t border-border flex items-center gap-2 text-xs text-muted-foreground">
        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
        Live prices · refreshes every 20s
      </div>
    </div>
  );
}
