import { Link } from "react-router-dom";
import { useAts, PIPELINE_STAGES, DEPARTMENTS } from "@/lib/ats-store";
import { DEPARTMENT_COLORS, STAGE_COLORS, type Department, type Stage } from "@/lib/ats-types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, MoreHorizontal, Mail, Phone, Calendar, LayoutGrid, List, Filter } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { CandidateFormDialog } from "@/components/ats/CandidateFormDialog";
import { CandidateListView } from "@/components/ats/CandidateListView";
import { PaginationBar } from "@/components/ats/PaginationBar";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";


type ViewMode = "grid" | "list";
const VIEW_KEY = "ats.candidates.view";
const PER_PAGE_KEY = "ats.candidates.perPage";

function formatTags(tags: string[]) {
  if (tags.length === 0) return "—";
  const shown = tags.slice(0, 3).join(", ");
  return tags.length > 3 ? `${shown} +${tags.length - 3}` : shown;
}

function CandidatesPage() {
  const { candidates, remove } = useAts();
  const [q, setQ] = useState("");
  const [stage, setStage] = useState<Stage | "All">("All");
  const [department, setDepartment] = useState<Department | "All">("All");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(9);
  const [addOpen, setAddOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(VIEW_KEY);
    if (saved === "grid" || saved === "list") setViewMode(saved);
    const savedPerPage = localStorage.getItem(PER_PAGE_KEY);
    if (savedPerPage) setPerPage(Number(savedPerPage) || 9);
  }, []);

  const handleViewChange = (v: ViewMode) => {
    setViewMode(v);
    localStorage.setItem(VIEW_KEY, v);
  };

  const handlePerPageChange = (n: number) => {
    setPerPage(n);
    setPage(1);
    localStorage.setItem(PER_PAGE_KEY, String(n));
  };

  const filtered = useMemo(() => {
    return candidates.filter((c) => {
      const matchQ =
        c.name.toLowerCase().includes(q.toLowerCase()) ||
        c.role.toLowerCase().includes(q.toLowerCase()) ||
        c.email.toLowerCase().includes(q.toLowerCase()) ||
        c.department.toLowerCase().includes(q.toLowerCase());
      const matchStage = stage === "All" || c.stage === stage;
      const matchDepartment = department === "All" || c.department === department;
      return matchQ && matchStage && matchDepartment;
    });
  }, [candidates, q, stage, department]);

  useEffect(() => {
    setPage(1);
  }, [q, stage, department]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const safePage = Math.min(page, totalPages);

  const paginated = useMemo(() => {
    const start = (safePage - 1) * perPage;
    return filtered.slice(start, start + perPage);
  }, [filtered, safePage, perPage]);

  const clearFilters = () => {
    setQ("");
    setStage("All");
    setDepartment("All");
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">Candidates</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage and track your talent pool ({candidates.length})
          </p>
        </div>
        <Button onClick={() => setAddOpen(true)} className="shrink-0 rounded-lg px-4 shadow-sm">
          <Plus className="mr-2 h-4 w-4" /> Add Candidate
        </Button>
      </div>

      {/* Filter bar — single aligned row */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative min-w-0 flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, role, or email..."
            className="h-10 rounded-lg border-border/60 bg-white pl-9 shadow-sm"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <select
            className="h-10 min-w-[130px] rounded-lg border border-border/60 bg-white px-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            value={stage}
            onChange={(e) => setStage(e.target.value as Stage | "All")}
          >
            <option value="All">All Stages</option>
            {PIPELINE_STAGES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <select
            className="h-10 min-w-[150px] rounded-lg border border-border/60 bg-white px-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            value={department}
            onChange={(e) => setDepartment(e.target.value as Department | "All")}
          >
            <option value="All">All Departments</option>
            {DEPARTMENTS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10 rounded-lg border-border/60 bg-white shadow-sm"
            onClick={clearFilters}
            title="Clear filters"
          >
            <Filter className="h-4 w-4 text-muted-foreground" />
          </Button>
          <ToggleGroup
            type="single"
            value={viewMode}
            onValueChange={(v) => v && handleViewChange(v as ViewMode)}
            className="rounded-lg border border-border/60 bg-white p-0.5 shadow-sm"
          >
            <ToggleGroupItem
              value="grid"
              aria-label="Box view"
              className="h-9 w-9 rounded-md data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
            >
              <LayoutGrid className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem
              value="list"
              aria-label="List view"
              className="h-9 w-9 rounded-md data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
            >
              <List className="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>

      {/* Content */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/60 bg-white py-24 text-center shadow-sm">
          <div className="mb-4 rounded-full bg-slate-100 p-4">
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-base font-semibold">No candidates found</h3>
          <p className="mt-1 max-w-[280px] text-sm text-muted-foreground">
            Try adjusting your search filters or add a new candidate to the pool.
          </p>
          <Button variant="outline" className="mt-6 rounded-lg" onClick={clearFilters}>
            Clear Filters
          </Button>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {paginated.map((c) => (
            <Card
              key={c.id}
              className="group flex min-h-[196px] flex-col rounded-xl border-border/50 bg-white p-5 shadow-sm transition-all hover:border-primary/25 hover:shadow-md"
            >
              {/* Top: avatar + name + menu */}
              <div className="flex items-start gap-3">
                <Link to={`/candidates/${c.id }`} className="flex min-w-0 flex-1 items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold uppercase text-primary">
                    {c.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                  </div>
                  <div className="min-w-0 pt-0.5">
                    <div className="truncate text-sm font-semibold text-foreground group-hover:text-primary">{c.name}</div>
                    <div className="mt-0.5 truncate text-xs text-muted-foreground">{c.role}</div>
                  </div>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 rounded-lg text-muted-foreground">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="rounded-lg">
                    <DropdownMenuItem asChild>
                      <Link to={`/candidates/${c.id }`}>View Details</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => remove([c.id])}>
                      Remove
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Middle: badges + date */}
              <div className="mt-4 flex items-center justify-between gap-2">
                <div className="flex min-w-0 flex-wrap gap-1.5">
                  <span className={cn("rounded-full border px-2.5 py-0.5 text-[10px] font-semibold", STAGE_COLORS[c.stage])}>
                    {c.stage}
                  </span>
                  <span className={cn("rounded-full border px-2.5 py-0.5 text-[10px] font-semibold", DEPARTMENT_COLORS[c.department])}>
                    {c.department}
                  </span>
                </div>
                <span className="flex shrink-0 items-center gap-1 text-[11px] font-medium text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {new Date(c.appliedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                </span>
              </div>

              {/* Bottom: skills + actions */}
              <div className="mt-auto flex items-end justify-between gap-3 pt-4">
                <p className="min-w-0 truncate text-xs text-muted-foreground">{formatTags(c.tags)}</p>
                <div className="flex shrink-0 gap-0.5">
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-primary hover:bg-primary/10">
                    <Mail className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-primary hover:bg-primary/10">
                    <Phone className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <CandidateListView candidates={paginated} />
      )}

      {filtered.length > 0 && (
        <PaginationBar
          page={safePage}
          perPage={perPage}
          total={filtered.length}
          onPageChange={setPage}
          onPerPageChange={handlePerPageChange}
        />
      )}

      <CandidateFormDialog open={addOpen} onOpenChange={setAddOpen} />
    </div>
  );
}

export default CandidatesPage;
