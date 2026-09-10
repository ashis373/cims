import { useState, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAts } from "@/services/ats-store";
import { PIPELINE_STAGES, STAGE_COLORS, type Candidate, type Stage } from "@/types/ats-types";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, MoreVertical, MapPin, CalendarDays, Lock } from "lucide-react";
import { API_BASE_URL } from "@/config/api";
import { ScheduleInterviewDialog } from "@/components/feature/ScheduleInterviewDialog";

export function KanbanBoard({ candidates }: { candidates: Candidate[] }) {
  const { setStage } = useAts();
  const [dragId, setDragId] = useState<string | null>(null);
  const [overStage, setOverStage] = useState<Stage | null>(null);
  const [searchParams] = useSearchParams();

  // Modal dialog states for controlled interview stages
  const [interviewDialogOpen, setInterviewDialogOpen] = useState(false);
  const [interviewDialogCandidate, setInterviewDialogCandidate] = useState<Candidate | null>(null);
  const [interviewDialogMode, setInterviewDialogMode] = useState<"schedule" | "complete" | "update">("schedule");
  const [interviewDialogExisting, setInterviewDialogExisting] = useState<any | null>(null);

  const activeStatus = searchParams.get("status")?.toLowerCase();

  const visibleStages = useMemo(() => {
    if (!activeStatus) return PIPELINE_STAGES;
    return PIPELINE_STAGES.filter((s) => s.toLowerCase().includes(activeStatus));
  }, [activeStatus]);

  // Strict recruitment funnel progression hierarchy (0-indexed)
  const STAGE_ORDER: Record<string, number> = {
    "New Applicant": 0,
    "Shortlisted": 1,
    "HR Call Scheduled": 2,
    "Interview Scheduled": 3,
    "Interview Completed": 4,
    "Offer Released": 5,
    "Offer Accepted": 6,
    "Offer Declined": 6,
    "Offer Expired": 6,
    "Joined": 7,
    "Rejected": 8,
    "No Show": 8,
    "On Hold": 8,
  };

  const handleCandidateDrop = async (targetStage: Stage) => {
    if (!dragId) return;
    const currentDragId = dragId;
    const c = candidates.find((x) => x.id === currentDragId);
    setDragId(null);
    setOverStage(null);

    if (!c || c.stage === targetStage) return;

    // RULE 1: Terminal / finalized stages (Joined) cannot be moved backward
    if (c.stage === "Joined") {
      toast.error(`Cannot move candidate out of Joined stage.`);
      return;
    }

    const currentRank = STAGE_ORDER[c.stage] ?? 0;
    const targetRank = STAGE_ORDER[targetStage] ?? 0;

    // RULE 2: EARLY SCREENING STAGES (New Applicant, Shortlisted, HR Call Scheduled)
    // Cannot skip interview rounds and jump directly to Offer or terminal outcomes (Offer Released, Offer Accepted, Offer Declined, Offer Expired, Joined).
    // Every candidate must go through the interview process (Interview Scheduled -> Interview Completed).
    const isEarlyStage = ["New Applicant", "Shortlisted", "HR Call Scheduled"].includes(c.stage);
    const isOfferOrJoined = ["Offer Released", "Offer Accepted", "Offer Declined", "Offer Expired", "Joined"].includes(targetStage);
    if (isEarlyStage && isOfferOrJoined) {
      toast.error(`Candidates in ${c.stage} must go through interview rounds (Interview Scheduled & Completed) before an offer can be released.`);
      return;
    }

    // RULE 3: "Interview Scheduled 🔒" is locked:
    // Candidate cannot be dragged directly from Interview Scheduled to Offer Released or decision outcomes.
    // They must first complete the interview workflow (Interview Completed with evaluation).
    if (c.stage === "Interview Scheduled" && ["Offer Released", "Offer Accepted", "Offer Declined", "Offer Expired", "Joined"].includes(targetStage)) {
      toast.error(`Interview Scheduled is locked. Interview must be conducted and completed before releasing an offer.`);
      return;
    }

    // RULE 4: "Interview Completed 🔒" is locked:
    // Cannot be arbitrarily moved backward to earlier interview/screening stages.
    if (c.stage === "Interview Completed" && ["New Applicant", "Shortlisted", "HR Call Scheduled", "Interview Scheduled"].includes(targetStage)) {
      toast.error(`Interview Completed is locked. Candidates cannot be moved back to previous stages.`);
      return;
    }

    // RULE 5: Direct outcomes from Offer Released:
    // Offer Released -> Offer Accepted, Offer Declined, Offer Expired, Joined, Rejected, No Show
    if (c.stage === "Offer Released") {
      const allowedFromOffer = [
        "Offer Accepted",
        "Offer Declined",
        "Offer Expired",
        "Joined",
        "Rejected",
        "No Show",
        "On Hold"
      ];
      if (!allowedFromOffer.includes(targetStage)) {
        toast.error(`Cannot move from Offer Released to ${targetStage}`);
        return;
      }
    }

    // Special exit outcomes (Rejected, No Show, On Hold) are universally allowed
    const isSpecialExit = ["Rejected", "No Show", "On Hold"].includes(targetStage);
    if (!isSpecialExit && targetRank < currentRank && c.stage !== "Offer Released") {
      toast.error(`Cannot move candidate backward from "${c.stage}" to "${targetStage}"`);
      return;
    }

    // RULE 5: Dropping into "Interview Scheduled" -> Open Schedule Interview Modal Form
    if (targetStage === "Interview Scheduled") {
      const latestInterview = c.interviewsList?.[0] || c.interviews?.[0] || null;
      setInterviewDialogCandidate(c);
      setInterviewDialogMode("schedule");
      setInterviewDialogExisting(latestInterview);
      setInterviewDialogOpen(true);
      return;
    }

    // RULE 6: Dropping into "Interview Completed" -> Open Update / Complete Interview Modal
    if (targetStage === "Interview Completed") {
      const latestInterview = c.interviewsList?.[0] || c.interviews?.[0] || null;
      setInterviewDialogCandidate(c);
      setInterviewDialogMode("complete");
      setInterviewDialogExisting(latestInterview);
      setInterviewDialogOpen(true);
      return;
    }

    // Normal forward progression stages proceed with direct drag/drop update
    try {
      await setStage(currentDragId, targetStage);
      toast.success(`Candidate moved forward to ${targetStage}`);
    } catch (e) {
      // Handled by store
    }
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 pt-4 scrollbar-thin min-h-[400px]">
      {visibleStages.map((stage) => {
        const items = candidates.filter((c) => c.stage === stage);
        const stageColorClass = STAGE_COLORS[stage] || "bg-slate-500/12 text-slate-700";
        const textMatch = stageColorClass.match(/(text-[a-z]+-\d+)/);
        const textClass = textMatch ? textMatch[1] : "text-slate-700";

        return (
          <div
            key={stage}
            className={cn(
              "flex w-[280px] shrink-0 flex-col rounded-xl border border-transparent transition-all duration-300 select-none",
              overStage === stage
                ? cn(stageColorClass, "border-opacity-30 ring-2 ring-opacity-20")
                : "bg-transparent",
            )}
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = "move";
              setOverStage(stage);
            }}
            onDragLeave={() => setOverStage((s) => (s === stage ? null : s))}
            onDrop={() => handleCandidateDrop(stage)}
          >
            <div className="flex items-center justify-between px-3 py-3 mb-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className={cn("text-[13px] font-bold tracking-tight truncate", textClass)}>{stage}</span>
                {(stage === "Interview Scheduled" || stage === "Interview Completed") && (
                  <span title="Controlled interview stage - opening interview form on drop">
                    <Lock className="w-3 h-3 text-slate-400 shrink-0 inline-block" />
                  </span>
                )}
              </div>
              <Badge
                className={cn(
                  "text-[10px] font-bold px-2 py-0 hover:bg-opacity-80 rounded-full bg-white shrink-0",
                  textClass,
                )}
              >
                {items.length}
              </Badge>
            </div>
            {/* //scrole bara -----------------------------------------   max-h- wii incrize --------------------------------------------------------------------------------*/}
            <div className="flex flex-col gap-3 min-h-[150px] max-h-[410px] overflow-y-auto overflow-x-hidden pr-2 scrollbar-thin scrollbar-thumb-slate-200 hover:scrollbar-thumb-slate-300">
              <AnimatePresence mode="popLayout">
                {items.map((c) => (
                  <motion.div
                    key={c.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card
                      draggable
                      onDragStart={(e) => {
                        e.stopPropagation();
                        e.dataTransfer.setData("text/plain", c.id);
                        e.dataTransfer.effectAllowed = "move";
                        setDragId(c.id);
                      }}
                      onDragEnd={() => {
                        setDragId(null);
                        setOverStage(null);
                      }}
                      className={cn(
                        "cursor-grab active:cursor-grabbing p-4 bg-white border-border/50 hover:border-slate-300 transition-all shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] rounded-2xl relative group select-none",
                        dragId === c.id && "opacity-40 ring-2 ring-primary/40",
                      )}
                    >
                      <Link to={`/candidates/${c.id}`} draggable={false} className="block select-none pointer-events-auto">
                        <div className="flex items-center gap-2.5 mb-2">
                          {c.photo ? (
                            <img
                              src={`${API_BASE_URL}/../uploads/candidates/photos/${c.photo}`}
                              alt={c.name}
                              draggable={false}
                              className="h-9 w-9 rounded-full object-cover shrink-0 border border-slate-200 pointer-events-none select-none"
                            />
                          ) : (
                            <div
                              className={cn(
                                "flex h-9 w-9 items-center justify-center rounded-full text-[11px] font-bold uppercase shrink-0",
                                stageColorClass,
                              )}
                            >
                              {c.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .substring(0, 2)}
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <div className="text-[14px] font-bold leading-tight text-slate-900 truncate">{c.name}</div>
                            <div className="text-[12px] text-slate-500 font-medium truncate">{c.role}</div>
                          </div>
                        </div>

                        <div className="mt-2 space-y-1">
                          {(c.recruiter || c.experience) && (
                            <div className="text-[11px] text-slate-700 font-medium truncate">
                              {[c.recruiter, c.experience].filter(Boolean).join(" · ")}
                            </div>
                          )}
                          {c.location && (
                            <div className="flex items-center gap-1 text-[11px] text-slate-600 font-medium truncate">
                              <MapPin className="h-3 w-3 shrink-0" />
                              {c.location}
                            </div>
                          )}
                          {c.appliedAt && (
                            <div className="flex items-center gap-1 text-[11px] text-slate-600 font-medium">
                              <CalendarDays className="h-3 w-3 shrink-0" />
                              {new Date(c.appliedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                            </div>
                          )}
                        </div>

                        {c.tags.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-1.5">
                            {c.tags.slice(0, 2).map((t) => (
                              <div
                                key={t}
                                className="text-[10px] px-2 py-0.5 rounded-md bg-slate-50 text-slate-600 font-bold border border-slate-200"
                              >
                                {t}
                              </div>
                            ))}
                            {c.tags.length > 2 && (
                              <div className="text-[9px] px-2 py-0.5 rounded-md bg-slate-50 text-slate-600 font-bold border border-slate-200">
                                +{c.tags.length - 2}
                              </div>
                            )}
                          </div>
                        )}
                      </Link>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
              {items.length === 0 && (
                <div className="rounded-2xl border border-dashed border-slate-300 py-6 text-center text-[11px] font-bold text-slate-400 bg-white/50 flex flex-col items-center gap-2">
                  Drop candidates here
                </div>
              )}
            </div>


          </div>
        );
      })}

      {/* Controlled Interview Stages Dialog (Schedule Interview / Update & Complete Interview) */}
      <ScheduleInterviewDialog
        open={interviewDialogOpen}
        onOpenChange={setInterviewDialogOpen}
        candidate={interviewDialogCandidate}
        mode={interviewDialogMode}
        existingInterview={interviewDialogExisting}
      />
    </div>
  );
}
