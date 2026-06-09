import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
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
} from "./ats-types";

const STORAGE_KEY = "ats.candidates.v2";
const isDev = import.meta.env.DEV;
const API_URL = isDev ? "http://localhost/full%20cims/api/candidates.php" : "/cims/api/candidates.php";

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
  add: (input: any) => Candidate;
  update: (id: string, patch: Partial<Candidate>, activityMsg?: string) => void;
  remove: (ids: string[]) => void;
  setStage: (id: string, stage: Stage) => void;
  addNote: (id: string, note: string) => void;
  addInterview: (id: string, iv: Omit<Interview, "id">) => void;
  findDuplicate: (email: string, phone: string) => Candidate | undefined;
  reapply: (existingId: string, role: string, source: Source) => void;
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

  const syncPut = (c: Candidate) => {
    fetch(`${API_URL}?id=${c.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(c),
    }).catch(console.error);
  };

  const api: Ctx = useMemo(
    () => ({
      candidates,
      setAll: (c) => mutate(() => c),
      add: (input) => {
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
          interviews: [],
          activity: [{ id: uid(), at: t, kind: "created", message: "Application received" }],
          applications: [{ appliedAt: input.appliedAt || t, role: input.role, source: input.source }],
        };
        mutate((prev) => [cand, ...prev]);
        fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(cand),
        }).catch(console.error);
        return cand;
      },
      update: (id, patch, activityMsg) => {
        mutate((prev) =>
          prev.map((c) => {
            if (c.id !== id) return c;
            const next: Candidate = { ...c, ...patch, updatedAt: now() };
            if (activityMsg) {
              next.activity = [...c.activity, { id: uid(), at: now(), kind: "edited", message: activityMsg }];
            }
            syncPut(next);
            return next;
          })
        );
      },
      remove: (ids) => {
        mutate((prev) => prev.filter((c) => !ids.includes(c.id)));
        fetch(API_URL, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids }),
        }).catch(console.error);
      },
      setStage: (id, stage) => {
        mutate((prev) =>
          prev.map((c) => {
            if (c.id !== id) return c;
            const entry: ActivityEntry = { id: uid(), at: now(), kind: "status", message: `Status changed: ${c.stage} → ${stage}` };
            const next = { ...c, stage, updatedAt: now(), activity: [...c.activity, entry] };
            syncPut(next);
            return next;
          })
        );
      },
      addNote: (id, note) => {
        mutate((prev) =>
          prev.map((c) => {
            if (c.id !== id) return c;
            const next = { ...c, updatedAt: now(), activity: [...c.activity, { id: uid(), at: now(), kind: "note", message: note }] };
            syncPut(next);
            return next;
          })
        );
      },
      addInterview: (id, iv) => {
        mutate((prev) =>
          prev.map((c) => {
            if (c.id !== id) return c;
            const full: Interview = { ...iv, id: uid() };
            const next = {
              ...c,
              updatedAt: now(),
              interviews: [...c.interviews, full],
              stage: (c.stage === "New Applicant" || c.stage === "Shortlisted" || c.stage === "HR Call Scheduled") ? "Interview Scheduled" : c.stage,
              activity: [...c.activity, { id: uid(), at: now(), kind: "interview", message: `${iv.type} interview on ${new Date(iv.date).toLocaleString()}` }],
            } as Candidate;
            syncPut(next);
            return next;
          })
        );
      },
      findDuplicate: (email, phone) => {
        const e = email.trim().toLowerCase();
        const p = phone.replace(/\s+/g, "");
        return candidates.find((c) => (e && c.email.toLowerCase() === e) || (p && c.phone.replace(/\s+/g, "") === p));
      },
      reapply: (id, role, source) => {
        mutate((prev) =>
          prev.map((c) => {
            if (c.id !== id) return c;
            const t = now();
            const next = {
              ...c,
              role,
              source,
              stage: "New Applicant",
              updatedAt: t,
              appliedAt: t,
              applications: [...c.applications, { appliedAt: t, role, source }],
              activity: [...c.activity, { id: uid(), at: t, kind: "reapplied", message: `Reapplied for ${role} via ${source}` }],
            } as Candidate;
            syncPut(next);
            return next;
          })
        );
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
    [candidates, canUndo]
  );

  return <AtsContext.Provider value={api}>{children}</AtsContext.Provider>;
}

export function useAts() {
  const ctx = useContext(AtsContext);
  if (!ctx) throw new Error("useAts must be used inside AtsProvider");
  return ctx;
}

export { PIPELINE_STAGES };
export { DEPARTMENTS } from "./ats-types";
