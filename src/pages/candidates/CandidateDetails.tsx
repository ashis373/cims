import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useAts, PIPELINE_STAGES } from "@/services/ats-store";
import { STAGE_COLORS, type Stage } from "@/types/ats-types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  ChevronRight,
  Mail,
  Phone,
  MapPin,
  Pencil,
  AlertCircle,
  FileText,
  Calendar,
  Clock,
  CheckCircle2,
  Trash2,
  Ban,
  ShieldAlert,
  Download,
  MoreVertical,
  Plus,
  MessageSquare,
  Activity,
  User,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { API_BASE_URL } from "@/config/api";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

function DetailItem({
  label,
  value,
  isRecruiter,
}: {
  label: string;
  value: string;
  isRecruiter?: boolean;
}) {
  return (
    <div className="min-w-0">
      <div className="text-[10px] font-bold text-slate-500 mb-1">{label}</div>
      {isRecruiter && value !== "-" ? (
        <div className="flex items-center gap-2 min-w-0">
          <img
            src={`https://api.dicebear.com/7.x/notionists/svg?seed=${value}`}
            alt=""
            className="h-5 w-5 rounded-full bg-slate-100 shrink-0"
          />
          <span className="text-[12px] font-bold text-slate-900 truncate">{value}</span>
        </div>
      ) : (
        <div className="text-[12px] font-bold text-slate-900 break-all">{value}</div>
      )}
    </div>
  );
}

export default function CandidateProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { candidates, setStage, remove, update } = useAts();
  const candidate = candidates.find((c) => c.id === id);

  const [del, setDel] = useState(false);
  const [blacklistDialogOpen, setBlacklistDialogOpen] = useState(false);
  const [blacklistReason, setBlacklistReason] = useState("");
  const [fullDetailsOpen, setFullDetailsOpen] = useState(false);
  const [fullTimelineOpen, setFullTimelineOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Overview");

  if (!candidate) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Candidate not found.</p>
        <Link to="/candidates" className="text-primary text-sm font-bold hover:underline">
          Back to list
        </Link>
      </div>
    );
  }

  const initials = candidate.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const scrollToSection = (tab: string) => {
    setActiveTab(tab);
    const element = document.getElementById(tab.toLowerCase().replace(" ", "-"));
    if (element) {
      const y = element.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  const handleStageSelect = (v: string) => {
    setStage(candidate.id, v as Stage);
    toast.success(`Status updated to ${v}`);
  };

  const confirmBlacklist = () => {
    if (!blacklistReason.trim()) {
      toast.error("Reason is required");
      return;
    }
    update(
      candidate.id,
      {
        isBlacklisted: true,
        blacklistReason,
      },
      `Candidate blacklisted: ${blacklistReason}`,
    );
    toast.success("Candidate blacklisted");
    setBlacklistDialogOpen(false);
  };

  const unblacklist = () => {
    update(
      candidate.id,
      {
        isBlacklisted: false,
        blacklistReason: "",
      },
      "Candidate removed from blacklist",
    );
    toast.success("Removed from blacklist");
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  const formatDateTime = (d: string) => {
    const date = new Date(d);
    return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) + ", " + date.toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit' });
  };
  const daysInPipeline = Math.max(
    0,
    Math.floor(
      (new Date().getTime() - new Date(candidate.appliedAt).getTime()) / (1000 * 3600 * 24),
    ),
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-[13px] text-slate-500 mb-2 font-semibold">
        <Link
          to="/candidates"
          className="flex items-center gap-1.5 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Candidates
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-slate-900 font-bold">{candidate.name}</span>
      </div>

      {/* Alerts */}
      {candidate.alerts?.map((alert: any, i: number) => (
        <div key={i} className="flex items-center justify-between rounded-xl bg-red-50/80 p-4 border border-red-100 shadow-sm mb-4">
          <div className="flex items-start gap-3 text-red-600">
            <div className="mt-0.5">
              <AlertCircle className="h-4 w-4" />
            </div>
            <div>
              <div className="font-bold text-[13px]">{alert.type} Candidate</div>
              <div className="text-[11px] font-semibold text-red-500 mt-0.5">
                Reason: {alert.reason} <span className="text-red-400 font-medium ml-2">({formatDate(alert.recordedAt)})</span>
              </div>
            </div>
          </div>
          {alert.type === 'Blacklisted' && (
            <Button
              variant="outline"
              className="bg-white text-red-600 border-red-200 hover:bg-red-50 text-[11px] font-bold h-8"
              onClick={unblacklist}
            >
              Unblock
            </Button>
          )}
        </div>
      ))}

      {/* Header Card */}
      <Card className="p-6 bg-white border-border/50 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] rounded-2xl">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="flex gap-6">
            <div className="h-[72px] w-[72px] rounded-full bg-[#8b5cf6] text-white flex items-center justify-center text-2xl font-bold uppercase shrink-0 shadow-sm">
              {initials}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold tracking-tight text-slate-900">
                  {candidate.name}
                </h1>
                {candidate.isBlacklisted && (
                  <Badge className="bg-red-500 hover:bg-red-600 text-white text-[9px] font-bold px-2 py-0.5 uppercase tracking-wider rounded-md">
                    BLACKLISTED
                  </Badge>
                )}
              </div>
              <div className="text-[13px] font-medium text-slate-600 mt-1">{candidate.role}</div>
              <div className="flex flex-wrap items-center gap-5 text-[11px] text-slate-500 font-bold mt-3">
                <span className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-slate-400" /> {candidate.email}
                </span>
                {candidate.phone && (
                  <span className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-slate-400" /> {candidate.phone}
                  </span>
                )}
                {candidate.location && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" /> {candidate.location}{" "}
                    {candidate.preferredLocation && `(Pref: ${candidate.preferredLocation})`}
                  </span>
                )}
              </div>
              {candidate.skills && candidate.skills.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4 items-center">
                  {candidate.skills.slice(0, 3).map((t) => (
                    <Badge
                      key={t}
                      variant="secondary"
                      className="bg-slate-100 text-slate-600 hover:bg-slate-200 text-[10px] font-bold px-2.5 py-0.5 rounded-md border-transparent"
                    >
                      {t}
                    </Badge>
                  ))}
                  {candidate.skills.length > 3 && (
                    <span className="text-[11px] font-bold text-blue-600 hover:underline cursor-pointer ml-1">
                      +{candidate.skills.length - 3} more
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col items-end gap-1.5 mt-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Current Stage
            </span>
            <Badge
              className={cn(
                "px-3 py-1 text-[11px] font-bold rounded-full border-transparent",
                STAGE_COLORS[candidate.stage] || "bg-slate-100 text-slate-700",
              )}
            >
              {candidate.stage}
            </Badge>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-8 mt-8 border-b border-slate-100 px-2 overflow-x-auto">
          {[
            { name: "Overview", color: "text-blue-600", border: "bg-blue-600" },
            { name: "Timeline", color: "text-emerald-600", border: "bg-emerald-600" },
            { name: "Interviews", color: "text-purple-600", border: "bg-purple-600" },
            { name: "Applications", color: "text-orange-600", border: "bg-orange-600" },
            { name: "Documents", color: "text-rose-600", border: "bg-rose-600" },
            { name: "Notes", color: "text-amber-600", border: "bg-amber-600" },
            { name: "Activity Log", color: "text-teal-600", border: "bg-teal-600" },
          ].map((tab) => (
            <button
              key={tab.name}
              onClick={() => scrollToSection(tab.name)}
              className={cn(
                "pb-3 text-[12px] font-bold transition-colors relative whitespace-nowrap",
                tab.name === activeTab ? tab.color : "text-slate-500 hover:text-slate-900",
              )}
            >
              {tab.name}
              {tab.name === activeTab && (
                <div className={cn("absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full", tab.border)} />
              )}
            </button>
          ))}
        </div>
      </Card>

      {/* Top Stats Row */}
      <div className="flex flex-wrap items-center px-6 py-5 bg-white border border-border/50 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] rounded-2xl gap-8">
        {[
          { label: "Total Experience\nYears", value: candidate.experience || "-" },
          { label: "Relevant Experience\nYears", value: candidate.relevantExperience || "-" },
          { label: "Current CTC", value: candidate.currentCtc || "-" },
          { label: "Expected CTC", value: candidate.expectedCtc || "-" },
          { label: "Notice Period", value: candidate.noticePeriod || "-" },
        ].map((stat, i) => (
          <div
            key={i}
            className="flex flex-col gap-1.5 border-r border-slate-100 pr-8 last:border-0 last:pr-0 flex-1 min-w-[120px]"
          >
            <span className="text-xl font-bold text-slate-900">{stat.value}</span>
            <span className="text-[10px] font-bold text-slate-400 whitespace-pre-line leading-tight">
              {stat.label}
            </span>
          </div>
        ))}
        <div className="flex flex-col gap-1.5 flex-1 min-w-[120px]">
          <span className="text-[10px] font-bold text-slate-400 leading-tight">Applied On</span>
          <div className="flex items-center justify-between mt-1">
            <span className="text-[13px] font-bold text-slate-900">
              {formatDate(candidate.appliedAt)}
            </span>
            <Calendar className="h-4 w-4 text-slate-400" />
          </div>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">
        {/* Main Content Area (Left 75%) */}
        <div className="xl:col-span-3">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Candidate Details */}
            <Card id="overview" className={cn("col-span-1 p-5 bg-white border shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] rounded-2xl relative flex flex-col transition-all duration-300", activeTab === "Overview" || activeTab === "Applications" ? "border-blue-500 ring-1 ring-blue-500 shadow-blue-100" : "border-border/50")}>
              <div className="absolute top-5 right-5">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-slate-400 hover:text-blue-600 rounded-md bg-slate-50"
                  asChild
                >
                  <Link to={`/candidates/${candidate.id}/edit`}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
              <h3 className="text-[13px] font-bold text-slate-900 mb-5">Candidate Details</h3>
              <div className="grid grid-cols-2 gap-y-5 gap-x-4 flex-1">
                <DetailItem label="Full Name" value={candidate.name} />
                <DetailItem label="Current Company" value={candidate.currentCompany || "-"} />
                <DetailItem label="Email" value={candidate.email} />
                <DetailItem label="Position" value={candidate.role} />
                <DetailItem label="Phone" value={candidate.phone || "-"} />
                <DetailItem label="Source" value={candidate.source || "-"} />
                <DetailItem label="Current Location" value={candidate.location || "-"} />
                <DetailItem label="Recruiter" value={candidate.recruiter || "-"} isRecruiter />
                <DetailItem label="Preferred Location" value={candidate.preferredLocation || "-"} />
                <DetailItem label="Application Date" value={formatDate(candidate.appliedAt)} />
              </div>
              <div className="mt-5 pt-3 border-t border-slate-100 text-center">
                <Button variant="link" className="text-blue-600 text-[11px] font-bold" onClick={() => setFullDetailsOpen(true)}>
                  View Full Details →
                </Button>
              </div>
            </Card>

            {/* Candidate Timeline */}
            <Card id="timeline" className={cn("col-span-1 p-5 bg-white border shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] rounded-2xl flex flex-col transition-all duration-300", activeTab === "Timeline" || activeTab === "Activity Log" ? "border-emerald-500 ring-1 ring-emerald-500 shadow-emerald-100" : "border-border/50")}>
              <h3 className="text-[13px] font-bold text-slate-900 mb-5">Candidate Timeline</h3>
              <div className="space-y-4 flex-1 relative before:absolute before:inset-0 before:ml-4 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-100 before:to-transparent hidden md:block">
                {candidate.activity.slice().reverse().slice(0, 4).map((item, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div
                      className={cn(
                        "h-8 w-8 rounded-full border-2 border-white flex items-center justify-center shrink-0 z-10",
                        i === 0 ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-500",
                      )}
                    >
                      {item.message.includes('Created') || item.message.includes('Application') ? <FileText className="h-3.5 w-3.5" /> :
                       item.message.includes('Interview') ? <Users className="h-3.5 w-3.5" /> :
                       item.message.includes('Offer') ? <Mail className="h-3.5 w-3.5" /> :
                       item.message.includes('Reject') || item.message.includes('Decline') ? <Trash2 className="h-3.5 w-3.5" /> :
                       <Activity className="h-3.5 w-3.5" />}
                    </div>
                    <div className="flex-1 pb-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <div
                            className={cn(
                              "text-[11px] font-bold",
                              i === 0 ? "text-slate-900" : "text-slate-600",
                            )}
                          >
                            {item.message.split(':')[0] || "Update"}
                          </div>
                          <div className="text-[9px] font-bold text-slate-400 mt-0.5">
                            {formatDateTime(item.at)}
                          </div>
                        </div>
                        <Badge
                          className={cn(
                            "text-[9px] font-bold px-1.5 py-0 rounded border-transparent uppercase tracking-wider",
                            i === 0 ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-500",
                          )}
                        >
                          {i === 0 ? "Current" : "Completed"}
                        </Badge>
                      </div>
                      {item.message.includes(':') && (
                        <div className="text-[10px] text-slate-500 mt-1 font-medium bg-slate-50 p-1.5 rounded-md border border-slate-100 inline-block">
                          {item.message.split(':')[1].trim()}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-5 pt-3 border-t border-slate-100 text-center">
                <Button variant="link" className="text-blue-600 text-[11px] font-bold" onClick={() => setFullTimelineOpen(true)}>
                  View Full Timeline →
                </Button>
              </div>
            </Card>

            {/* Latest Notes */}
            <Card id="notes" className={cn("col-span-1 p-5 bg-white border shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] rounded-2xl flex flex-col transition-all duration-300", activeTab === "Notes" ? "border-amber-500 ring-1 ring-amber-500 shadow-amber-100" : "border-border/50")}>
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-[13px] font-bold text-slate-900">Latest Notes</h3>
                <Button
                  variant="ghost"
                  className="h-6 px-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 text-[11px] font-bold"
                  onClick={async () => {
                    const text = window.prompt("Enter note text:");
                    if (!text) return;
                    try {
                      const res = await fetch(`${API_BASE_URL}/notes.php`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ candidate_id: candidate.id, text, createdBy: "Admin" })
                      });
                      if (res.ok) window.location.reload();
                    } catch (e) {
                      toast.error("Failed to add note");
                    }
                  }}
                >
                  <Plus className="h-3.5 w-3.5 mr-1" /> Add Note
                </Button>
              </div>
              <div className="space-y-4 flex-1">
                {candidate.notesList?.map((note: any, i: number) => (
                  <div key={i} className="flex gap-3">
                    <img
                      src={`https://api.dicebear.com/7.x/notionists/svg?seed=${note.createdBy}`}
                      alt=""
                      className="h-7 w-7 rounded-full bg-slate-100 shrink-0"
                    />
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-bold text-slate-900">{note.createdBy}</span>
                        <span className="text-[9px] font-bold text-slate-400">{formatDateTime(note.createdAt)}</span>
                      </div>
                      <div className="text-[10px] font-semibold text-slate-600 mt-1 leading-relaxed">
                        {note.text}
                      </div>
                    </div>
                  </div>
                ))}
                {(!candidate.notesList || candidate.notesList.length === 0) && (
                  <div className="text-center text-slate-400 text-[11px] font-bold py-6">
                    No notes added yet.
                  </div>
                )}
              </div>
              <div className="mt-5 pt-3 border-t border-slate-100 text-center">
                <Button variant="link" className="text-blue-600 text-[11px] font-bold">
                  View All Notes →
                </Button>
              </div>
            </Card>

            {/* Interview History */}
            <Card id="interviews" className={cn("col-span-1 lg:col-span-2 p-5 bg-white border shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] rounded-2xl flex flex-col transition-all duration-300", activeTab === "Interviews" ? "border-purple-500 ring-1 ring-purple-500 shadow-purple-100" : "border-border/50")}>
              <h3 className="text-[13px] font-bold text-slate-900 mb-4">Interview History</h3>
              <div className="overflow-x-auto flex-1">
                <table className="w-full text-left text-[11px]">
                  <thead className="border-b border-slate-100 text-slate-400 font-bold">
                    <tr>
                      <th className="py-2.5 px-2">Stage</th>
                      <th className="py-2.5 px-2">Interviewers</th>
                      <th className="py-2.5 px-2">Date</th>
                      <th className="py-2.5 px-2">Feedback</th>
                      <th className="py-2.5 px-2 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 font-semibold text-slate-700">
                    {candidate.interviewsList?.map((interview: any, i: number) => (
                      <tr key={i}>
                        <td className="py-3 px-2">{interview.type}</td>
                        <td className="py-3 px-2">
                          <div className="flex -space-x-2">
                            <img
                              src={`https://api.dicebear.com/7.x/notionists/svg?seed=${interview.id}`}
                              className="h-6 w-6 rounded-full border-2 border-white bg-slate-100"
                              title="Interviewer"
                            />
                          </div>
                        </td>
                        <td className="py-3 px-2 text-slate-500">{formatDateTime(interview.interviewDate)}</td>
                        <td className="py-3 px-2">{interview.feedback || "-"}</td>
                        <td className="py-3 px-2 text-right">
                          <Badge className={cn(
                            "text-[9px] uppercase border-transparent",
                            interview.status === 'Completed' ? "bg-emerald-100 text-emerald-600 hover:bg-emerald-100" :
                            interview.status === 'Scheduled' ? "bg-blue-100 text-blue-600 hover:bg-blue-100" :
                            "bg-slate-100 text-slate-600 hover:bg-slate-100"
                          )}>
                            {interview.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                    {(!candidate.interviewsList || candidate.interviewsList.length === 0) && (
                      <tr>
                        <td colSpan={5} className="py-6 text-center text-[11px] font-bold text-slate-400">
                          No interviews scheduled yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="mt-2 pt-3 border-t border-slate-100 text-center">
                <Button variant="link" className="text-blue-600 text-[11px] font-bold">
                  View All Interviews →
                </Button>
              </div>
            </Card>

            {/* Applications History */}
            <Card id="applications" className={cn("col-span-1 p-5 bg-white border shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] rounded-2xl flex flex-col transition-all duration-300", activeTab === "Applications" ? "border-orange-500 ring-1 ring-orange-500 shadow-orange-100" : "border-border/50")}>
              <h3 className="text-[13px] font-bold text-slate-900 mb-4">Application History</h3>
              <div className="overflow-x-auto flex-1">
                <table className="w-full text-left text-[11px]">
                  <thead className="border-b border-slate-100 text-slate-400 font-bold">
                    <tr>
                      <th className="py-2.5 px-2">Role Applied</th>
                      <th className="py-2.5 px-2">Source</th>
                      <th className="py-2.5 px-2">Date</th>
                      <th className="py-2.5 px-2 text-right">Stage</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 font-semibold text-slate-700">
                    {candidate.applicationsList?.map((app: any, i: number) => (
                      <tr key={i}>
                        <td className="py-3 px-2 font-bold text-slate-900">{app.role_applied || "-"}</td>
                        <td className="py-3 px-2 text-slate-500">{app.source || "-"}</td>
                        <td className="py-3 px-2 text-slate-500">{formatDate(app.appliedAt)}</td>
                        <td className="py-3 px-2 text-right">
                          <Badge className="bg-orange-50 text-orange-600 text-[9px] uppercase border-transparent hover:bg-orange-100">
                            {app.stage}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                    {(!candidate.applicationsList || candidate.applicationsList.length === 0) && (
                      <tr>
                        <td colSpan={4} className="py-6 text-center text-[11px] font-bold text-slate-400">
                          No applications found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Documents */}
            <Card id="documents" className={cn("col-span-1 p-5 bg-white border shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] rounded-2xl flex flex-col transition-all duration-300", activeTab === "Documents" ? "border-rose-500 ring-1 ring-rose-500 shadow-rose-100" : "border-border/50")}>
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-[13px] font-bold text-slate-900">Documents</h3>
                <input 
                  type="file" 
                  id="doc-upload" 
                  className="hidden" 
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const formData = new FormData();
                    formData.append("file", file);
                    formData.append("candidate_id", candidate.id);
                    try {
                      const res = await fetch(`${API_BASE_URL}/documents.php`, {
                        method: "POST",
                        body: formData
                      });
                      if (res.ok) window.location.reload();
                    } catch (err) {
                      toast.error("Upload failed");
                    }
                  }}
                />
                <Button
                  variant="ghost"
                  className="h-6 px-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 text-[11px] font-bold"
                  onClick={() => document.getElementById("doc-upload")?.click()}
                >
                  <Plus className="h-3.5 w-3.5 mr-1" /> Add Document
                </Button>
              </div>
              <div className="space-y-4 flex-1">
                {[
                  candidate.resume ? {
                    name: candidate.resume.split('_').slice(1).join('_') || candidate.resume,
                    rawName: candidate.resume,
                    date: new Date(candidate.updatedAt).toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' }),
                    color: "text-blue-500 bg-blue-50",
                  } : null,
                  ...(candidate.documentsList?.map((d: any) => ({
                    name: d.name,
                    rawName: d.filePath,
                    date: new Date(d.uploadedAt).toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' }),
                    color: "text-emerald-500 bg-emerald-50",
                  })) || [])
                ].filter(Boolean).map((doc: any, i) => (
                  <div key={i} className="flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "h-8 w-8 rounded-lg flex items-center justify-center shrink-0",
                          doc.color,
                        )}
                      >
                        <FileText className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-[11px] font-bold text-slate-900 truncate max-w-[150px]" title={doc.name}>{doc.name}</div>
                        <div className="text-[9px] font-bold text-slate-400 mt-0.5">
                          Uploaded on {doc.date}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 transition-opacity">
                      <a href={`${API_BASE_URL}/uploads/${doc.rawName}`} target="_blank" rel="noreferrer">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-slate-400 hover:text-blue-600"
                        >
                          <Download className="h-3.5 w-3.5" />
                        </Button>
                      </a>
                    </div>
                  </div>
                ))}
                {(!candidate.resume && (!candidate.documentsList || candidate.documentsList.length === 0)) && (
                  <div className="text-center text-slate-400 text-[11px] font-bold py-6">
                    No documents found.
                  </div>
                )}
              </div>
              <div className="mt-5 pt-3 border-t border-slate-100 text-center">
                <Button variant="link" className="text-blue-600 text-[11px] font-bold">
                  View All Documents →
                </Button>
              </div>
            </Card>
          </div>
        </div>

        {/* Right Sidebar (Right 25%) */}
        <div className="xl:col-span-1 space-y-6">
          {/* Actions */}
          <Card className="p-5 bg-white border-border/50 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] rounded-2xl">
            <h3 className="text-[13px] font-bold text-slate-900 mb-4">Actions</h3>
            <div className="space-y-2">
              <Select value={candidate.stage} onValueChange={handleStageSelect}>
                <SelectTrigger className="w-full h-9 bg-blue-50/50 border-blue-100 text-blue-700 font-bold text-[11px] rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5" />{" "}
                    <SelectValue placeholder="Update Status" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {PIPELINE_STAGES.map((s) => (
                    <SelectItem key={s} value={s} className="text-[11px] font-bold">
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                className="w-full justify-start h-9 text-[11px] font-bold text-slate-700 border-slate-200 rounded-lg"
              >
                <Calendar className="mr-2 h-3.5 w-3.5 text-slate-400" /> Schedule Interview
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start h-9 text-[11px] font-bold text-slate-700 border-slate-200 rounded-lg"
                onClick={() => handleStageSelect("Offer Released")}
              >
                <FileText className="mr-2 h-3.5 w-3.5 text-slate-400" /> Release Offer
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start h-9 text-[11px] font-bold text-slate-700 border-slate-200 rounded-lg"
              >
                <Mail className="mr-2 h-3.5 w-3.5 text-slate-400" /> Send Email
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start h-9 text-[11px] font-bold text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 rounded-lg mt-2"
                onClick={() => handleStageSelect("Rejected")}
              >
                <Trash2 className="mr-2 h-3.5 w-3.5" /> Reject Candidate
              </Button>

              {candidate.isBlacklisted ? (
                <Button
                  variant="outline"
                  className="w-full justify-start h-9 text-[11px] font-bold text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 rounded-lg"
                  onClick={unblacklist}
                >
                  <ShieldAlert className="mr-2 h-3.5 w-3.5" /> Unblacklist Candidate
                </Button>
              ) : (
                <Button
                  variant="outline"
                  className="w-full justify-start h-9 text-[11px] font-bold text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 rounded-lg"
                  onClick={() => setBlacklistDialogOpen(true)}
                >
                  <ShieldAlert className="mr-2 h-3.5 w-3.5" /> Blacklist Candidate
                </Button>
              )}
            </div>
          </Card>

          {/* Quick Info */}
          <Card className="p-5 bg-white border-border/50 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] rounded-2xl">
            <h3 className="text-[13px] font-bold text-slate-900 mb-4">Quick Info</h3>
            <div className="space-y-3.5">
              <div className="flex justify-between items-center pb-3.5 border-b border-slate-100 last:border-0 last:pb-0">
                <span className="text-[11px] font-bold text-slate-500">Status</span>
                <span className="text-[11px] font-bold text-slate-900">{candidate.stage}</span>
              </div>
              <div className="flex justify-between items-center pb-3.5 border-b border-slate-100 last:border-0 last:pb-0">
                <span className="text-[11px] font-bold text-slate-500">Days in Pipeline</span>
                <span className="text-[11px] font-bold text-slate-900">{daysInPipeline} days</span>
              </div>
              <div className="flex justify-between items-center pb-3.5 border-b border-slate-100 last:border-0 last:pb-0">
                <span className="text-[11px] font-bold text-slate-500">Total Interviews</span>
                <span className="text-[11px] font-bold text-slate-900">2</span>
              </div>
              <div className="flex justify-between items-center pb-3.5 border-b border-slate-100 last:border-0 last:pb-0">
                <span className="text-[11px] font-bold text-slate-500">Applications</span>
                <span className="text-[11px] font-bold text-slate-900">1</span>
              </div>
              <div className="flex justify-between items-center pb-3.5 border-b border-slate-100 last:border-0 last:pb-0">
                <span className="text-[11px] font-bold text-slate-500">Last Activity</span>
                <span className="text-[11px] font-bold text-slate-900">
                  {formatDate(candidate.updatedAt)}
                </span>
              </div>
            </div>
          </Card>

          {/* Alerts */}
          <Card className="p-5 bg-white border-border/50 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] rounded-2xl">
            <h3 className="text-[13px] font-bold text-slate-900 mb-4">Alerts</h3>
            <div className="space-y-3">
              <div className="bg-orange-50/80 border border-orange-100 rounded-xl p-3 flex gap-3">
                <AlertCircle className="h-4 w-4 text-orange-500 shrink-0 mt-0.5" />
                <div>
                  <div className="text-[11px] font-bold text-orange-700">Previously Offered</div>
                  <div className="text-[10px] font-semibold text-orange-600 mt-1 leading-relaxed">
                    Offer was released on 08 Jun 2026 and declined on 09 Jun 2026.
                  </div>
                </div>
              </div>
              {candidate.isBlacklisted && (
                <div className="bg-red-50/80 border border-red-100 rounded-xl p-3 flex gap-3">
                  <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-[11px] font-bold text-red-700">Blacklisted Candidate</div>
                    <div className="text-[10px] font-semibold text-red-600 mt-1 leading-relaxed">
                      Reason: {candidate.blacklistReason || "many time apply ok"}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      <AlertDialog open={del} onOpenChange={setDel}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this candidate?</AlertDialogTitle>
            <AlertDialogDescription>
              You can undo this from the top bar within the current session.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                remove([candidate.id]);
                toast.success("Candidate deleted");
                navigate("/candidates");
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={blacklistDialogOpen} onOpenChange={setBlacklistDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Blacklist Candidate</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to blacklist this candidate? This will alert recruiters if they
              apply again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Label>Reason for Blacklisting</Label>
            <Textarea
              value={blacklistReason}
              onChange={(e) => setBlacklistReason(e.target.value)}
              placeholder="e.g. Falsified documents, unprofessional behavior..."
              className="mt-2"
              required
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button variant="destructive" onClick={confirmBlacklist}>
              Blacklist
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={fullDetailsOpen} onOpenChange={setFullDetailsOpen}>
        <DialogContent className="max-w-2xl bg-white border-0 shadow-2xl rounded-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">
              Full Candidate Details
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-y-6 gap-x-8 mt-4">
            <div className="space-y-4">
              <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 pb-2">Personal Information</h4>
              <DetailItem label="Full Name" value={candidate.name} />
              <DetailItem label="Email" value={candidate.email} />
              <DetailItem label="Phone" value={candidate.phone || "-"} />
              <DetailItem label="Alternate Mobile" value={candidate.alternateMobile || "-"} />
              <DetailItem label="Current Location" value={candidate.location || "-"} />
              <DetailItem label="Preferred Location" value={candidate.preferredLocation || "-"} />
              <DetailItem label="LinkedIn Profile" value={candidate.linkedInProfile || "-"} />
            </div>
            
            <div className="space-y-4">
              <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 pb-2">Professional Details</h4>
              <DetailItem label="Position Applied" value={candidate.role} />
              <DetailItem label="Department" value={candidate.department || "-"} />
              <DetailItem label="Total Experience" value={candidate.experience ? `${candidate.experience} Years` : "-"} />
              <DetailItem label="Relevant Experience" value={candidate.relevantExperience ? `${candidate.relevantExperience} Years` : "-"} />
              <DetailItem label="Current Company" value={candidate.currentCompany || "-"} />
              <DetailItem label="Current Designation" value={candidate.currentDesignation || "-"} />
            </div>

            <div className="space-y-4">
              <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 pb-2">Compensation & Notice</h4>
              <DetailItem label="Current CTC" value={candidate.currentCtc || "-"} />
              <DetailItem label="Expected CTC" value={candidate.expectedCtc || "-"} />
              <DetailItem label="Notice Period" value={candidate.noticePeriod ? `${candidate.noticePeriod} Days` : "-"} />
            </div>

            <div className="space-y-4">
              <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 pb-2">Application Info</h4>
              <DetailItem label="Source" value={candidate.source || "-"} />
              <DetailItem label="Stage" value={candidate.stage} />
              <DetailItem label="Recruiter" value={candidate.recruiter || "-"} isRecruiter />
              <DetailItem label="Applied At" value={formatDate(candidate.appliedAt)} />
              <div>
                <span className="block text-[11px] font-bold text-slate-500 mb-1.5">Skills</span>
                <div className="flex flex-wrap gap-1">
                  {candidate.skills && candidate.skills.length > 0 ? (
                    candidate.skills.map((skill) => (
                      <Badge key={skill} variant="secondary" className="bg-slate-100 text-[10px] font-bold text-slate-600 px-2 rounded-md">
                        {skill}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-[13px] font-bold text-slate-900">-</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={fullTimelineOpen} onOpenChange={setFullTimelineOpen}>
        <DialogContent className="max-w-md bg-white border-0 shadow-2xl rounded-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">
              Full Activity Timeline
            </DialogTitle>
          </DialogHeader>
          <div className="mt-6 space-y-6 relative before:absolute before:inset-0 before:ml-4 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-100 before:to-transparent">
            {candidate.activity.slice().reverse().map((item, i) => (
              <div key={i} className="flex items-start gap-4">
                <div
                  className={cn(
                    "h-8 w-8 rounded-full border-2 border-white flex items-center justify-center shrink-0 z-10",
                    i === 0 ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-500",
                  )}
                >
                  {item.message.includes('Created') || item.message.includes('Application') ? <FileText className="h-3.5 w-3.5" /> :
                   item.message.includes('Interview') ? <Users className="h-3.5 w-3.5" /> :
                   item.message.includes('Offer') ? <Mail className="h-3.5 w-3.5" /> :
                   item.message.includes('Reject') || item.message.includes('Decline') ? <Trash2 className="h-3.5 w-3.5" /> :
                   <Activity className="h-3.5 w-3.5" />}
                </div>
                <div className="flex-1 pb-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <div
                        className={cn(
                          "text-[11px] font-bold",
                          i === 0 ? "text-slate-900" : "text-slate-600",
                        )}
                      >
                        {item.message.split(':')[0] || "Update"}
                      </div>
                      <div className="text-[9px] font-bold text-slate-400 mt-0.5">
                        {formatDateTime(item.at)}
                      </div>
                    </div>
                    <Badge
                      className={cn(
                        "text-[9px] font-bold px-1.5 py-0 rounded border-transparent uppercase tracking-wider",
                        i === 0 ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-500",
                      )}
                    >
                      {i === 0 ? "Current" : "Completed"}
                    </Badge>
                  </div>
                  {item.message.includes(':') && (
                    <div className="text-[10px] text-slate-500 mt-1 font-medium bg-slate-50 p-1.5 rounded-md border border-slate-100 inline-block">
                      {item.message.split(':')[1].trim()}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
