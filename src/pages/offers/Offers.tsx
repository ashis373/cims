import { useState, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAts } from "@/services/ats-store";
import { Input } from "@/components/ui/input";
import { Search, MoreVertical, FileText, CheckCircle2, XCircle, AlertTriangle, UserCheck, User, Calendar, Briefcase, FileCheck, Gift, ChevronLeft, ChevronRight, ChevronDown, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { API_BASE_URL } from "@/config/api";

const TABS = [
  { id: "released", label: "Released", icon: FileText, stage: "Offer Released", color: "text-amber-500", activeBg: "bg-amber-50 text-amber-900 border border-amber-200/60 shadow-sm", badgeBg: "bg-amber-100 text-amber-800", dot: "bg-amber-500", pillBg: "bg-amber-50 text-amber-700 border-amber-200" },
  { id: "accepted", label: "Accepted", icon: CheckCircle2, stage: "Offer Accepted", color: "text-emerald-600", activeBg: "bg-emerald-50 text-emerald-900 border border-emerald-200/60 shadow-sm", badgeBg: "bg-emerald-100 text-emerald-800", dot: "bg-emerald-500", pillBg: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { id: "declined", label: "Declined", icon: XCircle, stage: "Offer Declined", color: "text-rose-600", activeBg: "bg-rose-50 text-rose-900 border border-rose-200/60 shadow-sm", badgeBg: "bg-rose-100 text-rose-800", dot: "bg-rose-500", pillBg: "bg-rose-50 text-rose-700 border-rose-200" },
  { id: "no-join", label: "No-Show", icon: AlertTriangle, stage: "No Show", color: "text-purple-600", activeBg: "bg-purple-50 text-purple-900 border border-purple-200/60 shadow-sm", badgeBg: "bg-purple-100 text-purple-800", dot: "bg-purple-500", pillBg: "bg-purple-50 text-purple-700 border-purple-200" },
  { id: "joined", label: "Joined", icon: UserCheck, stage: "Joined", color: "text-blue-600", activeBg: "bg-blue-50 text-blue-900 border border-blue-200/60 shadow-sm", badgeBg: "bg-blue-100 text-blue-800", dot: "bg-blue-500", pillBg: "bg-blue-50 text-blue-700 border-blue-200" },
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

      {/* Top Banner (Dark Teal / Cyan Gradient) */}
      <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-r from-[#000C22] via-[#0B2524] to-[#0D2823] shadow-lg border border-teal-900/40 p-8 sm:p-10 text-white flex items-center justify-between">
        <div className="relative z-10 flex flex-col justify-center">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-2">
            Offer Management
          </h1>
          <p className="text-[#60C042] text-[14px] sm:text-[15px] font-medium max-w-xl leading-relaxed">
            Track candidate offers, monitor acceptance rates, and identify potential no-shows in real-time.
          </p>
        </div>
        <div className="relative z-10 shrink-0 group cursor-pointer">
          <span className="text-7xl drop-shadow-2xl inline-block origin-bottom hover:animate-bounce cursor-default select-none">
            🎁
          </span>
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
        <div className="hidden lg:grid grid-cols-[2.5fr_1.5fr_1.5fr_1.5fr_1.5fr_1fr] gap-4 px-6 py-4">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Candidate</div>
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Role Offered</div>
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Recruiter</div>
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Offer Status</div>
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Last Updated</div>
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Action</div>
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
                className="group flex flex-col lg:grid lg:grid-cols-[2.5fr_1.5fr_1.5fr_1.5fr_1.5fr_1fr] gap-4 items-start lg:items-center p-4 bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all rounded-[16px]"
              >
                {/* Candidate */}
                <div className="flex items-center gap-4 w-full">
                  {c.photo ? (
                    <img
                      src={`${API_BASE_URL}/../uploads/candidates/photos/${c.photo}`}
                      alt={c.name}
                      className="h-12 w-12 rounded-xl object-cover shrink-0 shadow-sm border border-slate-200"
                    />
                  ) : (
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 text-[16px] font-bold shadow-sm">
                      {c.name?.charAt(0) || "?"}
                    </div>
                  )}
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

                {/* Action */}
                <div className="flex items-center gap-2 w-full lg:justify-start">
                  <div className="lg:hidden text-[11px] font-bold text-slate-400 uppercase w-24">Action:</div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" className="h-8 text-[12px] px-3 font-semibold text-slate-600 hover:text-slate-900" asChild>
                      <Link to={`/candidates/${c.id}`}>
                        <Eye className="h-3.5 w-3.5 mr-1" /> View
                      </Link>
                    </Button>
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
          <div className="flex items-center gap-1.5">
            <button className="h-8.5 w-8.5 rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-50 transition-colors">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button className="h-8.5 w-8.5 rounded-xl bg-gradient-to-br from-[#42bc24] to-[#36961c] text-white font-black text-xs flex items-center justify-center shadow-md shadow-[#42bc24]/30">
              1
            </button>
            <button className="h-8.5 w-8.5 rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-50 transition-colors">
              <ChevronRight className="h-4 w-4" />
            </button>
            <button className="h-8.5 px-3 ml-2 rounded-xl border border-slate-200 flex items-center gap-2 text-slate-600 text-xs font-bold hover:bg-slate-50 transition-colors">
              10 / page <ChevronDown className="h-3 w-3" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
