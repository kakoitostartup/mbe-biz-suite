import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format, parseISO, isToday, isTomorrow, isAfter, startOfDay, addDays } from "date-fns";
import { ru } from "date-fns/locale";
import {
  Send, Trash2, MessageCircle, Phone, User as UserIcon, Plus, Filter, History,
} from "lucide-react";
import { SectionHeader, Widget } from "./ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  useServices, BookingStatus, Booking, statusLabel, statusTone,
} from "./servicesStore";
import { useStore } from "./store";

const phoneRe = /^\+?\d[\d\s()-]{6,}\d$/;

const bookingSchema = z.object({
  customerName: z.string().trim().min(2, "Минимум 2 символа").max(80),
  phone: z.string().trim().regex(phoneRe, "Введите корректный номер").max(32),
  serviceId: z.string().optional(),
  staffId: z.string().optional(),
  date: z.string().min(1, "Укажите дату"),
  time: z.string().min(1, "Укажите время"),
  status: z.enum(["planned", "arrived", "no_show", "done"]),
  note: z.string().max(500).optional(),
});

type BookingForm = z.infer<typeof bookingSchema>;

const buildWaLink = (phone: string, text: string) => {
  const digits = phone.replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
};

const companyName = "MBE Studio";

const renderTemplate = (b: Booking, services: { id: string; name: string }[]) => {
  const svc = services.find((s) => s.id === b.serviceId)?.name ?? "услуга";
  const d = parseISO(b.start);
  return `${b.customerName}, напоминаем, что у вас запись на ${format(d, "d MMMM", { locale: ru })} в ${format(d, "HH:mm")} (${svc}) в ${companyName}. Ждём вас!`;
};

const ymd = (d: Date) => format(d, "yyyy-MM-dd");

// ----- Create booking form widget -----
const BookingForm = ({ onCreated }: { onCreated?: () => void }) => {
  const { services, addBooking } = useServices();
  const { staff, customers, addCustomer } = useStore();

  const form = useForm<BookingForm>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      customerName: "",
      phone: "",
      serviceId: services[0]?.id,
      staffId: staff[0]?.id,
      date: ymd(new Date()),
      time: "12:00",
      status: "planned",
      note: "",
    },
  });

  const onSubmit = (v: BookingForm) => {
    // Link or create CRM customer by phone
    let customer = customers.find((c) => c.phone.replace(/\D/g, "") === v.phone.replace(/\D/g, ""));
    if (!customer) {
      customer = addCustomer({ phone: v.phone, name: v.customerName, note: "Создан из записи" });
    }
    const svc = services.find((s) => s.id === v.serviceId);
    addBooking({
      customerName: v.customerName,
      phone: v.phone,
      serviceId: v.serviceId,
      staffId: v.staffId,
      start: new Date(`${v.date}T${v.time}`).toISOString(),
      status: v.status,
      note: v.note,
      customerId: customer.id,
      price: svc?.price,
    });
    form.reset({ ...form.getValues(), customerName: "", phone: "", note: "" });
    onCreated?.();
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <Label>Имя клиента *</Label>
          <Input {...form.register("customerName")} placeholder="Анна Смирнова" />
          {form.formState.errors.customerName && (
            <p className="text-xs text-destructive mt-1">{form.formState.errors.customerName.message}</p>
          )}
        </div>
        <div>
          <Label>Телефон *</Label>
          <Input {...form.register("phone")} placeholder="+7 999 123 45 67" />
          {form.formState.errors.phone && (
            <p className="text-xs text-destructive mt-1">{form.formState.errors.phone.message}</p>
          )}
        </div>
        <div>
          <Label>Услуга</Label>
          <Select
            value={form.watch("serviceId")}
            onValueChange={(v) => form.setValue("serviceId", v)}
          >
            <SelectTrigger><SelectValue placeholder="Выберите услугу" /></SelectTrigger>
            <SelectContent>
              {services.map((s) => (
                <SelectItem key={s.id} value={s.id}>{s.name} · {s.price} ₽</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Сотрудник</Label>
          <Select
            value={form.watch("staffId")}
            onValueChange={(v) => form.setValue("staffId", v)}
          >
            <SelectTrigger><SelectValue placeholder="Выберите сотрудника" /></SelectTrigger>
            <SelectContent>
              {staff.map((s) => (
                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Дата</Label>
          <Input type="date" {...form.register("date")} />
        </div>
        <div>
          <Label>Время</Label>
          <Input type="time" {...form.register("time")} />
        </div>
        <div className="md:col-span-2">
          <Label>Статус</Label>
          <Select
            value={form.watch("status")}
            onValueChange={(v) => form.setValue("status", v as BookingStatus)}
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {(Object.keys(statusLabel) as BookingStatus[]).map((k) => (
                <SelectItem key={k} value={k}>{statusLabel[k]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="md:col-span-2">
          <Label>Заметка</Label>
          <Textarea {...form.register("note")} placeholder="Особенности, пожелания…" rows={2} />
        </div>
      </div>
      <Button type="submit" className="h-9">
        <Plus className="h-4 w-4 mr-1" /> Создать запись
      </Button>
    </form>
  );
};

// ----- WhatsApp broadcast modal -----
const BroadcastDialog = ({
  open, onOpenChange, defaultIds,
}: { open: boolean; onOpenChange: (b: boolean) => void; defaultIds?: string[] }) => {
  const { bookings, services } = useServices();
  const candidates = useMemo(() => {
    const today = startOfDay(new Date());
    const limit = addDays(today, 2);
    return bookings
      .filter((b) => b.status === "planned" && isAfter(parseISO(b.start), today) && parseISO(b.start) < limit);
  }, [bookings]);

  const [selected, setSelected] = useState<Record<string, boolean>>({});
  useMemo(() => {
    if (open) {
      const init: Record<string, boolean> = {};
      (defaultIds ?? candidates.map((c) => c.id)).forEach((id) => (init[id] = true));
      setSelected(init);
    }
  }, [open, defaultIds]);

  const send = () => {
    const list = bookings.filter((b) => selected[b.id]);
    list.forEach((b, i) => {
      const url = buildWaLink(b.phone, renderTemplate(b, services));
      setTimeout(() => window.open(url, "_blank"), i * 250);
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>Рассылка напоминаний в WhatsApp</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div className="text-xs text-muted-foreground">
            Шаблон: «{`{Имя}`}, напоминаем, что у вас запись на {`{дата}`} в {`{время}`} в {companyName}. Ждём вас!»
          </div>
          <div className="max-h-72 overflow-auto space-y-1 rounded-lg hairline bg-secondary/30 p-2">
            {candidates.length === 0 && (
              <div className="text-xs text-muted-foreground p-4 text-center">
                Нет запланированных записей на ближайшие 48 часов.
              </div>
            )}
            {candidates.map((b) => (
              <label key={b.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-secondary/60 cursor-pointer">
                <Checkbox
                  checked={!!selected[b.id]}
                  onCheckedChange={(c) => setSelected((s) => ({ ...s, [b.id]: !!c }))}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{b.customerName}</div>
                  <div className="text-[11px] text-muted-foreground">
                    {format(parseISO(b.start), "d MMM HH:mm", { locale: ru })} · {b.phone}
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Отмена</Button>
          <Button onClick={send} disabled={!Object.values(selected).some(Boolean)}>
            <Send className="h-4 w-4 mr-1" /> Отправить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ----- Customer history sheet -----
const HistoryDialog = ({
  customerId, open, onOpenChange,
}: { customerId: string | null; open: boolean; onOpenChange: (b: boolean) => void }) => {
  const { bookings, services } = useServices();
  const { customers } = useStore();
  const customer = customers.find((c) => c.id === customerId);
  const list = bookings
    .filter((b) => b.customerId === customerId)
    .sort((a, b) => +parseISO(b.start) - +parseISO(a.start));
  const total = list.reduce((s, b) => s + (b.price ?? 0), 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserIcon className="h-4 w-4" /> {customer?.name ?? "Клиент"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="text-xs text-muted-foreground flex items-center gap-2">
            <Phone className="h-3 w-3" /> {customer?.phone}
          </div>
          <div className="text-sm">
            Всего записей: <b>{list.length}</b> · Сумма: <b>{total.toLocaleString("ru-RU")} ₽</b>
          </div>
          <div className="max-h-72 overflow-auto rounded-lg hairline">
            <table className="w-full text-xs">
              <thead className="text-[11px] uppercase text-muted-foreground bg-secondary/40">
                <tr><th className="text-left p-2">Дата</th><th className="text-left p-2">Услуга</th><th className="text-right p-2">Сумма</th><th className="text-left p-2">Статус</th></tr>
              </thead>
              <tbody>
                {list.map((b) => (
                  <tr key={b.id} className="border-t border-border/40">
                    <td className="p-2">{format(parseISO(b.start), "d MMM HH:mm", { locale: ru })}</td>
                    <td className="p-2">{services.find((s) => s.id === b.serviceId)?.name ?? "—"}</td>
                    <td className="p-2 text-right">{(b.price ?? 0).toLocaleString("ru-RU")} ₽</td>
                    <td className="p-2"><span className={`px-2 py-0.5 rounded-full text-[10px] ${statusTone[b.status]}`}>{statusLabel[b.status]}</span></td>
                  </tr>
                ))}
                {list.length === 0 && (
                  <tr><td colSpan={4} className="p-6 text-center text-muted-foreground">Записей пока нет</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ----- Bookings list widget -----
const BookingsList = () => {
  const { bookings, services, updateBooking, removeBooking } = useServices();
  const { staff } = useStore();
  const [fStatus, setFStatus] = useState<"all" | BookingStatus>("all");
  const [fStaff, setFStaff] = useState<string>("all");
  const [fFrom, setFFrom] = useState<string>("");
  const [fTo, setFTo] = useState<string>("");
  const [historyId, setHistoryId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return bookings
      .filter((b) => fStatus === "all" || b.status === fStatus)
      .filter((b) => fStaff === "all" || b.staffId === fStaff)
      .filter((b) => !fFrom || parseISO(b.start) >= parseISO(`${fFrom}T00:00`))
      .filter((b) => !fTo || parseISO(b.start) <= parseISO(`${fTo}T23:59`))
      .sort((a, b) => +parseISO(a.start) - +parseISO(b.start));
  }, [bookings, fStatus, fStaff, fFrom, fTo]);

  return (
    <>
      <div className="flex items-center gap-2 flex-wrap mb-3">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <Select value={fStatus} onValueChange={(v) => setFStatus(v as typeof fStatus)}>
          <SelectTrigger className="w-44 h-8"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все статусы</SelectItem>
            {(Object.keys(statusLabel) as BookingStatus[]).map((k) => (
              <SelectItem key={k} value={k}>{statusLabel[k]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={fStaff} onValueChange={setFStaff}>
          <SelectTrigger className="w-48 h-8"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все сотрудники</SelectItem>
            {staff.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Input type="date" value={fFrom} onChange={(e) => setFFrom(e.target.value)} className="h-8 w-40" />
        <Input type="date" value={fTo} onChange={(e) => setFTo(e.target.value)} className="h-8 w-40" />
      </div>

      <div className="rounded-lg hairline overflow-auto">
        <table className="w-full text-sm">
          <thead className="text-[11px] uppercase text-muted-foreground bg-secondary/40">
            <tr>
              <th className="text-left p-3">Клиент</th>
              <th className="text-left p-3">Телефон</th>
              <th className="text-left p-3">Услуга</th>
              <th className="text-left p-3">Сотрудник</th>
              <th className="text-left p-3">Дата/время</th>
              <th className="text-left p-3">Статус</th>
              <th className="text-right p-3">Действия</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((b) => {
              const d = parseISO(b.start);
              const dlabel = isToday(d) ? `Сегодня · ${format(d, "HH:mm")}` :
                isTomorrow(d) ? `Завтра · ${format(d, "HH:mm")}` :
                format(d, "d MMM HH:mm", { locale: ru });
              return (
                <tr key={b.id} className="border-t border-border/40 hover:bg-secondary/30">
                  <td className="p-3">
                    <button className="font-medium hover:underline" onClick={() => setHistoryId(b.customerId ?? null)}>
                      {b.customerName}
                    </button>
                  </td>
                  <td className="p-3 text-muted-foreground">{b.phone}</td>
                  <td className="p-3">{services.find((s) => s.id === b.serviceId)?.name ?? "—"}</td>
                  <td className="p-3 text-muted-foreground">{staff.find((s) => s.id === b.staffId)?.name ?? "—"}</td>
                  <td className="p-3">{dlabel}</td>
                  <td className="p-3">
                    <Select value={b.status} onValueChange={(v) => updateBooking(b.id, { status: v as BookingStatus })}>
                      <SelectTrigger className={`h-7 w-36 text-xs border-0 ${statusTone[b.status]}`}><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {(Object.keys(statusLabel) as BookingStatus[]).map((k) => (
                          <SelectItem key={k} value={k}>{statusLabel[k]}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="p-3 text-right">
                    <a
                      href={buildWaLink(b.phone, renderTemplate(b, services))}
                      target="_blank" rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25"
                    >
                      <MessageCircle className="h-3 w-3" /> WhatsApp
                    </a>
                    <Button size="icon" variant="ghost" className="h-7 w-7 ml-1" onClick={() => removeBooking(b.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">Нет записей по выбранным фильтрам</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <HistoryDialog customerId={historyId} open={!!historyId} onOpenChange={(b) => !b && setHistoryId(null)} />
    </>
  );
};

// ----- Page wrappers -----
export const BookingsPage = ({ focus }: { focus?: "list" | "new" | "broadcast" }) => {
  const [broadcastOpen, setBroadcastOpen] = useState(focus === "broadcast");

  if (focus === "new") {
    return (
      <div className="fade-in space-y-4">
        <SectionHeader title="Создать запись" subtitle="Зафиксируйте нового клиента и забронируйте время." />
        <Widget id="bookings.form" title="Новая запись">
          <BookingForm />
        </Widget>
      </div>
    );
  }

  return (
    <div className="fade-in space-y-4">
      <SectionHeader
        title="Записи"
        subtitle="Все будущие и прошедшие записи клиентов."
        action={
          <Button onClick={() => setBroadcastOpen(true)} className="h-9">
            <Send className="h-4 w-4 mr-1" /> Отправить напоминания
          </Button>
        }
      />
      <Widget id="bookings.form" title="Быстрая запись клиента" defaultCollapsed>
        <BookingForm />
      </Widget>
      <Widget id="bookings.list" title="Список записей" subtitle="Отсортировано по ближайшим">
        <BookingsList />
      </Widget>
      <Widget id="bookings.history" title="История клиентов" subtitle="Нажмите на имя клиента в таблице">
        <div className="text-xs text-muted-foreground flex items-center gap-2">
          <History className="h-4 w-4" /> Клик по имени в списке откроет карточку с историей записей и суммой трат.
        </div>
      </Widget>

      <BroadcastDialog open={broadcastOpen} onOpenChange={setBroadcastOpen} />
    </div>
  );
};
