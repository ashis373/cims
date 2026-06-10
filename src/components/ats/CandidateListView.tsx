import { Link } from "react-router-dom";
import { useAts } from "@/lib/ats-store";
import { DEPARTMENT_COLORS, STAGE_COLORS, type Candidate } from "@/lib/ats-types";
import { Button } from "@/components/ui/button";
import { Calendar, Mail, MoreHorizontal, Phone } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface Props {
  candidates: Candidate[];
}

const GRID =
  "grid grid-cols-[minmax(180px,1.6fr)_minmax(120px,1.2fr)_130px_90px_minmax(130px,1.2fr)_90px_100px_100px_90px_90px] items-center gap-x-4";

function Badge({ label, className }: { label: string; className: string }) {
  return (
    <span
      className={cn(
        "inline-flex w-full items-center justify-center truncate rounded-full border px-2 py-0.5 text-[10px] font-semibold leading-tight",
        className,
      )}
      title={label}
    >
      {label}
    </span>
  );
}

export function CandidateListView({ candidates }: Props) {
  const { remove } = useAts();

  return (
    <div className="overflow-hidden rounded-xl border border-border/50 bg-white shadow-sm">
      <div className="overflow-x-auto scrollbar-thin">
        <div className="min-w-[1200px]">
          <div className={cn(GRID, "border-b border-border/40 bg-slate-50/80 px-5 py-3")}>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Candidate
            </div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Position
            </div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Status
            </div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Experience
            </div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Current Company
            </div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Notice Period
            </div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Source
            </div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Recruiter
            </div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Applied
            </div>
            <div className="text-right text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Actions
            </div>
          </div>

          {candidates.map((c) => (
            <div
              key={c.id}
              className={cn(
                GRID,
                "group border-b border-border/30 px-5 py-3.5 transition-colors last:border-b-0 hover:bg-slate-50/60",
              )}
            >
              <Link to={`/candidates/${c.id}`} className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold uppercase text-primary">
                  {c.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)}
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-foreground group-hover:text-primary">
                    {c.name}
                  </div>
                  <div className="truncate text-[11px] font-medium text-muted-foreground">
                    {c.email}
                  </div>
                </div>
              </Link>

              <div className="truncate text-xs font-medium" title={c.role}>
                {c.role}
              </div>

              <Badge label={c.stage} className={STAGE_COLORS[c.stage]} />

              <div className="truncate text-xs text-muted-foreground" title={c.experience || "—"}>
                {c.experience || "—"}
              </div>
              <div
                className="truncate text-xs text-muted-foreground"
                title={c.currentCompany || "—"}
              >
                {c.currentCompany || "—"}
              </div>
              <div className="truncate text-xs text-muted-foreground" title={c.noticePeriod || "—"}>
                {c.noticePeriod || "—"}
              </div>
              <div className="truncate text-xs text-muted-foreground" title={c.source}>
                {c.source}
              </div>
              <div
                className="truncate text-xs text-muted-foreground"
                title={c.recruiter || "Unassigned"}
              >
                {c.recruiter || "Unassigned"}
              </div>

              <div className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                <Calendar className="h-3 w-3 shrink-0 opacity-70" />
                <span className="tabular-nums">
                  {new Date(c.appliedAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>

              <div className="flex items-center justify-end gap-0.5">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-lg text-primary hover:bg-primary/10 hover:text-primary"
                >
                  <Mail className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-lg text-primary hover:bg-primary/10 hover:text-primary"
                >
                  <Phone className="h-3.5 w-3.5" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="rounded-xl border-border/40">
                    <DropdownMenuItem asChild>
                      <Link to={`/candidates/${c.id}`}>View Details</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => remove([c.id])}
                    >
                      Remove
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
