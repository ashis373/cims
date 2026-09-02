import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAts } from "@/services/ats-store";
import { Input } from "@/components/ui/input";
import { Search, MoreVertical, FileText, CheckCircle2, XCircle, AlertTriangle, UserCheck, User, Calendar, Briefcase, FileCheck, Gift, ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "released", label: "Released", icon: FileText, stage: "Offer Released", color: "text-indigo-600", activeBg: "bg-indigo-50", badgeBg: "bg-slate-100 text-slate-700", dot: "bg-indigo-500", pillBg: "bg-indigo-50 text-indigo-700" },
  { id: "accepted", label: "Accepted", icon: CheckCircle2, stage: "Offer Accepted", color: "text-emerald-600", activeBg: "bg-emerald-50", badgeBg: "bg-slate-100 text-slate-700", dot: "bg-emerald-500", pillBg: "bg-emerald-50 text-emerald-700" },
  { id: "declined", label: "Declined", icon: XCircle, stage: "Offer Declined", color: "text-rose-600", activeBg: "bg-rose-50", badgeBg: "bg-slate-100 text-slate-700", dot: "bg-rose-500", pillBg: "bg-rose-50 text-rose-700" },
  { id: "no-join", label: "No-Show", icon: AlertTriangle, stage: "No Show", color: "text-amber-600", activeBg: "bg-amber-50", badgeBg: "bg-slate-100 text-slate-700", dot: "bg-amber-500", pillBg: "bg-amber-50 text-amber-700" },
  { id: "joined", label: "Joined", icon: UserCheck, stage: "Joined", color: "text-blue-600", activeBg: "bg-blue-50", badgeBg: "bg-slate-100 text-slate-700", dot: "bg-blue-500", pillBg: "bg-blue-50 text-blue-700" },
];

export default function Offers() {
  const { tab } = useParams();
  const navigate = useNavigate();
  const { candidates } = useAts();

  const activeTabId = tab && tab !== 'management' ? tab : "released";
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
    <div className="flex flex-col gap-6 w-full pb-10 mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Top Banner (Deep Purple) */}
      <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-r from-[#110B3A] via-[#21115A] to-[#45148C] shadow-lg border border-indigo-900/50 p-8 sm:p-10 text-white flex items-center justify-between">

        
        <div className="relative z-10 flex items-center gap-6">
          <div className="flex h-[72px] w-[72px] items-center justify-center rounded-[20px] bg-[#6136D7]/20 border border-[#6136D7]/50 shadow-[0_0_20px_rgba(97,54,215,0.4)] backdrop-blur-md">
            <Gift className="h-8 w-8 text-indigo-100" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white mb-1.5">
              Offer Management
            </h1>
            <p className="text-indigo-200/90 text-[15px] max-w-xl font-medium">
              Track candidate offers, monitor acceptance rates, and identify potential no-shows in real-time.
            </p>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-[24px] shadow-[0_2px_20px_rgba(0,0,0,0.03)] border border-slate-100 p-2 sm:p-4">
        
        {/* Top Controls Row */}
        <div className="flex flex-col xl:flex-row items-center justify-between gap-4 p-4 border-b border-slate-100/80 mb-2">
          
          <div className="flex overflow-x-auto hide-scrollbar gap-2 w-full xl:w-auto">
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
                    "flex items-center gap-2.5 px-4 py-2.5 rounded-[14px] text-[14px] font-bold transition-all duration-200 whitespace-nowrap",
                    isActive
                      ? cn("text-slate-900", t.activeBg)
                      : "text-slate-600 hover:bg-slate-50"
                  )}
                >
                  <Icon className={cn("h-4 w-4", t.color)} />
                  {t.label}
                  <span
                    className={cn(
                      "ml-1.5 px-2 py-0.5 rounded-md text-[12px] font-bold transition-colors",
                      isActive ? "bg-white text-slate-800 shadow-sm" : "bg-slate-100 text-slate-500"
                    )}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="relative w-full xl:w-[320px] shrink-0">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search candidates by name, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-[42px] w-full bg-white text-[14px] font-medium rounded-full border-slate-200 hover:border-slate-300 focus-visible:ring-1 focus-visible:ring-indigo-500 transition-all placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Table Header */}
        <div className="hidden lg:grid grid-cols-[2.5fr_1.5fr_1.5fr_1.5fr_1.5fr] gap-4 px-6 py-4">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Candidate</div>
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Role Offered</div>
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Recruiter</div>
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Offer Status</div>
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Last Updated</div>
        </div>

        {/* Table List */}
        <div className="flex flex-col gap-3 px-2 pb-4">
          {filteredCandidates.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <activeTabDef.icon className={cn("h-12 w-12 mb-4 opacity-50", activeTabDef.color)} />
              <h3 className="text-lg font-bold text-slate-800 mb-1">No Candidates Found</h3>
              <p className="text-[14px] text-slate-500">There are no candidates in this stage.</p>
            </div>
          ) : (
            filteredCandidates.map((c) => (
              <div 
                key={c.id} 
                className="group flex flex-col lg:grid lg:grid-cols-[2.5fr_1.5fr_1.5fr_1.5fr_1.5fr] gap-4 items-start lg:items-center p-4 bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all rounded-[16px]"
              >
                {/* Candidate */}
                <div className="flex items-center gap-4 w-full">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 text-[16px] font-bold">
                    {c.name?.charAt(0) || "?"}
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-[15px] text-slate-900 truncate">{c.name}</div>
                    <div className="text-[13px] text-slate-500 truncate">{c.email}</div>
                  </div>
                </div>

                {/* Role Offered */}
                <div className="flex items-center gap-2.5 w-full">
                  <div className="lg:hidden text-[11px] font-bold text-slate-400 uppercase w-24">Role:</div>
                  <div className="flex items-center gap-2 text-[14px] font-bold text-slate-700">
                    <Briefcase className="h-4 w-4 text-amber-600/70" />
                    <span className="truncate">{c.role || "N/A"}</span>
                  </div>
                </div>

                {/* Recruiter */}
                <div className="flex items-center gap-2.5 w-full">
                  <div className="lg:hidden text-[11px] font-bold text-slate-400 uppercase w-24">Recruiter:</div>
                  <div className="flex items-center gap-2 text-[14px] font-bold text-slate-700">
                    <User className="h-4 w-4 text-slate-400" />
                    <span className="truncate">{c.recruiter || "Unassigned"}</span>
                  </div>
                </div>

                {/* Offer Status */}
                <div className="flex items-center gap-2.5 w-full">
                  <div className="lg:hidden text-[11px] font-bold text-slate-400 uppercase w-24">Status:</div>
                  <div className={cn("inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[13px] font-bold border border-transparent", activeTabDef.pillBg)}>
                    <div className={cn("h-1.5 w-1.5 rounded-full", activeTabDef.dot)} />
                    {activeTabDef.label}
                  </div>
                </div>

                {/* Last Updated */}
                <div className="flex items-center gap-2.5 w-full">
                  <div className="lg:hidden text-[11px] font-bold text-slate-400 uppercase w-24">Updated:</div>
                  <div className="flex items-center gap-2 text-[13px] font-medium text-slate-500">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    {formatDate(c.updatedAt)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-slate-100">
          <div className="text-[13px] font-medium text-slate-500">
            Showing 1 to {filteredCandidates.length} of {filteredCandidates.length} results
          </div>
          <div className="flex items-center gap-2">
            <button className="h-8 w-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-50">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button className="h-8 w-8 rounded-lg bg-indigo-600 text-white font-medium text-sm flex items-center justify-center shadow-sm">
              1
            </button>
            <button className="h-8 w-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-50">
              <ChevronRight className="h-4 w-4" />
            </button>
            <button className="h-8 px-3 ml-2 rounded-lg border border-slate-200 flex items-center gap-2 text-slate-600 text-[13px] font-medium hover:bg-slate-50">
              10 / page <ChevronDown className="h-3 w-3" />
            </button>
          </div>
        </div>
        
      </div>
    </div>
  );
}
