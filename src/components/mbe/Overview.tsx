import { useMemo } from "react";
import { useServices } from "./servicesStore";
import { useStore } from "./store";
import { useNav } from "./navStore";
import { SectionHeader, Widget, Stat } from "./ui";
import { format, parseISO, isToday, isTomorrow, startOfDay, isAfter, differenceInDays } from "date-fns";
import { ru } from "date-fns/locale";
import { CalendarCheck, Briefcase, TrendingUp, Users, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Overview = () => {
  const { bookings, projects, services } = useServices();
  const { transactions, customers } = useStore();
  const { setModule } = useNav();

  const today = startOfDay(new Date());

  const upcomingBookings = useMemo(
    () =>
      bookings
        .filter((b) => isAfter(parseISO(b.start), today) && b.status === "planned")
        .sort((a, b) => +parseISO(a.start) - +parseISO(b.start))
        .slice(0, 6),
    [bookings, today]
  );

  const activeProjects = projects.filter((p) => p.status === "active");

  const todayRevenue = useMemo(() => {
    const sumTx = transactions
      .filter((t) => t.type === "income" && isToday(parseISO(t.date)))
      .reduce((s, t) => s + t.amount, 0);
    const sumBk = bookings
      .filter((b) => b.status === "done" && isToday(parseISO(b.start)))
      .reduce((s, b) => s + (b.price ?? 0), 0);
    return sumTx + sumBk;
  }, [transactions, bookings]);

  return (
    <div className="space-y-6 fade-in">
      <SectionHeader title="Обзор" subtitle="Главное о вашем бизнесе за сегодня." />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat label="Выручка сегодня" value={`${todayRevenue.toLocaleString("ru-RU")} ₽`} delta="Записи + ручные доходы" />
        <Stat label="Ближайшие записи" value={String(upcomingBookings.length)} delta="Запланировано" />
        <Stat label="Активные проекты" value={String(activeProjects.length)} delta={`Всего: ${projects.length}`} />
        <Stat label="Клиенты в базе" value={String(customers.length)} delta="CRM" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Widget
          id="overview.bookings"
          className="lg:col-span-2"
          title={<span className="inline-flex items-center gap-2"><CalendarCheck className="h-4 w-4" /> Ближайшие записи</span>}
          subtitle={`${upcomingBookings.length} запланировано`}
          action={
            <Button size="sm" variant="ghost" onClick={() => setModule("bookings")}>
              Все записи <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          }
        >
          {upcomingBookings.length === 0 ? (
            <div className="text-sm text-muted-foreground py-6 text-center">На ближайшее время записей нет.</div>
          ) : (
            <div className="space-y-2">
              {upcomingBookings.map((b) => {
                const d = parseISO(b.start);
                const label = isToday(d) ? `Сегодня · ${format(d, "HH:mm")}` :
                  isTomorrow(d) ? `Завтра · ${format(d, "HH:mm")}` :
                  format(d, "d MMM HH:mm", { locale: ru });
                return (
                  <div key={b.id} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/40 hairline">
                    <div className="h-9 w-9 rounded-lg bg-primary/15 text-primary grid place-items-center text-xs font-semibold">
                      {b.customerName.slice(0, 1).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{b.customerName}</div>
                      <div className="text-[11px] text-muted-foreground truncate">
                        {services.find((s) => s.id === b.serviceId)?.name ?? "—"} · {b.phone}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground whitespace-nowrap">{label}</div>
                  </div>
                );
              })}
            </div>
          )}
        </Widget>

        <Widget
          id="overview.projects"
          title={<span className="inline-flex items-center gap-2"><Briefcase className="h-4 w-4" /> Активные проекты</span>}
          subtitle={`${activeProjects.length}`}
          action={
            <Button size="sm" variant="ghost" onClick={() => setModule("tasks")}>
              К проектам <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          }
        >
          {activeProjects.length === 0 ? (
            <div className="text-sm text-muted-foreground py-6 text-center">Активных проектов нет.</div>
          ) : (
            <div className="space-y-2">
              {activeProjects.slice(0, 5).map((p) => {
                const dleft = differenceInDays(parseISO(p.deadline), new Date());
                return (
                  <div key={p.id} className="p-3 rounded-lg bg-secondary/40 hairline">
                    <div className="text-sm font-medium truncate">{p.name}</div>
                    <div className="text-[11px] text-muted-foreground">
                      {dleft >= 0 ? `${dleft} дн. до дедлайна` : `Просрочено ${Math.abs(dleft)} дн.`}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Widget>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Widget
          id="overview.revenue"
          title={<span className="inline-flex items-center gap-2"><TrendingUp className="h-4 w-4" /> Выручка</span>}
          subtitle="Сегодня"
        >
          <div className="text-4xl font-semibold">{todayRevenue.toLocaleString("ru-RU")} ₽</div>
          <div className="text-xs text-muted-foreground mt-1">Учитываются завершённые записи и ручные доходы.</div>
        </Widget>
        <Widget
          id="overview.clients"
          title={<span className="inline-flex items-center gap-2"><Users className="h-4 w-4" /> Клиенты</span>}
        >
          <div className="text-4xl font-semibold">{customers.length}</div>
          <div className="text-xs text-muted-foreground mt-1">Всего в базе CRM.</div>
        </Widget>
      </div>
    </div>
  );
};
