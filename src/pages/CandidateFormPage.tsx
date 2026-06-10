import { useEffect, useState } from "react";
import { useAts } from "@/lib/ats-store";
import {
  PIPELINE_STAGES,
  SOURCES,
  DEPARTMENTS,
  type Candidate,
  type Department,
  type Source,
  type Stage,
} from "@/lib/ats-types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { toast } from "sonner";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  Clock,
  IndianRupee,
  Wrench,
  Linkedin,
  FileText,
  Share2,
  Building2,
  MessageSquare
} from "lucide-react";

const empty = {
  name: "",
  email: "",
  phone: "",
  alternateMobile: "",
  role: "",
  department: "Engineering" as Department,
  source: "Website" as Source,
  stage: "New Applicant" as Stage,
  resume: "",
  notes: "",
  appliedAt: new Date().toISOString().slice(0, 10),
  tags: "",
  skills: "",
  experience: "",
  relevantExperience: "",
  currentCompany: "",
  currentDesignation: "",
  currentCtc: "",
  expectedCtc: "",
  location: "",
  preferredLocation: "",
  linkedInProfile: "",
  noticePeriod: "",
  recruiter: "",
};

export default function CandidateFormPage() {
  const { id } = useParams();
  const { candidates, add, update, findDuplicate, reapply } = useAts();
  const navigate = useNavigate();
  const candidate = candidates.find((c) => c.id === id);

  const [form, setForm] = useState(empty);
  const [dup, setDup] = useState<Candidate | null>(null);

  useEffect(() => {
    if (candidate) {
      setForm({
        name: candidate.name,
        email: candidate.email,
        phone: candidate.phone,
        role: candidate.role,
        department: candidate.department,
        source: candidate.source,
        stage: candidate.stage,
        resume: candidate.resume || "",
        notes: candidate.notes || "",
        tags: candidate.tags.join(", "),
        skills: candidate.skills?.join(", ") || "",
        experience: candidate.experience || "",
        relevantExperience: candidate.relevantExperience || "",
        currentCompany: candidate.currentCompany || "",
        currentDesignation: candidate.currentDesignation || "",
        currentCtc: candidate.currentCtc || "",
        expectedCtc: candidate.expectedCtc || "",
        location: candidate.location || "",
        preferredLocation: candidate.preferredLocation || "",
        alternateMobile: candidate.alternateMobile || "",
        linkedInProfile: candidate.linkedInProfile || "",
        noticePeriod: candidate.noticePeriod || "",
        recruiter: candidate.recruiter || "",
        appliedAt: candidate.appliedAt.slice(0, 10),
      });
    } else {
      setForm(empty);
    }
  }, [candidate]);

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.role.trim()) {
      toast.error("Name, email and role are required");
      return;
    }

    if (!candidate) {
      const existing = findDuplicate(form.email, form.phone);
      if (existing) {
        setDup(existing);
        return;
      }
    }

    persist();
  };

  const persist = async () => {
    const tags = (form.tags || "")
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    try {
      if (candidate) {
        await update(
          candidate.id,
          {
            name: form.name,
            email: form.email,
            phone: form.phone,
            role: form.role,
            department: form.department,
            source: form.source,
            stage: form.stage,
            resume: form.resume,
            notes: form.notes,
            tags,
            skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean),
            experience: form.experience,
            relevantExperience: form.relevantExperience,
            currentCompany: form.currentCompany,
            currentDesignation: form.currentDesignation,
            currentCtc: form.currentCtc,
            expectedCtc: form.expectedCtc,
            location: form.location,
            preferredLocation: form.preferredLocation,
            alternateMobile: form.alternateMobile,
            linkedInProfile: form.linkedInProfile,
            noticePeriod: form.noticePeriod,
            recruiter: form.recruiter,
            appliedAt: new Date(form.appliedAt).toISOString(),
          },
          "Profile edited",
        );
        toast.success("Candidate updated");
        navigate(`/candidates/${candidate.id}`);
      } else {
        const c = await add({
          name: form.name,
          email: form.email,
          phone: form.phone,
          role: form.role,
          department: form.department,
          source: form.source,
          resume: form.resume,
          notes: form.notes,
          stage: form.stage,
          tags,
          skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean),
          experience: form.experience,
          relevantExperience: form.relevantExperience,
          currentCompany: form.currentCompany,
          currentDesignation: form.currentDesignation,
          currentCtc: form.currentCtc,
          expectedCtc: form.expectedCtc,
          location: form.location,
          preferredLocation: form.preferredLocation,
          alternateMobile: form.alternateMobile,
          linkedInProfile: form.linkedInProfile,
          noticePeriod: form.noticePeriod,
          recruiter: form.recruiter,
          appliedAt: new Date(form.appliedAt).toISOString(),
        });
        toast.success("Candidate added");
        navigate(`/candidates/${c.id}`);
      }
    } catch (e) {
      // Error handled by store
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center gap-3">
        <Link
          to={candidate ? `/candidates/${candidate.id}` : "/candidates"}
          className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
      </div>

      <form onSubmit={submit} className="space-y-6">
        {/* Section 1: Basic Information */}
        <Card className="p-6 shadow-sm border-border/50">
          <div className="flex items-center gap-2 mb-6 pb-4 border-b border-border/40">
            <User className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Basic Information</h3>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="md:col-span-2">
              <Label htmlFor="name" className="flex items-center gap-1.5 text-muted-foreground mb-1.5">
                <User className="h-3.5 w-3.5" /> Candidate Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                required
                maxLength={120}
                placeholder="Full name"
              />
            </div>
            <div>
              <Label htmlFor="phone" className="flex items-center gap-1.5 text-muted-foreground mb-1.5">
                <Phone className="h-3.5 w-3.5" /> Mobile Number <span className="text-destructive">*</span>
              </Label>
              <Input
                id="phone"
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                required
                maxLength={40}
                placeholder="10-digit mobile number"
              />
            </div>
            <div>
              <Label htmlFor="alternateMobile" className="flex items-center gap-1.5 text-muted-foreground mb-1.5">
                <Phone className="h-3.5 w-3.5" /> Alternate Mobile
              </Label>
              <Input
                id="alternateMobile"
                value={form.alternateMobile}
                onChange={(e) => set("alternateMobile", e.target.value)}
                maxLength={40}
                placeholder="Alternate mobile number"
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="email" className="flex items-center gap-1.5 text-muted-foreground mb-1.5">
                <Mail className="h-3.5 w-3.5" /> Email Address <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                required
                maxLength={255}
                placeholder="email@example.com"
              />
            </div>
            <div>
              <Label htmlFor="location" className="flex items-center gap-1.5 text-muted-foreground mb-1.5">
                <MapPin className="h-3.5 w-3.5" /> Current Location
              </Label>
              <Input
                id="location"
                value={form.location}
                onChange={(e) => set("location", e.target.value)}
                placeholder="City"
              />
            </div>
            <div>
              <Label htmlFor="preferredLocation" className="flex items-center gap-1.5 text-muted-foreground mb-1.5">
                <MapPin className="h-3.5 w-3.5" /> Preferred Location
              </Label>
              <Input
                id="preferredLocation"
                value={form.preferredLocation}
                onChange={(e) => set("preferredLocation", e.target.value)}
                placeholder="Preferred city"
              />
            </div>
          </div>
        </Card>

        {/* Section 2: Professional Details */}
        <Card className="p-6 shadow-sm border-border/50">
          <div className="flex items-center gap-2 mb-6 pb-4 border-b border-border/40">
            <Briefcase className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Professional Details</h3>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <Label htmlFor="experience" className="flex items-center gap-1.5 text-muted-foreground mb-1.5">
                <Clock className="h-3.5 w-3.5" /> Total Experience <span className="text-destructive">*</span>
              </Label>
              <Input
                id="experience"
                value={form.experience}
                onChange={(e) => set("experience", e.target.value)}
                required
                placeholder="e.g., 5 years"
              />
            </div>
            <div>
              <Label htmlFor="relevantExperience" className="flex items-center gap-1.5 text-muted-foreground mb-1.5">
                <Clock className="h-3.5 w-3.5" /> Relevant Experience <span className="text-destructive">*</span>
              </Label>
              <Input
                id="relevantExperience"
                value={form.relevantExperience}
                onChange={(e) => set("relevantExperience", e.target.value)}
                required
                placeholder="e.g., 4 years"
              />
            </div>
            <div>
              <Label htmlFor="currentCompany" className="flex items-center gap-1.5 text-muted-foreground mb-1.5">
                <Building2 className="h-3.5 w-3.5" /> Current Company <span className="text-destructive">*</span>
              </Label>
              <Input
                id="currentCompany"
                value={form.currentCompany}
                onChange={(e) => set("currentCompany", e.target.value)}
                required
                placeholder="Current employer"
              />
            </div>
            <div>
              <Label htmlFor="currentDesignation" className="flex items-center gap-1.5 text-muted-foreground mb-1.5">
                <Briefcase className="h-3.5 w-3.5" /> Current Designation <span className="text-destructive">*</span>
              </Label>
              <Input
                id="currentDesignation"
                value={form.currentDesignation}
                onChange={(e) => set("currentDesignation", e.target.value)}
                required
                placeholder="Job title"
              />
            </div>
            <div>
              <Label htmlFor="currentCtc" className="flex items-center gap-1.5 text-muted-foreground mb-1.5">
                <IndianRupee className="h-3.5 w-3.5" /> Current CTC <span className="text-destructive">*</span>
              </Label>
              <Input
                id="currentCtc"
                value={form.currentCtc}
                onChange={(e) => set("currentCtc", e.target.value)}
                required
                placeholder="e.g., 12 LPA"
              />
            </div>
            <div>
              <Label htmlFor="expectedCtc" className="flex items-center gap-1.5 text-muted-foreground mb-1.5">
                <IndianRupee className="h-3.5 w-3.5" /> Expected CTC
              </Label>
              <Input
                id="expectedCtc"
                value={form.expectedCtc}
                onChange={(e) => set("expectedCtc", e.target.value)}
                placeholder="e.g., 18 LPA"
              />
            </div>
            <div>
              <Label htmlFor="noticePeriod" className="flex items-center gap-1.5 text-muted-foreground mb-1.5">
                <Clock className="h-3.5 w-3.5" /> Notice Period <span className="text-destructive">*</span>
              </Label>
              <Input
                id="noticePeriod"
                value={form.noticePeriod}
                onChange={(e) => set("noticePeriod", e.target.value)}
                required
                placeholder="e.g., 30 days"
              />
            </div>
            <div>
              <Label htmlFor="skills" className="flex items-center gap-1.5 text-muted-foreground mb-1.5">
                <Wrench className="h-3.5 w-3.5" /> Skills
              </Label>
              <Input
                id="skills"
                value={form.skills}
                onChange={(e) => set("skills", e.target.value)}
                placeholder="React, Node.js, Python..."
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="linkedInProfile" className="flex items-center gap-1.5 text-muted-foreground mb-1.5">
                <Linkedin className="h-3.5 w-3.5" /> LinkedIn Profile
              </Label>
              <Input
                id="linkedInProfile"
                value={form.linkedInProfile}
                onChange={(e) => set("linkedInProfile", e.target.value)}
                placeholder="https://linkedin.com/in/..."
              />
            </div>
          </div>
        </Card>

        {/* Section 3: Application Details */}
        <Card className="p-6 shadow-sm border-border/50">
          <div className="flex items-center gap-2 mb-6 pb-4 border-b border-border/40">
            <FileText className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Application Details</h3>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <Label className="flex items-center gap-1.5 text-muted-foreground mb-1.5">
                <Share2 className="h-3.5 w-3.5" /> Source <span className="text-destructive">*</span>
              </Label>
              <Select value={form.source} onValueChange={(v) => set("source", v as Source)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select source" />
                </SelectTrigger>
                <SelectContent>
                  {SOURCES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="role" className="flex items-center gap-1.5 text-muted-foreground mb-1.5">
                <Briefcase className="h-3.5 w-3.5" /> Position Applied For <span className="text-destructive">*</span>
              </Label>
              <Input
                id="role"
                value={form.role}
                onChange={(e) => set("role", e.target.value)}
                required
                placeholder="Select position"
              />
            </div>
            <div>
              <Label htmlFor="recruiter" className="flex items-center gap-1.5 text-muted-foreground mb-1.5">
                <User className="h-3.5 w-3.5" /> Recruiter <span className="text-destructive">*</span>
              </Label>
              <Input
                id="recruiter"
                value={form.recruiter}
                onChange={(e) => set("recruiter", e.target.value)}
                required
                placeholder="Select recruiter"
              />
            </div>
            <div>
              <Label className="flex items-center gap-1.5 text-muted-foreground mb-1.5">
                <Building2 className="h-3.5 w-3.5" /> Department
              </Label>
              <Select
                value={form.department}
                onValueChange={(v) => set("department", v as Department)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DEPARTMENTS.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="notes" className="flex items-center gap-1.5 text-muted-foreground mb-1.5">
                <MessageSquare className="h-3.5 w-3.5" /> Remarks
              </Label>
              <Textarea
                id="notes"
                rows={3}
                value={form.notes}
                onChange={(e) => set("notes", e.target.value)}
                maxLength={2000}
                placeholder="Additional notes..."
              />
            </div>
          </div>
        </Card>

        <div className="flex justify-end gap-3 pt-4 sticky bottom-6 bg-white/80 p-4 rounded-xl border border-border/50 backdrop-blur-sm shadow-sm">
          <Button type="button" variant="ghost" asChild>
            <Link to={candidate ? `/candidates/${candidate.id}` : "/candidates"}>Cancel</Link>
          </Button>
          <Button type="submit">{candidate ? "Save changes" : "Add candidate"}</Button>
        </div>
      </form>

      <AlertDialog open={!!dup} onOpenChange={(o) => !o && setDup(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Existing candidate found</AlertDialogTitle>
            <AlertDialogDescription>
              <span className="font-medium text-foreground">{dup?.name}</span> already exists (
              {dup?.email}). They previously applied for{" "}
              <span className="font-medium text-foreground">{dup?.role}</span>.
              {dup?.isBlacklisted && (
                <div className="mt-2 text-destructive font-semibold">
                  ⚠️ WARNING: This candidate is blacklisted. ({dup?.blacklistReason})
                </div>
              )}
              Add this as a new application on their profile, or create a separate record?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button
              variant="outline"
              onClick={() => {
                if (!dup) return;
                setDup(null);
                persist();
              }}
            >
              Create new record
            </Button>
            <AlertDialogAction
              onClick={() => {
                if (!dup) return;
                reapply(dup.id, form.role, form.source);
                toast.success("Application added to existing candidate");
                navigate(`/candidates/${dup.id}`);
                setDup(null);
              }}
            >
              Update existing
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
