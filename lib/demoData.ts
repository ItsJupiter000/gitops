import { Alert, PortfolioTrade, Watchlist } from './types';

export const DEMO_WATCHLISTS: Watchlist[] = [
  {
    id: '1',
    name: 'NIFTY 50',
    items: [
      { symbol: 'RELIANCE.NS', name: 'Reliance Industries', exchange: 'NSE' },
      { symbol: 'TCS.NS', name: 'Tata Consultancy Services', exchange: 'NSE' },
      { symbol: 'HDFCBANK.NS', name: 'HDFC Bank', exchange: 'NSE' },
      { symbol: 'INFY.NS', name: 'Infosys', exchange: 'NSE' },
      { symbol: 'ICICIBANK.NS', name: 'ICICI Bank', exchange: 'NSE' },
    ]
  },
  {
    id: '2',
    name: 'US Tech',
    items: [
      { symbol: 'AAPL', name: 'Apple Inc.', exchange: 'NASDAQ' },
      { symbol: 'MSFT', name: 'Microsoft Corp.', exchange: 'NASDAQ' },
      { symbol: 'GOOGL', name: 'Alphabet Inc.', exchange: 'NASDAQ' },
      { symbol: 'AMZN', name: 'Amazon.com Inc.', exchange: 'NASDAQ' },
      { symbol: 'TSLA', name: 'Tesla Inc.', exchange: 'NASDAQ' },
    ]
  }
];

export const DEMO_PORTFOLIO: PortfolioTrade[] = [
  {
    id: 't1',
    symbol: 'RELIANCE.NS',
    name: 'Reliance Industries',
    type: 'buy',
    quantity: 50,
    price: 2850.00,
    date: '2023-11-15'
  },
  {
    id: 't2',
    symbol: 'TCS.NS',
    name: 'Tata Consultancy Services',
    type: 'buy',
    quantity: 20,
    price: 3800.50,
    date: '2024-01-10'
  },
  {
    id: 't3',
    symbol: 'AAPL',
    name: 'Apple Inc.',
    type: 'buy',
    quantity: 10,
    price: 175.20,
    date: '2023-12-05'
  }
];

export const DEMO_ALERTS: Alert[] = [
  {
    id: 'a1',
    symbol: 'RELIANCE.NS',
    name: 'Reliance Industries',
    condition: 'above',
    threshold: 3000,
    active: true,
    triggered: false,
    createdAt: '2024-04-20T10:00:00Z'
  },
  {
    id: 'a2',
    symbol: 'HDFCBANK.NS',
    name: 'HDFC Bank',
    condition: 'below',
    threshold: 1400,
    active: true,
    triggered: false,
    createdAt: '2024-04-21T14:30:00Z'
  }
];
