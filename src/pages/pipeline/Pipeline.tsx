import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useAts } from "@/services/ats-store";
import { KanbanBoard } from "@/components/feature/KanbanBoard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Search,
  Undo2,
  Filter,
  LayoutGrid,
  Plus,
  Users,
  Activity,
  CalendarCheck,
  CalendarDays,
  Trophy,
  ArrowUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

interface StatProps {
  label: string;
  value: number | string;
  icon: React.ElementType;
  theme: 'blue' | 'emerald' | 'purple' | 'amber' | 'cyan' | 'rose' | 'teal' | 'zinc' | 'orange';
  percent?: number;
  trendLabel?: string;
}

function Stat({ label, value, icon: Icon, theme, percent, trendLabel }: StatProps) {
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
          {label}
        </div>
        <div className={cn("p-1.5 rounded-lg shrink-0 shadow-xs", styles.iconBg)}>
          <Icon className="w-3.5 h-3.5" />
        </div>
      </div>
      
      <div className="mt-auto relative z-10 pt-1">
        <div className="text-2xl font-black tracking-tight text-slate-900 leading-none mb-1.5">
          {value}
        </div>
        {percent !== undefined ? (
          <div className="flex items-center gap-1.5 text-[9.5px] font-bold text-slate-400">
            <span className={cn("inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded font-bold", styles.trendText)}>
              <ArrowUp className="w-2.5 h-2.5" /> +{percent}%
            </span>
            <span className="text-slate-400 font-medium truncate">vs last month</span>
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



function Pipeline() {
  const { candidates, undo, canUndo } = useAts();
  const [search, setSearch] = useState("");

  const filtered = candidates.filter((c) => {
    const matchesSearch =
      (c.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (c.role || "").toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  const counts = useMemo(() => {
    const c = (s: string) => candidates.filter((x) => (x.stage || "") === s).length;
    const isInactive = (st: string) =>
      ["Rejected", "Offer Declined", "No Show", "Offer Expired"].includes(st);

    return {
      total: candidates.length,
      active: candidates.filter((x) => !isInactive(x.stage) && !x.isBlacklisted).length,
      scheduled: c("Interview Scheduled"),
      offersPending: c("Offer Released"),
      hired: c("Joined"),
    };
  }, [candidates]);

  const analytics = useMemo(() => {
    let newApp = 0,
      short = 0,
      intSched = 0,
      intComp = 0,
      offerRel = 0,
      other = 0;
    const skillCounts: Record<string, number> = {};
    const sourceCounts: Record<string, number> = {};

    candidates.forEach((c) => {
      if (c.stage === "New Applicant") newApp++;
      else if (c.stage === "Shortlisted") short++;
      else if (c.stage === "Interview Scheduled") intSched++;
      else if (c.stage === "Interview Completed") intComp++;
      else if (c.stage === "Offer Released") offerRel++;
      else other++;

      if (c.skills && c.skills.length > 0) {
        c.skills.forEach((s) => {
          skillCounts[s] = (skillCounts[s] || 0) + 1;
        });
      }

      if (c.source) {
        sourceCounts[c.source] = (sourceCounts[c.source] || 0) + 1;
      }
    });

    const total = candidates.length || 1;

    const overview = [
      {
        label: "New Applicant",
        value: newApp,
        pct: ((newApp / total) * 100).toFixed(1) + "%",
        color: "bg-blue-500",
        hex: "#3b82f6",
      },
      {
        label: "Shortlisted",
        value: short,
        pct: ((short / total) * 100).toFixed(1) + "%",
        color: "bg-emerald-500",
        hex: "#10b981",
      },
      {
        label: "Interview Scheduled",
        value: intSched,
        pct: ((intSched / total) * 100).toFixed(1) + "%",
        color: "bg-purple-500",
        hex: "#8b5cf6",
      },
      {
        label: "Interview Completed",
        value: intComp,
        pct: ((intComp / total) * 100).toFixed(1) + "%",
        color: "bg-amber-500",
        hex: "#f59e0b",
      },
      {
        label: "Offer Released",
        value: offerRel,
        pct: ((offerRel / total) * 100).toFixed(1) + "%",
        color: "bg-yellow-500",
        hex: "#eab308",
      },
      {
        label: "Other / Closed",
        value: other,
        pct: ((other / total) * 100).toFixed(1) + "%",
        color: "bg-slate-200",
        hex: "#e2e8f0",
      },
    ];

    const sortedSkills = Object.entries(skillCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([label, val]) => ({
        label,
        pct: Math.min(100, Math.round((val / total) * 100)),
        color: "bg-blue-600",
      }));

    const sortedSources = Object.entries(sourceCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([label, val], i) => {
        const colors = ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#eab308"];
        const bgColors = [
          "bg-blue-500",
          "bg-emerald-500",
          "bg-purple-500",
          "bg-amber-500",
          "bg-yellow-500",
        ];
        return {
          label,
          value: val,
          pct: Math.round((val / total) * 100) + "%",
          hex: colors[i % colors.length],
          color: bgColors[i % bgColors.length],
        };
      });

    const allActivity: (import("@/types/ats-types").ActivityEntry & {
      candidateName: string;
      time: number;
    })[] = [];
    candidates.forEach((c) => {
      if (c.activity) {
        c.activity.forEach((a) => {
          allActivity.push({
            ...a,
            candidateName: c.name,
            time: +new Date(a.at),
          });
        });
      }
    });
    allActivity.sort((a, b) => b.time - a.time);
    const recentActivity = allActivity.slice(0, 5).map((a) => {
      const diffMs = new Date().getTime() - a.time;
      const diffMins = Math.max(1, Math.round(diffMs / 60000));
      const diffHrs = Math.round(diffMins / 60);
      const diffDays = Math.round(diffHrs / 24);
      let timeStr = `${diffMins} min ago`;
      if (diffMins > 60 && diffHrs < 24) timeStr = `${diffHrs} hr ago`;
      else if (diffHrs >= 24) timeStr = `${diffDays} day ago`;

      let Icon = Users;
      let color = "text-blue-500 bg-blue-50 border-blue-100";
      if (a.message.toLowerCase().includes("interview")) {
        Icon = Activity;
        color = "text-indigo-500 bg-indigo-50 border-indigo-100";
      } else if (a.message.toLowerCase().includes("offer")) {
        Icon = Trophy;
        color = "text-amber-500 bg-amber-50 border-amber-100";
      } else if (a.message.toLowerCase().includes("joined")) {
        Icon = Users;
        color = "text-emerald-500 bg-emerald-50 border-emerald-100";
      }

      return {
        msg: `${a.candidateName} ${a.message.toLowerCase()}`,
        time: timeStr,
        icon: Icon,
        color,
      };
    });

    if (recentActivity.length === 0) {
      recentActivity.push({
        msg: "No recent activity",
        time: "Just now",
        icon: Activity,
        color: "text-slate-500 bg-slate-50 border-slate-100",
      });
    }

    const hired = candidates.filter((c) => c.stage === "Joined");
    let avgHireTime = 18;
    if (hired.length > 0) {
      const times = hired.map((c) =>
        Math.max(1, (+new Date(c.updatedAt) - +new Date(c.appliedAt)) / (1000 * 3600 * 24)),
      );
      avgHireTime = Math.round(times.reduce((a, b) => a + b, 0) / hired.length);
    }

    const interviews = candidates.filter((c) => (c.stage || "").includes("Interview")).length;
    const offers = candidates.filter((c) => (c.stage || "").includes("Offer")).length;
    const intToOffer = interviews > 0 ? Math.round((offers / interviews) * 100) : 0;

    const joins = hired.length;
    const offerToJoin = offers > 0 ? Math.round((joins / offers) * 100) : 0;

    const rejects = candidates.filter((c) =>
      ["Rejected", "Offer Declined", "No Show"].includes(c.stage),
    ).length;
    const dropOff = total > 0 ? Math.round((rejects / total) * 100) : 0;

    // Generate real velocity data based on applications over the last 14 days
    const velocityMap: Record<string, number> = {};
    const today = new Date();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString("en-GB", { month: "short", day: "numeric" });
      velocityMap[dateStr] = 0;
    }

    candidates.forEach((c) => {
      if (c.appliedAt) {
        const d = new Date(c.appliedAt).toLocaleDateString("en-GB", { month: "short", day: "numeric" });
        if (velocityMap[d] !== undefined) {
          velocityMap[d]++;
        }
      }
    });

    let cumulative = 0;
    const velocityData = Object.keys(velocityMap).map((date) => {
      cumulative += velocityMap[date];
      return { date, value: cumulative };
    });

    return {
      overview,
      topSkills:
        sortedSkills.length > 0
          ? sortedSkills
          : [{ label: "No Data", pct: 0, color: "bg-slate-200" }],
      sortedSources:
        sortedSources.length > 0
          ? sortedSources
          : [{ label: "No Data", value: 1, pct: "0%", hex: "#e2e8f0", color: "bg-slate-200" }],
      recentActivity,
      velocityData,
      stats: {
        avgHireTime: avgHireTime + " Days",
        intToOffer: intToOffer + "%",
        offerToJoin: offerToJoin + "%",
        dropOff: dropOff + "%",
      },
    };
  }, [candidates]);

  return (
    <div className="space-y-6">
      {/* Top Banner (Dark Teal / Cyan Gradient) */}
      <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-r from-[#000C22] via-[#0B2524] to-[#0D2823] shadow-lg border border-teal-900/40 p-8 sm:p-10 text-white flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6">
        <div className="relative z-10 flex flex-col justify-center max-w-xl">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-2 text-white">Pipeline</h1>
          <p className="text-[#60C042] text-[14px] sm:text-[15px] font-medium leading-relaxed">
            Drag cards between columns to update stage and streamline recruitment flow.
          </p>
        </div>
        <div className="relative z-10 flex flex-wrap items-center gap-4 self-stretch xl:self-auto justify-between xl:justify-end">
          <div className="relative w-full sm:w-[280px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-teal-300/70" />
            <Input
              placeholder="Search candidates..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-11 w-full bg-white/10 text-[13px] text-white placeholder:text-teal-200/60 rounded-xl border border-white/20 focus-visible:bg-white/15 focus-visible:ring-1 focus-visible:ring-teal-400 transition-all shadow-sm"
            />
          </div>
          <Button
            asChild
            className="h-11 px-5 text-[13px] font-bold btn-primary hover:opacity-95 text-white transition-all rounded-xl shadow-md"
          >
            <Link to="/candidates/new">
              <Plus className="mr-1.5 h-4 w-4" /> Add Candidate
            </Link>
          </Button>
          <div className="shrink-0 group cursor-pointer hidden sm:block">
            <span className="text-7xl drop-shadow-2xl inline-block origin-bottom hover:animate-bounce cursor-default select-none">
              🚀
            </span>
          </div>
        </div>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <Stat
          label="Total Candidates"
          value={counts.total}
          icon={Users}
          theme="blue"
          percent={12}
        />
        <Stat
          label="Active Pipeline"
          value={counts.active}
          icon={Activity}
          theme="emerald"
          percent={8}
        />
        <Stat
          label="Interviews Today"
          value={counts.scheduled}
          icon={CalendarCheck}
          theme="purple"
          percent={15}
        />
        <Stat
          label="Offers Pending"
          value={counts.offersPending}
          icon={CalendarDays}
          theme="amber"
          percent={5}
        />
        <Stat
          label="Hired This Month"
          value={counts.hired}
          icon={Trophy}
          theme="teal"
          percent={20}
        />
      </div>

      {/* Kanban Board */}
      <KanbanBoard candidates={filtered} />

      {/* Bottom Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6 bg-white rounded-3xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border-border/50">
          <h3 className="text-[14px] font-bold text-slate-900 mb-6">Pipeline Overview</h3>
          <div className="flex items-center gap-6">
            <div className="relative h-40 w-40 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.overview}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {analytics.overview.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.hex} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-slate-900">{counts.total}</span>
                <span className="text-[10px] font-bold text-slate-500">Total</span>
              </div>
            </div>
            <div className="flex-1 space-y-2.5">
              {analytics.overview.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between text-[11px] font-bold"
                >
                  <div className="flex items-center gap-2">
                    <span className={cn("h-2 w-2 rounded-full", item.color)} />
                    <span className="text-slate-600">{item.label}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-slate-900 w-4 text-right">{item.value}</span>
                    <span className="text-slate-400 w-10 text-right">({item.pct})</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card className="col-span-1 lg:col-span-2 p-6 bg-white rounded-3xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border-border/50 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[14px] font-bold text-slate-900 mb-6">Pipeline Velocity</h3>
            <Button variant="outline" size="sm" className="h-8 text-xs font-bold border-slate-200">
              This Month
            </Button>
          </div>
          <div className="h-[140px] w-full mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={analytics.velocityData}
                margin={{ top: 5, right: 0, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: "#94a3b8" }}
                  dy={10}
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#94a3b8" }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorVal)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-4 gap-4 mt-auto">
            {[
              { label: "Average Time to Hire", value: analytics.stats.avgHireTime },
              { label: "Interview to Offer Rate", value: analytics.stats.intToOffer },
              { label: "Offer to Join Rate", value: analytics.stats.offerToJoin },
              { label: "Drop-off Rate", value: analytics.stats.dropOff },
            ].map((s) => (
              <div
                key={s.label}
                className="border border-slate-100 rounded-xl p-3 flex flex-col justify-center"
              >
                <div className="text-[10px] font-bold text-slate-500 mb-1">{s.label}</div>
                <div className="text-lg font-bold text-slate-900">{s.value}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-10">
        <Card className="p-6 bg-white rounded-3xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border-border/50">
          <h3 className="text-[14px] font-bold text-slate-900 mb-6">Top Skills in Pipeline</h3>
          <div className="space-y-5">
            {analytics.topSkills.map((s) => (
              <div key={s.label}>
                <div className="flex justify-between text-[11px] font-bold mb-1.5">
                  <span className="text-slate-700">{s.label}</span>
                  <span className="text-slate-900">{s.pct}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={cn("h-full rounded-full", s.color)}
                    style={{ width: `${s.pct}%` }}
                  />
                </div>
              </div>
            ))}
            <div className="pt-2 text-center">
              <Button variant="link" className="text-xs font-bold text-blue-600">
                View full report →
              </Button>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-white rounded-3xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border-border/50">
          <h3 className="text-[14px] font-bold text-slate-900 mb-6">Pipeline by Source</h3>
          <div className="flex items-center gap-6">
            <div className="relative h-32 w-32 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.sortedSources}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={60}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {analytics.sortedSources.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.hex} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-3">
              {analytics.sortedSources.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between text-[11px] font-bold"
                >
                  <div className="flex items-center gap-2">
                    <span className={cn("h-2 w-2 rounded-full", item.color)} />
                    <span className="text-slate-600">{item.label}</span>
                  </div>
                  <span className="text-slate-900">{item.pct}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="pt-6 text-center mt-auto">
            <Button variant="link" className="text-xs font-bold text-blue-600">
              View full report →
            </Button>
          </div>
        </Card>

        <Card className="p-6 bg-white rounded-3xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border-border/50 flex flex-col">
          <h3 className="text-[14px] font-bold text-slate-900 mb-6">Recent Activity</h3>
          <div className="space-y-5 flex-1">
            {analytics.recentActivity.map((act, i) => {
              const Icon = act.icon;
              return (
                <div key={i} className="flex gap-3 items-start">
                  <div
                    className={cn(
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border",
                      act.color,
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-slate-700">{act.msg}</div>
                    <div className="text-[9px] font-bold text-slate-400 mt-0.5">{act.time}</div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="pt-2 text-center">
            <Button variant="link" className="text-xs font-bold text-blue-600">
              View all activity →
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default Pipeline;
