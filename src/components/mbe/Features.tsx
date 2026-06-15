import { useState } from "react";
import { useStore } from "./store";
import { Panel, SectionHeader, Stat } from "./ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Plus, Settings2, Pencil, Mail, Gift, History, Tags, Search, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { format, parseISO } from "date-fns";
import { toast } from "@/hooks/use-toast";

// ─── Finance: add transaction (sale or expense) ───────────────────────────
export const AddTransactionForm = ({ defaultType }: { defaultType: "income" | "expense" }) => {
  const { addTransaction } = useStore();
  const [label, setLabel] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const isIncome = defaultType === "income";
  return (
    <div className="fade-in max-w-xl">
      <SectionHeader
        title={isIncome ? "Добавить продажу" : "Добавить расход"}
        subtitle={isIncome ? "Зафиксировать поступление денег." : "Учесть расход вне POS."}
      />
      <Panel>
        <div className="space-y-3">
          <div><Label>Описание</Label><Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder={isIncome ? "Клиент — услуга" : "Аренда, доставка…"} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Сумма</Label><Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} /></div>
            <div><Label>Категория</Label><Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder={isIncome ? "Услуги" : "Аренда"} /></div>
          </div>
          <Button className="w-full h-10 mt-2" onClick={() => {
            if (!label || !amount) return;
            addTransaction({
              label, amount: Number(amount), type: defaultType,
              date: new Date().toISOString(), category,
              receipt: isIncome ? `RCPT-${1000 + Math.floor(Math.random() * 9000)}` : undefined,
            });
            setLabel(""); setAmount(""); setCategory("");
            toast({ title: isIncome ? "Продажа добавлена" : "Расход добавлен" });
          }}>
            <Plus className="h-4 w-4 mr-1" /> Сохранить
          </Button>
        </div>
      </Panel>
    </div>
  );
};

// ─── Finance categories stub ──────────────────────────────────────────────
export const FinanceCategories = () => {
  const { transactions } = useStore();
  const cats = Array.from(new Set(transactions.map((t) => t.category).filter(Boolean))) as string[];
  return (
    <div className="fade-in max-w-2xl">
      <SectionHeader title="Категории" subtitle="Категории доходов и расходов." />
      <Panel>
        <div className="text-xs uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2"><Tags className="h-3 w-3" /> Используются</div>
        {cats.length === 0 ? (
          <div className="text-xs text-muted-foreground py-6 text-center">Категорий пока нет.</div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {cats.map((c) => <span key={c} className="text-xs px-3 py-1.5 rounded-full bg-secondary">{c}</span>)}
          </div>
        )}
      </Panel>
    </div>
  );
};

// ─── CRM: customers list ─────────────────────────────────────────────────
export const CustomersList = () => {
  const { customers, deals } = useStore();
  const [q, setQ] = useState("");
  const filtered = customers.filter((c) =>
    (c.name || "").toLowerCase().includes(q.toLowerCase()) || c.phone.includes(q)
  );
  return (
    <div className="fade-in">
      <SectionHeader title="Клиенты" subtitle={`Всего: ${customers.length}`} />
      <Panel>
        <div className="relative mb-3">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Поиск по имени или телефону…" className="pl-9 h-9 bg-secondary border-transparent" />
        </div>
        <div className="space-y-2">
          {filtered.map((c) => {
            const cDeals = deals.filter((d) => d.client === c.name);
            return (
              <div key={c.id} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/40 hairline">
                <div className="h-9 w-9 rounded-full bg-foreground text-background grid place-items-center text-xs font-semibold">
                  {(c.name || c.phone).slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{c.name || c.phone}</div>
                  <div className="text-[11px] text-muted-foreground truncate">{c.phone}{c.note ? ` • ${c.note}` : ""}</div>
                </div>
                <div className="text-[11px] text-muted-foreground">{cDeals.length} сделок</div>
              </div>
            );
          })}
          {filtered.length === 0 && <div className="text-xs text-muted-foreground py-6 text-center">Ничего не найдено.</div>}
        </div>
      </Panel>
    </div>
  );
};

// ─── CRM: add customer ───────────────────────────────────────────────────
export const AddCustomerForm = () => {
  const { addCustomer } = useStore();
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  return (
    <div className="fade-in max-w-xl">
      <SectionHeader title="Добавить клиента" subtitle="Карточка клиента для CRM и бонусной программы." />
      <Panel>
        <div className="space-y-3">
          <div><Label>Телефон</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+7 …" /></div>
          <div><Label>Имя</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div><Label>Заметка</Label><Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Аллергии, предпочтения…" /></div>
          <Button className="w-full h-10 mt-2" disabled={!phone} onClick={() => {
            addCustomer({ phone, name, note });
            setPhone(""); setName(""); setNote("");
            toast({ title: "Клиент добавлен" });
          }}><Plus className="h-4 w-4 mr-1" /> Создать</Button>
        </div>
      </Panel>
    </div>
  );
};

// ─── CRM: add deal ───────────────────────────────────────────────────────
export const AddDealForm = () => {
  const { stages, addDeal } = useStore();
  const [form, setForm] = useState({ client: "", title: "", amount: "", stageId: stages[0]?.id ?? "new" });
  return (
    <div className="fade-in max-w-xl">
      <SectionHeader title="Добавить сделку" subtitle="Новая сделка попадёт в воронку CRM." />
      <Panel>
        <div className="space-y-3">
          <div><Label>Клиент</Label><Input value={form.client} onChange={(e) => setForm({ ...form, client: e.target.value })} /></div>
          <div><Label>Название</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Сумма</Label><Input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} /></div>
            <div>
              <Label>Этап</Label>
              <Select value={form.stageId} onValueChange={(v) => setForm({ ...form, stageId: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{stages.map((s) => <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <Button className="w-full h-10 mt-2" disabled={!form.client} onClick={() => {
            addDeal({ client: form.client, title: form.title || "Без названия", amount: Number(form.amount) || 0, stageId: form.stageId });
            setForm({ client: "", title: "", amount: "", stageId: stages[0]?.id });
            toast({ title: "Сделка создана" });
          }}><Plus className="h-4 w-4 mr-1" /> Создать</Button>
        </div>
      </Panel>
    </div>
  );
};

// ─── CRM: stages editor ──────────────────────────────────────────────────
const COLORS = [
  { id: "stage-new", label: "Красный" },
  { id: "stage-progress", label: "Жёлтый" },
  { id: "stage-noresponse", label: "Оранжевый" },
  { id: "stage-completed", label: "Зелёный" },
  { id: "stage-lost", label: "Бордовый" },
];
export const StagesEditor = () => {
  const { stages, updateStage, addStage, removeStage } = useStore();
  return (
    <div className="fade-in max-w-2xl">
      <SectionHeader title="Настройка статусов" subtitle="Этапы воронки CRM, их цвета и порядок." />
      <Panel>
        <div className="space-y-2">
          {stages.map((s) => (
            <div key={s.id} className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full shrink-0" style={{ background: `hsl(var(--${s.color}))` }} />
              <Input value={s.label} onChange={(e) => updateStage(s.id, { label: e.target.value })} className="h-8 text-xs" />
              <Select value={s.color} onValueChange={(v) => updateStage(s.id, { color: v })}>
                <SelectTrigger className="h-8 w-[130px] text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>{COLORS.map((c) => <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>)}</SelectContent>
              </Select>
              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => removeStage(s.id)}><Pencil className="h-3 w-3" /></Button>
            </div>
          ))}
        </div>
        <Button variant="secondary" className="w-full mt-3 h-8" onClick={addStage}>
          <Plus className="h-3 w-3 mr-1" /> Добавить этап
        </Button>
      </Panel>
    </div>
  );
};

// ─── POS: sales history ──────────────────────────────────────────────────
export const SalesHistory = () => {
  const { receipts, paymentMethods } = useStore();
  return (
    <div className="fade-in">
      <SectionHeader title="История продаж" subtitle={`${receipts.length} чеков`} />
      <Panel>
        <div className="space-y-2">
          {receipts.map((r) => {
            const pm = paymentMethods.find((p) => p.id === r.paymentMethodId);
            return (
              <div key={r.id} className={`flex items-center gap-3 p-3 rounded-lg ${r.voided ? "bg-destructive/5 line-through opacity-60" : "bg-secondary/40"} hairline`}>
                <div className="h-9 w-9 rounded-lg bg-foreground text-background grid place-items-center"><History className="h-4 w-4" /></div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{r.number} · {r.lines.length} позиций</div>
                  <div className="text-[11px] text-muted-foreground truncate">
                    {format(parseISO(r.createdAt), "d MMM HH:mm")}{pm ? ` • ${pm.label}` : ""}
                  </div>
                </div>
                <div className="text-sm font-semibold tabular-nums">${r.total.toFixed(2)}</div>
              </div>
            );
          })}
          {receipts.length === 0 && <div className="text-xs text-muted-foreground py-8 text-center">Чеков пока нет.</div>}
        </div>
      </Panel>
    </div>
  );
};

// ─── POS: loyalty cards ──────────────────────────────────────────────────
export const Loyalty = () => {
  const { customers } = useStore();
  return (
    <div className="fade-in">
      <SectionHeader title="Бонусные карты" subtitle="Карты лояльности привязаны к клиентам CRM по номеру телефона." />
      <Panel>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {customers.map((c) => (
            <div key={c.id} className="rounded-xl bg-gradient-to-br from-foreground to-foreground/70 text-background p-4">
              <div className="flex items-center justify-between">
                <div className="text-[10px] uppercase tracking-widest opacity-70">Бонусная карта</div>
                <Gift className="h-4 w-4 opacity-80" />
              </div>
              <div className="mt-3 font-medium">{c.name || "—"}</div>
              <div className="text-xs opacity-80">{c.phone}</div>
              <div className="mt-3 text-[11px] opacity-70">с {format(parseISO(c.createdAt), "MMM yyyy")}</div>
            </div>
          ))}
          {customers.length === 0 && <div className="col-span-full text-xs text-muted-foreground py-8 text-center">Карт нет — добавьте клиента в CRM.</div>}
        </div>
      </Panel>
    </div>
  );
};

// ─── Tasks: quick add ────────────────────────────────────────────────────
export const AddTaskForm = () => {
  const { addTask } = useStore();
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [time, setTime] = useState("12:00");
  return (
    <div className="fade-in max-w-xl">
      <SectionHeader title="Добавить задачу" subtitle="Назначьте дедлайн и время." />
      <Panel>
        <div className="space-y-3">
          <div><Label>Задача</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Что нужно сделать?" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Дата</Label><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
            <div><Label>Время</Label><Input type="time" value={time} onChange={(e) => setTime(e.target.value)} /></div>
          </div>
          <Button className="w-full h-10 mt-2" disabled={!title} onClick={() => {
            addTask({ title, due: new Date(`${date}T${time}`).toISOString() });
            setTitle("");
            toast({ title: "Задача добавлена" });
          }}><Plus className="h-4 w-4 mr-1" /> Добавить</Button>
        </div>
      </Panel>
    </div>
  );
};

// ─── Staff: invites ──────────────────────────────────────────────────────
export const StaffInvites = () => {
  const [email, setEmail] = useState("");
  return (
    <div className="fade-in max-w-xl">
      <SectionHeader title="Приглашения" subtitle="Пригласите сотрудника по e-mail." />
      <Panel>
        <div className="space-y-3">
          <div><Label>E-mail сотрудника</Label><Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@company.com" /></div>
          <Button className="w-full h-10" disabled={!email} onClick={() => {
            toast({ title: "Приглашение отправлено", description: email });
            setEmail("");
          }}><Mail className="h-4 w-4 mr-1" /> Отправить приглашение</Button>
        </div>
      </Panel>
    </div>
  );
};
