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

import {
  fetchCandidatesAPI,
  postCandidateAPI,
  putCandidateAPI,
  deleteCandidatesAPI,
  bulkUndoSyncAPI,
  postInterviewAPI,
  putInterviewAPI,
} from "./candidate-api";
import { API_BASE_URL } from "@/config/api";

import { uid, now, findDuplicateHelper } from "./candidate-utils";

interface Ctx {
  candidates: Candidate[];
  setAll: (c: Candidate[]) => void;
  add: (input: Partial<Candidate>) => Promise<Candidate>;
  update: (id: string, patch: Partial<Candidate>, activityMsg?: string) => Promise<void>;
  remove: (ids: string[]) => Promise<void>;
  setStage: (id: string, stage: Stage, reason?: string) => Promise<void>;
  addNote: (id: string, note: string) => Promise<void>;
  addInterview: (id: string, iv: Omit<Interview, "id">) => Promise<void>;
  updateInterview: (candidateId: string, interviewId: string, patch: any) => Promise<void>;
  findDuplicate: (email: string, phone: string, name: string, role: string) => { type: "EXACT" | "POSSIBLE" | "DIFFERENT_POSITION", candidate: Candidate } | null;
  reapply: (existingId: string, role: string, source: Source, department: string, recruiter: string, isNewApp?: boolean) => Promise<void>;
  undo: () => void;
  canUndo: boolean;
  isLoading: boolean;
  error: string | null;
}

const AtsContext = createContext<Ctx | null>(null);

export function AtsProvider({ children }: { children: ReactNode }) {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const history = useRef<Candidate[][]>([]);
  const [canUndo, setCanUndo] = useState(false);

  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      try {
        const data = await fetchCandidatesAPI();
        if (!isMounted) return;
        setCandidates((prev) => {
          if (JSON.stringify(prev) !== JSON.stringify(data)) {
            return data;
          }
          return prev;
        });
      } catch (err) {
        console.error("DB Fetch failed:", err);
        if (isMounted && candidates.length === 0) {
          setError("Failed to load candidates");
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    // Initial fetch only
    fetchData();

    return () => {
      isMounted = false;
    };
  }, []); // Removing the setInterval for repeated polling

  const mutate = (updater: (prev: Candidate[]) => Candidate[]) => {
    setCandidates((prev) => {
      history.current.push(prev);
      if (history.current.length > 20) history.current.shift();
      setCanUndo(true);
      return updater(prev);
    });
  };

  const syncPut = async (c: Candidate) => {
    await putCandidateAPI(c);
  };

  const api: Ctx = useMemo(
    () => ({
      candidates,
      setAll: (c) => mutate(() => c),
      add: async (input) => {
        const t = now();
        const cand = {
          id: uid(),
          forceCreate: (input as any).forceCreate,
          name: input.name || "",
          email: input.email || "",
          phone: input.phone || "",
          source: input.source || "Website",
          role: input.role || "",
          department: input.department || inferDepartment(input.role || ""),
          photo: input.photo || "",
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
            { appliedAt: input.appliedAt || t, role: input.role || "", source: input.source || "Website", department: input.department || "", recruiter: input.recruiter || "" },
          ],
        } as unknown as Candidate;
        try {
          await postCandidateAPI(cand);
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
          await deleteCandidatesAPI(ids);
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
        } as Candidate;
        try {
          await syncPut(next);
          mutate((prev) => prev.map((c) => (c.id === id ? next : c)));
          
          try {
            const triggerRes = await fetch(`${API_BASE_URL}/settings/email/trigger.php`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ candidate_id: id, stage })
            }).then(r => r.json());
            
            if (triggerRes.success) {
              if (triggerRes.method === 'Automatic') {
                toast.success(`Automated email sent for ${stage}`);
              } else if (triggerRes.method === 'Manual' && triggerRes.draft) {
                window.dispatchEvent(new CustomEvent('EMAIL_DRAFT', { detail: triggerRes.draft }));
              }
            }
          } catch(e) {
            console.error("Failed to trigger email", e);
          }
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
      addInterview: async (id, iv) => {
        const target = candidates.find((c) => c.id === id);
        if (!target) return;
        
        const appId = target.applicationsList?.[0]?.id || target.applications?.[0]?.id;
        if (!appId) {
          toast.error("Candidate has no active application");
          return;
        }

        try {
          const payload = {
            ...iv,
            candidate_id: id,
            application_id: appId
          };
          
          await postInterviewAPI(payload);
          
          const full: Interview = { ...iv, id: uid() }; // Fallback local ID until refresh
          const next = {
            ...target,
            updatedAt: now(),
            interviewsList: [...(target.interviewsList || []), full],
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
                message: `${iv.type} scheduled for ${new Date(iv.date).toLocaleString()}`,
              },
            ],
          } as Candidate;
          
          mutate((prev) => prev.map((c) => (c.id === id ? next : c)));
        } catch (e) {
          const error = e as Error;
          toast.error(error.message || "Database error");
          throw error;
        }
      },
      updateInterview: async (candidateId: string, interviewId: string, patch: any) => {
        const target = candidates.find((c) => c.id === candidateId);
        if (!target) return;

        try {
          await putInterviewAPI(interviewId, { ...patch, candidate_id: candidateId });
          
          const next = {
            ...target,
            updatedAt: now(),
            interviewsList: target.interviewsList?.map((iv: any) => iv.id === interviewId ? { ...iv, ...patch } : iv),
            activity: [
              ...target.activity,
              {
                id: uid(),
                at: now(),
                kind: "interview",
                message: `Interview updated: ${patch.status || "Updated"}`,
              },
            ],
          } as Candidate;
          
          mutate((prev) => prev.map((c) => (c.id === candidateId ? next : c)));
        } catch (e) {
          const error = e as Error;
          toast.error(error.message || "Database error");
          throw error;
        }
      },
      findDuplicate: (email, phone, name, role) => {
        return findDuplicateHelper(candidates, email, phone, name, role);
      },
      reapply: async (id, role, source, department, recruiter, isNewApp = false) => {
        const target = candidates.find((c) => c.id === id);
        if (!target) return;
        const t = now();
        const next = {
          ...target,
          role,
          source,
          department,
          recruiter,
          isNewApplication: isNewApp,
          stage: "New Applicant",
          updatedAt: t,
          appliedAt: t,
          applications: [...(target.applications || []), { appliedAt: t, role, source, department, recruiter }],
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
        bulkUndoSyncAPI(prev);

        toast.success("Undone");
      },
      canUndo,
      isLoading,
      error,
    }),
    [candidates, canUndo, isLoading, error],
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
