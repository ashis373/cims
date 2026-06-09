import { useState } from "react";
import { Link } from "react-router-dom";
import { useAts } from "@/lib/ats-store";
import { PIPELINE_STAGES, STAGE_COLORS, type Candidate, type Stage } from "@/lib/ats-types";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";

export function KanbanBoard({ candidates }: { candidates: Candidate[] }) {
  const { setStage } = useAts();
  const [dragId, setDragId] = useState<string | null>(null);
  const [overStage, setOverStage] = useState<Stage | null>(null);

  return (
    <div className="flex gap-6 overflow-x-auto pb-8 pt-2 scrollbar-thin">
      {PIPELINE_STAGES.map((stage) => {
        const items = candidates.filter((c) => c.stage === stage);
        return (
          <div
            key={stage}
            className={cn(
              "flex w-80 shrink-0 flex-col rounded-2xl border border-border/40 bg-muted/20 transition-all duration-300",
              overStage === stage && "border-primary/50 bg-primary/5 ring-4 ring-primary/5"
            )}
            onDragOver={(e) => {
              e.preventDefault();
              setOverStage(stage);
            }}
            onDragLeave={() => setOverStage((s) => (s === stage ? null : s))}
            onDrop={() => {
              if (dragId) {
                const c = candidates.find((x) => x.id === dragId);
                if (c && c.stage !== stage) {
                  setStage(dragId, stage);
                  toast.success(`Candidate moved to ${stage}`);
                }
              }
              setDragId(null);
              setOverStage(null);
            }}
          >
            <div className="flex items-center justify-between px-4 py-4 border-b border-border/30 bg-background/30 backdrop-blur-sm rounded-t-2xl">
              <div className="flex items-center gap-2.5">
                <span className={cn("inline-block h-2 w-2 rounded-full shadow-sm", STAGE_COLORS[stage].split(" ")[0].replace("/15", ""))} />
                <span className="text-sm font-semibold tracking-tight">{stage}</span>
              </div>
              <Badge variant="outline" className="text-[10px] bg-background/50 border-border/30 font-bold tabular-nums">
                {items.length}
              </Badge>
            </div>
            <div className="flex flex-col gap-3 p-3 min-h-[500px]">
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
                        "cursor-grab active:cursor-grabbing p-4 glass-card hover:border-primary/40 transition-all shadow-sm hover:shadow-md",
                        dragId === c.id && "opacity-40"
                      )}
                    >
                      <Link to={`/candidates/${c.id }`} className="block group">
                        <div className="text-sm font-semibold leading-tight group-hover:text-primary transition-colors">{c.name}</div>
                        <div className="mt-1 text-[11px] text-muted-foreground font-medium line-clamp-1">{c.role}</div>

                        {c.tags.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-1.5">
                            {c.tags.slice(0, 2).map((t) => (
                              <div key={t} className="text-[9px] px-1.5 py-0.5 rounded-md bg-secondary/50 text-secondary-foreground font-bold uppercase tracking-wider border border-border/10">
                                {t}
                              </div>
                            ))}
                            {c.tags.length > 2 && (
                              <div className="text-[9px] px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground font-bold border border-border/10">
                                +{c.tags.length - 2}
                              </div>
                            )}
                          </div>
                        )}

                        <div className="mt-4 flex items-center justify-between text-[9px] text-muted-foreground font-semibold uppercase tracking-tighter opacity-70">
                          <span>{c.source}</span>
                          <span>{new Date(c.appliedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                        </div>
                      </Link>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
              {items.length === 0 && (
                <div className="rounded-xl border border-dashed border-border/40 py-10 text-center text-[11px] font-medium text-muted-foreground/50 bg-muted/5 flex flex-col items-center gap-2">
                  <div className="h-6 w-6 rounded-full border border-dashed border-border/60 flex items-center justify-center opacity-30">
                    <Plus className="h-3 w-3" />
                  </div>
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
