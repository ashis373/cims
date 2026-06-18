import { Link } from "react-router-dom";
import { useMemo, useState, useEffect } from "react";
import { useAts } from "@/services/ats-store";
import { PIPELINE_STAGES, STAGE_COLORS, type Stage } from "@/types/ats-types";
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
import { ExportDialog } from "@/components/common/ExportDialog";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { API_BASE_URL } from "@/config/api";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const item: import("framer-motion").Variants = {
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
  const [counts, setCounts] = useState<any>({
    total: 0, active: 0, scheduled: 0, selected: 0, offersReleased: 0, offersAccepted: 0, joined: 0, rejected: 0, blacklisted: 0, noShow: 0, funnel: {}
  });

  useEffect(() => {
    fetch(`${API_BASE_URL}/dashboard/stats.php`)
      .then(res => res.json())
      .then(data => setCounts(data))
      .catch(console.error);
  }, []);

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

  const trackingStages = [
    "New Applicant",
    "Shortlisted",
    "HR Call Scheduled",
    "Interview Scheduled",
    "Offer Released",
    "Joined",
    "Rejected",
    "No Show",
    "On Hold",
  ] as Stage[];

  const pipelineData = trackingStages.map((stage) => {
    const n = counts.funnel?.[stage] || 0;
    const pct = counts.total > 0 ? Math.round((n / counts.total) * 100) : 0;
    return { stage, n, pct, bgClass: FUNNEL_COLORS[stage] || "bg-slate-500" };
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

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
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

      <div className="grid gap-4 lg:grid-cols-12 h-full">
        <motion.div variants={item} className="col-span-12 lg:col-span-7 h-full">
          <Card className="p-6 bg-white border-border/50 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] rounded-3xl h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-[15px] font-bold text-slate-900">Pipeline Overview</h3>
                <p className="text-xs text-slate-500 mt-0.5">Candidate distribution by stage</p>
              </div>
              <Link
                to="/pipeline"
                className="text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-md transition-colors"
              >
                Kanban View →
              </Link>
            </div>

            <div className="flex-1 overflow-y-auto md:overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-200">
              <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3 md:min-w-max h-full">
                {pipelineData.map((d, i) => (
                  <div
                    key={d.stage}
                    className="flex flex-col md:flex-row items-center w-full md:w-auto h-auto md:h-full"
                  >
                    <div className="flex flex-row md:flex-col justify-between items-center md:items-start w-full md:w-32 h-auto md:h-full md:min-h-[140px] bg-slate-50/80 border border-slate-100 rounded-2xl p-3 md:p-4 hover:shadow-sm transition-shadow relative overflow-hidden group">
                      <div className={cn("absolute top-0 left-0 w-1 h-full", d.bgClass)} />

                      <div className="flex items-center md:items-start md:flex-col flex-1 gap-2 md:gap-0 pl-1 md:pl-0 truncate">
                        <div
                          className="text-[11px] md:text-[10px] font-bold text-slate-500 uppercase tracking-wide truncate max-w-[120px] md:max-w-full"
                          title={d.stage}
                        >
                          {d.stage.replace(" Scheduled", "").replace(" Released", "")}
                        </div>
                        <div className="text-xl md:text-3xl font-black text-slate-900 md:mt-1">
                          {d.n}
                        </div>
                      </div>

                      <div className="mt-0 md:mt-4 ml-4 md:ml-0 flex flex-col justify-center w-20 md:w-full shrink-0">
                        <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-1">
                          <span>Rate</span>
                          <span>{d.pct}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className={cn("h-full rounded-full", d.bgClass)}
                            style={{ width: `${d.pct}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    {i < pipelineData.length - 1 && (
                      <div className="text-slate-300 my-1 md:my-0 md:mx-1 rotate-90 md:rotate-0 hidden md:block">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={item} className="col-span-12 lg:col-span-5 h-full">
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
                      {(c.name || "?")
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .substring(0, 2)}
                    </div>
                    <div>
                      <div className="text-[13px] font-bold text-slate-900">{c.name || "Unknown Candidate"}</div>
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
                  to={`/pipeline?status=${encodeURIComponent(q.filter.toLowerCase())}`}
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
