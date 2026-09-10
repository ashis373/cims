import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useAts, PIPELINE_STAGES } from "@/services/ats-store";
import { STAGE_COLORS, INTERVIEW_TYPES, type Stage } from "@/types/ats-types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { ScheduleInterviewDialog } from "@/components/feature/ScheduleInterviewDialog";
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
  MoreHorizontal,
  Plus,
  MessageSquare,
  Activity,
  User,
  Users,
  Eye,
  Briefcase,
  Wallet,
  Target,
  Video,
  Star,
  ExternalLink,
  MessageSquareWarning,
  XCircle,
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
      <div className="text-[12px] font-bold text-slate-900 break-all">{value}</div>
    </div>
  );
}

export default function CandidateProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { candidates, setStage, remove, update, addInterview, updateInterview, refresh } = useAts();
  const candidate = candidates.find((c) => c.id === id);

  useEffect(() => {
    if (id && refresh) {
      refresh();
    }
  }, [id, refresh]);

  let currentUser = "System";
  try {
    const userStr = localStorage.getItem("cims_user");
    if (userStr) {
      const u = JSON.parse(userStr);
      currentUser = u.full_name || u.name || u.role_name || "System";
    }
  } catch (e) { }

  const [del, setDel] = useState(false);
  const [blacklistDialogOpen, setBlacklistDialogOpen] = useState(false);
  const [blacklistReason, setBlacklistReason] = useState("");
  const [fullDetailsOpen, setFullDetailsOpen] = useState(false);
  const [fullTimelineOpen, setFullTimelineOpen] = useState(false);
  const [fullActivityLogOpen, setFullActivityLogOpen] = useState(false);
  const [allNotesOpen, setAllNotesOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Overview");
  const [addNoteOpen, setAddNoteOpen] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  const [deleteNoteId, setDeleteNoteId] = useState<number | null>(null);
  const [deleteDoc, setDeleteDoc] = useState<{ id: number, name: string } | null>(null);

  const handleAddNote = async () => {
    if (!noteText.trim()) return;
    try {
      const url = `${API_BASE_URL}/candidates/notes.php`;
      const method = editingNoteId ? "PUT" : "POST";
      const body = editingNoteId
        ? { id: editingNoteId, text: noteText }
        : { candidate_id: candidate.id, text: noteText, createdBy: currentUser };

      const res = await fetch(url, {
        credentials: 'include',
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      if (res.ok) window.location.reload();
    } catch (e) {
      toast.error(editingNoteId ? "Failed to update note" : "Failed to add note");
    }
  };

  const handleDeleteNote = (id: number) => {
    setDeleteNoteId(id);
  };

  const handleDeleteDocument = (id: number, name: string) => {
    setDeleteDoc({ id, name });
  };

  const [sendEmailOpen, setSendEmailOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [emailTemplates, setEmailTemplates] = useState<any[]>([]);
  const [emailLoading, setEmailLoading] = useState(false);
  const [previewData, setPreviewData] = useState<{ subject: string, body: string } | null>(null);

  const fetchEmailTemplates = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/settings/email/templates.php`);
      if (res.ok) {
        const data = await res.json();
        setEmailTemplates(data || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleOpenSendEmail = () => {
    fetchEmailTemplates();
    setSelectedTemplate("");
    setPreviewData(null);
    setSendEmailOpen(true);
  };

  const handlePreviewEmail = () => {
    if (!selectedTemplate) return;
    const template = emailTemplates.find(t => t.id.toString() === selectedTemplate);
    if (template) {
      const parsedSubject = template.subject.replace('{CandidateName}', candidate.name).replace('{Role}', candidate.role);
      const parsedBody = template.body.replace('{CandidateName}', candidate.name).replace('{Role}', candidate.role).replace('{Date}', new Date().toLocaleDateString());
      setPreviewData({ subject: parsedSubject, body: parsedBody });
    }
  };

  const handleSendEmail = async () => {
    if (!selectedTemplate || !previewData) return;
    setEmailLoading(true);
    try {
      const payload = {
        to: candidate.email,
        subject: previewData.subject,
        body: previewData.body,
        template_id: parseInt(selectedTemplate),
        candidate_id: candidate.id,
        unique_hash: `${candidate.id}-${Date.now()}`
      };
      const res = await fetch(`${API_BASE_URL}/settings/email/send_manual.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Email sent successfully!");
        setSendEmailOpen(false);
      } else {
        toast.error(data.message || "Failed to send email");
      }
    } catch (e) {
      console.error(e);
      toast.error("An error occurred while sending email.");
    }
    setEmailLoading(false);
  };

  const [scheduleInterviewOpen, setScheduleInterviewOpen] = useState(false);
  const [interviewDialogMode, setInterviewDialogMode] = useState<"schedule" | "complete" | "update" | "feedback">("schedule");
  const [selectedInterviewForDialog, setSelectedInterviewForDialog] = useState<any | null>(null);
  const [selectedInterviewForView, setSelectedInterviewForView] = useState<any | null>(null);
  const [isInterviewViewOpen, setIsInterviewViewOpen] = useState(false);

  const [cancelInterviewDialogItem, setCancelInterviewDialogItem] = useState<any | null>(null);
  const [cancellationReason, setCancellationReason] = useState("Candidate unavailable");
  const [cancellationCustomReason, setCancellationCustomReason] = useState("");

  const openAddInterview = () => {
    setSelectedInterviewForDialog(null);
    setInterviewDialogMode("schedule");
    setScheduleInterviewOpen(true);
  };

  const openEditInterview = (iv: any) => {
    setSelectedInterviewForDialog(iv);
    setInterviewDialogMode(iv.status === "Completed" ? "complete" : "update");
    setScheduleInterviewOpen(true);
  };

  const openAddFeedback = (iv: any) => {
    setSelectedInterviewForDialog(iv);
    setInterviewDialogMode("feedback");
    setScheduleInterviewOpen(true);
  };

  const openViewInterview = (iv: any) => {
    setSelectedInterviewForView(iv);
    setIsInterviewViewOpen(true);
  };

  const promptCancelInterview = (iv: any) => {
    setCancelInterviewDialogItem(iv);
    setCancellationReason("Candidate unavailable");
    setCancellationCustomReason("");
  };

  const handleConfirmCancelInterview = async () => {
    if (!cancelInterviewDialogItem) return;
    const finalReason = cancellationReason === "Other" 
      ? (cancellationCustomReason.trim() || "Other reason") 
      : cancellationReason;

    try {
      const res = await fetch(`${API_BASE_URL}/candidates/interviews.php?id=${cancelInterviewDialogItem.id}`, {
        credentials: 'include',
        method: "PUT",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidate_id: candidate?.id,
          status: "Cancelled",
          result: "Cancelled",
          cancellation_reason: finalReason,
          notes: cancelInterviewDialogItem.notes 
            ? `${cancelInterviewDialogItem.notes}\n[Cancelled: ${finalReason}]` 
            : `Cancellation Reason: ${finalReason}`
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Interview cancelled successfully");
        setCancelInterviewDialogItem(null);
        if (refresh) refresh();
        else setTimeout(() => window.location.reload(), 300);
      } else {
        toast.error(data.error || "Failed to cancel interview");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error cancelling interview");
    }
  };

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

  const [stageReasonDialogOpen, setStageReasonDialogOpen] = useState(false);
  const [targetStagePending, setTargetStagePending] = useState<Stage | null>(null);
  const [stageReasonInput, setStageReasonInput] = useState("");

  const handleStageSelect = (v: string) => {
    // Prevent early stages from directly moving to Offer or Joined without completing interview rounds
    const isEarlyStage = ["New Applicant", "Shortlisted", "HR Call Scheduled"].includes(candidate.stage);
    const isOfferOrJoined = ["Offer Released", "Offer Accepted", "Offer Declined", "Offer Expired", "Joined"].includes(v);
    if (isEarlyStage && isOfferOrJoined) {
      toast.error(`Candidates in ${candidate.stage} must go through interview rounds before an offer can be released.`);
      return;
    }

    // Interview Scheduled is locked - must complete the interview workflow first
    if (candidate.stage === "Interview Scheduled" && isOfferOrJoined) {
      toast.error(`Interview Scheduled is locked. The interview must be conducted and completed before releasing an offer.`);
      return;
    }

    if (v === "Interview Scheduled") {
      openAddInterview();
      return;
    }
    if (v === "Interview Completed") {
      const latest = candidate.interviewsList?.[0] || null;
      setSelectedInterviewForDialog(latest);
      setInterviewDialogMode("complete");
      setScheduleInterviewOpen(true);
      return;
    }

    // Prompt for reason when moving to outcome states
    if (["Rejected", "No Show", "Offer Declined", "Offer Expired"].includes(v)) {
      setTargetStagePending(v as Stage);
      setStageReasonInput("");
      setStageReasonDialogOpen(true);
      return;
    }

    setStage(candidate.id, v as Stage);
    toast.success(`Status updated to ${v}`);
  };

  const confirmStageReason = () => {
    if (!targetStagePending) return;
    setStage(candidate.id, targetStagePending, stageReasonInput.trim() || undefined);
    toast.success(`Status updated to ${targetStagePending}`);
    setStageReasonDialogOpen(false);
    setTargetStagePending(null);
    setStageReasonInput("");
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
    return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short" }) + ", " + date.toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit' });
  };
  const daysInPipeline = Math.max(
    0,
    Math.floor(
      (new Date().getTime() - new Date(candidate.appliedAt).getTime()) / (1000 * 3600 * 24),
    ),
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Breadcrumb & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
        <div className="flex items-center gap-2 text-[13px] text-slate-500 font-semibold">
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
        <Button
          asChild
          size="sm"
          variant="outline"
          className="h-8 text-[11px] font-bold bg-white text-slate-700 border-slate-200 hover:bg-slate-50 shadow-sm"
        >
          <Link to={`/candidates/${candidate.id}/edit`}>
            <Pencil className="h-3 w-3 mr-1.5 text-blue-600" />
            Edit Profile
          </Link>
        </Button>
      </div>

      {/* Alerts */}
      {(() => {
        const activeAlerts = candidate.alerts?.filter((a: any) => a.type !== 'Blacklisted') || [];
        const latestBlacklist = (candidate.isBlacklisted == 1 || candidate.isBlacklisted === true)
          ? candidate.alerts?.filter((a: any) => a.type === 'Blacklisted').sort((a: any, b: any) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime())[0]
          : null;
        if (latestBlacklist) activeAlerts.unshift(latestBlacklist);
        
        return activeAlerts.map((alert: any, i: number) => (
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
        ));
      })()}

      {/* Header Card */}
      <Card className="p-6 bg-white border-border/50 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] rounded-2xl">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="flex gap-6">
            {candidate.photo ? (
              <div className="h-[72px] w-[72px] rounded-full overflow-hidden shrink-0 shadow-sm border-2 border-white ring-2 ring-slate-100">
                <img
                  src={`${API_BASE_URL}/../uploads/candidates/photos/${candidate.photo}`}
                  alt={candidate.name}
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <div className="h-[72px] w-[72px] rounded-full bg-[#8b5cf6] text-white flex items-center justify-center text-2xl font-bold uppercase shrink-0 shadow-sm border-2 border-white ring-2 ring-slate-100">
                {initials}
              </div>
            )}
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
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className="text-[13px] font-bold text-slate-700">{candidate.role}</span>
                {candidate.department && (
                  <>
                    <span className="text-slate-300 font-black">&middot;</span>
                    <span className="text-[12px] font-semibold text-slate-500">{candidate.department}</span>
                  </>
                )}
                {candidate.recruiter && (
                  <>
                    <span className="text-slate-300 font-black">&middot;</span>
                    <span className="text-[12px] font-bold text-blue-600 flex items-center gap-1.5 bg-blue-50 px-2 py-0.5 rounded-md">
                      <User className="h-3 w-3" /> {candidate.recruiter}
                    </span>
                  </>
                )}
              </div>
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
            { name: "Emails", color: "text-indigo-600", border: "bg-indigo-600" },
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
      <div className="flex flex-wrap items-center px-6 py-6 bg-white border border-border/50 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] rounded-2xl gap-8">
        {[
          { label: "Total Experience", value: candidate.experience || "-", icon: Briefcase, color: "bg-blue-50 text-blue-600", iconColor: "text-blue-600" },
          { label: "Relevant Experience", value: candidate.relevantExperience || "-", icon: Users, color: "bg-emerald-50 text-emerald-600", iconColor: "text-emerald-600" },
          { label: "Current CTC", value: candidate.currentCtc || "-", icon: Wallet, color: "bg-purple-50 text-purple-600", iconColor: "text-purple-600" },
          { label: "Expected CTC", value: candidate.expectedCtc || "-", icon: Target, color: "bg-orange-50 text-orange-600", iconColor: "text-orange-600" },
          { label: "Notice Period", value: candidate.noticePeriod || "-", icon: Clock, color: "bg-sky-50 text-sky-600", iconColor: "text-sky-600" },
          { label: "Application Date", value: formatDate(candidate.appliedAt), icon: Calendar, color: "bg-rose-50 text-rose-600", iconColor: "text-rose-600" },
        ].map((stat, i) => (
          <div
            key={i}
            className="flex items-center gap-4 border-r border-slate-100 pr-8 last:border-0 last:pr-0 flex-1 min-w-[150px]"
          >
            <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border border-white", stat.color)}>
              <stat.icon className="h-5 w-5" strokeWidth={2.5} />
            </div>
            <div>
              <div className="text-[16px] font-black tracking-tight text-slate-900">{stat.value}</div>
              <div className="text-[11px] font-bold text-slate-500 mt-0.5">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 gap-6 items-start">
        {/* Actions Toolbar */}
        <div className="col-span-1">

          {/* Actions */}
          <Card className="p-5 bg-white border-border/50 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] rounded-2xl">
            <h3 className="text-[13px] font-bold text-slate-900 mb-4">Actions</h3>
            <div className="flex flex-wrap items-center gap-3">
              <Select value={candidate.stage} onValueChange={handleStageSelect}>
                <SelectTrigger className="h-9 bg-blue-50/50 border-blue-100 text-blue-700 font-bold text-[11px] rounded-lg">
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
                className="justify-start h-9 text-[11px] font-bold text-slate-700 border-slate-200 rounded-lg"
                onClick={openAddInterview}
              >
                <Calendar className="mr-2 h-3.5 w-3.5 text-slate-400" /> Schedule Interview
              </Button>

              <Button
                variant="outline"
                className="justify-start h-9 text-[11px] font-bold text-slate-700 border-slate-200 rounded-lg"
                onClick={() => handleStageSelect("Offer Released")}
              >
                <FileText className="mr-2 h-3.5 w-3.5 text-slate-400" /> Release Offer
              </Button>

              <Button
                variant="outline"
                className="justify-start h-9 text-[11px] font-bold text-slate-700 border-slate-200 rounded-lg"
                onClick={handleOpenSendEmail}
              >
                <Mail className="mr-2 h-3.5 w-3.5 text-slate-400" /> Send Email
              </Button>

              <Button
                variant="outline"
                className="justify-start h-9 text-[11px] font-bold text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 rounded-lg mt-2"
                onClick={() => handleStageSelect("Rejected")}
              >
                <Trash2 className="mr-2 h-3.5 w-3.5" /> Reject Candidate
              </Button>

              {candidate.isBlacklisted ? (
                <Button
                  variant="outline"
                  className="justify-start h-9 text-[11px] font-bold text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 rounded-lg"
                  onClick={unblacklist}
                >
                  <ShieldAlert className="mr-2 h-3.5 w-3.5" /> Unblacklist Candidate
                </Button>
              ) : (
                <Button
                  variant="outline"
                  className="justify-start h-9 text-[11px] font-bold text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 rounded-lg"
                  onClick={() => setBlacklistDialogOpen(true)}
                >
                  <ShieldAlert className="mr-2 h-3.5 w-3.5" /> Blacklist Candidate
                </Button>
              )}
            </div>
          </Card>


        </div>

        {/* Main Content Area */}
        <div className="col-span-1">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Candidate Details */}
            <Card id="overview" className={cn("col-span-1 p-5 bg-white border shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] rounded-2xl relative flex flex-col transition-all duration-300", activeTab === "Overview" || activeTab === "Applications" ? "border-blue-500 ring-1 ring-blue-500 shadow-blue-100" : "border-border/50")}>
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
                {candidate.activity
                  ?.filter((item: any) => {
                    const msg = item.message.toLowerCase();
                    const action = msg.split(':')[0].trim();
                    if (['profile updated', 'skills updated', 'note added', 'resume uploaded', 'document added', 'document deleted'].includes(action)) return false;
                    if (action === 'candidate updated' && !msg.includes('status changed')) return false;
                    return true;
                  })
                  .slice().reverse().slice(0, 4).map((item: any, i: number) => {
                    let title = item.message.split(':')[0] || "Update";
                    let detail = item.message.includes(':') ? item.message.substring(item.message.indexOf(':') + 1).trim() : null;
                    if (item.message.includes('Status changed:')) {
                      title = 'Status changed';
                      detail = item.message.split('Status changed:')[1].trim();
                    }
                    return (
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
                                {title}
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
                          <div className="text-[10px] text-slate-500 mt-1.5 font-medium bg-slate-50 p-2 rounded-lg border border-slate-100 block">
                            {detail && <div className="mb-1 text-slate-600 font-semibold">{detail}</div>}
                            <div className="font-semibold text-slate-500">
                              By: {item.author || (item.message.toLowerCase().includes("application received") || item.message.toLowerCase().includes("created") ? "System" : (currentUser?.name || "Administrator"))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
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
                  onClick={() => {
                    setEditingNoteId(null);
                    setNoteText("");
                    setAddNoteOpen(true);
                  }}
                >
                  <Plus className="h-3.5 w-3.5 mr-1" /> Add Note
                </Button>
              </div>
              <div className="space-y-4 flex-1">
                {candidate.notesList?.slice(0, 3).map((note: any, i: number) => (
                  <div key={i} className="flex gap-3">

                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-bold text-slate-900">{note.createdBy}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-bold text-slate-400">{formatDateTime(note.createdAt)}</span>
                          <div className="flex gap-1 items-center">
                            <button
                              title="Edit Note"
                              onClick={() => {
                                setEditingNoteId(note.id);
                                setNoteText(note.text);
                                setAddNoteOpen(true);
                              }}
                              className="text-slate-400 hover:text-blue-600 transition-colors p-1"
                            >
                              <Pencil className="h-3 w-3" />
                            </button>
                            <button
                              title="Delete Note"
                              onClick={() => handleDeleteNote(note.id)}
                              className="text-slate-400 hover:text-red-600 transition-colors p-1"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
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
                <Button variant="link" className="text-blue-600 text-[11px] font-bold" onClick={() => setAllNotesOpen(true)}>
                  View All Notes →
                </Button>
              </div>
            </Card>

            <div className="col-span-1 lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Interview History */}
              <Card id="interviews" className={cn("col-span-1 p-5 bg-white border shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] rounded-2xl flex flex-col transition-all duration-300", activeTab === "Interviews" ? "border-purple-500 ring-1 ring-purple-500 shadow-purple-100" : "border-border/50")}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[13px] font-bold text-slate-900">Interview History</h3>
                  <Button
                    variant="ghost"
                    className="h-6 px-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 text-[11px] font-bold"
                    onClick={openAddInterview}
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" /> Schedule Interview
                  </Button>
                </div>
                <div className="overflow-x-auto flex-1">
                  <table className="w-full text-left text-[11px]">
                    <thead className="border-b border-slate-100 text-slate-400 font-bold bg-slate-50/50">
                        <tr>
                          <th className="py-2.5 px-3">Interview Type</th>
                          <th className="py-2.5 px-3">Date & Time</th>
                          <th className="py-2.5 px-3">Mode</th>
                          <th className="py-2.5 px-3">Interviewer</th>
                          <th className="py-2.5 px-3">Status</th>
                          <th className="py-2.5 px-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50 font-semibold text-slate-700">
                        {candidate.interviewsList?.map((iv: any, i: number) => {
                          const isScheduled = iv.status === "Scheduled" || iv.status === "Confirmed" || iv.status === "Rescheduled";
                          const isCompleted = iv.status === "Completed";
                          const feedbackPending = isCompleted && (!iv.feedback || !iv.rating);

                          return (
                            <tr key={i} className="hover:bg-slate-50/80 transition-colors group">
                              <td className="py-3 px-3">
                                <span className="font-bold text-slate-900 block">{iv.type || "-"}</span>
                              </td>
                              <td className="py-3 px-3 text-slate-600">
                                {iv.interviewDate ? formatDateTime(iv.interviewDate) : "-"}
                              </td>
                              <td className="py-3 px-3">
                                <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                                  {iv.mode === "Online" ? (
                                    <Video className="w-3 h-3 text-blue-500" />
                                  ) : iv.mode === "Phone" ? (
                                    <Phone className="w-3 h-3 text-emerald-500" />
                                  ) : (
                                    <MapPin className="w-3 h-3 text-amber-500" />
                                  )}
                                  {iv.mode || "Online"}
                                </span>
                              </td>
                              <td className="py-3 px-3 text-slate-600">{iv.interviewers || "-"}</td>
                              <td className="py-3 px-3">
                                <Badge className={cn("text-[9.5px] font-bold uppercase border-transparent px-2 py-0.5", 
                                  isScheduled ? "bg-blue-50 text-blue-600" :
                                  isCompleted ? "bg-purple-50 text-purple-600" :
                                  iv.status === "Cancelled" ? "bg-red-50 text-red-600" : "bg-slate-100 text-slate-600"
                                )}>
                                  {iv.status}
                                </Badge>
                              </td>
                              <td className="py-3 px-3 text-right">
                                <div className="flex items-center justify-end">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-slate-700 rounded-lg">
                                        <MoreVertical className="h-3.5 w-3.5" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="rounded-xl border border-border/50 shadow-lg min-w-[140px]">
                                      <DropdownMenuItem onClick={() => openViewInterview(iv)} className="text-[11px] font-semibold cursor-pointer">
                                        <Eye className="w-3.5 h-3.5 mr-2 text-slate-400" /> View Details
                                      </DropdownMenuItem>
                                      
                                      {isScheduled && (
                                        <>
                                          <DropdownMenuItem onClick={() => openEditInterview(iv)} className="text-[11px] font-semibold cursor-pointer">
                                            <Pencil className="w-3.5 h-3.5 mr-2 text-slate-400" /> Edit
                                          </DropdownMenuItem>
                                          <DropdownMenuItem onClick={() => promptCancelInterview(iv)} className="text-[11px] font-semibold text-red-600 focus:text-red-600 cursor-pointer">
                                            <XCircle className="w-3.5 h-3.5 mr-2 text-red-500" /> Cancel
                                          </DropdownMenuItem>
                                        </>
                                      )}

                                      {feedbackPending && (
                                        <DropdownMenuItem onClick={() => openAddFeedback(iv)} className="text-[11px] font-semibold text-amber-600 focus:text-amber-600 cursor-pointer">
                                          <MessageSquareWarning className="w-3.5 h-3.5 mr-2 text-amber-500" /> Add Feedback
                                        </DropdownMenuItem>
                                      )}
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                        {(!candidate.interviewsList || candidate.interviewsList.length === 0) && (
                          <tr>
                            <td colSpan={6} className="py-8 text-center text-[11px] font-bold text-slate-400">
                              No interviews recorded yet.
                            </td>
                          </tr>
                        )}
                      </tbody>
                  </table>
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
                          <th className="py-2.5 px-2">Application Date</th>
                          <th className="py-2.5 px-2">Current Stage</th>
                          <th className="py-2.5 px-2">Recruiter</th>
                          <th className="py-2.5 px-2 text-right">Last Updated</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50 font-semibold text-slate-700">
                        {candidate.applicationsList?.map((app: any, i: number) => (
                          <tr key={i}>
                            <td className="py-3 px-2 font-bold text-slate-900">{app.role_applied || app.role || "-"}</td>
                            <td className="py-3 px-2 text-slate-500">{app.source || "-"}</td>
                            <td className="py-3 px-2 text-slate-500">{formatDate(app.appliedAt)}</td>
                            <td className="py-3 px-2">
                              <Badge className="bg-orange-50 text-orange-600 text-[9px] uppercase border-transparent hover:bg-orange-100">
                                {app.stage}
                              </Badge>
                            </td>
                            <td className="py-3 px-2 text-slate-500">{app.recruiter || "-"}</td>
                            <td className="py-3 px-2 text-right text-slate-500">{formatDate(app.appliedAt)}</td>
                          </tr>
                        ))}
                        {(!candidate.applicationsList || candidate.applicationsList.length === 0) && (
                          <tr>
                            <td colSpan={6} className="py-6 text-center text-[11px] font-bold text-slate-400">
                              No applications found.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                </div>
              </Card>
            </div>

            <div className="col-span-1 lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
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
                        const res = await fetch(`${API_BASE_URL}/candidates/documents.php`, {
                          credentials: 'include',
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
                <div className="overflow-x-auto mt-2">
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-100">
                      <tr>
                        <th className="py-3 px-4 font-bold">Document Name</th>
                        <th className="py-3 px-4 font-bold">Uploaded On</th>
                        <th className="py-3 px-4 font-bold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                      {[
                        candidate.resume ? {
                          id: 'resume',
                          name: candidate.resume.split('_').slice(1).join('_') || candidate.resume,
                          rawName: candidate.resume,
                          date: new Date(candidate.updatedAt).toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' }),
                          color: "text-blue-500 bg-blue-50",
                        } : null,
                        ...(candidate.documentsList?.map((d: any) => ({
                          id: d.id,
                          name: d.name,
                          rawName: d.filePath,
                          date: new Date(d.uploadedAt).toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' }),
                          color: "text-emerald-500 bg-emerald-50",
                        })) || [])
                      ].filter(Boolean).map((doc: any, i) => (
                        <tr key={i} className="group hover:bg-slate-50 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div
                                className={cn(
                                  "h-8 w-8 rounded-lg flex items-center justify-center shrink-0",
                                  doc.color,
                                )}
                              >
                                <FileText className="h-4 w-4" />
                              </div>
                              <div className="text-[12px] font-bold text-slate-900 truncate" title={doc.name}>
                                {doc.name}
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-slate-500 font-medium">
                            {doc.date}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <a href={`${API_BASE_URL}/../uploads/candidates/documents/${doc.rawName}`} target="_blank" rel="noreferrer">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-slate-400 hover:text-blue-600"
                                  title="View Document"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </a>
                              <a href={`${API_BASE_URL}/../uploads/candidates/documents/${doc.rawName}`} download target="_blank" rel="noreferrer">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-slate-400 hover:text-blue-600"
                                  title="Download Document"
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                              </a>
                              {doc.id !== 'resume' && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-slate-400 hover:text-red-600"
                                  title="Permanently Delete Document"
                                  onClick={() => handleDeleteDocument(doc.id, doc.name)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                      {(!candidate.resume && (!candidate.documentsList || candidate.documentsList.length === 0)) && (
                        <tr>
                          <td colSpan={3} className="py-8 text-center text-[12px] font-bold text-slate-400">
                            No documents found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>

              {/* Activity Log */}
              <Card id="activity-log" className={cn("col-span-1 p-5 bg-white border shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] rounded-2xl flex flex-col transition-all duration-300", activeTab === "Activity Log" ? "border-teal-500 ring-1 ring-teal-500 shadow-teal-100" : "border-border/50")}>
                <h3 className="text-[13px] font-bold text-slate-900 mb-4">Activity Log</h3>
                <div className="overflow-x-auto flex-1">
                  <table className="w-full text-left text-[11px]">
                    <thead className="border-b border-slate-100 text-slate-400 font-bold">
                      <tr>
                        <th className="py-2.5 px-2">Activity</th>
                        <th className="py-2.5 px-2">Description</th>
                        <th className="py-2.5 px-2">By</th>
                        <th className="py-2.5 px-2 text-right">Date & Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 font-semibold text-slate-700">
                      {candidate.activity?.slice().reverse().slice(0, 5).map((act: any, i: number) => {
                        const title = act.message.includes(':') ? act.message.split(':')[0] : act.message;
                        const desc = act.message.includes(':') ? act.message.substring(act.message.indexOf(':') + 1).trim() : act.message;
                        return (
                          <tr key={i} className="hover:bg-slate-50 transition-colors">
                            <td className="py-3 px-2 font-bold text-slate-900">{title}</td>
                            <td className="py-3 px-2 text-slate-500 max-w-[200px] truncate" title={desc}>{desc}</td>
                            <td className="py-3 px-2">
                              <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-[9px] font-bold">
                                {act.author || (act.message.toLowerCase().includes("application received") || act.message.toLowerCase().includes("created") ? "System" : currentUser)}
                              </span>
                            </td>
                            <td className="py-3 px-2 text-right text-slate-400 whitespace-nowrap">
                              {formatDateTime(act.at)}
                            </td>
                          </tr>
                        );
                      })}
                      {(!candidate.activity || candidate.activity.length === 0) && (
                        <tr>
                          <td colSpan={4} className="py-6 text-center text-[11px] font-bold text-slate-400">
                            No recent activity found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="mt-2 pt-3 border-t border-slate-100 text-center">
                  <Button variant="link" className="text-blue-600 text-[11px] font-bold" onClick={() => setFullActivityLogOpen(true)}>
                    View Full Activity Log →
                  </Button>
                </div>
              </Card>
              {/* Emails */}
              <Card id="emails" className={cn("col-span-1 md:col-span-2 p-5 bg-white border shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] rounded-2xl flex flex-col transition-all duration-300", activeTab === "Emails" ? "border-indigo-500 ring-1 ring-indigo-500 shadow-indigo-100" : "border-border/50")}>
                <h3 className="text-[13px] font-bold text-slate-900 mb-4">Emails</h3>
                <div className="overflow-x-auto flex-1">
                  <table className="w-full text-left text-[11px]">
                    <thead className="border-b border-slate-100 text-slate-400 font-bold">
                      <tr>
                        <th className="py-2.5 px-2">Template / Subject</th>
                        <th className="py-2.5 px-2">Sending Method</th>
                        <th className="py-2.5 px-2 text-right">Status</th>
                        <th className="py-2.5 px-2 text-right">Sent On</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 font-semibold text-slate-700">
                      {candidate.emailLogs?.map((log: any, i: number) => {
                        const isAuto = log.unique_hash?.startsWith('auto-');
                        return (
                          <tr key={i} className="hover:bg-slate-50 transition-colors">
                            <td className="py-3 px-2">
                              <div className="font-bold text-slate-900">{log.template_name || "Email Log"}</div>
                              <div className="text-slate-500 truncate max-w-[200px] mt-0.5" title={log.subject}>{log.subject}</div>
                            </td>
                            <td className="py-3 px-2">
                              <Badge className={cn("text-[9px] uppercase border-transparent", isAuto ? "bg-purple-50 text-purple-600" : "bg-slate-100 text-slate-600")}>
                                {isAuto ? "Automatic" : "Manual"}
                              </Badge>
                            </td>
                            <td className="py-3 px-2 text-right">
                              <Badge className={cn("text-[9px] uppercase border-transparent inline-flex items-center gap-1", log.status === 'Delivered' ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600")}>
                                {log.status === 'Delivered' && <CheckCircle2 className="h-3 w-3" />}
                                {log.status}
                              </Badge>
                            </td>
                            <td className="py-3 px-2 text-right text-slate-400 whitespace-nowrap">
                              {formatDateTime(log.sent_at)}
                            </td>
                          </tr>
                        );
                      })}
                      {(!candidate.emailLogs || candidate.emailLogs.length === 0) && (
                        <tr>
                          <td colSpan={4} className="py-6 text-center text-[11px] font-bold text-slate-400">
                            No emails sent to this candidate yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          </div>
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
        <DialogContent aria-describedby={undefined} className="max-w-2xl bg-white border-0 shadow-2xl rounded-2xl max-h-[90vh] overflow-y-auto">
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
              <DetailItem label="Total Experience" value={candidate.experience || "-"} />
              <DetailItem label="Relevant Experience" value={candidate.relevantExperience || "-"} />
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
        <DialogContent aria-describedby={undefined} className="max-w-md bg-white border-0 shadow-2xl rounded-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">
              Full Activity Timeline
            </DialogTitle>
          </DialogHeader>
          <div className="mt-6 space-y-6 relative before:absolute before:inset-0 before:ml-4 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-100 before:to-transparent">
            {candidate.activity?.filter((item: any) => {
              const msg = item.message.toLowerCase();
              const action = msg.split(':')[0].trim();
              if (['profile updated', 'skills updated', 'note added', 'resume uploaded', 'document added', 'document deleted'].includes(action)) return false;
              if (action === 'candidate updated' && !msg.includes('status changed')) return false;
              return true;
            }).slice().reverse().map((item, i) => {
              let title = item.message.split(':')[0] || "Update";
              let detail = item.message.includes(':') ? item.message.substring(item.message.indexOf(':') + 1).trim() : null;
              if (item.message.includes('Status changed:')) {
                title = 'Status changed';
                detail = item.message.split('Status changed:')[1].trim();
              }
              return (
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
                          {title}
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
                    <div className="text-[10px] text-slate-500 mt-1.5 font-medium bg-slate-50 p-2 rounded-lg border border-slate-100 block">
                            {detail && <div className="mb-1 text-slate-600 font-semibold">{detail}</div>}
                            <div className="font-semibold text-slate-500">
                              By: {item.author || (item.message.toLowerCase().includes("application received") || item.message.toLowerCase().includes("created") ? "System" : (typeof currentUser === 'string' ? currentUser : "Administrator"))}
                            </div>
                          </div>
                        </div>
                </div>
              )
            })}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={fullActivityLogOpen} onOpenChange={setFullActivityLogOpen}>
        <DialogContent aria-describedby={undefined} className="max-w-3xl bg-white border-0 shadow-2xl rounded-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">
              Full Activity Log
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-[11px]">
              <thead className="border-b border-slate-100 text-slate-400 font-bold">
                <tr>
                  <th className="py-2.5 px-2">Activity</th>
                  <th className="py-2.5 px-2">Description</th>
                  <th className="py-2.5 px-2">By</th>
                  <th className="py-2.5 px-2 text-right">Date & Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 font-semibold text-slate-700">
                {candidate.activity?.slice().reverse().map((act: any, i: number) => {
                  const title = act.message.includes(':') ? act.message.split(':')[0] : act.message;
                  const desc = act.message.includes(':') ? act.message.substring(act.message.indexOf(':') + 1).trim() : act.message;
                  return (
                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-2 font-bold text-slate-900">{title}</td>
                      <td className="py-3 px-2 text-slate-500 max-w-[250px] break-words">{desc}</td>
                      <td className="py-3 px-2">
                        <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-[9px] font-bold">
                          {act.author || (act.message.toLowerCase().includes("application received") || act.message.toLowerCase().includes("created") ? "System" : currentUser)}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-right text-slate-400 whitespace-nowrap">
                        {formatDateTime(act.at)}
                      </td>
                    </tr>
                  );
                })}
                {(!candidate.activity || candidate.activity.length === 0) && (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-[11px] font-bold text-slate-400">
                      No activity found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={addNoteOpen} onOpenChange={setAddNoteOpen}>
        <DialogContent aria-describedby={undefined} className="sm:max-w-[425px] bg-white border-0 shadow-2xl rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">
              {editingNoteId ? "Edit Note" : "Add Note"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="note" className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Note Text</Label>
              <Textarea
                id="note"
                placeholder="Type your note here..."
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                className="h-32 resize-none text-[12px] font-medium"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setAddNoteOpen(false)}
              className="text-[11px] font-bold"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleAddNote}
              className="bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold"
            >
              Save Note
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* All Notes Dialog */}
      <Dialog open={allNotesOpen} onOpenChange={setAllNotesOpen}>
        <DialogContent aria-describedby={undefined} className="max-w-xl bg-white border-0 shadow-2xl rounded-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900 flex items-center justify-between">
              <span>All Notes ({candidate.notesList?.length || 0})</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-[11px] font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50 mr-6"
                onClick={() => {
                  setAllNotesOpen(false);
                  setEditingNoteId(null);
                  setNoteText("");
                  setAddNoteOpen(true);
                }}
              >
                <Plus className="h-3.5 w-3.5 mr-1" /> Add Note
              </Button>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {candidate.notesList?.map((note: any, i: number) => (
              <div key={i} className="flex gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">

                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[12px] font-bold text-slate-900">{note.createdBy}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-bold text-slate-400">{formatDateTime(note.createdAt)}</span>
                      <div className="flex gap-1 items-center">
                        <button
                          title="Edit Note"
                          onClick={() => {
                            setAllNotesOpen(false);
                            setEditingNoteId(note.id);
                            setNoteText(note.text);
                            setAddNoteOpen(true);
                          }}
                          className="text-slate-400 hover:text-blue-600 transition-colors p-1"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          title="Delete Note"
                          onClick={() => handleDeleteNote(note.id)}
                          className="text-slate-400 hover:text-red-600 transition-colors p-1"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="text-[11px] font-medium text-slate-700 mt-2 leading-relaxed whitespace-pre-wrap">
                    {note.text}
                  </div>
                </div>
              </div>
            ))}
            {(!candidate.notesList || candidate.notesList.length === 0) && (
              <div className="text-center text-slate-400 text-[11px] font-bold py-10">
                No notes added yet.
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Note Confirmation */}
      <AlertDialog open={deleteNoteId !== null} onOpenChange={(open) => !open && setDeleteNoteId(null)}>
        <AlertDialogContent className="bg-white border-0 shadow-2xl rounded-2xl max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-500" /> Delete Note
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500 font-medium text-[13px] pt-2">
              Are you sure you want to permanently delete this note? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel className="text-[11px] font-bold border-slate-200">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold"
              onClick={async () => {
                if (deleteNoteId) {
                  try {
                    const res = await fetch(`${API_BASE_URL}/candidates/notes.php`, {
                      credentials: 'include',
                      method: "DELETE",
                      body: JSON.stringify({ id: deleteNoteId })
                    });
                    if (res.ok) {
                      toast.success("Note deleted");
                      window.location.reload();
                    } else {
                      toast.error("Failed to delete note");
                    }
                  } catch (err) {
                    toast.error("Failed to delete note");
                  }
                }
                setDeleteNoteId(null);
              }}
            >
              Delete Note
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Document Confirmation */}
      <AlertDialog open={deleteDoc !== null} onOpenChange={(open) => !open && setDeleteDoc(null)}>
        <AlertDialogContent className="bg-white border-0 shadow-2xl rounded-2xl max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-500" /> Delete Document
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500 font-medium text-[13px] pt-2">
              Are you sure you want to permanently delete the document <span className="font-bold text-slate-700">"{deleteDoc?.name}"</span>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel className="text-[11px] font-bold border-slate-200">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold"
              onClick={async () => {
                if (deleteDoc) {
                  try {
                    const res = await fetch(`${API_BASE_URL}/candidates/documents.php`, {
                      method: "DELETE",
                      body: JSON.stringify({ id: deleteDoc.id })
                    });
                    if (res.ok) {
                      toast.success("Document deleted permanently");
                      window.location.reload();
                    } else {
                      toast.error("Failed to delete document");
                    }
                  } catch (err) {
                    toast.error("Failed to delete document");
                  }
                }
                setDeleteDoc(null);
              }}
            >
              Delete Document
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Unified Schedule / Update / Complete Interview Dialog */}
      <ScheduleInterviewDialog
        open={scheduleInterviewOpen}
        onOpenChange={setScheduleInterviewOpen}
        candidate={candidate}
        mode={interviewDialogMode}
        existingInterview={selectedInterviewForDialog}
        onSuccess={() => {
          setTimeout(() => window.location.reload(), 500);
        }}
      />

      <Dialog open={sendEmailOpen} onOpenChange={setSendEmailOpen}>
        <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-white rounded-2xl border-0 shadow-2xl">
          <DialogHeader className="p-6 pb-4 border-b border-slate-100 bg-slate-50/50">
            <DialogTitle className="text-xl font-bold text-slate-900 tracking-tight">Send Email</DialogTitle>
          </DialogHeader>
          <div className="p-6 space-y-4">
            {!previewData ? (
              <>
                <div className="space-y-2">
                  <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Select Template</Label>
                  <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                    <SelectTrigger className="w-full text-[13px] font-bold">
                      <SelectValue placeholder="Choose a template..." />
                    </SelectTrigger>
                    <SelectContent>
                      {emailTemplates.map((t: any) => (
                        <SelectItem key={t.id} value={t.id.toString()} className="text-[12px] font-bold">
                          {t.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="bg-blue-50/50 rounded-xl p-4 text-[12px] text-slate-600 font-medium">
                  Select a template and preview it. The actual sending and placeholder replacements will be available in the preview window.
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">To</div>
                  <div className="text-[12px] font-bold text-slate-900">{candidate.email}</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Subject</div>
                  <div className="text-[12px] font-bold text-slate-900">{previewData.subject}</div>
                </div>
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <div className="bg-slate-50 border-b border-slate-200 px-3 py-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Message Body
                  </div>
                  <div className="p-3 bg-white text-[12px] text-slate-800 whitespace-pre-wrap min-h-[120px] max-h-[250px] overflow-y-auto">
                    {previewData.body}
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="flex justify-between gap-3 p-6 pt-4 bg-slate-50/50 border-t border-slate-100">
            {previewData ? (
              <Button variant="outline" onClick={() => setPreviewData(null)} className="text-[11px] font-bold">Back to Templates</Button>
            ) : (
              <div></div>
            )}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setSendEmailOpen(false)} className="text-[11px] font-bold">Cancel</Button>
              {!previewData ? (
                <Button onClick={handlePreviewEmail} disabled={!selectedTemplate} className="bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold">
                  Preview Email
                </Button>
              ) : (
                <Button onClick={handleSendEmail} disabled={emailLoading} className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold">
                  {emailLoading ? "Sending..." : "Send Email"}
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {/* View Interview Details Modal */}
      <Dialog open={isInterviewViewOpen} onOpenChange={setIsInterviewViewOpen}>
        <DialogContent className="max-w-lg rounded-2xl p-6 bg-white shadow-2xl border-0">
          <DialogHeader className="pb-3 border-b border-slate-100">
            <div className="flex items-center justify-between pr-6">
              <DialogTitle className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                Interview Details
              </DialogTitle>
            </div>
          </DialogHeader>

          {selectedInterviewForView && (() => {
            const isCompleted = selectedInterviewForView.status === "Completed";
            const hasEvaluation = isCompleted && (selectedInterviewForView.result || selectedInterviewForView.rating || selectedInterviewForView.feedback || selectedInterviewForView.recommendation || selectedInterviewForView.comments);

            return (
              <div className="space-y-4 pt-1 text-[12px]">
                {/* Header Badge & Stage */}
                <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-100 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Interview Stage</div>
                    <div className="text-sm font-black text-slate-900 mt-0.5">{selectedInterviewForView.type} Round</div>
                  </div>
                  <Badge className={cn("text-[10px] font-bold uppercase border-transparent px-2.5 py-1", 
                    selectedInterviewForView.status === "Scheduled" ? "bg-blue-50 text-blue-700 ring-1 ring-blue-500/20" :
                    selectedInterviewForView.status === "Completed" ? "bg-purple-50 text-purple-700 ring-1 ring-purple-500/20" :
                    selectedInterviewForView.status === "Cancelled" ? "bg-red-50 text-red-700 ring-1 ring-red-500/20" : "bg-slate-100 text-slate-700"
                  )}>
                    {selectedInterviewForView.status}
                  </Badge>
                </div>

                {/* Grid 2x2 Details */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-white rounded-xl border border-slate-100 shadow-xs">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 mb-1">
                      <Clock className="w-3 h-3 text-slate-400" /> Date & Time
                    </div>
                    <div className="font-bold text-slate-800">
                      {selectedInterviewForView.interviewDate ? formatDateTime(selectedInterviewForView.interviewDate) : "-"}
                    </div>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-100 shadow-xs">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 mb-1">
                      <User className="w-3 h-3 text-slate-400" /> Interviewer
                    </div>
                    <div className="font-bold text-slate-800">
                      {selectedInterviewForView.interviewers || "Unassigned"}
                    </div>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-100 shadow-xs">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 mb-1">
                      {selectedInterviewForView.mode === "Online" ? (
                        <Video className="w-3 h-3 text-blue-500" />
                      ) : selectedInterviewForView.mode === "Phone" ? (
                        <Phone className="w-3 h-3 text-emerald-500" />
                      ) : (
                        <MapPin className="w-3 h-3 text-amber-500" />
                      )}{" "}
                      Mode
                    </div>
                    <div className="font-bold text-slate-800">
                      {selectedInterviewForView.mode || "Online"}
                    </div>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-100 shadow-xs">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 mb-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Outcome / Result
                    </div>
                    <div className="font-bold text-slate-800 flex items-center gap-1.5">
                      {isCompleted && selectedInterviewForView.result ? selectedInterviewForView.result : "—"}
                      {isCompleted && selectedInterviewForView.rating && (
                        <span className="text-[10px] font-semibold text-slate-500">
                          ({selectedInterviewForView.rating}/5 ⭐)
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Location or Meeting Link */}
                {selectedInterviewForView.meeting_link && (
                  <div className="p-3 bg-blue-50/40 rounded-xl border border-blue-100">
                    <div className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-1">Meeting Link</div>
                    <a
                      href={selectedInterviewForView.meeting_link.startsWith("http") ? selectedInterviewForView.meeting_link : `https://${selectedInterviewForView.meeting_link}`}
                      target="_blank"
                      rel="noreferrer"
                      className="font-bold text-blue-600 hover:text-blue-700 underline flex items-center gap-1.5 truncate"
                    >
                      <ExternalLink className="w-3.5 h-3.5 shrink-0" /> {selectedInterviewForView.meeting_link}
                    </a>
                  </div>
                )}

                {selectedInterviewForView.location && (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Location</div>
                    <div className="font-bold text-slate-800">{selectedInterviewForView.location}</div>
                  </div>
                )}

                {/* Evaluation Details (Only for Completed / Evaluated interviews) */}
                {hasEvaluation ? (
                  <div className="space-y-2 pt-1 border-t border-slate-100">
                    {selectedInterviewForView.recommendation && (
                      <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg">
                        <span className="text-[11px] font-bold text-slate-500">Recommendation</span>
                        <span className="text-[11px] font-bold text-slate-900">{selectedInterviewForView.recommendation}</span>
                      </div>
                    )}

                    {selectedInterviewForView.feedback && (
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Feedback Summary</div>
                        <div className="text-[11px] text-slate-700 font-medium leading-relaxed whitespace-pre-wrap">
                          {selectedInterviewForView.feedback}
                        </div>
                      </div>
                    )}

                    {selectedInterviewForView.comments && (
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Interviewer Comments</div>
                        <div className="text-[11px] text-slate-700 font-medium leading-relaxed whitespace-pre-wrap">
                          {selectedInterviewForView.comments}
                        </div>
                      </div>
                    )}
                  </div>
                ) : null}

                {/* Cancellation Reason */}
                {(selectedInterviewForView.status === "Cancelled" || selectedInterviewForView.cancellation_reason) && (
                  <div className="p-3 bg-red-50/50 rounded-xl border border-red-100">
                    <div className="text-[10px] font-bold text-red-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <XCircle className="w-3.5 h-3.5 text-red-500" /> Cancellation Reason
                    </div>
                    <div className="text-[11px] text-red-900 font-semibold leading-relaxed">
                      {selectedInterviewForView.cancellation_reason || selectedInterviewForView.notes || "Cancelled by administrator"}
                    </div>
                  </div>
                )}

                {/* Internal Notes */}
                {selectedInterviewForView.notes && selectedInterviewForView.status !== "Cancelled" && (
                  <div className="p-3 bg-amber-50/40 rounded-xl border border-amber-100">
                    <div className="text-[10px] font-bold text-amber-700 uppercase tracking-wider mb-1">Internal Notes</div>
                    <div className="text-[11px] text-amber-900 font-medium leading-relaxed whitespace-pre-wrap">
                      {selectedInterviewForView.notes}
                    </div>
                  </div>
                )}

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsInterviewViewOpen(false)}
                    className="h-8 text-xs font-bold px-4"
                  >
                    Close
                  </Button>
                  {(selectedInterviewForView.status === "Scheduled" || selectedInterviewForView.status === "Confirmed" || selectedInterviewForView.status === "Rescheduled") && (
                    <Button
                      onClick={() => {
                        setIsInterviewViewOpen(false);
                        openEditInterview(selectedInterviewForView);
                      }}
                      className="h-8 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white px-4 shadow-sm"
                    >
                      Edit Interview
                    </Button>
                  )}
                  {selectedInterviewForView.status === "Completed" && (!selectedInterviewForView.feedback || !selectedInterviewForView.rating) && (
                    <Button
                      onClick={() => {
                        setIsInterviewViewOpen(false);
                        openAddFeedback(selectedInterviewForView);
                      }}
                      className="h-8 text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white px-4 shadow-sm"
                    >
                      Add Feedback
                    </Button>
                  )}
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
      {/* Cancel Interview Confirmation Modal */}
      <Dialog open={cancelInterviewDialogItem !== null} onOpenChange={(open) => !open && setCancelInterviewDialogItem(null)}>
        <DialogContent className="max-w-md rounded-2xl p-6 bg-white shadow-2xl border-0">
          <DialogHeader className="pb-3 border-b border-slate-100">
            <DialogTitle className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-600" />
              Cancel Interview?
            </DialogTitle>
          </DialogHeader>

          {cancelInterviewDialogItem && (
            <div className="space-y-4 pt-1 text-[12px]">
              <div className="p-3 bg-red-50/50 rounded-xl border border-red-100 text-slate-700 font-medium leading-relaxed">
                Are you sure you want to cancel this <strong className="text-slate-900">{cancelInterviewDialogItem.type}</strong> interview scheduled for <strong className="text-slate-900">{cancelInterviewDialogItem.interviewDate ? formatDateTime(cancelInterviewDialogItem.interviewDate) : "the scheduled time"}</strong> with <strong className="text-slate-900">{cancelInterviewDialogItem.interviewers || "the interviewer"}</strong>?
              </div>

              <div className="space-y-1.5">
                <Label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Cancellation Reason *</Label>
                <Select value={cancellationReason} onValueChange={setCancellationReason}>
                  <SelectTrigger className="h-9 text-[12px] font-semibold bg-white border-slate-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Candidate unavailable" className="text-[12px]">Candidate unavailable</SelectItem>
                    <SelectItem value="Interviewer unavailable" className="text-[12px]">Interviewer unavailable</SelectItem>
                    <SelectItem value="Position put on hold" className="text-[12px]">Position put on hold</SelectItem>
                    <SelectItem value="Rescheduled" className="text-[12px]">Rescheduled</SelectItem>
                    <SelectItem value="Other" className="text-[12px]">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {cancellationReason === "Other" && (
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Specify Reason</Label>
                  <Input
                    placeholder="Enter reason for cancellation..."
                    value={cancellationCustomReason}
                    onChange={(e) => setCancellationCustomReason(e.target.value)}
                    className="h-9 text-[12px] font-medium"
                  />
                </div>
              )}

              <p className="text-[11px] text-slate-400 font-medium">
                Note: Cancelling will keep this record in Interview History for audit purposes and update the candidate's activity history.
              </p>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setCancelInterviewDialogItem(null)}
                  className="h-8 text-xs font-bold"
                >
                  Keep Interview
                </Button>
                <Button
                  onClick={handleConfirmCancelInterview}
                  className="h-8 text-xs font-bold bg-red-600 hover:bg-red-700 text-white px-4 shadow-sm"
                >
                  Confirm Cancellation
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Stage Transition Reason Modal (for Rejected, No Show, Offer Declined, Offer Expired) */}
      <Dialog open={stageReasonDialogOpen} onOpenChange={(open) => !open && setStageReasonDialogOpen(false)}>
        <DialogContent className="max-w-md rounded-2xl p-6 bg-white shadow-2xl border-0">
          <DialogHeader className="pb-3 border-b border-slate-100">
            <DialogTitle className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-600" />
              Update Status to {targetStagePending}?
            </DialogTitle>
          </DialogHeader>

          {targetStagePending && (
            <div className="space-y-4 pt-1 text-[12px]">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-slate-700 font-medium leading-relaxed">
                Candidate <strong className="text-slate-900">{candidate.name}</strong> will be moved from <strong className="text-slate-900">{candidate.stage}</strong> to <strong className="text-slate-900">{targetStagePending}</strong>.
              </div>

              <div className="space-y-1.5">
                <Label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  Reason / Notes {["Rejected", "No Show"].includes(targetStagePending) ? "*" : "(Optional)"}
                </Label>
                <Textarea
                  placeholder={`Enter reason or details for ${targetStagePending}...`}
                  value={stageReasonInput}
                  onChange={(e) => setStageReasonInput(e.target.value)}
                  className="h-20 text-[12px] font-medium resize-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setStageReasonDialogOpen(false);
                    setTargetStagePending(null);
                  }}
                  className="h-8 text-xs font-bold"
                >
                  Cancel
                </Button>
                <Button
                  onClick={confirmStageReason}
                  className="h-8 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white px-4 shadow-sm"
                >
                  Confirm Status Change
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}





