import { Link } from "react-router-dom";
import { useMemo, useState } from "react";
import { useAts } from "@/services/ats-store";
import { STAGE_COLORS, type Candidate, type Stage } from "@/types/ats-types";
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
    i < firstWeekday ? null : i - firstWeekday + 1,
  );

  const selectedEvents = selectedDay ? events.filter((e) => e.date.getDate() === selectedDay) : [];

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Calendar</h1>
          <p className="mt-1 text-[13px] text-slate-500">
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
        <Card className="p-6 bg-white border-border/50 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] rounded-3xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -mt-20 -ml-20 pointer-events-none" />

          <div className="mb-8 flex items-center justify-between relative z-10">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">{monthLabel}</h2>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 rounded-xl border-slate-200 bg-white hover:bg-slate-50 text-slate-600 shadow-sm transition-all"
                onClick={prevMonth}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 rounded-xl border-slate-200 bg-white hover:bg-slate-50 text-slate-600 shadow-sm transition-all"
                onClick={nextMonth}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="mb-3 grid grid-cols-7 gap-2">
            {WEEKDAYS.map((d) => (
              <div
                key={d}
                className="py-1 text-center text-[11px] font-black uppercase tracking-widest text-slate-400"
              >
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2 relative z-10">
            {cells.map((day, idx) => {
              if (day === null)
                return <div key={`empty-${idx}`} className="rounded-2xl bg-slate-50/50" />;
              const dayEvents = events.filter((e) => e.date.getDate() === day);
              const isToday =
                day === today.getDate() &&
                month === today.getMonth() &&
                year === today.getFullYear();
              const isSelected = day === selectedDay;

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => setSelectedDay(day)}
                  className={cn(
                    "relative flex min-h-[90px] flex-col rounded-2xl border p-2 text-left transition-all duration-300",
                    isSelected
                      ? "border-blue-500 bg-blue-50/40 shadow-sm ring-1 ring-blue-500"
                      : "border-slate-100 bg-white hover:border-blue-200 hover:bg-blue-50/30 hover:shadow-md",
                    isToday && !isSelected && "border-blue-200 bg-blue-50/10",
                  )}
                >
                  <span
                    className={cn(
                      "text-[13px] font-black mb-1.5",
                      isToday
                        ? "flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-white shadow-sm shadow-blue-600/30"
                        : isSelected
                          ? "text-blue-700"
                          : "text-slate-700",
                    )}
                  >
                    {day}
                  </span>
                  <div className="mt-auto space-y-1 w-full">
                    {dayEvents.slice(0, 2).map((e) => (
                      <div
                        key={e.id}
                        className="truncate rounded-md bg-white border border-slate-100 px-1.5 py-0.5 text-[9px] font-bold text-slate-700 shadow-sm flex items-center gap-1"
                      >
                        <div
                          className={cn(
                            "w-1 h-1 rounded-full shrink-0",
                            e.type === "Online"
                              ? "bg-blue-500"
                              : e.type === "Phone"
                                ? "bg-purple-500"
                                : "bg-emerald-500",
                          )}
                        />
                        {e.candidateName.split(" ")[0]}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-[9px] font-bold text-slate-400 pl-1">
                        +{dayEvents.length - 2} more
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        <Card className="p-6 bg-white border-border/50 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] rounded-3xl flex flex-col h-full">
          <h3 className="mb-1 text-[15px] font-bold text-slate-900">
            {selectedDay
              ? new Date(year, month, selectedDay).toLocaleDateString(undefined, {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })
              : "Select a day"}
          </h3>
          <p className="mb-6 text-[11px] font-medium text-slate-500">
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
                  to={`/candidates/${e.candidateId}`}
                  className="block rounded-2xl border border-slate-100 bg-slate-50/50 p-4 transition-all hover:border-blue-200 hover:bg-blue-50/30 hover:shadow-md"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[11px] font-bold uppercase text-blue-600 border border-blue-100">
                      {e.candidateName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[13px] font-bold text-slate-900">
                        {e.candidateName}
                      </div>
                      <div className="truncate text-[11px] font-medium text-slate-500 mt-0.5">
                        {e.role}
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
                          <Clock className="h-3.5 w-3.5" />
                          {e.date.toLocaleTimeString(undefined, {
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </span>
                        <span className="flex items-center gap-1 rounded-md bg-white border border-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-700 shadow-sm">
                          <Icon className="h-3 w-3 text-slate-400" />
                          {e.type}
                        </span>
                        <span
                          className={cn(
                            "rounded-md border px-2 py-0.5 text-[10px] font-bold shadow-sm whitespace-nowrap",
                            STAGE_COLORS[e.stage],
                          )}
                        >
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
