"use client";

import { useAppStore } from "@/lib/store";
import { Key, Save, Moon, Sun } from "lucide-react";

export default function SettingsPanel() {
  const { apiKeys, setApiKey, theme, setTheme } = useAppStore();

  return (
    <div className="p-8 w-full max-w-4xl mx-auto h-full overflow-y-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight mb-1 text-foreground">Settings</h2>
        <p className="text-muted-foreground">Manage your API keys and app preferences.</p>
      </div>

      <div className="space-y-8">
        {/* Appearance */}
        <div className="glass-panel p-6">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
             <div className="w-1 h-5 bg-primary rounded-full"></div>
             Appearance
          </h3>
          <div className="flex gap-4">
            <button 
              onClick={() => setTheme('dark')}
              className={`flex-1 p-4 rounded-xl border flex flex-col items-center gap-3 transition-all ${theme === 'dark' ? 'border-primary bg-primary/10' : 'border-border bg-secondary/30 hover:border-muted-foreground'}`}
            >
              <Moon className="w-8 h-8" />
              <span className="font-medium">Dark Mode</span>
            </button>
            <button 
              onClick={() => setTheme('light')}
              className={`flex-1 p-4 rounded-xl border flex flex-col items-center gap-3 transition-all ${theme === 'light' ? 'border-primary bg-primary/10' : 'border-border bg-secondary/30 hover:border-muted-foreground'}`}
            >
              <Sun className="w-8 h-8" />
              <span className="font-medium">Light Mode</span>
            </button>
          </div>
        </div>

        {/* API Keys */}
        <div className="glass-panel p-6">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-xl font-bold flex items-center gap-2">
               <div className="w-1 h-5 bg-primary rounded-full"></div>
               API Integration
            </h3>
          </div>
          <p className="text-sm text-muted-foreground mb-6">StockPulse uses free public APIs to fetch real-time and historical data. Enter your API keys below. They are stored locally on your device.</p>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <Key className="w-4 h-4 text-primary" /> Alpha Vantage API Key
              </label>
              <input 
                type="password"
                value={apiKeys.alphaVantage}
                onChange={(e) => setApiKey('alphaVantage', e.target.value)}
                placeholder="Enter Alpha Vantage key..."
                className="w-full bg-secondary/50 border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all text-foreground"
              />
              <p className="text-xs text-muted-foreground">Used for historical data, fundamentals, and corporate actions. <a href="https://www.alphavantage.co/support/#api-key" target="_blank" className="text-primary hover:underline">Get a free key</a></p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <Key className="w-4 h-4 text-primary" /> Finnhub API Key
              </label>
              <input 
                type="password"
                value={apiKeys.finnhub}
                onChange={(e) => setApiKey('finnhub', e.target.value)}
                placeholder="Enter Finnhub key..."
                className="w-full bg-secondary/50 border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all text-foreground"
              />
              <p className="text-xs text-muted-foreground">Used for real-time live price ticks. <a href="https://finnhub.io/register" target="_blank" className="text-primary hover:underline">Get a free key</a></p>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end">
            <button className="px-6 py-2 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 flex items-center gap-2">
              <Save className="w-4 h-4" /> Save Keys
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
