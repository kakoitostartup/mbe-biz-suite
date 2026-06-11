import { useMemo, useState } from "react";
import { useStore } from "./store";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Bell, Clock, ListChecks, CalendarDays, AlertTriangle } from "lucide-react";
import { addDays, format, isToday, isTomorrow, parseISO, startOfWeek, isSameDay, differenceInMinutes } from "date-fns";

export const HeaderBell = () => {
  const { tasks, appointments, audit } = useStore();
  const [open, setOpen] = useState(false);
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));

  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);

  const upcoming = useMemo(() => {
    const items: { kind: "task" | "appt"; id: string; title: string; sub?: string; due: string }[] = [];
    tasks.filter((t) => !t.done).forEach((t) => items.push({ kind: "task", id: t.id, title: t.title, sub: t.client, due: t.due }));
    appointments.forEach((a) => items.push({ kind: "appt", id: a.id, title: a.title, sub: a.clients.join(", "), due: a.start }));
    return items.sort((a, b) => +parseISO(a.due) - +parseISO(b.due)).slice(0, 8);
  }, [tasks, appointments]);

  const alerts = audit.filter((a) => a.severity === "alert" || a.severity === "warn").slice(0, 3);

  const dot = (d: Date) => {
    const hasTask = tasks.some((t) => !t.done && isSameDay(parseISO(t.due), d));
    const hasAppt = appointments.some((a) => isSameDay(parseISO(a.start), d));
    return hasTask || hasAppt;
  };

  const labelFor = (iso: string) => {
    const d = parseISO(iso);
    if (isToday(d)) {
      const m = differenceInMinutes(d, new Date());
      if (m < 0) return `Today · overdue`;
      if (m < 60) return `Today · in ${m}m`;
      return `Today · ${format(d, "HH:mm")}`;
    }
    if (isTomorrow(d)) return `Tomorrow · ${format(d, "HH:mm")}`;
    return format(d, "EEE d MMM · HH:mm");
  };

  const totalBadge = upcoming.filter((u) => differenceInMinutes(parseISO(u.due), new Date()) < 60 * 24).length;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="relative h-9 w-9 rounded-lg bg-secondary grid place-items-center hover:bg-accent transition-colors">
          <Bell className="h-4 w-4" />
          {totalBadge > 0 && (
            <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full bg-destructive text-destructive-foreground text-[9px] grid place-items-center font-semibold">
              {totalBadge}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[380px] p-0" align="end">
        {/* Mini week strip */}
        <div className="p-3 border-b border-border">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs font-medium flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5" /> This week</div>
            <button className="text-[10px] text-muted-foreground hover:text-foreground" onClick={() => setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))}>today</button>
          </div>
          <div className="grid grid-cols-7 gap-1">
            {days.map((d) => {
              const today = isToday(d);
              const has = dot(d);
              return (
                <div key={d.toISOString()} className={`text-center py-1.5 rounded-md text-[10px] ${today ? "bg-primary text-primary-foreground" : "bg-secondary/40"}`}>
                  <div className="uppercase tracking-widest opacity-70">{format(d, "EEE")[0]}</div>
                  <div className="text-xs font-semibold">{format(d, "d")}</div>
                  <div className={`mt-0.5 h-1 w-1 mx-auto rounded-full ${has ? (today ? "bg-primary-foreground" : "bg-[hsl(var(--stage-progress))]") : "opacity-0"}`} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Alerts */}
        {alerts.length > 0 && (
          <div className="px-3 py-2 border-b border-border space-y-1.5">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Alerts</div>
            {alerts.map((a) => (
              <div key={a.id} className="flex items-start gap-2 text-[11px]">
                <AlertTriangle className={`h-3 w-3 mt-0.5 shrink-0 ${a.severity === "alert" ? "text-destructive" : "text-[hsl(var(--stage-progress))]"}`} />
                <div className="flex-1 min-w-0">
                  <div className="truncate font-medium">{a.action}</div>
                  <div className="text-muted-foreground truncate">{a.detail}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Upcoming tasks & deadlines */}
        <div className="p-3 max-h-[280px] overflow-auto">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-1.5"><ListChecks className="h-3 w-3" /> Upcoming tasks & deadlines</div>
          <div className="space-y-1.5">
            {upcoming.length === 0 && <div className="text-xs text-muted-foreground py-4 text-center">All clear ✦</div>}
            {upcoming.map((u) => (
              <div key={`${u.kind}-${u.id}`} className="flex items-center gap-2 p-2 rounded-md bg-secondary/40 hairline">
                <div className={`h-7 w-7 rounded-md grid place-items-center ${u.kind === "appt" ? "bg-[hsl(var(--stage-progress))]/25" : "bg-foreground text-background"}`}>
                  {u.kind === "appt" ? <CalendarDays className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-medium truncate">{u.title}</div>
                  <div className="text-[10px] text-muted-foreground truncate">{labelFor(u.due)}{u.sub ? ` · ${u.sub}` : ""}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
