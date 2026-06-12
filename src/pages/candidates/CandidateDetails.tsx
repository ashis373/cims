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
    <div>
      <div className="text-[10px] font-bold text-slate-500 mb-1">{label}</div>
      {isRecruiter && value !== "-" ? (
        <div className="flex items-center gap-2">
          <img
            src={`https://api.dicebear.com/7.x/notionists/svg?seed=${value}`}
            alt=""
            className="h-5 w-5 rounded-full bg-slate-100"
          />
          <span className="text-[12px] font-bold text-slate-900">{value}</span>
        </div>
      ) : (
        <div className="text-[12px] font-bold text-slate-900">{value}</div>
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

      {/* Blacklist Alert */}
      {candidate.isBlacklisted && (
        <div className="flex items-center justify-between rounded-xl bg-red-50/80 p-4 border border-red-100 shadow-sm">
          <div className="flex items-start gap-3 text-red-600">
            <div className="mt-0.5">
              <Clock className="h-4 w-4" />
            </div>
            <div>
              <div className="font-bold text-[13px]">Blacklisted Candidate</div>
              <div className="text-[11px] font-semibold text-red-500 mt-0.5">
                Reason: {candidate.blacklistReason || "many time apply ok"}
              </div>
            </div>
          </div>
          <Button
            variant="outline"
            className="bg-white text-red-600 border-red-200 hover:bg-red-50 text-[11px] font-bold h-8"
            onClick={unblacklist}
          >
            Unblock
          </Button>
        </div>
      )}

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
        <div className="flex flex-wrap items-center gap-8 mt-8 border-b border-slate-100 px-2">
          {[
            "Overview",
            "Timeline",
            "Interviews",
            "Applications",
            "Documents",
            "Notes",
            "Activity Log",
          ].map((tab) => (
            <button
              key={tab}
              className={cn(
                "pb-3 text-[12px] font-bold transition-colors relative",
                tab === "Overview" ? "text-blue-600" : "text-slate-500 hover:text-slate-900",
              )}
            >
              {tab}
              {tab === "Overview" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t-full" />
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
            <Card className="col-span-1 p-5 bg-white border-border/50 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] rounded-2xl relative flex flex-col">
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
                <Button variant="link" className="text-blue-600 text-[11px] font-bold">
                  View Full Details →
                </Button>
              </div>
            </Card>

            {/* Candidate Timeline */}
            <Card className="col-span-1 p-5 bg-white border-border/50 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] rounded-2xl flex flex-col">
              <h3 className="text-[13px] font-bold text-slate-900 mb-5">Candidate Timeline</h3>
              <div className="space-y-4 flex-1 relative before:absolute before:inset-0 before:ml-4 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-100 before:to-transparent hidden md:block">
                {[
                  {
                    icon: FileText,
                    title: "Application Submitted",
                    date: "29 May 2026, 10:30 AM",
                    status: "Completed",
                    color: "bg-emerald-100 text-emerald-600",
                  },
                  {
                    icon: Calendar,
                    title: "Interview Scheduled",
                    date: "02 Jun 2026, 11:00 AM",
                    status: "Completed",
                    color: "bg-emerald-100 text-emerald-600",
                  },
                  {
                    icon: Activity,
                    title: "Technical Interview",
                    date: "02 Jun 2026, 11:00 AM",
                    status: "Completed",
                    color: "bg-emerald-100 text-emerald-600",
                  },
                  {
                    icon: Users,
                    title: "HR Interview",
                    date: "05 Jun 2026, 02:00 PM",
                    status: "Completed",
                    color: "bg-emerald-100 text-emerald-600",
                  },
                  {
                    icon: Mail,
                    title: "Offer Released",
                    date: "08 Jun 2026, 04:30 PM",
                    status: "Completed",
                    color: "bg-emerald-100 text-emerald-600",
                  },
                  {
                    icon: Trash2,
                    title: "Offer Declined",
                    date: "09 Jun 2026, 09:15 AM",
                    status: "Current",
                    color: "bg-red-100 text-red-600",
                    isLast: true,
                  },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div
                      className={cn(
                        "h-8 w-8 rounded-full border-2 border-white flex items-center justify-center shrink-0 z-10",
                        item.color,
                      )}
                    >
                      <item.icon className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex-1 pb-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <div
                            className={cn(
                              "text-[11px] font-bold",
                              item.isLast ? "text-red-600" : "text-slate-900",
                            )}
                          >
                            {item.title}
                          </div>
                          <div className="text-[9px] font-bold text-slate-400 mt-0.5">
                            {item.date}
                          </div>
                        </div>
                        <Badge
                          className={cn(
                            "text-[9px] font-bold px-1.5 py-0 rounded border-transparent uppercase tracking-wider",
                            item.color,
                          )}
                        >
                          {item.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-5 pt-3 border-t border-slate-100 text-center">
                <Button variant="link" className="text-blue-600 text-[11px] font-bold">
                  View Full Timeline →
                </Button>
              </div>
            </Card>

            {/* Latest Notes */}
            <Card className="col-span-1 p-5 bg-white border-border/50 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] rounded-2xl flex flex-col">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-[13px] font-bold text-slate-900">Latest Notes</h3>
                <Button
                  variant="ghost"
                  className="h-6 px-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 text-[11px] font-bold"
                >
                  <Plus className="h-3.5 w-3.5 mr-1" /> Add Note
                </Button>
              </div>
              <div className="space-y-4 flex-1">
                {[
                  {
                    name: "Rachna",
                    date: "09 Jun 2026, 09:20 AM",
                    text: "Candidate declined the offer due to better opportunity and higher package.",
                  },
                  {
                    name: "Bob",
                    date: "08 Jun 2026, 05:00 PM",
                    text: "Offered 25 LPA. Candidate showed interest and asked for 24 hours.",
                  },
                  {
                    name: "Soumya",
                    date: "05 Jun 2026, 03:45 PM",
                    text: "HR Interview completed. Feedback shared with manager.",
                  },
                ].map((note, i) => (
                  <div key={i} className="flex gap-3">
                    <img
                      src={`https://api.dicebear.com/7.x/notionists/svg?seed=${note.name}`}
                      alt=""
                      className="h-7 w-7 rounded-full bg-slate-100 shrink-0"
                    />
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-bold text-slate-900">{note.name}</span>
                        <span className="text-[9px] font-bold text-slate-400">{note.date}</span>
                      </div>
                      <div className="text-[10px] font-semibold text-slate-600 mt-1 leading-relaxed">
                        {note.text}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-5 pt-3 border-t border-slate-100 text-center">
                <Button variant="link" className="text-blue-600 text-[11px] font-bold">
                  View All Notes →
                </Button>
              </div>
            </Card>

            {/* Interview History */}
            <Card className="col-span-1 lg:col-span-2 p-5 bg-white border-border/50 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] rounded-2xl flex flex-col">
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
                    <tr>
                      <td className="py-3 px-2">Technical Interview</td>
                      <td className="py-3 px-2">
                        <div className="flex -space-x-2">
                          <img
                            src={`https://api.dicebear.com/7.x/notionists/svg?seed=Arup`}
                            className="h-6 w-6 rounded-full border-2 border-white bg-slate-100"
                          />
                          <img
                            src={`https://api.dicebear.com/7.x/notionists/svg?seed=Bob`}
                            className="h-6 w-6 rounded-full border-2 border-white bg-slate-100"
                          />
                        </div>
                      </td>
                      <td className="py-3 px-2 text-slate-500">02 Jun 2026, 11:00 AM</td>
                      <td className="py-3 px-2">Good technical knowledge.</td>
                      <td className="py-3 px-2 text-right">
                        <Badge className="bg-emerald-100 text-emerald-600 text-[9px] uppercase hover:bg-emerald-100 border-transparent">
                          Completed
                        </Badge>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 px-2">HR Interview</td>
                      <td className="py-3 px-2">
                        <div className="flex -space-x-2">
                          <img
                            src={`https://api.dicebear.com/7.x/notionists/svg?seed=Soumya`}
                            className="h-6 w-6 rounded-full border-2 border-white bg-slate-100"
                          />
                        </div>
                      </td>
                      <td className="py-3 px-2 text-slate-500">05 Jun 2026, 02:00 PM</td>
                      <td className="py-3 px-2">Good communication.</td>
                      <td className="py-3 px-2 text-right">
                        <Badge className="bg-emerald-100 text-emerald-600 text-[9px] uppercase hover:bg-emerald-100 border-transparent">
                          Completed
                        </Badge>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="mt-2 pt-3 border-t border-slate-100 text-center">
                <Button variant="link" className="text-blue-600 text-[11px] font-bold">
                  View All Interviews →
                </Button>
              </div>
            </Card>

            {/* Documents */}
            <Card className="col-span-1 p-5 bg-white border-border/50 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] rounded-2xl flex flex-col">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-[13px] font-bold text-slate-900">Documents</h3>
                <Button
                  variant="ghost"
                  className="h-6 px-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 text-[11px] font-bold"
                >
                  <Plus className="h-3.5 w-3.5 mr-1" /> Add Document
                </Button>
              </div>
              <div className="space-y-4 flex-1">
                {[
                  {
                    name: `Resume_${candidate.name.replace(" ", "_")}.pdf`,
                    date: "29 May 2026",
                    color: "text-red-500 bg-red-50",
                    ext: "pdf",
                  },
                  {
                    name: "Offer_Letter.pdf",
                    date: "08 Jun 2026",
                    color: "text-red-500 bg-red-50",
                    ext: "pdf",
                  },
                  {
                    name: "ID_Proof.png",
                    date: "29 May 2026",
                    color: "text-emerald-500 bg-emerald-50",
                    ext: "png",
                  },
                ].map((doc, i) => (
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
                        <div className="text-[11px] font-bold text-slate-900">{doc.name}</div>
                        <div className="text-[9px] font-bold text-slate-400 mt-0.5">
                          Uploaded on {doc.date}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-slate-400 hover:text-blue-600"
                      >
                        <Download className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-slate-400 hover:text-blue-600"
                      >
                        <MoreVertical className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
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
    </div>
  );
}
