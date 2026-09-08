import { useState, useMemo } from "react";
import { useAts } from "@/services/ats-store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { exportCsv } from "@/utils/ats-export";
import { 
  Users, UserCheck, Calendar, Briefcase, UserPlus, 
  Download, ChevronDown, Activity, Share2, Building2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PIPELINE_STAGES, DEPARTMENTS, SOURCES, type Stage, type Department } from "@/types/ats-types";
import { ExportDialog } from "@/components/common/ExportDialog";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from "recharts";
import PipelineReport from "./PipelineReport";
import DepartmentReport from "./DepartmentReport";
import SourceReport from "./SourceReport";

const COLORS = ["#3b82f6", "#8b5cf6", "#f59e0b", "#10b981", "#ec4899", "#14b8a6", "#f43f5e"];

export default function ReportsPage() {
  const { candidates } = useAts();
  const [exportOpen, setExportOpen] = useState(false);

  // Stats calculation
  const stats = useMemo(() => {
    const byStage = PIPELINE_STAGES.reduce<Record<Stage, number>>((acc, s) => {
      acc[s] = candidates.filter((c) => c.stage === s).length;
      return acc;
    }, {} as Record<Stage, number>);

    const byDept = DEPARTMENTS.reduce<Record<Department, number>>((acc, d) => {
      acc[d] = candidates.filter((c) => c.department === d).length;
      return acc;
    }, {} as Record<Department, number>);

    const byDeptHired = DEPARTMENTS.reduce<Record<Department, number>>((acc, d) => {
      acc[d] = candidates.filter((c) => c.department === d && c.stage === 'Joined').length;
      return acc;
    }, {} as Record<Department, number>);

    const bySource = SOURCES.reduce<Record<string, number>>((acc, s) => {
      acc[s] = candidates.filter((c) => c.source === s).length;
      return acc;
    }, {});

    const now = new Date();
    const dailyData = Array.from({ length: 30 }, (_, i) => {
      const d = new Date();
      d.setDate(now.getDate() - (29 - i));
      const label = d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
      const count = candidates.filter((c) => {
        const a = new Date(c.appliedAt);
        return a.getFullYear() === d.getFullYear() && a.getMonth() === d.getMonth() && a.getDate() === d.getDate();
      }).length;
      return { name: label, value: count };
    });

    const stageChartData = PIPELINE_STAGES.map((s) => ({
      name: s.replace(" Scheduled", "").replace(" Completed", "").replace(" Released", ""),
      value: byStage[s],
    })).filter((s) => s.value > 0);

    const deptChartData = DEPARTMENTS.map((d) => ({ name: d, value: byDept[d] })).filter((d) => d.value > 0);
    const deptHiringData = DEPARTMENTS.map((d) => ({ name: d, value: byDeptHired[d] })).filter((d) => d.value > 0);
    const sourceChartData = SOURCES.map((s) => ({ name: s, value: bySource[s] }))
      .filter((s) => s.value > 0)
      .sort((a, b) => b.value - a.value);

    return {
      applied: candidates.length,
      shortlisted: byStage.Shortlisted + byStage["HR Call Scheduled"] + byStage["Interview Scheduled"] + byStage["Interview Completed"] + byStage["Offer Released"] + byStage["Offer Accepted"] + byStage.Joined,
      interviews: byStage["Interview Scheduled"] + byStage["Interview Completed"] + byStage["Offer Released"] + byStage["Offer Accepted"] + byStage.Joined,
      offers: byStage["Offer Released"] + byStage["Offer Accepted"] + byStage.Joined,
      hired: byStage.Joined,
      dailyData,
      stageChartData,
      deptChartData,
      deptHiringData,
      sourceChartData
    };
  }, [candidates]);

  return (
    <div className="w-full flex flex-col gap-6 pb-10 bg-slate-50/50 min-h-screen">
      {/* Top Banner (Dark Teal / Cyan Gradient) */}
      <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-r from-[#000C22] via-[#0B2524] to-[#0D2823] shadow-lg border border-teal-900/40 p-8 sm:p-10 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="relative z-10 flex flex-col justify-center max-w-xl">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-2 text-white">Reports & Analytics</h1>
          <p className="text-[#60C042] text-[14px] sm:text-[15px] font-medium leading-relaxed">
            Track recruitment progress, analyze hiring performance, and make data-driven decisions.
          </p>
        </div>
        <div className="relative z-10 flex items-center gap-6 self-stretch sm:self-auto justify-between sm:justify-end">
          <Button 
            onClick={() => { exportCsv(candidates); toast.success(`Report downloaded (${candidates.length} candidates)`); }} 
            className="rounded-xl font-bold btn-primary hover:opacity-95 px-6 h-11 text-white transition-all shadow-md"
          >
            <Download className="mr-2 h-4 w-4" /> Export Report
          </Button>
          <div className="shrink-0 group cursor-pointer">
            <span className="text-7xl drop-shadow-2xl inline-block origin-bottom hover:animate-bounce cursor-default select-none">
              📈
            </span>
          </div>
        </div>
      </div>

      {/* Top Cards */}
      <div className="flex flex-wrap gap-4">
        {[
          { title: "Total Applications", value: stats.applied, icon: Users, tone: "bg-blue-50 text-blue-600", borderTone: "border-blue-500", pct: 12 },
          { title: "Shortlisted", value: stats.shortlisted, icon: UserCheck, tone: "bg-purple-50 text-purple-600", borderTone: "border-purple-500", pct: 18 },
          { title: "Interviews", value: stats.interviews, icon: Calendar, tone: "bg-orange-50 text-orange-500", borderTone: "border-orange-500", pct: 25 },
          { title: "Offers", value: stats.offers, icon: Briefcase, tone: "bg-emerald-50 text-emerald-600", borderTone: "border-emerald-500", pct: 40 },
          { title: "Hired", value: stats.hired, icon: UserPlus, tone: "bg-pink-50 text-pink-600", borderTone: "border-pink-500", pct: 33 }
        ].map((s, i) => (
          <Card
            key={i}
            className={cn(
              "p-5 bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] rounded-3xl relative overflow-hidden group border-t-[3px] flex-1 min-w-[160px]",
              s.borderTone,
            )}
          >
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-gradient-to-br from-transparent to-black/[0.02] rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
            <div className="flex items-start justify-between relative z-10">
              <div>
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  {s.title}
                </div>
                <div className="text-3xl font-black tracking-tight text-slate-900">{s.value}</div>
                <div className="mt-1.5 text-[10px] font-bold text-emerald-500">+{s.pct}% this month</div>
              </div>
              <div
                className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl", s.tone)}
              >
                <s.icon className="h-5 w-5" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Middle Row (Funnel & Area Chart) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-1 lg:col-span-2 p-6 h-[300px] flex flex-col bg-white">
          <div className="flex justify-between items-center mb-6">
             <h3 className="font-bold text-sm text-slate-900 flex items-center">
               <Activity className="h-4 w-4 mr-2 text-blue-500"/> Recruitment Pipeline
             </h3>
             <Button variant="outline" size="sm" className="h-7 text-[10px] text-blue-600 bg-blue-50 border-blue-100">Stage Conversion Rate</Button>
          </div>
          <div className="flex-1 min-h-0 flex flex-col justify-center overflow-x-auto scrollbar-thin">
            <div className="flex min-w-[700px] w-full h-[120px] gap-1 pb-2">
               {stats.stageChartData.map((s, i) => {
                 const isFirst = i === 0;
                 const isLast = i === stats.stageChartData.length - 1;
                 const bgColors = ["bg-blue-500", "bg-purple-500", "bg-teal-400", "bg-orange-400", "bg-pink-500", "bg-indigo-500", "bg-emerald-500", "bg-cyan-500"];
                 return (
                   <div key={s.name} className="flex-1 flex flex-col items-center group relative">
                      <div 
                        className={`w-full h-full ${bgColors[i % bgColors.length]} text-white flex flex-col items-center justify-center relative transition-transform hover:-translate-y-1`}
                        style={{
                           clipPath: isFirst ? 'polygon(0% 0%, calc(100% - 15px) 0%, 100% 50%, calc(100% - 15px) 100%, 0% 100%)' :
                                     isLast ? 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%, 15px 50%)' :
                                     'polygon(0% 0%, calc(100% - 15px) 0%, 100% 50%, calc(100% - 15px) 100%, 0% 100%, 15px 50%)',
                           marginLeft: isFirst ? '0' : '-5px'
                        }}
                      >
                         <div className="text-2xl font-bold">{s.value}</div>
                         <div className="text-[10px] font-semibold opacity-90 mt-1 uppercase text-center leading-tight px-3">{s.name}</div>
                      </div>
                      <div className="mt-4 text-[11px] font-bold text-blue-600 group-hover:scale-110 transition-transform">
                         {stats.applied > 0 ? ((s.value / stats.applied) * 100).toFixed(1) : 0}%
                      </div>
                   </div>
                 );
               })}
            </div>
          </div>
        </Card>
        <Card className="col-span-1 p-6 h-[300px] bg-white flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-sm text-slate-900">Application Volume</h3>
          </div>
          <div className="flex-1 min-h-0 -ml-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.dailyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#64748b" }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#64748b" }} dx={-10} />
                <Tooltip />
                <Area type="monotone" dataKey="value" stroke="#3b82f6" fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* 3rd Row: Department, Source, Top Hiring */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-1 p-6 h-[300px] flex flex-col bg-white">
          <h3 className="font-bold text-sm text-slate-900 mb-4 flex items-center"><Building2 className="h-4 w-4 mr-2 text-indigo-500"/> Department Performance</h3>
          <div className="flex-1 min-h-0">
             <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.deptChartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#64748b" }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#64748b" }} />
                <Tooltip cursor={{ fill: "#f8fafc" }} />
                <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={40}>
                  {stats.deptChartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[(index + 1) % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        
        <Card className="col-span-1 p-6 h-[300px] flex flex-col bg-white">
          <div className="flex justify-between items-center mb-4">
             <h3 className="font-bold text-sm text-slate-900 flex items-center"><Share2 className="h-4 w-4 mr-2 text-purple-500"/> Source Performance</h3>
             <Button variant="link" className="text-[10px] h-6 px-0 font-bold text-blue-600">View Details</Button>
          </div>
          <div className="flex-1 min-h-0 flex items-center">
            {/* Donut Chart (Left) */}
            <div className="w-[130px] h-[130px] relative shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={stats.sourceChartData} cx="50%" cy="50%" innerRadius={45} outerRadius={60} paddingAngle={2} dataKey="value" stroke="none">
                    {stats.sourceChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[(index + 3) % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xl font-bold text-slate-900">{stats.applied}</span>
                  <span className="text-[7px] text-slate-500 uppercase tracking-wider font-semibold text-center leading-tight mt-0.5">Total<br/>Apps</span>
              </div>
            </div>
            
            {/* Legend (Right) */}
            <div className="flex-1 ml-4 space-y-3 overflow-y-auto max-h-[160px] pr-1 scrollbar-thin">
               {stats.sourceChartData.map((s, i) => {
                  const pct = stats.applied > 0 ? ((s.value / stats.applied) * 100).toFixed(1) : "0.0";
                  return (
                    <div key={s.name} className="flex items-center justify-between">
                       <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full shrink-0" style={{backgroundColor: COLORS[(i + 3) % COLORS.length]}}></div>
                          <span className="text-[11px] font-semibold text-slate-600 truncate">{s.name}</span>
                       </div>
                       <div className="text-[11px] font-bold text-slate-900 shrink-0 ml-2">
                         {s.value} <span className="text-slate-400 font-medium">({pct}%)</span>
                       </div>
                    </div>
                  );
               })}
            </div>
          </div>
        </Card>

        <Card className="col-span-1 p-6 h-[300px] flex flex-col bg-white">
          <h3 className="font-bold text-sm text-slate-900 mb-4 flex items-center"><Activity className="h-4 w-4 mr-2 text-emerald-500"/> Top Hiring Departments</h3>
          <div className="flex-1 min-h-0 overflow-y-auto pr-2 space-y-4">
             {stats.deptHiringData.length > 0 ? stats.deptHiringData.sort((a,b) => b.value - a.value).map((d, i) => {
                const max = Math.max(...stats.deptHiringData.map((x) => x.value));
                const pct = (d.value / max) * 100;
                return (
                  <div key={d.name}>
                    <div className="flex items-center justify-between text-[11px] font-bold mb-1.5">
                      <span className="text-slate-700">{d.name}</span>
                      <span className="text-slate-900">{d.value}</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${pct}%`, backgroundColor: COLORS[i % COLORS.length] }}
                      />
                    </div>
                  </div>
                );
              }) : (
                 <div className="flex h-full items-center justify-center text-[11px] text-slate-400 font-medium text-center leading-relaxed px-4">No hires recorded yet.<br/>Move candidates to "Joined" stage to see data here.</div>
              )}
          </div>
        </Card>
      </div>

      <div className="-mx-6 px-6 mt-4 overflow-hidden">
        <PipelineReport candidates={candidates} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
        <div className="col-span-1">
          <DepartmentReport candidates={candidates} />
        </div>
        <div className="col-span-1">
          <SourceReport candidates={candidates} />
        </div>
      </div>

      <ExportDialog open={exportOpen} onOpenChange={setExportOpen} candidates={candidates} scope="all" />
    </div>
  );
}
