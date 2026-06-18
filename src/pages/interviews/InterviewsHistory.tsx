import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  PieChart as PieChartIcon
} from "lucide-react";

interface TopStatProps {
  title: string;
  value: number | string;
  icon: any;
  tone: string;
  borderTone: string;
}

function TopStat({ title, value, icon: Icon, tone, borderTone }: TopStatProps) {
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

const mockHistory = [
  { id: "HIS-001", candidateName: "Tom Hanks", position: "Backend Developer", type: "Technical", date: "2026-05-10T10:00:00", interviewer: "Mike Johnson", result: "Passed", score: 8.5 },
  { id: "HIS-002", candidateName: "Emma Watson", position: "Product Designer", type: "Final Round", date: "2026-05-12T14:30:00", interviewer: "Sarah Smith", result: "Failed", score: 5.0 },
  { id: "HIS-003", candidateName: "Robert Downey", position: "Data Analyst", type: "HR", date: "2026-05-15T11:00:00", interviewer: "John Doe", result: "Passed", score: 9.0 },
  { id: "HIS-004", candidateName: "Chris Hemsworth", position: "Marketing Lead", type: "Technical", date: "2026-05-20T09:00:00", interviewer: "Sarah Smith", result: "No Show", score: null },
  { id: "HIS-005", candidateName: "Mark Ruffalo", position: "Security Engineer", type: "Technical", date: "2026-05-25T13:00:00", interviewer: "Mike Johnson", result: "Passed", score: 7.5 },
  { id: "HIS-006", candidateName: "Natalie Portman", position: "Frontend Dev", type: "Technical", date: "2026-06-01T10:00:00", interviewer: "John Doe", result: "Passed", score: 8.0 },
];

const getResultBadge = (result: string) => {
  switch (result) {
    case "Passed":
      return "bg-emerald-50 text-emerald-600 border-emerald-200 ring-emerald-500/20";
    case "Failed":
      return "bg-red-50 text-red-600 border-red-200 ring-red-500/20";
    case "No Show":
      return "bg-amber-50 text-amber-600 border-amber-200 ring-amber-500/20";
    default:
      return "bg-slate-50 text-slate-600 border-slate-200 ring-slate-500/20";
  }
};

const monthData = [
  { name: 'Jan', count: 12 },
  { name: 'Feb', count: 19 },
  { name: 'Mar', count: 15 },
  { name: 'Apr', count: 22 },
  { name: 'May', count: 28 },
  { name: 'Jun', count: 10 },
];

export default function InterviewsHistory() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const perPage = 5;

  const filteredHistory = useMemo(() => {
    return mockHistory.filter(item => {
      const matchesSearch = item.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            item.position.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || item.result.toLowerCase() === statusFilter.toLowerCase();
      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredHistory.length / perPage));
  const paginated = filteredHistory.slice((page - 1) * perPage, page * perPage);

  const totalInterviews = mockHistory.length;
  const passed = mockHistory.filter(i => i.result === "Passed").length;
  const failed = mockHistory.filter(i => i.result === "Failed").length;
  const noShow = mockHistory.filter(i => i.result === "No Show").length;
  
  const scoredInterviews = mockHistory.filter(i => i.score !== null);
  const avgScore = scoredInterviews.length > 0 ? (scoredInterviews.reduce((acc, curr) => acc + (curr.score || 0), 0) / scoredInterviews.length).toFixed(1) : "0.0";

  const donutData = [
    { name: "Passed", value: passed, color: "#10b981" },
    { name: "Failed", value: failed, color: "#ef4444" },
    { name: "No Show", value: noShow, color: "#f59e0b" },
  ];

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Interview History</h1>
          <p className="text-[13px] text-slate-500 mt-1">
            Complete record of all past interviews, evaluation scores, and historical hiring analytics.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="h-10 rounded-xl font-bold border-slate-200 text-slate-600 bg-white">
            <Download className="w-4 h-4 mr-2" />
            Export to Excel
          </Button>
          <Button variant="outline" className="h-10 rounded-xl font-bold border-slate-200 text-slate-600 bg-white">
            <Download className="w-4 h-4 mr-2" />
            Export to PDF
          </Button>
        </div>
      </div>

      {/* Top Stats */}
      <div className="flex flex-wrap gap-4">
        <TopStat title="Total Conducted" value={totalInterviews} icon={Briefcase} tone="bg-blue-50 text-blue-600" borderTone="border-blue-500" />
        <TopStat title="Passed" value={passed} icon={CheckCircle2} tone="bg-emerald-50 text-emerald-600" borderTone="border-emerald-500" />
        <TopStat title="Failed" value={failed} icon={XCircle} tone="bg-red-50 text-red-600" borderTone="border-red-500" />
        <TopStat title="No Show" value={noShow} icon={AlertCircle} tone="bg-amber-50 text-amber-600" borderTone="border-amber-500" />
        <TopStat title="Average Score" value={`${avgScore}/10`} icon={Star} tone="bg-purple-50 text-purple-600" borderTone="border-purple-500" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">
        {/* Left Area: Filters & Table */}
        <div className="xl:col-span-3 space-y-4">
          <Card className="p-3 bg-white border-border/50 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] rounded-3xl">
            <div className="flex flex-wrap gap-3 items-center">
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
              </select>

              <select
                className="h-9 w-[130px] rounded-lg border border-slate-200 bg-white px-3 text-xs shadow-sm font-semibold text-slate-700"
              >
                <option value="all">All Types</option>
                <option value="technical">Technical</option>
                <option value="hr">HR</option>
              </select>

              <select
                className="h-9 w-[130px] rounded-lg border border-slate-200 bg-white px-3 text-xs shadow-sm font-semibold text-slate-700"
              >
                <option value="all">All Interviewers</option>
                <option value="john doe">John Doe</option>
                <option value="sarah smith">Sarah Smith</option>
              </select>

              <Button
                variant="outline"
                className="h-9 text-xs font-semibold rounded-lg bg-white border-slate-200"
              >
                <Filter className="mr-1.5 h-3.5 w-3.5" /> Filters
              </Button>
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
                    <th className="px-4 py-3 font-bold">Date</th>
                    <th className="px-4 py-3 font-bold">Interviewer</th>
                    <th className="px-4 py-3 font-bold">Result</th>
                    <th className="px-4 py-3 font-bold text-center">Score</th>
                    <th className="px-4 py-3 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginated.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-900 text-[12px]">{inv.candidateName}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-700">{inv.position}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full">
                          {inv.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-bold text-slate-700">
                        {new Date(inv.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[8px] font-bold text-slate-600">
                            {inv.interviewer.charAt(0)}
                          </div>
                          <span className="font-medium text-slate-700">{inv.interviewer}</span>
                        </div>
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
                          <Button variant="outline" size="sm" className="h-7 text-[10px] font-bold border-slate-200 text-slate-600 hover:bg-slate-50">
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
                Showing {Math.min(filteredHistory.length, (page - 1) * perPage + 1)} to{" "}
                {Math.min(filteredHistory.length, page * perPage)} of {filteredHistory.length} interviews
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
                {Array.from({ length: totalPages }).map((_, i) => (
                  <Button
                    key={i}
                    variant={page === i + 1 ? "default" : "ghost"}
                    size="icon"
                    className={cn(
                      "h-7 w-7 rounded text-[11px] font-bold",
                      page === i + 1 ? "bg-indigo-600 text-white" : "text-slate-600",
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
                  disabled={page === totalPages}
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
    </div>
  );
}
