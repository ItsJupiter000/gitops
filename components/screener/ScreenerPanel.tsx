"use client";

import { useAppStore } from "@/lib/store";
import { Filter, Search, Plus, Play } from "lucide-react";
import { useState } from "react";

export default function ScreenerPanel() {
  const [filters, setFilters] = useState([
    { field: 'P/E Ratio', op: '<', value: '25' },
    { field: 'ROE %', op: '>', value: '15' },
    { field: 'Market Cap (B)', op: '>', value: '10' }
  ]);

  return (
    <div className="p-8 w-full max-w-6xl mx-auto h-full flex flex-col">
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight mb-1 text-foreground">Stock Screener</h2>
        <p className="text-muted-foreground">Filter stocks based on fundamental and technical indicators.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 min-h-0">
        {/* Filters Sidebar */}
        <div className="glass-panel p-6 flex flex-col h-full border-r border-border/50">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold flex items-center gap-2">
              <Filter className="w-4 h-4 text-primary" /> Active Filters
            </h3>
            <button className="text-xs text-primary hover:underline">Clear All</button>
          </div>
          
          <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {filters.map((f, i) => (
              <div key={i} className="bg-secondary/30 p-3 rounded-lg border border-border flex items-center justify-between gap-2">
                <div className="flex-1">
                  <div className="text-xs text-muted-foreground mb-1">{f.field}</div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono bg-secondary px-2 py-0.5 rounded text-sm">{f.op}</span>
                    <span className="font-mono font-medium">{f.value}</span>
                  </div>
                </div>
                <button className="text-muted-foreground hover:text-destructive p-1 rounded-md transition-colors">&times;</button>
              </div>
            ))}
            
            <button className="w-full py-2 flex items-center justify-center gap-2 border border-dashed border-border rounded-lg text-sm text-muted-foreground hover:text-foreground hover:border-muted-foreground transition-colors">
              <Plus className="w-4 h-4" /> Add Filter
            </button>
          </div>
          
          <button className="w-full mt-4 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 flex items-center justify-center gap-2">
            <Play className="w-4 h-4 fill-current" /> Run Screener
          </button>
        </div>

        {/* Results Area */}
        <div className="lg:col-span-3 glass-panel flex flex-col h-full overflow-hidden">
          <div className="p-4 border-b border-border flex justify-between items-center bg-secondary/10">
            <div className="text-sm font-medium">124 Matches Found</div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input 
                  type="text" 
                  placeholder="Search in results..."
                  className="bg-secondary/50 border border-border rounded-lg pl-9 pr-4 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all w-64"
                />
              </div>
              <button className="px-3 py-1.5 border border-border rounded-lg text-sm hover:bg-secondary/50 transition-colors">Export CSV</button>
            </div>
          </div>
          
          <div className="flex-1 overflow-auto custom-scrollbar p-0">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-card/95 backdrop-blur-md z-10 border-b border-border shadow-sm">
                <tr className="text-muted-foreground text-sm">
                  <th className="p-4 font-medium">Symbol</th>
                  <th className="p-4 font-medium text-right">Price</th>
                  <th className="p-4 font-medium text-right">Market Cap</th>
                  <th className="p-4 font-medium text-right">P/E</th>
                  <th className="p-4 font-medium text-right">ROE</th>
                  <th className="p-4 font-medium text-right">Div Yield</th>
                  <th className="p-4 font-medium text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {['TCS.NS', 'INFY.NS', 'HCLTECH.NS', 'WIPRO.NS', 'TECHM.NS'].map((sym, i) => (
                  <tr key={sym} className="border-b border-border/50 hover:bg-secondary/20 transition-colors">
                    <td className="p-4 font-semibold text-foreground">{sym}</td>
                    <td className="p-4 text-right font-mono text-sm">{(3000 + Math.random() * 1000).toFixed(2)}</td>
                    <td className="p-4 text-right font-mono text-sm">{(100 + Math.random() * 50).toFixed(1)}B</td>
                    <td className="p-4 text-right font-mono text-sm text-primary">{(15 + Math.random() * 5).toFixed(1)}</td>
                    <td className="p-4 text-right font-mono text-sm text-primary">{(18 + Math.random() * 10).toFixed(1)}%</td>
                    <td className="p-4 text-right font-mono text-sm">{(1 + Math.random() * 2).toFixed(1)}%</td>
                    <td className="p-4 text-center">
                      <button className="text-xs text-primary hover:underline font-medium">Add to Watchlist</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
