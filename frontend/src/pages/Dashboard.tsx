import { Link } from "react-router-dom";
import { useMemo, useState } from "react";
import { useAts } from "@/lib/ats-store";
import { PIPELINE_STAGES, STAGE_COLORS, type Stage } from "@/lib/ats-types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Users, CalendarCheck, Trophy, XCircle, Download, TrendingUp } from "lucide-react";
import { CandidateFormDialog } from "@/components/ats/CandidateFormDialog";
import { ExportDialog } from "@/components/ats/ExportDialog";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";


const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const item: any = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
};

function Stat({ label, value, icon: Icon, tone }: { label: string; value: number; icon: React.ElementType; tone: string }) {
  return (
    <motion.div variants={item}>
      <Card className="p-5 glass-card overflow-hidden relative group transition-all hover:shadow-lg hover:-translate-y-0.5">
        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
          <Icon className="h-12 w-12" />
        </div>
        <div className="flex items-center justify-between relative z-10">
          <div>
            <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground/80">{label}</div>
            <div className="mt-1 text-3xl font-bold tabular-nums tracking-tight">{value}</div>
            <div className="mt-1 flex items-center gap-1 text-[10px] text-emerald-600 font-medium">
              <TrendingUp className="h-3 w-3" /> +12% from last month
            </div>
          </div>
          <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl shadow-sm", tone)}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

function Dashboard() {
  const { candidates } = useAts();
  const [addOpen, setAddOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);

  const counts = useMemo(() => {
    const c = (s: Stage) => candidates.filter((x) => x.stage === s).length;
    return {
      total: candidates.length,
      shortlisted: c("Shortlisted"),
      scheduled: c("Interview Scheduled"),
      hired: c("Joined"),
      rejected: c("Rejected"),
    };
  }, [candidates]);

  const max = Math.max(1, ...PIPELINE_STAGES.map((s) => candidates.filter((c) => c.stage === s).length));
  const recent = [...candidates].sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt)).slice(0, 8);

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={container}
      className="space-y-8"
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Effortlessly manage your recruitment pipeline.</p>
        </div>
        <div className="flex gap-2.5">
          <Button variant="outline" onClick={() => setExportOpen(true)} className="glass"><Download className="mr-2 h-4 w-4" />Export</Button>
          <Button onClick={() => setAddOpen(true)} className="shadow-md shadow-primary/20"><Plus className="mr-2 h-4 w-4" />Add candidate</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        <Stat label="Total Pipeline" value={counts.total} icon={Users} tone="bg-primary/10 text-primary" />
        <Stat label="Shortlisted" value={counts.shortlisted} icon={Users} tone="bg-violet-500/10 text-violet-600 dark:text-violet-300" />
        <Stat label="Scheduled" value={counts.scheduled} icon={CalendarCheck} tone="bg-blue-500/10 text-blue-600 dark:text-blue-300" />
        <Stat label="Hired" value={counts.hired} icon={Trophy} tone="bg-emerald-500/10 text-emerald-600 dark:text-emerald-300" />
        <Stat label="Rejected" value={counts.rejected} icon={XCircle} tone="bg-rose-500/10 text-rose-600 dark:text-rose-300" />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <motion.div variants={item}>
          <Card className="p-6 glass-card h-full">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-sm font-semibold">Stage Distribution</h3>
                <p className="text-xs text-muted-foreground">Candidate conversion funnel</p>
              </div>
              <Link to="/pipeline" className="text-xs font-medium text-primary hover:underline px-2 py-1 rounded hover:bg-primary/5 transition-colors">Kanban View →</Link>
            </div>
            <div className="space-y-4">
              {PIPELINE_STAGES.map((stage) => {
                const n = candidates.filter((c) => c.stage === stage).length;
                const pct = (n / max) * 100;
                return (
                  <div key={stage} className="space-y-1.5">
                    <div className="flex justify-between text-[11px] font-medium">
                      <div className="flex items-center gap-2">
                        <span className={cn("h-1.5 w-1.5 rounded-full", STAGE_COLORS[stage].split(" ")[0].replace("/15", ""))} />
                        {stage}
                      </div>
                      <span className="tabular-nums text-muted-foreground">{n}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted/30 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 1, delay: 0.2 }}
                        className={cn("h-full rounded-full transition-all", STAGE_COLORS[stage].split(" ")[0].replace("/15", ""))}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="p-6 glass-card h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold">Active Candidates</h3>
              <Link to="/candidates" className="text-xs font-medium text-primary hover:underline px-2 py-1 rounded hover:bg-primary/5 transition-colors">View Directory →</Link>
            </div>
            <div className="space-y-3">
              {recent.map((c) => (
                <Link key={c.id} to={`/candidates/${c.id }`} className="group flex items-center justify-between p-2.5 hover:bg-muted/50 rounded-xl transition-all border border-transparent hover:border-border/50">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/5 text-primary text-[10px] font-bold uppercase transition-colors group-hover:bg-primary/10">
                      {c.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div>
                      <div className="text-sm font-medium">{c.name}</div>
                      <div className="text-[11px] text-muted-foreground">{c.role}</div>
                    </div>
                  </div>
                  <div className={cn("rounded-full border px-2.5 py-0.5 text-[10px] font-medium whitespace-nowrap", STAGE_COLORS[c.stage])}>{c.stage}</div>
                </Link>
              ))}
              {recent.length === 0 && <div className="py-12 text-center text-sm text-muted-foreground">No records found.</div>}
            </div>
          </Card>
        </motion.div>
      </div>

      <CandidateFormDialog open={addOpen} onOpenChange={setAddOpen} />
      <ExportDialog open={exportOpen} onOpenChange={setExportOpen} candidates={candidates} scope="all" />
    </motion.div>
  );
}

export default Dashboard;
