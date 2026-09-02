import { useState, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAts } from "@/services/ats-store";
import { PIPELINE_STAGES, STAGE_COLORS, type Candidate, type Stage } from "@/types/ats-types";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, MoreVertical } from "lucide-react";

export function KanbanBoard({ candidates }: { candidates: Candidate[] }) {
  const { setStage } = useAts();
  const [dragId, setDragId] = useState<string | null>(null);
  const [overStage, setOverStage] = useState<Stage | null>(null);
  const [searchParams] = useSearchParams();

  const activeStatus = searchParams.get("status")?.toLowerCase();

  const visibleStages = useMemo(() => {
    if (!activeStatus) return PIPELINE_STAGES;
    return PIPELINE_STAGES.filter((s) => s.toLowerCase().includes(activeStatus));
  }, [activeStatus]);

  return (
    <div className="flex gap-4 overflow-x-auto pb-2 pt-8 scrollbar-thin -scale-y-100 min-h-[400px]">
      {visibleStages.map((stage) => {
        const items = candidates.filter((c) => c.stage === stage);
        const stageColorClass = STAGE_COLORS[stage] || "bg-slate-500/12 text-slate-700";
        const textMatch = stageColorClass.match(/(text-[a-z]+-\d+)/);
        const textClass = textMatch ? textMatch[1] : "text-slate-700";

        return (
          <div
            key={stage}
            className={cn(
              "-scale-y-100 flex w-[280px] shrink-0 flex-col rounded-xl border border-transparent transition-all duration-300",
              overStage === stage
                ? cn(stageColorClass, "border-opacity-30 ring-2 ring-opacity-20")
                : "bg-transparent",
            )}
            onDragOver={(e) => {
              e.preventDefault();
              setOverStage(stage);
            }}
            onDragLeave={() => setOverStage((s) => (s === stage ? null : s))}
            onDrop={async () => {
              if (dragId) {
                const currentDragId = dragId;
                const c = candidates.find((x) => x.id === currentDragId);
                if (c && c.stage !== stage) {
                  try {
                    await setStage(currentDragId, stage);
                    toast.success(`Candidate moved to ${stage}`);
                  } catch (e) {
                    // Error is handled and toasted by ats-store
                  }
                }
              }
              setDragId(null);
              setOverStage(null);
            }}
          >
            <div className="flex items-center justify-between px-3 py-3 mb-2">
              <span className={cn("text-[13px] font-bold tracking-tight", textClass)}>{stage}</span>
              <Badge
                className={cn(
                  "text-[10px] font-bold px-2 py-0 hover:bg-opacity-80 rounded-full bg-white",
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
                      onDragStart={() => setDragId(c.id)}
                      onDragEnd={() => setDragId(null)}
                      className={cn(
                        "cursor-grab active:cursor-grabbing p-4 bg-white border-border/50 hover:border-slate-300 transition-all shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] rounded-2xl relative group",
                        dragId === c.id && "opacity-40",
                      )}
                    >
                      <Link to={`/candidates/${c.id}`} className="block">
                        <div className="flex items-start justify-between mb-3">
                          <div
                            className={cn(
                              "flex h-9 w-9 items-center justify-center rounded-full text-[11px] font-bold uppercase",
                              stageColorClass,
                            )}
                          >
                            {c.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .substring(0, 2)}
                          </div>
                          <button className="text-slate-400 hover:text-slate-600 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreVertical className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="text-[13px] font-bold leading-tight text-slate-900 mb-1">
                          {c.name}
                        </div>
                        <div className="text-[11px] text-slate-500 font-medium">{c.role}</div>

                        {c.tags.length > 0 && (
                          <div className="mt-4 flex flex-wrap gap-2">
                            {c.tags.slice(0, 2).map((t) => (
                              <div
                                key={t}
                                className="text-[9px] px-2 py-1 rounded-md bg-slate-50 text-slate-600 font-bold border border-slate-200"
                              >
                                {t}
                              </div>
                            ))}
                            {c.tags.length > 2 && (
                              <div className="text-[9px] px-2 py-1 rounded-md bg-slate-50 text-slate-600 font-bold border border-slate-200">
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
    </div>
  );
}
