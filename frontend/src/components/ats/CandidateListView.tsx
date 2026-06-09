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
  "grid grid-cols-[minmax(220px,1.6fr)_132px_148px_76px_minmax(140px,1fr)_104px] items-center gap-x-4";

function Badge({ label, className }: { label: string; className: string }) {
  return (
    <span
      className={cn(
        "inline-flex w-full items-center justify-center truncate rounded-full border px-2 py-0.5 text-[10px] font-semibold leading-tight",
        className
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
        <div className="min-w-[920px]">
          <div className={cn(GRID, "border-b border-border/40 bg-slate-50/80 px-5 py-3")}>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Candidate</div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Department</div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Stage</div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Applied</div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Skills</div>
            <div className="text-right text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Actions</div>
          </div>

          {candidates.map((c) => (
            <div
              key={c.id}
              className={cn(
                GRID,
                "group border-b border-border/30 px-5 py-3.5 transition-colors last:border-b-0 hover:bg-slate-50/60"
              )}
            >
              <Link to={`/candidates/${c.id }`} className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold uppercase text-primary">
                  {c.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-foreground group-hover:text-primary">{c.name}</div>
                  <div className="truncate text-[11px] font-medium text-muted-foreground">{c.role}</div>
                </div>
              </Link>

              <Badge label={c.department} className={DEPARTMENT_COLORS[c.department]} />

              <Badge label={c.stage} className={STAGE_COLORS[c.stage]} />

              <div className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                <Calendar className="h-3 w-3 shrink-0 opacity-70" />
                <span className="tabular-nums">
                  {new Date(c.appliedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                </span>
              </div>

              <div className="flex min-w-0 flex-wrap gap-1">
                {c.tags.slice(0, 3).map((t) => (
                  <span
                    key={t}
                    className="rounded-md border border-border/40 bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold text-slate-600"
                  >
                    {t}
                  </span>
                ))}
                {c.tags.length > 3 && (
                  <span className="rounded-md border border-border/40 bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold text-muted-foreground">
                    +{c.tags.length - 3}
                  </span>
                )}
              </div>

              <div className="flex items-center justify-end gap-0.5">
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-primary hover:bg-primary/10 hover:text-primary">
                  <Mail className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-primary hover:bg-primary/10 hover:text-primary">
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
                      <Link to={`/candidates/${c.id }`}>View Details</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => remove([c.id])}>
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
