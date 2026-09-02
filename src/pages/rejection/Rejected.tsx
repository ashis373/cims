import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { XOctagon, Calendar, ChevronRight, Briefcase, Search, MoreVertical, ChevronLeft, ChevronDown, FileText } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { API_BASE_URL } from "@/config/api";
import { toast } from "sonner";
import { getAuthHeaders } from "@/services/candidate-api";

export default function Rejected() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [reasonFilter, setReasonFilter] = useState("All");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch(`${API_BASE_URL}/rejections/rejected.php`, {
      credentials: 'include',
      headers: getAuthHeaders(false)
    })
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok && json.message) {
          toast.error(json.message);
        } else {
          setData(json.rejected || []);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch rejections:", err);
        setLoading(false);
      });
  }, []);

  const uniqueReasons = useMemo(() => {
    const reasons = new Set<string>();
    data.forEach((item) => {
      if (item.reason) reasons.add(item.reason);
    });
    return Array.from(reasons);
  }, [data]);

  const filteredList = useMemo(() => {
    return data.filter((item) => {
      const matchReason = reasonFilter === "All" || item.reason === reasonFilter;
      const matchSearch = 
        item.name?.toLowerCase().includes(search.toLowerCase()) || 
        item.email?.toLowerCase().includes(search.toLowerCase()) || 
        item.position?.toLowerCase().includes(search.toLowerCase());
      return matchReason && matchSearch;
    });
  }, [data, reasonFilter, search]);

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
            <XOctagon className="h-8 w-8 text-rose-300" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white mb-1.5">
              Rejected Candidates
            </h1>
            <p className="text-indigo-200/90 text-[15px] max-w-xl font-medium">
              Review candidates who were previously rejected during the recruitment pipeline.
            </p>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-[24px] shadow-[0_2px_20px_rgba(0,0,0,0.03)] border border-slate-100 p-2 sm:p-4">
        
        {/* Top Controls Row */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 border-b border-slate-100/80 mb-2">
          
          {/* Reason Filter */}
          <div className="w-full md:w-[280px]">
            <Select value={reasonFilter} onValueChange={setReasonFilter}>
              <SelectTrigger className="h-[42px] w-full bg-slate-50 border-transparent shadow-sm rounded-xl text-[14px] font-semibold text-slate-700 pl-4 pr-4 transition-all hover:bg-slate-100 focus:ring-1 focus:ring-indigo-500 overflow-hidden">
                <span className="truncate pr-2">
                  <SelectValue placeholder="All Reasons" />
                </span>
              </SelectTrigger>
              <SelectContent className="rounded-xl border-slate-200 shadow-lg bg-white">
                <SelectItem value="All" className="text-[13px] font-medium cursor-pointer rounded-lg hover:bg-slate-50 focus:bg-slate-50">
                  All Reasons
                </SelectItem>
                {uniqueReasons.map((r) => (
                  <SelectItem key={r} value={r} className="text-[13px] font-medium cursor-pointer rounded-lg hover:bg-slate-50 focus:bg-slate-50">
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-[320px] shrink-0">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by name, email, or role..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-[42px] w-full bg-white text-[14px] font-medium rounded-full border-slate-200 hover:border-slate-300 focus-visible:ring-1 focus-visible:ring-indigo-500 transition-all placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Table Header */}
        <div className="hidden lg:grid grid-cols-[2.5fr_1.5fr_1.5fr_2fr] gap-4 px-6 py-4">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Candidate</div>
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Position</div>
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Recorded On</div>
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Reason</div>
        </div>

        {/* Table List */}
        <div className="flex flex-col gap-3 px-2 pb-4">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-[16px] border border-slate-100 bg-slate-50/50">
                  <Skeleton className="h-12 w-12 rounded-xl" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <XOctagon className="h-12 w-12 mb-4 text-slate-300" />
              <h3 className="text-lg font-bold text-slate-800 mb-1">No Candidates Found</h3>
              <p className="text-[14px] text-slate-500">There are no candidates matching your criteria.</p>
            </div>
          ) : (
            filteredList.map((c) => (
              <div 
                key={c.rejection_id} 
                className="group flex flex-col lg:grid lg:grid-cols-[2.5fr_1.5fr_1.5fr_2fr] gap-4 items-start lg:items-center p-4 bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all rounded-[16px]"
              >
                {/* Candidate */}
                <div className="flex items-center gap-4 w-full">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600 text-[16px] font-bold">
                    {c.name?.charAt(0) || "?"}
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-[15px] text-slate-900 truncate group-hover:text-rose-600 transition-colors">{c.name}</div>
                    <div className="text-[13px] text-slate-500 truncate">{c.email}</div>
                  </div>
                </div>

                {/* Position */}
                <div className="flex items-center gap-2.5 w-full">
                  <div className="lg:hidden text-[11px] font-bold text-slate-400 uppercase w-24">Position:</div>
                  <div className="flex items-center gap-2 text-[14px] font-bold text-slate-700">
                    <Briefcase className="h-4 w-4 text-slate-400" />
                    <span className="truncate">{c.position || "N/A"}</span>
                  </div>
                </div>

                {/* Recorded On */}
                <div className="flex items-center gap-2.5 w-full">
                  <div className="lg:hidden text-[11px] font-bold text-slate-400 uppercase w-24">Recorded:</div>
                  <div className="flex items-center gap-2 text-[13px] font-medium text-slate-500">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    {formatDate(c.recordedAt)}
                  </div>
                </div>

                {/* Reason */}
                <div className="flex items-center gap-2.5 w-full">
                  <div className="lg:hidden text-[11px] font-bold text-slate-400 uppercase w-24">Reason:</div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[13px] font-bold bg-rose-50 text-rose-700 border border-rose-100">
                    <FileText className="h-3.5 w-3.5" />
                    <span className="truncate max-w-[200px]" title={c.reason}>{c.reason || "Unspecified"}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-slate-100">
          <div className="text-[13px] font-medium text-slate-500">
            Showing {filteredList.length > 0 ? 1 : 0} to {filteredList.length} of {filteredList.length} results
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
