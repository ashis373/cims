import { useState, useEffect } from "react";
import { 
  Bell, Check, MessageSquare, FileText, CalendarCheck, AlertTriangle, 
  ChevronRight, RefreshCw, Filter, Search, Eye, MoreVertical, AlertCircle, Calendar,
  ShieldAlert, BadgeInfo, Clock, UserPlus, CheckCircle, PartyPopper
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { API_BASE_URL } from "@/config/api";
import { toast } from "sonner";
import { getAuthHeaders } from "@/services/candidate-api";

interface Alert {
  id: number;
  type: string;
  title: string;
  candidate: string;
  time: string;
  timeRaw: string;
  unread: boolean;
  priority?: "High" | "Medium" | "Low";
}

export default function Notifications() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [activeTab, setActiveTab] = useState("All Alerts");
  const [sortBy, setSortBy] = useState("Newest First");

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/notifications/notifications.php`, {
          credentials: 'include',
          headers: getAuthHeaders(false)
        });
        const data = await res.json();
        if (!res.ok && data.message) {
          toast.error(data.message);
        } else if (Array.isArray(data)) {
          const lastRead = localStorage.getItem('cims_last_alerts_read');
          const lastReadTime = lastRead ? new Date(lastRead).getTime() : 0;
          
          const hydratedData = data.map((d: any) => {
            const isUnread = new Date(d.timeRaw).getTime() > lastReadTime;
            return {
              ...d,
              unread: isUnread
            };
          });
          setAlerts(hydratedData);
        }
      } catch (err) {
        console.error("Failed to load notifications", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAlerts();
  }, []);

  const markAllAsRead = () => {
    localStorage.setItem('cims_last_alerts_read', new Date().toISOString());
    setAlerts(alerts.map(a => ({ ...a, unread: false })));
    window.dispatchEvent(new Event('ALERTS_READ'));
  };

  const getIconConfig = (type: string) => {
    switch (type) {
      // Critical
      case "duplicate": return { icon: AlertTriangle, bg: "bg-red-50 text-red-600", border: "border-red-100" };
      case "email_failed": return { icon: AlertCircle, bg: "bg-red-50 text-red-600", border: "border-red-100" };
      case "blacklisted": return { icon: ShieldAlert, bg: "bg-slate-800 text-white", border: "border-slate-900" };
      // Action Required
      case "interview_feedback": return { icon: MessageSquare, bg: "bg-orange-50 text-orange-500", border: "border-orange-100" };
      case "offer_pending": return { icon: FileText, bg: "bg-orange-50 text-orange-500", border: "border-orange-100" };
      case "missing_info": return { icon: BadgeInfo, bg: "bg-orange-50 text-orange-500", border: "border-orange-100" };
      // Attention
      case "stuck_stage": return { icon: Clock, bg: "bg-amber-50 text-amber-500", border: "border-amber-100" };
      case "joining": return { icon: CalendarCheck, bg: "bg-amber-50 text-amber-500", border: "border-amber-100" };
      // Information
      case "new_candidate": return { icon: UserPlus, bg: "bg-blue-50 text-blue-500", border: "border-blue-100" };
      // Success
      case "offer_accepted": return { icon: CheckCircle, bg: "bg-emerald-50 text-emerald-500", border: "border-emerald-100" };
      case "joined": return { icon: PartyPopper, bg: "bg-emerald-50 text-emerald-500", border: "border-emerald-100" };
      default: return { icon: Bell, bg: "bg-slate-50 text-slate-500", border: "border-slate-100" };
    }
  };

  const getPriorityBadge = (priority?: string) => {
    switch (priority) {
      case "Critical": return <Badge className="bg-red-600 hover:bg-red-700 text-white border-transparent px-2.5 py-0.5 rounded-full font-bold flex gap-1 items-center shadow-sm"><AlertCircle className="w-3.5 h-3.5"/> Critical</Badge>;
      case "High": return <Badge className="bg-red-50 hover:bg-red-50 text-red-600 border-red-100 px-2.5 py-0.5 rounded-full font-bold flex gap-1 items-center shadow-sm"><AlertCircle className="w-3.5 h-3.5"/> High</Badge>;
      case "Medium": return <Badge className="bg-amber-50 hover:bg-amber-50 text-amber-600 border-amber-100 px-2.5 py-0.5 rounded-full font-bold flex gap-1 items-center shadow-sm"><AlertCircle className="w-3.5 h-3.5"/> Medium</Badge>;
      case "Low": return <Badge className="bg-emerald-50 hover:bg-emerald-50 text-emerald-600 border-emerald-100 px-2.5 py-0.5 rounded-full font-bold flex gap-1 items-center shadow-sm"><CheckCircle className="w-3.5 h-3.5"/> Low</Badge>;
      default: return null;
    }
  };

  const totalAlerts = alerts.length;
  const unreadAlerts = alerts.filter(a => a.unread).length;
  const criticalAlerts = alerts.filter(a => a.priority === 'Critical').length;
  const todaysAlerts = alerts.filter(a => a.time === "Just Now" || a.time.includes("minute") || a.time.includes("hour")).length;
  const mentionsAlerts = 0;

  const filteredAlerts = alerts.filter(a => {
    if (activeTab === "Unread" && !a.unread) return false;
    if (activeTab === "Critical" && a.priority !== "Critical") return false;
    if (activeTab === "Mentions") return false; 
    
    return true;
  }).sort((a, b) => {
    if (sortBy === "Newest First") {
      return new Date(b.timeRaw).getTime() - new Date(a.timeRaw).getTime();
    } else {
      return new Date(a.timeRaw).getTime() - new Date(b.timeRaw).getTime();
    }
  });

  const totalPages = Math.ceil(filteredAlerts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentAlerts = filteredAlerts.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="flex flex-col gap-6 w-full pb-10 bg-[#FAFAFB]">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 relative overflow-hidden rounded-[24px] bg-gradient-to-r from-[#4A3AFF] to-[#8C3AFF] shadow-lg p-8 sm:py-10 sm:px-12 text-white">
        <div className="relative z-10 flex items-center gap-6">
          <div className="relative">
            <span className="text-7xl drop-shadow-2xl inline-block origin-bottom hover:animate-bounce cursor-default select-none">🔔</span>
            {unreadAlerts > 0 && (
              <div className="absolute top-0 right-0 -mt-1 mr-1 bg-[#FF3B30] text-white text-[12px] font-black px-2 py-0.5 rounded-full border-2 border-[#8C3AFF] shadow-md z-20">
                {unreadAlerts}
              </div>
            )}
          </div>
          <div className="flex flex-col justify-center">
            <h1 className="text-[28px] font-bold tracking-tight mb-1">Alerts Center</h1>
            <p className="text-white/80 text-[14px] font-medium">
              Stay updated with important activities across your recruitment pipeline.
            </p>
          </div>
        </div>
        <div className="relative z-10">
          <Button
            onClick={markAllAsRead}
            variant="outline"
            className="h-10 px-5 rounded-xl bg-transparent border border-white/30 text-white hover:bg-white/10 hover:text-white font-bold transition-all"
          >
            <Check className="mr-2 h-4 w-4" /> Mark all as read
          </Button>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        {/* Total Alerts */}
        <Card className="p-6 rounded-[24px] bg-white border border-slate-100 shadow-[0_2px_15px_-5px_rgba(0,0,0,0.03)] flex items-center gap-5">
          <div className="h-14 w-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-500 border border-indigo-50">
            <MessageSquare className="h-6 w-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-slate-500 text-[12px] font-bold">Total Alerts</span>
            <span className="text-[28px] font-black text-slate-900 leading-tight">{totalAlerts}</span>
            <span className="text-slate-400 text-[11px] font-medium mt-0.5">All time alerts</span>
          </div>
        </Card>
        {/* Unread Alerts */}
        <Card className="p-6 rounded-[24px] bg-white border border-slate-100 shadow-[0_2px_15px_-5px_rgba(0,0,0,0.03)] flex items-center gap-5">
          <div className="h-14 w-14 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500 border border-amber-50">
            <Bell className="h-6 w-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-slate-500 text-[12px] font-bold">Unread Alerts</span>
            <span className="text-[28px] font-black text-slate-900 leading-tight">{unreadAlerts}</span>
            <span className="text-slate-400 text-[11px] font-medium mt-0.5">Need your attention</span>
          </div>
        </Card>
        {/* Critical Alerts */}
        <Card className="p-6 rounded-[24px] bg-white border border-slate-100 shadow-[0_2px_15px_-5px_rgba(0,0,0,0.03)] flex items-center gap-5">
          <div className="h-14 w-14 rounded-2xl bg-red-50 flex items-center justify-center text-red-500 border border-red-50">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-slate-500 text-[12px] font-bold">Critical Alerts</span>
            <span className="text-[28px] font-black text-slate-900 leading-tight">{criticalAlerts}</span>
            <span className="text-slate-400 text-[11px] font-medium mt-0.5">High priority</span>
          </div>
        </Card>
        {/* Today's Alerts */}
        <Card className="p-6 rounded-[24px] bg-white border border-slate-100 shadow-[0_2px_15px_-5px_rgba(0,0,0,0.03)] flex items-center gap-5">
          <div className="h-14 w-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-500 border border-emerald-50">
            <CalendarCheck className="h-6 w-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-slate-500 text-[12px] font-bold">Today's Alerts</span>
            <span className="text-[28px] font-black text-slate-900 leading-tight">{todaysAlerts}</span>
            <span className="text-slate-400 text-[11px] font-medium mt-0.5">Since midnight</span>
          </div>
        </Card>
      </div>

      {/* Tabs and Filters */}
      <div className="flex flex-col lg:flex-row justify-between items-center gap-4 mt-2 bg-white p-3 rounded-2xl shadow-[0_2px_15px_-5px_rgba(0,0,0,0.03)] border border-slate-100 px-6">
        <div className="flex items-center gap-8 w-full lg:w-auto h-full">
          <div onClick={() => {setActiveTab("All Alerts"); setCurrentPage(1);}} className={cn("flex items-center gap-2 py-3 border-b-2 cursor-pointer transition-colors -mb-3", activeTab === "All Alerts" ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-800")}>
            <span className={cn("text-[13px]", activeTab === "All Alerts" ? "font-extrabold" : "font-bold")}>All Alerts</span>
            <Badge className={cn("border-transparent rounded-full px-2 text-[10px]", activeTab === "All Alerts" ? "bg-indigo-50 text-indigo-600 hover:bg-indigo-50" : "bg-slate-100 text-slate-600 hover:bg-slate-100")}>{totalAlerts}</Badge>
          </div>
          <div onClick={() => {setActiveTab("Unread"); setCurrentPage(1);}} className={cn("flex items-center gap-2 py-3 border-b-2 cursor-pointer transition-colors -mb-3", activeTab === "Unread" ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-800")}>
            <span className={cn("text-[13px]", activeTab === "Unread" ? "font-extrabold" : "font-bold")}>Unread</span>
            {unreadAlerts > 0 && <Badge className={cn("border-transparent rounded-full px-2 text-[10px]", activeTab === "Unread" ? "bg-rose-50 text-rose-500 hover:bg-rose-50" : "bg-rose-50 text-rose-500 hover:bg-rose-50")}>{unreadAlerts}</Badge>}
          </div>
          <div onClick={() => {setActiveTab("Critical"); setCurrentPage(1);}} className={cn("flex items-center gap-2 py-3 border-b-2 cursor-pointer transition-colors -mb-3", activeTab === "Critical" ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-800")}>
            <span className={cn("text-[13px]", activeTab === "Critical" ? "font-extrabold" : "font-bold")}>Critical</span>
            {criticalAlerts > 0 && <Badge className={cn("border-transparent rounded-full px-2 text-[10px]", activeTab === "Critical" ? "bg-red-50 text-red-500 hover:bg-red-50" : "bg-red-50 text-red-500 hover:bg-red-50")}>{criticalAlerts}</Badge>}
          </div>
          <div onClick={() => {setActiveTab("Mentions"); setCurrentPage(1);}} className={cn("flex items-center gap-2 py-3 border-b-2 cursor-pointer transition-colors -mb-3", activeTab === "Mentions" ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-800")}>
            <span className={cn("text-[13px]", activeTab === "Mentions" ? "font-extrabold" : "font-bold")}>Mentions</span>
            {mentionsAlerts > 0 && <Badge className={cn("border-transparent rounded-full px-2 text-[10px]", activeTab === "Mentions" ? "bg-slate-100 text-slate-600 hover:bg-slate-100" : "bg-slate-100 text-slate-600 hover:bg-slate-100")}>{mentionsAlerts}</Badge>}
          </div>
        </div>

        <div className="flex items-center gap-3 w-full lg:w-auto mt-4 lg:mt-0">
          <Button 
            onClick={() => setCurrentPage(1)}
            variant="outline" size="icon" className="h-9 w-9 rounded-xl border-slate-200 text-slate-500">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <div className="relative">
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="h-9 appearance-none bg-white border border-slate-200 rounded-xl text-slate-600 font-bold text-[12px] pl-3 pr-8 outline-none cursor-pointer">
              <option>Newest First</option>
              <option>Oldest First</option>
            </select>
            <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 rotate-90 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Alerts List */}
      <Card className="bg-white border border-slate-100 shadow-[0_2px_15px_-5px_rgba(0,0,0,0.03)] rounded-[24px] overflow-hidden">
        <div className="flex flex-col">
          {isLoading ? (
            <div className="p-12 text-center flex flex-col items-center justify-center">
              <div className="h-8 w-8 rounded-full border-4 border-slate-200 border-t-indigo-500 animate-spin mb-4" />
              <p className="text-slate-500 text-[14px] font-bold">Loading your alerts...</p>
            </div>
          ) : filteredAlerts.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center justify-center">
              <Bell className="h-12 w-12 text-slate-200 mb-4" />
              <h2 className="text-lg font-bold text-slate-900">No alerts found!</h2>
              <p className="text-slate-500 text-[14px] mt-1">Try adjusting your filters.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100/60">
              {currentAlerts.map((alert) => {
                const conf = getIconConfig(alert.type);
                const isRedBg = alert.priority === 'Critical' || (alert.priority === 'High' && alert.type === 'duplicate');
                return (
                  <div
                    key={alert.id}
                    className={cn(
                      "flex items-center justify-between px-6 py-4 transition-colors group relative",
                      isRedBg ? "bg-red-50/40 hover:bg-red-50/60" : "bg-white hover:bg-slate-50/70"
                    )}
                  >
                    <div className="flex items-center gap-5">
                      {/* Icon */}
                      <div className="relative shrink-0">
                        <div className={cn("h-11 w-11 rounded-xl flex items-center justify-center border shadow-sm", conf.bg, conf.border)}>
                          <conf.icon className="h-5 w-5" />
                        </div>
                      </div>
                      
                      {/* Text details */}
                      <div className="flex flex-col justify-center">
                        <div className="flex items-center gap-2 mb-1.5">
                          {alert.unread && <div className="h-2 w-2 rounded-full bg-indigo-600 shrink-0" />}
                          <span className={cn("text-[14px] text-slate-900", alert.unread ? "font-black" : "font-bold opacity-90")}>{alert.title}</span>
                        </div>
                        <div className="text-[12px] font-medium text-slate-500 flex items-center gap-2 ml-[1px]">
                          <span className="text-slate-700">{alert.candidate}</span>
                          <span className="text-slate-300">•</span>
                          <span>{alert.time}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 shrink-0">
                      {/* Priority Badge */}
                      <div className="hidden md:flex w-24 justify-end">
                        {getPriorityBadge(alert.priority)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Card>

      {/* Pagination Footer */}
      {filteredAlerts.length > 0 && (
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-1 pb-4 px-2">
          <div className="text-[13px] font-medium text-slate-500">
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredAlerts.length)} of {filteredAlerts.length} alerts
          </div>
        
          <div className="flex items-center gap-1">
            <Button 
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              variant="outline" size="icon" className="h-8 w-8 rounded-xl border-slate-200 text-slate-400 hover:text-slate-600 bg-white disabled:opacity-50"><ChevronRight className="h-4 w-4 rotate-180" /></Button>
            
            {Array.from({ length: totalPages }).map((_, i) => (
              <Button 
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                variant={currentPage === i + 1 ? "default" : "outline"} 
                size="icon" 
                className={cn(
                  "h-8 w-8 rounded-xl font-bold text-[13px]",
                  currentPage === i + 1 
                    ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm" 
                    : "border-transparent text-slate-600 hover:bg-slate-100 hover:border-slate-200 bg-transparent"
                )}>
                {i + 1}
              </Button>
            ))}

            <Button 
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              variant="outline" size="icon" className="h-8 w-8 rounded-xl border-slate-200 text-slate-400 hover:text-slate-600 bg-white disabled:opacity-50"><ChevronRight className="h-4 w-4" /></Button>
          </div>

          <div className="flex items-center gap-2 text-[13px] font-medium text-slate-500">
            Show 
            <Button variant="outline" className="h-8 px-3 rounded-xl border-slate-200 text-slate-700 font-bold text-[13px] bg-white cursor-default">
              10 <ChevronRight className="h-3.5 w-3.5 ml-1.5 rotate-90 text-slate-400" />
            </Button>
            per page
          </div>
        </div>
      )}
    </div>
  );
}
