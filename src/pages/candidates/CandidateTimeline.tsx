import { useState, useEffect, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Activity, FileText, Mail, Users, Trash2, Clock, CheckCircle2, Search, Filter } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export default function CandidateTimeline() {
  const [timeline, setTimeline] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");

  useEffect(() => {
    fetch("http://localhost/full-cims/api/timeline.php")
      .then((res) => res.json())
      .then((data) => {
        setTimeline(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch timeline:", err);
        setLoading(false);
      });
  }, []);

  const formatTime = (d: string) => {
    if (!d) return "-";
    return new Date(d).toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit' });
  };

  const getIcon = (type: string, action: string) => {
    if (type === 'Application') return <FileText className="h-4 w-4" />;
    if (type === 'Interview') return <Users className="h-4 w-4" />;
    if (type === 'Note') return <Activity className="h-4 w-4" />;
    if (type === 'Alert' && action.includes('Blacklist')) return <Trash2 className="h-4 w-4" />;
    if (type === 'Alert') return <CheckCircle2 className="h-4 w-4" />;
    if (action.includes('Offer')) return <Mail className="h-4 w-4" />;
    return <Clock className="h-4 w-4" />;
  };

  const getColor = (type: string, action: string) => {
    if (type === 'Application') return "bg-blue-100 text-blue-600 border-blue-200";
    if (type === 'Interview') return "bg-purple-100 text-purple-600 border-purple-200";
    if (type === 'Note') return "bg-amber-100 text-amber-600 border-amber-200";
    if (type === 'Alert' && action.includes('Blacklist')) return "bg-red-100 text-red-600 border-red-200";
    if (type === 'Alert') return "bg-rose-100 text-rose-600 border-rose-200";
    if (action.includes('Offer')) return "bg-emerald-100 text-emerald-600 border-emerald-200";
    return "bg-slate-100 text-slate-500 border-slate-200";
  };

  // Filter Logic
  const filteredTimeline = useMemo(() => {
    return timeline.filter(item => {
      const matchSearch = item.candidateName?.toLowerCase().includes(search.toLowerCase()) || 
                          item.description?.toLowerCase().includes(search.toLowerCase());
      const matchType = typeFilter === "All" || item.type === typeFilter;
      return matchSearch && matchType;
    });
  }, [timeline, search, typeFilter]);

  // Group by Date
  const groupedTimeline = useMemo(() => {
    const groups: Record<string, any[]> = {};
    filteredTimeline.forEach(item => {
      const dateStr = new Date(item.timestamp).toLocaleDateString("en-GB", { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
      if (!groups[dateStr]) groups[dateStr] = [];
      groups[dateStr].push(item);
    });
    return groups;
  }, [filteredTimeline]);

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Global Activity Feed</h1>
          <p className="text-slate-500 text-[13px] font-medium mt-1">
            Real-time timeline of candidate interactions and system events.
          </p>
        </div>
        
        {/* Filters */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Search candidate or note..." 
              className="pl-9 h-9 w-[250px] bg-white text-[13px] rounded-xl border-slate-200"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="relative">
            <select 
              className="h-9 pl-3 pr-8 bg-white border border-slate-200 rounded-xl text-[13px] font-semibold text-slate-700 outline-none appearance-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="All">All Events</option>
              <option value="Application">Applications</option>
              <option value="Interview">Interviews</option>
              <option value="Note">Notes</option>
              <option value="Alert">Alerts & Rejections</option>
              <option value="History">System History</option>
            </select>
            <Filter className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      <Card className="p-0 overflow-hidden bg-white border border-slate-200 shadow-sm rounded-2xl">
        {loading ? (
          <div className="p-8 space-y-8">
            <Skeleton className="h-24 w-full rounded-2xl" />
            <Skeleton className="h-24 w-full rounded-2xl" />
            <Skeleton className="h-24 w-full rounded-2xl" />
          </div>
        ) : Object.keys(groupedTimeline).length === 0 ? (
          <div className="text-center py-16">
            <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
              <Activity className="h-5 w-5 text-slate-400" />
            </div>
            <h3 className="text-[14px] font-bold text-slate-900">No activity found</h3>
            <p className="text-[13px] text-slate-500 mt-1">Try adjusting your filters or search query.</p>
          </div>
        ) : (
          <div className="p-6 sm:p-8">
            {Object.keys(groupedTimeline).map((date, idx) => (
              <div key={idx} className="mb-8 last:mb-0">
                {/* Date Header */}
                <div className="flex items-center gap-4 mb-5">
                  <h3 className="text-[13px] font-bold text-slate-900 uppercase tracking-wider">{date}</h3>
                  <div className="flex-1 h-px bg-slate-100"></div>
                </div>

                <div className="relative pl-6 sm:pl-8 before:absolute before:inset-y-0 before:left-[19px] sm:before:left-[27px] before:w-[2px] before:bg-slate-100 space-y-6">
                  {groupedTimeline[date].map((item, i) => (
                    <div key={i} className="relative group">
                      {/* Icon */}
                      <div className={cn(
                        "absolute -left-6 sm:-left-8 top-1 flex items-center justify-center w-8 h-8 rounded-full border-4 border-white shadow-sm z-10",
                        getColor(item.type, item.action)
                      )}>
                        {getIcon(item.type, item.action)}
                      </div>

                      {/* Content Card */}
                      <div className="bg-white border border-slate-200 rounded-xl p-4 transition-all hover:shadow-md hover:border-slate-300">
                        <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[13px] font-bold text-slate-900">
                              {item.candidateName}
                            </span>
                            <span className="text-slate-400 text-[12px] font-medium">
                              {item.action}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-[10px] bg-slate-100 text-slate-600 hover:bg-slate-200 border-transparent font-bold">
                              {item.type}
                            </Badge>
                            <span className="text-[11px] font-bold text-slate-400">
                              {formatTime(item.timestamp)}
                            </span>
                          </div>
                        </div>
                        
                        {item.description && (
                          <div className="text-[13px] text-slate-600 bg-slate-50/50 p-3 rounded-lg border border-slate-100 leading-relaxed mt-2 mb-3">
                            {item.description}
                          </div>
                        )}

                        <div className="flex items-center gap-1.5 mt-3">
                          <div className="h-5 w-5 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-[9px] font-bold">
                            {item.user.charAt(0)}
                          </div>
                          <span className="text-[11px] font-bold text-slate-500">{item.user}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
