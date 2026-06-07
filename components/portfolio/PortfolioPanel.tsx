"use client";

import { useAppStore } from "@/lib/store";
import { PieChart, ArrowUpRight, ArrowDownRight, TrendingUp, DollarSign, Wallet } from "lucide-react";

export default function PortfolioPanel() {
  const { portfolioTrades } = useAppStore();

  // Basic mock calculations (assuming static current prices for demo)
  const mockCurrentPrices: Record<string, number> = {
    'RELIANCE.NS': 2950.00,
    'TCS.NS': 3900.00,
    'AAPL': 185.00
  };

  let totalInvested = 0;
  let totalCurrentValue = 0;

  const holdings = portfolioTrades.map(trade => {
    const currentPrice = mockCurrentPrices[trade.symbol] || trade.price;
    const invested = trade.price * trade.quantity;
    const current = currentPrice * trade.quantity;
    const pnl = current - invested;
    const pnlPercent = (pnl / invested) * 100;
    
    totalInvested += invested;
    totalCurrentValue += current;

    return {
      ...trade,
      currentPrice,
      invested,
      current,
      pnl,
      pnlPercent
    };
  });

  const totalPnl = totalCurrentValue - totalInvested;
  const totalPnlPercent = totalInvested > 0 ? (totalPnl / totalInvested) * 100 : 0;
  const isPositive = totalPnl >= 0;

  return (
    <div className="p-8 w-full max-w-6xl mx-auto h-full overflow-y-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-1 text-foreground">Portfolio Overview</h2>
          <p className="text-muted-foreground">Track your holdings, performance, and allocations.</p>
        </div>
        <button className="px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 flex items-center gap-2">
          <Wallet className="w-4 h-4" /> Add Trade
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="glass-panel p-6">
          <div className="flex items-center gap-3 text-muted-foreground mb-3">
            <DollarSign className="w-5 h-5 text-primary" />
            <span className="font-medium">Total Invested</span>
          </div>
          <div className="text-3xl font-mono font-bold">₹{totalInvested.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
        </div>
        
        <div className="glass-panel p-6">
          <div className="flex items-center gap-3 text-muted-foreground mb-3">
            <TrendingUp className="w-5 h-5 text-primary" />
            <span className="font-medium">Current Value</span>
          </div>
          <div className="text-3xl font-mono font-bold">₹{totalCurrentValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
        </div>
        
        <div className="glass-panel p-6 relative overflow-hidden">
          <div className={`absolute top-0 left-0 w-1 h-full ${isPositive ? 'bg-primary' : 'bg-destructive'}`}></div>
          <div className="flex items-center gap-3 text-muted-foreground mb-3">
            <PieChart className="w-5 h-5" />
            <span className="font-medium">Total P&L</span>
          </div>
          <div className="flex items-end gap-3">
            <div className={`text-3xl font-mono font-bold ${isPositive ? 'text-primary' : 'text-destructive'}`}>
              {isPositive ? '+' : '-'}₹{Math.abs(totalPnl).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className={`flex items-center font-medium mb-1 ${isPositive ? 'text-primary' : 'text-destructive'}`}>
              {isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
              {Math.abs(totalPnlPercent).toFixed(2)}%
            </div>
          </div>
        </div>
      </div>

      {/* Holdings Table */}
      <div className="glass-panel overflow-hidden">
        <div className="p-6 border-b border-border flex justify-between items-center">
          <h3 className="text-xl font-bold flex items-center gap-2">
             <div className="w-1 h-5 bg-primary rounded-full"></div>
             Your Holdings
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-secondary/30 text-muted-foreground text-sm border-b border-border">
                <th className="p-4 font-medium">Asset</th>
                <th className="p-4 font-medium text-right">Qty</th>
                <th className="p-4 font-medium text-right">Avg Price</th>
                <th className="p-4 font-medium text-right">LTP</th>
                <th className="p-4 font-medium text-right">Invested</th>
                <th className="p-4 font-medium text-right">Current</th>
                <th className="p-4 font-medium text-right">P&L</th>
              </tr>
            </thead>
            <tbody>
              {holdings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted-foreground">
                    No trades added yet. Add a trade to track your portfolio.
                  </td>
                </tr>
              ) : holdings.map((h, i) => (
                <tr key={h.id} className="border-b border-border/50 hover:bg-secondary/20 transition-colors">
                  <td className="p-4">
                    <div className="font-semibold text-foreground">{h.symbol}</div>
                    <div className="text-xs text-muted-foreground">{h.name}</div>
                  </td>
                  <td className="p-4 text-right font-mono">{h.quantity}</td>
                  <td className="p-4 text-right font-mono">{(h.price).toLocaleString()}</td>
                  <td className="p-4 text-right font-mono">{(h.currentPrice).toLocaleString()}</td>
                  <td className="p-4 text-right font-mono">{(h.invested).toLocaleString()}</td>
                  <td className="p-4 text-right font-mono font-medium text-foreground">{(h.current).toLocaleString()}</td>
                  <td className={`p-4 text-right font-mono font-medium flex justify-end items-center gap-1 ${h.pnl >= 0 ? 'text-primary' : 'text-destructive'}`}>
                    {h.pnl >= 0 ? '+' : ''}{(h.pnlPercent).toFixed(2)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
