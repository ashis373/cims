import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  MessageSquareWarning,
  ChevronRight,
  BellRing
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

  const filteredInterviews = useMemo(() => {
    return mockInterviews.filter(inv => {
      const matchesSearch = inv.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            inv.position.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = typeFilter === "all" || inv.type.toLowerCase() === typeFilter.toLowerCase();
      const matchesInterviewer = interviewerFilter === "all" || inv.interviewer.toLowerCase() === interviewerFilter.toLowerCase();
      return matchesSearch && matchesType && matchesInterviewer;
    });
  }, [searchTerm, typeFilter, interviewerFilter]);

  // Derive Stats
  const totalScheduled = mockInterviews.length;
  const todaysInterviews = mockInterviews.filter(i => new Date(i.date).toDateString() === new Date().toDateString()).length;
  const thisWeek = mockInterviews.length; // mock
  const feedbackPending = 3; // mock
  const cancelled = 1; // mock

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Upcoming Interviews</h1>
          <p className="text-[13px] text-slate-500 mt-1">
            Manage your scheduled interviews, view today's timeline, and track pending confirmations.
          </p>
        </div>
      </div>

      {/* Top Stats */}
      <div className="flex flex-wrap gap-4">
        <TopStat title="Total Scheduled" value={totalScheduled} icon={Calendar} tone="bg-blue-50 text-blue-600" borderTone="border-blue-500" />
        <TopStat title="Today's Interviews" value={todaysInterviews} icon={Clock} tone="bg-indigo-50 text-indigo-600" borderTone="border-indigo-500" />
        <TopStat title="This Week" value={thisWeek} icon={CalendarDays} tone="bg-purple-50 text-purple-600" borderTone="border-purple-500" />
        <TopStat title="Feedback Pending" value={feedbackPending} icon={MessageSquareWarning} tone="bg-amber-50 text-amber-600" borderTone="border-amber-500" />
        <TopStat title="Cancelled" value={cancelled} icon={XCircle} tone="bg-red-50 text-red-500" borderTone="border-red-500" />
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
                          <div className="font-bold text-slate-900 text-[12px] hover:text-blue-600 cursor-pointer">
                            {inv.candidateName}
                          </div>
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
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-blue-600">
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
              {mockInterviews.filter(i => new Date(i.date).toDateString() === new Date().toDateString()).map((inv, idx) => (
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
    </div>
  );
}
