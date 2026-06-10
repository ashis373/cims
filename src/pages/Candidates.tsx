import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useAts, PIPELINE_STAGES } from "@/lib/ats-store";
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from "recharts";
import { STAGE_COLORS } from "@/lib/ats-types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Helper components for the new layout
function TopStat({ title, value, pct, icon: Icon, tone, pctTone, borderTone }: any) {
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
];

export default function CandidatesPage() {
  const { candidates, remove } = useAts();
  const [q, setQ] = useState("");
  const [stageFilter, setStageFilter] = useState("All Status");
  const [positionFilter, setPositionFilter] = useState("All Positions");
  const [sourceFilter, setSourceFilter] = useState("All Sources");
  const [recruiterFilter, setRecruiterFilter] = useState("All Recruiters");
  const [quickFilter, setQuickFilter] = useState("All");

  const [page, setPage] = useState(1);
  const perPage = 7;

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
      const s = c.stage;
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
        color: "#ef4444",
        pct: ((offers / total) * 100).toFixed(1),
      },
      { name: "Joined", value: joined, color: "#10b981", pct: ((joined / total) * 100).toFixed(1) },
      { name: "Others", value: others, color: "#e2e8f0", pct: ((others / total) * 100).toFixed(1) },
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

  const filtered = useMemo(() => {
    return candidates.filter((c) => {
      let matchQ = true;
      if (q && q.trim().length > 0) {
        const query = q.toLowerCase();
        matchQ =
          (c.name || "").toLowerCase().includes(query) ||
          (c.role || "").toLowerCase().includes(query) ||
          (c.email || "").toLowerCase().includes(query);
      }

      const matchQuick = quickFilter === "All" || c.stage === quickFilter;
      const matchStage = !stageFilter || stageFilter === "All Status" || c.stage === stageFilter;
      const matchPosition =
        !positionFilter || positionFilter === "All Positions" || c.role === positionFilter;
      const matchSource =
        !sourceFilter || sourceFilter === "All Sources" || c.source === sourceFilter;
      const matchRecruiter =
        !recruiterFilter || recruiterFilter === "All Recruiters" || c.recruiter === recruiterFilter;

      return matchQ && matchQuick && matchStage && matchPosition && matchSource && matchRecruiter;
    });
  }, [candidates, q, quickFilter, stageFilter, positionFilter, sourceFilter, recruiterFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * perPage, safePage * perPage);

  const resetFilters = () => {
    setQ("");
    setStageFilter("All Status");
    setPositionFilter("All Positions");
    setSourceFilter("All Sources");
    setRecruiterFilter("All Recruiters");
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Candidates</h1>
          <p className="text-[13px] text-slate-500 mt-1">
            Manage and track all candidate applications
          </p>
        </div>
        <div className="flex-1 max-w-xl mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search candidates by name, email, phone, skills..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="pl-9 h-10 w-full text-sm bg-white border-slate-200 shadow-sm rounded-xl"
            />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="h-10 text-sm bg-white shadow-sm border-slate-200 text-slate-700 font-semibold rounded-xl"
          >
            <Download className="mr-2 h-4 w-4" /> Export
          </Button>
          <Button
            asChild
            className="h-10 text-sm bg-blue-600 hover:bg-blue-700 text-white shadow-sm font-semibold rounded-xl"
          >
            <Link to="/candidates/new">
              <Plus className="mr-1.5 h-4 w-4" /> Add Candidate
            </Link>
          </Button>
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
        <TopStat
          title="Active Candidates"
          value={analytics.active}
          pct={8}
          icon={UserCheck}
          tone="bg-teal-50 text-teal-600"
          pctTone="text-emerald-500"
          borderTone="border-teal-500"
        />
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
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left Side: Filters + Table */}
        <div className="lg:col-span-3 space-y-4">
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

              <Button
                variant="outline"
                className="h-9 text-xs font-semibold rounded-lg bg-white border-slate-200"
              >
                <Filter className="mr-1.5 h-3.5 w-3.5" /> More Filters
              </Button>
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
                    "px-4 py-1.5 rounded-full text-[11px] font-bold transition-colors",
                    quickFilter === f
                      ? "bg-blue-600 text-white"
                      : "bg-slate-50 text-slate-600 hover:bg-slate-100",
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
                <select className="text-xs border border-slate-200 rounded-lg h-8 px-2 font-semibold text-slate-700 bg-white">
                  <option>Sort by: Newest First</option>
                  <option>Sort by: Oldest First</option>
                </select>
                <div className="flex bg-slate-100 rounded-lg p-0.5">
                  <button className="p-1.5 bg-blue-600 text-white rounded shadow-sm">
                    <Filter className="h-3.5 w-3.5" />
                  </button>
                  <button className="p-1.5 text-slate-500 hover:text-slate-700 rounded">
                    <Filter className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-[11px]">
                <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-100">
                  <tr>
                    <th className="px-4 py-3 w-10 text-center">
                      <input type="checkbox" className="rounded border-slate-300" />
                    </th>
                    <th className="px-4 py-3 font-bold">Candidate</th>
                    <th className="px-4 py-3 font-bold">Position</th>
                    <th className="px-4 py-3 font-bold">Status</th>
                    <th className="px-4 py-3 font-bold">Experience</th>
                    <th className="px-4 py-3 font-bold">Current Company</th>
                    <th className="px-4 py-3 font-bold">Applied On</th>
                    <th className="px-4 py-3 font-bold">Recruiter</th>
                    <th className="px-4 py-3 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginated.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 text-center">
                        <input type="checkbox" className="rounded border-slate-300" />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              "flex h-8 w-8 items-center justify-center rounded-full font-bold text-[10px]",
                              c.isBlacklisted
                                ? "bg-red-100 text-red-600"
                                : "bg-purple-100 text-purple-600",
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
                        {c.experience || "—"}
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
                          <div className="flex items-center gap-2">
                            <img
                              src={`https://api.dicebear.com/7.x/notionists/svg?seed=${c.recruiter}`}
                              alt=""
                              className="h-5 w-5 rounded-full bg-slate-100"
                            />
                            <span className="font-medium text-slate-700">{c.recruiter}</span>
                          </div>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
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
                                onClick={() => remove([c.id])}
                              >
                                Remove
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {paginated.length === 0 && (
                    <tr>
                      <td colSpan={9} className="py-10 text-center text-slate-500 font-medium">
                        No candidates match your filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div className="flex items-center justify-between p-4 border-t border-slate-100 bg-white">
              <div className="text-[11px] font-medium text-slate-500">
                Showing {Math.min(filtered.length, (safePage - 1) * perPage + 1)} to{" "}
                {Math.min(filtered.length, safePage * perPage)} of {filtered.length} candidates
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7 rounded border-slate-200"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronRight className="h-3.5 w-3.5 rotate-180" />
                </Button>
                {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => (
                  <Button
                    key={i}
                    variant={page === i + 1 ? "default" : "ghost"}
                    size="icon"
                    className={cn(
                      "h-7 w-7 rounded text-[11px] font-bold",
                      page === i + 1 ? "bg-blue-600 text-white" : "text-slate-600",
                    )}
                    onClick={() => setPage(i + 1)}
                  >
                    {i + 1}
                  </Button>
                ))}
                {totalPages > 5 && <span className="text-[11px] text-slate-400 px-1">...</span>}
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7 rounded border-slate-200 text-[11px] font-bold"
                >
                  {totalPages}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7 rounded border-slate-200"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats Donut */}
          <Card className="p-5 bg-white border-border/50 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] rounded-3xl">
            <h3 className="text-[13px] font-bold text-slate-900 mb-4">Quick Stats</h3>
            <div className="flex items-center gap-4">
              <div className="relative h-[120px] w-[120px] shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analytics.donutData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={55}
                      paddingAngle={2}
                      dataKey="value"
                      stroke="none"
                    >
                      {analytics.donutData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-[16px] font-bold text-slate-900">{analytics.total}</span>
                  <span className="text-[8px] font-bold text-slate-500 uppercase tracking-wider">
                    Total
                  </span>
                </div>
              </div>
              <div className="flex-1 space-y-1.5">
                {analytics.donutData.map((item) => (
                  <div key={item.name} className="flex items-center gap-1.5 text-[9px] font-bold">
                    <span
                      className="h-1.5 w-1.5 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-slate-600 flex-1">{item.name}</span>
                    <span className="text-slate-400">
                      {item.value} ({item.pct}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Alerts & Notifications */}
          <Card className="p-5 bg-white border-border/50 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] rounded-3xl">
            <h3 className="text-[13px] font-bold text-slate-900 mb-4">Alerts & Notifications</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-red-50/50 border border-red-100 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="bg-red-100 text-red-500 p-1.5 rounded-lg">
                    <AlertCircle className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-slate-900">
                      {analytics.blacklisted} Candidates
                    </div>
                    <div className="text-[10px] font-medium text-slate-500">are blacklisted</div>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-400" />
              </div>

              <div className="flex items-center justify-between p-3 bg-orange-50/50 border border-orange-100 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="bg-orange-100 text-orange-500 p-1.5 rounded-lg">
                    <CalendarCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-slate-900">
                      {analytics.intSched} Interviews
                    </div>
                    <div className="text-[10px] font-medium text-slate-500">scheduled today</div>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-400" />
              </div>

              <div className="flex items-center justify-between p-3 bg-blue-50/50 border border-blue-100 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 text-blue-500 p-1.5 rounded-lg">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-slate-900">
                      {analytics.offers} Offers
                    </div>
                    <div className="text-[10px] font-medium text-slate-500">awaiting response</div>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-400" />
              </div>

              <div className="flex items-center justify-between p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="bg-emerald-100 text-emerald-500 p-1.5 rounded-lg">
                    <CheckCircle className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-slate-900">
                      {analytics.joined} Candidates
                    </div>
                    <div className="text-[10px] font-medium text-slate-500">joined this month</div>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-400" />
              </div>
            </div>
          </Card>

          {/* Top Recruiters */}
          <Card className="p-5 bg-white border-border/50 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] rounded-3xl">
            <h3 className="text-[13px] font-bold text-slate-900 mb-4">Top Recruiters</h3>
            <div className="space-y-4">
              {analytics.sortedRecruiters.map((r, i) => (
                <div key={r.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={`https://api.dicebear.com/7.x/notionists/svg?seed=${r.name}`}
                      alt=""
                      className="h-8 w-8 rounded-full bg-slate-100"
                    />
                    <div>
                      <div className="text-[11px] font-bold text-slate-900">{r.name}</div>
                      <div className="text-[10px] font-medium text-slate-500">
                        {r.count} Candidates
                      </div>
                    </div>
                  </div>
                  <Trophy
                    className={cn(
                      "h-4 w-4",
                      i === 0 ? "text-yellow-500" : i === 1 ? "text-slate-400" : "text-amber-700",
                    )}
                  />
                </div>
              ))}
              {analytics.sortedRecruiters.length === 0 && (
                <div className="text-[11px] text-slate-500">No recruiters assigned yet.</div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
