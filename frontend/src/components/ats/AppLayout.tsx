import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  KanbanSquare,
  Moon,
  Sun,
  Undo2,
  Briefcase,
  BarChart3,
  CalendarDays,
} from "lucide-react";
import { useTheme } from "@/lib/theme";
import { useAts } from "@/lib/ats-store";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/candidates", label: "Candidates", icon: Users },
  { to: "/pipeline", label: "Pipeline", icon: KanbanSquare },
  { to: "/reports", label: "Reports", icon: BarChart3 },
  { to: "/calendar", label: "Calendar", icon: CalendarDays },
] as const;

export function AppLayout({ children }: { children: ReactNode }) {
  const { theme, toggle } = useTheme();
  const { undo, canUndo } = useAts();
  const { pathname } = useLocation();

  const isActive = (to: string) => (to === "/" ? pathname === "/" : pathname.startsWith(to));

  return (
    <div className="flex min-h-screen w-full bg-white text-foreground antialiased selection:bg-primary/10 selection:text-primary">
      <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
        <div className="flex items-center gap-3 px-6 py-8">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-black/20">
            <Briefcase className="h-5 w-5" />
          </div>
          <div>
            <div className="text-base font-bold leading-none tracking-tight text-white">Hireflow</div>
            <div className="mt-1 text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/60">Buddy ATS</div>
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-4 pb-4 pt-2 scrollbar-thin">
          {nav.map((n) => {
            const active = isActive(n.to);
            return (
              <Link
                key={n.to}
                to={n.to}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm transition-all duration-200",
                  active
                    ? "bg-primary font-semibold text-primary-foreground shadow-md shadow-black/15"
                    : "text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-white"
                )}
              >
                <n.icon className={cn("h-4 w-4 shrink-0", active ? "text-primary-foreground" : "text-sidebar-foreground/50")} />
                <span>{n.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="shrink-0 border-t border-sidebar-border px-6 py-6">
          <div className="flex items-center gap-2 rounded-xl border border-sidebar-border bg-sidebar-accent/60 px-3 py-2.5">
            <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/70">Local Instance</span>
          </div>
          <div className="mt-3 px-1 text-[10px] font-medium leading-relaxed text-sidebar-foreground/45">
            Data remains encrypted in your local browser storage.
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col bg-white">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border/60 bg-white/95 px-4 backdrop-blur-sm md:px-8">
          <div className="flex items-center gap-2 md:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Briefcase className="h-4 w-4" />
            </div>
            <span className="text-base font-bold tracking-tight">Hireflow</span>
          </div>

          <div className="flex max-w-full gap-1 overflow-x-auto rounded-xl border border-border/30 bg-slate-50 p-1 scrollbar-thin md:hidden">
            {nav.map((n) => {
              const active = isActive(n.to);
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  title={n.label}
                  className={cn(
                    "flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-medium transition-all",
                    active ? "bg-white text-primary shadow-sm" : "text-muted-foreground"
                  )}
                >
                  <n.icon className="h-4 w-4 shrink-0" />
                  <span className="whitespace-nowrap">{n.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="ml-auto flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={undo}
              disabled={!canUndo}
              className="gap-2 rounded-xl transition-all hover:bg-primary/5 hover:text-primary disabled:opacity-30"
            >
              <Undo2 className="h-4 w-4" />
              <span className="hidden sm:inline">Undo</span>
            </Button>
            <div className="mx-1 hidden h-4 w-px bg-border/60 sm:block" />
            <Button
              variant="ghost"
              size="icon"
              onClick={toggle}
              aria-label="Toggle theme"
              className="rounded-xl transition-all hover:bg-primary/5"
            >
              {theme === "dark" ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-primary" />}
            </Button>
          </div>
        </header>
        <main className="flex-1 bg-slate-50/80 px-6 py-6 md:px-10 md:py-8">{children}</main>
      </div>
      <Toaster position="bottom-right" richColors closeButton />
    </div>
  );
}
