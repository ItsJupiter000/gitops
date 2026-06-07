"use client";

import { useAppStore } from "@/lib/store";
import { Bell, Plus, Trash2, TrendingUp, TrendingDown, Clock } from "lucide-react";
import { format } from "date-fns";

export default function AlertsPanel() {
  const { alerts, toggleAlertActive, removeAlert } = useAppStore();

  return (
    <div className="p-8 w-full max-w-4xl mx-auto h-full overflow-y-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-1 text-foreground">Alerts Hub</h2>
          <p className="text-muted-foreground">Manage your price and event notifications.</p>
        </div>
        <button className="px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Alert
        </button>
      </div>

      <div className="space-y-4">
        {alerts.length === 0 ? (
          <div className="glass-panel p-12 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-secondary/50 rounded-full flex items-center justify-center mb-4">
              <Bell className="w-8 h-8 text-muted-foreground opacity-50" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">No active alerts</h3>
            <p className="text-muted-foreground max-w-md">You haven't set any alerts yet. Create an alert to get notified when a stock reaches your target price.</p>
          </div>
        ) : (
          alerts.map(alert => (
            <div key={alert.id} className={`glass-panel p-5 flex items-center justify-between transition-all ${alert.active ? 'border-l-4 border-l-primary' : 'opacity-70 border-l-4 border-l-transparent'}`}>
              <div className="flex items-center gap-5">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${alert.condition === 'above' ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'}`}>
                  {alert.condition === 'above' ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
                </div>
                
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-lg text-foreground">{alert.symbol}</span>
                    <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded">Price Alert</span>
                  </div>
                  <div className="text-sm">
                    Notify me when price crosses <strong className={alert.condition === 'above' ? 'text-primary' : 'text-destructive'}>{alert.condition} ₹{alert.threshold.toLocaleString()}</strong>
                  </div>
                  <div className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Created on {format(new Date(alert.createdAt), 'MMM dd, yyyy')}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={alert.active} onChange={() => toggleAlertActive(alert.id)} />
                  <div className="w-11 h-6 bg-secondary peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
                
                <button 
                  onClick={() => removeAlert(alert.id)}
                  className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                  title="Delete Alert"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
