import { useState, useEffect } from "react";
import { Bell, Check, MessageSquare, FileText, CalendarCheck, AlertTriangle, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { API_BASE_URL } from "@/config/api";

interface Alert {
  id: number;
  type: string;
  title: string;
  candidate: string;
  time: string;
  unread: boolean;
}

export default function Notifications() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/notifications/notifications.php`);
        const data = await res.json();
        setAlerts(data);
      } catch (err) {
        console.error("Failed to load notifications", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAlerts();
  }, []);

  const markAllAsRead = () => {
    setAlerts(alerts.map(a => ({ ...a, unread: false })));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "interview":
        return <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600"><MessageSquare className="h-5 w-5" /></div>;
      case "offer":
        return <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600"><FileText className="h-5 w-5" /></div>;
      case "joining":
        return <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600"><CalendarCheck className="h-5 w-5" /></div>;
      case "duplicate":
        return <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600"><AlertTriangle className="h-5 w-5" /></div>;
      default:
        return <div className="p-2.5 rounded-xl bg-slate-50 text-slate-600"><Bell className="h-5 w-5" /></div>;
    }
  };

  const unreadCount = alerts.filter(a => a.unread).length;

  return (
    <div className="flex flex-col gap-6 w-full pb-10">
      <div className="relative overflow-hidden rounded-3xl bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100 p-8 sm:p-10">
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-gradient-to-br from-rose-100 to-orange-50 rounded-full blur-3xl opacity-50 pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl shadow-sm border bg-rose-50 border-rose-100 text-rose-600">
              <Bell className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                Alerts Center
              </h1>
              <p className="text-slate-500 text-[13px] sm:text-[14px] font-medium mt-1.5 max-w-lg leading-relaxed">
                {unreadCount > 0 ? (
                  <span className="text-rose-600 font-bold">{unreadCount} unread alerts</span>
                ) : (
                  "All caught up!"
                )}{" "}
                across your pipeline
              </p>
            </div>
          </div>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              onClick={markAllAsRead}
              className="h-10 px-5 rounded-xl font-bold text-[13px] border-slate-200 text-slate-700 bg-white"
            >
              <Check className="mr-2 h-4 w-4 text-emerald-500" /> Mark all as read
            </Button>
          )}
        </div>
      </div>

      <Card className="bg-white border-border/50 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] rounded-3xl overflow-hidden flex flex-col">
        <div className="divide-y divide-slate-100">
          {alerts.map((alert) => (
            <div 
              key={alert.id} 
              className={cn(
                "flex items-center justify-between p-5 hover:bg-slate-50 transition-colors group",
                alert.unread ? "bg-slate-50/50" : "opacity-75"
              )}
            >
              <div className="flex items-center gap-5">
                <div className="relative">
                  {getIcon(alert.type)}
                  {alert.unread && (
                    <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-rose-500 ring-2 ring-white" />
                  )}
                </div>
                <div>
                  <div className="text-[14px] font-bold text-slate-900 group-hover:text-blue-600 transition-colors cursor-pointer">
                    {alert.title}
                  </div>
                  <div className="text-[12px] font-medium text-slate-500 mt-1 flex items-center gap-2">
                    <span className="font-bold text-slate-700">{alert.candidate}</span>
                    <span>·</span>
                    <span>{alert.time}</span>
                  </div>
                </div>
              </div>
              
              <Button
                variant="ghost"
                className="h-9 px-4 rounded-xl font-bold text-[12px] text-blue-600 hover:bg-blue-50 opacity-0 group-hover:opacity-100 transition-all"
              >
                View <ChevronRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            </div>
          ))}

          {isLoading && (
            <div className="p-12 text-center flex flex-col items-center justify-center">
              <div className="h-8 w-8 rounded-full border-4 border-slate-200 border-t-rose-500 animate-spin mb-4" />
              <p className="text-slate-500 text-sm font-bold">Loading your alerts...</p>
            </div>
          )}

          {!isLoading && alerts.length === 0 && (
            <div className="p-12 text-center flex flex-col items-center justify-center">
              <Bell className="h-12 w-12 text-slate-200 mb-4" />
              <h2 className="text-lg font-bold text-slate-900">You're all caught up!</h2>
              <p className="text-slate-500 text-sm mt-1">Check back later for new alerts.</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
