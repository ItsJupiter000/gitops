export interface Stock {
  symbol: string;
  name: string;
  exchange: string;
  sector?: string;
  industry?: string;
}

export interface Quote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  open: number;
  prevClose: number;
  volume: number;
  marketCap?: number;
  timestamp: number;
}

export interface OHLCV {
  time: number; // unix timestamp
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface WatchlistItem {
  symbol: string;
  name: string;
  exchange: string;
}

export interface Watchlist {
  id: string;
  name: string;
  items: WatchlistItem[];
}

export interface PortfolioTrade {
  id: string;
  symbol: string;
  name: string;
  type: 'buy' | 'sell';
  quantity: number;
  price: number;
  date: string;
}

export interface Holding {
  symbol: string;
  name: string;
  quantity: number;
  avgPrice: number;
  currentPrice: number;
  investedValue: number;
  currentValue: number;
  pnl: number;
  pnlPercent: number;
}

export interface Alert {
  id: string;
  symbol: string;
  name: string;
  condition: 'above' | 'below';
  threshold: number;
  active: boolean;
  triggered: boolean;
  createdAt: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  summary?: string;
  source: string;
  url: string;
  publishedAt: string;
  image?: string;
}

export interface Financials {
  symbol: string;
  marketCap?: number;
  peRatio?: number;
  pbRatio?: number;
  eps?: number;
  roe?: number;
  dividendYield?: number;
  week52High?: number;
  week52Low?: number;
  revenue?: number;
  netIncome?: number;
  totalAssets?: number;
  totalDebt?: number;
  freeCashFlow?: number;
  revenueGrowth?: number;
  netMargin?: number;
  debtToEquity?: number;
  currentRatio?: number;
  beta?: number;
  description?: string;
  sector?: string;
  industry?: string;
  employees?: number;
  country?: string;
  website?: string;
}

export interface CorporateAction {
  date: string;
  type: 'dividend' | 'split' | 'bonus' | 'rights' | 'buyback';
  amount?: number;
  ratio?: string;
  description: string;
}

export interface ShareholdingData {
  promoter: number;
  fii: number;
  dii: number;
  retail: number;
  quarter: string;
}

export interface ScreenerFilter {
  field: string;
  operator: '<' | '>' | '=' | '>=' | '<=';
  value: number;
}

export type ActivePanel = 'watchlist' | 'screener' | 'portfolio' | 'alerts' | 'settings';
export type TimeFrame = '1D' | '5D' | '1M' | '3M' | '1Y' | '5Y';
export type ChartType = 'candlestick' | 'line' | 'area';
