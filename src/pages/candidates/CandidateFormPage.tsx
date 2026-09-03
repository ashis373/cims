import { useEffect, useState } from "react";
import { useAts } from "@/services/ats-store";
import {
  PIPELINE_STAGES,
  SOURCES,
  DEPARTMENTS,
  type Candidate,
  type Department,
  type Source,
  type Stage,
} from "@/types/ats-types";
import { getAuthHeaders } from "@/services/candidate-api";
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
  MessageSquare,
  Wand2,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { API_BASE_URL } from "@/config/api";

const empty = {
  name: "",
  email: "",
  phone: "",
  alternateMobile: "",
  role: "",
  department: "" as any,
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
  photo: "",
};

const ErrorMsg = ({ msg }: { msg?: string }) => {
  if (!msg) return null;
  return <div className="text-[11px] text-destructive mt-1.5 font-bold">{msg}</div>;
};

export default function CandidateFormPage() {
  const { id } = useParams();
  const { candidates, add, update, findDuplicate, reapply } = useAts();
  const navigate = useNavigate();
  const candidate = candidates.find((c) => c.id === id);

  const [form, setForm] = useState(empty);
  const [dup, setDup] = useState<Candidate | null>(null);
  const [dupType, setDupType] = useState<"EXACT" | "POSSIBLE" | "DIFFERENT_POSITION" | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [openJobs, setOpenJobs] = useState<any[]>([]);
  const [dbDepartments, setDbDepartments] = useState<any[]>([]);
  const [recruiters, setRecruiters] = useState<any[]>([]);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchOptions = { credentials: 'include' as RequestCredentials, headers: getAuthHeaders(false) };
        const [jobsRes, deptsRes, recRes] = await Promise.all([
          fetch(`${API_BASE_URL}/jobs/jobs.php`, fetchOptions),
          fetch(`${API_BASE_URL}/jobs/departments.php`, fetchOptions),
          fetch(`${API_BASE_URL}/recruiters/recruiters.php`, fetchOptions)
        ]);
        const jobsData = await jobsRes.json();
        const deptsData = await deptsRes.json();
        const recData = await recRes.json();

        if (Array.isArray(jobsData)) {
          setOpenJobs(jobsData.filter((j: any) => j.status === 'Open').map((j: any) => ({...j, title: j.title.trim(), department: j.department.trim()})));
        }
        if (Array.isArray(deptsData)) {
          setDbDepartments(deptsData.map((d: any) => ({...d, name: d.name.trim()})));
        }
        if (Array.isArray(recData)) {
          setRecruiters(recData.filter((r: any) => r.status === 'Active').map((r: any) => ({...r, name: r.name.trim()})));
        }
      } catch (e) {
        console.error("Failed to fetch data", e);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (candidate) {
      setForm({
        name: candidate.name || "",
        email: candidate.email || "",
        phone: candidate.phone || "",
        role: candidate.role ? candidate.role.trim() : "",
        department: candidate.department ? candidate.department.trim() : "",
        source: candidate.source || "",
        stage: candidate.stage || "New Applicant",
        resume: candidate.resume || "",
        notes: candidate.notes || "",
        tags: candidate.tags.join(", "),
        skills: candidate.skills?.join(", ") || "",
        experience: candidate.experience ? String(candidate.experience).replace(/[^\d.]/g, '') : "",
        relevantExperience: candidate.relevantExperience ? String(candidate.relevantExperience).replace(/[^\d.]/g, '') : "",
        currentCompany: candidate.currentCompany || "",
        currentDesignation: candidate.currentDesignation || "",
        currentCtc: candidate.currentCtc ? String(candidate.currentCtc).replace(/[^\d.]/g, '') : "",
        expectedCtc: candidate.expectedCtc ? String(candidate.expectedCtc).replace(/[^\d.]/g, '') : "",
        location: candidate.location || "",
        preferredLocation: candidate.preferredLocation || "",
        alternateMobile: candidate.alternateMobile || "",
        linkedInProfile: candidate.linkedInProfile || "",
        noticePeriod: candidate.noticePeriod ? String(candidate.noticePeriod).replace(/[^\d]/g, '') : "",
        recruiter: candidate.recruiter ? candidate.recruiter.trim() : "",
        appliedAt: candidate.appliedAt.slice(0, 10),
        photo: candidate.photo || "",
      });
    } else {
      setForm(empty);
    }
  }, [candidate]);

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
    // Clear error for this field when user starts typing
    if (errors[k]) {
      setErrors((err) => ({ ...err, [k]: "" }));
    }
  };



  const validate = () => {
    const newErrors: Record<string, string> = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const nameRegex = /^[a-zA-Z\s\-']+$/;

    if (!form.name.trim()) newErrors.name = "Name is required.";
    else if (!nameRegex.test(form.name)) newErrors.name = "Name can only contain letters, spaces, and hyphens.";
    else if (form.name.trim().length > 120) newErrors.name = "Name too long.";

    if (!form.email.trim()) newErrors.email = "Email is required.";
    else if (!emailRegex.test(form.email)) newErrors.email = "Please enter a valid email address.";

    const phoneRegex = /^\d{10}$/;
    if (!form.phone.trim()) newErrors.phone = "Mobile number is required.";
    else if (!phoneRegex.test(form.phone)) newErrors.phone = "Mobile number must be exactly 10 digits.";

    if (form.alternateMobile && !phoneRegex.test(form.alternateMobile)) {
      newErrors.alternateMobile = "Alternate mobile must be exactly 10 digits.";
    }

    if (form.location && form.location.length > 50) newErrors.location = "Location cannot exceed 50 characters.";
    if (form.preferredLocation && form.preferredLocation.length > 50) newErrors.preferredLocation = "Preferred location cannot exceed 50 characters.";


    if (form.experience && (isNaN(Number(form.experience)) || Number(form.experience) < 0 || Number(form.experience) > 50)) {
      newErrors.experience = "Enter a valid total experience (0-50).";
    }

    if (form.relevantExperience) {
      if (isNaN(Number(form.relevantExperience)) || Number(form.relevantExperience) < 0 || Number(form.relevantExperience) > 50) {
        newErrors.relevantExperience = "Enter a valid relevant experience (0-50).";
      } else if (form.experience && Number(form.relevantExperience) > Number(form.experience)) {
        newErrors.relevantExperience = "Relevant experience cannot exceed total experience.";
      }
    }

    if (form.currentCtc && (isNaN(Number(form.currentCtc)) || Number(form.currentCtc) < 0)) {
      newErrors.currentCtc = "Enter a valid positive number for CTC.";
    }

    if (form.expectedCtc && (isNaN(Number(form.expectedCtc)) || Number(form.expectedCtc) < 0)) {
      newErrors.expectedCtc = "Enter a valid positive number for expected CTC.";
    }

    if (form.noticePeriod && (isNaN(Number(form.noticePeriod)) || Number(form.noticePeriod) < 0)) {
      newErrors.noticePeriod = "Enter a valid positive number for notice period (days).";
    }

    if (!form.department) newErrors.department = "Department is required.";
    if (!form.role) newErrors.role = "Position applied for is required.";
    if (!form.recruiter) newErrors.recruiter = "Recruiter is required.";
    if (!form.resume) newErrors.resume = "Resume upload is required.";
  

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Please fix the validation errors before submitting.");
      return;
    }

    if (!candidate) {
      const existing = findDuplicate(form.email, form.phone, form.name, form.role);
      if (existing) {
        setDup(existing.candidate);
        setDupType(existing.type);
        return;
      }
    }

    persist(false);
  };

  const persist = async (forceCreate = false) => {
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
            skills: form.skills
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean),
            experience: form.experience + " Years",
            relevantExperience: form.relevantExperience + " Years",
            currentCompany: form.currentCompany,
            currentDesignation: form.currentDesignation,
            currentCtc: form.currentCtc + " LPA",
            expectedCtc: form.expectedCtc ? form.expectedCtc + " LPA" : "",
            location: form.location,
            preferredLocation: form.preferredLocation,
            alternateMobile: form.alternateMobile,
            linkedInProfile: form.linkedInProfile,
            noticePeriod: form.noticePeriod + " Days",
            recruiter: form.recruiter,
            appliedAt: new Date(form.appliedAt).toISOString(),
            photo: form.photo,
          },
          "Profile edited",
        );
        toast.success("Candidate updated");
        navigate(`/candidates/${candidate.id}`);
      } else {
        const c = await add({
          forceCreate,
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
          skills: form.skills
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          experience: form.experience + " Years",
          relevantExperience: form.relevantExperience + " Years",
          currentCompany: form.currentCompany,
          currentDesignation: form.currentDesignation,
          currentCtc: form.currentCtc + " LPA",
          expectedCtc: form.expectedCtc ? form.expectedCtc + " LPA" : "",
          location: form.location,
          preferredLocation: form.preferredLocation,
          alternateMobile: form.alternateMobile,
          linkedInProfile: form.linkedInProfile,
          noticePeriod: form.noticePeriod + " Days",
          recruiter: form.recruiter,
          appliedAt: new Date(form.appliedAt).toISOString(),
          photo: form.photo,
        });
        toast.success("Candidate added");
        navigate(`/candidates/${c.id}`);
      }
    } catch (e) {
      // Error handled by store
    }
  };

  const handleNameChange = (value: string) => {
    // Only allow letters, spaces, hyphens, and apostrophes
    const sanitized = value.replace(/[^a-zA-Z\s\-']/g, "");
    set("name", sanitized);
  };

  const handlePhoneChange = (field: "phone" | "alternateMobile", value: string) => {
    // Only allow digits, max 10
    const sanitized = value.replace(/\D/g, "").slice(0, 10);
    set(field, sanitized);
  };

  const handleNumericChange = (field: keyof typeof form, value: string) => {
    // Allow digits and dot
    const sanitized = value.replace(/[^\d.]/g, "");
    set(field, sanitized);
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

      <form onSubmit={submit} className="space-y-6" noValidate>


        {/* Section 1: Basic Information */}
        <Card className="p-6 bg-white border-border/50 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] rounded-3xl">
          <div className="flex items-center gap-3 mb-6 pb-5 border-b border-slate-100">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <User className="h-5 w-5" />
            </div>
            <h3 className="text-[17px] font-bold text-slate-900 tracking-tight">
              Basic Information
            </h3>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="md:col-span-2">
              <Label
                htmlFor="photo"
                className="flex items-center gap-1.5 text-muted-foreground mb-1.5"
              >
                <User className="h-3.5 w-3.5" /> Profile Photo (Optional)
              </Label>
              <Input
                id="photo"
                type="file"
                accept="image/jpeg,image/png"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const formData = new FormData();
                    formData.append("resume", file);
                    const uploadUrl = `${API_BASE_URL}/candidates/upload.php`;
                    try {
                      const res = await fetch(uploadUrl, { method: "POST", body: formData });
                      const data = await res.json();
                      if (data.success) {
                        set("photo", data.filename);
                      } else {
                        console.error(data.error || "Upload failed");
                      }
                    } catch (err) {
                      console.error("Upload failed", err);
                    }
                  }
                }}
                className="pt-1.5 mb-4"
              />
              {form.photo && (
                <div className="mt-4 flex flex-col gap-3">
                  <div className="text-xs text-muted-foreground text-emerald-600 font-medium">
                    Uploaded: {form.photo.split('_').slice(1).join('_') || form.photo}
                  </div>
                  <div className="h-24 w-24 rounded-2xl overflow-hidden border-4 border-white shadow-md">
                    <img
                      src={`${API_BASE_URL}/../uploads/candidates/photos/${form.photo}`}
                      alt="Profile preview"
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>
              )}
            </div>
            <div className="md:col-span-2">
              <Label
                htmlFor="name"
                className="flex items-center gap-1.5 text-muted-foreground mb-1.5"
              >
                <User className="h-3.5 w-3.5" /> Candidate Name{" "}
                <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => handleNameChange(e.target.value)}
                maxLength={120}
                placeholder="Full name"
                className={errors.name ? "border-destructive focus-visible:ring-destructive" : ""}
              />
              <ErrorMsg msg={errors.name} />
            </div>
            <div>
              <Label
                htmlFor="phone"
                className="flex items-center gap-1.5 text-muted-foreground mb-1.5"
              >
                <Phone className="h-3.5 w-3.5" /> Mobile Number{" "}
                <span className="text-destructive">*</span>
              </Label>
              <Input
                id="phone"
                value={form.phone}
                onChange={(e) => handlePhoneChange("phone", e.target.value)}
                placeholder="10-digit mobile number"
                className={errors.phone ? "border-destructive focus-visible:ring-destructive" : ""}
              />
              <ErrorMsg msg={errors.phone} />
            </div>
            <div>
              <Label
                htmlFor="alternateMobile"
                className="flex items-center gap-1.5 text-muted-foreground mb-1.5"
              >
                <Phone className="h-3.5 w-3.5" /> Alternate Mobile
              </Label>
              <Input
                id="alternateMobile"
                value={form.alternateMobile}
                onChange={(e) => handlePhoneChange("alternateMobile", e.target.value)}
                placeholder="Alternate 10-digit number"
                className={errors.alternateMobile ? "border-destructive focus-visible:ring-destructive" : ""}
              />
              <ErrorMsg msg={errors.alternateMobile} />
            </div>
            <div className="md:col-span-2">
              <Label
                htmlFor="email"
                className="flex items-center gap-1.5 text-muted-foreground mb-1.5"
              >
                <Mail className="h-3.5 w-3.5" /> Email Address{" "}
                <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                maxLength={255}
                placeholder="email@example.com"
                className={errors.email ? "border-destructive focus-visible:ring-destructive" : ""}
              />
              <ErrorMsg msg={errors.email} />
            </div>
            <div>
              <Label
                htmlFor="location"
                className="flex items-center gap-1.5 text-muted-foreground mb-1.5"
              >
                <MapPin className="h-3.5 w-3.5" /> Current Location
              </Label>
              <Input
                id="location"
                value={form.location}
                onChange={(e) => set("location", e.target.value.slice(0, 50))}
                placeholder="City (max 50 chars)"
                className={errors.location ? "border-destructive focus-visible:ring-destructive" : ""}
              />
              <ErrorMsg msg={errors.location} />
            </div>
            <div>
              <Label
                htmlFor="preferredLocation"
                className="flex items-center gap-1.5 text-muted-foreground mb-1.5"
              >
                <MapPin className="h-3.5 w-3.5" /> Preferred Location
              </Label>
              <Input
                id="preferredLocation"
                value={form.preferredLocation}
                onChange={(e) => set("preferredLocation", e.target.value.slice(0, 50))}
                placeholder="Preferred city (max 50 chars)"
                className={errors.preferredLocation ? "border-destructive focus-visible:ring-destructive" : ""}
              />
              <ErrorMsg msg={errors.preferredLocation} />
            </div>
          </div>
        </Card>

        {/* Section 2: Professional Details */}
        <Card className="p-6 bg-white border-border/50 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] rounded-3xl">
          <div className="flex items-center gap-3 mb-6 pb-5 border-b border-slate-100">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
              <Briefcase className="h-5 w-5" />
            </div>
            <h3 className="text-[17px] font-bold text-slate-900 tracking-tight">
              Professional Details
            </h3>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <Label
                htmlFor="experience"
                className="flex items-center gap-1.5 text-muted-foreground mb-1.5"
              >
                <Clock className="h-3.5 w-3.5" /> Total Experience (Years)
              </Label>
              <Input id="experience"
                value={form.experience}
                onChange={(e) => handleNumericChange("experience", e.target.value)}
                placeholder="e.g., 5"
                className={errors.experience ? "border-destructive focus-visible:ring-destructive" : ""}
              />
              <ErrorMsg msg={errors.experience} />
            </div>
            <div>
              <Label
                htmlFor="relevantExperience"
                className="flex items-center gap-1.5 text-muted-foreground mb-1.5"
              >
                <Clock className="h-3.5 w-3.5" /> Relevant Experience (Years)
              </Label>
              <Input
                id="relevantExperience"
                value={form.relevantExperience}
                onChange={(e) => handleNumericChange("relevantExperience", e.target.value)}
                placeholder="e.g., 4"
                className={errors.relevantExperience ? "border-destructive focus-visible:ring-destructive" : ""}
              />
              <ErrorMsg msg={errors.relevantExperience} />
            </div>
            <div>
              <Label
                htmlFor="currentCompany"
                className="flex items-center gap-1.5 text-muted-foreground mb-1.5"
              >
                <Building2 className="h-3.5 w-3.5" /> Current Company
              </Label>
              <Input
                id="currentCompany"
                value={form.currentCompany}
                onChange={(e) => set("currentCompany", e.target.value)}
                placeholder="Current employer"
                className={errors.currentCompany ? "border-destructive focus-visible:ring-destructive" : ""}
              />
              <ErrorMsg msg={errors.currentCompany} />
            </div>
            <div>
              <Label
                htmlFor="currentDesignation"
                className="flex items-center gap-1.5 text-muted-foreground mb-1.5"
              >
                <Briefcase className="h-3.5 w-3.5" /> Current Designation
              </Label>
              <Input
                id="currentDesignation"
                value={form.currentDesignation}
                onChange={(e) => set("currentDesignation", e.target.value)}
                placeholder="Job title"
                className={errors.currentDesignation ? "border-destructive focus-visible:ring-destructive" : ""}
              />
              <ErrorMsg msg={errors.currentDesignation} />
            </div>
            <div>
              <Label
                htmlFor="currentCtc"
                className="flex items-center gap-1.5 text-muted-foreground mb-1.5"
              >
                <IndianRupee className="h-3.5 w-3.5" /> Current CTC (LPA)
              </Label>
              <Input
                id="currentCtc"
                value={form.currentCtc}
                onChange={(e) => handleNumericChange("currentCtc", e.target.value)}
                placeholder="e.g., 12"
                className={errors.currentCtc ? "border-destructive focus-visible:ring-destructive" : ""}
              />
              <ErrorMsg msg={errors.currentCtc} />
            </div>
            <div>
              <Label
                htmlFor="expectedCtc"
                className="flex items-center gap-1.5 text-muted-foreground mb-1.5"
              >
                <IndianRupee className="h-3.5 w-3.5" /> Expected CTC (LPA)
              </Label>
              <Input
                id="expectedCtc"
                value={form.expectedCtc}
                onChange={(e) => handleNumericChange("expectedCtc", e.target.value)}
                placeholder="e.g., 18"
                className={errors.expectedCtc ? "border-destructive focus-visible:ring-destructive" : ""}
              />
              <ErrorMsg msg={errors.expectedCtc} />
            </div>
            <div>
              <Label
                htmlFor="noticePeriod"
                className="flex items-center gap-1.5 text-muted-foreground mb-1.5"
              >
                <Clock className="h-3.5 w-3.5" /> Notice Period (Days)
              </Label>
              <Input
                id="noticePeriod"
                value={form.noticePeriod}
                onChange={(e) => set("noticePeriod", e.target.value.replace(/\D/g, ""))}
                placeholder="e.g., 30"
                className={errors.noticePeriod ? "border-destructive focus-visible:ring-destructive" : ""}
              />
              <ErrorMsg msg={errors.noticePeriod} />
            </div>
            <div>
              <Label
                htmlFor="skills"
                className="flex items-center gap-1.5 text-muted-foreground mb-1.5"
              >
                <Wrench className="h-3.5 w-3.5" /> Skills
              </Label>
              <Input
                id="skills"
                value={form.skills}
                onChange={(e) => set("skills", e.target.value)}
                placeholder="React, Node.js, Python..."
              />
            </div>
            <div>
              <Label
                htmlFor="resume"
                className="flex items-center gap-1.5 text-muted-foreground mb-1.5"
              >
                <FileText className="h-3.5 w-3.5" /> Resume Upload{" "}
                <span className="text-destructive">*</span>
              </Label>
              <Input
                id="resume"
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    if (file.size > 2 * 1024 * 1024) {
                      toast.error("Resume file size must be less than 2 MB");
                      e.target.value = '';
                      return;
                    }
                    const formData = new FormData();
                    formData.append("resume", file);
                    const uploadUrl = `${API_BASE_URL}/candidates/upload.php`;
                    try {
                      const res = await fetch(uploadUrl, { method: "POST", body: formData });
                      const data = await res.json();
                      if (data.success) {
                        set("resume", data.filename);
                      } else {
                        toast.error(data.error || "Upload failed");
                        console.error(data.error || "Upload failed");
                      }
                    } catch (err) {
                      toast.error("Upload failed due to network error");
                      console.error("Upload failed", err);
                    }
                  }
                }}
                className={errors.resume ? "border-destructive focus-visible:ring-destructive pt-1.5" : "pt-1.5"}
              />
              <ErrorMsg msg={errors.resume} />
              {form.resume && (
                <div className="text-xs text-muted-foreground mt-1 text-emerald-600">
                  Uploaded: {form.resume.split('_').slice(1).join('_') || form.resume}
                </div>
              )}
            </div>
            <div>
              <Label
                htmlFor="linkedInProfile"
                className="flex items-center gap-1.5 text-muted-foreground mb-1.5"
              >
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
        <Card className="p-6 bg-white border-border/50 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] rounded-3xl">
          <div className="flex items-center gap-3 mb-6 pb-5 border-b border-slate-100">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <FileText className="h-5 w-5" />
            </div>
            <h3 className="text-[17px] font-bold text-slate-900 tracking-tight">
              Application Details
            </h3>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <Label className="flex items-center gap-1.5 text-muted-foreground mb-1.5">
                <Share2 className="h-3.5 w-3.5" /> Source
              </Label>
              <Select key={`source-${form.source}`} value={form.source || ""} onValueChange={(v) => set("source", v as Source)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select source" />
                </SelectTrigger>
                <SelectContent>
                  {SOURCES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                  {form.source && !SOURCES.includes(form.source as Source) && (
                    <SelectItem value={form.source}>{form.source}</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label
                htmlFor="department"
                className="flex items-center gap-1.5 text-muted-foreground mb-1.5"
              >
                <Building2 className="h-3.5 w-3.5" /> Department{" "}
                <span className="text-destructive">*</span>
              </Label>
              {(() => {
                const activeDepartment = form.department || (candidate as any)?.department?.trim() || "";
                return (
                  <Select 
                    key={`dept-${activeDepartment}`}
                    value={activeDepartment || undefined} 
                    onValueChange={(v) => { set("department", v as Department); set("role", ""); }}
                  >
                    <SelectTrigger className={errors.department ? "border-destructive focus:ring-destructive" : ""}>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {dbDepartments.map(d => (
                        <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>
                      ))}
                      {activeDepartment && !dbDepartments.find(d => d.name === activeDepartment) && (
                        <SelectItem value={activeDepartment}>{activeDepartment}</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                );
              })()}
              <ErrorMsg msg={errors.department} />
            </div>
            <div>
              <Label
                htmlFor="role"
                className="flex items-center gap-1.5 text-muted-foreground mb-1.5"
              >
                <Briefcase className="h-3.5 w-3.5" /> Position Applied For{" "}
                <span className="text-destructive">*</span>
              </Label>
              {(() => {
                const activeRole = form.role || (candidate as any)?.role?.trim() || "";
                const activeDepartment = form.department || (candidate as any)?.department?.trim() || "";
                return (
                  <Select key={`role-${activeRole}`} value={activeRole || undefined} onValueChange={(v) => set("role", v)}>
                    <SelectTrigger className={errors.role ? "border-destructive focus:ring-destructive" : ""}>
                      <SelectValue placeholder="Select position" />
                    </SelectTrigger>
                    <SelectContent>
                      {openJobs.filter(j => !activeDepartment || j.department?.toLowerCase() === activeDepartment?.toLowerCase()).length > 0 ? (
                        openJobs.filter(j => !activeDepartment || j.department?.toLowerCase() === activeDepartment?.toLowerCase()).map((job) => (
                          <SelectItem key={job.id} value={job.title}>
                            {job.title} ({job.id})
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="loading" disabled>
                          {openJobs.length > 0 ? "No jobs found for this department" : "Loading jobs..."}
                        </SelectItem>
                      )}
                      {activeRole && !openJobs.find(j => j.title === activeRole && (!activeDepartment || j.department?.toLowerCase() === activeDepartment?.toLowerCase())) && activeRole !== "loading" && (
                        <SelectItem value={activeRole}>{activeRole}</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                );
              })()}
              <ErrorMsg msg={errors.role} />
            </div>
            <div>
              <Label
                htmlFor="recruiter"
                className="flex items-center gap-1.5 text-muted-foreground mb-1.5"
              >
                <User className="h-3.5 w-3.5" /> Recruiter{" "}
                <span className="text-destructive">*</span>
              </Label>
              {(() => {
                const activeRecruiter = form.recruiter || (candidate as any)?.recruiter?.trim() || "";
                return (
                  <Select
                    key={`recruiter-${activeRecruiter}`}
                    value={activeRecruiter || undefined}
                    onValueChange={(v) => set("recruiter", v)}
                  >
                    <SelectTrigger
                      id="recruiter"
                      className={cn("h-11 rounded-xl bg-slate-50 border-slate-200 font-medium", errors.recruiter && "border-destructive focus-visible:ring-destructive")}
                    >
                      <SelectValue placeholder="Select recruiter" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {recruiters.length === 0 ? (
                        <SelectItem value="loading" disabled>Loading recruiters...</SelectItem>
                      ) : (
                        recruiters.map((r) => (
                          <SelectItem key={r.id} value={String(r.name)}>
                            {r.name}
                          </SelectItem>
                        ))
                      )}
                      {activeRecruiter && !recruiters.find(r => r.name === activeRecruiter) && (
                        <SelectItem value={activeRecruiter}>{activeRecruiter}</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                );
              })()}
              <ErrorMsg msg={errors.recruiter} />
            </div>

            <div className="md:col-span-2">
              <Label
                htmlFor="notes"
                className="flex items-center gap-1.5 text-muted-foreground mb-1.5"
              >
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

        <div className="text-[12px] text-muted-foreground font-semibold px-2">
          Note: <span className="text-destructive">*</span> indicates mandatory fields  for candidate registration and processing.
        </div>
        <div className="flex justify-end gap-3 pt-4 sticky bottom-6 bg-white/90 p-4 rounded-3xl border border-slate-100 backdrop-blur-md shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
          <Button type="button" variant="ghost" className="font-bold rounded-xl" asChild>
            <Link to={candidate ? `/candidates/${candidate.id}` : "/candidates"}>Cancel</Link>
          </Button>
          <Button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 font-bold rounded-xl"
          >
            {candidate ? "Save changes" : "Add candidate"}
          </Button>
        </div>
      </form>

      <AlertDialog open={!!dup} onOpenChange={(o) => {
        if (!o) {
          setDup(null);
          setDupType(null);
        }
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className={`text-lg ${dupType === "EXACT" ? "text-destructive" : "text-amber-600"}`}>
              {dupType === "EXACT" ? "Exact Duplicate Candidate" : dupType === "DIFFERENT_POSITION" ? "Existing Candidate Found" : "Possible Duplicate Candidate Found"}
            </AlertDialogTitle>

            <div className="text-sm mt-3 space-y-3">
              <div className="grid grid-cols-[1fr_1.5fr] gap-x-2 gap-y-2 border border-slate-100 rounded-xl p-4 bg-slate-50/50">
                <div className="text-slate-500">Candidate Name</div>
                <div className={`font-medium ${dup && form.name.trim().toLowerCase() === dup.name.trim().toLowerCase() ? "bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md w-fit" : "text-slate-900"}`}>{dup?.name}</div>

                <div className="text-slate-500">Email</div>
                <div className={`font-medium ${dup && form.email.trim().toLowerCase() === dup.email.trim().toLowerCase() ? "bg-red-100 text-red-900 px-2 py-0.5 rounded-md w-fit" : "text-slate-900"}`}>{dup?.email}</div>

                <div className="text-slate-500">Mobile Number</div>
                <div className={`font-medium ${dup && form.phone.replace(/\s+/g, "") === dup.phone.replace(/\s+/g, "") ? "bg-red-100 text-red-900 px-2 py-0.5 rounded-md w-fit" : "text-slate-900"}`}>{dup?.phone}</div>

                <div className="text-slate-500">Previous Application</div>
                <div className="font-medium text-slate-900">{dup?.appliedAt ? new Date(dup.appliedAt).toLocaleDateString() : 'N/A'}</div>

                <div className="text-slate-500">Applied Position</div>
                <div className="font-medium text-slate-900">{dup?.role}</div>

                <div className="text-slate-500">Recruiter Name</div>
                <div className="font-medium text-slate-900">{dup?.recruiter || 'System'}</div>

                <div className="text-slate-500">Current Status</div>
                <div className="font-medium text-slate-900">{dup?.stage}</div>

                <div className="text-slate-500">Historical Records</div>
                <div className="font-medium text-slate-900">{dup?.activity?.length || 0} recorded events</div>
              </div>

              {dup?.isBlacklisted && (
                <div className="mt-2 text-destructive font-semibold bg-destructive/10 p-3 rounded-lg border border-destructive/20">
                  ⚠️ WARNING: This candidate is blacklisted.
                  <div className="font-normal text-xs mt-1">Reason: {dup?.blacklistReason || 'Not specified'}</div>
                </div>
              )}

              <AlertDialogDescription className="pt-2 text-slate-600">
                {dupType === "EXACT" && "This candidate has already applied for this position."}
                {dupType === "DIFFERENT_POSITION" && "This candidate already exists and is applying for a different position."}
                {dupType === "POSSIBLE" && "Would you like to add this as a new application on their existing profile, or create a separate record?"}
              </AlertDialogDescription>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            {dupType === "POSSIBLE" && (() => { try { return JSON.parse(localStorage.getItem("cims_user") || "{}").role_name === 'Administrator'; } catch { return false; } })() && (
              <Button
                variant="outline"
                onClick={() => {
                  if (!dup) return;
                  setDup(null);
                  setDupType(null);
                  persist(true);
                }}
              >
                Create new record
              </Button>
            )}
            <AlertDialogAction
              onClick={() => {
                if (!dup) return;
                reapply(dup.id, form.role, form.source, form.department, form.recruiter, dupType === "DIFFERENT_POSITION");
                toast.success(dupType === "EXACT" ? "Application updated" : "Application added to existing candidate");
                navigate(`/candidates/${dup.id}`);
                setDup(null);
                setDupType(null);
              }}
            >
              {dupType === "EXACT" ? "Update Existing only" : dupType === "DIFFERENT_POSITION" ? "Add New Application to Existing Profile" : "Update existing"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
