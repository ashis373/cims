import { Link } from "react-router-dom";
import { useMemo, useState } from "react";
import { useAts } from "@/lib/ats-store";
import { PIPELINE_STAGES, STAGE_COLORS, type Stage } from "@/lib/ats-types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Users,
  CalendarCheck,
  Trophy,
  XCircle,
  Download,
  TrendingUp,
  Star,
  Mail,
  CheckCircle,
  Ban,
  UserX,
  User,
  Send,
  ArrowUp,
} from "lucide-react";
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

function Stat({
  label,
  value,
  icon: Icon,
  tone,
  borderTone,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  tone: string;
  borderTone?: string;
}) {
  return (
    <motion.div variants={item}>
      <Card
        className={cn(
          "p-5 bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] rounded-3xl relative overflow-hidden group border-t-[3px] h-full",
          borderTone,
        )}
      >
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-gradient-to-br from-transparent to-black/[0.02] rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
        <div className="flex items-start justify-between relative z-10 h-full">
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              {label}
            </div>
            <div className="text-3xl font-black tracking-tight text-slate-900">{value}</div>
            <div className="mt-1.5 flex items-center gap-1 text-[10px] text-emerald-500 font-bold">
              <ArrowUp className="h-3 w-3" /> +12% this month
            </div>
          </div>
          <div
            className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl", tone)}
          >
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

function Dashboard() {
  const { candidates } = useAts();
  const [exportOpen, setExportOpen] = useState(false);

  const counts = useMemo(() => {
    const c = (s: Stage) => candidates.filter((x) => x.stage === s).length;
    const isInactive = (st: Stage) =>
      ["Rejected", "Offer Declined", "No Show", "Offer Expired"].includes(st);

    return {
      total: candidates.length,
      active: candidates.filter((x) => !isInactive(x.stage) && !x.isBlacklisted).length,
      scheduled: c("Interview Scheduled"),
      selected: c("Shortlisted") + c("Interview Completed"), // Proxy for selected
      offersReleased: c("Offer Released"),
      offersAccepted: c("Offer Accepted"),
      joined: c("Joined"),
      rejected: c("Rejected"),
      blacklisted: candidates.filter((x) => x.isBlacklisted).length,
      noShow: c("No Show"),
    };
  }, [candidates]);

  const recent = [...candidates]
    .sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt))
    .slice(0, 4);

  const FUNNEL_COLORS: Record<Stage, string> = {
    "New Applicant": "bg-sky-500",
    Shortlisted: "bg-violet-500",
    "HR Call Scheduled": "bg-fuchsia-500",
    "Interview Scheduled": "bg-blue-500",
    "Interview Completed": "bg-indigo-500",
    "Offer Released": "bg-amber-500",
    "Offer Accepted": "bg-emerald-500",
    "Offer Declined": "bg-rose-500",
    "Offer Expired": "bg-stone-500",
    Joined: "bg-green-500",
    Rejected: "bg-red-500",
    "No Show": "bg-orange-500",
    "On Hold": "bg-zinc-500",
  };

  const activeStages = PIPELINE_STAGES.map((stage) => {
    return {
      stage,
      n: candidates.filter((c) => c.stage === stage).length,
    };
  }).filter((d) => d.n > 0);

  const max = Math.max(1, ...activeStages.map((d) => d.n));

  const funnelData = activeStages.map((data, i) => {
    const { stage, n } = data;

    let nextN = n;
    if (i < activeStages.length - 1) {
      nextN = activeStages[i + 1].n;
    }

    const topW = Math.max(2, (n / max) * 100);
    const botW = Math.max(2, (nextN / max) * 100);
    const clipPath = `polygon(${(100 - topW) / 2}% 0, ${(100 + topW) / 2}% 0, ${(100 + botW) / 2}% 100%, ${(100 - botW) / 2}% 100%)`;

    const bgClass = FUNNEL_COLORS[stage] || "bg-gray-500";

    return { stage, n, clipPath, bgClass };
  });

  const quickViews = [
    {
      label: "New Candidates",
      filter: "New Applicant",
      icon: Users,
      color: "text-blue-600 bg-blue-50 border-blue-100",
    },
    {
      label: "Interviews Today",
      filter: "Interview Scheduled",
      icon: CalendarCheck,
      color: "text-violet-600 bg-violet-50 border-violet-100",
    },
    {
      label: "Pending Offers",
      filter: "Offer Released",
      icon: Send,
      color: "text-amber-600 bg-amber-50 border-amber-100",
    },
    {
      label: "Offer Accepted",
      filter: "Offer Accepted",
      icon: CheckCircle,
      color: "text-emerald-600 bg-emerald-50 border-emerald-100",
    },
    {
      label: "Joined",
      filter: "Joined",
      icon: User,
      color: "text-teal-600 bg-teal-50 border-teal-100",
    },
    {
      label: "Rejected",
      filter: "Rejected",
      icon: XCircle,
      color: "text-rose-600 bg-rose-50 border-rose-100",
    },
    {
      label: "Blacklisted",
      filter: "Blacklisted",
      icon: Ban,
      color: "text-slate-600 bg-slate-100 border-slate-200",
    },
    {
      label: "Future Pool",
      filter: "On Hold",
      icon: Users,
      color: "text-indigo-600 bg-indigo-50 border-indigo-100",
    },
  ];

  return (
    <motion.div initial="hidden" animate="show" variants={container} className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard</h1>
          <p className="text-[13px] text-slate-500 mt-1">
            Effortlessly manage your recruitment pipeline.
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setExportOpen(true)}
            className="bg-white text-slate-700 shadow-sm border-slate-200 text-xs h-9"
          >
            <Download className="mr-2 h-3.5 w-3.5" />
            Export
          </Button>
          <Button
            asChild
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm text-xs h-9"
          >
            <Link to="/candidates/new">
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Add candidate
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        <Stat
          label="Total Candidates"
          value={counts.total}
          icon={Users}
          tone="bg-blue-50 text-blue-600"
          borderTone="border-blue-500"
        />
        <Stat
          label="Active Candidates"
          value={counts.active}
          icon={User}
          tone="bg-emerald-50 text-emerald-600"
          borderTone="border-emerald-500"
        />
        <Stat
          label="Interview Scheduled"
          value={counts.scheduled}
          icon={CalendarCheck}
          tone="bg-violet-50 text-violet-600"
          borderTone="border-violet-500"
        />
        <Stat
          label="Selected"
          value={counts.selected}
          icon={Star}
          tone="bg-amber-50 text-amber-500"
          borderTone="border-amber-500"
        />
        <Stat
          label="Offers Released"
          value={counts.offersReleased}
          icon={Mail}
          tone="bg-rose-50 text-rose-500"
          borderTone="border-rose-500"
        />

        <Stat
          label="Offers Accepted"
          value={counts.offersAccepted}
          icon={CheckCircle}
          tone="bg-emerald-50 text-emerald-500"
          borderTone="border-emerald-500"
        />
        <Stat
          label="Joined"
          value={counts.joined}
          icon={User}
          tone="bg-purple-50 text-purple-600"
          borderTone="border-purple-500"
        />
        <Stat
          label="Rejected"
          value={counts.rejected}
          icon={XCircle}
          tone="bg-red-50 text-red-500"
          borderTone="border-red-500"
        />
        <Stat
          label="Blacklisted"
          value={counts.blacklisted}
          icon={Ban}
          tone="bg-slate-100 text-slate-600"
          borderTone="border-slate-300"
        />
        <Stat
          label="No Join"
          value={counts.noShow}
          icon={UserX}
          tone="bg-orange-50 text-orange-500"
          borderTone="border-orange-500"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-12 h-full">
        <motion.div variants={item} className="col-span-7 h-full">
          <Card className="p-6 bg-white border-border/50 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] rounded-3xl h-full flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-[15px] font-bold text-slate-900">Stage Distribution</h3>
                <p className="text-xs text-slate-500 mt-0.5">Candidate conversion funnel</p>
              </div>
              <Link
                to="/pipeline"
                className="text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-md transition-colors"
              >
                Kanban View →
              </Link>
            </div>
            <div className="flex gap-8 flex-1">
              <div className="flex-1 flex flex-col justify-center">
                {funnelData.map((d) => (
                  <div
                    key={d.stage}
                    className={cn("h-7 w-full transition-all hover:opacity-80", d.bgClass)}
                    style={{ clipPath: d.clipPath, marginBottom: "2px" }}
                  />
                ))}
              </div>
              <div className="w-1/2 flex flex-col justify-center space-y-0.5">
                {funnelData.map((d) => (
                  <div
                    key={d.stage}
                    className="flex items-center justify-between text-[11px] font-medium py-[3px]"
                  >
                    <div className="flex items-center gap-2.5 text-slate-600">
                      <span className={cn("h-2 w-2 rounded-full", d.bgClass)} />
                      {d.stage}
                    </div>
                    <span className="tabular-nums text-slate-800">{d.n}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={item} className="col-span-5 h-full">
          <Card className="p-6 bg-white border-border/50 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] rounded-3xl h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[15px] font-bold text-slate-900">Recent Candidates</h3>
              <Link
                to="/candidates"
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
              >
                View all →
              </Link>
            </div>
            <div className="space-y-1 flex-1">
              {recent.map((c) => (
                <div
                  key={c.id}
                  className="group flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-all border border-transparent border-b-slate-100 last:border-b-transparent"
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-full text-[11px] font-bold uppercase transition-colors",
                        STAGE_COLORS[c.stage],
                      )}
                    >
                      {c.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .substring(0, 2)}
                    </div>
                    <div>
                      <div className="text-[13px] font-bold text-slate-900">{c.name}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{c.role}</div>
                    </div>
                  </div>
                  <div
                    className={cn(
                      "rounded-md px-2.5 py-1 text-[10px] font-bold whitespace-nowrap",
                      STAGE_COLORS[c.stage],
                    )}
                  >
                    {c.stage}
                  </div>
                </div>
              ))}
              {recent.length === 0 && (
                <div className="py-12 text-center text-sm text-slate-500">No records found.</div>
              )}
            </div>
          </Card>
        </motion.div>
      </div>

      <motion.div variants={item}>
        <Card className="p-6 bg-white border-border/50 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] rounded-3xl">
          <h3 className="text-[15px] font-bold text-slate-900 mb-4">Quick Views</h3>
          <div className="flex flex-wrap gap-2.5">
            {quickViews.map((q) => {
              const Icon = q.icon;
              return (
                <Link
                  key={q.label}
                  to={`/candidates?filter=${encodeURIComponent(q.filter)}`}
                  className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[11px] font-bold hover:opacity-80 transition-opacity",
                    q.color,
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {q.label}
                </Link>
              );
            })}
          </div>
        </Card>
      </motion.div>

      <ExportDialog
        open={exportOpen}
        onOpenChange={setExportOpen}
        candidates={candidates}
        scope="all"
      />
    </motion.div>
  );
}

export default Dashboard;
