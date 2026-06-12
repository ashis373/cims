import { Link } from "react-router-dom";
import { useMemo, useState } from "react";
import { useAts } from "@/services/ats-store";
import {
  DEPARTMENTS,
  PIPELINE_STAGES,
  SOURCES,
  type Department,
  type Stage,
} from "@/types/ats-types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Download,
  TrendingUp,
  Users,
  Building2,
  Share2,
  Briefcase,
  XOctagon,
  Target,
  Activity,
  CalendarDays,
  Award,
  ChevronRight,
  ArrowUpRight,
} from "lucide-react";
import { ExportDialog } from "@/components/common/ExportDialog";
import { cn } from "@/lib/utils";
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
  AreaChart,
  Area,
} from "recharts";

interface StatCardProps {
  title: string;
  value: number | string;
  subtitle: string;
  icon: React.ElementType;
  tone: string;
  borderTone: string;
}

function StatCard({ title, value, subtitle, icon: Icon, tone, borderTone }: StatCardProps) {
  return (
    <Card
      className={cn(
        "p-6 bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] rounded-3xl relative overflow-hidden group border-t-[3px]",
        borderTone,
      )}
    >
      <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-gradient-to-br from-transparent to-black/[0.02] rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
      <div className="flex items-start justify-between relative z-10">
        <div>
          <div className="text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-2">
            {title}
          </div>
          <div className="text-4xl font-black tracking-tight text-slate-900">{value}</div>
          <div className="mt-2 text-[11px] font-bold text-slate-400">{subtitle}</div>
        </div>
        <div className={cn("flex h-12 w-12 items-center justify-center rounded-2xl", tone)}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </Card>
  );
}

function ReportsPage() {
  const { candidates } = useAts();
  const [exportOpen, setExportOpen] = useState(false);

  const stats = useMemo(() => {
    const byStage = PIPELINE_STAGES.reduce<Record<Stage, number>>(
      (acc, s) => {
        acc[s] = candidates.filter((c) => c.stage === s).length;
        return acc;
      },
      {} as Record<Stage, number>,
    );

    const byDept = DEPARTMENTS.reduce<Record<Department, number>>(
      (acc, d) => {
        acc[d] = candidates.filter((c) => c.department === d).length;
        return acc;
      },
      {} as Record<Department, number>,
    );

    const bySource = SOURCES.reduce<Record<string, number>>((acc, s) => {
      acc[s] = candidates.filter((c) => c.source === s).length;
      return acc;
    }, {});

    const now = new Date();
    const monthlyData = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const label = d.toLocaleDateString(undefined, { month: "short" });
      const count = candidates.filter((c) => {
        const a = new Date(c.appliedAt);
        return a.getFullYear() === d.getFullYear() && a.getMonth() === d.getMonth();
      }).length;
      return { name: label, value: count };
    });

    const conversion = {
      applied: candidates.length,
      shortlisted:
        byStage.Shortlisted +
        byStage["HR Call Scheduled"] +
        byStage["Interview Scheduled"] +
        byStage["Interview Completed"] +
        byStage["Offer Released"] +
        byStage["Offer Accepted"] +
        byStage.Joined,
      interviewed:
        byStage["Interview Scheduled"] +
        byStage["Interview Completed"] +
        byStage["Offer Released"] +
        byStage["Offer Accepted"] +
        byStage.Joined,
      hired: byStage.Joined,
    };

    const recruiterStats: Record<string, { added: number; interviews: number; hired: number }> = {};
    const rejectionReasons: Record<string, number> = {};

    candidates.forEach((c) => {
      const rec = c.recruiter || "Unassigned";
      if (!recruiterStats[rec]) recruiterStats[rec] = { added: 0, interviews: 0, hired: 0 };
      recruiterStats[rec].added += 1;
      if (c.interviews.length > 0) recruiterStats[rec].interviews += 1;
      if (c.stage === "Joined") recruiterStats[rec].hired += 1;

      if (c.stage === "Rejected" && c.stageReason) {
        rejectionReasons[c.stageReason] = (rejectionReasons[c.stageReason] || 0) + 1;
      }
    });

    const recruiterPerf = Object.entries(recruiterStats)
      .map(([name, stats]) => ({
        name,
        ...stats,
        conversion: stats.added > 0 ? Math.round((stats.hired / stats.added) * 100) : 0,
      }))
      .sort((a, b) => b.added - a.added);

    const rejections = Object.entries(rejectionReasons)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    // Format for charts
    const stageChartData = PIPELINE_STAGES.map((s) => ({
      name: s.replace(" Scheduled", "").replace(" Completed", "").replace(" Released", ""),
      value: byStage[s],
    })).filter((s) => s.value > 0);

    const deptChartData = DEPARTMENTS.map((d) => ({ name: d, value: byDept[d] })).filter(
      (d) => d.value > 0,
    );
    const sourceChartData = SOURCES.map((s) => ({ name: s, value: bySource[s] })).filter(
      (s) => s.value > 0,
    );

    return {
      monthlyData,
      conversion,
      recruiterPerf,
      rejections,
      stageChartData,
      deptChartData,
      sourceChartData,
    };
  }, [candidates]);

  const COLORS = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#14b8a6", "#f43f5e"];

  const CustomTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean;
    payload?: { name: string; value: number }[];
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 text-white text-[11px] font-bold py-1.5 px-3 rounded-lg shadow-xl">
          <p>{`${label || payload[0].name}: ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Reports & Analytics</h1>
          <p className="mt-1.5 text-[13px] font-medium text-slate-500">
            Comprehensive insights across your entire recruitment pipeline.
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="h-10 px-5 rounded-xl font-bold text-[13px] border-slate-200 text-slate-700 bg-white"
            asChild
          >
            <Link to="/pipeline">
              <Activity className="h-4 w-4 mr-2 text-blue-600" /> Pipeline View
            </Link>
          </Button>
          <Button
            onClick={() => setExportOpen(true)}
            className="h-10 px-5 rounded-xl font-bold text-[13px] bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20"
          >
            <Download className="mr-2 h-4 w-4" /> Export Report
          </Button>
        </div>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Candidates"
          value={stats.conversion.applied}
          subtitle="All-time applicants"
          icon={Users}
          tone="bg-blue-50 text-blue-600"
          borderTone="border-blue-500"
        />
        <StatCard
          title="In Pipeline"
          value={stats.conversion.shortlisted}
          subtitle="Active candidates"
          icon={Target}
          tone="bg-violet-50 text-violet-600"
          borderTone="border-violet-500"
        />
        <StatCard
          title="Interviewed"
          value={stats.conversion.interviewed}
          subtitle="Reached interview stage"
          icon={CalendarDays}
          tone="bg-orange-50 text-orange-500"
          borderTone="border-orange-500"
        />
        <StatCard
          title="Total Hired"
          value={stats.conversion.hired}
          subtitle="Successfully onboarded"
          icon={Award}
          tone="bg-emerald-50 text-emerald-600"
          borderTone="border-emerald-500"
        />
      </div>

      {/* Charts Grid Row 1 */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Pipeline Distribution */}
        <Card className="xl:col-span-2 p-5 bg-white border-border/50 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] rounded-3xl flex flex-col h-[300px]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-[14px] font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-600" /> Pipeline Distribution
              </h3>
            </div>
          </div>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stats.stageChartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: "#64748b", fontWeight: 600 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: "#64748b", fontWeight: 600 }}
                />
                <RechartsTooltip cursor={{ fill: "#f8fafc" }} content={<CustomTooltip />} />
                <Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 0, 0]} maxBarSize={40}>
                  {stats.stageChartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Application Volume */}
        <Card className="xl:col-span-1 p-5 bg-slate-900 border-none shadow-xl rounded-3xl text-white flex flex-col relative overflow-hidden h-[300px]">
          <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl -mt-10 -mr-10" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl -mb-10 -ml-10" />

          <div className="relative z-10 mb-4">
            <h3 className="text-[14px] font-bold flex items-center gap-2">
              <Activity className="h-4 w-4 text-blue-400" /> Application Volume
            </h3>
          </div>
          <div className="flex-1 min-h-0 relative z-10 -mx-2 -mb-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={stats.monthlyData}
                margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <RechartsTooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorCount)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="relative z-10 flex justify-between items-end mt-4 px-2">
            {stats.monthlyData.map((m) => (
              <span
                key={m.name}
                className="text-[9px] font-bold text-slate-400 uppercase tracking-wider"
              >
                {m.name}
              </span>
            ))}
          </div>
        </Card>

        {/* Source Channels */}
        <Card className="xl:col-span-1 p-5 bg-white border-border/50 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] rounded-3xl flex flex-col h-[300px]">
          <div className="mb-2">
            <h3 className="text-[14px] font-bold text-slate-900 flex items-center gap-2">
              <Share2 className="h-4 w-4 text-purple-600" /> Sources
            </h3>
          </div>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.sourceChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={60}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {stats.sourceChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-1.5 mt-2 overflow-y-auto max-h-[80px] scrollbar-thin">
            {stats.sourceChartData
              .sort((a, b) => b.value - a.value)
              .map((s, i) => (
                <div key={s.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-2 w-2 rounded-sm"
                      style={{ backgroundColor: COLORS[(i + 2) % COLORS.length] }}
                    />
                    <span className="text-[10px] font-bold text-slate-700">{s.name}</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-900">{s.value}</span>
                </div>
              ))}
          </div>
        </Card>
      </div>

      {/* Charts Grid Row 2 */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Recruiter Performance */}
        <Card className="xl:col-span-2 p-5 bg-white border-border/50 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] rounded-3xl flex flex-col h-[300px]">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-[14px] font-bold text-slate-900 flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-emerald-600" /> Recruiter Performance
              </h3>
            </div>
            <Button variant="link" className="text-[10px] h-6 px-0 font-bold text-blue-600">
              View Details <ArrowUpRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
          <div className="flex-1 overflow-auto rounded-2xl border border-slate-100 scrollbar-thin">
            <table className="w-full text-left text-[10px]">
              <thead className="bg-slate-50 sticky top-0 z-10 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-3 py-2.5">Recruiter</th>
                  <th className="px-3 py-2.5 text-center">Added</th>
                  <th className="px-3 py-2.5 text-center">Interviews</th>
                  <th className="px-3 py-2.5 text-center">Hired</th>
                  <th className="px-3 py-2.5 text-right">Conversion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-slate-900 font-semibold">
                {stats.recruiterPerf.map((r, i) => (
                  <tr key={r.name} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <img
                          src={`https://api.dicebear.com/7.x/notionists/svg?seed=${r.name}`}
                          alt=""
                          className="h-6 w-6 rounded-full bg-slate-100 border border-slate-200"
                        />
                        <span>{r.name}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-center text-slate-500">{r.added}</td>
                    <td className="px-3 py-2.5 text-center text-slate-500">{r.interviews}</td>
                    <td className="px-3 py-2.5 text-center font-bold text-emerald-600">
                      {r.hired}
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <div className="w-12 h-1 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full"
                            style={{ width: `${r.conversion}%` }}
                          />
                        </div>
                        <span className="w-6 text-slate-500">{r.conversion}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
                {stats.recruiterPerf.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      No recruiter data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Departments */}
        <Card className="xl:col-span-1 p-5 bg-white border-border/50 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] rounded-3xl flex flex-col h-[300px]">
          <div className="mb-4">
            <h3 className="text-[14px] font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="h-4 w-4 text-indigo-600" /> Departments
            </h3>
          </div>
          <div className="space-y-3.5 overflow-y-auto scrollbar-thin pr-2 flex-1">
            {stats.deptChartData
              .sort((a, b) => b.value - a.value)
              .map((d, i) => {
                const max = Math.max(...stats.deptChartData.map((x) => x.value));
                const pct = (d.value / max) * 100;
                return (
                  <div key={d.name}>
                    <div className="flex items-center justify-between text-[10px] font-bold mb-1.5">
                      <span className="text-slate-700 truncate pr-2">{d.name}</span>
                      <span className="text-slate-900">{d.value}</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${pct}%`, backgroundColor: COLORS[i % COLORS.length] }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </Card>

        {/* Rejections */}
        <Card className="xl:col-span-1 p-5 bg-white border-border/50 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] rounded-3xl flex flex-col h-[300px]">
          <div className="mb-4">
            <h3 className="text-[14px] font-bold text-slate-900 flex items-center gap-2">
              <XOctagon className="h-4 w-4 text-red-500" /> Rejections
            </h3>
          </div>
          <div className="space-y-2.5 overflow-y-auto scrollbar-thin flex-1">
            {stats.rejections.length > 0 ? (
              stats.rejections.map((r, i) => (
                <div
                  key={r.name}
                  className="flex items-center p-2.5 bg-slate-50 rounded-xl border border-slate-100"
                >
                  <div className="h-6 w-6 rounded-full bg-white shadow-sm flex items-center justify-center text-[9px] font-bold text-slate-500 shrink-0 border border-slate-100">
                    #{i + 1}
                  </div>
                  <div className="ml-2.5 flex-1 min-w-0">
                    <div className="text-[10px] font-bold text-slate-900 truncate">{r.name}</div>
                  </div>
                  <div className="text-[11px] font-black text-red-500 bg-red-50 px-2 py-0.5 rounded-md ml-2">
                    {r.value}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-[10px] font-bold text-slate-400 bg-slate-50 rounded-2xl border border-slate-100">
                No tracked rejection reasons.
              </div>
            )}
          </div>
        </Card>
      </div>

      <ExportDialog
        open={exportOpen}
        onOpenChange={setExportOpen}
        candidates={candidates}
        scope="all"
      />
    </div>
  );
}

export default ReportsPage;
