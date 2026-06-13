import { useMemo, useState } from "react";
import { useStore, CartLine, Customer } from "./store";
import { Panel, SectionHeader } from "./ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Plus, Minus, X, PauseCircle, PlayCircle, ReceiptText, User, Trash2, Search, HelpCircle,
  Banknote, CreditCard, Building2, Check, ChefHat, MessageSquare,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { toast } from "@/hooks/use-toast";

export const POS = () => {
  const {
    inventory, holdOrder, heldOrders, resumeOrder, removeHeldOrder, updateHeldOrder,
    checkoutOrder, customers, addCustomer, log, prepInstructions, paymentMethods,
  } = useStore();
  const [helpItem, setHelpItem] = useState<string | null>(null);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [query, setQuery] = useState("");
  const [customer, setCustomer] = useState<Customer | undefined>();
  const [holdOpen, setHoldOpen] = useState(false);
  const [holdLabel, setHoldLabel] = useState("");
  const [holdComment, setHoldComment] = useState("");
  const [custOpen, setCustOpen] = useState(false);
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [paymentId, setPaymentId] = useState<string>(() => paymentMethods.find((p) => p.enabled)?.id || paymentMethods[0]?.id || "");
  const [bankOpen, setBankOpen] = useState(false);

  const products = inventory.filter((i) => i.isProduct);
  const filtered = useMemo(
    () => products.filter((p) => p.name.toLowerCase().includes(query.toLowerCase())),
    [products, query]
  );

  const total = cart.reduce((s, l) => s + l.price * l.qty, 0);

  const addToCart = (id: string, qty = 1) => {
    const p = inventory.find((i) => i.id === id);
    if (!p) return;
    setCart((c) => {
      const exists = c.find((l) => l.itemId === id);
      if (exists) return c.map((l) => (l.itemId === id ? { ...l, qty: l.qty + qty } : l));
      return [...c, { itemId: id, name: p.name, price: p.price, qty }];
    });
  };

  const adjust = (id: string, delta: number) => {
    setCart((c) => c.flatMap((l) => {
      if (l.itemId !== id) return [l];
      const nq = l.qty + delta;
      if (nq <= 0) { log({ actor: "cashier-1", action: "Item removed from cart", detail: l.name, severity: "warn" }); return []; }
      return [{ ...l, qty: nq }];
    }));
  };

  const removeLine = (id: string) => {
    const line = cart.find((l) => l.itemId === id);
    setCart((c) => c.filter((l) => l.itemId !== id));
    if (line) log({ actor: "cashier-1", action: "Item removed from cart", detail: line.name, severity: "warn" });
  };

  const checkout = () => {
    if (cart.length === 0) return;
    const r = checkoutOrder(cart, customer?.id, paymentId);
    const pm = paymentMethods.find((p) => p.id === paymentId);
    toast({ title: `Receipt ${r.number}`, description: `${pm?.label || "Payment"} • $${r.total.toFixed(2)}` });
    setCart([]); setCustomer(undefined);
  };

  const onHold = () => {
    if (cart.length === 0) return;
    holdOrder(holdLabel || `Order #${heldOrders.length + 1}`, cart, customer?.id, holdComment || undefined);
    setCart([]); setCustomer(undefined); setHoldLabel(""); setHoldComment(""); setHoldOpen(false);
    toast({ title: "Order held", description: "Resume it from the held panel or the live dashboard." });
  };

  const resume = (id: string) => {
    const o = resumeOrder(id);
    if (o) {
      setCart(o.lines);
      const c = customers.find((x) => x.id === o.customerId);
      if (c) setCustomer(c);
    }
  };

  const findOrCreateCustomer = () => {
    const existing = customers.find((c) => c.phone.replace(/\s+/g, "") === phone.replace(/\s+/g, ""));
    if (existing) setCustomer(existing);
    else setCustomer(addCustomer({ phone, name, note }));
    setPhone(""); setName(""); setNote(""); setCustOpen(false);
  };

  const enabledMethods = paymentMethods.filter((p) => p.enabled);

  return (
    <div className="fade-in">
      <SectionHeader
        title="Касса (POS)"
        subtitle="Касание — продажа. Количество вводится в один тап, техкарта по запросу, ингредиенты списываются автоматически."
      />


      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Product grid */}
        <Panel className="lg:col-span-3">
          <div className="relative mb-3">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Поиск товаров…" className="pl-9 h-9 bg-secondary border-transparent" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {filtered.map((p) => (
              <ProductTile
                key={p.id}
                item={p}
                hasPrep={!!prepInstructions[p.id]}
                onAdd={(qty) => addToCart(p.id, qty)}
                onHelp={() => setHelpItem(p.id)}
              />
            ))}
            {filtered.length === 0 && <div className="col-span-full text-xs text-muted-foreground py-8 text-center">Нет товаров по запросу.</div>}
          </div>

          {heldOrders.length > 0 && (
            <div className="mt-6">
              <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Отложенные заказы</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {heldOrders.map((o) => (
                  <div key={o.id} className="rounded-lg bg-secondary/40 hairline p-3 flex items-center gap-2">
                    <PauseCircle className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium truncate">{o.label}</div>
                      <div className="text-[10px] text-muted-foreground">{o.lines.length} позиций • {format(parseISO(o.createdAt), "HH:mm")}</div>
                      {o.comment && <div className="text-[10px] text-foreground/70 truncate italic">“{o.comment}”</div>}
                    </div>
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => resume(o.id)}><PlayCircle className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => removeHeldOrder(o.id)}><Trash2 className="h-3 w-3" /></Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Panel>

        {/* Cart + checkout flow */}
        <Panel className="lg:col-span-2 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-medium flex items-center gap-2"><ReceiptText className="h-4 w-4" /> Текущий заказ</div>
          </div>
          <div className="flex-1 space-y-2 max-h-[360px] overflow-auto pr-1">
            {cart.length === 0 && <div className="text-xs text-muted-foreground py-10 text-center">Нажмите на товар, чтобы начать.</div>}

            {cart.map((l) => (
              <div key={l.itemId} className="flex items-center gap-2 p-2.5 rounded-lg bg-secondary/50 hairline">
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium truncate">{l.name}</div>
                  <div className="text-[10px] text-muted-foreground">${l.price.toFixed(2)} × {l.qty}</div>
                </div>
                <Button size="icon" variant="secondary" className="h-7 w-7" onClick={() => adjust(l.itemId, -1)}><Minus className="h-3 w-3" /></Button>
                <span className="w-6 text-center text-xs font-semibold">{l.qty}</span>
                <Button size="icon" variant="secondary" className="h-7 w-7" onClick={() => adjust(l.itemId, 1)}><Plus className="h-3 w-3" /></Button>
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => removeLine(l.itemId)}><X className="h-3 w-3" /></Button>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-border space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground">Итого</div>
              <div className="text-2xl font-semibold">${total.toFixed(2)}</div>
            </div>

            {/* 1. Charge + Hold */}
            <div className="grid grid-cols-2 gap-2">
              <Dialog open={holdOpen} onOpenChange={setHoldOpen}>
                <DialogTrigger asChild>
                  <Button variant="secondary" className="h-11" disabled={cart.length === 0}>
                    <PauseCircle className="h-4 w-4 mr-1" /> Отложить
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Отложить заказ</DialogTitle></DialogHeader>
                  <div className="space-y-3">
                    <div><Label>Метка (например «Стол 4»)</Label><Input value={holdLabel} onChange={(e) => setHoldLabel(e.target.value)} /></div>
                    <div><Label>Комментарий (виден на live-дашборде)</Label><Textarea value={holdComment} onChange={(e) => setHoldComment(e.target.value)} placeholder="Овсяное молоко, погорячее…" /></div>
                  </div>
                  <DialogFooter><Button onClick={onHold}>Отложить</Button></DialogFooter>
                </DialogContent>
              </Dialog>
              <Button className="h-11" onClick={checkout} disabled={cart.length === 0 || !paymentId}>
                Оплатить ${total.toFixed(2)}

              </Button>
            </div>

            {/* 2. Customer / bonus card (after Charge) */}
            <Dialog open={custOpen} onOpenChange={setCustOpen}>
              <DialogTrigger asChild>
                <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-secondary/40 hairline hover:bg-secondary text-left transition-colors">
                  <div className="h-9 w-9 rounded-md bg-foreground text-background grid place-items-center">
                    <User className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium">{customer ? (customer.name || customer.phone) : "Привязать бонусную карту"}</div>
                    <div className="text-[10px] text-muted-foreground">{customer ? customer.note || "постоянный клиент" : "По номеру телефона • опционально"}</div>
                  </div>
                  {customer && <Check className="h-4 w-4 text-[hsl(var(--stage-completed))]" />}
                </button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Бонусная карта / клиент</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <div><Label>Телефон</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+7 …" /></div>
                  <div><Label>Имя (опционально)</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
                  <div><Label>Заметка (аллергии, предпочтения…)</Label><Input value={note} onChange={(e) => setNote(e.target.value)} /></div>
                </div>
                <DialogFooter><Button onClick={findOrCreateCustomer} disabled={!phone}>Найти / создать</Button></DialogFooter>

              </DialogContent>
            </Dialog>

            {/* 3. Payment method selector */}
            <div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">Способ оплаты</div>
              <div className="grid grid-cols-2 gap-1.5">
                {enabledMethods.map((m) => {
                  const Icon = m.kind === "cash" ? Banknote : m.kind === "card" ? CreditCard : Building2;
                  const isActive = paymentId === m.id;
                  return (
                    <button key={m.id} onClick={() => setPaymentId(m.id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-md text-xs transition-all ${isActive ? "bg-primary text-primary-foreground" : "bg-secondary/40 hairline hover:bg-secondary text-foreground/80"}`}>
                      <Icon className="h-3.5 w-3.5" />
                      <span className="truncate">{m.label}</span>
                      {m.brand && <span className="ml-auto text-[9px] opacity-60">{m.brand}</span>}
                    </button>
                  );
                })}
                <BankConnectButton open={bankOpen} setOpen={setBankOpen} />
              </div>
            </div>
          </div>
        </Panel>
      </div>

      {/* Tech card / prep modal */}
      <Dialog open={!!helpItem} onOpenChange={(v) => !v && setHelpItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ChefHat className="h-4 w-4" />
              Техкарта · {inventory.find((i) => i.id === helpItem)?.name}

            </DialogTitle>
          </DialogHeader>
          <RecipeView itemId={helpItem} />
          {prepInstructions[helpItem || ""] && (
            <>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-4 mb-2">Приготовление</div>
              <ol className="space-y-2 text-sm">
                {(prepInstructions[helpItem || ""] || "").split("\n").filter(Boolean).map((line, i) => (
                  <li key={i} className="flex gap-3 p-3 rounded-lg bg-secondary/40 hairline">
                    <span className="h-6 w-6 shrink-0 rounded-full bg-foreground text-background grid place-items-center text-[11px] font-semibold">{i + 1}</span>
                    <span className="leading-relaxed pt-0.5">{line.replace(/^\d+\.\s*/, "")}</span>
                  </li>
                ))}
              </ol>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

const ProductTile = ({ item, hasPrep, onAdd, onHelp }: {
  item: { id: string; name: string; sku: string; price: number };
  hasPrep: boolean;
  onAdd: (qty: number) => void;
  onHelp: () => void;
}) => {
  const [open, setOpen] = useState(false);
  const [qty, setQty] = useState(1);

  return (
    <div className="relative group">
      <Popover open={open} onOpenChange={(v) => { setOpen(v); if (v) setQty(1); }}>
        <PopoverTrigger asChild>
          <button className="w-full rounded-xl bg-secondary/50 hairline p-4 text-left hover:bg-secondary transition-all active:scale-[0.98]">
            <div className="text-sm font-medium truncate pr-6">{item.name}</div>
            <div className="mt-1 text-xs text-muted-foreground">{item.sku}</div>
            <div className="mt-3 text-lg font-semibold">${item.price.toFixed(2)}</div>
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-56 p-3" align="start">
          <div className="text-xs font-medium mb-2">{item.name}</div>
          <div className="flex items-center gap-2 mb-3">
            <Button size="icon" variant="secondary" className="h-9 w-9" onClick={() => setQty(Math.max(1, qty - 1))}><Minus className="h-3 w-3" /></Button>
            <Input type="number" value={qty} onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))} className="h-9 text-center text-base font-semibold" />
            <Button size="icon" variant="secondary" className="h-9 w-9" onClick={() => setQty(qty + 1)}><Plus className="h-3 w-3" /></Button>
          </div>
          <div className="grid grid-cols-4 gap-1 mb-3">
            {[1, 2, 5, 10].map((n) => (
              <button key={n} onClick={() => setQty(n)}
                className={`h-7 rounded-md text-[11px] font-medium transition-colors ${qty === n ? "bg-foreground text-background" : "bg-secondary hover:bg-accent"}`}>{n}</button>
            ))}
          </div>
          <Button className="w-full h-9" onClick={() => { onAdd(qty); setOpen(false); }}>
            Add {qty} · ${(qty * item.price).toFixed(2)}
          </Button>
        </PopoverContent>
      </Popover>
      {hasPrep && (
        <button
          onClick={(e) => { e.stopPropagation(); onHelp(); }}
          className="absolute top-2 right-2 h-6 w-6 grid place-items-center rounded-full bg-background/70 hover:bg-foreground hover:text-background text-muted-foreground transition-all z-10"
          title="Tech card"
        >
          <HelpCircle className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
};

const RecipeView = ({ itemId }: { itemId: string | null }) => {
  const { inventory } = useStore();
  const item = inventory.find((i) => i.id === itemId);
  if (!item) return null;
  if (!item.recipe || item.recipe.length === 0) {
    return <div className="text-xs text-muted-foreground italic">No tech card yet. Set ingredients in Inventory → POS products.</div>;
  }
  return (
    <div className="rounded-lg bg-secondary/40 hairline p-3 space-y-1.5">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Ингредиенты на 1 порцию</div>
      {item.recipe.map((r, i) => {
        const inv = inventory.find((x) => x.id === r.itemId);
        return (
          <div key={i} className="flex items-center justify-between text-xs">
            <span>{inv?.name || "?"}</span>
            <span className="tabular-nums text-muted-foreground">{r.qty} {inv?.unit}</span>
          </div>
        );
      })}
    </div>
  );
};

const BankConnectButton = ({ open, setOpen }: { open: boolean; setOpen: (v: boolean) => void }) => {
  const { addPaymentMethod } = useStore();
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="flex items-center gap-2 px-3 py-2 rounded-md text-xs bg-secondary/40 hairline border-dashed hover:bg-secondary text-muted-foreground border border-dashed">
          <Plus className="h-3.5 w-3.5" /> Подключить банк
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle className="flex items-center gap-2"><Building2 className="h-4 w-4" /> Подключение банка / эквайринга</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div className="text-xs text-muted-foreground">Подключите банк или эквайринг. Ключи API можно ввести позже — пока зарегистрируем способ оплаты в кассе.</div>
          <div><Label>Провайдер</Label><Input value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="Stripe, Сбербанк, Тинькофф, Альфа…" /></div>
          <div><Label>Название способа</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="например, «Карта Stripe»" /></div>
          <div className="rounded-md bg-secondary/40 hairline p-3 text-[11px] text-muted-foreground">
            В будущем: OAuth / API-ключи на каждый банк. Привязанные способы появятся здесь автоматически.
          </div>

        </div>
        <DialogFooter>
          <Button onClick={() => {
            if (!name || !brand) return;
            addPaymentMethod({ kind: "bank", label: name, brand, enabled: true });
            setName(""); setBrand(""); setOpen(false);
            toast({ title: "Провайдер добавлен", description: `${brand} доступен как способ оплаты.` });
          }}>Добавить</Button>

        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
