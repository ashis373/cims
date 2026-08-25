import { useState, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import {
  Search, ChevronDown, ChevronLeft, ChevronRight, Download,
  MoreVertical, Activity, FileText, Users, Briefcase,
  CheckCircle, XCircle, AlertTriangle, Monitor, Linkedin,
  Globe, UserPlus, Phone, X, Award, Building, User, ArrowDown
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { API_BASE_URL } from "@/config/api";

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
      fetch(`${API_BASE_URL}/candidates/timeline.php`).then(res => res.json()),
      fetch(`${API_BASE_URL}/dashboard/stats.php`).then(res => res.json())
    ])
      .then(([timelineData, statsData]) => {
        setTimeline(timelineData);
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
    paginatedTimeline.forEach(item => {
      const date = new Date(item.timestamp);
      const isToday = new Date().toDateString() === date.toDateString();
      const isYesterday = new Date(Date.now() - 86400000).toDateString() === date.toDateString();

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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-[22px] font-bold tracking-tight text-slate-900">Global Activity Feed</h1>
            <p className="text-slate-500 text-[13px] font-medium mt-1">
              Real-time updates and activities from all candidates across the system.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search candidate, activity, stage..."
                className="pl-9 h-10 w-[280px] bg-white text-[13px] rounded-lg border-slate-200 focus-visible:ring-1"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="relative">
              <select className="h-10 pl-4 pr-10 bg-white border border-slate-200 rounded-lg text-[13px] font-semibold text-slate-700 outline-none appearance-none focus:ring-1 focus:ring-blue-500">
                <option>All Users</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-6 border-b border-slate-200">
          {["All Activities", "Application History", "Interview History", "Offer History", "Joining History", "Rejection History", "Blacklist History"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "pb-3 text-[13px] font-semibold transition-colors relative",
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

      {/* Filter Row */}
      <div className="flex items-center justify-between gap-4 mt-2">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Date Range</span>
            <div className="relative">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="h-10 pl-4 pr-10 bg-white border border-slate-200 rounded-lg text-[13px] font-medium text-slate-700 outline-none appearance-none hover:bg-slate-50 transition-colors cursor-pointer w-[180px]"
              >
                <option>All Time</option>
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Activity Type</span>
            <div className="relative">
              <select
                value={activityType}
                onChange={(e) => setActivityType(e.target.value)}
                className="h-10 pl-4 pr-10 bg-white border border-slate-200 rounded-lg text-[13px] font-medium text-slate-700 outline-none appearance-none hover:bg-slate-50 transition-colors cursor-pointer w-[160px]"
              >
                <option>All Types</option>
                <option>Application</option>
                <option>Interview</option>
                <option>Offer</option>
                <option>History</option>
                <option>Alert</option>
                <option>Note</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Candidate Stage</span>
            <div className="relative">
              <select
                value={candidateStage}
                onChange={(e) => setCandidateStage(e.target.value)}
                className="h-10 pl-4 pr-10 bg-white border border-slate-200 rounded-lg text-[13px] font-medium text-slate-700 outline-none appearance-none hover:bg-slate-50 transition-colors cursor-pointer w-[160px]"
              >
                <option>All Stages</option>
                <option>New Applicant</option>
                <option>Shortlisted</option>
                <option>Interview Scheduled</option>
                <option>Offer Released</option>
                <option>Joined</option>
                <option>Rejected</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Source</span>
            <div className="relative">
              <select
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="h-10 pl-4 pr-10 bg-white border border-slate-200 rounded-lg text-[13px] font-medium text-slate-700 outline-none appearance-none hover:bg-slate-50 transition-colors cursor-pointer w-[160px]"
              >
                <option>All Sources</option>
                <option>Manual</option>
                <option>Career Page</option>
                <option>LinkedIn</option>
                <option>Referral</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-end h-full pt-5">
          <button className="h-10 px-4 bg-white border border-slate-200 rounded-lg text-[13px] font-semibold text-slate-700 flex items-center gap-2 hover:bg-slate-50 transition-colors shadow-sm">
            <Download className="h-4 w-4 text-slate-500" /> Export Report
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-4">
        {[
          { label: "Total Activities", value: timeline.length, change: "+12%", icon: Activity, tone: "bg-blue-50 text-blue-600", borderTone: "border-blue-500" },
          { label: "Applications", value: stats?.total || 0, change: "+18%", icon: FileText, tone: "bg-emerald-50 text-emerald-600", borderTone: "border-emerald-500" },
          { label: "Interviews", value: (stats?.scheduled || 0) + (stats?.selected || 0), change: "+8%", icon: Users, tone: "bg-purple-50 text-purple-600", borderTone: "border-purple-500" },
          { label: "Offers", value: (stats?.offersReleased || 0) + (stats?.offersAccepted || 0) + (stats?.offersDeclined || 0), change: "+15%", icon: Award, tone: "bg-orange-50 text-orange-600", borderTone: "border-orange-500" },
          { label: "Joinings", value: stats?.joined || 0, change: "+10%", icon: Building, tone: "bg-indigo-50 text-indigo-600", borderTone: "border-indigo-500" },
          { label: "Rejections", value: stats?.rejected || 0, change: "+5%", icon: XCircle, tone: "bg-red-50 text-red-600", borderTone: "border-red-500" },
          { label: "Blacklisted", value: stats?.blacklisted || 0, change: "+7%", icon: AlertTriangle, tone: "bg-slate-100 text-slate-600", borderTone: "border-slate-500" },
        ].map((stat, i) => (
          <div key={i} className={cn("p-5 bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] rounded-3xl relative overflow-hidden group border-t-[3px] flex-1 min-w-[160px]", stat.borderTone)}>
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-gradient-to-br from-transparent to-black/[0.02] rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
            <div className="flex items-start justify-between relative z-10">
              <div>
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">{stat.label}</div>
                <div className="text-3xl font-black tracking-tight text-slate-900">{stat.value}</div>
                <div className="mt-1.5 text-[10px] font-bold text-emerald-500">{stat.change} vs last 7 days</div>
              </div>
              <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl", stat.tone)}>
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
          </div>
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
          <div className="col-span-2">PERFORMED BY</div>
          <div className="col-span-1">SOURCE</div>
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
                                <img src={`${API_BASE_URL}/candidates/uploads/${item.image}`} alt={item.candidateName} className="w-full h-full object-cover" />
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
                          <div className="col-span-2 flex flex-col min-w-0">
                            <span className="text-[13px] font-semibold text-slate-700 truncate">{item.user}</span>
                            <span className="text-[12px] text-slate-500 truncate">{'HR Manager'}</span>
                          </div>

                          {/* Source & Actions */}
                          <div className="col-span-1 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-slate-500">
                              <Monitor className="w-4 h-4" />
                              <span className="text-[12px] font-medium hidden xl:inline-block">Manual</span>
                            </div>
                            <button className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100 transition-colors">
                              <MoreVertical className="w-4 h-4" />
                            </button>
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
