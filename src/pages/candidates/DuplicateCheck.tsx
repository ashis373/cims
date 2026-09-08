import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle, FileWarning, Mail, Phone,
  ArrowLeft, ArrowRight, ShieldAlert, CheckCircle2, Search, Trash2,
  CircleAlert, Eye, GitCompareArrows, MapPin, BriefcaseBusiness
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { API_BASE_URL } from "@/config/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { getAuthHeaders } from "@/services/candidate-api";
import { useAts } from "@/services/ats-store";
import { useNavigate } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type DuplicateCandidate = {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  location?: string | null;
  experience?: string | null;
  currentCompany?: string | null;
  currentDesignation?: string | null;
  department?: string | null;
  role?: string | null;
  recruiter?: string | null;
  source?: string | null;
  stage?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

type DuplicateData = { exact: DuplicateCandidate[]; possible: DuplicateCandidate[] };
type Comparison = { primary: DuplicateCandidate; matches: DuplicateCandidate[]; isExact: boolean };

const normalizeEmail = (value?: string | null) => value?.trim().toLowerCase() || "";
const normalizePhone = (value?: string | null) => value?.replace(/\D/g, "") || "";
const normalizeName = (value?: string | null) => value?.trim().replace(/\s+/g, " ").toLowerCase() || "";

const getMatchReasons = (first: DuplicateCandidate, second: DuplicateCandidate) => {
  const reasons: string[] = [];
  const firstEmail = normalizeEmail(first.email);
  const secondEmail = normalizeEmail(second.email);
  const firstPhone = normalizePhone(first.phone);
  const secondPhone = normalizePhone(second.phone);

  if (firstEmail && firstEmail === secondEmail) reasons.push("Same email");
  if (firstPhone && firstPhone === secondPhone) reasons.push("Same phone");
  if (normalizeName(first.name) && normalizeName(first.name) === normalizeName(second.name)) reasons.push("Same name");

  return reasons;
};

const comparisonFields = [
  ["name", "Full name"],
  ["email", "Email address"],
  ["phone", "Phone number"],
  ["role", "Position"],
  ["department", "Department"],
  ["currentCompany", "Current company"],
  ["currentDesignation", "Current designation"],
  ["experience", "Experience"],
  ["location", "Location"],
  ["recruiter", "Recruiter"],
  ["source", "Source"],
  ["stage", "Current stage"],
  ["createdAt", "Created on"],
  ["updatedAt", "Last updated"],
] as const;

export default function DuplicateCheck() {
  const [data, setData] = useState<DuplicateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [comparison, setComparison] = useState<Comparison | null>(null);
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<DuplicateCandidate | null>(null);

  const handleCompare = (c: DuplicateCandidate, isExact: boolean) => {
    const list = isExact ? data?.exact || [] : data?.possible || [];
    const matches = list.filter((x) => x.id !== c.id && getMatchReasons(c, x).length > 0);

    if (matches.length > 0) {
      setComparison({ primary: c, matches, isExact });
      setSelectedMatchId(matches[0].id);
    } else {
      toast.error("Could not find the matching duplicate in the list.");
    }
  };

  const executeDelete = async () => {
    if (!deleteCandidate) return;
    await remove([deleteCandidate.id]);
    toast.success("Candidate deleted");
    setData((prev) => prev ? {
      exact: prev.exact.filter((x) => x.id !== deleteCandidate.id),
      possible: prev.possible.filter((x) => x.id !== deleteCandidate.id)
    } : null);
    setComparison((prev) => {
      if (!prev) return null;
      const matches = prev.matches.filter((x) => x.id !== deleteCandidate.id);
      return matches.length ? { ...prev, matches } : null;
    });
    setDeleteCandidate(null);
  };

  const { remove } = useAts();
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API_BASE_URL}/candidates/duplicates.php`, {
      credentials: 'include',
      headers: getAuthHeaders(false)
    })
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok && json.message) {
          toast.error(json.message);
        } else {
          setData(json);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch duplicates:", err);
        setLoading(false);
      });
  }, []);

  const formatDate = (d?: string | null) => {
    if (!d) return "-";
    return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  };

  const comparedCandidate = comparison?.matches.find((candidate) => candidate.id === selectedMatchId) || comparison?.matches[0] || null;
  const matchReasons = comparison && comparedCandidate ? getMatchReasons(comparison.primary, comparedCandidate) : [];
  const candidateCompleteness = (candidate: DuplicateCandidate) => comparisonFields.filter(([key]) => {
    const value = candidate[key as keyof DuplicateCandidate];
    return value !== null && value !== undefined && value !== "";
  }).length;

  const normalizedSearch = searchQuery.trim().toLowerCase();
  const exactFiltered = data?.exact?.filter(c =>
    c.name.toLowerCase().includes(normalizedSearch) ||
    c.email?.toLowerCase().includes(normalizedSearch) ||
    c.phone?.toLowerCase().includes(normalizedSearch)
  ) || [];

  const possibleFiltered = data?.possible?.filter(c =>
    c.name.toLowerCase().includes(normalizedSearch) ||
    c.email?.toLowerCase().includes(normalizedSearch) ||
    c.phone?.toLowerCase().includes(normalizedSearch)
  ) || [];

  const renderDuplicateSection = (
    title: string,
    description: string,
    candidates: DuplicateCandidate[],
    isExact: boolean,
  ) => {
    const palette = isExact
      ? {
          accent: "red",
          icon: <AlertCircle className="h-5 w-5" />,
          iconClass: "bg-red-100 text-red-600",
          countClass: "bg-red-100 text-red-700",
          cardClass: "border-red-100",
          lineClass: "from-red-500 to-rose-400",
          actionClass: "border-red-200 text-red-700 hover:border-red-300 hover:bg-red-50",
        }
      : {
          accent: "amber",
          icon: <FileWarning className="h-5 w-5" />,
          iconClass: "bg-amber-100 text-amber-600",
          countClass: "bg-amber-100 text-amber-700",
          cardClass: "border-amber-100",
          lineClass: "from-amber-500 to-orange-400",
          actionClass: "border-amber-200 text-amber-700 hover:border-amber-300 hover:bg-amber-50",
        };

    return (
      <Card className={`overflow-hidden rounded-3xl border bg-white shadow-[0_10px_30px_-24px_rgba(15,23,42,0.4)] ${palette.cardClass}`}>
        <div className={`h-1 bg-gradient-to-r ${palette.lineClass}`} />
        <div className="flex flex-col gap-4 border-b border-slate-100 bg-gradient-to-b from-slate-50/80 to-white p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="flex items-start gap-3">
            <div className={`rounded-2xl p-3 ${palette.iconClass}`}>{palette.icon}</div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-bold text-slate-950">{title}</h2>
                <Badge className={`border-0 px-2.5 py-1 text-xs font-bold ${palette.countClass}`}>{candidates.length} records</Badge>
              </div>
              <p className="mt-1 max-w-2xl text-sm text-slate-600">{description}</p>
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-500">
            {isExact ? "Review before contacting" : "Manual review required"}
          </div>
        </div>

        {candidates.length ? (
          <div className="divide-y divide-slate-100">
            {candidates.map((candidate) => {
              const related = candidates.filter((other) => other.id !== candidate.id && getMatchReasons(candidate, other).length > 0);
              const matchSignals = [...new Set(related.flatMap((other) => getMatchReasons(candidate, other)))];

              return (
                <article key={candidate.id} className="group flex flex-col xl:flex-row xl:items-center justify-between gap-4 p-5 hover:bg-slate-50/70 transition-colors bg-white">
                  {/* Left: Candidate Info */}
                  <div className="flex items-start sm:items-center gap-4 min-w-[260px] max-w-sm">
                    <button type="button" onClick={() => navigate(`/candidates/${candidate.id}`)} className="flex items-center gap-3 text-left group-hover:opacity-90">
                      {candidate.photo ? (
                        <img
                          src={`${API_BASE_URL}/../uploads/candidates/photos/${candidate.photo}`}
                          alt={candidate.name}
                          className="h-12 w-12 rounded-full object-cover shrink-0 border border-slate-200 shadow-sm"
                        />
                      ) : (
                        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-base font-black shadow-sm ${isExact ? "bg-red-100 text-red-700 ring-2 ring-red-200" : "bg-amber-100 text-amber-700 ring-2 ring-amber-200"}`}>
                          {candidate.name?.charAt(0)?.toUpperCase() || "U"}
                        </div>
                      )}
                      <div className="min-w-0">
                        <h3 className="truncate font-black text-slate-950 group-hover:text-emerald-700 text-[15px]">{candidate.name}</h3>
                        <p className="mt-0.5 truncate text-xs font-bold text-slate-400">ID: {candidate.id}</p>
                      </div>
                    </button>
                  </div>

                  {/* Middle Left: Contact Details */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 text-xs text-slate-600 min-w-[280px]">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                        <Mail className="h-3.5 w-3.5 text-slate-500" />
                      </div>
                      <span className="font-semibold text-slate-700 truncate max-w-[180px]">{candidate.email || "No email"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                        <Phone className="h-3.5 w-3.5 text-slate-500" />
                      </div>
                      <span className="font-semibold text-slate-700">{candidate.phone || "No phone"}</span>
                    </div>
                  </div>

                  {/* Middle Right: Match Signals & Stage */}
                  <div className="flex flex-wrap items-center gap-2 min-w-[200px]">
                    {matchSignals.map((signal) => (
                      <Badge key={signal} variant="outline" className={`border px-2.5 py-1 text-[11px] font-bold ${isExact ? "border-red-200 bg-red-50 text-red-700" : "border-amber-200 bg-amber-50 text-amber-700"}`}>
                        {signal}
                      </Badge>
                    ))}
                    <Badge variant="outline" className="border-slate-200 bg-slate-100/80 px-2.5 py-1 text-[11px] font-bold text-slate-600">
                      {candidate.stage || "New Applicant"}
                    </Badge>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 shrink-0 self-end xl:self-auto">
                    <Button 
                      onClick={() => handleCompare(candidate, isExact)} 
                      variant="outline" 
                      className={`h-9 px-4 rounded-xl text-xs font-bold transition-all ${palette.actionClass}`}
                    >
                      <GitCompareArrows className="mr-1.5 h-3.5 w-3.5" /> Compare records
                    </Button>
                    <Button 
                      onClick={() => navigate(`/candidates/${candidate.id}`)} 
                      variant="outline" 
                      size="icon" 
                      className="h-9 w-9 rounded-xl border-slate-200 text-slate-600 hover:bg-slate-100" 
                      aria-label={`Open ${candidate.name}`}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      onClick={() => setDeleteCandidate(candidate)} 
                      variant="ghost" 
                      size="icon" 
                      className="h-9 w-9 rounded-xl text-slate-400 hover:bg-red-50 hover:text-red-600" 
                      aria-label={`Delete ${candidate.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="flex min-h-56 flex-col items-center justify-center p-8 text-center">
            <div className="rounded-full bg-emerald-50 p-3 text-emerald-600"><CheckCircle2 className="h-7 w-7" /></div>
            <h3 className="mt-3 font-bold text-slate-800">{searchQuery ? "No matching records" : "No duplicates found"}</h3>
            <p className="mt-1 text-sm text-slate-500">{searchQuery ? "Try a different name, email address, or phone number." : "This section is currently clear."}</p>
          </div>
        )}
      </Card>
    );
  };

  return (
    <div className="flex flex-col gap-6 w-full pb-10">
      {comparison && comparedCandidate && (
        <Card className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_14px_40px_-24px_rgba(15,23,42,0.38)]">
          <div className="border-b border-slate-100 bg-gradient-to-r from-blue-50 via-white to-amber-50 p-5 sm:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-blue-600">
                  <GitCompareArrows className="h-4 w-4" /> Duplicate pair review
                </div>
                <h2 className="text-xl font-bold tracking-tight text-slate-950">Compare candidate records</h2>
                <p className="mt-1 text-sm text-slate-600">Review the match signals and the highlighted differences before taking any action.</p>
              </div>
              <Button onClick={() => setComparison(null)} variant="outline" className="h-10 rounded-xl border-slate-200 bg-white font-bold text-slate-700">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to results
              </Button>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">Matched because:</span>
              {matchReasons.map((reason) => (
                <Badge key={reason} className="gap-1 border-0 bg-red-100 px-2.5 py-1 text-xs font-bold text-red-700 hover:bg-red-100">
                  <CheckCircle2 className="h-3.5 w-3.5" /> {reason}
                </Badge>
              ))}
              <Badge variant="outline" className="border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-slate-600">
                {comparison.isExact ? "Exact duplicate" : "Possible duplicate"}
              </Badge>
            </div>
          </div>

          {comparison.matches.length > 1 && (
            <div className="border-b border-slate-100 bg-slate-50/70 px-5 py-4 sm:px-6">
              <div className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-800">
                <CircleAlert className="h-4 w-4 text-amber-500" />
                Choose a record to compare with {comparison.primary.name}
              </div>
              <div className="flex gap-3 overflow-x-auto pb-1">
                {comparison.matches.map((candidate) => {
                  const selected = candidate.id === comparedCandidate.id;
                  const reasons = getMatchReasons(comparison.primary, candidate);
                  return (
                    <button
                      key={candidate.id}
                      type="button"
                      onClick={() => setSelectedMatchId(candidate.id)}
                      className={`min-w-[230px] rounded-xl border p-3 text-left transition-all ${selected ? "border-blue-500 bg-blue-50 ring-2 ring-blue-100" : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-bold text-slate-900">{candidate.name}</span>
                        {selected && <CheckCircle2 className="h-4 w-4 shrink-0 text-blue-600" />}
                      </div>
                      <span className="mt-1 block truncate text-xs text-slate-500">{candidate.email || candidate.phone || "No contact detail"}</span>
                      <span className="mt-2 block text-[11px] font-semibold text-slate-500">{reasons.join(" · ")}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="grid gap-4 p-5 sm:p-6 lg:grid-cols-[1fr_auto_1fr]">
            {[
              { candidate: comparison.primary, label: "Selected record", tone: "blue" },
              { candidate: comparedCandidate, label: "Possible duplicate", tone: "amber" },
            ].map(({ candidate, label, tone }, index) => (
              <div key={candidate.id} className={`rounded-2xl border p-4 ${tone === "blue" ? "border-blue-200 bg-blue-50/55" : "border-amber-200 bg-amber-50/55"}`}>
                <div className="flex items-start gap-3">
                  <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-black ${tone === "blue" ? "bg-blue-600 text-white" : "bg-amber-500 text-white"}`}>
                    {candidate.name?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</span>
                      <Badge className={`border-0 text-[10px] ${tone === "blue" ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"}`}>{candidate.stage || "New Applicant"}</Badge>
                    </div>
                    <h3 className="mt-1 truncate text-lg font-bold text-slate-950">{candidate.name}</h3>
                    <p className="mt-1 text-xs text-slate-600">{candidateCompleteness(candidate)}/{comparisonFields.length} key fields completed</p>
                  </div>
                </div>
                <div className="mt-4 grid gap-2 text-xs text-slate-600 sm:grid-cols-2">
                  <span className="flex min-w-0 items-center gap-1.5 truncate"><Mail className="h-3.5 w-3.5 shrink-0" /> {candidate.email || "No email"}</span>
                  <span className="flex min-w-0 items-center gap-1.5 truncate"><Phone className="h-3.5 w-3.5 shrink-0" /> {candidate.phone || "No phone"}</span>
                  <span className="flex min-w-0 items-center gap-1.5 truncate"><BriefcaseBusiness className="h-3.5 w-3.5 shrink-0" /> {candidate.role || "No position"}</span>
                  <span className="flex min-w-0 items-center gap-1.5 truncate"><MapPin className="h-3.5 w-3.5 shrink-0" /> {candidate.location || "No location"}</span>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => navigate(`/candidates/${candidate.id}`)} className="h-8 rounded-lg bg-white text-xs font-bold">
                    <Eye className="mr-1.5 h-3.5 w-3.5" /> Open record
                  </Button>
                  {index === 1 && (
                    <Button variant="outline" size="sm" onClick={() => setDeleteCandidate(candidate)} className="h-8 rounded-lg border-red-200 bg-white text-xs font-bold text-red-600 hover:bg-red-50 hover:text-red-700">
                      <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Delete duplicate
                    </Button>
                  )}
                </div>
              </div>
            ))}
            <div className="hidden items-center justify-center lg:flex"><ArrowRight className="h-6 w-6 text-slate-300" /></div>
          </div>

          <div className="border-t border-slate-100 px-5 py-5 sm:px-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-slate-900">Field-by-field comparison</h3>
                <p className="mt-0.5 text-xs text-slate-500">Green fields match. Amber fields need a human review.</p>
              </div>
              <div className="flex items-center gap-3 text-xs font-semibold text-slate-500">
                <span className="flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Same</span>
                <span className="flex items-center gap-1"><CircleAlert className="h-3.5 w-3.5 text-amber-500" /> Different</span>
              </div>
            </div>
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full min-w-[760px] text-left text-[13px]">
                <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="w-[22%] px-4 py-3">Field</th>
                    <th className="w-[39%] border-l border-slate-200 px-4 py-3 text-blue-800">Selected record</th>
                    <th className="w-[39%] border-l border-slate-200 px-4 py-3 text-amber-800">Possible duplicate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {comparisonFields.map(([field, label]) => {
                    const valueA = comparison.primary[field];
                    const valueB = comparedCandidate[field];
                    const isDate = field === "createdAt" || field === "updatedAt";
                    const same = Boolean(valueA && valueB) && typeof valueA === "string" && typeof valueB === "string" && (field === "email" ? normalizeEmail(valueA) === normalizeEmail(valueB) : field === "phone" ? normalizePhone(valueA) === normalizePhone(valueB) : valueA.trim().toLowerCase() === valueB.trim().toLowerCase());
                    const displayA = isDate ? formatDate(valueA || "") : valueA || "—";
                    const displayB = isDate ? formatDate(valueB || "") : valueB || "—";
                    return (
                      <tr key={field} className={same ? "bg-emerald-50/25" : "bg-white"}>
                        <td className="px-4 py-3 font-bold text-slate-600">{label}</td>
                        <td className={`border-l border-slate-100 px-4 py-3 ${same ? "font-semibold text-emerald-800" : "text-slate-700"}`}>
                          <span className="flex items-center gap-2">{displayA}{same && <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />}</span>
                        </td>
                        <td className={`border-l border-slate-100 px-4 py-3 ${same ? "font-semibold text-emerald-800" : "bg-amber-50/45 text-amber-950"}`}>
                          <span className="flex items-center gap-2">{displayB}{same ? <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" /> : <CircleAlert className="h-3.5 w-3.5 shrink-0 text-amber-500" />}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      )}
      {!comparison && (
        <>
      {/* Top Banner (Dark Teal / Cyan Gradient) */}
      <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-r from-[#000C22] via-[#0B2524] to-[#0D2823] shadow-lg border border-teal-900/40 p-8 sm:p-10 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="relative z-10 flex flex-col justify-center max-w-xl">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-2 text-white">Duplicate Check</h1>
          <p className="text-[#60C042] text-[14px] sm:text-[15px] font-medium leading-relaxed">
            Spot duplicate signals quickly, compare candidate records side by side, and review actions.
          </p>
        </div>
        <div className="relative z-10 flex items-center gap-6 self-stretch sm:self-auto justify-between sm:justify-end">
          <div className="relative w-full sm:w-[280px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-teal-300/70" />
            <Input 
              placeholder="Search duplicates..." 
              className="pl-10 h-11 w-full bg-white/10 text-[13px] text-white placeholder:text-teal-200/60 rounded-xl border border-white/20 focus-visible:bg-white/15 focus-visible:ring-1 focus-visible:ring-teal-400 transition-all shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="shrink-0 group cursor-pointer">
            <span className="text-7xl drop-shadow-2xl inline-block origin-bottom hover:animate-bounce cursor-default select-none">
              🛡️
            </span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="space-y-6">
          <Skeleton className="h-[300px] w-full rounded-3xl" />
          <Skeleton className="h-[300px] w-full rounded-3xl" />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="relative overflow-hidden shadow-sm border border-rose-200/60 rounded-2xl flex flex-col p-5 bg-rose-50/60 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
              <div className="absolute top-0 right-0 -mt-4 -mr-4 w-28 h-28 bg-gradient-to-br from-white/60 to-transparent rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-start justify-between mb-3 relative z-10">
                <div>
                  <div className="text-[11px] font-black text-rose-700 uppercase tracking-wider">
                    Exact Matches
                  </div>
                  <p className="mt-0.5 text-xs font-semibold text-slate-500">Same email address or phone number</p>
                </div>
                <div className="p-2.5 rounded-xl shrink-0 border border-white/60 shadow-sm bg-rose-100 text-rose-700">
                  <AlertCircle className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-auto relative z-10 flex items-baseline justify-between pt-2">
                <div className="text-3xl font-black tracking-tight text-slate-900">
                  {exactFiltered.length}
                </div>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-100/80 text-rose-700 border border-rose-200/60">
                  High Priority
                </span>
              </div>
            </Card>

            <Card className="relative overflow-hidden shadow-sm border border-amber-200/60 rounded-2xl flex flex-col p-5 bg-amber-50/60 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
              <div className="absolute top-0 right-0 -mt-4 -mr-4 w-28 h-28 bg-gradient-to-br from-white/60 to-transparent rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-start justify-between mb-3 relative z-10">
                <div>
                  <div className="text-[11px] font-black text-amber-700 uppercase tracking-wider">
                    Possible Matches
                  </div>
                  <p className="mt-0.5 text-xs font-semibold text-slate-500">Same name; contact details differ</p>
                </div>
                <div className="p-2.5 rounded-xl shrink-0 border border-white/60 shadow-sm bg-amber-100 text-amber-700">
                  <FileWarning className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-auto relative z-10 flex items-baseline justify-between pt-2">
                <div className="text-3xl font-black tracking-tight text-slate-900">
                  {possibleFiltered.length}
                </div>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100/80 text-amber-700 border border-amber-200/60">
                  Manual Review
                </span>
              </div>
            </Card>
          </div>
          {renderDuplicateSection("Exact duplicates", "Profiles sharing the same email address or phone number. Check these first to prevent duplicate follow-ups.", exactFiltered, true)}
          {renderDuplicateSection("Possible duplicates", "Profiles with the same name but different contact details. Compare before deciding whether they are the same person.", possibleFiltered, false)}
        </div>
      )}
            </>
      )}

      <AlertDialog open={!!deleteCandidate} onOpenChange={(open) => !open && setDeleteCandidate(null)}>
        <AlertDialogContent className="rounded-3xl max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold flex items-center gap-2 text-slate-900">
              <Trash2 className="h-5 w-5 text-red-500" />
              Delete Duplicate Candidate
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[14px] text-slate-600 font-medium pt-2 leading-relaxed">
              Are you sure you want to delete <strong>{deleteCandidate?.name}</strong>?
              <br/><br/>
              This action cannot be undone. This candidate's record will be <strong className="text-destructive">permanently removed</strong> from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel className="rounded-xl font-bold">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={executeDelete} className="rounded-xl font-bold bg-red-600 hover:bg-red-700 text-white border-0">
              Yes, Delete Candidate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
