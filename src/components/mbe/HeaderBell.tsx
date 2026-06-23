import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Bell, CalendarCheck, Package, ListChecks, X, Check } from "lucide-react";
import { format, formatDistanceToNow, parseISO } from "date-fns";
import { ru } from "date-fns/locale";
import { useNotifications, type NotificationType } from "./notificationsStore";

const typeMeta: Record<NotificationType, { Icon: typeof Bell; tone: string; label: string }> = {
  booking:   { Icon: CalendarCheck, tone: "text-sky-400 bg-sky-500/10",      label: "Запись" },
  inventory: { Icon: Package,       tone: "text-amber-400 bg-amber-500/10",  label: "Склад"  },
  task:      { Icon: ListChecks,    tone: "text-rose-400 bg-rose-500/10",    label: "Задача" },
};

export const HeaderBell = () => {
  const { items, markAllRead, remove } = useNotifications();
  const [open, setOpen] = useState(false);
  const unread = items.filter((i) => !i.read).length;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="relative h-9 w-9 rounded-lg bg-secondary grid place-items-center hover:bg-accent transition-colors">
          <Bell className="h-4 w-4" />
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full bg-destructive text-destructive-foreground text-[9px] grid place-items-center font-semibold">
              {unread}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[360px] p-0" align="end">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <div className="text-sm font-semibold">Уведомления</div>
          {items.length > 0 && (
            <button
              className="text-[11px] text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
              onClick={markAllRead}
            >
              <Check className="h-3 w-3" /> Прочитано
            </button>
          )}
        </div>

        <div className="max-h-[420px] overflow-auto">
          {items.length === 0 ? (
            <div className="text-xs text-muted-foreground py-10 text-center">
              Новых уведомлений нет
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {items.map((n) => {
                const meta = typeMeta[n.type];
                const d = parseISO(n.date);
                return (
                  <li
                    key={n.id}
                    className="group flex items-start gap-3 px-4 py-3 hover:bg-secondary/40 transition-colors"
                  >
                    <div className={`h-8 w-8 rounded-lg grid place-items-center shrink-0 ${meta.tone}`}>
                      <meta.Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[11px] uppercase tracking-widest text-muted-foreground">
                        {meta.label}
                      </div>
                      <div className="text-sm leading-snug">{n.text}</div>
                      <div className="text-[11px] text-muted-foreground mt-1">
                        {format(d, "d MMM, HH:mm", { locale: ru })} ·{" "}
                        {formatDistanceToNow(d, { addSuffix: true, locale: ru })}
                      </div>
                    </div>
                    <button
                      onClick={() => remove(n.id)}
                      className="opacity-0 group-hover:opacity-100 h-6 w-6 rounded-md grid place-items-center text-muted-foreground hover:bg-secondary hover:text-foreground transition"
                      aria-label="Удалить"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};
