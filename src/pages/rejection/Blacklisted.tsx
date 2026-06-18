import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Ban, Calendar, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { API_BASE_URL } from "@/config/api";

export default function Blacklisted() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [reasonFilter, setReasonFilter] = useState("All");

  useEffect(() => {
    fetch(`${API_BASE_URL}/blacklisted.php`)
      .then((res) => res.json())
      .then((json) => {
        setData(json.blacklisted || []);
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
      return reasonFilter === "All" || item.reason === reasonFilter;
    });
  }, [data, reasonFilter]);

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
      {/* Header Section */}
      <div className="relative overflow-hidden rounded-3xl bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100 p-8 sm:p-10">
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-gradient-to-br from-slate-100 to-slate-50 rounded-full blur-3xl opacity-50 pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl shadow-sm border bg-slate-900 border-slate-800 text-white">
              <Ban className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                Blacklisted Candidates
              </h1>
              <p className="text-slate-500 text-[13px] sm:text-[14px] font-medium mt-1.5 max-w-lg leading-relaxed">
                Manage and review candidates who have been permanently blacklisted from future opportunities.
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Total Records</div>
            <div className="text-3xl font-black text-slate-900">{data.length}</div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="flex flex-col sm:flex-row items-center justify-end gap-3 w-full">
        <div className="relative w-full sm:w-[220px] shrink-0">
          <Select value={reasonFilter} onValueChange={setReasonFilter}>
            <SelectTrigger className="h-11 w-full bg-white border border-slate-200 shadow-sm rounded-xl text-[13px] font-semibold text-slate-700 pl-4 pr-4 transition-all hover:bg-slate-50 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 overflow-hidden">
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
      </div>

      {/* Data Table */}
      <BlacklistTable
        list={filteredList}
        loading={loading}
        formatDate={formatDate}
      />
    </div>
  );
}

function BlacklistTable({
  list,
  loading,
  formatDate,
}: {
  list: any[];
  loading: boolean;
  formatDate: (d: string) => string;
}) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-6 border-slate-100 shadow-sm rounded-2xl flex items-center gap-6">
            <Skeleton className="h-12 w-12 rounded-full shrink-0" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-[200px]" />
              <Skeleton className="h-3 w-[150px]" />
            </div>
            <Skeleton className="h-8 w-[100px] rounded-lg shrink-0" />
            <Skeleton className="h-8 w-8 rounded-full shrink-0" />
          </Card>
        ))}
      </div>
    );
  }

  if (list.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-16 text-center bg-white border border-slate-200/60 border-dashed rounded-3xl">
        <div className="h-20 w-20 rounded-3xl flex items-center justify-center mb-6 shadow-sm border bg-slate-50 border-slate-200">
          <Ban className="h-8 w-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-black text-slate-900 mb-2">No Candidates Found</h3>
        <p className="text-[14px] text-slate-500 max-w-sm">
          There are currently no candidates matching your filters in this section.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {list.map((c) => (
        <Card 
          key={c.rejection_id} 
          className="group relative overflow-hidden p-0 border-slate-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)] hover:shadow-lg hover:border-slate-200 transition-all duration-300 rounded-3xl bg-white"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-slate-100 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          <div className="flex flex-col md:flex-row items-start md:items-center p-6 gap-6 relative z-10">
            {/* Avatar & Info */}
            <div className="flex items-center justify-between w-full md:w-auto md:min-w-[280px] lg:min-w-[320px]">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-[16px] font-black uppercase shadow-sm border bg-slate-900 text-white border-slate-800">
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

            {/* Data Grid for Mobile / Flex for Desktop */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:flex flex-1 gap-6 w-full md:w-auto">
              {/* Position */}
              <div className="flex-1 bg-slate-50/50 p-3 rounded-xl border border-slate-100/50">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Position</div>
                <div className="text-[13px] font-bold text-slate-700 truncate">{c.position || "N/A"}</div>
              </div>

              {/* Date */}
              <div className="flex-1 bg-slate-50/50 p-3 rounded-xl border border-slate-100/50">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Recorded On</div>
                <div className="text-[13px] font-bold text-slate-700 truncate">
                  {formatDate(c.recordedAt)}
                </div>
              </div>

              {/* Reason */}
              <div className="col-span-2 sm:col-span-1 md:flex-[1.5] bg-slate-100 p-3 rounded-xl border border-slate-200/50">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">Reason</div>
                <div className="text-[13px] font-bold text-slate-900 truncate" title={c.reason}>
                  {c.reason || "Unspecified"}
                </div>
              </div>
            </div>

            {/* Action Desktop */}
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
  );
}
