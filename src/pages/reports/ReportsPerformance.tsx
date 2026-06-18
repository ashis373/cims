import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid, Legend } from "recharts";
import { Briefcase, Filter, Calendar, BarChart2, PieChart as PieChartIcon, TrendingUp, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { API_BASE_URL } from "@/config/api";
import { cn } from "@/lib/utils";

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#64748b'];

export default function ReportsPerformance() {
  const [data, setData] = useState<any>({
    recruiter_performance: [],
    funnel: [],
    rejection_reasons: [],
    no_join_stats: [],
    filters: { recruiters: [], positions: [] }
  });
  
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    recruiter: "all",
    position: "all"
  });
  
  const [isLoading, setIsLoading] = useState(true);

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.startDate) params.append("startDate", filters.startDate);
      if (filters.endDate) params.append("endDate", filters.endDate);
      if (filters.recruiter !== "all") params.append("recruiter", filters.recruiter);
      if (filters.position !== "all") params.append("position", filters.position);
      
      const res = await fetch(`${API_BASE_URL}/reports.php?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch reports");
      const json = await res.json();
      setData(json);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load reports");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [filters]);

  const updateFilter = (k: string, v: string) => {
    setFilters(prev => ({ ...prev, [k]: v }));
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 text-white text-[11px] font-bold py-1.5 px-3 rounded-lg shadow-xl border-none">
          <p className="mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={`item-${index}`} style={{ color: entry.color || '#fff' }}>
              {`${entry.name || 'Value'}: ${entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col gap-6 w-full pb-10">
      {/* Header Section */}
      <div className="relative overflow-hidden rounded-3xl bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100 p-8 sm:p-10">
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-gradient-to-br from-blue-100 to-indigo-50 rounded-full blur-3xl opacity-50 pointer-events-none" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-5">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl shadow-sm border bg-blue-50 border-blue-100 text-blue-600">
              <Briefcase className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">Performance Reports</h1>
              <p className="text-slate-500 text-[13px] sm:text-[14px] font-medium mt-1.5 max-w-lg leading-relaxed">
                Analytics on recruiter performance, pipeline conversions, and drop-offs.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-5 bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100 rounded-3xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500 opacity-20"></div>
        <div className="flex flex-col md:flex-row gap-5 items-end relative z-10">
          <div className="flex-1 space-y-2 w-full">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5 text-blue-500"/> Start Date</label>
            <Input type="date" value={filters.startDate} onChange={e => updateFilter("startDate", e.target.value)} className="h-11 text-[13px] rounded-xl border-slate-200 shadow-sm focus-visible:ring-1 focus-visible:ring-blue-500 transition-all" />
          </div>
          <div className="flex-1 space-y-2 w-full">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5 text-blue-500"/> End Date</label>
            <Input type="date" value={filters.endDate} onChange={e => updateFilter("endDate", e.target.value)} className="h-11 text-[13px] rounded-xl border-slate-200 shadow-sm focus-visible:ring-1 focus-visible:ring-blue-500 transition-all" />
          </div>
          <div className="flex-1 space-y-2 w-full">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5"><Filter className="h-3.5 w-3.5 text-indigo-500"/> Recruiter</label>
            <Select value={filters.recruiter} onValueChange={(v) => updateFilter("recruiter", v)}>
              <SelectTrigger className="h-11 text-[13px] bg-white rounded-xl border-slate-200 shadow-sm focus:ring-1 focus:ring-indigo-500 transition-all"><SelectValue placeholder="All Recruiters" /></SelectTrigger>
              <SelectContent className="rounded-xl border-slate-200 shadow-lg">
                <SelectItem value="all" className="rounded-lg text-[13px] font-medium cursor-pointer">All Recruiters</SelectItem>
                {data.filters.recruiters.map((r: string) => (
                  <SelectItem key={r} value={r} className="rounded-lg text-[13px] font-medium cursor-pointer">{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1 space-y-2 w-full">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5"><Briefcase className="h-3.5 w-3.5 text-purple-500"/> Position</label>
            <Select value={filters.position} onValueChange={(v) => updateFilter("position", v)}>
              <SelectTrigger className="h-11 text-[13px] bg-white rounded-xl border-slate-200 shadow-sm focus:ring-1 focus:ring-purple-500 transition-all"><SelectValue placeholder="All Positions" /></SelectTrigger>
              <SelectContent className="rounded-xl border-slate-200 shadow-lg">
                <SelectItem value="all" className="rounded-lg text-[13px] font-medium cursor-pointer">All Positions</SelectItem>
                {data.filters.positions.map((p: string) => (
                  <SelectItem key={p} value={p} className="rounded-lg text-[13px] font-medium cursor-pointer">{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {isLoading ? (
        <div className="py-20 text-center text-slate-500 font-bold flex flex-col items-center justify-center gap-3">
          <div className="h-8 w-8 rounded-full border-4 border-slate-200 border-t-blue-600 animate-spin" />
          Loading performance analytics...
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Recruiter Performance */}
          <Card className="col-span-1 lg:col-span-2 p-6 bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100 rounded-3xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-gradient-to-br from-blue-50 to-transparent rounded-full blur-3xl pointer-events-none" />
            <div className="flex items-center justify-between mb-6 relative z-10">
              <h3 className="text-[15px] font-black text-slate-900 flex items-center gap-2">
                <BarChart2 className="h-5 w-5 text-blue-600" /> Recruiter Performance Overview
              </h3>
            </div>
            <div className="h-[300px] w-full relative z-10">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.recruiter_performance} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{fontSize: 11, fill: '#64748b', fontWeight: 600}} axisLine={false} tickLine={false} dy={10} />
                  <YAxis tick={{fontSize: 11, fill: '#64748b', fontWeight: 600}} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{fill: '#f8fafc'}} />
                  <Legend iconType="circle" wrapperStyle={{fontSize: '11px', fontWeight: 600, paddingTop: '15px'}} />
                  <Bar dataKey="total" name="Total Apps" fill="#94a3b8" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  <Bar dataKey="offers" name="Offers" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  <Bar dataKey="joined" name="Joined" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Hiring Funnel */}
          <Card className="p-6 bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100 rounded-3xl relative overflow-hidden group border-t-[3px] border-t-purple-500">
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-gradient-to-br from-purple-50 to-transparent rounded-full blur-3xl pointer-events-none" />
            <div className="flex items-center justify-between mb-6 relative z-10">
              <h3 className="text-[15px] font-black text-slate-900 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-purple-600" /> Hiring Conversion Funnel
              </h3>
            </div>
            <div className="h-[250px] w-full relative z-10">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.funnel} layout="vertical" margin={{ top: 10, right: 30, left: 30, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" tick={{fontSize: 10, fill: '#475569', fontWeight: 700}} axisLine={false} tickLine={false} width={130} />
                  <Tooltip content={<CustomTooltip />} cursor={{fill: '#f8fafc'}} />
                  <Bar dataKey="value" fill="#8b5cf6" radius={[0, 6, 6, 0]} barSize={24} label={{ position: 'right', fill: '#64748b', fontSize: 11, fontWeight: 800 }} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Rejection Reasons */}
          <Card className="p-6 bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100 rounded-3xl relative overflow-hidden group border-t-[3px] border-t-rose-500">
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-gradient-to-br from-rose-50 to-transparent rounded-full blur-3xl pointer-events-none" />
            <div className="flex items-center justify-between mb-6 relative z-10">
              <h3 className="text-[15px] font-black text-slate-900 flex items-center gap-2">
                <PieChartIcon className="h-5 w-5 text-rose-500" /> Rejection Analysis
              </h3>
            </div>
            <div className="h-[250px] w-full flex items-center justify-center relative z-10">
              {data.rejection_reasons.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={data.rejection_reasons} cx="50%" cy="50%" innerRadius={65} outerRadius={90} paddingAngle={3} dataKey="value" stroke="none">
                      {data.rejection_reasons.map((_: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend iconType="circle" wrapperStyle={{fontSize: '11px', fontWeight: 600}} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center text-slate-400">
                  <PieChartIcon className="h-10 w-10 text-slate-200 mb-2" />
                  <span className="text-[12px] font-bold">No rejection data available</span>
                </div>
              )}
            </div>
          </Card>

          {/* No Join Stats */}
          <Card className="col-span-1 lg:col-span-2 p-6 bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100 rounded-3xl relative overflow-hidden group border-t-[3px] border-t-amber-500">
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-gradient-to-br from-amber-50 to-transparent rounded-full blur-3xl pointer-events-none" />
            <div className="flex items-center justify-between mb-6 relative z-10">
              <h3 className="text-[15px] font-black text-slate-900 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" /> No-Show / Drop-Off Reasons
              </h3>
            </div>
            <div className="h-[280px] w-full relative z-10">
              {data.no_join_stats.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.no_join_stats} margin={{ top: 20, right: 30, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{fontSize: 11, fill: '#64748b', fontWeight: 600}} axisLine={false} tickLine={false} dy={10} />
                    <YAxis tick={{fontSize: 11, fill: '#64748b', fontWeight: 600}} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip content={<CustomTooltip />} cursor={{fill: '#f8fafc'}} />
                    <Bar dataKey="value" fill="#f59e0b" radius={[6, 6, 0, 0]} maxBarSize={60}>
                      {data.no_join_stats.map((_: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                  <AlertTriangle className="h-10 w-10 text-slate-200 mb-2" />
                  <span className="text-[12px] font-bold">No drop-off data available</span>
                </div>
              )}
            </div>
          </Card>

        </div>
      )}
    </div>
  );
}
