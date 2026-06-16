import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid, Legend } from "recharts";
import { Briefcase, Filter, Calendar } from "lucide-react";
import { toast } from "sonner";

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
      
      const res = await fetch(`http://localhost/full-cims/api/reports.php?${params.toString()}`);
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

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full pb-10">
      <div className="relative overflow-hidden rounded-3xl bg-white border border-slate-200/60 shadow-sm p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl shadow-sm border bg-blue-50 border-blue-100 text-blue-600">
              <Briefcase className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">Performance Reports</h1>
              <p className="text-slate-500 text-[13px] font-medium mt-1">Analytics on recruiter performance, conversions, and drop-offs.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4 bg-white shadow-sm border-slate-200 rounded-2xl">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 space-y-1.5 w-full">
            <label className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-1.5"><Calendar className="h-3 w-3"/> Start Date</label>
            <Input type="date" value={filters.startDate} onChange={e => updateFilter("startDate", e.target.value)} className="h-9 text-[13px]" />
          </div>
          <div className="flex-1 space-y-1.5 w-full">
            <label className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-1.5"><Calendar className="h-3 w-3"/> End Date</label>
            <Input type="date" value={filters.endDate} onChange={e => updateFilter("endDate", e.target.value)} className="h-9 text-[13px]" />
          </div>
          <div className="flex-1 space-y-1.5 w-full">
            <label className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-1.5"><Filter className="h-3 w-3"/> Recruiter</label>
            <Select value={filters.recruiter} onValueChange={(v) => updateFilter("recruiter", v)}>
              <SelectTrigger className="h-9 text-[13px] bg-white"><SelectValue placeholder="All Recruiters" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Recruiters</SelectItem>
                {data.filters.recruiters.map((r: string) => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1 space-y-1.5 w-full">
            <label className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-1.5"><Briefcase className="h-3 w-3"/> Position</label>
            <Select value={filters.position} onValueChange={(v) => updateFilter("position", v)}>
              <SelectTrigger className="h-9 text-[13px] bg-white"><SelectValue placeholder="All Positions" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Positions</SelectItem>
                {data.filters.positions.map((p: string) => (
                  <SelectItem key={p} value={p}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {isLoading ? (
        <div className="py-20 text-center text-slate-500 font-medium">Loading analytics...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Recruiter Performance */}
          <Card className="col-span-1 lg:col-span-2 shadow-sm border-slate-200 rounded-2xl overflow-hidden">
            <CardHeader className="bg-slate-50 border-b border-slate-100 py-4">
              <CardTitle className="text-[14px] font-bold text-slate-800">Recruiter Performance Overview</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.recruiter_performance} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} />
                    <YAxis tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                    <Legend iconType="circle" wrapperStyle={{fontSize: '12px', paddingTop: '10px'}} />
                    <Bar dataKey="total" name="Total Apps" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="offers" name="Offers" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="joined" name="Joined" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Hiring Funnel */}
          <Card className="shadow-sm border-slate-200 rounded-2xl overflow-hidden">
            <CardHeader className="bg-slate-50 border-b border-slate-100 py-4">
              <CardTitle className="text-[14px] font-bold text-slate-800">Hiring Conversion Funnel</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.funnel} layout="vertical" margin={{ top: 10, right: 30, left: 30, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" tick={{fontSize: 11, fill: '#475569', fontWeight: 600}} axisLine={false} tickLine={false} width={120} />
                    <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                    <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={24} label={{ position: 'right', fill: '#64748b', fontSize: 12, fontWeight: 700 }} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Rejection Reasons */}
          <Card className="shadow-sm border-slate-200 rounded-2xl overflow-hidden">
            <CardHeader className="bg-slate-50 border-b border-slate-100 py-4">
              <CardTitle className="text-[14px] font-bold text-slate-800">Rejection Analysis</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-[250px] w-full flex items-center justify-center">
                {data.rejection_reasons.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={data.rejection_reasons} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={2} dataKey="value">
                        {data.rejection_reasons.map((_: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                      <Legend iconType="circle" wrapperStyle={{fontSize: '11px'}} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-slate-400 text-[13px] font-medium">No rejection data available</div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* No Join Stats */}
          <Card className="shadow-sm border-slate-200 rounded-2xl overflow-hidden lg:col-span-2">
            <CardHeader className="bg-slate-50 border-b border-slate-100 py-4">
              <CardTitle className="text-[14px] font-bold text-slate-800">No-Show / Drop-Off Reasons</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-[250px] w-full">
                {data.no_join_stats.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.no_join_stats} margin={{ top: 20, right: 30, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="name" tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} />
                      <YAxis tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} allowDecimals={false} />
                      <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                      <Bar dataKey="value" fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={60} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-400 text-[13px] font-medium">No drop-off data available</div>
                )}
              </div>
            </CardContent>
          </Card>

        </div>
      )}
    </div>
  );
}
