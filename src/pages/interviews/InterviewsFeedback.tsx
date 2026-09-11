import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { API_BASE_URL } from "@/config/api";
import { getAuthHeaders, putInterviewAPI } from "@/services/candidate-api";
import { toast } from "sonner";
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
  AlertTriangle,
  Calendar,
  ExternalLink,
  Star,
  ThumbsUp,
  ThumbsDown,
  X
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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

const mockPending = [
  { id: "PF-001", candidate_id: "cand_6a28f748cb835", candidateName: "Emma Stone", position: "Marketing Manager", department: "Digital Marketing", date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), type: "Technical", interviewer: "Sarah Smith", daysPending: 3 },
  { id: "PF-002", candidate_id: "cand_6a28f748cdd06", candidateName: "Ryan Gosling", position: "DevOps Engineer", department: "Software Development", date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), type: "HR", interviewer: "John Doe", daysPending: 1 },
  { id: "PF-003", candidate_id: "cand_6a28f748cf1f3", candidateName: "Chris Evans", position: "QA Tester", department: "QA Testing", date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), type: "Final Round", interviewer: "Mike Johnson", daysPending: 5 },
  { id: "PF-004", candidate_id: "cand_6a28f748cf615", candidateName: "Scarlett Johansson", position: "Business Analyst", department: "Business Development", date: new Date().toISOString(), type: "Technical", interviewer: "Sarah Smith", daysPending: 0 },
];

export default function InterviewsFeedback() {
  const [searchTerm, setSearchTerm] = useState("");
  const [interviewerFilter, setInterviewerFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [pendingList, setPendingList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [viewItem, setViewItem] = useState<any | null>(null);
  const [submitItem, setSubmitItem] = useState<any | null>(null);
  const [rating, setRating] = useState(4);
  const [recommendation, setRecommendation] = useState<string>("Strong Hire");
  const [resultVal, setResultVal] = useState<string>("Passed");
  const [feedbackText, setFeedbackText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    fetch(`${API_BASE_URL}/candidates/interviews.php`, {
      credentials: 'include',
      headers: getAuthHeaders(false)
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const now = Date.now();
          const pending = data
            .filter((i: any) => !i.feedback || i.feedback.trim() === '')
            .map((i: any) => {
              const interviewTime = new Date(i.date).getTime();
              const daysPending = Math.max(0, Math.floor((now - interviewTime) / (1000 * 60 * 60 * 24)));
              return {
                ...i,
                daysPending,
              };
            });
          setPendingList(pending);
        }
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const handleRemind = (item: any) => {
    const interviewerName = item.interviewer || "the interviewer";
    toast.success(`Reminder sent to ${interviewerName} for ${item.candidateName}'s feedback!`, {
      description: "An automated notification and email have been dispatched."
    });
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submitItem) return;
    setIsSubmitting(true);

    try {
      if (submitItem.id && String(submitItem.id).match(/^\d+$/)) {
        await putInterviewAPI(String(submitItem.id), {
          candidate_id: submitItem.candidate_id,
          feedback: feedbackText || "Feedback submitted.",
          rating: rating,
          recommendation: recommendation,
          result: resultVal || (recommendation === "Do Not Hire" ? "Failed" : "Passed"),
          status: "Completed"
        });
      }

      toast.success(`Feedback for ${submitItem.candidateName} saved successfully!`);
      setPendingList(prev => prev.filter(p => p.id !== submitItem.id));
      setSubmitItem(null);
      setFeedbackText("");
      setRating(4);
      setRecommendation("Strong Hire");
      setResultVal("Passed");
    } catch (err: any) {
      toast.error(err.message || "Failed to submit feedback");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredPending = useMemo(() => {
    return pendingList.filter(item => {
      const name = (item.candidateName || "").toLowerCase();
      const pos = (item.position || "").toLowerCase();
      const interviewer = (item.interviewer || "").toLowerCase();
      const dept = (item.department || "").toLowerCase();
      const search = searchTerm.toLowerCase();

      const matchesSearch = name.includes(search) || pos.includes(search);
      const matchesInterviewer = interviewerFilter === "all" || interviewer.includes(interviewerFilter.toLowerCase());
      const matchesDept = departmentFilter === "all" || dept.includes(departmentFilter.toLowerCase());
      return matchesSearch && matchesInterviewer && matchesDept;
    });
  }, [pendingList, searchTerm, interviewerFilter, departmentFilter]);

  const totalPending = pendingList.length;
  const pendingToday = pendingList.filter(i => i.daysPending === 0).length;
  const pendingThisWeek = pendingList.filter(i => i.daysPending <= 7).length;
  const overdueFeedback = pendingList.filter(i => i.daysPending > 2).length;

  const topInterviewers = useMemo(() => {
    const counts: Record<string, number> = {};
    pendingList.forEach(item => {
      const name = item.interviewer || "Unassigned";
      counts[name] = (counts[name] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([name, count]) => ({
        name,
        count,
        avatar: (name || "U").charAt(0).toUpperCase()
      }));
  }, [pendingList]);

  return (
    <div className="space-y-6 pb-10">
      {/* Top Banner (Signature Dark Teal / Cyan Gradient) */}
      <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-r from-[#000C22] via-[#0B2524] to-[#0D2823] shadow-lg border border-teal-900/40 p-8 sm:p-10 text-white flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6">
        <div className="relative z-10 flex flex-col justify-center max-w-xl">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-2 text-white">Feedback Pending</h1>
          <p className="text-[#60C042] text-[14px] sm:text-[15px] font-medium leading-relaxed">
            Track and remind interviewers to submit candidate evaluation and scorecard reviews.
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
            <Link to="/interviews/upcoming">
              <Calendar className="mr-1.5 h-4 w-4" /> All Interviews
            </Link>
          </Button>
          <div className="shrink-0 group cursor-pointer hidden sm:block">
            <span className="text-7xl drop-shadow-2xl inline-block origin-bottom hover:animate-bounce cursor-default select-none">
              📝
            </span>
          </div>
        </div>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <TopStat title="Total Pending" value={totalPending} icon={MessageSquareWarning} theme="blue" trendLabel="awaiting feedback" />
        <TopStat title="Pending Today" value={pendingToday} icon={Clock} theme="emerald" trendLabel="conducted today" />
        <TopStat title="This Week" value={pendingThisWeek} icon={CalendarDays} theme="purple" trendLabel="scheduled 7 days" />
        <TopStat title="Overdue (>2 Days)" value={overdueFeedback} icon={AlertOctagon} theme="rose" trendLabel="urgent action" />
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
                className="h-9 w-[140px] rounded-lg border border-slate-200 bg-white px-3 text-xs shadow-sm font-semibold text-slate-700"
                value={interviewerFilter}
                onChange={(e) => setInterviewerFilter(e.target.value)}
              >
                <option value="all">All Interviewers</option>
                {topInterviewers.map((intv, idx) => (
                  <option key={idx} value={intv.name.toLowerCase()}>{intv.name}</option>
                ))}
              </select>

              <select
                className="h-9 w-[150px] rounded-lg border border-slate-200 bg-white px-3 text-xs shadow-sm font-semibold text-slate-700"
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
              >
                <option value="all">All Departments</option>
                <option value="software">Software Development</option>
                <option value="multimedia">Multimedia & Design</option>
                <option value="marketing">Digital Marketing</option>
              </select>
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
                      <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3">
                          {inv.candidate_id ? (
                            <Link to={`/candidates/${inv.candidate_id}`} className="font-bold text-slate-900 text-[12px] hover:text-blue-600 cursor-pointer block">
                              {inv.candidateName}
                            </Link>
                          ) : (
                            <div 
                              onClick={() => setViewItem(inv)} 
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
                        <td className="px-4 py-3 font-bold text-slate-700">
                          {new Date(inv.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[8px] font-bold text-slate-600">
                              {(inv.interviewer || "U").charAt(0)}
                            </div>
                            <span className="font-medium text-slate-700">{inv.interviewer || "Unassigned"}</span>
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
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-7 text-[10px] font-bold border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-blue-600"
                              onClick={() => setViewItem(inv)}
                              title="View details"
                            >
                              <Eye className="w-3.5 h-3.5 mr-1" /> View
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-7 text-[10px] font-bold border-amber-200 text-amber-600 bg-amber-50 hover:bg-amber-100 hover:text-amber-700"
                              onClick={() => handleRemind(inv)}
                              title="Send reminder to interviewer"
                            >
                              <BellRing className="w-3.5 h-3.5 mr-1" /> Remind
                            </Button>
                            <Button 
                              size="sm" 
                              className="h-7 text-[10px] font-bold bg-indigo-600 hover:bg-indigo-700 text-white"
                              onClick={() => {
                                setSubmitItem(inv);
                                setFeedbackText("");
                                setRating(4);
                                setRecommendation("Strong Hire");
                              }}
                              title="Submit interview evaluation feedback"
                            >
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
              {topInterviewers.length === 0 && (
                <p className="text-xs text-slate-400 text-center py-2">No pending evaluations</p>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* View Interview Modal */}
      <Dialog open={!!viewItem} onOpenChange={(open) => !open && setViewItem(null)}>
        <DialogContent className="max-w-md rounded-2xl p-6 bg-white shadow-xl">
          <DialogHeader className="pb-3 border-b border-slate-100">
            <DialogTitle className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-600" />
              Interview Information
            </DialogTitle>
          </DialogHeader>

          {viewItem && (
            <div className="space-y-4 pt-1">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-black text-sm">
                    {(viewItem.candidateName || "C").charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{viewItem.candidateName}</h4>
                    <p className="text-xs text-slate-500">{viewItem.candidateEmail || viewItem.position}</p>
                  </div>
                </div>
                {viewItem.candidate_id && (
                  <Link 
                    to={`/candidates/${viewItem.candidate_id}`}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 bg-white px-2.5 py-1.5 rounded-lg border border-indigo-100 shadow-xs"
                  >
                    Profile <ExternalLink className="w-3 h-3" />
                  </Link>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl border border-slate-100 bg-white">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Interview Round</span>
                  <span className="font-bold text-slate-800 text-[13px]">{viewItem.type}</span>
                </div>

                <div className="p-3 rounded-xl border border-slate-100 bg-white">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Interviewer</span>
                  <span className="font-bold text-slate-800 text-[13px]">{viewItem.interviewer || "Unassigned"}</span>
                </div>

                <div className="p-3 rounded-xl border border-slate-100 bg-white">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Date & Time</span>
                  <div className="font-bold text-slate-800">
                    {new Date(viewItem.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {new Date(viewItem.date).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-slate-100 bg-white">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Pending Time</span>
                  <span className="font-bold text-rose-600 text-[13px]">
                    {viewItem.daysPending === 0 ? "Today" : `${viewItem.daysPending} days ago`}
                  </span>
                </div>
              </div>

              {viewItem.notes && (
                <div className="p-3 rounded-xl border border-slate-100 bg-slate-50 text-xs">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase mb-1">Interview Notes</span>
                  <p className="text-slate-700">{viewItem.notes}</p>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button 
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs"
                  onClick={() => {
                    const target = viewItem;
                    setViewItem(null);
                    setSubmitItem(target);
                    setFeedbackText("");
                    setRating(4);
                    setRecommendation("Strong Hire");
                  }}
                >
                  <CheckCircle className="w-3.5 h-3.5 mr-1" /> Submit Feedback
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setViewItem(null)}
                  className="px-4 py-2 text-xs font-bold rounded-xl"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Submit Feedback Modal */}
      <Dialog open={!!submitItem} onOpenChange={(open) => !open && setSubmitItem(null)}>
        <DialogContent className="max-w-lg rounded-2xl p-6 bg-white shadow-xl">
          <DialogHeader className="pb-3 border-b border-slate-100">
            <DialogTitle className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              Submit Interview Evaluation Scorecard
            </DialogTitle>
          </DialogHeader>

          {submitItem && (
            <form onSubmit={handleSubmitFeedback} className="space-y-4 pt-1">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-900 text-sm block">{submitItem.candidateName}</span>
                  <span className="text-slate-500">{submitItem.position} • {submitItem.type}</span>
                </div>
                <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-md">
                  {submitItem.interviewer || "Evaluation"}
                </span>
              </div>

              {/* Rating */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">Rating (1 to 5 Stars)</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRating(star)}
                      className={cn(
                        "p-2 rounded-xl border transition-all flex items-center gap-1 text-xs font-bold",
                        rating >= star
                          ? "bg-amber-50 border-amber-300 text-amber-600 shadow-xs"
                          : "bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100"
                      )}
                    >
                      <Star className={cn("w-4 h-4", rating >= star ? "fill-amber-400 text-amber-500" : "text-slate-300")} />
                      {star}
                    </button>
                  ))}
                </div>
              </div>

              {/* Recommendation */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">Recommendation</label>
                <div className="grid grid-cols-3 gap-2">
                  {["Strong Hire", "Hire", "Do Not Hire"].map((rec) => (
                    <button
                      type="button"
                      key={rec}
                      onClick={() => setRecommendation(rec)}
                      className={cn(
                        "py-2 px-3 rounded-xl border text-xs font-bold text-center transition-all",
                        recommendation === rec
                          ? rec === "Do Not Hire"
                            ? "bg-rose-50 border-rose-300 text-rose-700 shadow-xs"
                            : "bg-emerald-50 border-emerald-300 text-emerald-700 shadow-xs"
                          : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                      )}
                    >
                      {rec}
                    </button>
                  ))}
                </div>
              </div>

              {/* Feedback notes */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">Detailed Feedback & Evaluation Notes</label>
                <textarea
                  required
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="Summarize candidate technical proficiency, communication skills, and hiring decision rationale..."
                  rows={4}
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>

              <div className="flex gap-2 pt-2 border-t border-slate-100">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs py-2"
                >
                  {isSubmitting ? "Saving..." : "Save & Complete Feedback"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSubmitItem(null)}
                  className="px-4 py-2 text-xs font-bold rounded-xl"
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
