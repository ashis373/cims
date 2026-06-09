import { Link } from "react-router-dom";
import { useMemo, useState } from "react";
import { useAts } from "@/lib/ats-store";
import { STAGE_COLORS, type Candidate, type Stage } from "@/lib/ats-types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, CalendarDays, Clock, Video, Phone, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";


interface CalEvent {
  id: string;
  date: Date;
  candidateId: string;
  candidateName: string;
  role: string;
  type: string;
  stage: Stage;
}

function buildEvents(candidates: Candidate[], year: number, month: number): CalEvent[] {
  const events: CalEvent[] = [];

  candidates.forEach((c, i) => {
    if (c.interviews.length > 0) {
      c.interviews.forEach((iv) => {
        const d = new Date(iv.date);
        if (d.getFullYear() === year && d.getMonth() === month) {
          events.push({
            id: iv.id,
            date: d,
            candidateId: c.id,
            candidateName: c.name,
            role: c.role,
            type: iv.type,
            stage: c.stage,
          });
        }
      });
      return;
    }

    if (c.stage === "Interview Scheduled" || c.stage === "Interview Completed") {
      const day = ((i * 7 + c.name.length) % 28) + 1;
      const hour = 9 + (i % 7);
      const d = new Date(year, month, day, hour, 0, 0);
      const types = ["Online", "Phone", "In-person"];
      events.push({
        id: `${c.id}-scheduled`,
        date: d,
        candidateId: c.id,
        candidateName: c.name,
        role: c.role,
        type: types[i % types.length],
        stage: c.stage,
      });
    }
  });

  return events.sort((a, b) => a.date.getTime() - b.date.getTime());
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const typeIcon: Record<string, React.ElementType> = {
  Online: Video,
  Phone: Phone,
  "In-person": MapPin,
};

function CalendarPage() {
  const { candidates } = useAts();
  const today = new Date();
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDay, setSelectedDay] = useState<number | null>(today.getDate());

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const monthLabel = viewDate.toLocaleDateString(undefined, { month: "long", year: "numeric" });

  const events = useMemo(() => buildEvents(candidates, year, month), [candidates, year, month]);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstWeekday = new Date(year, month, 1).getDay();
  const cells = Array.from({ length: firstWeekday + daysInMonth }, (_, i) =>
    i < firstWeekday ? null : i - firstWeekday + 1
  );

  const selectedEvents = selectedDay
    ? events.filter((e) => e.date.getDate() === selectedDay)
    : [];

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Calendar</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Interview schedule and hiring events — {events.length} this month
          </p>
        </div>
        <Button
          variant="outline"
          className="rounded-xl"
          onClick={() => {
            setViewDate(new Date(today.getFullYear(), today.getMonth(), 1));
            setSelectedDay(today.getDate());
          }}
        >
          <CalendarDays className="mr-2 h-4 w-4" /> Today
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <Card className="rounded-2xl border-border/50 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-semibold">{monthLabel}</h2>
            <div className="flex gap-1">
              <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg" onClick={prevMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg" onClick={nextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="mb-2 grid grid-cols-7 gap-1">
            {WEEKDAYS.map((d) => (
              <div key={d} className="py-2 text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {cells.map((day, idx) => {
              if (day === null) return <div key={`empty-${idx}`} />;
              const dayEvents = events.filter((e) => e.date.getDate() === day);
              const isToday =
                day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
              const isSelected = day === selectedDay;

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => setSelectedDay(day)}
                  className={cn(
                    "relative flex min-h-[72px] flex-col rounded-xl border p-2 text-left transition-all",
                    isSelected
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border/40 bg-white hover:border-primary/30 hover:bg-slate-50",
                    isToday && !isSelected && "border-primary/40"
                  )}
                >
                  <span
                    className={cn(
                      "text-xs font-semibold",
                      isToday ? "flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground" : "text-foreground"
                    )}
                  >
                    {day}
                  </span>
                  <div className="mt-1 space-y-0.5">
                    {dayEvents.slice(0, 2).map((e) => (
                      <div key={e.id} className="truncate rounded bg-blue-500/10 px-1 py-0.5 text-[8px] font-semibold text-blue-700">
                        {e.candidateName.split(" ")[0]}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-[8px] font-medium text-muted-foreground">+{dayEvents.length - 2} more</div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        <Card className="rounded-2xl border-border/50 bg-white p-6 shadow-sm">
          <h3 className="mb-1 text-sm font-semibold">
            {selectedDay
              ? new Date(year, month, selectedDay).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })
              : "Select a day"}
          </h3>
          <p className="mb-4 text-xs text-muted-foreground">
            {selectedEvents.length} event{selectedEvents.length !== 1 ? "s" : ""} scheduled
          </p>

          <div className="space-y-3">
            {selectedEvents.length === 0 && (
              <div className="rounded-xl border border-dashed border-border/60 py-10 text-center text-sm text-muted-foreground">
                No interviews on this day
              </div>
            )}
            {selectedEvents.map((e) => {
              const Icon = typeIcon[e.type] || Clock;
              return (
                <Link
                  key={e.id}
                  to={`/candidates/${e.candidateId }`}
                  className="block rounded-xl border border-border/40 p-3.5 transition-all hover:border-primary/30 hover:bg-slate-50"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold uppercase text-primary">
                      {e.candidateName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold">{e.candidateName}</div>
                      <div className="truncate text-[11px] text-muted-foreground">{e.role}</div>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {e.date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}
                        </span>
                        <span className="flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                          <Icon className="h-3 w-3" />
                          {e.type}
                        </span>
                        <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-semibold", STAGE_COLORS[e.stage])}>
                          {e.stage}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}

export default CalendarPage;
