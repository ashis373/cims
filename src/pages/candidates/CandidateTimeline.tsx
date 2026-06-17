import { useState, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Search, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { API_BASE_URL } from "@/config/api";

export default function CandidateTimeline() {
  const [timeline, setTimeline] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("All Activities");

  useEffect(() => {
    fetch(`${API_BASE_URL}/timeline.php`)
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

  const getBadgeStyle = (type: string, action: string) => {
    if (action.toLowerCase().includes('cancelled')) return "bg-red-50 text-red-600";
    if (type === 'Feedback') return "bg-emerald-50 text-emerald-600";
    if (type === 'Application') return "bg-purple-50 text-purple-600";
    if (action.toLowerCase().includes('offer')) return "bg-orange-50 text-orange-600";
    if (type === 'Interview') return "bg-slate-100 text-slate-600";
    return "bg-slate-100 text-slate-600";
  };

  const getBadgeLabel = (type: string, action: string) => {
    if (action.toLowerCase().includes('cancelled')) return "Cancelled";
    if (action.toLowerCase().includes('offer')) return "Offer";
    if (type === 'Application') return "Candidate";
    if (type === 'Interview') return "Interview";
    if (type === 'Feedback') return "Feedback";
    return "Update";
  };

  // Filter Logic
  const filteredTimeline = useMemo(() => {
    return timeline.filter(item => {
      const matchSearch = item.user?.toLowerCase().includes(search.toLowerCase()) || 
                          item.description?.toLowerCase().includes(search.toLowerCase()) ||
                          item.candidateName?.toLowerCase().includes(search.toLowerCase());
      return matchSearch;
    });
  }, [timeline, search]);

  // Pagination Logic
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    setCurrentPage(1);
  }, [search, activeTab]);

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
      else prefix = date.toLocaleDateString("en-US", { weekday: 'long' }).toUpperCase() + " • ";

      const dateStr = prefix + date.toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase();
      
      if (!groups[dateStr]) groups[dateStr] = [];
      groups[dateStr].push(item);
    });
    return groups;
  }, [paginatedTimeline]);

  return (
    <div className="flex flex-col gap-8 w-full pb-10">
      
      {/* Header Area */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-[22px] font-bold tracking-tight text-slate-900">Global Activity Feed</h1>
            <p className="text-slate-500 text-[13px] font-medium mt-1">
              Real-time updates and activities from all users worldwide.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Search activity or user..." 
                className="pl-9 h-10 w-[260px] bg-white text-[13px] rounded-lg border-slate-200 focus-visible:ring-1"
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
        <div className="flex items-center gap-8 border-b border-slate-200">
          {["All Activities", "My Activities", "Mentions"].map((tab) => (
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

      {/* Timeline Content */}
      <div className="bg-transparent">
        {loading ? (
          <div className="space-y-8 py-4">
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
          </div>
        ) : Object.keys(groupedTimeline).length === 0 ? (
          <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl">
            <h3 className="text-[14px] font-bold text-slate-900">No activity found</h3>
            <p className="text-[13px] text-slate-500 mt-1">Try adjusting your filters or search query.</p>
          </div>
        ) : (
          <div className="pb-4">
            {Object.keys(groupedTimeline).map((date, idx) => (
              <div key={idx} className="mb-8 last:mb-0">
                {/* Date Header */}
                <h3 className="text-[11px] font-bold text-slate-500 tracking-[0.05em] mb-6 pl-14">
                  {date}
                </h3>

                <div className="relative pl-14 before:absolute before:inset-y-0 before:left-[27px] before:w-[2px] before:bg-slate-200 space-y-0">
                  {groupedTimeline[date].map((item, i) => (
                    <div key={i} className="relative group flex items-center justify-between py-4">
                      {/* Avatar */}
                      <div className="absolute left-[-28px] top-1/2 -translate-y-1/2 flex items-center justify-center w-8 h-8 rounded-full border-[3px] border-white shadow-sm z-10 bg-slate-100 overflow-hidden text-[10px] font-bold text-slate-600">
                        {item.user?.charAt(0)}
                      </div>

                      {/* Content Left */}
                      <div className="flex flex-col gap-1 pr-4">
                        <div className="text-[13px]">
                          <span className="font-bold text-slate-900">{item.user}</span>
                          <span className="text-slate-500 ml-1">
                            {item.action.toLowerCase() === 'note added' ? 'added a new note' : 
                             item.action.toLowerCase() === 'interview scheduled' ? 'scheduled an interview' :
                             item.action.toLowerCase() === 'application created' ? 'added a new candidate' :
                             item.action.toLowerCase().includes('offer') ? 'sent an offer' :
                             item.action.toLowerCase().includes('reject') ? 'rejected a candidate' :
                             `updated a ${item.type.toLowerCase()}`}
                          </span>
                        </div>
                        <div className="text-[13px] text-slate-500">
                          {item.candidateName} {item.description ? `– ${item.description}` : ''}
                        </div>
                      </div>

                      {/* Content Right */}
                      <div className="flex items-center gap-6 shrink-0">
                        <span className={cn(
                          "px-2.5 py-1 rounded-full text-[11px] font-bold",
                          getBadgeStyle(item.type, item.action)
                        )}>
                          {getBadgeLabel(item.type, item.action)}
                        </span>
                        <span className="text-[12px] font-medium text-slate-400 w-16 text-right">
                          {formatTime(item.timestamp)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 0 && (
          <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-6">
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
  );
}
