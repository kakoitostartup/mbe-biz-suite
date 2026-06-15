import { useMemo, useState } from "react";
import { useStore } from "./store";
import { Panel, SectionHeader, Stat } from "./ui";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Download, FileBarChart2, ClipboardCheck, AlertTriangle, Package } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { parseISO, isToday, isThisWeek, isThisMonth, isThisYear, subDays, isAfter, format, startOfDay } from "date-fns";

type Period = "day" | "week" | "month" | "halfyear" | "year";

const LABELS: Record<Period, string> = { day: "Today", week: "This week", month: "This month", halfyear: "Last 6 months", year: "This year" };

export const Reports = ({ focus = "overview" }: { focus?: "overview" | "revision" | "sales" }) => {
  const { receipts, transactions, deals } = useStore();
  const [period, setPeriod] = useState<Period>("week");
  const [auditOpen, setAuditOpen] = useState(focus === "revision");

  const inPeriod = (iso: string) => {
    const d = parseISO(iso);
    if (period === "day") return isToday(d);
    if (period === "week") return isThisWeek(d, { weekStartsOn: 1 });
    if (period === "month") return isThisMonth(d);
    if (period === "halfyear") return isAfter(d, subDays(new Date(), 183));
    return isThisYear(d);
  };

  const periodReceipts = receipts.filter((r) => !r.voided && inPeriod(r.createdAt));
  const periodExpenses = transactions.filter((t) => t.type === "expense" && inPeriod(t.date));
  const periodIncome = transactions.filter((t) => t.type === "income" && inPeriod(t.date));
  const completedDeals = deals.filter((d) => d.stageId === "completed" && inPeriod(d.createdAt));

  const revenue = periodIncome.reduce((s, t) => s + t.amount, 0);
  const expense = periodExpenses.reduce((s, t) => s + t.amount, 0);
  const profit = revenue - expense;

  const chart = useMemo(() => {
    const buckets = period === "day" ? 24 : period === "week" ? 7 : period === "month" ? 30 : period === "halfyear" ? 26 : 12;
    const arr: { label: string; revenue: number; expense: number }[] = [];
    for (let i = buckets - 1; i >= 0; i--) {
      let label = ""; let from = 0; let to = 0;
      if (period === "day") {
        const h = new Date(); h.setHours(h.getHours() - i, 0, 0, 0);
        from = h.getTime(); to = from + 3600_000; label = format(h, "HH:00");
      } else if (period === "week" || period === "month") {
        const d = subDays(new Date(), i); from = startOfDay(d).getTime(); to = from + 86400000; label = format(d, period === "week" ? "EEE" : "d MMM");
      } else if (period === "halfyear") {
        const d = subDays(new Date(), i * 7); from = startOfDay(d).getTime(); to = from + 7 * 86400000; label = format(d, "d MMM");
      } else {
        const m = new Date(); m.setMonth(m.getMonth() - i, 1); m.setHours(0, 0, 0, 0); from = m.getTime();
        const next = new Date(m); next.setMonth(next.getMonth() + 1); to = next.getTime(); label = format(m, "MMM");
      }
      const rev = receipts.filter((r) => !r.voided).filter((r) => { const t = parseISO(r.createdAt).getTime(); return t >= from && t < to; }).reduce((s, r) => s + r.total, 0);
      const exp = transactions.filter((t) => t.type === "expense").filter((t) => { const tt = parseISO(t.date).getTime(); return tt >= from && tt < to; }).reduce((s, t) => s + t.amount, 0);
      arr.push({ label, revenue: rev, expense: exp });
    }
    return arr;
  }, [period, receipts, transactions]);

  const exportCSV = () => {
    const rows = [["Type", "Date", "Label", "Amount"]];
    periodIncome.forEach((t) => rows.push(["income", t.date, t.label, String(t.amount)]));
    periodExpenses.forEach((t) => rows.push(["expense", t.date, t.label, String(t.amount)]));
    const csv = rows.map((r) => r.map((x) => `"${x.replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `report-${period}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fade-in">
      <SectionHeader
        title={focus === "sales" ? "Отчёт по продажам" : focus === "revision" ? "Ревизия склада" : "Отчёты"}
        subtitle="Срезы по дню, неделе, месяцу, полугодию и году."
        action={
          <Button variant="secondary" className="h-9" onClick={exportCSV}><Download className="h-4 w-4 mr-1" /> Экспорт CSV</Button>
        }
      />

      <div className="flex flex-wrap gap-1 mb-5 p-1 rounded-lg bg-secondary/50 w-fit hairline">
        {(["day", "week", "month", "halfyear", "year"] as Period[]).map((p) => (
          <button key={p} onClick={() => setPeriod(p)}
            className={`px-3 h-8 text-xs rounded-md transition-all ${period === p ? "bg-primary text-primary-foreground" : "hover:bg-secondary text-muted-foreground"}`}>
            {LABELS[p]}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Stat label="Revenue" value={`$${revenue.toFixed(2)}`} delta={`${periodReceipts.length} receipts`} />
        <Stat label="Expenses" value={`$${expense.toFixed(2)}`} delta={`${periodExpenses.length} entries`} />
        <Stat label="Net profit" value={`${profit >= 0 ? "+" : "−"}$${Math.abs(profit).toFixed(2)}`} delta={profit >= 0 ? "in the green" : "in the red"} />
        <Stat label="Deals closed" value={`${completedDeals.length}`} delta={`$${completedDeals.reduce((s, d) => s + d.amount, 0).toLocaleString()}`} />
      </div>

      <Panel>
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm font-medium flex items-center gap-2"><FileBarChart2 className="h-4 w-4" /> Revenue vs expenses · {LABELS[period]}</div>
        </div>
        <div className="h-[320px]">
          <ResponsiveContainer>
            <BarChart data={chart} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 11 }}
                formatter={(v: number, n) => [`$${v.toFixed(2)}`, n as string]} />
              <Bar dataKey="revenue" fill="hsl(var(--foreground))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expense" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      <AuditDialog open={auditOpen} onOpenChange={setAuditOpen} />
    </div>
  );
};

const AuditDialog = ({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) => {
  const { inventory, receipts } = useStore();

  // Compute consumed quantities from POS receipts (via recipes when present)
  const consumed = useMemo(() => {
    const map = new Map<string, number>();
    receipts.filter((r) => !r.voided).forEach((r) => {
      r.lines.forEach((l) => {
        const item = inventory.find((i) => i.id === l.itemId);
        if (!item) return;
        if (item.recipe?.length) {
          item.recipe.forEach((ri) => map.set(ri.itemId, (map.get(ri.itemId) || 0) + ri.qty * l.qty));
        } else {
          map.set(l.itemId, (map.get(l.itemId) || 0) + l.qty);
        }
      });
    });
    return map;
  }, [inventory, receipts]);

  const rows = inventory.filter((i) => !i.isProduct).map((i) => {
    const used = consumed.get(i.id) || 0;
    const expected = Math.max(0, i.stock); // theoretical remaining
    const startOfPeriod = i.stock + used; // back-compute starting stock
    const isLow = i.stock <= i.threshold;
    return { i, used, startOfPeriod, expected, isLow };
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><ClipboardCheck className="h-4 w-4" /> Ревизия / Stocktake</DialogTitle>
        </DialogHeader>
        <div className="text-xs text-muted-foreground mb-3">
          Calculated from POS sales × tech cards. Compare the “Expected” column with a physical count to spot shrinkage.
        </div>
        <div className="rounded-lg hairline divide-y divide-border">
          <div className="grid grid-cols-[1fr_70px_70px_70px_80px] gap-2 px-3 py-2 text-[10px] uppercase tracking-widest text-muted-foreground bg-secondary/40">
            <div>Item</div><div className="text-right">Start</div><div className="text-right">Used</div><div className="text-right">Expected</div><div className="text-right">Status</div>
          </div>
          {rows.map(({ i, used, startOfPeriod, expected, isLow }) => (
            <div key={i.id} className="grid grid-cols-[1fr_70px_70px_70px_80px] gap-2 px-3 py-2 items-center text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <Package className="h-3.5 w-3.5 text-muted-foreground" />
                <div className="truncate">{i.name} <span className="text-muted-foreground text-[10px]">{i.unit}</span></div>
              </div>
              <div className="text-right tabular-nums text-muted-foreground">{startOfPeriod}</div>
              <div className="text-right tabular-nums">−{used}</div>
              <div className="text-right tabular-nums font-semibold">{expected}</div>
              <div className="text-right">
                {isLow ? (
                  <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-destructive/15 text-destructive">
                    <AlertTriangle className="h-2.5 w-2.5" /> low
                  </span>
                ) : (
                  <span className="text-[10px] text-muted-foreground">ok</span>
                )}
              </div>
            </div>
          ))}
          {rows.length === 0 && <div className="text-xs text-muted-foreground py-8 text-center">No stock items.</div>}
        </div>
      </DialogContent>
    </Dialog>
  );
};
