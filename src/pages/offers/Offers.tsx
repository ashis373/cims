import { useState, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAts } from "@/services/ats-store";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, ChevronRight, Briefcase, FileText, CheckCircle2, XCircle, AlertTriangle, UserCheck } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "released", label: "Released", icon: FileText, stage: "Offer Released", color: "text-blue-600 bg-blue-50 border-blue-100" },
  { id: "accepted", label: "Accepted", icon: CheckCircle2, stage: "Offer Accepted", color: "text-emerald-600 bg-emerald-50 border-emerald-100" },
  { id: "declined", label: "Declined", icon: XCircle, stage: "Offer Declined", color: "text-rose-600 bg-rose-50 border-rose-100" },
  { id: "no-join", label: "No-Show", icon: AlertTriangle, stage: "No Show", color: "text-amber-600 bg-amber-50 border-amber-100" },
  { id: "joined", label: "Joined", icon: UserCheck, stage: "Joined", color: "text-teal-600 bg-teal-50 border-teal-100" },
];

export default function Offers() {
  const { tab } = useParams();
  const navigate = useNavigate();
  const { candidates } = useAts();

  const activeTabId = tab || "released";
  const activeTabDef = TABS.find((t) => t.id === activeTabId) || TABS[0];

  const [search, setSearch] = useState("");

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
    <div className="flex flex-col gap-8 max-w-6xl mx-auto w-full pb-10">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl bg-white border border-slate-200/60 shadow-sm p-8 sm:p-10">
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-gradient-to-br from-blue-100 to-indigo-50 rounded-full blur-3xl opacity-50 pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl shadow-sm border bg-indigo-50 border-indigo-100 text-indigo-600">
              <Briefcase className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                Offer Management
              </h1>
              <p className="text-slate-500 text-[13px] sm:text-[14px] font-medium mt-1.5 max-w-lg leading-relaxed">
                Track candidate offers, acceptances, and identify potential no-shows in real-time.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Tabs */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex flex-wrap gap-2 flex-1">
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
                  "flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-bold transition-all duration-200 border",
                  isActive
                    ? "bg-slate-900 text-white border-slate-800 shadow-md"
                    : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                )}
              >
                <Icon className={cn("h-4 w-4", isActive ? "text-slate-300" : "text-slate-400")} />
                {t.label}
                <span
                  className={cn(
                    "ml-1.5 px-2 py-0.5 rounded-md text-[11px]",
                    isActive ? "bg-slate-800 text-slate-200" : "bg-slate-100 text-slate-500"
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-[300px] shrink-0">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search offers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-11 w-full bg-white text-[13px] font-medium rounded-xl border-slate-200 shadow-sm focus-visible:ring-1 focus-visible:ring-blue-500 transition-all placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Data List */}
      {filteredCandidates.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-16 text-center bg-white border border-slate-200/60 border-dashed rounded-3xl">
          <div className={cn("h-20 w-20 rounded-3xl flex items-center justify-center mb-6 shadow-sm border", activeTabDef.color)}>
            <activeTabDef.icon className="h-8 w-8 opacity-75" />
          </div>
          <h3 className="text-lg font-black text-slate-900 mb-2">No Candidates Found</h3>
          <p className="text-[14px] text-slate-500 max-w-sm">
            There are currently no candidates in the "{activeTabDef.label}" stage matching your criteria.
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {filteredCandidates.map((c) => (
            <Card
              key={c.id}
              className="group relative overflow-hidden p-0 border-slate-200/60 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)] hover:shadow-md hover:border-slate-300 transition-all duration-300 rounded-2xl bg-white"
            >
              <div className="flex flex-col md:flex-row items-start md:items-center p-5 gap-5">
                <div className="flex items-center justify-between w-full md:w-auto md:min-w-[260px] lg:min-w-[300px]">
                  <div className="flex items-center gap-4">
                    <div
                      className={cn(
                        "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-[14px] font-black uppercase shadow-sm border",
                        activeTabDef.color
                      )}
                    >
                      {c.name?.charAt(0) || "?"}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-[15px] text-slate-900 truncate mb-1 group-hover:text-blue-600 transition-colors">
                        {c.name}
                      </div>
                      <div className="text-[12px] font-medium text-slate-500 truncate">{c.email}</div>
                    </div>
                  </div>
                  <Link
                    to={`/candidates/${c.id}`}
                    className="md:hidden flex shrink-0 items-center justify-center h-10 w-10 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 active:bg-slate-100 transition-all shadow-sm"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Link>
                </div>

                <div className="grid grid-cols-2 md:flex flex-1 gap-4 w-full md:w-auto">
                  <div className="flex-1">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Role Offered</div>
                    <div className="text-[12px] font-semibold text-slate-700 truncate">{c.role || "N/A"}</div>
                  </div>

                  <div className="flex-1">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Recruiter</div>
                    <div className="text-[12px] font-semibold text-slate-700 truncate">{c.recruiter || "N/A"}</div>
                  </div>

                  <div className="flex-1">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Last Updated</div>
                    <div className="text-[12px] font-semibold text-slate-700 truncate">{formatDate(c.updatedAt)}</div>
                  </div>

                  {c.stageReason && (
                    <div className="col-span-2 md:flex-[1.5]">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Notes</div>
                      <div className="text-[11px] md:text-[12px] font-bold truncate px-2 py-1 rounded-lg border bg-slate-50 text-slate-700 border-slate-200" title={c.stageReason}>
                        {c.stageReason}
                      </div>
                    </div>
                  )}
                </div>

                <div className="hidden md:flex items-center justify-end shrink-0 pl-2">
                  <Link
                    to={`/candidates/${c.id}`}
                    className="flex items-center justify-center h-10 w-10 rounded-xl bg-slate-50 border border-slate-200 text-slate-400 hover:text-white hover:border-blue-600 hover:bg-blue-600 transition-all shadow-sm opacity-0 group-hover:opacity-100"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
