import { useState } from "react";
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
  Eye,
  Briefcase,
  Wallet,
  Target,
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
  const { candidates, setStage, remove, update, addInterview, updateInterview } = useAts();
  const candidate = candidates.find((c) => c.id === id);

  let currentUser = "Admin";
  try {
    const userStr = localStorage.getItem("cims_user");
    if (userStr) {
      const u = JSON.parse(userStr);
      currentUser = u.name || u.first_name || "Admin";
    }
  } catch (e) { }

  const [del, setDel] = useState(false);
  const [blacklistDialogOpen, setBlacklistDialogOpen] = useState(false);
  const [blacklistReason, setBlacklistReason] = useState("");
  const [fullDetailsOpen, setFullDetailsOpen] = useState(false);
  const [fullTimelineOpen, setFullTimelineOpen] = useState(false);
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
  const [previewData, setPreviewData] = useState<{subject: string, body: string} | null>(null);

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
  const [editingInterviewId, setEditingInterviewId] = useState<string | null>(null);
  const [interviewForm, setInterviewForm] = useState({
    type: "HR Round",
    date: "",
    end_time: "",
    mode: "Online",
    interviewers: "",
    meeting_link: "",
    location: "",
    notes: "",
    status: "Scheduled",
    feedback: "",
    rating: 0,
    recommendation: "",
    comments: "",
  });

  const handleSaveInterview = async () => {
    if (!interviewForm.date || !interviewForm.interviewers) {
      toast.error("Please fill in all required fields (Date, Interviewers)");
      return;
    }

    try {
      if (editingInterviewId) {
        await updateInterview(candidate.id, editingInterviewId, interviewForm);
        toast.success("Interview updated");
      } else {
        await addInterview(candidate.id, interviewForm);
        toast.success("Interview scheduled");
      }
      setScheduleInterviewOpen(false);
      setEditingInterviewId(null);
      setInterviewForm({
        type: "HR Round", date: "", end_time: "", mode: "Online", interviewers: "", meeting_link: "", location: "", notes: "", status: "Scheduled", feedback: "", rating: 0, recommendation: "", comments: ""
      });
      setTimeout(() => window.location.reload(), 1000);
    } catch (e: any) {
      toast.error(e.message || "Failed to save interview");
    }
  };

  const openAddInterview = () => {
    setInterviewForm({
      type: "HR Round", date: "", end_time: "", mode: "Online", interviewers: "", meeting_link: "", location: "", notes: "", status: "Scheduled", feedback: "", rating: 0, recommendation: "", comments: ""
    });
    setEditingInterviewId(null);
    setScheduleInterviewOpen(true);
  };

  const openEditInterview = (iv: any) => {
    setInterviewForm({
        type: iv.type || "HR Round",
        date: iv.interviewDate ? iv.interviewDate.substring(0, 16) : "",
        end_time: iv.end_time ? iv.end_time.substring(0, 16) : "",
        mode: iv.mode || "Online",
        interviewers: iv.interviewers || "",
        meeting_link: iv.meeting_link || "",
        location: iv.location || "",
        notes: iv.notes || "",
        status: iv.status || "Scheduled",
        feedback: iv.feedback || "",
        rating: iv.rating || 0,
        recommendation: iv.recommendation || "",
        comments: iv.comments || ""
    });
    setEditingInterviewId(iv.id);
    setScheduleInterviewOpen(true);
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
            {candidate.photo ? (
              <div className="h-[72px] w-[72px] rounded-full overflow-hidden shrink-0 shadow-sm border-2 border-white ring-2 ring-slate-100">
                <img
                  src={`${API_BASE_URL}/candidates/uploads/${candidate.photo}`}
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
                    return msg.includes('created') || msg.includes('application received') || msg.includes('status changed') || msg.includes('interview') || msg.includes('offer');
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
                        {detail && (
                          <div className="text-[10px] text-slate-500 mt-1 font-medium bg-slate-50 p-1.5 rounded-md border border-slate-100 inline-block">
                            {detail}
                          </div>
                        )}
                      </div>
                    </div>
                  )})}
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
                <h3 className="text-[13px] font-bold text-slate-900 mb-4">Interview History</h3>
                <div className="overflow-x-auto flex-1">
                  <table className="w-full text-left text-[11px]">
                    <thead className="border-b border-slate-100 text-slate-400 font-bold">
                      <tr>
                        <th className="py-2.5 px-2">Stage</th>
                        <th className="py-2.5 px-2">Interviewers</th>
                        <th className="py-2.5 px-2">Date</th>
                        <th className="py-2.5 px-2">Mode</th>
                        <th className="py-2.5 px-2">Link/Location</th>
                        <th className="py-2.5 px-2">Feedback</th>
                        <th className="py-2.5 px-2 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 font-semibold text-slate-700">
                      {candidate.interviewsList?.map((interview: any, i: number) => (
                        <tr key={i} className="hover:bg-slate-50 cursor-pointer transition-colors" onClick={() => openEditInterview(interview)}>
                          <td className="py-3 px-2 flex items-center gap-2">
                            {interview.type}
                            <Pencil className="h-3 w-3 text-slate-400 group-hover:text-blue-500" />
                          </td>
                          <td className="py-3 px-2">
                            <div className="flex items-center gap-2">
                              <span className="truncate max-w-[120px]">{interview.interviewers || "-"}</span>
                            </div>
                          </td>
                          <td className="py-3 px-2 text-slate-500">{formatDateTime(interview.interviewDate)}</td>
                          <td className="py-3 px-2">{interview.mode || "-"}</td>
                          <td className="py-3 px-2 text-blue-600 truncate max-w-[150px]">{interview.meeting_link || interview.location || "-"}</td>
                          <td className="py-3 px-2 truncate max-w-[150px]">{interview.feedback || "-"}</td>
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
                          <td colSpan={7} className="py-6 text-center text-[11px] font-bold text-slate-400">
                            No interviews scheduled yet.
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
                              <a href={`${API_BASE_URL}/candidates/uploads/${doc.rawName}`} target="_blank" rel="noreferrer">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-slate-400 hover:text-blue-600"
                                  title="View Document"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </a>
                              <a href={`${API_BASE_URL}/candidates/uploads/${doc.rawName}`} download target="_blank" rel="noreferrer">
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
                  <Button variant="link" className="text-blue-600 text-[11px] font-bold" onClick={() => setFullTimelineOpen(true)}>
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
        <DialogContent aria-describedby={undefined} className="max-w-md bg-white border-0 shadow-2xl rounded-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">
              Full Activity Timeline
            </DialogTitle>
          </DialogHeader>
          <div className="mt-6 space-y-6 relative before:absolute before:inset-0 before:ml-4 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-100 before:to-transparent">
            {candidate.activity.slice().reverse().map((item, i) => {
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
                  {detail && (
                    <div className="text-[10px] text-slate-500 mt-1 font-medium bg-slate-50 p-1.5 rounded-md border border-slate-100 inline-block">
                      {detail}
                    </div>
                  )}
                </div>
              </div>
            )})}
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

      <Dialog open={scheduleInterviewOpen} onOpenChange={setScheduleInterviewOpen}>
        <DialogContent aria-describedby={undefined} className="max-w-xl bg-white border-0 shadow-2xl rounded-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">
              {editingInterviewId ? "Update Interview" : "Schedule Interview"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="space-y-2">
              <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Interview Stage</Label>
              <Select value={interviewForm.type} onValueChange={(v) => setInterviewForm({...interviewForm, type: v})}>
                <SelectTrigger className="h-9 text-[12px] font-semibold"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {INTERVIEW_TYPES.map(t => <SelectItem key={t} value={t} className="text-[12px]">{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Status</Label>
              <Select value={interviewForm.status} onValueChange={(v) => setInterviewForm({...interviewForm, status: v})}>
                <SelectTrigger className="h-9 text-[12px] font-semibold"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Scheduled" className="text-[12px]">Scheduled</SelectItem>
                  <SelectItem value="Completed" className="text-[12px]">Completed</SelectItem>
                  <SelectItem value="Cancelled" className="text-[12px]">Cancelled</SelectItem>
                  <SelectItem value="Rescheduled" className="text-[12px]">Rescheduled</SelectItem>
                  <SelectItem value="No Show" className="text-[12px]">No Show</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Interview Date *</Label>
              <Input type="date" value={interviewForm.date} onChange={e => setInterviewForm({...interviewForm, date: e.target.value})} className="h-9 text-[12px] font-semibold" />
            </div>
            <div className="space-y-2">
              <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Mode</Label>
              <Select value={interviewForm.mode} onValueChange={(v) => setInterviewForm({...interviewForm, mode: v})}>
                <SelectTrigger className="h-9 text-[12px] font-semibold"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Online" className="text-[12px]">Online</SelectItem>
                  <SelectItem value="Offline" className="text-[12px]">Offline</SelectItem>
                  <SelectItem value="Phone" className="text-[12px]">Phone</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Interviewer(s)</Label>
              <Input value={interviewForm.interviewers} onChange={e => setInterviewForm({...interviewForm, interviewers: e.target.value})} placeholder="e.g. Rahul, Neha" className="h-9 text-[12px] font-semibold" />
            </div>
            <div className="space-y-2">
              <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Meeting Link / Location</Label>
              <Input value={interviewForm.meeting_link} onChange={e => setInterviewForm({...interviewForm, meeting_link: e.target.value})} placeholder="Zoom link or Office room" className="h-9 text-[12px] font-semibold" />
            </div>
            
            {editingInterviewId && interviewForm.status === 'Completed' && (
              <>
                <div className="col-span-2 space-y-2 pt-4 border-t border-slate-100">
                  <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Feedback Summary</Label>
                  <Input value={interviewForm.feedback} onChange={e => setInterviewForm({...interviewForm, feedback: e.target.value})} placeholder="Brief feedback summary" className="h-9 text-[12px] font-semibold" />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Interviewer Comments</Label>
                  <Textarea value={interviewForm.comments} onChange={e => setInterviewForm({...interviewForm, comments: e.target.value})} placeholder="Detailed comments" className="h-20 text-[12px] font-semibold resize-none" />
                </div>
              </>
            )}
            
            <div className="col-span-2 space-y-2 mt-2">
              <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Internal Notes</Label>
              <Textarea value={interviewForm.notes} onChange={e => setInterviewForm({...interviewForm, notes: e.target.value})} placeholder="Notes for HR..." className="h-16 text-[12px] font-semibold resize-none" />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={() => setScheduleInterviewOpen(false)} className="text-[11px] font-bold">Cancel</Button>
            <Button onClick={handleSaveInterview} className="bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold">
              {editingInterviewId ? "Save Changes" : "Schedule Interview"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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
    </div>
  );
}
