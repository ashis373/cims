export const PIPELINE_STAGES = [
  "New Applicant",
  "Shortlisted",
  "HR Call Scheduled",
  "Interview Scheduled",
  "Interview Completed",
  "Offer Released",
  "Offer Accepted",
  "Offer Declined",
  "Offer Expired",
  "Joined",
  "Rejected",
  "No Show",
  "On Hold",
] as const;

export type Stage = (typeof PIPELINE_STAGES)[number];

export const SOURCES = ["Website", "LinkedIn", "Job Board", "Referral", "Other"] as const;
export type Source = (typeof SOURCES)[number];

export const DEPARTMENTS = [
  "Elearning",
  "software development",
  "multimedia design",
  "QA testing",
  "Digital Marketing",
  "Business Development",
] as const;
export type Department = (typeof DEPARTMENTS)[number];

export function inferDepartment(role: string): Department {
  const r = role.toLowerCase();
  if (r.includes("design") || r.includes("multimedia")) return "multimedia design";
  if (r.includes("qa") || r.includes("test")) return "QA testing";
  if (r.includes("market") || r.includes("seo") || r.includes("digital")) return "Digital Marketing";
  if (r.includes("business") || r.includes("sales") || r.includes("bde")) return "Business Development";
  if (r.includes("elearning") || r.includes("content")) return "Elearning";
  return "software development";
}

export const DEPARTMENT_COLORS: Record<Department, string> = {
  "Elearning": "bg-blue-500/12 text-blue-700 dark:text-blue-300 border-blue-500/25",
  "software development": "bg-violet-500/12 text-violet-700 dark:text-violet-300 border-violet-500/25",
  "multimedia design": "bg-fuchsia-500/12 text-fuchsia-700 dark:text-fuchsia-300 border-fuchsia-500/25",
  "QA testing": "bg-cyan-500/12 text-cyan-700 dark:text-cyan-300 border-cyan-500/25",
  "Digital Marketing": "bg-orange-500/12 text-orange-700 dark:text-orange-300 border-orange-500/25",
  "Business Development": "bg-emerald-500/12 text-emerald-700 dark:text-emerald-300 border-emerald-500/25",
};

export const INTERVIEW_TYPES = ["HR Call", "Technical", "Practical", "Managerial", "Final Round"] as const;
export type InterviewType = (typeof INTERVIEW_TYPES)[number];

export interface Interview {
  id: string;
  application_id?: string;
  date: string; // ISO
  type: string;
  end_time?: string;
  mode?: string;
  interviewers?: string;
  meeting_link?: string;
  location?: string;
  notes?: string;
  outcome?: string;
  status?: string;
  feedback?: string;
  rating?: number;
  recommendation?: string;
  comments?: string;
  created_by?: string;
  created_at?: string;
}

export interface ActivityEntry {
  id: string;
  at: string; // ISO
  kind: "created" | "status" | "note" | "interview" | "reapplied" | "edited";
  message: string;
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  source: Source;
  role: string;
  department: Department;
  resume?: string;
  notes?: string;
  appliedAt: string; // ISO
  updatedAt: string;
  stage: Stage;
  tags: string[];
  interviews: Interview[];
  activity: ActivityEntry[];
  notesList?: any[];
  documentsList?: any[];
  alerts?: any[];
  interviewsList?: any[];
  applicationsList?: any[];
  applications: { appliedAt: string; role: string; source: Source }[];
  joiningDate?: string;
  designation?: string;
  employeeId?: string;
  isBlacklisted?: boolean;
  blacklistReason?: string;
  blacklistApproved?: boolean;
  rejectionReason?: string;
  stageReason?: string; // For offer declined, no show, etc.
  skills?: string[];
  experience?: string;
  currentCompany?: string;
  currentDesignation?: string;
  currentCtc?: string;
  expectedCtc?: string;
  location?: string;
  preferredLocation?: string;
  alternateMobile?: string;
  relevantExperience?: string;
  linkedInProfile?: string;
  noticePeriod?: string;
  recruiter?: string;
  photo?: string;
}

export const STAGE_COLORS: Record<Stage, string> = {
  "New Applicant": "bg-sky-500/12 text-sky-700 dark:text-sky-300 border-sky-500/25",
  Shortlisted: "bg-violet-500/12 text-violet-700 dark:text-violet-300 border-violet-500/25",
  "HR Call Scheduled":
    "bg-fuchsia-500/12 text-fuchsia-700 dark:text-fuchsia-300 border-fuchsia-500/25",
  "Interview Scheduled": "bg-blue-500/12 text-blue-700 dark:text-blue-300 border-blue-500/25",
  "Interview Completed":
    "bg-indigo-500/12 text-indigo-700 dark:text-indigo-300 border-indigo-500/25",
  "Offer Released": "bg-amber-500/12 text-amber-700 dark:text-amber-300 border-amber-500/25",
  "Offer Accepted":
    "bg-emerald-500/12 text-emerald-700 dark:text-emerald-300 border-emerald-500/25",
  "Offer Declined": "bg-rose-500/12 text-rose-700 dark:text-rose-300 border-rose-500/25",
  "Offer Expired": "bg-stone-500/12 text-stone-700 dark:text-stone-300 border-stone-500/25",
  Joined: "bg-green-500/12 text-green-700 dark:text-green-300 border-green-500/25",
  Rejected: "bg-red-500/12 text-red-700 dark:text-red-300 border-red-500/25",
  "No Show": "bg-orange-500/12 text-orange-700 dark:text-orange-300 border-orange-500/25",
  "On Hold": "bg-zinc-500/12 text-zinc-600 dark:text-zinc-300 border-zinc-500/25",
};
