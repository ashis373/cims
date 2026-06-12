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
  tone: string;
  percent: number;
  borderTone: string;
}

function Stat({ label, value, icon: Icon, tone, percent, borderTone }: StatProps) {
  return (
    <Card
      className={cn(
        "p-5 bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] rounded-3xl relative overflow-hidden group border-t-[3px] flex-1 min-w-[180px]",
        borderTone,
      )}
    >
      <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-gradient-to-br from-transparent to-black/[0.02] rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
      <div className="flex items-start justify-between relative z-10">
        <div>
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
            {label}
          </div>
          <div className="text-3xl font-black tracking-tight text-slate-900">{value}</div>
          <div className="mt-1.5 flex items-center gap-1 text-[10px] text-emerald-500 font-bold">
            <ArrowUp className="h-3 w-3" /> +{percent}% from last month
          </div>
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

const mockVelocityData = [
  { date: "May 1", value: 10 },
  { date: "May 5", value: 30 },
  { date: "May 8", value: 25 },
  { date: "May 12", value: 45 },
  { date: "May 15", value: 40 },
  { date: "May 20", value: 60 },
  { date: "May 22", value: 58 },
  { date: "May 25", value: 75 },
  { date: "May 29", value: 85 },
];

function Pipeline() {
  const { candidates, undo, canUndo } = useAts();
  const [search, setSearch] = useState("");

  const filtered = candidates.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.role.toLowerCase().includes(search.toLowerCase()),
  );

  const counts = useMemo(() => {
    const c = (s: string) => candidates.filter((x) => x.stage === s).length;
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

    const interviews = candidates.filter((c) => c.stage.includes("Interview")).length;
    const offers = candidates.filter((c) => c.stage.includes("Offer")).length;
    const intToOffer = interviews > 0 ? Math.round((offers / interviews) * 100) : 0;

    const joins = hired.length;
    const offerToJoin = offers > 0 ? Math.round((joins / offers) * 100) : 0;

    const rejects = candidates.filter((c) =>
      ["Rejected", "Offer Declined", "No Show"].includes(c.stage),
    ).length;
    const dropOff = Math.round((rejects / total) * 100);

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
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Pipeline</h1>
          <p className="text-[13px] text-slate-500 mt-1">
            Drag cards between columns to update stage.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <Input
              placeholder="Search candidates..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 w-[250px] text-xs bg-white border-slate-200 shadow-sm rounded-lg"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={undo}
            disabled={!canUndo}
            className="h-9 w-9 p-0 bg-white shadow-sm border-slate-200"
          >
            <Undo2 className="h-4 w-4 text-slate-600" />
          </Button>
          <Button
            variant="outline"
            className="h-9 text-xs bg-white shadow-sm border-slate-200 text-slate-700 font-semibold"
          >
            <Filter className="mr-2 h-3.5 w-3.5 text-slate-500" />
            Filter
          </Button>
          <Button
            variant="outline"
            className="h-9 text-xs bg-white shadow-sm border-slate-200 text-slate-700 font-semibold"
          >
            <LayoutGrid className="mr-2 h-3.5 w-3.5 text-slate-500" />
            Display
          </Button>
          <Button
            asChild
            className="h-9 text-xs bg-blue-600 hover:bg-blue-700 text-white shadow-sm font-semibold rounded-lg"
          >
            <Link to="/candidates/new">
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Add Candidate
            </Link>
          </Button>
        </div>
      </div>

      {/* Top Stats */}
      <div className="flex flex-wrap gap-4">
        <Stat
          label="Total Candidates"
          value={counts.total}
          icon={Users}
          tone="bg-blue-50 text-blue-600"
          percent={12}
          borderTone="border-blue-500"
        />
        <Stat
          label="Active Pipeline"
          value={counts.active}
          icon={Activity}
          tone="bg-emerald-50 text-emerald-600"
          percent={8}
          borderTone="border-emerald-500"
        />
        <Stat
          label="Interviews Today"
          value={counts.scheduled}
          icon={CalendarCheck}
          tone="bg-purple-50 text-purple-600"
          percent={15}
          borderTone="border-purple-500"
        />
        <Stat
          label="Offers Pending"
          value={counts.offersPending}
          icon={CalendarDays}
          tone="bg-orange-50 text-orange-500"
          percent={5}
          borderTone="border-orange-500"
        />
        <Stat
          label="Hired This Month"
          value={counts.hired}
          icon={Trophy}
          tone="bg-teal-50 text-teal-600"
          percent={20}
          borderTone="border-teal-500"
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
                data={mockVelocityData}
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
