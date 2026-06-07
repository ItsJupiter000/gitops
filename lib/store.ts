"use client";
import { create } from 'zustand';
import { ActivePanel, Alert, PortfolioTrade, Quote, Stock, Watchlist } from '@/lib/types';
import { DEMO_WATCHLISTS, DEMO_PORTFOLIO, DEMO_ALERTS } from '@/lib/demoData';

interface AppState {
  // Navigation & UI State
  activePanel: ActivePanel;
  setActivePanel: (panel: ActivePanel) => void;
  
  selectedStock: Stock | null;
  setSelectedStock: (stock: Stock | null) => void;
  
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;

  // Watchlists
  watchlists: Watchlist[];
  activeWatchlistId: string;
  setActiveWatchlistId: (id: string) => void;
  addWatchlist: (name: string) => void;
  deleteWatchlist: (id: string) => void;
  renameWatchlist: (id: string, newName: string) => void;
  addStockToWatchlist: (watchlistId: string, stock: Stock) => void;
  removeStockFromWatchlist: (watchlistId: string, symbol: string) => void;

  // Live Data Cache
  quotes: Record<string, Quote>;
  updateQuote: (symbol: string, quote: Partial<Quote>) => void;
  updateQuotesBatch: (newQuotes: Record<string, Quote>) => void;

  // Portfolio
  portfolioTrades: PortfolioTrade[];
  addTrade: (trade: Omit<PortfolioTrade, 'id'>) => void;
  removeTrade: (id: string) => void;

  // Alerts
  alerts: Alert[];
  addAlert: (alert: Omit<Alert, 'id' | 'triggered' | 'createdAt'>) => void;
  removeAlert: (id: string) => void;
  toggleAlertActive: (id: string) => void;

  // API Keys
  apiKeys: {
    finnhub: string;
    alphaVantage: string;
  };
  setApiKey: (provider: 'finnhub' | 'alphaVantage', key: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
      activePanel: 'watchlist',
      setActivePanel: (panel) => set({ activePanel: panel }),

      selectedStock: { symbol: 'RELIANCE.NS', name: 'Reliance Industries Ltd.', exchange: 'NSE', sector: 'Energy' },
      setSelectedStock: (stock) => set({ selectedStock: stock }),

      theme: 'dark',
      setTheme: (theme) => set({ theme }),

      watchlists: DEMO_WATCHLISTS,
      activeWatchlistId: DEMO_WATCHLISTS[0].id,
      setActiveWatchlistId: (id) => set({ activeWatchlistId: id }),
      
      addWatchlist: (name) => set((state) => ({
        watchlists: [...state.watchlists, { id: Date.now().toString(), name, items: [] }]
      })),
      
      deleteWatchlist: (id) => set((state) => ({
        watchlists: state.watchlists.filter(w => w.id !== id),
        activeWatchlistId: state.activeWatchlistId === id && state.watchlists.length > 1
          ? state.watchlists.find(w => w.id !== id)!.id
          : state.activeWatchlistId
      })),
      
      renameWatchlist: (id, newName) => set((state) => ({
        watchlists: state.watchlists.map(w => w.id === id ? { ...w, name: newName } : w)
      })),
      
      addStockToWatchlist: (watchlistId, stock) => set((state) => ({
        watchlists: state.watchlists.map(w => {
          if (w.id === watchlistId) {
            if (w.items.some(item => item.symbol === stock.symbol)) return w;
            return { ...w, items: [...w.items, stock] };
          }
          return w;
        })
      })),
      
      removeStockFromWatchlist: (watchlistId, symbol) => set((state) => ({
        watchlists: state.watchlists.map(w => 
          w.id === watchlistId 
            ? { ...w, items: w.items.filter(item => item.symbol !== symbol) }
            : w
        )
      })),

      quotes: {},
      updateQuote: (symbol, quotePart) => set((state) => ({
        quotes: {
          ...state.quotes,
          [symbol]: { ...state.quotes[symbol], ...quotePart } as Quote
        }
      })),
      updateQuotesBatch: (newQuotes) => set((state) => ({
        quotes: { ...state.quotes, ...newQuotes }
      })),

      portfolioTrades: DEMO_PORTFOLIO,
      addTrade: (trade) => set((state) => ({
        portfolioTrades: [...state.portfolioTrades, { ...trade, id: Date.now().toString() }]
      })),
      removeTrade: (id) => set((state) => ({
        portfolioTrades: state.portfolioTrades.filter(t => t.id !== id)
      })),

      alerts: DEMO_ALERTS,
      addAlert: (alert) => set((state) => ({
        alerts: [...state.alerts, { ...alert, id: Date.now().toString(), triggered: false, createdAt: new Date().toISOString() }]
      })),
      removeAlert: (id) => set((state) => ({
        alerts: state.alerts.filter(a => a.id !== id)
      })),
      toggleAlertActive: (id) => set((state) => ({
        alerts: state.alerts.map(a => a.id === id ? { ...a, active: !a.active } : a)
      })),

      apiKeys: {
        finnhub: '',
        alphaVantage: ''
      },
      setApiKey: (provider, key) => set((state) => ({
        apiKeys: { ...state.apiKeys, [provider]: key }
      })),
    }));
