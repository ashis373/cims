import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import {
  PIPELINE_STAGES,
  SOURCES,
  inferDepartment,
  type Candidate,
  type Department,
  type Interview,
  type Stage,
  type Source,
  type ActivityEntry,
} from "@/types/ats-types";

const STORAGE_KEY = "ats.candidates.v2";
const isDev = import.meta.env.DEV;
const API_URL = isDev
  ? "http://localhost/full-cims/api/candidates.php"
  : "https://demo.hexalearn.com/cims/api/candidates.php";

function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function now() {
  return new Date().toISOString();
}

function seed(): Candidate[] {
  // ... (keep short seed for fallback)
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

interface Ctx {
  candidates: Candidate[];
  setAll: (c: Candidate[]) => void;
  add: (input: Partial<Candidate>) => Promise<Candidate>;
  update: (id: string, patch: Partial<Candidate>, activityMsg?: string) => Promise<void>;
  remove: (ids: string[]) => Promise<void>;
  setStage: (id: string, stage: Stage, reason?: string) => Promise<void>;
  addNote: (id: string, note: string) => Promise<void>;
  addInterview: (id: string, iv: Omit<Interview, "id">) => Promise<void>;
  findDuplicate: (email: string, phone: string) => Candidate | undefined;
  reapply: (existingId: string, role: string, source: Source) => Promise<void>;
  undo: () => void;
  canUndo: boolean;
}

const AtsContext = createContext<Ctx | null>(null);

export function AtsProvider({ children }: { children: ReactNode }) {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const history = useRef<Candidate[][]>([]);
  const [canUndo, setCanUndo] = useState(false);

  useEffect(() => {
    fetch(API_URL)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setCandidates(data);
        } else {
          // fallback
          const s = seed();
          setCandidates(s);
          fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ bulk: true, candidates: s }),
          }).catch(console.error);
        }
      })
      .catch((err) => {
        console.error("DB Fetch failed:", err);
        const local = localStorage.getItem(STORAGE_KEY);
        if (local) setCandidates(JSON.parse(local));
      });
  }, []);

  const mutate = (updater: (prev: Candidate[]) => Candidate[]) => {
    setCandidates((prev) => {
      history.current.push(prev);
      if (history.current.length > 20) history.current.shift();
      setCanUndo(true);
      return updater(prev);
    });
  };

  const syncPut = async (c: Candidate) => {
    const res = await fetch(`${API_URL}?id=${c.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(c),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Failed to update database");
    }
  };

  const api: Ctx = useMemo(
    () => ({
      candidates,
      setAll: (c) => mutate(() => c),
      add: async (input) => {
        const t = now();
        const cand: Candidate = {
          id: uid(),
          name: input.name,
          email: input.email,
          phone: input.phone,
          source: input.source,
          role: input.role,
          department: input.department || inferDepartment(input.role),
          resume: input.resume || "",
          notes: input.notes || "",
          appliedAt: input.appliedAt || t,
          updatedAt: t,
          stage: input.stage || "New Applicant",
          tags: input.tags || [],
          skills: input.skills || [],
          experience: input.experience || "",
          relevantExperience: input.relevantExperience || "",
          currentCompany: input.currentCompany || "",
          currentDesignation: input.currentDesignation || "",
          currentCtc: input.currentCtc || "",
          expectedCtc: input.expectedCtc || "",
          location: input.location || "",
          preferredLocation: input.preferredLocation || "",
          alternateMobile: input.alternateMobile || "",
          linkedInProfile: input.linkedInProfile || "",
          noticePeriod: input.noticePeriod || "",
          recruiter: input.recruiter || "Unassigned",
          interviews: [],
          activity: [{ id: uid(), at: t, kind: "created", message: "Application received" }],
          applications: [
            { appliedAt: input.appliedAt || t, role: input.role, source: input.source },
          ],
        };
        try {
          const res = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(cand),
          });
          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.error || "Failed to add candidate");
          }
          mutate((prev) => [cand, ...prev]);
          return cand;
        } catch (e) {
          const error = e as Error;
          toast.error(error.message || "Database error");
          throw error;
        }
      },
      update: async (id, patch, activityMsg) => {
        const target = candidates.find((c) => c.id === id);
        if (!target) return;
        const next: Candidate = { ...target, ...patch, updatedAt: now() };
        if (activityMsg) {
          next.activity = [
            ...target.activity,
            { id: uid(), at: now(), kind: "edited", message: activityMsg },
          ];
        }
        try {
          await syncPut(next);
          mutate((prev) => prev.map((c) => (c.id === id ? next : c)));
        } catch (e) {
          const error = e as Error;
          toast.error(error.message || "Database error");
          throw error;
        }
      },
      remove: async (ids) => {
        try {
          const res = await fetch(API_URL, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ids }),
          });
          if (!res.ok) throw new Error("Failed to delete from database");
          mutate((prev) => prev.filter((c) => !ids.includes(c.id)));
        } catch (e) {
          const error = e as Error;
          toast.error(error.message || "Database error");
          throw error;
        }
      },
      setStage: async (id, stage, reason) => {
        const target = candidates.find((c) => c.id === id);
        if (!target) return;
        let msg = `Status changed: ${target.stage} → ${stage}`;
        if (reason) msg += ` (Reason: ${reason})`;
        const entry: ActivityEntry = {
          id: uid(),
          at: now(),
          kind: "status",
          message: msg,
        };
        const next = {
          ...target,
          stage,
          updatedAt: now(),
          activity: [...target.activity, entry],
          ...(reason && stage === "Rejected" ? { rejectionReason: reason } : {}),
          ...(reason && (stage === "Offer Declined" || stage === "No Show")
            ? { stageReason: reason }
            : {}),
        };
        try {
          await syncPut(next);
          mutate((prev) => prev.map((c) => (c.id === id ? next : c)));
        } catch (e) {
          const error = e as Error;
          toast.error(error.message || "Database error");
          throw error;
        }
      },
      addNote: async (id, note) => {
        const target = candidates.find((c) => c.id === id);
        if (!target) return;
        const next = {
          ...target,
          updatedAt: now(),
          activity: [...target.activity, { id: uid(), at: now(), kind: "note", message: note }],
        };
        try {
          await syncPut(next);
          mutate((prev) => prev.map((c) => (c.id === id ? next : c)));
        } catch (e) {
          const error = e as Error;
          toast.error(error.message || "Database error");
          throw error;
        }
      },
      addInterview: async (id, iv) => {
        const target = candidates.find((c) => c.id === id);
        if (!target) return;
        const full: Interview = { ...iv, id: uid() };
        const next = {
          ...target,
          updatedAt: now(),
          interviews: [...target.interviews, full],
          stage:
            target.stage === "New Applicant" ||
            target.stage === "Shortlisted" ||
            target.stage === "HR Call Scheduled"
              ? "Interview Scheduled"
              : target.stage,
          activity: [
            ...target.activity,
            {
              id: uid(),
              at: now(),
              kind: "interview",
              message: `${iv.type} interview on ${new Date(iv.date).toLocaleString()}`,
            },
          ],
        } as Candidate;
        try {
          await syncPut(next);
          mutate((prev) => prev.map((c) => (c.id === id ? next : c)));
        } catch (e) {
          const error = e as Error;
          toast.error(error.message || "Database error");
          throw error;
        }
      },
      findDuplicate: (email, phone) => {
        const e = email.trim().toLowerCase();
        const p = phone.replace(/\s+/g, "");
        return candidates.find(
          (c) => (e && c.email.toLowerCase() === e) || (p && c.phone.replace(/\s+/g, "") === p),
        );
      },
      reapply: async (id, role, source) => {
        const target = candidates.find((c) => c.id === id);
        if (!target) return;
        const t = now();
        const next = {
          ...target,
          role,
          source,
          stage: "New Applicant",
          updatedAt: t,
          appliedAt: t,
          applications: [...target.applications, { appliedAt: t, role, source }],
          activity: [
            ...target.activity,
            {
              id: uid(),
              at: t,
              kind: "reapplied",
              message: `Reapplied for ${role} via ${source}`,
            },
          ],
        } as Candidate;
        try {
          await syncPut(next);
          mutate((prev) => prev.map((c) => (c.id === id ? next : c)));
        } catch (e) {
          const error = e as Error;
          toast.error(error.message || "Database error");
          throw error;
        }
      },
      undo: () => {
        const prev = history.current.pop();
        if (!prev) {
          toast("Nothing to undo");
          return;
        }
        setCandidates(prev);
        setCanUndo(history.current.length > 0);

        // Push the entire 'prev' state back to the DB to sync undo
        fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bulk: true, candidates: prev }),
        }).catch(console.error);

        toast.success("Undone");
      },
      canUndo,
    }),
    [candidates, canUndo],
  );

  return <AtsContext.Provider value={api}>{children}</AtsContext.Provider>;
}

export function useAts() {
  const ctx = useContext(AtsContext);
  if (!ctx) throw new Error("useAts must be used inside AtsProvider");
  return ctx;
}

export { PIPELINE_STAGES };
export { DEPARTMENTS } from "@/types/ats-types";
