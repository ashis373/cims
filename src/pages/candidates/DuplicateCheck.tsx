import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  AlertCircle, FileWarning, User, Mail, Phone, Calendar, 
  ArrowRight, ShieldAlert, CheckCircle2, Search, Trash2, Merge 
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { API_BASE_URL } from "@/config/api";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default function DuplicateCheck() {
  const [data, setData] = useState<{ exact: any[]; possible: any[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetch(`${API_BASE_URL}/duplicates.php`)
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch duplicates:", err);
        setLoading(false);
      });
  }, []);

  const formatDate = (d: string) => {
    if (!d) return "-";
    return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  };

  const exactFiltered = data?.exact?.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.email?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const possibleFiltered = data?.possible?.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.email?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="flex flex-col gap-6 w-full pb-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100">
        <div className="flex items-center gap-4">
          <div className="bg-red-50 p-3 rounded-2xl">
            <ShieldAlert className="h-6 w-6 text-red-500" />
          </div>
          <div>
            <h1 className="text-[22px] font-bold tracking-tight text-slate-900">Duplicate Check</h1>
            <p className="text-slate-500 text-[13px] font-medium mt-1">
              Review and merge candidates with identical or highly similar details.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Search duplicates..." 
              className="pl-9 h-10 w-[260px] bg-slate-50 text-[13px] rounded-xl border-transparent focus-visible:bg-white focus-visible:ring-1 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button className="h-10 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[13px] font-bold shadow-sm">
            Run Scan Now
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-6">
          <Skeleton className="h-[300px] w-full rounded-3xl" />
          <Skeleton className="h-[300px] w-full rounded-3xl" />
        </div>
      ) : (
        <div className="space-y-8">
          {/* Exact Duplicates */}
          <Card className="p-0 overflow-hidden bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] rounded-3xl border-0 border-t-[3px] border-t-red-500 relative group">
            <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-gradient-to-br from-red-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
            
            <div className="p-6 border-b border-slate-100 flex items-center justify-between relative z-10 bg-gradient-to-b from-red-50/30 to-transparent">
              <div className="flex items-center gap-3">
                <div className="bg-red-100 p-2 rounded-xl text-red-600">
                  <AlertCircle className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-[15px] font-bold text-slate-900 flex items-center gap-2">
                    Exact Duplicates
                    <Badge variant="secondary" className="bg-red-100 text-red-700 hover:bg-red-100 border-transparent text-[11px] font-bold px-2 py-0.5 rounded-md">
                      {exactFiltered.length} Found
                    </Badge>
                  </h2>
                  <p className="text-[12px] font-medium text-slate-500 mt-0.5">Profiles sharing the exact same Email Address or Phone Number.</p>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto relative z-10">
              <table className="w-full text-left text-[13px]">
                <thead className="bg-slate-50/50 text-slate-500 font-bold border-b border-slate-100">
                  <tr>
                    <th className="py-4 px-6">Candidate Details</th>
                    <th className="py-4 px-6">Contact Info</th>
                    <th className="py-4 px-6">Current Stage</th>
                    <th className="py-4 px-6">Last Updated</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-medium bg-white">
                  {exactFiltered.map((c, i) => (
                    <tr key={i} className="hover:bg-slate-50/80 transition-colors group/row">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-[12px] text-slate-600 shrink-0 border border-slate-200">
                            {c.name?.charAt(0) || 'U'}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-900">{c.name}</span>
                            <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5"><User className="h-3 w-3" /> ID: #{c.id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex flex-col gap-1 text-[12px]">
                          <span className="flex items-center gap-1.5 text-slate-600"><Mail className="h-3.5 w-3.5 text-slate-400" /> {c.email}</span>
                          <span className="flex items-center gap-1.5 text-slate-600"><Phone className="h-3.5 w-3.5 text-slate-400" /> {c.phone || "-"}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-200 border-transparent font-bold text-[11px] px-2.5 py-1">
                          {c.stage || "New Applicant"}
                        </Badge>
                      </td>
                      <td className="py-4 px-6 text-slate-500">
                        <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> {formatDate(c.updatedAt)}</span>
                      </td>
                      <td className="py-4 px-6 text-right">
                         <div className="flex items-center justify-end gap-2 opacity-0 group-hover/row:opacity-100 transition-opacity">
                           <Button variant="outline" size="sm" className="h-8 text-[11px] font-bold rounded-lg border-slate-200 text-slate-600 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200">
                             <Merge className="h-3.5 w-3.5 mr-1" /> Merge
                           </Button>
                           <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600">
                             <Trash2 className="h-4 w-4" />
                           </Button>
                         </div>
                      </td>
                    </tr>
                  ))}
                  {exactFiltered.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400">
                        <div className="flex flex-col items-center gap-2">
                          <CheckCircle2 className="h-8 w-8 text-emerald-400" />
                          <p className="font-bold text-slate-600 text-[14px]">Clean Data!</p>
                          <p className="text-[12px]">No exact duplicates found based on your filters.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Possible Duplicates */}
          <Card className="p-0 overflow-hidden bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] rounded-3xl border-0 border-t-[3px] border-t-amber-500 relative group">
            <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-gradient-to-br from-amber-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
            
            <div className="p-6 border-b border-slate-100 flex items-center justify-between relative z-10 bg-gradient-to-b from-amber-50/30 to-transparent">
              <div className="flex items-center gap-3">
                <div className="bg-amber-100 p-2 rounded-xl text-amber-600">
                  <FileWarning className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-[15px] font-bold text-slate-900 flex items-center gap-2">
                    Possible Duplicates
                    <Badge variant="secondary" className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-transparent text-[11px] font-bold px-2 py-0.5 rounded-md">
                      {possibleFiltered.length} Found
                    </Badge>
                  </h2>
                  <p className="text-[12px] font-medium text-slate-500 mt-0.5">Profiles sharing the exact same Name, but different contact details.</p>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto relative z-10">
              <table className="w-full text-left text-[13px]">
                <thead className="bg-slate-50/50 text-slate-500 font-bold border-b border-slate-100">
                  <tr>
                    <th className="py-4 px-6">Candidate Details</th>
                    <th className="py-4 px-6">Contact Info</th>
                    <th className="py-4 px-6">Current Stage</th>
                    <th className="py-4 px-6">Last Updated</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-medium bg-white">
                  {possibleFiltered.map((c, i) => (
                    <tr key={i} className="hover:bg-slate-50/80 transition-colors group/row">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-[12px] text-slate-600 shrink-0 border border-slate-200">
                            {c.name?.charAt(0) || 'U'}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-900">{c.name}</span>
                            <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5"><User className="h-3 w-3" /> ID: #{c.id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex flex-col gap-1 text-[12px]">
                          <span className="flex items-center gap-1.5 text-slate-600"><Mail className="h-3.5 w-3.5 text-slate-400" /> {c.email}</span>
                          <span className="flex items-center gap-1.5 text-slate-600"><Phone className="h-3.5 w-3.5 text-slate-400" /> {c.phone || "-"}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-200 border-transparent font-bold text-[11px] px-2.5 py-1">
                          {c.stage || "New Applicant"}
                        </Badge>
                      </td>
                      <td className="py-4 px-6 text-slate-500">
                        <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> {formatDate(c.updatedAt)}</span>
                      </td>
                      <td className="py-4 px-6 text-right">
                         <div className="flex items-center justify-end gap-2 opacity-0 group-hover/row:opacity-100 transition-opacity">
                           <Button variant="outline" size="sm" className="h-8 text-[11px] font-bold rounded-lg border-slate-200 text-slate-600 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200">
                             Compare
                           </Button>
                           <Button variant="ghost" size="sm" className="h-8 text-[11px] font-bold rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100">
                             Dismiss
                           </Button>
                         </div>
                      </td>
                    </tr>
                  ))}
                  {possibleFiltered.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400">
                        <div className="flex flex-col items-center gap-2">
                          <CheckCircle2 className="h-8 w-8 text-emerald-400" />
                          <p className="font-bold text-slate-600 text-[14px]">Looking Good!</p>
                          <p className="text-[12px]">No possible name duplicates found.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
