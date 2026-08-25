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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative overflow-hidden rounded-[28px] bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 shadow-lg border border-indigo-900/50 p-8 sm:p-10 text-white">
        <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none mix-blend-overlay"></div>
        <div className="relative z-10 flex items-center gap-6">
          <div className="flex h-[72px] w-[72px] items-center justify-center rounded-[20px] bg-white/10 border border-white/20 shadow-[0_0_20px_rgba(255,255,255,0.1)] backdrop-blur-md shrink-0">
            <Bell className="h-8 w-8 text-indigo-100" />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-2">Alerts Center</h1>
            <p className="text-indigo-100/80 text-[14px] sm:text-[15px] font-medium max-w-lg leading-relaxed">
              {unreadCount > 0 ? (
                <span className="text-white font-bold">{unreadCount} unread alerts</span>
              ) : (
                "All caught up!"
              )}{" "}
              across your pipeline
            </p>
          </div>
        </div>
        <div className="relative z-10 shrink-0 mt-2 sm:mt-0">
          {unreadCount > 0 && (
            <Button
              onClick={markAllAsRead}
              className="h-12 px-6 rounded-2xl bg-white text-indigo-900 hover:bg-slate-50 font-bold shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] transition-all"
            >
              <Check className="mr-2 h-5 w-5 text-indigo-600" /> Mark all as read
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
                "flex items-center justify-between p-5 hover:bg-slate-50 transition-colors group border-b border-slate-100 last:border-0",
                alert.unread ? "bg-indigo-50/30" : "opacity-80"
              )}
            >
              <div className="flex items-center gap-5">
                <div className="relative shrink-0">
                  {getIcon(alert.type)}
                  {alert.unread && (
                    <div className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-indigo-500 ring-[3px] ring-white shadow-sm" />
                  )}
                </div>
                <div>
                  <div className="text-[15px] font-bold text-slate-900 group-hover:text-indigo-600 transition-colors cursor-pointer mb-0.5">
                    {alert.title}
                  </div>
                  <div className="text-[13px] font-medium text-slate-500 flex items-center gap-2">
                    <span className="font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">{alert.candidate}</span>
                    <span className="text-slate-300">•</span>
                    <span>{alert.time}</span>
                  </div>
                </div>
              </div>

              <Button
                variant="ghost"
                className="h-10 px-5 rounded-xl font-bold text-[13px] text-indigo-600 hover:bg-indigo-50 opacity-0 group-hover:opacity-100 transition-all border border-transparent hover:border-indigo-100 shrink-0"
              >
                View Details <ChevronRight className="ml-1.5 h-4 w-4" />
              </Button>
            </div>
          ))}

          {isLoading && (
            <div className="p-12 text-center flex flex-col items-center justify-center">
              <div className="h-8 w-8 rounded-full border-4 border-slate-200 border-t-indigo-500 animate-spin mb-4" />
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
