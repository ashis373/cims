import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { API_BASE_URL } from "@/config/api";
import { getAuthHeaders } from "@/services/candidate-api";
import { toast } from "sonner";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Search,
  Filter,
  Eye,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Briefcase,
  Star,
  Download,
  ChevronRight,
  TrendingUp,
  PieChart as PieChartIcon,
  Calendar,
  ExternalLink,
  User,
  ThumbsUp,
  ThumbsDown,
  X
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface TopStatProps {
  title: string;
  value: number | string;
  pct?: number;
  icon: React.ElementType;
  theme: 'blue' | 'emerald' | 'purple' | 'amber' | 'cyan' | 'rose' | 'teal' | 'zinc' | 'orange';
  trendLabel?: string;
}

function TopStat({ title, value, pct, icon: Icon, theme, trendLabel }: TopStatProps) {
  const styles = {
    blue: { 
      cardBg: "bg-blue-50/40",
      badge: "bg-blue-50 text-blue-700 border-blue-100", 
      border: "border-blue-200/70 hover:border-blue-400",
      iconBg: "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-blue-500/20", 
      glow: "from-white to-transparent",
      trendText: "text-blue-700 bg-white/80"
    },
    emerald: { 
      cardBg: "bg-emerald-50/40",
      badge: "bg-emerald-50 text-emerald-700 border-emerald-100", 
      border: "border-emerald-200/70 hover:border-emerald-400",
      iconBg: "bg-gradient-to-br from-[#42bc24] to-[#36961c] text-white shadow-emerald-500/20", 
      glow: "from-white to-transparent",
      trendText: "text-emerald-700 bg-white/80"
    },
    purple: { 
      cardBg: "bg-purple-50/40",
      badge: "bg-purple-50 text-purple-700 border-purple-100", 
      border: "border-purple-200/70 hover:border-purple-400",
      iconBg: "bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-purple-500/20", 
      glow: "from-white to-transparent",
      trendText: "text-purple-700 bg-white/80"
    },
    amber: { 
      cardBg: "bg-amber-50/40",
      badge: "bg-amber-50 text-amber-700 border-amber-100", 
      border: "border-amber-200/70 hover:border-amber-400",
      iconBg: "bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-amber-500/20", 
      glow: "from-white to-transparent",
      trendText: "text-amber-700 bg-white/80"
    },
    cyan: { 
      cardBg: "bg-cyan-50/40",
      badge: "bg-cyan-50 text-cyan-700 border-cyan-100", 
      border: "border-cyan-200/70 hover:border-cyan-400",
      iconBg: "bg-gradient-to-br from-cyan-500 to-teal-600 text-white shadow-cyan-500/20", 
      glow: "from-white to-transparent",
      trendText: "text-cyan-700 bg-white/80"
    },
    rose: { 
      cardBg: "bg-rose-50/40",
      badge: "bg-rose-50 text-rose-700 border-rose-100", 
      border: "border-rose-200/70 hover:border-rose-400",
      iconBg: "bg-gradient-to-br from-rose-500 to-red-600 text-white shadow-rose-500/20", 
      glow: "from-white to-transparent",
      trendText: "text-rose-700 bg-white/80"
    },
    teal: { 
      cardBg: "bg-teal-50/40",
      badge: "bg-teal-50 text-teal-700 border-teal-100", 
      border: "border-teal-200/70 hover:border-teal-400",
      iconBg: "bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-teal-500/20", 
      glow: "from-white to-transparent",
      trendText: "text-teal-700 bg-white/80"
    },
    zinc: { 
      cardBg: "bg-slate-50/60",
      badge: "bg-slate-100 text-slate-700 border-slate-200", 
      border: "border-slate-300/70 hover:border-slate-400",
      iconBg: "bg-gradient-to-br from-slate-600 to-slate-800 text-white shadow-slate-500/20", 
      glow: "from-white to-transparent",
      trendText: "text-slate-700 bg-white/80"
    },
    orange: { 
      cardBg: "bg-orange-50/40",
      badge: "bg-orange-50 text-orange-700 border-orange-100", 
      border: "border-orange-200/70 hover:border-orange-400",
      iconBg: "bg-gradient-to-br from-orange-500 to-amber-600 text-white shadow-orange-500/20", 
      glow: "from-white to-transparent",
      trendText: "text-orange-700 bg-white/80"
    }
  }[theme];

  return (
    <Card
      className={cn(
        "relative overflow-hidden shadow-xs border rounded-xl flex-1 min-w-[150px] flex flex-col p-3.5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-sm group",
        styles.cardBg,
        styles.border
      )}
    >
      <div className={cn("absolute top-0 right-0 -mt-3 -mr-3 w-20 h-20 bg-gradient-to-br to-transparent rounded-full blur-xl pointer-events-none opacity-60", styles.glow)} />
      
      <div className="flex items-start justify-between mb-1.5 relative z-10">
        <div className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider pr-1.5 leading-tight truncate">
          {title}
        </div>
        <div className={cn("p-1.5 rounded-lg shrink-0 shadow-xs", styles.iconBg)}>
          <Icon className="w-3.5 h-3.5" />
        </div>
      </div>
      
      <div className="mt-auto relative z-10 pt-1">
        <div className="text-2xl font-black tracking-tight text-slate-900 leading-none mb-1.5">
          {value}
        </div>
        {pct !== undefined ? (
          <div className="flex items-center gap-1.5 text-[9.5px] font-bold text-slate-400">
            <span className={cn("inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded font-bold", styles.trendText)}>
              +{pct}%
            </span>
            <span className="text-slate-400 font-medium truncate">this month</span>
          </div>
        ) : trendLabel ? (
          <div className="flex items-center gap-1.5 text-[9.5px] font-bold text-slate-400">
            <span className={cn("inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded font-bold", styles.trendText)}>
              {trendLabel}
            </span>
          </div>
        ) : null}
      </div>
    </Card>
  );
}

const mockHistory = [
  { id: "HIS-001", candidateName: "Tom Hanks", candidateEmail: "tom.hanks@example.com", position: "Backend Developer", department: "Software Development", type: "Technical", date: "2026-05-10T10:00:00", interviewer: "Mike Johnson", result: "Passed", score: 8.5, feedback: "Demonstrated strong knowledge of databases and microservices architecture.", recommendation: "Strong Hire" },
  { id: "HIS-002", candidateName: "Emma Watson", candidateEmail: "emma.watson@example.com", position: "Product Designer", department: "Multimedia Design", type: "Final Round", date: "2026-05-12T14:30:00", interviewer: "Sarah Smith", result: "Failed", score: 5.0, feedback: "Needs more portfolio work with complex enterprise SaaS workflows.", recommendation: "Do Not Hire" },
  { id: "HIS-003", candidateName: "Robert Downey", candidateEmail: "robert.d@example.com", position: "Data Analyst", department: "Software Development", type: "HR", date: "2026-05-15T11:00:00", interviewer: "John Doe", result: "Passed", score: 9.0, feedback: "Exceptional analytical skills, great communication, culture fit.", recommendation: "Strong Hire" },
  { id: "HIS-004", candidateName: "Chris Hemsworth", candidateEmail: "chris.h@example.com", position: "Marketing Lead", department: "Digital Marketing", type: "Technical", date: "2026-05-20T09:00:00", interviewer: "Sarah Smith", result: "No Show", score: null, feedback: "Candidate did not attend interview session.", recommendation: "Do Not Hire" },
  { id: "HIS-005", candidateName: "Mark Ruffalo", candidateEmail: "mark.r@example.com", position: "Security Engineer", department: "Software Development", type: "Technical", date: "2026-05-25T13:00:00", interviewer: "Mike Johnson", result: "Passed", score: 7.5, feedback: "Good fundamentals on OWASP and cloud IAM rules.", recommendation: "Hire" },
  { id: "HIS-006", candidateName: "Natalie Portman", candidateEmail: "natalie.p@example.com", position: "Frontend Dev", department: "Software Development", type: "Technical", date: "2026-06-01T10:00:00", interviewer: "John Doe", result: "Passed", score: 8.0, feedback: "Solid React knowledge, clean coding practices.", recommendation: "Hire" },
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case "Completed":
      return "bg-purple-50 text-purple-600 border-purple-200 ring-purple-500/20";
    case "Failed":
      return "bg-red-50 text-red-600 border-red-200 ring-red-500/20";
    case "No Show":
      return "bg-amber-50 text-amber-600 border-amber-200 ring-amber-500/20";
    case "Cancelled":
      return "bg-slate-100 text-slate-600 border-slate-300 ring-slate-400/20";
    default:
      return "bg-blue-50 text-blue-600 border-blue-200 ring-blue-500/20";
  }
};

const getResultBadge = (result: string) => {
  switch (result) {
    case "Passed":
      return "bg-emerald-50 text-emerald-600 border-emerald-200 ring-emerald-500/20";
    case "Failed":
      return "bg-red-50 text-red-600 border-red-200 ring-red-500/20";
    case "No Show":
      return "bg-amber-50 text-amber-600 border-amber-200 ring-amber-500/20";
    case "Cancelled":
      return "bg-slate-100 text-slate-600 border-slate-300 ring-slate-400/20";
    default:
      return "bg-slate-50 text-slate-600 border-slate-200 ring-slate-500/20";
  }
};

export default function InterviewsHistory() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [interviewerFilter, setInterviewerFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [page, setPage] = useState(1);
  const perPage = 8;
  const [historyList, setHistoryList] = useState<any[]>([]);
  const [viewItem, setViewItem] = useState<any | null>(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/candidates/interviews.php`, {
      credentials: 'include',
      headers: getAuthHeaders(false)
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          // Rule: History only includes Completed, Failed, No Show, Cancelled
          // Exclude upcoming: Scheduled, Confirmed, Rescheduled
          const historyOnly = data.filter((i: any) => {
            const st = (i.status || "").toLowerCase().trim();
            // Never include scheduled, confirmed, or rescheduled
            if (st === "scheduled" || st === "confirmed" || st === "rescheduled") {
              return false;
            }
            return st === "completed" || st === "failed" || st === "no show" || st === "cancelled";
          });

          const formatted = historyOnly.map((i: any) => {
            let result = i.result;
            if (!result) {
              if (i.status === "Cancelled" || i.status === "No Show") {
                result = i.status === "Cancelled" ? "Cancelled" : "No Show";
              } else if (i.recommendation === "Do Not Hire" || (i.rating && Number(i.rating) < 3)) {
                result = "Failed";
              } else if (i.status === "Completed") {
                result = "Passed";
              } else {
                result = "—";
              }
            }

            const rawScore = i.rating ? Number(i.rating) * 2 : null;

            return {
              id: i.id,
              candidate_id: i.candidate_id,
              candidateName: i.candidateName,
              candidateEmail: i.candidateEmail,
              position: i.position,
              department: i.department,
              type: i.type,
              date: i.date,
              end_time: i.end_time,
              interviewer: i.interviewer || "Unassigned",
              result,
              score: rawScore,
              rating: i.rating,
              feedback: i.feedback,
              comments: i.comments,
              recommendation: i.recommendation,
              notes: i.notes,
              mode: i.mode,
              meeting_link: i.meeting_link,
              location: i.location,
              status: i.status
            };
          });

          setHistoryList(formatted);
        }
      })
      .catch(console.error);
  }, []);

  const uniqueInterviewers = useMemo(() => {
    return Array.from(new Set(historyList.map(h => h.interviewer).filter(Boolean)));
  }, [historyList]);

  const uniqueTypes = useMemo(() => {
    return Array.from(new Set(historyList.map(h => h.type).filter(Boolean)));
  }, [historyList]);

  const filteredHistory = useMemo(() => {
    const today = new Date();
    const todayStr = today.toDateString();

    return historyList
      .filter(item => {
        const name = (item.candidateName || "").toLowerCase();
        const pos = (item.position || "").toLowerCase();
        const search = searchTerm.toLowerCase();

        const matchesSearch = name.includes(search) || pos.includes(search);
        const matchesStatus = statusFilter === "all" || item.result.toLowerCase() === statusFilter.toLowerCase();
        const matchesType = typeFilter === "all" || (item.type || "").toLowerCase() === typeFilter.toLowerCase();
        const matchesInterviewer = interviewerFilter === "all" || (item.interviewer || "").toLowerCase() === interviewerFilter.toLowerCase();

        let matchesDate = true;
        if (dateFilter !== "all" && item.date) {
          const itemDate = new Date(item.date);
          if (dateFilter === "today") {
            matchesDate = itemDate.toDateString() === todayStr;
          } else if (dateFilter === "week") {
            const diffDays = Math.abs((today.getTime() - itemDate.getTime()) / (1000 * 3600 * 24));
            matchesDate = diffDays <= 7;
          } else if (dateFilter === "month") {
            matchesDate = itemDate.getMonth() === today.getMonth() && itemDate.getFullYear() === today.getFullYear();
          }
        }

        return matchesSearch && matchesStatus && matchesType && matchesInterviewer && matchesDate;
      })
      .sort((a, b) => {
        const isTodayA = a.date ? new Date(a.date).toDateString() === todayStr : false;
        const isTodayB = b.date ? new Date(b.date).toDateString() === todayStr : false;

        // 1. Prioritize Today's interviews at the very top
        if (isTodayA && !isTodayB) return -1;
        if (!isTodayA && isTodayB) return 1;

        // 2. Otherwise sort by date descending (newest first)
        const timeA = a.date ? new Date(a.date).getTime() : 0;
        const timeB = b.date ? new Date(b.date).getTime() : 0;
        return timeB - timeA;
      });
  }, [historyList, searchTerm, statusFilter, typeFilter, interviewerFilter, dateFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredHistory.length / perPage));
  const safePage = Math.min(page, totalPages);
  const paginated = filteredHistory.slice((safePage - 1) * perPage, safePage * perPage);

  const totalInterviews = historyList.length;
  const passed = historyList.filter(i => i.result === "Passed").length;
  const failed = historyList.filter(i => i.result === "Failed").length;
  const noShow = historyList.filter(i => i.result === "No Show").length;
  
  const scoredInterviews = historyList.filter(i => i.score !== null);
  const avgScore = scoredInterviews.length > 0 ? (scoredInterviews.reduce((acc, curr) => acc + (curr.score || 0), 0) / scoredInterviews.length).toFixed(1) : "0.0";

  const donutData = [
    { name: "Passed", value: passed || 1, color: "#10b981" },
    { name: "Failed", value: failed || 0, color: "#ef4444" },
    { name: "No Show", value: noShow || 0, color: "#f59e0b" },
  ];

  const monthData = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const counts: Record<string, number> = {};
    months.forEach(m => counts[m] = 0);

    historyList.forEach(item => {
      if (item.date) {
        const d = new Date(item.date);
        const m = months[d.getMonth()];
        if (m) counts[m] = (counts[m] || 0) + 1;
      }
    });

    return months.map(name => ({ name, count: counts[name] || 0 })).filter(m => m.count > 0 || ["Jan", "Feb", "Mar", "Apr", "May", "Jun"].includes(m.name)).slice(0, 6);
  }, [historyList]);

  const handleExportExcel = () => {
    const csvContent = "data:text/csv;charset=utf-8," +
      ["Candidate,Position,Type,Date,Interviewer,Result,Score,Recommendation"]
        .concat(filteredHistory.map(i => `"${i.candidateName}","${i.position}","${i.type}","${new Date(i.date).toLocaleDateString()}","${i.interviewer}","${i.result}","${i.score || 'N/A'}","${i.recommendation || 'N/A'}"`))
        .join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Interview_History_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Interview History exported to CSV successfully!");
  };

  const handleExportPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Top Banner (Signature Dark Teal / Cyan Gradient) */}
      <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-r from-[#000C22] via-[#0B2524] to-[#0D2823] shadow-lg border border-teal-900/40 p-8 sm:p-10 text-white flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6">
        <div className="relative z-10 flex flex-col justify-center max-w-xl">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-2 text-white">Interview History</h1>
          <p className="text-[#60C042] text-[14px] sm:text-[15px] font-medium leading-relaxed">
            Complete record of all past interviews, evaluation scores, and historical hiring analytics.
          </p>
        </div>
        <div className="relative z-10 flex flex-wrap items-center gap-4 self-stretch xl:self-auto justify-between xl:justify-end">
          <div className="relative w-full sm:w-[280px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-teal-300/70" />
            <Input
              placeholder="Search candidate, role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-11 w-full bg-white/10 text-[13px] text-white placeholder:text-teal-200/60 rounded-xl border border-white/20 focus-visible:bg-white/15 focus-visible:ring-1 focus-visible:ring-teal-400 transition-all shadow-sm"
            />
          </div>
          <Button
            asChild
            className="h-11 px-5 text-[13px] font-bold btn-primary hover:opacity-95 text-white transition-all rounded-xl shadow-md"
          >
            <Link to="/interviews/upcoming">
              <Calendar className="mr-1.5 h-4 w-4" /> Upcoming
            </Link>
          </Button>
          <div className="shrink-0 group cursor-pointer hidden sm:block">
            <span className="text-7xl drop-shadow-2xl inline-block origin-bottom hover:animate-bounce cursor-default select-none">
              📊
            </span>
          </div>
        </div>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <TopStat title="Total Conducted" value={totalInterviews} icon={Briefcase} theme="blue" trendLabel="all completed" />
        <TopStat title="Passed" value={passed} icon={CheckCircle2} theme="emerald" trendLabel="cleared rounds" />
        <TopStat title="Failed" value={failed} icon={XCircle} theme="rose" trendLabel="rejected" />
        <TopStat title="No Show" value={noShow} icon={AlertCircle} theme="amber" trendLabel="candidate absent" />
        <TopStat title="Average Score" value={`${avgScore}/10`} icon={Star} theme="purple" trendLabel="aggregate rating" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">
        {/* Left Area: Filters & Table */}
        <div className="xl:col-span-3 space-y-4">
          <Card className="p-3 bg-white border-border/50 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] rounded-3xl">
            <div className="flex flex-wrap gap-3 items-center justify-between">
              <div className="flex flex-wrap gap-3 items-center flex-1">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <Input
                    placeholder="Search candidate or position..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 h-9 text-xs bg-slate-50 border-slate-200 rounded-lg"
                  />
                </div>

                <select
                  className="h-9 w-[130px] rounded-lg border border-slate-200 bg-white px-3 text-xs shadow-sm font-semibold text-slate-700"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Results</option>
                  <option value="passed">Passed</option>
                  <option value="failed">Failed</option>
                  <option value="no show">No Show</option>
                  <option value="cancelled">Cancelled</option>
                </select>

                <select
                  className="h-9 w-[130px] rounded-lg border border-slate-200 bg-white px-3 text-xs shadow-sm font-semibold text-slate-700"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <option value="all">All Types</option>
                  {uniqueTypes.map(t => (
                    <option key={t} value={t.toLowerCase()}>{t}</option>
                  ))}
                </select>

                <select
                  className="h-9 w-[130px] rounded-lg border border-slate-200 bg-white px-3 text-xs shadow-sm font-semibold text-slate-700"
                  value={interviewerFilter}
                  onChange={(e) => setInterviewerFilter(e.target.value)}
                >
                  <option value="all">All Interviewers</option>
                  {uniqueInterviewers.map(i => (
                    <option key={i} value={i.toLowerCase()}>{i}</option>
                  ))}
                </select>

                <select
                  className="h-9 w-[125px] rounded-lg border border-slate-200 bg-white px-3 text-xs shadow-sm font-semibold text-slate-700"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                >
                  <option value="all">All Dates</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleExportExcel}
                  className="h-9 rounded-lg font-bold border-slate-200 text-slate-600 bg-white hover:bg-slate-50 text-xs"
                >
                  <Download className="w-3.5 h-3.5 mr-1.5" />
                  Excel
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleExportPDF}
                  className="h-9 rounded-lg font-bold border-slate-200 text-slate-600 bg-white hover:bg-slate-50 text-xs"
                >
                  <Download className="w-3.5 h-3.5 mr-1.5" />
                  PDF
                </Button>
              </div>
            </div>
          </Card>

          <Card className="bg-white border-border/50 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] rounded-3xl overflow-hidden flex flex-col">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[11px]">
                <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-100">
                  <tr>
                    <th className="px-4 py-3 font-bold">Candidate</th>
                    <th className="px-4 py-3 font-bold">Position</th>
                    <th className="px-4 py-3 font-bold">Interview Type</th>
                    <th className="px-4 py-3 font-bold">Date & Time</th>
                    <th className="px-4 py-3 font-bold">Interviewer</th>
                    <th className="px-4 py-3 font-bold">Status</th>
                    <th className="px-4 py-3 font-bold">Result</th>
                    <th className="px-4 py-3 font-bold text-center">Score</th>
                    <th className="px-4 py-3 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginated.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        {inv.candidate_id ? (
                          <Link to={`/candidates/${inv.candidate_id}`} className="font-bold text-slate-900 text-[12px] hover:text-blue-600 cursor-pointer block">
                            {inv.candidateName}
                          </Link>
                        ) : (
                          <div 
                            onClick={() => setViewItem(inv)} 
                            className="font-bold text-slate-900 text-[12px] hover:text-blue-600 cursor-pointer"
                          >
                            {inv.candidateName}
                          </div>
                        )}
                        <div className="text-slate-500 text-[10px] mt-0.5">{inv.candidateEmail || inv.department}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-700">{inv.position}</div>
                        <div className="text-slate-500 text-[10px]">{inv.department}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full">
                          {inv.type}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-800 text-[12px] flex items-center gap-1.5">
                          {(() => {
                            if (!inv.date) return "-";
                            const d = new Date(inv.date);
                            const isToday = new Date().toDateString() === d.toDateString();
                            return (
                              <>
                                <span>{d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                                {isToday && (
                                  <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700">
                                    Today
                                  </span>
                                )}
                              </>
                            );
                          })()}
                        </div>
                        {inv.date && (
                          <div className="text-slate-400 text-[10px] font-semibold mt-0.5">
                            {new Date(inv.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[8px] font-bold text-slate-600">
                            {(inv.interviewer || "U").charAt(0)}
                          </div>
                          <span className="font-medium text-slate-700">{inv.interviewer}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 font-bold border ring-1 ring-inset", getStatusBadge(inv.status || "Completed"))}>
                          {inv.status || "Completed"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 font-bold border ring-1 ring-inset", getResultBadge(inv.result))}>
                          {inv.result}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {inv.score ? (
                          <div className="font-black text-slate-900">{inv.score} <span className="text-slate-400 font-medium text-[9px]">/10</span></div>
                        ) : (
                          <span className="text-slate-400 font-medium">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-7 text-[10px] font-bold border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-blue-600"
                            onClick={() => setViewItem(inv)}
                          >
                            <Eye className="w-3.5 h-3.5 mr-1" /> View Details
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {paginated.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-10 text-center text-slate-500 font-medium">
                        No historical interviews match your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div className="flex items-center justify-between p-4 border-t border-slate-100 bg-white">
              <div className="text-[11px] font-medium text-slate-500">
                Showing {Math.min(filteredHistory.length, (safePage - 1) * perPage + 1)} to{" "}
                {Math.min(filteredHistory.length, safePage * perPage)} of {filteredHistory.length} interviews
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7 rounded border-slate-200"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={safePage === 1}
                >
                  <ChevronRight className="h-3.5 w-3.5 rotate-180" />
                </Button>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <Button
                    key={i}
                    variant={safePage === i + 1 ? "default" : "ghost"}
                    size="icon"
                    className={cn(
                      "h-7 w-7 rounded text-[11px] font-bold",
                      safePage === i + 1 ? "bg-indigo-600 text-white" : "text-slate-600",
                    )}
                    onClick={() => setPage(i + 1)}
                  >
                    {i + 1}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7 rounded border-slate-200"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safePage === totalPages}
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Sidebar: Analytics */}
        <div className="space-y-6">
          <Card className="p-5 bg-white border-border/50 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] rounded-3xl">
            <h3 className="text-[13px] font-bold text-slate-900 mb-4 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-indigo-500" />
              Monthly Volume
            </h3>
            <div className="h-[180px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                  <RechartsTooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={30} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-5 bg-white border-border/50 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] rounded-3xl">
            <h3 className="text-[13px] font-bold text-slate-900 mb-4 flex items-center gap-2">
              <PieChartIcon className="h-4 w-4 text-purple-500" />
              Result Distribution
            </h3>
            <div className="flex items-center gap-4">
              <div className="relative h-[110px] w-[110px] shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={donutData}
                      cx="50%"
                      cy="50%"
                      innerRadius={35}
                      outerRadius={50}
                      paddingAngle={2}
                      dataKey="value"
                      stroke="none"
                    >
                      {donutData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-2">
                {donutData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-[10px] font-bold">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="text-slate-600">{item.name}</span>
                    </div>
                    <span className="text-slate-900">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* View Interview Details Modal */}
      <Dialog open={!!viewItem} onOpenChange={(open) => !open && setViewItem(null)}>
        <DialogContent className="max-w-lg rounded-2xl p-6 bg-white shadow-xl">
          <DialogHeader className="pb-3 border-b border-slate-100">
            <DialogTitle className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-600" />
              Interview Evaluation Record
            </DialogTitle>
          </DialogHeader>

          {viewItem && (
            <div className="space-y-4 pt-1">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-black text-sm">
                    {(viewItem.candidateName || "C").charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{viewItem.candidateName}</h4>
                    <p className="text-xs text-slate-500">{viewItem.position} • {viewItem.department}</p>
                  </div>
                </div>
                {viewItem.candidate_id && (
                  <Link 
                    to={`/candidates/${viewItem.candidate_id}`}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 bg-white px-2.5 py-1.5 rounded-lg border border-indigo-100 shadow-xs"
                  >
                    Profile <ExternalLink className="w-3 h-3" />
                  </Link>
                )}
              </div>

              {/* Comprehensive Database Fields Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl border border-slate-100 bg-white">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Interview Round (Type)</span>
                  <span className="font-bold text-slate-800 text-[13px]">{viewItem.type}</span>
                </div>

                <div className="p-3 rounded-xl border border-slate-100 bg-white">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Interview Status</span>
                  <Badge className={cn("text-[10px] font-bold uppercase", 
                    viewItem.status === "Completed" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                    viewItem.status === "Scheduled" ? "bg-blue-50 text-blue-700 border-blue-200" :
                    "bg-slate-100 text-slate-700"
                  )}>
                    {viewItem.status || "Completed"}
                  </Badge>
                </div>

                <div className="p-3 rounded-xl border border-slate-100 bg-white">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Interviewer(s)</span>
                  <span className="font-bold text-slate-800 text-[13px]">{viewItem.interviewer || "Unassigned"}</span>
                </div>

                <div className="p-3 rounded-xl border border-slate-100 bg-white">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Mode</span>
                  <span className="font-bold text-slate-800 text-[13px]">{viewItem.mode || "Offline"}</span>
                </div>

                <div className="p-3 rounded-xl border border-slate-100 bg-white">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Interview Date & Time</span>
                  <div className="font-bold text-slate-800">
                    {new Date(viewItem.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    {viewItem.date && ` at ${new Date(viewItem.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-slate-100 bg-white">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">End Time</span>
                  <div className="font-bold text-slate-800">
                    {viewItem.end_time ? new Date(viewItem.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "—"}
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-slate-100 bg-white">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Result & Recommendation</span>
                  <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 font-bold text-[11px] border ring-1 ring-inset", getResultBadge(viewItem.result))}>
                    {viewItem.result} {viewItem.recommendation ? `(${viewItem.recommendation})` : ''}
                  </span>
                </div>

                <div className="p-3 rounded-xl border border-slate-100 bg-white">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Rating</span>
                  <span className="font-bold text-amber-600 text-[13px]">
                    {viewItem.rating ? `${'⭐'.repeat(viewItem.rating)} (${viewItem.rating}/5)` : `${viewItem.score || 8}/10`}
                  </span>
                </div>

                {(viewItem.meeting_link || viewItem.location) && (
                  <div className="col-span-2 p-3 rounded-xl border border-slate-100 bg-white">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Meeting Link / Location</span>
                    <span className="font-bold text-slate-800 text-[12px] break-all">{viewItem.meeting_link || viewItem.location}</span>
                  </div>
                )}
              </div>

              {viewItem.feedback && (
                <div className="p-3 rounded-xl border border-slate-100 bg-slate-50 text-xs">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase mb-1">Feedback Summary</span>
                  <p className="text-slate-700 leading-relaxed font-medium">{viewItem.feedback}</p>
                </div>
              )}

              {viewItem.comments && (
                <div className="p-3 rounded-xl border border-slate-100 bg-slate-50 text-xs">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase mb-1">Interviewer Comments</span>
                  <p className="text-slate-700 leading-relaxed font-medium whitespace-pre-wrap">{viewItem.comments}</p>
                </div>
              )}

              {viewItem.notes && (
                <div className="p-3 rounded-xl border border-slate-100 bg-amber-50/50 text-xs">
                  <span className="text-[10px] font-bold text-amber-700 block uppercase mb-1">Internal Notes</span>
                  <p className="text-slate-700 leading-relaxed font-medium">{viewItem.notes}</p>
                </div>
              )}

              {/* System Audit Information */}
              <div className="p-3 rounded-xl border border-slate-100 bg-slate-50/70 text-[11px] text-slate-500 flex flex-wrap items-center justify-between gap-2">
                <span>Created by: <strong className="text-slate-700">{viewItem.created_by || "Admin"}</strong></span>
                {viewItem.created_at && <span>Created on: <strong className="text-slate-700">{new Date(viewItem.created_at).toLocaleString()}</strong></span>}
                {viewItem.application_id && <span className="text-[10px] text-slate-400">App ID: #{viewItem.application_id}</span>}
              </div>

              <div className="flex justify-end pt-2 border-t border-slate-100">
                <Button 
                  variant="outline" 
                  onClick={() => setViewItem(null)}
                  className="px-5 py-2 text-xs font-bold rounded-xl"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
