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
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";

export default function Rejected() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
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

  const filteredList = useMemo(() => {
    return data.filter((item) => {
      const matchSearch = 
        !search ||
        (item.name || "").toLowerCase().includes(search.toLowerCase()) || 
        (item.email || "").toLowerCase().includes(search.toLowerCase()) || 
        (item.position || "").toLowerCase().includes(search.toLowerCase());
      return matchSearch;
    });
  }, [data, search]);

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
            Rejected Candidates
          </h1>
          <p className="text-[#60C042] text-[14px] sm:text-[15px] font-medium max-w-xl leading-relaxed">
            Review candidates who were previously rejected during the recruitment pipeline.
          </p>
        </div>
        <div className="relative z-10 shrink-0 group cursor-pointer">
          <span className="text-7xl drop-shadow-2xl inline-block origin-bottom hover:animate-bounce cursor-default select-none">
            🛑
          </span>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-[24px] shadow-[0_2px_20px_rgba(0,0,0,0.03)] border border-slate-100 p-2 sm:p-4">
        
        {/* Top Controls Row */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 border-b border-slate-100/80 mb-2">
          


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
        <div className="hidden lg:grid grid-cols-[3fr_2fr_2fr_1.5fr] gap-4 px-6 py-4">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Candidate</div>
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Recorded On</div>
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Reason</div>
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Action</div>
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
                className="group flex flex-col lg:grid lg:grid-cols-[3fr_2fr_2fr_1.5fr] gap-4 items-start lg:items-center p-4 bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all rounded-[16px]"
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
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600 text-[16px] font-bold shadow-sm">
                      {c.name?.charAt(0) || "?"}
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="font-bold text-[15px] text-slate-900 truncate group-hover:text-rose-600 transition-colors">{c.name}</div>
                    <div className="text-[13px] text-slate-500 truncate">{c.email}</div>
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
            Showing {filteredList.length > 0 ? 1 : 0} to {filteredList.length} of {filteredList.length} results
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
