"use client";

import { useAppStore } from "@/lib/store";
import Sidebar from "@/components/layout/Sidebar";
import WatchlistPanel from "@/components/watchlist/WatchlistPanel";
import StockDashboard from "@/components/stock/StockDashboard";
import PortfolioPanel from "@/components/portfolio/PortfolioPanel";
import ScreenerPanel from "@/components/screener/ScreenerPanel";
import AlertsPanel from "@/components/alerts/AlertsPanel";
import SettingsPanel from "@/components/settings/SettingsPanel";




function Panels() {
  const { activePanel } = useAppStore();

  switch (activePanel) {
    case 'watchlist':
      return (
        <div className="flex w-full h-full">
          <div className="w-80 flex-shrink-0 border-r border-border bg-card/20 overflow-y-auto custom-scrollbar">
            <WatchlistPanel />
          </div>
          <div className="flex-1 bg-background overflow-y-auto custom-scrollbar">
            <StockDashboard />
          </div>
        </div>
      );
    case 'screener':
      return <ScreenerPanel />;
    case 'portfolio':
      return <PortfolioPanel />;
    case 'alerts':
      return <AlertsPanel />;
    case 'settings':
      return <SettingsPanel />;
    default:
      return null;
  }
}

export default function Home() {
  return (
    <>
      <Sidebar />
      <main className="flex-1 h-full overflow-hidden flex flex-col relative z-10">
        <Panels />
      </main>
    </>
  );
}
