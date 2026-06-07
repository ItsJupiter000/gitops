"use client";

import { Financials } from "@/lib/types";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

export default function FundamentalsTab({ symbol }: { symbol: string }) {
  const [fin, setFin] = useState<Financials | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!symbol) return;
    setLoading(true);
    setError(null);
    fetch(`/api/fundamentals?symbol=${encodeURIComponent(symbol)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setFin(data as Financials);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [symbol]);

  const isINR = symbol.endsWith('.NS') || symbol.endsWith('.BO');
  const currSym = isINR ? '₹' : '$';

  const formatLargeNum = (num: number | undefined) => {
    if (num == null) return '--';
    if (num >= 1e12) return `${currSym}${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `${currSym}${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e7) return `${currSym}${(num / 1e7).toFixed(2)}Cr`;
    if (num >= 1e6) return `${currSym}${(num / 1e6).toFixed(2)}M`;
    return `${currSym}${num.toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px] gap-3 text-muted-foreground">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span>Loading fundamentals…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-panel p-6 flex flex-col items-center justify-center min-h-[200px] text-center gap-3">
        <p className="text-destructive font-medium">Failed to load fundamentals</p>
        <p className="text-xs text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (!fin) return null;

  const ratios = [
    { label: 'Market Cap', value: formatLargeNum(fin.marketCap) },
    { label: 'P/E Ratio', value: fin.peRatio != null ? fin.peRatio.toFixed(2) : '--' },
    { label: 'P/B Ratio', value: fin.pbRatio != null ? fin.pbRatio.toFixed(2) : '--' },
    { label: 'EPS (TTM)', value: fin.eps != null ? `${currSym}${fin.eps.toFixed(2)}` : '--' },
    { label: 'ROE', value: fin.roe != null ? `${fin.roe.toFixed(2)}%` : '--' },
    { label: 'Div Yield', value: fin.dividendYield != null ? `${fin.dividendYield.toFixed(2)}%` : '--' },
    { label: '52W High', value: fin.week52High != null ? `${currSym}${fin.week52High.toFixed(2)}` : '--' },
    { label: '52W Low', value: fin.week52Low != null ? `${currSym}${fin.week52Low.toFixed(2)}` : '--' },
    { label: 'Beta', value: fin.beta != null ? fin.beta.toFixed(2) : '--' },
    { label: 'Net Margin', value: fin.netMargin != null ? `${fin.netMargin.toFixed(2)}%` : '--' },
    { label: 'D/E Ratio', value: fin.debtToEquity != null ? fin.debtToEquity.toFixed(2) : '--' },
    { label: 'Revenue Growth', value: fin.revenueGrowth != null ? `${fin.revenueGrowth.toFixed(2)}%` : '--' },
  ];

  const financials = [
    { label: 'Revenue', value: formatLargeNum(fin.revenue) },
    { label: 'Net Income', value: formatLargeNum(fin.netIncome) },
    { label: 'Total Debt', value: formatLargeNum(fin.totalDebt) },
    { label: 'Free Cash Flow', value: formatLargeNum(fin.freeCashFlow) },
  ];

  return (
    <div className="space-y-8">
      {/* Key Ratios */}
      <div className="glass-panel p-6">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <div className="w-1 h-5 bg-primary rounded-full"></div>
          Valuation &amp; Ratios
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {ratios.map((item, i) => (
            <div key={i} className="flex flex-col">
              <span className="text-sm text-muted-foreground mb-1">{item.label}</span>
              <span className="text-lg font-mono font-medium">{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Financial Snapshot */}
      <div className="glass-panel p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <div className="w-1 h-5 bg-primary rounded-full"></div>
            Financial Snapshot
          </h3>
        </div>
        <div className="space-y-3">
          {financials.map((item, i) => (
            <div key={i} className="flex justify-between items-center py-2 border-b border-border/50 last:border-0">
              <span className="text-muted-foreground">{item.label}</span>
              <span className="font-mono font-medium">{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Company Profile */}
      <div className="glass-panel p-6">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <div className="w-1 h-5 bg-primary rounded-full"></div>
          Company Profile
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
          <div>
            <div className="text-sm text-muted-foreground mb-1">Sector</div>
            <div className="font-medium">{fin.sector || '--'}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground mb-1">Industry</div>
            <div className="font-medium">{fin.industry || '--'}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground mb-1">Employees</div>
            <div className="font-medium">{fin.employees ? fin.employees.toLocaleString() : '--'}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground mb-1">Country</div>
            <div className="font-medium">{fin.country || '--'}</div>
          </div>
          {fin.website && (
            <div className="md:col-span-2">
              <div className="text-sm text-muted-foreground mb-1">Website</div>
              <a href={fin.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-sm">
                {fin.website}
              </a>
            </div>
          )}
        </div>
        {fin.description && (
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-5">
            {fin.description}
          </p>
        )}
      </div>
    </div>
  );
}
