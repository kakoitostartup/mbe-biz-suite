import { useEffect, useState } from "react";
import { useStore } from "./store";
import { Panel, SectionHeader, Stat } from "./ui";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Coffee, Clock, MessageSquare, Check, X, AlertTriangle } from "lucide-react";
import { differenceInSeconds, parseISO } from "date-fns";
import { toast } from "@/hooks/use-toast";

const fmtElapsed = (sec: number) => {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  if (m >= 60) return `${Math.floor(m / 60)}h ${m % 60}m`;
  return `${m}:${String(s).padStart(2, "0")}`;
};

export const LiveOrders = () => {
  const { heldOrders, removeHeldOrder, updateHeldOrder, checkoutOrder, customers, settings } = useStore();
  const [, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((x) => x + 1), 1000);
    return () => clearInterval(id);
  }, []);

  if (!settings.liveOrdersEnabled) {
    return (
      <div className="fade-in">
        <SectionHeader title="Live orders" subtitle="Real-time kitchen & bar dashboard." />
        <Panel className="text-center py-12">
          <div className="text-sm text-muted-foreground">Live orders dashboard is disabled.</div>
          <div className="text-xs text-muted-foreground mt-1">Enable it in Settings → Live orders dashboard.</div>
        </Panel>
      </div>
    );
  }

  const sorted = [...heldOrders].sort((a, b) => +parseISO(a.createdAt) - +parseISO(b.createdAt));
  const urgent = sorted.filter((o) => differenceInSeconds(new Date(), parseISO(o.createdAt)) > 600).length;

  return (
    <div className="fade-in">
      <SectionHeader
        title="Live orders"
        subtitle="Open POS orders, with timers and prep comments — geared for coffee shops & restaurants."
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Stat label="Open orders" value={`${sorted.length}`} delta="held in POS" />
        <Stat label="Items in queue" value={`${sorted.reduce((s, o) => s + o.lines.reduce((a, l) => a + l.qty, 0), 0)}`} />
        <Stat label="Over 10 min" value={`${urgent}`} delta={urgent ? "speed up" : "on time"} />
        <Stat label="Auto-refresh" value="1 s" delta="live tick" />
      </div>

      {sorted.length === 0 ? (
        <Panel className="text-center py-12">
          <div className="text-sm text-muted-foreground">No open orders right now.</div>
          <div className="text-xs text-muted-foreground mt-1">Held POS orders appear here in real time.</div>
        </Panel>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {sorted.map((o) => {
            const sec = differenceInSeconds(new Date(), parseISO(o.createdAt));
            const danger = sec > 600;
            const warn = sec > 300 && !danger;
            const cust = customers.find((c) => c.id === o.customerId);
            return (
              <Panel key={o.id} className={`relative ${danger ? "border border-destructive/40" : ""}`}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`h-9 w-9 rounded-lg grid place-items-center ${danger ? "bg-destructive/15 text-destructive" : warn ? "bg-[hsl(var(--stage-progress))]/20" : "bg-secondary"}`}>
                      <Coffee className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">{o.label}</div>
                      {cust && <div className="text-[10px] text-muted-foreground">{cust.name || cust.phone}</div>}
                    </div>
                  </div>
                  <div className={`flex items-center gap-1 text-xs font-semibold tabular-nums ${danger ? "text-destructive" : warn ? "text-[hsl(var(--stage-progress))]" : "text-muted-foreground"}`}>
                    {danger && <AlertTriangle className="h-3 w-3" />}
                    <Clock className="h-3 w-3" />
                    {fmtElapsed(sec)}
                  </div>
                </div>

                <div className="space-y-1 mb-3">
                  {o.lines.map((l) => (
                    <div key={l.itemId} className="flex items-center justify-between text-xs px-2 py-1.5 rounded bg-secondary/40">
                      <span className="truncate">{l.qty}× {l.name}</span>
                      <span className="tabular-nums text-muted-foreground">${(l.qty * l.price).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="mb-3">
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1 flex items-center gap-1"><MessageSquare className="h-3 w-3" /> Comment</div>
                  <Textarea
                    value={o.comment || ""}
                    onChange={(e) => updateHeldOrder(o.id, { comment: e.target.value })}
                    placeholder="Add prep notes…"
                    className="min-h-[44px] text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button variant="secondary" className="h-9" onClick={() => { removeHeldOrder(o.id); toast({ title: "Order cancelled", description: o.label }); }}>
                    <X className="h-3.5 w-3.5 mr-1" /> Cancel
                  </Button>
                  <Button className="h-9" onClick={() => {
                    const r = checkoutOrder(o.lines, o.customerId);
                    removeHeldOrder(o.id);
                    toast({ title: `Served · ${r.number}`, description: `${o.label} • $${r.total.toFixed(2)}` });
                  }}>
                    <Check className="h-3.5 w-3.5 mr-1" /> Mark served
                  </Button>
                </div>
              </Panel>
            );
          })}
        </div>
      )}
    </div>
  );
};
