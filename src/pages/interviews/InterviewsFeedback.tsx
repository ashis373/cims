import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  MessageSquareWarning,
  Clock,
  CalendarDays,
  AlertOctagon,
  Search,
  Filter,
  Eye,
  CheckCircle,
  BellRing,
  User,
  AlertTriangle
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

const mockPending = [
  { id: "PF-001", candidateName: "Emma Stone", position: "Marketing Manager", department: "Digital Marketing", date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), type: "Technical", interviewer: "Sarah Smith", daysPending: 3 },
  { id: "PF-002", candidateName: "Ryan Gosling", position: "DevOps Engineer", department: "software development", date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), type: "HR", interviewer: "John Doe", daysPending: 1 },
  { id: "PF-003", candidateName: "Chris Evans", position: "QA Tester", department: "QA testing", date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), type: "Final Round", interviewer: "Mike Johnson", daysPending: 5 },
  { id: "PF-004", candidateName: "Scarlett Johansson", position: "Business Analyst", department: "Business Development", date: new Date().toISOString(), type: "Technical", interviewer: "Sarah Smith", daysPending: 0 },
];

export default function InterviewsFeedback() {
  const [searchTerm, setSearchTerm] = useState("");
  const [interviewerFilter, setInterviewerFilter] = useState("all");

  const filteredPending = useMemo(() => {
    return mockPending.filter(item => {
      const matchesSearch = item.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            item.position.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesInterviewer = interviewerFilter === "all" || item.interviewer.toLowerCase() === interviewerFilter.toLowerCase();
      return matchesSearch && matchesInterviewer;
    });
  }, [searchTerm, interviewerFilter]);

  const totalPending = mockPending.length;
  const pendingToday = mockPending.filter(i => i.daysPending === 0).length;
  const pendingThisWeek = mockPending.filter(i => i.daysPending <= 7).length;
  const overdueFeedback = mockPending.filter(i => i.daysPending > 2).length;

  const topInterviewers = [
    { name: "Sarah Smith", count: 2, avatar: "S" },
    { name: "Mike Johnson", count: 1, avatar: "M" },
    { name: "John Doe", count: 1, avatar: "J" },
  ];

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Feedback Pending</h1>
          <p className="text-[13px] text-slate-500 mt-1">
            Track and remind interviewers to submit their candidate evaluation forms.
          </p>
        </div>
      </div>

      {/* Top Stats */}
      <div className="flex flex-wrap gap-4">
        <TopStat title="Total Pending" value={totalPending} icon={MessageSquareWarning} tone="bg-blue-50 text-blue-600" borderTone="border-blue-500" />
        <TopStat title="Pending Today" value={pendingToday} icon={Clock} tone="bg-indigo-50 text-indigo-600" borderTone="border-indigo-500" />
        <TopStat title="This Week" value={pendingThisWeek} icon={CalendarDays} tone="bg-purple-50 text-purple-600" borderTone="border-purple-500" />
        <TopStat title="Overdue (>2 Days)" value={overdueFeedback} icon={AlertOctagon} tone="bg-red-50 text-red-600" borderTone="border-red-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left Area: Filters & Table */}
        <div className="lg:col-span-3 space-y-4">
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
                value={interviewerFilter}
                onChange={(e) => setInterviewerFilter(e.target.value)}
              >
                <option value="all">All Interviewers</option>
                <option value="sarah smith">Sarah Smith</option>
                <option value="john doe">John Doe</option>
                <option value="mike johnson">Mike Johnson</option>
              </select>

              <select
                className="h-9 w-[130px] rounded-lg border border-slate-200 bg-white px-3 text-xs shadow-sm font-semibold text-slate-700"
              >
                <option value="all">All Departments</option>
                <option value="engineering">Software Development</option>
                <option value="marketing">Digital Marketing</option>
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
                    <th className="px-4 py-3 font-bold">Pending</th>
                    <th className="px-4 py-3 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPending.map((inv) => {
                    const isOverdue = inv.daysPending > 2;
                    return (
                      <tr key={inv.id} className={cn("transition-colors", isOverdue ? "bg-red-50/30 hover:bg-red-50/50" : "hover:bg-slate-50")}>
                        <td className="px-4 py-3">
                          <div className="font-bold text-slate-900 text-[12px]">{inv.candidateName}</div>
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
                        <td className="px-4 py-3 font-bold text-slate-700">
                          {new Date(inv.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
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
                          {isOverdue ? (
                            <span className="inline-flex items-center gap-1 text-red-600 font-bold bg-red-50 px-2 py-0.5 rounded-full border border-red-100">
                              <AlertTriangle className="w-3 h-3" />
                              {inv.daysPending} days overdue
                            </span>
                          ) : (
                            <span className="text-slate-600 font-bold">
                              {inv.daysPending === 0 ? "Today" : `${inv.daysPending} days`}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button variant="outline" size="sm" className="h-7 text-[10px] font-bold border-slate-200 text-slate-600">
                              <Eye className="w-3.5 h-3.5 mr-1" /> View
                            </Button>
                            <Button variant="outline" size="sm" className="h-7 text-[10px] font-bold border-amber-200 text-amber-600 bg-amber-50 hover:bg-amber-100 hover:text-amber-700">
                              <BellRing className="w-3.5 h-3.5 mr-1" /> Remind
                            </Button>
                            <Button size="sm" className="h-7 text-[10px] font-bold bg-indigo-600 hover:bg-indigo-700 text-white">
                              <CheckCircle className="w-3.5 h-3.5 mr-1" /> Submit
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredPending.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-slate-500 font-medium">
                        No pending feedback found.
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
          <Card className="p-5 bg-white border-border/50 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] rounded-3xl">
            <h3 className="text-[13px] font-bold text-slate-900 mb-4 flex items-center gap-2">
              <User className="h-4 w-4 text-indigo-500" />
              Top Pending Interviewers
            </h3>
            <div className="space-y-4">
              {topInterviewers.map((intv, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">
                      {intv.avatar}
                    </div>
                    <span className="text-[12px] font-bold text-slate-700">{intv.name}</span>
                  </div>
                  <span className="text-[11px] font-black text-rose-500 bg-rose-50 px-2.5 py-1 rounded-full">
                    {intv.count} Pending
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
