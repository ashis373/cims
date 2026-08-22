import { type Candidate } from "@/types/ats-types";

export function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export function now() {
  return new Date().toISOString();
}

export function seed(): Candidate[] {
  const names = ["Ava Patel", "Liam Chen", "Noah Garcia"];
  const today = new Date();
  return names.map((name, i) => {
    const applied = new Date(today.getTime() - (i + 1) * (12 * 3600000)).toISOString();
    return {
      id: uid(),
      name,
      email: `${name.toLowerCase().replace(" ", ".")}@example.com`,
      phone: "+1 234 567 8900",
      role: "Software Engineer",
      department: "Engineering",
      source: "Website",
      stage: "New Applicant",
      tags: ["React"],
      appliedAt: applied,
      updatedAt: applied,
      resume: "",
      notes: "",
      interviews: [],
      activity: [{ id: uid(), at: applied, kind: "created", message: "Application received" }],
      applications: [{ appliedAt: applied, role: "Software Engineer", source: "Website" }],
    } as Candidate;
  });
}

export function findDuplicateHelper(
  candidates: Candidate[],
  email: string,
  phone: string,
  name: string
): { type: "EXACT" | "POSSIBLE"; candidate: Candidate } | null {
  const e = email.trim().toLowerCase();
  const p = phone.replace(/\s+/g, "");
  const n = name.trim().toLowerCase();

  const exact = candidates.find(
    (c) => (e && c.email.toLowerCase() === e) || (p && c.phone.replace(/\s+/g, "") === p)
  );
  if (exact) return { type: "EXACT", candidate: exact };

  if (n) {
    const possible = candidates.find((c) => c.name.trim().toLowerCase() === n);
    if (possible) return { type: "POSSIBLE", candidate: possible };
  }

  return null;
}
