import { useMemo, useState } from "react";
import { useStore } from "./store";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, ListChecks, CalendarDays } from "lucide-react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  parseISO,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { ru } from "date-fns/locale";

export const HeaderCalendar = () => {
  const { tasks, appointments } = useStore();
  const [open, setOpen] = useState(false);
  const [cursor, setCursor] = useState(() => new Date());
  const [selected, setSelected] = useState<Date | null>(null);

  const monthStart = startOfMonth(cursor);
  const days = useMemo(
    () =>
      eachDayOfInterval({
        start: startOfWeek(monthStart, { weekStartsOn: 1 }),
        end: endOfWeek(endOfMonth(cursor), { weekStartsOn: 1 }),
      }),
    [cursor, monthStart]
  );

  const tasksForDay = (d: Date) =>
    tasks.filter((t) => !t.done && isSameDay(parseISO(t.due), d));
  const apptsForDay = (d: Date) =>
    appointments.filter((a) => isSameDay(parseISO(a.start), d));
  const hasMarks = (d: Date) => tasksForDay(d).length + apptsForDay(d).length > 0;

  const selDay = selected || new Date();
  const selTasks = tasksForDay(selDay);
  const selAppts = apptsForDay(selDay);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          title="Календарь"
          className="relative h-9 w-9 rounded-lg bg-secondary grid place-items-center hover:bg-accent transition-colors"
        >
          <CalendarIcon className="h-4 w-4" />
          <span className="absolute bottom-1 right-1.5 text-[8px] font-bold leading-none">
            {format(new Date(), "d")}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[340px] p-0" align="end">
        {/* Month nav */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-border">
          <div className="text-sm font-medium capitalize flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5" />
            {format(cursor, "LLLL yyyy", { locale: ru })}
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setCursor(addMonths(cursor, -1))} className="h-7 w-7 grid place-items-center rounded hover:bg-secondary"><ChevronLeft className="h-3.5 w-3.5" /></button>
            <button onClick={() => { setCursor(new Date()); setSelected(new Date()); }} className="text-[10px] px-2 h-7 rounded hover:bg-secondary text-muted-foreground">сегодня</button>
            <button onClick={() => setCursor(addMonths(cursor, 1))} className="h-7 w-7 grid place-items-center rounded hover:bg-secondary"><ChevronRight className="h-3.5 w-3.5" /></button>
          </div>
        </div>

        {/* Weekday labels */}
        <div className="grid grid-cols-7 px-3 pt-3 text-[10px] uppercase tracking-widest text-muted-foreground">
          {["пн", "вт", "ср", "чт", "пт", "сб", "вс"].map((w) => (
            <div key={w} className="text-center">{w}</div>
          ))}
        </div>

        {/* Month grid */}
        <div className="grid grid-cols-7 px-3 pb-3 pt-1 gap-1">
          {days.map((d) => {
            const inMonth = isSameMonth(d, cursor);
            const today = isToday(d);
            const isSel = selected && isSameDay(d, selected);
            const marked = hasMarks(d);
            return (
              <button
                key={d.toISOString()}
                onClick={() => setSelected(d)}
                className={`relative h-9 rounded-md text-xs transition-colors ${
                  isSel
                    ? "bg-primary text-primary-foreground"
                    : today
                    ? "bg-secondary text-foreground font-semibold"
                    : inMonth
                    ? "hover:bg-secondary text-foreground/90"
                    : "text-muted-foreground/40 hover:bg-secondary/50"
                }`}
              >
                {format(d, "d")}
                {marked && (
                  <span
                    className={`absolute bottom-1 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full ${
                      isSel ? "bg-primary-foreground" : "bg-[hsl(var(--stage-progress))]"
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Selected day list */}
        <div className="border-t border-border p-3 max-h-[200px] overflow-auto">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-1.5">
            <ListChecks className="h-3 w-3" />
            {format(selDay, "EEEE, d MMMM", { locale: ru })}
          </div>
          {selTasks.length === 0 && selAppts.length === 0 && (
            <div className="text-xs text-muted-foreground py-4 text-center">Дел нет ✦</div>
          )}
          {selAppts.map((a) => (
            <div key={a.id} className="flex items-center gap-2 p-2 rounded-md bg-secondary/40 hairline mb-1.5">
              <div className="h-6 w-6 rounded-md bg-[hsl(var(--stage-progress))]/25 grid place-items-center">
                <CalendarDays className="h-3 w-3" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-medium truncate">{a.title}</div>
                <div className="text-[10px] text-muted-foreground truncate">
                  {format(parseISO(a.start), "HH:mm")} · {a.clients.join(", ")}
                </div>
              </div>
            </div>
          ))}
          {selTasks.map((t) => (
            <div key={t.id} className="flex items-center gap-2 p-2 rounded-md bg-secondary/40 hairline mb-1.5">
              <div className="h-6 w-6 rounded-md bg-foreground text-background grid place-items-center">
                <ListChecks className="h-3 w-3" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-medium truncate">{t.title}</div>
                <div className="text-[10px] text-muted-foreground truncate">
                  {format(parseISO(t.due), "HH:mm")}{t.client ? ` · ${t.client}` : ""}
                </div>
              </div>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};
