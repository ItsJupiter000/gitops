"use client";

import { useAppStore } from "@/lib/store";
import { Activity, LayoutDashboard, LineChart, PieChart, Settings, Bell } from "lucide-react";
import { ActivePanel } from "@/lib/types";

export default function Sidebar() {
  const { activePanel, setActivePanel } = useAppStore();

  const navItems: { id: ActivePanel; label: string; icon: any }[] = [
    { id: 'watchlist', label: 'Watchlist', icon: LayoutDashboard },
    { id: 'screener', label: 'Screener', icon: Activity },
    { id: 'portfolio', label: 'Portfolio', icon: PieChart },
    { id: 'alerts', label: 'Alerts', icon: Bell },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="w-16 lg:w-64 border-r border-border bg-card/40 backdrop-blur-md flex flex-col h-full transition-all duration-300">
      <div className="h-16 flex items-center justify-center lg:justify-start lg:px-6 border-b border-border">
        <LineChart className="w-8 h-8 text-primary" />
        <span className="hidden lg:block ml-3 font-bold text-xl tracking-tight text-foreground">
          Stock<span className="text-primary">Pulse</span>
        </span>
      </div>

      <div className="flex-1 py-6 flex flex-col gap-2 px-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePanel === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActivePanel(item.id)}
              className={`flex items-center gap-4 px-3 py-3 rounded-xl transition-all duration-200 group
                ${isActive 
                  ? 'bg-primary/10 text-primary' 
                  : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
                }`}
              title={item.label}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-primary' : 'group-hover:text-foreground'}`} />
              <span className={`hidden lg:block font-medium ${isActive ? 'text-primary' : ''}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
      
      {/* Mini Profile/Status at bottom */}
      <div className="p-4 border-t border-border flex justify-center lg:justify-start items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center flex-shrink-0">
          <span className="text-xs font-bold text-primary">SP</span>
        </div>
        <div className="hidden lg:block text-xs">
          <div className="font-medium text-foreground">Demo User</div>
          <div className="text-muted-foreground">Free Tier</div>
        </div>
      </div>
    </div>
  );
}
