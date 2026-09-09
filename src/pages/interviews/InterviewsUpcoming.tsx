import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { API_BASE_URL } from "@/config/api";
import { getAuthHeaders } from "@/services/candidate-api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  CalendarDays,
  Video,
  MapPin,
  BellRing,
  ExternalLink,
  Mail,
  Phone,
  User,
  MessageSquareWarning,
  ChevronRight
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

const mockInterviews = [
  { id: "INT-001", candidateName: "Alice Johnson", candidateEmail: "alice@example.com", position: "Senior Frontend Engineer", department: "software development", type: "Technical", date: new Date().toISOString(), interviewer: "John Doe", mode: "Online", status: "Confirmed" },
  { id: "INT-002", candidateName: "Bob Smith", candidateEmail: "bob.smith@example.com", position: "Product Manager", department: "Business Development", type: "HR", date: new Date().toISOString(), interviewer: "Sarah Smith", mode: "Online", status: "Scheduled" },
  { id: "INT-003", candidateName: "Charlie Brown", candidateEmail: "charlie@example.com", position: "UX Designer", department: "multimedia design", type: "Final Round", date: "2026-11-16T11:00:00", interviewer: "Mike Johnson", mode: "Offline", status: "Rescheduled" },
  { id: "INT-004", candidateName: "Diana Prince", candidateEmail: "diana@example.com", position: "Data Scientist", department: "software development", type: "Technical", date: "2026-11-18T09:00:00", interviewer: "John Doe", mode: "Online", status: "Scheduled" },
];

const mockNotifications = [
  { id: 1, text: "Alice Johnson needs to confirm interview slot", time: "2 hours ago", type: "pending" },
  { id: 2, text: "Reminder: Technical interview with Bob Smith today at 2:30 PM", time: "3 hours ago", type: "reminder" },
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case "Confirmed":
      return "bg-emerald-50 text-emerald-600 border-emerald-200 ring-emerald-500/20";
    case "Scheduled":
      return "bg-blue-50 text-blue-600 border-blue-200 ring-blue-500/20";
    case "Rescheduled":
      return "bg-amber-50 text-amber-600 border-amber-200 ring-amber-500/20";
    default:
      return "bg-slate-50 text-slate-600 border-slate-200 ring-slate-500/20";
  }
};

export default function InterviewsUpcoming() {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [interviewerFilter, setInterviewerFilter] = useState("all");
  const [interviewsList, setInterviewsList] = useState<any[]>(mockInterviews);
  const [selectedInterview, setSelectedInterview] = useState<any | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE_URL}/candidates/interviews.php`, {
      credentials: 'include',
      headers: getAuthHeaders(false)
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setInterviewsList(data);
        }
      })
      .catch(console.error);
  }, []);

  const filteredInterviews = useMemo(() => {
    return interviewsList.filter(inv => {
      const name = (inv.candidateName || "").toLowerCase();
      const pos = (inv.position || "").toLowerCase();
      const type = (inv.type || "").toLowerCase();
      const interviewer = (inv.interviewer || "").toLowerCase();
      const search = searchTerm.toLowerCase();

      const matchesSearch = name.includes(search) || pos.includes(search);
      const matchesType = typeFilter === "all" || type.includes(typeFilter.toLowerCase());
      const matchesInterviewer = interviewerFilter === "all" || interviewer.includes(interviewerFilter.toLowerCase());
      return matchesSearch && matchesType && matchesInterviewer;
    });
  }, [interviewsList, searchTerm, typeFilter, interviewerFilter]);

  // Derive Stats
  const totalScheduled = interviewsList.length;
  const todaysInterviews = interviewsList.filter(i => i.date && new Date(i.date).toDateString() === new Date().toDateString()).length;
  const thisWeek = interviewsList.length;
  const feedbackPending = interviewsList.filter(i => !i.feedback).length;
  const cancelled = interviewsList.filter(i => i.status === "Cancelled").length;

  return (
    <div className="space-y-6 pb-10">
      {/* Top Banner (Signature Dark Teal / Cyan Gradient) */}
      <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-r from-[#000C22] via-[#0B2524] to-[#0D2823] shadow-lg border border-teal-900/40 p-8 sm:p-10 text-white flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6">
        <div className="relative z-10 flex flex-col justify-center max-w-xl">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-2 text-white">Upcoming Interviews</h1>
          <p className="text-[#60C042] text-[14px] sm:text-[15px] font-medium leading-relaxed">
            Manage your scheduled interviews, view today's timeline, and track candidate evaluations.
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
            <Link to="/calendar">
              <Calendar className="mr-1.5 h-4 w-4" /> View Calendar
            </Link>
          </Button>
          <div className="shrink-0 group cursor-pointer hidden sm:block">
            <span className="text-7xl drop-shadow-2xl inline-block origin-bottom hover:animate-bounce cursor-default select-none">
              🎯
            </span>
          </div>
        </div>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <TopStat title="Total Scheduled" value={totalScheduled} icon={Calendar} theme="blue" trendLabel="all rounds" />
        <TopStat title="Today's Interviews" value={todaysInterviews} icon={Clock} theme="emerald" trendLabel="active today" />
        <TopStat title="This Week" value={thisWeek} icon={CalendarDays} theme="purple" trendLabel="scheduled" />
        <TopStat title="Feedback Pending" value={feedbackPending} icon={MessageSquareWarning} theme="amber" trendLabel="needs action" />
        <TopStat title="Cancelled" value={cancelled} icon={XCircle} theme="rose" trendLabel="total cancelled" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left Area: Filters & Table */}
        <div className="lg:col-span-3 space-y-4">
          <Card className="p-3 bg-white border-border/50 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] rounded-3xl">
            <div className="flex flex-wrap gap-3 items-center">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <Input
                  placeholder="Search by candidate or position..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 h-9 text-xs bg-slate-50 border-slate-200 rounded-lg"
                />
              </div>

              <select
                className="h-9 w-[130px] rounded-lg border border-slate-200 bg-white px-3 text-xs shadow-sm font-semibold text-slate-700"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="all">All Types</option>
                <option value="technical">Technical</option>
                <option value="hr">HR</option>
                <option value="final round">Final Round</option>
              </select>

              <select
                className="h-9 w-[130px] rounded-lg border border-slate-200 bg-white px-3 text-xs shadow-sm font-semibold text-slate-700"
                value={interviewerFilter}
                onChange={(e) => setInterviewerFilter(e.target.value)}
              >
                <option value="all">All Interviewers</option>
                <option value="john doe">John Doe</option>
                <option value="sarah smith">Sarah Smith</option>
                <option value="mike johnson">Mike Johnson</option>
              </select>

              <Button
                variant="outline"
                className="h-9 text-xs font-semibold rounded-lg bg-white border-slate-200"
              >
                <Filter className="mr-1.5 h-3.5 w-3.5" /> More Filters
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
                    <th className="px-4 py-3 font-bold">Date & Time</th>
                    <th className="px-4 py-3 font-bold">Interviewer</th>
                    <th className="px-4 py-3 font-bold">Status</th>
                    <th className="px-4 py-3 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredInterviews.map((inv) => {
                    const dateObj = new Date(inv.date);
                    return (
                      <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3">
                          {inv.candidate_id ? (
                            <Link to={`/candidates/${inv.candidate_id}`} className="font-bold text-slate-900 text-[12px] hover:text-blue-600 transition-colors block">
                              {inv.candidateName}
                            </Link>
                          ) : (
                            <div 
                              onClick={() => { setSelectedInterview(inv); setIsViewOpen(true); }}
                              className="font-bold text-slate-900 text-[12px] hover:text-blue-600 cursor-pointer"
                            >
                              {inv.candidateName}
                            </div>
                          )}
                          <div className="text-slate-500 text-[10px] mt-0.5">{inv.candidateEmail}</div>
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
                          <div className="font-bold text-slate-700">
                            {dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </div>
                          <div className="text-slate-500 text-[10px]">
                            {dateObj.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                          </div>
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
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 font-bold border ring-1 ring-inset", getStatusBadge(inv.status))}>
                              {inv.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-[9px] font-bold text-slate-500">
                            {inv.mode === "Online" ? <Video className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}
                            {inv.mode}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-7 w-7 text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                              title="View interview details"
                              onClick={() => {
                                setSelectedInterview(inv);
                                setIsViewOpen(true);
                              }}
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-blue-600">
                                  <MoreHorizontal className="h-3.5 w-3.5" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="rounded-xl border-border/40">
                                <DropdownMenuItem>Reschedule</DropdownMenuItem>
                                <DropdownMenuItem>Update Status</DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive focus:text-destructive">Cancel Interview</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredInterviews.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-slate-500 font-medium">
                        No upcoming interviews match your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Today's Schedule */}
          <Card className="p-5 bg-white border-border/50 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] rounded-3xl">
            <h3 className="text-[13px] font-bold text-slate-900 mb-4 flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-indigo-500" />
              Today's Schedule
            </h3>
            <div className="space-y-4 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
              {interviewsList.filter(i => i.date && new Date(i.date).toDateString() === new Date().toDateString()).map((inv, idx) => (
                <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-4 h-4 rounded-full border-2 border-white bg-indigo-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2" />
                  <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] p-3 rounded-xl bg-slate-50/80 border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-900 text-[11px]">{inv.candidateName}</span>
                      <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                        {new Date(inv.date).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <div className="text-[9px] text-slate-500 mb-2">{inv.type} Interview</div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-4 h-4 rounded-full bg-slate-200 flex items-center justify-center text-[7px] font-bold text-slate-600">
                        {inv.interviewer.charAt(0)}
                      </div>
                      <span className="text-[9px] font-medium text-slate-600">{inv.interviewer}</span>
                    </div>
                  </div>
                </div>
              ))}
              {todaysInterviews === 0 && (
                <div className="text-[11px] text-slate-500 text-center font-medium">No interviews scheduled today.</div>
              )}
            </div>
          </Card>

          {/* Internal Notifications */}
          <Card className="p-5 bg-white border-border/50 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] rounded-3xl">
            <h3 className="text-[13px] font-bold text-slate-900 mb-4 flex items-center gap-2">
              <BellRing className="h-4 w-4 text-amber-500" />
              Action Needed
            </h3>
            <div className="space-y-3">
              {mockNotifications.map(notif => (
                <div key={notif.id} className={cn(
                  "flex items-start gap-3 p-3 rounded-xl border",
                  notif.type === "pending" ? "bg-amber-50/50 border-amber-100" : "bg-blue-50/50 border-blue-100"
                )}>
                  <div className={cn(
                    "p-1.5 rounded-lg shrink-0 mt-0.5",
                    notif.type === "pending" ? "bg-amber-100 text-amber-600" : "bg-blue-100 text-blue-600"
                  )}>
                    {notif.type === "pending" ? <AlertCircle className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-slate-900 leading-snug">
                      {notif.text}
                    </div>
                    <div className="text-[9px] font-medium text-slate-500 mt-1">{notif.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* View Interview Details Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-md rounded-2xl p-6 bg-white shadow-xl">
          <DialogHeader className="pb-3 border-b border-slate-100">
            <div className="flex items-center justify-between pr-6">
              <DialogTitle className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                Interview Details
              </DialogTitle>
            </div>
          </DialogHeader>

          {selectedInterview && (
            <div className="space-y-4 pt-1">
              {/* Candidate Card */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-black text-sm">
                    {(selectedInterview.candidateName || "C").charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{selectedInterview.candidateName}</h4>
                    <p className="text-xs text-slate-500">{selectedInterview.candidateEmail || selectedInterview.position}</p>
                  </div>
                </div>
                {selectedInterview.candidate_id && (
                  <Link 
                    to={`/candidates/${selectedInterview.candidate_id}`}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 bg-white px-2.5 py-1.5 rounded-lg border border-blue-100 shadow-xs"
                  >
                    Profile <ExternalLink className="w-3 h-3" />
                  </Link>
                )}
              </div>

              {/* Grid details */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl border border-slate-100 bg-white">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Interview Round</span>
                  <span className="font-bold text-slate-800 text-[13px]">{selectedInterview.type || "Technical"}</span>
                </div>

                <div className="p-3 rounded-xl border border-slate-100 bg-white">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Status</span>
                  <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border", getStatusBadge(selectedInterview.status))}>
                    {selectedInterview.status || "Scheduled"}
                  </span>
                </div>

                <div className="p-3 rounded-xl border border-slate-100 bg-white">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Date & Time</span>
                  <div className="font-bold text-slate-800">
                    {new Date(selectedInterview.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {new Date(selectedInterview.date).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-slate-100 bg-white">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Interviewer</span>
                  <div className="font-bold text-slate-800">{selectedInterview.interviewer || "Not Assigned"}</div>
                  <div className="text-[11px] text-slate-500 capitalize">{selectedInterview.mode || "Online"}</div>
                </div>
              </div>

              {/* Position & Department */}
              <div className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-500">Target Role:</span>
                <span className="font-bold text-slate-800">{selectedInterview.position} {selectedInterview.department ? `(${selectedInterview.department})` : ''}</span>
              </div>

              {/* Meeting Link or Location */}
              {selectedInterview.meeting_link && (
                <div className="p-3 rounded-xl border border-blue-100 bg-blue-50/40 text-xs flex justify-between items-center">
                  <div className="truncate mr-2">
                    <span className="text-[10px] font-bold text-blue-600 block uppercase">Meeting / Room Link</span>
                    <a 
                      href={selectedInterview.meeting_link.startsWith('http') ? selectedInterview.meeting_link : `https://${selectedInterview.meeting_link}`} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="font-semibold text-blue-700 underline truncate block"
                    >
                      {selectedInterview.meeting_link}
                    </a>
                  </div>
                  <Video className="w-4 h-4 text-blue-500 shrink-0" />
                </div>
              )}

              {/* Notes */}
              {selectedInterview.notes && (
                <div className="p-3 rounded-xl border border-slate-100 bg-slate-50 text-xs">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase mb-1">Notes</span>
                  <p className="text-slate-700">{selectedInterview.notes}</p>
                </div>
              )}

              {/* Feedback if available */}
              {selectedInterview.feedback && (
                <div className="p-3 rounded-xl border border-emerald-100 bg-emerald-50/40 text-xs">
                  <span className="text-[10px] font-bold text-emerald-700 block uppercase mb-1">Feedback</span>
                  <p className="text-slate-700">{selectedInterview.feedback}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                {selectedInterview.candidate_id && (
                  <Link 
                    to={`/candidates/${selectedInterview.candidate_id}`}
                    className="flex-1 py-2 px-3 text-center bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-colors"
                  >
                    View Full Candidate Profile
                  </Link>
                )}
                <Button 
                  variant="outline" 
                  onClick={() => setIsViewOpen(false)}
                  className="px-4 py-2 text-xs font-bold rounded-xl"
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
