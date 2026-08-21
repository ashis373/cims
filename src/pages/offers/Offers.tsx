import { useState, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAts } from "@/services/ats-store";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, ChevronRight, Briefcase, FileText, CheckCircle2, XCircle, AlertTriangle, UserCheck, Percent } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const item = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } }
};

const TABS = [
  { id: "released", label: "Released", icon: FileText, stage: "Offer Released", color: "text-blue-600 bg-blue-50 border-blue-100", tone: "border-blue-500" },
  { id: "accepted", label: "Accepted", icon: CheckCircle2, stage: "Offer Accepted", color: "text-emerald-600 bg-emerald-50 border-emerald-100", tone: "border-emerald-500" },
  { id: "declined", label: "Declined", icon: XCircle, stage: "Offer Declined", color: "text-rose-600 bg-rose-50 border-rose-100", tone: "border-rose-500" },
  { id: "no-join", label: "No-Show", icon: AlertTriangle, stage: "No Show", color: "text-amber-600 bg-amber-50 border-amber-100", tone: "border-amber-500" },
  { id: "joined", label: "Joined", icon: UserCheck, stage: "Joined", color: "text-teal-600 bg-teal-50 border-teal-100", tone: "border-teal-500" },
];

export default function Offers() {
  const { tab } = useParams();
  const navigate = useNavigate();
  const { candidates } = useAts();

  const activeTabId = tab || "released";
  const activeTabDef = TABS.find((t) => t.id === activeTabId) || TABS[0];

  const [search, setSearch] = useState("");

  const analytics = useMemo(() => {
    let released = 0, accepted = 0, declined = 0, noShow = 0, joined = 0;
    candidates.forEach(c => {
      if (c.stage === "Offer Released") released++;
      if (c.stage === "Offer Accepted") accepted++;
      if (c.stage === "Offer Declined") declined++;
      if (c.stage === "No Show") noShow++;
      if (c.stage === "Joined") joined++;
    });
    const total = released + accepted + declined + noShow + joined;
    const acceptedTotal = accepted + joined;
    const rate = total > 0 ? Math.round((acceptedTotal / total) * 100) : 0;
    
    return { total, released, accepted: acceptedTotal, declined, noShow, joined, rate };
  }, [candidates]);

  const filteredCandidates = useMemo(() => {
    return candidates.filter((c) => {
      const matchStage = c.stage === activeTabDef.stage;
      const matchSearch =
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.email.toLowerCase().includes(search.toLowerCase()) ||
        c.role.toLowerCase().includes(search.toLowerCase());
      return matchStage && matchSearch;
    });
  }, [candidates, activeTabDef.stage, search]);

  const formatDate = (d: string) => {
    if (!d) return "-";
    return new Date(d).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <motion.div initial="hidden" animate="show" variants={container} className="flex flex-col gap-8 w-full pb-10 max-w-[1600px] mx-auto">
      {/* Header */}
      <motion.div variants={item} className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 to-indigo-950 shadow-xl border border-indigo-900/50 p-8 sm:p-10 text-white">
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-gradient-to-br from-indigo-500/30 to-purple-500/30 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl shadow-inner border bg-white/10 border-white/20 text-white backdrop-blur-md">
              <Briefcase className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white drop-shadow-sm">
                Offer Management
              </h1>
              <p className="text-indigo-200 text-[13px] sm:text-[14px] font-medium mt-1.5 max-w-lg leading-relaxed">
                Track candidate offers, monitor acceptance rates, and identify potential no-shows in real-time.
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Analytics Cards */}
      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {[
          { label: "Total Offers", value: analytics.total, icon: FileText, tone: "bg-blue-50 text-blue-600", borderTone: "border-blue-500", trend: "Active Pipeline" },
          { label: "Acceptance Rate", value: `${analytics.rate}%`, icon: Percent, tone: "bg-indigo-50 text-indigo-600", borderTone: "border-indigo-500", trend: "Overall Health" },
          { label: "Accepted & Joined", value: analytics.accepted, icon: CheckCircle2, tone: "bg-emerald-50 text-emerald-600", borderTone: "border-emerald-500", trend: "Successfully Closed" },
          { label: "Declined", value: analytics.declined, icon: XCircle, tone: "bg-rose-50 text-rose-600", borderTone: "border-rose-500", trend: "Lost Candidates" },
          { label: "No-Shows", value: analytics.noShow, icon: AlertTriangle, tone: "bg-amber-50 text-amber-600", borderTone: "border-amber-500", trend: "Dropped Post-Offer" },
        ].map((stat, i) => (
          <motion.div 
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            key={i} 
            className={cn("p-5 bg-white shadow-sm hover:shadow-md rounded-2xl relative overflow-hidden group border-t-4 flex-1 min-w-[160px] transition-shadow", stat.borderTone)}
          >
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-gradient-to-br from-transparent to-black/[0.03] rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500 pointer-events-none" />
            <div className="flex items-start justify-between relative z-10">
              <div className="flex flex-col h-full">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">{stat.label}</div>
                <div className="text-3xl font-black tracking-tight text-slate-900 mb-2">{stat.value}</div>
                <div className="mt-auto text-[10px] font-bold text-slate-400">{stat.trend}</div>
              </div>
              <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl", stat.tone)}>
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Filters & Tabs */}
      <motion.div variants={item} className="flex flex-col md:flex-row items-center gap-4 bg-slate-100/50 p-2 rounded-2xl border border-slate-200/60">
        <div className="flex overflow-x-auto hide-scrollbar gap-1 flex-1 w-full md:w-auto p-1">
          {TABS.map((t) => {
            const isActive = activeTabId === t.id;
            const count = candidates.filter((c) => c.stage === t.stage).length;
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => {
                  setSearch("");
                  navigate(`/offers/${t.id}`);
                }}
                className={cn(
                  "relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-bold transition-all duration-300 whitespace-nowrap",
                  isActive
                    ? "text-slate-800"
                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTabOffer"
                    className="absolute inset-0 bg-white rounded-xl shadow-sm border border-slate-200 z-0"
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  <Icon className={cn("h-4 w-4", isActive ? "text-slate-700" : "text-slate-400")} />
                  {t.label}
                </span>
                <span
                  className={cn(
                    "relative z-10 ml-1 px-2 py-0.5 rounded-md text-[11px] font-black transition-colors",
                    isActive ? "bg-slate-100 text-slate-700" : "bg-transparent text-slate-500"
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-[320px] shrink-0 p-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 z-10" />
          <Input
            placeholder="Search candidates by name, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-10 w-full bg-white shadow-sm text-[13px] font-medium rounded-xl border-slate-200 focus-visible:bg-white focus-visible:ring-1 focus-visible:ring-indigo-500 transition-all placeholder:text-slate-400"
          />
        </div>
      </motion.div>

      {/* Data List */}
      <AnimatePresence mode="wait">
        {filteredCandidates.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col items-center justify-center p-20 text-center bg-white shadow-sm rounded-3xl border border-slate-100"
          >
            <div className={cn("h-24 w-24 rounded-3xl flex items-center justify-center mb-6 shadow-sm border", activeTabDef.color)}>
              <activeTabDef.icon className="h-10 w-10 opacity-75" />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">No Candidates Found</h3>
            <p className="text-[14px] text-slate-500 max-w-sm font-medium">
              There are currently no candidates in the "{activeTabDef.label}" stage matching your criteria.
            </p>
          </motion.div>
        ) : (
          <motion.div key="list" variants={container} className="grid gap-4">
            {filteredCandidates.map((c) => (
              <motion.div key={c.id} variants={item}>
                <Card
                  className="group relative overflow-hidden p-0 border-slate-100 shadow-sm hover:shadow-lg hover:border-slate-200 transition-all duration-300 rounded-2xl bg-white"
                >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-slate-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              <div className="flex flex-col md:flex-row items-start md:items-center p-6 gap-6 relative z-10">
                <div className="flex items-center justify-between w-full md:w-auto md:min-w-[280px] lg:min-w-[320px]">
                  <div className="flex items-center gap-4">
                    <div
                      className={cn(
                        "flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-[16px] font-black uppercase shadow-sm border",
                        activeTabDef.color
                      )}
                    >
                      {c.name?.charAt(0) || "?"}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-[16px] text-slate-900 truncate mb-1 group-hover:text-blue-600 transition-colors">
                        {c.name}
                      </div>
                      <div className="text-[13px] font-medium text-slate-500 truncate">{c.email}</div>
                    </div>
                  </div>
                  <Link
                    to={`/candidates/${c.id}`}
                    className="md:hidden flex shrink-0 items-center justify-center h-10 w-10 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 active:bg-slate-100 transition-all shadow-sm"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Link>
                </div>

                <div className="grid grid-cols-2 md:flex flex-1 gap-6 w-full md:w-auto">
                  <div className="flex-1 bg-slate-50/50 p-3 rounded-xl border border-slate-100/50">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Role Offered</div>
                    <div className="text-[13px] font-bold text-slate-700 truncate">{c.role || "N/A"}</div>
                  </div>

                  <div className="flex-1 bg-slate-50/50 p-3 rounded-xl border border-slate-100/50">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Recruiter</div>
                    <div className="text-[13px] font-bold text-slate-700 truncate">{c.recruiter || "N/A"}</div>
                  </div>

                  <div className="flex-1 bg-slate-50/50 p-3 rounded-xl border border-slate-100/50">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Last Updated</div>
                    <div className="text-[13px] font-bold text-slate-700 truncate">{formatDate(c.updatedAt)}</div>
                  </div>

                  {c.stageReason && (
                    <div className="col-span-2 md:flex-[1.5] bg-amber-50/30 p-3 rounded-xl border border-amber-100/50">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-amber-500 mb-1">Notes / Reason</div>
                      <div className="text-[13px] font-bold text-amber-900 truncate" title={c.stageReason}>
                        {c.stageReason}
                      </div>
                    </div>
                  )}
                </div>

                <div className="hidden md:flex items-center justify-end shrink-0 pl-4">
                  <Link
                    to={`/candidates/${c.id}`}
                    className="flex items-center justify-center h-12 w-12 rounded-2xl bg-slate-50 border border-slate-200 text-slate-400 hover:text-white hover:border-slate-900 hover:bg-slate-900 transition-all shadow-sm opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </Link>
                </div>
              </div>
            </Card>
            </motion.div>
          ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
