import { useState, useMemo, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "@/config/api";
import { useAts, PIPELINE_STAGES } from "@/services/ats-store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Search,
  Plus,
  Filter,
  Download,
  Users,
  UserCheck,
  Calendar,
  CalendarCheck,
  CheckCircle2,
  UserMinus,
  ChevronRight,
  Eye,
  Pencil,
  MoreHorizontal,
  BellRing,
  CheckCircle,
  Clock,
  AlertCircle,
  Trophy,
  Trash2,
  LayoutGrid,
  List,
  Briefcase,
  Mail,
  Phone,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from "recharts";
import { STAGE_COLORS } from "@/types/ats-types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Helper components for the new layout
interface TopStatProps {
  title: string;
  value: number | string;
  pct: number;
  icon: React.ElementType;
  tone: string;
  pctTone: string;
  borderTone: string;
}

function TopStat({ title, value, pct, icon: Icon, tone, pctTone, borderTone }: TopStatProps) {
  return (
    <Card
      className={cn(
        "p-5 bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] rounded-3xl relative overflow-hidden group border-t-[3px] flex-1 min-w-[160px]",
        borderTone,
      )}
    >
      <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-gradient-to-br from-transparent to-black/[0.02] rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
      <div className="flex items-start justify-between relative z-10">
        <div>
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
            {title}
          </div>
          <div className="text-3xl font-black tracking-tight text-slate-900">{value}</div>
          <div className={cn("mt-1.5 text-[10px] font-bold", pctTone)}>+{pct}% this month</div>
        </div>
        <div
          className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl", tone)}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </Card>
  );
}

const QUICK_FILTERS = [
  "All",
  "New Applicant",
  "Shortlisted",
  "Interview Scheduled",
  "Interview Completed",
  "Offer Released",
  "Joined",
  "Rejected",
  "No Show",
  "Offer Declined",
  "On Hold",
  "Blacklisted",
];

export default function CandidatesPage() {
  const { candidates, remove } = useAts();
  const location = useLocation();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [stageFilter, setStageFilter] = useState("All Status");
  const [positionFilter, setPositionFilter] = useState("All Positions");
  const [sourceFilter, setSourceFilter] = useState("All Sources");
  const [recruiterFilter, setRecruiterFilter] = useState("All Recruiters");
  const [departmentFilter, setDepartmentFilter] = useState("All Departments");
  const [dateFilter, setDateFilter] = useState("All Time");
  const [experienceFilter, setExperienceFilter] = useState("All Experience");
  const [deleteCandidateId, setDeleteCandidateId] = useState<string | null>(null);

  const initialFilter = new URLSearchParams(location.search).get("filter") || "All";
  const [quickFilter, setQuickFilter] = useState(initialFilter);
  const [viewMode, setViewMode] = useState<"table" | "card">("table");
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const userStr = localStorage.getItem("cims_user");
    if (userStr) {
      try {
        setCurrentUser(JSON.parse(userStr));
      } catch (e) {}
    }
  }, []);

  const hasAccess = (moduleName: string, action: string = 'can_view') => {
    if (currentUser?.role_name === 'Administrator') return true;
    if (currentUser?.permissions) {
      const p = currentUser.permissions.find((p: any) => p.module_name === moduleName);
      if (p) return p[action] === 1 || p[action] === "1" || p[action] === true;
    }
    return false;
  };

  useEffect(() => {
    const filter = new URLSearchParams(location.search).get("filter");
    if (filter) {
      setQuickFilter(filter);
    }
  }, [location.search]);

  const [page, setPage] = useState(1);
  const perPage = 12;

  // Real data calculations
  const analytics = useMemo(() => {
    let active = 0,
      intSched = 0,
      offers = 0,
      joined = 0,
      rejected = 0;
    let newApp = 0,
      shortlisted = 0,
      others = 0,
      blacklisted = 0;

    // For Top Recruiters
    const recruiters: Record<string, number> = {};

    candidates.forEach((c) => {
      const s = c.stage || "New Applicant";
      if (
        !["Rejected", "Offer Declined", "No Show", "Offer Expired"].includes(s) &&
        !c.isBlacklisted
      ) {
        active++;
      }
      if (s.includes("Interview")) intSched++;
      if (s.includes("Offer")) offers++;
      if (s === "Joined") joined++;
      if (s === "Rejected" || s === "No Show" || s === "Offer Declined" || c.isBlacklisted)
        rejected++;
      if (s === "New Applicant") newApp++;
      if (s === "Shortlisted") shortlisted++;

      if (
        ![
          "New Applicant",
          "Interview Scheduled",
          "Interview Completed",
          "Shortlisted",
          "Offer Released",
          "Joined",
        ].includes(s)
      ) {
        others++;
      }

      if (c.isBlacklisted) blacklisted++;

      if (c.recruiter) {
        recruiters[c.recruiter] = (recruiters[c.recruiter] || 0) + 1;
      }
    });

    const total = candidates.length || 1;
    const donutData = [
      { name: "New", value: newApp, color: "#3b82f6", pct: ((newApp / total) * 100).toFixed(1) },
      {
        name: "Interview",
        value: intSched,
        color: "#f59e0b",
        pct: ((intSched / total) * 100).toFixed(1),
      },
      {
        name: "Shortlisted",
        value: shortlisted,
        color: "#8b5cf6",
        pct: ((shortlisted / total) * 100).toFixed(1),
      },
      {
        name: "Offered",
        value: offers,
        color: "#f43f5e", // Rose
        pct: ((offers / total) * 100).toFixed(1),
      },
      { name: "Joined", value: joined, color: "#10b981", pct: ((joined / total) * 100).toFixed(1) },
      { name: "Others", value: others, color: "#ec4899", pct: ((others / total) * 100).toFixed(1) }, // Vibrant Pink instead of gray
    ];

    const sortedRecruiters = Object.entries(recruiters)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name, count]) => ({ name, count }));

    return {
      total: candidates.length,
      active,
      intSched,
      offers,
      joined,
      rejected,
      donutData,
      blacklisted,
      sortedRecruiters,
    };
  }, [candidates]);

  const [sortOrder, setSortOrder] = useState("newest");

  const filtered = useMemo(() => {
    let result = candidates.filter((c) => {
      let matchQ = true;
      if (q && q.trim().length > 0) {
        const query = q.toLowerCase();
        matchQ =
          (c.name || "").toLowerCase().includes(query) ||
          (c.role || "").toLowerCase().includes(query) ||
          (c.email || "").toLowerCase().includes(query);
      }

      const matchQuick =
        quickFilter === "Blacklisted"
          ? c.isBlacklisted
          : (quickFilter === "All"
              ? !c.isBlacklisted
              : c.stage === quickFilter && !c.isBlacklisted);
      const matchStage = !stageFilter || stageFilter === "All Status" || c.stage === stageFilter;
      const matchPosition =
        !positionFilter || positionFilter === "All Positions" || c.role === positionFilter;
      const matchSource =
        !sourceFilter || sourceFilter === "All Sources" || c.source === sourceFilter;
      const matchRecruiter =
        !recruiterFilter || recruiterFilter === "All Recruiters" || c.recruiter === recruiterFilter;
      const matchDepartment =
        !departmentFilter || departmentFilter === "All Departments" || c.department === departmentFilter;

      const matchDate = (() => {
        if (!dateFilter || dateFilter === "All Time") return true;
        const cDate = new Date(c.createdAt || c.appliedAt || 0).getTime();
        const now = new Date().getTime();
        if (dateFilter === "Today") {
          return (now - cDate) < 24 * 60 * 60 * 1000;
        } else if (dateFilter === "Last 7 Days") {
          return (now - cDate) < 7 * 24 * 60 * 60 * 1000;
        } else if (dateFilter === "This Month") {
          return (now - cDate) < 30 * 24 * 60 * 60 * 1000;
        }
        return true;
      })();

      const matchExperience = (() => {
        if (!experienceFilter || experienceFilter === "All Experience") return true;
        const exp = c.experience || "";
        return exp.includes(experienceFilter) || exp.replace(" Years Years", " Years").replace("Fresher Years", "Fresher") === experienceFilter;
      })();

      return matchQ && matchQuick && matchStage && matchPosition && matchSource && matchRecruiter && matchDepartment && matchDate && matchExperience;
    });

    result.sort((a, b) => {
      // Prioritize createdAt so that brand new insertions show up top
      // Fallback to appliedAt or 0
      const dateA = new Date(a.createdAt || a.appliedAt || 0).getTime();
      const dateB = new Date(b.createdAt || b.appliedAt || 0).getTime();
      if (sortOrder === "newest") {
        return dateB - dateA;
      } else {
        return dateA - dateB;
      }
    });

    return result;
  }, [candidates, q, quickFilter, stageFilter, positionFilter, sourceFilter, recruiterFilter, departmentFilter, dateFilter, experienceFilter, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * perPage, safePage * perPage);

  const resetFilters = () => {
    setQ("");
    setStageFilter("All Status");
    setPositionFilter("All Positions");
    setSourceFilter("All Sources");
    setRecruiterFilter("All Recruiters");
    setDepartmentFilter("All Departments");
    setDateFilter("All Time");
    setExperienceFilter("All Experience");
    setQuickFilter("All");
  };

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  // Extract unique filter options
  const uniquePositions = Array.from(new Set(candidates.map((c) => c.role))).filter(Boolean);
  const uniqueSources = Array.from(new Set(candidates.map((c) => c.source))).filter(Boolean);
  const uniqueRecruiters = Array.from(new Set(candidates.map((c) => c.recruiter))).filter(Boolean);
  const uniqueDepartments = Array.from(new Set(candidates.map((c) => c.department))).filter(Boolean);

  return (
    <div className="space-y-6">
      {/* Top Banner (Dark Teal / Cyan Gradient) */}
      <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-r from-[#000C22] via-[#0B2524] to-[#0D2823] shadow-lg border border-teal-900/40 p-8 sm:p-10 text-white flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6">
        <div className="relative z-10 flex flex-col justify-center max-w-xl">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-2 text-white">Candidates</h1>
          <p className="text-[#60C042] text-[14px] sm:text-[15px] font-medium leading-relaxed">
            Manage and track all candidate profiles, resumes, and hiring stages across the pipeline.
          </p>
        </div>
        <div className="relative z-10 flex flex-wrap items-center gap-4 self-stretch xl:self-auto justify-between xl:justify-end">
          <div className="relative w-full sm:w-[280px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-teal-300/70" />
            <Input
              placeholder="Search candidates by name, email..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="pl-10 h-11 w-full bg-white/10 text-[13px] text-white placeholder:text-teal-200/60 rounded-xl border border-white/20 focus-visible:bg-white/15 focus-visible:ring-1 focus-visible:ring-teal-400 transition-all shadow-sm"
            />
          </div>
          {hasAccess("Candidates", "can_view") && (
            <Button
              variant="outline"
              onClick={() => {}}
              className="h-11 px-4 text-[13px] font-bold bg-white/10 text-white border-white/20 hover:bg-white/20 transition-all rounded-xl shadow-sm"
            >
              <Download className="mr-1.5 h-4 w-4" /> Export
            </Button>
          )}
          {hasAccess("Candidates", "can_add") && (
            <Button
              asChild
              className="h-11 px-5 text-[13px] font-bold btn-primary hover:opacity-95 text-white transition-all rounded-xl shadow-md"
            >
              <Link to="/candidates/new">
                <Plus className="mr-1.5 h-4 w-4" /> Add Candidate
              </Link>
            </Button>
          )}
          <div className="shrink-0 group cursor-pointer hidden sm:block">
            <span className="text-7xl drop-shadow-2xl inline-block origin-bottom hover:animate-bounce cursor-default select-none">
              👥
            </span>
          </div>
        </div>
      </div>

      {/* Top Stats */}
      <div className="flex flex-wrap gap-4">
        <TopStat
          title="Total Candidates"
          value={analytics.total}
          pct={12}
          icon={Users}
          tone="bg-blue-50 text-blue-600"
          pctTone="text-emerald-500"
          borderTone="border-blue-500"
        />
        {/* <TopStat
          title="Active Candidates"
          value={analytics.active}
          pct={8}
          icon={UserCheck}
          tone="bg-teal-50 text-teal-600"
          pctTone="text-emerald-500"
          borderTone="border-teal-500"
        /> */}
        <TopStat
          title="Interview Scheduled"
          value={analytics.intSched}
          pct={15}
          icon={Calendar}
          tone="bg-orange-50 text-orange-500"
          pctTone="text-emerald-500"
          borderTone="border-orange-500"
        />
        <TopStat
          title="Offers Released"
          value={analytics.offers}
          pct={6}
          icon={CalendarCheck}
          tone="bg-amber-50 text-amber-600"
          pctTone="text-emerald-500"
          borderTone="border-amber-500"
        />
        <TopStat
          title="Joined"
          value={analytics.joined}
          pct={10}
          icon={CheckCircle2}
          tone="bg-emerald-50 text-emerald-600"
          pctTone="text-emerald-500"
          borderTone="border-emerald-500"
        />
        <TopStat
          title="Rejected / Others"
          value={analytics.rejected}
          pct={5}
          icon={UserMinus}
          tone="bg-red-50 text-red-500"
          pctTone="text-emerald-500"
          borderTone="border-red-500"
        />
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col gap-6 items-start w-full">
        {/* Left Side: Filters + Table */}
        <div className="w-full space-y-4">
          {/* Filter Bar */}
          <Card className="p-3 bg-white border-border/50 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] rounded-3xl">
            <div className="flex flex-wrap gap-3 items-center">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <Input
                  placeholder="Search by name, email, phone..."
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  className="pl-9 h-9 text-xs bg-slate-50 border-slate-200 rounded-lg"
                />
              </div>

              <select
                className="h-9 w-[130px] rounded-lg border border-slate-200 bg-white px-3 text-xs shadow-sm font-semibold text-slate-700"
                value={stageFilter}
                onChange={(e) => setStageFilter(e.target.value)}
              >
                <option value="All Status">All Status</option>
                {PIPELINE_STAGES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>

              <select
                className="h-9 w-[130px] rounded-lg border border-slate-200 bg-white px-3 text-xs shadow-sm font-semibold text-slate-700"
                value={positionFilter}
                onChange={(e) => setPositionFilter(e.target.value)}
              >
                <option value="All Positions">All Positions</option>
                {uniquePositions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>

              <select
                className="h-9 w-[130px] rounded-lg border border-slate-200 bg-white px-3 text-xs shadow-sm font-semibold text-slate-700"
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
              >
                <option value="All Sources">All Sources</option>
                {uniqueSources.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>

              <select
                className="h-9 w-[130px] rounded-lg border border-slate-200 bg-white px-3 text-xs shadow-sm font-semibold text-slate-700"
                value={recruiterFilter}
                onChange={(e) => setRecruiterFilter(e.target.value)}
              >
                <option value="All Recruiters">All Recruiters</option>
                {uniqueRecruiters.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>

              <select
                className="h-9 w-[130px] rounded-lg border border-slate-200 bg-white px-3 text-xs shadow-sm font-semibold text-slate-700"
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
              >
                <option value="All Departments">All Departments</option>
                {uniqueDepartments.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>

              <select
                className="h-9 w-[130px] rounded-lg border border-slate-200 bg-white px-3 text-xs shadow-sm font-semibold text-slate-700"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              >
                <option value="All Time">All Time</option>
                <option value="Today">Today</option>
                <option value="Last 7 Days">Last 7 Days</option>
                <option value="This Month">This Month</option>
              </select>

              <select
                className="h-9 w-[130px] rounded-lg border border-slate-200 bg-white px-3 text-xs shadow-sm font-semibold text-slate-700"
                value={experienceFilter}
                onChange={(e) => setExperienceFilter(e.target.value)}
              >
                <option value="All Experience">All Experience</option>
                <option value="Fresher">Fresher</option>
                <option value="1-2 Years">1-2 Years</option>
                <option value="2-4 Years">2-4 Years</option>
                <option value="4-6 Years">4-6 Years</option>
                <option value="6-8 Years">6-8 Years</option>
                <option value="8-10 Years">8-10 Years</option>
                <option value="10+ Years">10+ Years</option>
              </select>


              <Button
                variant="ghost"
                onClick={resetFilters}
                className="h-9 text-xs font-bold text-slate-600"
              >
                Reset
              </Button>
            </div>

            {/* Quick Filter Pills */}
            <div className="flex flex-wrap gap-2 mt-4 pb-1 border-t border-slate-100 pt-3">
              {QUICK_FILTERS.map((f) => (
                <button
                  key={f}
                  onClick={() => setQuickFilter(f)}
                  className={cn(
                    "px-4 py-1.5 rounded-full text-[11px] font-bold transition-all shadow-sm",
                    quickFilter === f
                      ? "bg-gradient-to-r from-[#42bc24] to-[#36961c] text-white shadow-[#42bc24]/20"
                      : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60",
                  )}
                >
                  {f}
                </button>
              ))}
            </div>
          </Card>

          {/* Table Area */}
          <Card className="bg-white border-border/50 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] rounded-3xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <h2 className="text-[14px] font-bold text-slate-900">
                All Candidates{" "}
                <span className="text-slate-500 font-medium">({filtered.length})</span>
              </h2>
              <div className="flex items-center gap-3">
                <select 
                  className="text-xs border border-slate-200 rounded-lg h-8 px-2 font-semibold text-slate-700 bg-white"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                >
                  <option value="newest">Sort by: Newest First</option>
                  <option value="oldest">Sort by: Oldest First</option>
                </select>
                <div className="flex bg-slate-100 rounded-lg p-0.5">
                  <button 
                    onClick={() => setViewMode("table")}
                    className={cn("p-1.5 rounded shadow-sm transition-colors", viewMode === "table" ? "bg-white text-blue-600 shadow-sm ring-1 ring-slate-200/50" : "text-slate-500 hover:text-slate-700")}
                    title="Table View"
                  >
                    <List className="h-3.5 w-3.5" />
                  </button>
                  <button 
                    onClick={() => setViewMode("card")}
                    className={cn("p-1.5 rounded shadow-sm transition-colors", viewMode === "card" ? "bg-white text-blue-600 shadow-sm ring-1 ring-slate-200/50" : "text-slate-500 hover:text-slate-700")}
                    title="Card View"
                  >
                    <LayoutGrid className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {viewMode === "table" ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[11px]">
                  <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-100">
                    <tr>
                      <th className="px-4 py-3 font-bold">Candidate</th>
                      <th className="px-4 py-3 font-bold">Position</th>
                      <th className="px-4 py-3 font-bold">Status</th>
                      <th className="px-4 py-3 font-bold">Experience</th>
                      <th className="px-4 py-3 font-bold">Current Company</th>
                      <th className="px-4 py-3 font-bold">Applied On</th>
                      <th className="px-4 py-3 font-bold">Recruiter</th>
                      <th className="px-4 py-3 font-bold text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paginated.map((c) => (
                      <tr 
                        key={c.id} 
                        className="hover:bg-slate-50 transition-colors cursor-pointer"
                        onClick={() => navigate(`/candidates/${c.id}`)}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            {c.photo ? (
                              <img
                                src={`${API_BASE_URL}/../uploads/candidates/photos/${c.photo}`}
                                alt={c.name}
                                className="h-8 w-8 rounded-full object-cover shadow-sm border border-slate-200 shrink-0"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                  (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                                }}
                              />
                            ) : null}
                            <div
                              className={cn(
                                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-bold text-[10px]",
                                c.isBlacklisted
                                  ? "bg-red-100 text-red-600"
                                  : "bg-purple-100 text-purple-600",
                                c.photo ? "hidden" : ""
                              )}
                            >
                              {getInitials(c.name)}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 text-[12px] hover:text-blue-600 cursor-pointer">
                                {c.name}
                              </div>
                              <div className="text-slate-500 text-[10px] mt-0.5">{c.email}</div>
                              <div className="text-slate-500 text-[10px]">{c.phone}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-bold text-slate-700">{c.role}</div>
                          <div className="text-slate-500 text-[10px]">{c.department}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 font-bold",
                              STAGE_COLORS[c.stage] || "bg-slate-100 text-slate-700",
                            )}
                          >
                            <div className="h-1.5 w-1.5 rounded-full bg-current opacity-75" />
                            {c.stage}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-700">
                          {c.experience ? c.experience.replace(" Years Years", " Years").replace("Fresher Years", "Fresher") : "—"}
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-700">
                          {c.currentCompany || "—"}
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-700">
                          {new Date(c.appliedAt).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                        <td className="px-4 py-3">
                          {c.recruiter ? (
                            <span className="font-medium text-slate-700">{c.recruiter}</span>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-slate-400 hover:text-blue-600"
                              asChild
                            >
                              <Link to={`/candidates/${c.id}`}>
                                <Eye className="h-3.5 w-3.5" />
                              </Link>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-slate-400 hover:text-blue-600"
                              asChild
                            >
                              <Link to={`/candidates/${c.id}/edit`}>
                                <Pencil className="h-3.5 w-3.5" />
                              </Link>
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-slate-400 hover:text-blue-600"
                                >
                                  <MoreHorizontal className="h-3.5 w-3.5" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                align="end"
                                className="rounded-xl border-border/40"
                              >
                                <DropdownMenuItem asChild>
                                  <Link to={`/candidates/${c.id}`}>View Details</Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <Link to={`/candidates/${c.id}/edit`}>Edit</Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-destructive focus:text-destructive"
                                  onClick={() => setDeleteCandidateId(c.id)}
                                >
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {paginated.length === 0 && (
                      <tr>
                        <td colSpan={8} className="py-10 text-center text-slate-500 font-medium">
                          No candidates match your filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 bg-slate-50/50">
                {paginated.map((c) => (
                  <Card key={c.id} className="group relative overflow-hidden bg-white hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-all duration-300 border-border/50 rounded-2xl cursor-pointer flex flex-col" onClick={() => navigate(`/candidates/${c.id}`)}>
                    <div className="p-5 flex-1 flex flex-col">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3 overflow-hidden">
                          {c.photo ? (
                            <img src={`${API_BASE_URL}/../uploads/candidates/photos/${c.photo}`} alt={c.name} className="h-10 w-10 rounded-full object-cover shadow-sm border border-slate-200 shrink-0" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden'); }} />
                          ) : null}
                          <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-bold text-[11px]", c.isBlacklisted ? "bg-red-100 text-red-600" : "bg-purple-100 text-purple-600", c.photo ? "hidden" : "")}>
                            {getInitials(c.name)}
                          </div>
                          <div className="overflow-hidden">
                            <h3 className="font-bold text-slate-900 text-[14px] group-hover:text-blue-600 transition-colors truncate">{c.name}</h3>
                            <div className="text-slate-500 text-[11px] font-medium mt-0.5 truncate">{c.role}</div>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-slate-600 -mr-2 -mt-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="rounded-xl border-border/40">
                            <DropdownMenuItem asChild><Link to={`/candidates/${c.id}`}>View Details</Link></DropdownMenuItem>
                            <DropdownMenuItem asChild><Link to={`/candidates/${c.id}/edit`}>Edit</Link></DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={(e) => { e.stopPropagation(); setDeleteCandidateId(c.id); }}>Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      
                      <div className="space-y-2.5 mb-5 flex-1">
                        <div className="flex items-center text-[11px] text-slate-600">
                          <Briefcase className="h-3.5 w-3.5 mr-2.5 text-slate-400 shrink-0" />
                          <span className="truncate font-medium">{c.currentCompany || "No Company"} <span className="text-slate-400 font-normal">({c.experience ? c.experience.replace(" Years Years", " Years").replace("Fresher Years", "Fresher") : "Fresher"})</span></span>
                        </div>
                        <div className="flex items-center text-[11px] text-slate-600">
                          <Mail className="h-3.5 w-3.5 mr-2.5 text-slate-400 shrink-0" />
                          <span className="truncate font-medium">{c.email}</span>
                        </div>
                        <div className="flex items-center text-[11px] text-slate-600">
                          <Phone className="h-3.5 w-3.5 mr-2.5 text-slate-400 shrink-0" />
                          <span className="font-medium">{c.phone || "No Phone"}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100/80">
                        <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 font-bold text-[9px] uppercase tracking-wider", STAGE_COLORS[c.stage] || "bg-slate-100 text-slate-700")}>
                          <div className="h-1.5 w-1.5 rounded-full bg-current opacity-75" />
                          {c.stage}
                        </span>
                        <div className="text-[10px] font-bold text-slate-400">
                          {new Date(c.appliedAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
                {paginated.length === 0 && (
                  <div className="col-span-full py-12 text-center text-slate-500 font-medium bg-white rounded-2xl border border-dashed border-slate-200">
                    No candidates match your filters.
                  </div>
                )}
              </div>
            )}

            {/* Pagination Footer */}
            <div className="flex items-center justify-between p-4 border-t border-slate-100 bg-white">
              <div className="text-[11px] font-medium text-slate-500">
                Showing {Math.min(filtered.length, (safePage - 1) * perPage + 1)} to{" "}
                {Math.min(filtered.length, safePage * perPage)} of {filtered.length} candidates
              </div>
              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-xl border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronRight className="h-3.5 w-3.5 rotate-180" />
                </Button>
                {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    size="icon"
                    className={cn(
                      "h-8 w-8 rounded-xl text-xs font-black transition-all",
                      page === i + 1 
                        ? "bg-gradient-to-br from-[#42bc24] to-[#36961c] text-white border-transparent shadow-md shadow-[#42bc24]/30 hover:brightness-105" 
                        : "border-slate-200 text-slate-600 hover:bg-slate-100",
                    )}
                    onClick={() => setPage(i + 1)}
                  >
                    {i + 1}
                  </Button>
                ))}
                {totalPages > 5 && (
                  <>
                    <span className="text-xs text-slate-400 px-1 font-bold">...</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className={cn(
                        "h-8 w-8 rounded-xl text-xs font-black transition-all",
                        page === totalPages 
                          ? "bg-gradient-to-br from-[#42bc24] to-[#36961c] text-white border-transparent shadow-md shadow-[#42bc24]/30" 
                          : "border-slate-200 text-slate-600 hover:bg-slate-100"
                      )}
                      onClick={() => setPage(totalPages)}
                    >
                      {totalPages}
                    </Button>
                  </>
                )}
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-xl border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </Card>
        </div>


      </div>

      <AlertDialog open={deleteCandidateId !== null} onOpenChange={(open) => !open && setDeleteCandidateId(null)}>
        <AlertDialogContent className="bg-white border-0 shadow-2xl rounded-2xl max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-500" /> Delete Candidate
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500 font-medium text-[13px] pt-2">
              Are you sure you want to permanently delete this candidate? This action is not recoverable.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel className="text-[11px] font-bold border-slate-200">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold"
              onClick={() => {
                if (deleteCandidateId) {
                  remove([deleteCandidateId]);
                }
                setDeleteCandidateId(null);
              }}
            >
              Delete Candidate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
