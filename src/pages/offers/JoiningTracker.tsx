import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useAts } from "@/services/ats-store";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, ChevronRight, UserCheck, Clock, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "pending", label: "Pending Joining", icon: Clock, stage: "Offer Accepted", color: "text-blue-600 bg-blue-50 border-blue-100" },
  { id: "joined", label: "Joined", icon: UserCheck, stage: "Joined", color: "text-teal-600 bg-teal-50 border-teal-100" },
];

export default function JoiningTracker() {
  const { candidates } = useAts();
  const [activeTabId, setActiveTabId] = useState("pending");
  const [search, setSearch] = useState("");

  const activeTabDef = TABS.find((t) => t.id === activeTabId) || TABS[0];

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
    <div className="flex flex-col gap-8 w-full pb-10">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100 p-8 sm:p-10">
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-gradient-to-br from-teal-100 to-emerald-50 rounded-full blur-3xl opacity-50 pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl shadow-sm border bg-teal-50 border-teal-100 text-teal-600">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                Joining Tracker
              </h1>
              <p className="text-slate-500 text-[13px] sm:text-[14px] font-medium mt-1.5 max-w-lg leading-relaxed">
                Track candidates who are pending joining and those who have successfully joined.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Tabs */}
      <div className="flex flex-col md:flex-row items-center gap-4 bg-white p-2 rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)] border border-slate-100">
        <div className="flex overflow-x-auto hide-scrollbar gap-2 flex-1 w-full md:w-auto p-1">
          {TABS.map((t) => {
            const isActive = activeTabId === t.id;
            const count = candidates.filter((c) => c.stage === t.stage).length;
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => {
                  setSearch("");
                  setActiveTabId(t.id);
                }}
                className={cn(
                  "flex items-center gap-2 px-5 py-3 rounded-xl text-[13px] font-bold transition-all duration-300 whitespace-nowrap",
                  isActive
                    ? "bg-slate-900 text-white shadow-md transform scale-[1.02]"
                    : "bg-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                )}
              >
                <Icon className={cn("h-4 w-4", isActive ? "text-slate-300" : "text-slate-400")} />
                {t.label}
                <span
                  className={cn(
                    "ml-2 px-2 py-0.5 rounded-md text-[11px] font-black transition-colors",
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
        <div className="relative w-full md:w-[320px] shrink-0 p-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search candidates by name, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-11 w-full bg-slate-50 text-[13px] font-medium rounded-xl border-transparent focus-visible:bg-white focus-visible:ring-1 focus-visible:ring-slate-300 transition-all placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Data List */}
      {filteredCandidates.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-20 text-center bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)] rounded-3xl border border-slate-100">
          <div className={cn("h-24 w-24 rounded-3xl flex items-center justify-center mb-6 shadow-sm border", activeTabDef.color)}>
            <activeTabDef.icon className="h-10 w-10 opacity-75" />
          </div>
          <h3 className="text-xl font-black text-slate-900 mb-2">No Candidates Found</h3>
          <p className="text-[14px] text-slate-500 max-w-sm font-medium">
            There are currently no candidates in the "{activeTabDef.label}" stage matching your criteria.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredCandidates.map((c) => (
            <Card
              key={c.id}
              className="group relative overflow-hidden p-0 border-slate-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)] hover:shadow-lg hover:border-slate-200 transition-all duration-300 rounded-3xl bg-white"
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
          ))}
        </div>
      )}
    </div>
  );
}
