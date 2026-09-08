import { useState, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import {
  Search, ChevronDown, ChevronLeft, ChevronRight, Download,
  MoreVertical, Activity, FileText, Users, Briefcase,
  CheckCircle, XCircle, AlertTriangle, Monitor, Linkedin,
  Globe, UserPlus, Phone, X, Award, Building, User, ArrowDown
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { API_BASE_URL } from "@/config/api";
import { toast } from "sonner";
import { getAuthHeaders } from "@/services/candidate-api";

export default function CandidateTimeline() {
  const [timeline, setTimeline] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("All Activities");
  const [dateRange, setDateRange] = useState("All Time");
  const [activityType, setActivityType] = useState("All Types");
  const [candidateStage, setCandidateStage] = useState("All Stages");
  const [source, setSource] = useState("All Sources");

  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE_URL}/candidates/timeline.php`, { credentials: 'include', headers: getAuthHeaders(false) }).then(async res => {
        const json = await res.json();
        if (!res.ok && json.message) toast.error(json.message);
        return json;
      }),
      fetch(`${API_BASE_URL}/dashboard/stats.php`, { credentials: 'include', headers: getAuthHeaders(false) }).then(async res => {
        const json = await res.json();
        if (!res.ok && json.message) toast.error(json.message);
        return json;
      })
    ])
      .then(([timelineData, statsData]) => {
        const sortedTimeline = (timelineData || []).sort((a: any, b: any) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        setTimeline(sortedTimeline);
        setStats(statsData);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch data:", err);
        setLoading(false);
      });
  }, []);

  const formatTime = (d: string) => {
    if (!d) return "-";
    return new Date(d).toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit' });
  };

  const getBadgeStyle = (type: string, action: string, description: string = '') => {
    const text = (action + ' ' + description).toLowerCase();
    if (text.includes('cancelled') || text.includes('reject')) return "bg-red-50 text-red-600";
    if (text.includes('join')) return "bg-blue-50 text-blue-600";
    if (text.includes('blacklist')) return "bg-slate-100 text-slate-600";
    if (text.includes('offer')) return "bg-orange-50 text-orange-600";
    if (type === 'Feedback') return "bg-emerald-50 text-emerald-600";
    if (type === 'Application') return "bg-emerald-50 text-emerald-600";
    if (type === 'Interview') return "bg-purple-50 text-purple-600";
    return "bg-slate-100 text-slate-600";
  };

  const getBadgeLabel = (type: string, action: string, description: string = '') => {
    const text = (action + ' ' + description).toLowerCase();
    if (text.includes('cancelled')) return "Cancelled";
    if (text.includes('reject')) return "Rejection";
    if (text.includes('join')) return "Joining";
    if (text.includes('blacklist')) return "Blacklist";
    if (text.includes('offer')) return "Offer";
    if (type === 'Application') return "Application";
    if (type === 'Interview') return "Interview";
    if (type === 'Feedback') return "Feedback";
    return type;
  };

  const getDotColor = (type: string, action: string, description: string = '') => {
    const text = (action + ' ' + description).toLowerCase();
    if (text.includes('cancelled') || text.includes('reject')) return "bg-red-500 border-red-200";
    if (text.includes('join')) return "bg-blue-500 border-blue-200";
    if (text.includes('blacklist')) return "bg-slate-600 border-slate-300";
    if (text.includes('offer')) return "bg-orange-500 border-orange-200";
    if (type === 'Application') return "bg-emerald-500 border-emerald-200";
    if (type === 'Interview') return "bg-purple-500 border-purple-200";
    return "bg-blue-500 border-blue-200";
  };

  const getActivityIcon = (type: string, action: string, description: string = '') => {
    const text = (action + ' ' + description).toLowerCase();
    if (text.includes('reject') || text.includes('cancelled')) return <X className="w-4 h-4 text-red-500" />;
    if (text.includes('join')) return <Building className="w-4 h-4 text-blue-500" />;
    if (text.includes('blacklist')) return <AlertTriangle className="w-4 h-4 text-slate-600" />;
    if (text.includes('offer')) return <Award className="w-4 h-4 text-orange-500" />;
    if (type === 'Application') return <FileText className="w-4 h-4 text-emerald-500" />;
    if (type === 'Interview') return <Users className="w-4 h-4 text-purple-500" />;
    return <Activity className="w-4 h-4 text-blue-500" />;
  };

  // Filter Logic
  const filteredTimeline = useMemo(() => {
    return timeline.filter(item => {
      // Search
      const matchSearch = item.user?.toLowerCase().includes(search.toLowerCase()) ||
        item.description?.toLowerCase().includes(search.toLowerCase()) ||
        item.candidateName?.toLowerCase().includes(search.toLowerCase()) ||
        item.action?.toLowerCase().includes(search.toLowerCase());
      if (!matchSearch) return false;

      // Tab Filtering
      const itemText = (item.action + ' ' + (item.description || '')).toLowerCase();
      if (activeTab === "Application History") {
        if (item.type !== 'Application') return false;
      } else if (activeTab === "Interview History") {
        if (!itemText.includes('interview')) return false;
      } else if (activeTab === "Offer History") {
        if (!itemText.includes('offer')) return false;
      } else if (activeTab === "Joining History") {
        if (!itemText.includes('join')) return false;
      } else if (activeTab === "Rejection History") {
        if (!itemText.includes('reject')) return false;
      } else if (activeTab === "Blacklist History") {
        if (!itemText.includes('blacklist')) return false;
      }

      // Activity Type
      if (activityType !== "All Types") {
        if (activityType === "Application" && item.type !== 'Application') return false;
        if (activityType === "Interview" && !itemText.includes('interview')) return false;
        if (activityType === "Offer" && !itemText.includes('offer')) return false;
        if (activityType === "History" && item.type !== 'History') return false;
        if (activityType === "Alert" && item.type !== 'Alert') return false;
        if (activityType === "Note" && item.type !== 'Note') return false;
      }

      // Date Range (simple mock filter for illustration)
      if (dateRange !== "All Time") {
        const itemDate = new Date(item.timestamp);
        const now = new Date();
        const diffDays = (now.getTime() - itemDate.getTime()) / (1000 * 3600 * 24);
        if (dateRange === "Last 7 Days" && diffDays > 7) return false;
        if (dateRange === "Last 30 Days" && diffDays > 30) return false;
      }

      return true;
    });
  }, [timeline, search, activeTab, dateRange, activityType, candidateStage, source]);

  // Pagination Logic
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [search, activeTab, dateRange, activityType, candidateStage, source]);

  const paginatedTimeline = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredTimeline.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredTimeline, currentPage]);

  const totalPages = Math.ceil(filteredTimeline.length / itemsPerPage);

  // Group by Date
  const groupedTimeline = useMemo(() => {
    const groups: Record<string, any[]> = {};
    
    const todayStr = new Date().toDateString();
    const yesterdayStr = new Date(Date.now() - 86400000).toDateString();

    paginatedTimeline.forEach(item => {
      const date = new Date(item.timestamp);
      const isToday = todayStr === date.toDateString();
      const isYesterday = yesterdayStr === date.toDateString();

      let prefix = "";
      if (isToday) prefix = "TODAY • ";
      else if (isYesterday) prefix = "YESTERDAY • ";

      const dateStr = prefix + date.toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase();

      if (!groups[dateStr]) groups[dateStr] = [];
      groups[dateStr].push(item);
    });
    return groups;
  }, [paginatedTimeline]);

  return (
    <div className="flex flex-col gap-6 w-full pb-10 bg-[#FAFAFA] min-h-screen">

      {/* Header Area */}
      <div className="flex flex-col gap-6">
        {/* Top Banner (Dark Teal / Cyan Gradient) */}
        <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-r from-[#000C22] via-[#0B2524] to-[#0D2823] shadow-lg border border-teal-900/40 p-8 sm:p-10 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="relative z-10 flex flex-col justify-center max-w-xl">
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-2 text-white">Global Activity Feed</h1>
            <p className="text-[#60C042] text-[14px] sm:text-[15px] font-medium leading-relaxed">
              Real-time updates, timeline events, and activities from all candidates across the system.
            </p>
          </div>
          <div className="relative z-10 flex items-center gap-6 self-stretch sm:self-auto justify-between sm:justify-end">
            <div className="relative w-full sm:w-[280px]">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-teal-300/70" />
              <Input
                placeholder="Search activity feed..."
                className="pl-10 h-11 w-full bg-white/10 text-[13px] text-white placeholder:text-teal-200/60 rounded-xl border border-white/20 focus-visible:bg-white/15 focus-visible:ring-1 focus-visible:ring-teal-400 transition-all shadow-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="shrink-0 group cursor-pointer">
              <span className="text-7xl drop-shadow-2xl inline-block origin-bottom hover:animate-bounce cursor-default select-none">
                ⚡
              </span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-6 border-b border-slate-200 overflow-x-auto pb-1">
          {["All Activities", "Application History", "Interview History", "Offer History", "Joining History", "Rejection History", "Blacklist History"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "pb-3 text-[13px] font-semibold transition-colors relative whitespace-nowrap",
                activeTab === tab ? "text-blue-600" : "text-slate-500 hover:text-slate-700"
              )}
            >
              {tab}
              {activeTab === tab && (
                <span className="absolute bottom-0 left-0 w-full h-[2px] bg-blue-600 rounded-t-full" />
              )}
            </button>
          ))}
        </div>
      </div>



      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { 
            label: "Total Activities", 
            value: timeline.length, 
            pct: 12, 
            icon: Activity, 
            cardBg: "bg-blue-50/40",
            border: "border-blue-200/70 hover:border-blue-400",
            iconBg: "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-blue-500/20",
            trendText: "text-blue-700 bg-white/80",
            trendLabel: "+12% this month"
          },
          { 
            label: "Applications", 
            value: stats?.total || 0, 
            pct: 18, 
            icon: FileText, 
            cardBg: "bg-emerald-50/40",
            border: "border-emerald-200/70 hover:border-emerald-400",
            iconBg: "bg-gradient-to-br from-[#42bc24] to-[#36961c] text-white shadow-emerald-500/20",
            trendText: "text-emerald-700 bg-white/80",
            trendLabel: "+18% this month"
          },
          { 
            label: "Interviews", 
            value: (stats?.scheduled || 0) + (stats?.selected || 0), 
            pct: 8, 
            icon: Users, 
            cardBg: "bg-purple-50/40",
            border: "border-purple-200/70 hover:border-purple-400",
            iconBg: "bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-purple-500/20",
            trendText: "text-purple-700 bg-white/80",
            trendLabel: "+8% this month"
          },
          { 
            label: "Offers", 
            value: (stats?.offersReleased || 0) + (stats?.offersAccepted || 0) + (stats?.offersDeclined || 0), 
            pct: 15, 
            icon: Award, 
            cardBg: "bg-amber-50/40",
            border: "border-amber-200/70 hover:border-amber-400",
            iconBg: "bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-amber-500/20",
            trendText: "text-amber-700 bg-white/80",
            trendLabel: "+15% this month"
          },
        ].map((stat, i) => (
          <Card
            key={i}
            className={cn(
              "relative overflow-hidden shadow-xs border rounded-xl flex-1 min-w-[160px] flex flex-col p-3.5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-sm group",
              stat.cardBg,
              stat.border
            )}
          >
            <div className="absolute top-0 right-0 -mt-3 -mr-3 w-20 h-20 bg-gradient-to-br from-white to-transparent rounded-full blur-xl pointer-events-none opacity-60" />
            
            <div className="flex items-start justify-between mb-1.5 relative z-10">
              <div className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider pr-1.5 leading-tight truncate">
                {stat.label}
              </div>
              <div className={cn("p-1.5 rounded-lg shrink-0 shadow-xs", stat.iconBg)}>
                <stat.icon className="w-3.5 h-3.5" />
              </div>
            </div>
            
            <div className="mt-auto relative z-10 pt-1">
              <div className="text-2xl font-black tracking-tight text-slate-900 leading-none mb-1.5">
                {stat.value}
              </div>
              <div className="flex items-center gap-1.5 text-[9.5px] font-bold text-slate-400">
                <span className={cn("inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded font-bold", stat.trendText)}>
                  {stat.trendLabel}
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Timeline Content */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm mt-2">
        <div className="px-6 py-5 border-b border-slate-200">
          <h2 className="text-[15px] font-bold text-slate-900">Activity Feed <span className="text-slate-500 font-medium text-[13px] ml-1">({timeline.length} activities)</span></h2>
        </div>

        {/* Table Headers */}
        <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-slate-200 text-[11px] font-bold text-slate-500 tracking-wider">
          <div className="col-span-1">TIME</div>
          <div className="col-span-3">CANDIDATE</div>
          <div className="col-span-3">ACTIVITY</div>
          <div className="col-span-2">STAGE</div>
          <div className="col-span-3">PERFORMED BY</div>
        </div>

        <div className="bg-transparent">
          {loading ? (
            <div className="space-y-4 p-6">
              <Skeleton className="h-16 w-full rounded-xl" />
              <Skeleton className="h-16 w-full rounded-xl" />
              <Skeleton className="h-16 w-full rounded-xl" />
            </div>
          ) : Object.keys(groupedTimeline).length === 0 ? (
            <div className="text-center py-16">
              <h3 className="text-[14px] font-bold text-slate-900">No activity found</h3>
              <p className="text-[13px] text-slate-500 mt-1">Try adjusting your filters or search query.</p>
            </div>
          ) : (
            <div className="pb-4">
              {Object.keys(groupedTimeline).map((date, idx) => (
                <div key={idx} className="mb-0">
                  {/* Date Header */}
                  <h3 className="text-[11px] font-bold text-slate-500 tracking-[0.05em] py-4 px-6 bg-[#F8FAFC] border-b border-slate-100">
                    {date}
                  </h3>

                  <div className="relative space-y-0">
                    <div className="absolute left-[38px] top-0 bottom-0 w-[2px] bg-slate-100"></div>

                    {groupedTimeline[date].map((item, i) => (
                      <div key={i} className="relative group flex items-center border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors px-6 py-4">

                        <div className="grid grid-cols-12 gap-4 w-full items-center">
                          {/* Time */}
                          <div className="col-span-1 flex items-center relative">
                            {/* Colored Dot Timeline */}
                            <div className={cn("absolute left-[9px] w-[12px] h-[12px] rounded-full border-2 z-10", getDotColor(item.type, item.action, item.description))}></div>
                            <span className="text-[13px] font-semibold text-slate-500 pl-10">
                              {formatTime(item.timestamp)}
                            </span>
                          </div>

                          {/* Candidate */}
                          <div className="col-span-3 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[11px] font-bold text-slate-600 shrink-0 overflow-hidden">
                              {item.image ? (
                                <img src={`${API_BASE_URL}/../uploads/candidates/photos/${item.image}`} alt={item.candidateName} className="w-full h-full object-cover" />
                              ) : (
                                item.candidateName?.charAt(0) || 'C'
                              )}
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="text-[13px] font-bold text-slate-900 truncate">{item.candidateName}</span>
                              <span className="text-[12px] text-slate-500 truncate">{item.role || 'Software Engineer'}</span>
                            </div>
                          </div>

                          {/* Activity */}
                          <div className="col-span-3 flex items-center gap-3">
                            <div className="w-6 h-6 rounded-md bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                              {getActivityIcon(item.type, item.action, item.description)}
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="text-[13px] font-bold text-slate-900 truncate">{item.action}</span>
                              <span className="text-[12px] text-slate-500 truncate">{item.description || 'System updated application status'}</span>
                            </div>
                          </div>

                          {/* Stage */}
                          <div className="col-span-2 flex items-center">
                            <span className={cn(
                              "px-2.5 py-1 rounded-full text-[11px] font-bold inline-flex items-center justify-center",
                              getBadgeStyle(item.type, item.action, item.description)
                            )}>
                              {getBadgeLabel(item.type, item.action, item.description)}
                            </span>
                          </div>

                          {/* Performed By */}
                          <div className="col-span-3 flex flex-col min-w-0">
                            <span className="text-[13px] font-semibold text-slate-700 truncate">{item.user}</span>
                            <span className="text-[12px] text-slate-500 truncate">{item.userRole || 'System'}</span>
                          </div>

                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <div className="p-6 flex justify-center border-t border-slate-100">
                <button className="px-5 py-2.5 bg-white border border-slate-200 rounded-lg text-[13px] font-bold text-blue-600 hover:bg-blue-50 transition-colors flex items-center gap-2 shadow-sm">
                  <ArrowDown className="w-4 h-4" /> Load More Activities
                </button>
              </div>

            </div>
          )}

          {/* Pagination Footer */}
          {totalPages > 0 && (
            <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4 bg-[#F8FAFC] rounded-b-xl">
              <p className="text-[13px] font-medium text-slate-500">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredTimeline.length)} of {filteredTimeline.length} results
              </p>

              <div className="flex items-center gap-1.5">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => p - 1)}
                  className="flex items-center gap-1 h-8 px-2 text-[13px] font-semibold text-slate-500 hover:text-slate-900 disabled:opacity-50 disabled:hover:text-slate-500 transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" /> Previous
                </button>

                <div className="flex items-center gap-1">
                  {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                    const page = i + 1;
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={cn(
                          "flex items-center justify-center h-8 w-8 rounded-md text-[13px] font-semibold transition-colors",
                          currentPage === page
                            ? "border border-blue-200 bg-blue-50 text-blue-600"
                            : "text-slate-600 hover:bg-slate-100"
                        )}
                      >
                        {page}
                      </button>
                    );
                  })}
                  {totalPages > 5 && (
                    <>
                      <span className="flex items-center justify-center h-8 w-8 text-slate-400">...</span>
                      <button
                        onClick={() => setCurrentPage(totalPages)}
                        className={cn(
                          "flex items-center justify-center h-8 w-8 rounded-md text-[13px] font-semibold transition-colors",
                          currentPage === totalPages
                            ? "border border-blue-200 bg-blue-50 text-blue-600"
                            : "text-slate-600 hover:bg-slate-100"
                        )}
                      >
                        {totalPages}
                      </button>
                    </>
                  )}
                </div>

                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => p + 1)}
                  className="flex items-center gap-1 h-8 px-2 text-[13px] font-semibold text-slate-500 hover:text-slate-900 disabled:opacity-50 disabled:hover:text-slate-500 transition-colors"
                >
                  Next <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
