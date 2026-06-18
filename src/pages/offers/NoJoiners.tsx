import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useAts } from "@/services/ats-store";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, ChevronRight, AlertTriangle, Users } from "lucide-react";
import { cn } from "@/lib/utils";

export default function NoJoiners() {
  const { candidates } = useAts();
  const [search, setSearch] = useState("");

  const filteredCandidates = useMemo(() => {
    return candidates.filter((c) => {
      const matchStage = c.stage === "No Show";
      const matchSearch =
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.email.toLowerCase().includes(search.toLowerCase()) ||
        c.role.toLowerCase().includes(search.toLowerCase());
      return matchStage && matchSearch;
    });
  }, [candidates, search]);

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
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-gradient-to-br from-amber-100 to-rose-50 rounded-full blur-3xl opacity-50 pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl shadow-sm border bg-amber-50 border-amber-100 text-amber-600">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                No-Joiners
              </h1>
              <p className="text-slate-500 text-[13px] sm:text-[14px] font-medium mt-1.5 max-w-lg leading-relaxed">
                Track candidates who accepted the offer but did not join.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Tabs */}
      <div className="flex flex-col md:flex-row items-center gap-4 bg-white p-2 rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)] border border-slate-100">
        <div className="flex items-center gap-2 px-4 py-2 font-bold text-amber-700 bg-amber-50 rounded-xl">
          <Users className="h-5 w-5" />
          Total No-Joiners: {filteredCandidates.length}
        </div>
        <div className="flex-1" />
        {/* Search Bar */}
        <div className="relative w-full md:w-[320px] shrink-0 p-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search candidates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-11 w-full bg-slate-50 text-[13px] font-medium rounded-xl border-transparent focus-visible:bg-white focus-visible:ring-1 focus-visible:ring-slate-300 transition-all placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Data List */}
      {filteredCandidates.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-20 text-center bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)] rounded-3xl border border-slate-100">
          <div className="h-24 w-24 rounded-3xl flex items-center justify-center mb-6 shadow-sm border text-amber-600 bg-amber-50 border-amber-100">
            <AlertTriangle className="h-10 w-10 opacity-75" />
          </div>
          <h3 className="text-xl font-black text-slate-900 mb-2">No Candidates Found</h3>
          <p className="text-[14px] text-slate-500 max-w-sm font-medium">
            No candidates matching your criteria.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredCandidates.map((c) => (
            <Card
              key={c.id}
              className="group relative overflow-hidden p-0 border-slate-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)] hover:shadow-lg hover:border-slate-200 transition-all duration-300 rounded-3xl bg-white"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-amber-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              <div className="flex flex-col md:flex-row items-start md:items-center p-6 gap-6 relative z-10">
                <div className="flex items-center justify-between w-full md:w-auto md:min-w-[280px] lg:min-w-[320px]">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-[16px] font-black uppercase shadow-sm border text-amber-600 bg-amber-50 border-amber-100">
                      {c.name?.charAt(0) || "?"}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-[16px] text-slate-900 truncate mb-1 group-hover:text-amber-600 transition-colors">
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
                    className="flex items-center justify-center h-12 w-12 rounded-2xl bg-slate-50 border border-slate-200 text-slate-400 hover:text-white hover:border-amber-600 hover:bg-amber-600 transition-all shadow-sm opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0"
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
