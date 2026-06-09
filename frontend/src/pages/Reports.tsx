import { Link } from "react-router-dom";
import { useMemo, useState } from "react";
import { useAts } from "@/lib/ats-store";
import { DEPARTMENTS, PIPELINE_STAGES, SOURCES, STAGE_COLORS, type Department, type Stage } from "@/lib/ats-types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileBarChart2, TrendingUp, Users, Building2, Share2 } from "lucide-react";
import { ExportDialog } from "@/components/ats/ExportDialog";
import { cn } from "@/lib/utils";


function BarRow({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-[11px] font-medium">
        <span className="truncate pr-2">{label}</span>
        <span className="shrink-0 tabular-nums text-muted-foreground">{value}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div className={cn("h-full rounded-full transition-all", color)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function ReportsPage() {
  const { candidates } = useAts();
  const [exportOpen, setExportOpen] = useState(false);

  const stats = useMemo(() => {
    const byStage = PIPELINE_STAGES.reduce<Record<Stage, number>>((acc, s) => {
      acc[s] = candidates.filter((c) => c.stage === s).length;
      return acc;
    }, {} as Record<Stage, number>);

    const byDept = DEPARTMENTS.reduce<Record<Department, number>>((acc, d) => {
      acc[d] = candidates.filter((c) => c.department === d).length;
      return acc;
    }, {} as Record<Department, number>);

    const bySource = SOURCES.reduce<Record<string, number>>((acc, s) => {
      acc[s] = candidates.filter((c) => c.source === s).length;
      return acc;
    }, {});

    const now = new Date();
    const monthly = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const label = d.toLocaleDateString(undefined, { month: "short" });
      const count = candidates.filter((c) => {
        const a = new Date(c.appliedAt);
        return a.getFullYear() === d.getFullYear() && a.getMonth() === d.getMonth();
      }).length;
      return { label, count };
    });

    const conversion = {
      applied: candidates.length,
      shortlisted: byStage.Shortlisted + byStage["HR Call Scheduled"] + byStage["Interview Scheduled"] + byStage["Interview Completed"] + byStage["Offer Released"] + byStage["Offer Accepted"] + byStage.Joined,
      interviewed: byStage["Interview Scheduled"] + byStage["Interview Completed"] + byStage["Offer Released"] + byStage["Offer Accepted"] + byStage.Joined,
      hired: byStage.Joined,
    };

    return { byStage, byDept, bySource, monthly, conversion };
  }, [candidates]);

  const maxStage = Math.max(1, ...Object.values(stats.byStage));
  const maxDept = Math.max(1, ...Object.values(stats.byDept));
  const maxSource = Math.max(1, ...Object.values(stats.bySource));
  const maxMonth = Math.max(1, ...stats.monthly.map((m) => m.count));

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Reports</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Hiring analytics and pipeline insights across {candidates.length} candidates
          </p>
        </div>
        <Button onClick={() => setExportOpen(true)} className="rounded-xl shadow-md shadow-primary/20">
          <Download className="mr-2 h-4 w-4" /> Export Report
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { label: "Total Applicants", value: stats.conversion.applied, icon: Users, tone: "bg-blue-500/10 text-blue-600" },
          { label: "In Pipeline", value: stats.conversion.shortlisted, icon: TrendingUp, tone: "bg-violet-500/10 text-violet-600" },
          { label: "Interviewed", value: stats.conversion.interviewed, icon: FileBarChart2, tone: "bg-sky-500/10 text-sky-600" },
          { label: "Hired", value: stats.conversion.hired, icon: Users, tone: "bg-emerald-500/10 text-emerald-600" },
        ].map((s) => (
          <Card key={s.label} className="rounded-2xl border-border/50 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{s.label}</div>
                <div className="mt-1 text-3xl font-bold tabular-nums">{s.value}</div>
              </div>
              <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", s.tone)}>
                <s.icon className="h-5 w-5" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="rounded-2xl border-border/50 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-2">
            <FileBarChart2 className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">Pipeline by Stage</h3>
          </div>
          <div className="space-y-3">
            {PIPELINE_STAGES.map((stage) => (
              <BarRow
                key={stage}
                label={stage}
                value={stats.byStage[stage]}
                max={maxStage}
                color={STAGE_COLORS[stage].split(" ")[0].replace("/12", "")}
              />
            ))}
          </div>
        </Card>

        <Card className="rounded-2xl border-border/50 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-2">
            <Building2 className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">Candidates by Department</h3>
          </div>
          <div className="space-y-3">
            {DEPARTMENTS.map((dept) => (
              <BarRow
                key={dept}
                label={dept}
                value={stats.byDept[dept]}
                max={maxDept}
                color="bg-blue-500"
              />
            ))}
          </div>
        </Card>

        <Card className="rounded-2xl border-border/50 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-2">
            <Share2 className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">Source Channels</h3>
          </div>
          <div className="space-y-3">
            {SOURCES.map((source) => (
              <BarRow
                key={source}
                label={source}
                value={stats.bySource[source]}
                max={maxSource}
                color="bg-violet-500"
              />
            ))}
          </div>
        </Card>

        <Card className="rounded-2xl border-border/50 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">Applications (Last 6 Months)</h3>
          </div>
          <div className="flex h-40 items-end gap-2">
            {stats.monthly.map((m) => (
              <div key={m.label} className="flex flex-1 flex-col items-center gap-2">
                <span className="text-[10px] font-semibold tabular-nums text-muted-foreground">{m.count}</span>
                <div
                  className="w-full rounded-t-md bg-primary/80 transition-all"
                  style={{ height: `${(m.count / maxMonth) * 100}%`, minHeight: m.count > 0 ? "8px" : "2px" }}
                />
                <span className="text-[10px] font-medium text-muted-foreground">{m.label}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="rounded-2xl border-border/50 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold">Quick Links</h3>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" asChild className="rounded-xl">
            <Link to="/candidates">View All Candidates</Link>
          </Button>
          <Button variant="outline" asChild className="rounded-xl">
            <Link to="/pipeline">Open Pipeline</Link>
          </Button>
          <Button variant="outline" asChild className="rounded-xl">
            <Link to="/calendar">Interview Calendar</Link>
          </Button>
        </div>
      </Card>

      <ExportDialog open={exportOpen} onOpenChange={setExportOpen} candidates={candidates} scope="all" />
    </div>
  );
}

export default ReportsPage;
