import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, FileWarning } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { API_BASE_URL } from "@/config/api";

export default function DuplicateCheck() {
  const [data, setData] = useState<{ exact: any[]; possible: any[] } | null>(null);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Duplicate Check</h1>
        <p className="text-slate-500 text-[13px] font-medium mt-1">
          Review candidates with identical contact details or similar names.
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-[200px] w-full rounded-2xl" />
          <Skeleton className="h-[200px] w-full rounded-2xl" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Exact Duplicates */}
          <Card className="p-0 overflow-hidden bg-white border border-red-200 shadow-sm rounded-2xl">
            <div className="bg-red-50/50 p-4 border-b border-red-100 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <h2 className="text-[13px] font-bold text-red-900">Exact Duplicates (Same Email or Phone)</h2>
              <Badge variant="secondary" className="ml-2 bg-red-100 text-red-700 hover:bg-red-100 border-transparent text-[10px]">
                {data?.exact?.length || 0} Found
              </Badge>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[12px]">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold">
                  <tr>
                    <th className="py-3 px-4">Name</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Phone</th>
                    <th className="py-3 px-4">Current Stage</th>
                    <th className="py-3 px-4 text-right">Last Updated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-slate-700 font-medium">
                  {data?.exact?.map((c, i) => (
                    <tr key={i} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-bold text-slate-900">{c.name}</td>
                      <td className="py-3 px-4">{c.email}</td>
                      <td className="py-3 px-4">{c.phone || "-"}</td>
                      <td className="py-3 px-4">
                        <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-200 border-transparent font-bold text-[10px]">
                          {c.stage || "New Applicant"}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right text-slate-500">{formatDate(c.updatedAt)}</td>
                    </tr>
                  ))}
                  {(!data?.exact || data.exact.length === 0) && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400 font-medium">
                        No exact duplicates found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Possible Duplicates */}
          <Card className="p-0 overflow-hidden bg-white border border-amber-200 shadow-sm rounded-2xl">
            <div className="bg-amber-50/50 p-4 border-b border-amber-100 flex items-center gap-2">
              <FileWarning className="h-4 w-4 text-amber-600" />
              <h2 className="text-[13px] font-bold text-amber-900">Possible Duplicates (Same Name)</h2>
              <Badge variant="secondary" className="ml-2 bg-amber-100 text-amber-700 hover:bg-amber-100 border-transparent text-[10px]">
                {data?.possible?.length || 0} Found
              </Badge>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[12px]">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold">
                  <tr>
                    <th className="py-3 px-4">Name</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Phone</th>
                    <th className="py-3 px-4">Current Stage</th>
                    <th className="py-3 px-4 text-right">Last Updated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-slate-700 font-medium">
                  {data?.possible?.map((c, i) => (
                    <tr key={i} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-bold text-slate-900">{c.name}</td>
                      <td className="py-3 px-4">{c.email}</td>
                      <td className="py-3 px-4">{c.phone || "-"}</td>
                      <td className="py-3 px-4">
                        <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-200 border-transparent font-bold text-[10px]">
                          {c.stage || "New Applicant"}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right text-slate-500">{formatDate(c.updatedAt)}</td>
                    </tr>
                  ))}
                  {(!data?.possible || data.possible.length === 0) && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400 font-medium">
                        No possible duplicates found.
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
