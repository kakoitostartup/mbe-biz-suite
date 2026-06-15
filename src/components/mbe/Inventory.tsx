import { useState } from "react";
import { useStore, InventoryItem, RecipeItem } from "./store";
import { SectionHeader, Stat, Widget } from "./ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Minus, AlertTriangle, Package, Coffee, Warehouse, ChefHat, X, Send, Truck } from "lucide-react";

type InvView = "all" | "arrivals" | "sales" | "stock" | "critical" | "recipes" | "suppliers";

const TITLES: Record<InvView, { title: string; subtitle: string }> = {
  all:       { title: "Склад", subtitle: "Все разделы склада." },
  arrivals:  { title: "Приход товаров", subtitle: "Сырьё и поставки на склад." },
  sales:     { title: "Продаваемые товары", subtitle: "Позиции для POS со списанием ингредиентов." },
  stock:     { title: "Товары на складе", subtitle: "Актуальные остатки и пороги." },
  critical:  { title: "Критический запас", subtitle: "Позиции ниже порога — пора заказать." },
  recipes:   { title: "Техкарты", subtitle: "Состав и инструкции приготовления." },
  suppliers: { title: "Поставщики", subtitle: "База поставщиков." },
};

export const Inventory = ({ view = "all" }: { view?: InvView }) => {
  const { inventory, addInventory } = useStore();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"stock" | "product">(view === "sales" || view === "recipes" ? "product" : "stock");
  const [form, setForm] = useState({ name: "", sku: "", stock: "", threshold: "", price: "", unit: "шт" });
  const [recipeOpen, setRecipeOpen] = useState<string | null>(null);

  const stockItems = inventory.filter((i) => !i.isProduct);
  const productItems = inventory.filter((i) => i.isProduct);
  const totalValue = stockItems.reduce((s, i) => s + i.stock * i.price, 0);
  const low = stockItems.filter((i) => i.stock <= i.threshold);

  const showAdd = view === "arrivals" || view === "sales" || view === "all";
  const meta = TITLES[view];

  return (
    <div className="fade-in space-y-4">
      <SectionHeader
        title={meta.title}
        subtitle={meta.subtitle}
        action={showAdd && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="h-9"><Plus className="h-4 w-4 mr-1" /> {mode === "product" ? "Новый товар POS" : "Новый приход"}</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Новая позиция</DialogTitle></DialogHeader>
              <div className="space-y-3">
                {view === "all" && (
                  <div>
                    <Label>Тип</Label>
                    <Select value={mode} onValueChange={(v) => setMode(v as "stock" | "product")}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="stock">Приход (сырьё / товар на склад)</SelectItem>
                        <SelectItem value="product">Продаваемый товар (для POS)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div><Label>Название</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Артикул (SKU)</Label><Input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} /></div>
                  <div><Label>Цена</Label><Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></div>
                </div>
                {mode === "stock" && (
                  <div className="grid grid-cols-3 gap-3">
                    <div><Label>Остаток</Label><Input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} /></div>
                    <div><Label>Порог</Label><Input type="number" value={form.threshold} onChange={(e) => setForm({ ...form, threshold: e.target.value })} /></div>
                    <div>
                      <Label>Ед.</Label>
                      <Select value={form.unit} onValueChange={(v) => setForm({ ...form, unit: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{["шт", "мл", "г", "кг", "л"].map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button onClick={() => {
                  if (!form.name) return;
                  addInventory({
                    name: form.name, sku: form.sku || "—",
                    stock: Number(form.stock) || 0, threshold: Number(form.threshold) || 0,
                    price: Number(form.price) || 0,
                    unit: form.unit, isProduct: mode === "product",
                    recipe: mode === "product" ? [] : undefined,
                  });
                  setForm({ name: "", sku: "", stock: "", threshold: "", price: "", unit: "шт" });
                  setOpen(false);
                }}>Сохранить</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      />

      {view === "all" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Stat label="Позиций на складе" value={`${stockItems.length}`} />
          <Stat label="Стоимость склада" value={`$${totalValue.toLocaleString()}`} />
          <Stat label="Критический запас" value={`${low.length}`} delta={low.length ? "Нужно пополнить" : "Всё в норме"} />
        </div>
      )}

      {(view === "all" || view === "arrivals") && (
        <Widget
          id="inventory.stock"
          title={<span className="flex items-center gap-2"><Warehouse className="h-4 w-4" /> Приход товаров (поставки)</span>}
          subtitle={`Сырьё и товары на складе · ${stockItems.length}`}
        >
          <div className="divide-y divide-border">
            {stockItems.map((i) => <StockRow key={i.id} item={i} />)}
            {stockItems.length === 0 && (
              <div className="text-xs text-muted-foreground py-8 text-center">Пока нет поставок.</div>
            )}
          </div>
        </Widget>
      )}

      {(view === "all" || view === "sales" || view === "recipes") && (
        <Widget
          id="inventory.products"
          title={<span className="flex items-center gap-2"><Coffee className="h-4 w-4" /> Продаваемые товары (техкарты)</span>}
          subtitle={`Списываются автоматически при продаже через POS · ${productItems.length}`}
        >
          <div className="text-xs text-muted-foreground mb-3">
            Нажмите <ChefHat className="inline h-3 w-3 align-text-bottom" /> чтобы задать техкарту — какие ингредиенты со склада расходуются на 1 продажу.
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {productItems.map((p) => <ProductCard key={p.id} item={p} onEditRecipe={() => setRecipeOpen(p.id)} />)}
            {productItems.length === 0 && (
              <div className="col-span-full text-xs text-muted-foreground py-8 text-center">Нет товаров для продажи в POS.</div>
            )}
          </div>
        </Widget>
      )}

      {(view === "all" || view === "stock") && (
        <Widget
          id="inventory.balances"
          title="Товары на складе (остатки)"
          subtitle="Актуальные остатки и пороги по всем позициям"
          defaultCollapsed={view === "all"}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="text-muted-foreground text-[10px] uppercase tracking-widest">
                <tr className="text-left">
                  <th className="py-2">Название</th>
                  <th>SKU</th>
                  <th>Тип</th>
                  <th className="text-right">Остаток</th>
                  <th className="text-right">Порог</th>
                  <th className="text-right">Цена</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map((i) => (
                  <tr key={i.id} className="border-t border-border/50">
                    <td className="py-2 font-medium">{i.name}</td>
                    <td className="text-muted-foreground">{i.sku}</td>
                    <td className="text-muted-foreground">{i.isProduct ? "Продаётся" : "Сырьё"}</td>
                    <td className={`text-right tabular-nums ${i.stock <= i.threshold && !i.isProduct ? "text-destructive font-semibold" : ""}`}>{i.stock} {i.unit}</td>
                    <td className="text-right tabular-nums text-muted-foreground">{i.threshold}</td>
                    <td className="text-right tabular-nums">${i.price.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Widget>
      )}

      {(view === "all" || view === "critical") && (
        <Widget
          id="inventory.low"
          title={<span className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-destructive" /> Критический запас</span>}
          subtitle={low.length ? `${low.length} позиций ниже порога` : "Всё в норме"}
        >
          {low.length === 0 ? (
            <div className="text-xs text-muted-foreground py-6 text-center">Все запасы выше порогов.</div>
          ) : (
            <div className="space-y-2">
              {low.map((i) => (
                <div key={i.id} className="flex items-center gap-3 p-3 rounded-lg bg-destructive/5 hairline border border-destructive/20">
                  <div className="h-9 w-9 rounded-lg bg-destructive/15 text-destructive grid place-items-center"><AlertTriangle className="h-4 w-4" /></div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{i.name}</div>
                    <div className="text-[11px] text-muted-foreground">Остаток {i.stock} {i.unit} · порог {i.threshold}</div>
                  </div>
                  <Button variant="secondary" size="sm" className="h-8 text-xs">
                    <Send className="h-3 w-3 mr-1" /> Заказ поставщику
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Widget>
      )}

      {view === "suppliers" && (
        <div className="rounded-2xl bg-card hairline p-10 grid place-items-center text-center">
          <Truck className="h-10 w-10 text-muted-foreground mb-3" />
          <div className="text-sm text-muted-foreground max-w-md">
            База поставщиков. Здесь появятся карточки с контактами, условиями поставки и историей заказов.
          </div>
        </div>
      )}

      <RecipeDialog itemId={recipeOpen} onClose={() => setRecipeOpen(null)} />
    </div>
  );
};

const StockRow = ({ item }: { item: InventoryItem }) => {
  const { updateStock } = useStore();
  const isLow = item.stock <= item.threshold;
  return (
    <div className="flex items-center gap-4 py-3">
      <div className="h-10 w-10 rounded-lg bg-secondary grid place-items-center"><Package className="h-4 w-4" /></div>
      <div className="flex-1 min-w-0">
        <div className="font-medium truncate">{item.name}</div>
        <div className="text-xs text-muted-foreground">SKU {item.sku} • ${item.price.toFixed(3)} / {item.unit}</div>
      </div>
      <div className="text-right mr-3">
        <div className={`text-sm font-semibold ${isLow ? "text-destructive" : ""}`}>{item.stock} {item.unit || ""}</div>
        <div className="text-[10px] text-muted-foreground">порог {item.threshold}</div>
      </div>
      <div className="flex items-center gap-1">
        <Button size="icon" variant="secondary" className="h-8 w-8" onClick={() => updateStock(item.id, -1)}><Minus className="h-3 w-3" /></Button>
        <Button size="icon" variant="secondary" className="h-8 w-8" onClick={() => updateStock(item.id, 1)}><Plus className="h-3 w-3" /></Button>
      </div>
    </div>
  );
};

const ProductCard = ({ item, onEditRecipe }: { item: InventoryItem; onEditRecipe: () => void }) => {
  const { inventory, setPrepInstructions, prepInstructions } = useStore();
  const ingr = (item.recipe || []).map((r) => {
    const inv = inventory.find((i) => i.id === r.itemId);
    return `${r.qty}${inv?.unit || ""} ${inv?.name || "?"}`;
  }).join(" + ");
  return (
    <div className="rounded-xl bg-secondary/40 hairline p-4">
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-lg bg-foreground text-background grid place-items-center"><Coffee className="h-4 w-4" /></div>
        <div className="flex-1 min-w-0">
          <div className="font-medium truncate">{item.name}</div>
          <div className="text-xs text-muted-foreground">{item.sku} • ${item.price.toFixed(2)}</div>
        </div>
        <button onClick={onEditRecipe}
          className="h-8 w-8 grid place-items-center rounded-md bg-background hover:bg-foreground hover:text-background transition-colors"
          title="Техкарта">
          <ChefHat className="h-4 w-4" />
        </button>
      </div>
      <div className="mt-3 rounded-lg bg-background/60 p-2.5 text-[11px] min-h-[36px]">
        <div className="text-[9px] uppercase tracking-widest text-muted-foreground mb-1">Техкарта</div>
        {ingr ? <div className="text-foreground/80">{ingr}</div> : <div className="text-muted-foreground italic">Нет рецепта — задайте ингредиенты</div>}
      </div>
      <div className="mt-2">
        <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Инструкция приготовления (видна в POS)</Label>
        <Textarea
          value={prepInstructions[item.id] || ""}
          onChange={(e) => setPrepInstructions(item.id, e.target.value)}
          placeholder="Шаг 1…"
          className="mt-1 text-xs min-h-[60px] bg-background/60"
        />
      </div>
    </div>
  );
};

const RecipeDialog = ({ itemId, onClose }: { itemId: string | null; onClose: () => void }) => {
  const { inventory, updateInventory } = useStore();
  const item = inventory.find((i) => i.id === itemId);
  const stockChoices = inventory.filter((i) => !i.isProduct);
  const open = !!item;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><ChefHat className="h-4 w-4" /> Техкарта · {item?.name}</DialogTitle>
        </DialogHeader>
        <RecipeEditor key={itemId || ""} initial={item?.recipe || []} choices={stockChoices} onSave={(r) => {
          if (item) updateInventory(item.id, { recipe: r });
          onClose();
        }} onCancel={onClose} />
      </DialogContent>
    </Dialog>
  );
};

const RecipeEditor = ({ initial, choices, onSave, onCancel }: { initial: RecipeItem[]; choices: InventoryItem[]; onSave: (r: RecipeItem[]) => void; onCancel: () => void }) => {
  const [rows, setRows] = useState<RecipeItem[]>(initial);
  return (
    <>
      <div className="space-y-2">
        {rows.length === 0 && <div className="text-xs text-muted-foreground py-4 text-center">Ингредиентов пока нет. Добавьте первый ниже.</div>}
        {rows.map((r, idx) => {
          const inv = choices.find((c) => c.id === r.itemId);
          return (
            <div key={idx} className="flex items-center gap-2">
              <Select value={r.itemId} onValueChange={(v) => setRows(rows.map((x, i) => i === idx ? { ...x, itemId: v } : x))}>
                <SelectTrigger className="flex-1"><SelectValue placeholder="Ингредиент" /></SelectTrigger>
                <SelectContent>{choices.map((c) => <SelectItem key={c.id} value={c.id}>{c.name} ({c.unit})</SelectItem>)}</SelectContent>
              </Select>
              <Input type="number" value={r.qty} onChange={(e) => setRows(rows.map((x, i) => i === idx ? { ...x, qty: Number(e.target.value) } : x))} className="w-24" />
              <span className="text-xs text-muted-foreground w-10">{inv?.unit}</span>
              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setRows(rows.filter((_, i) => i !== idx))}><X className="h-3 w-3" /></Button>
            </div>
          );
        })}
      </div>
      <Button variant="secondary" className="w-full mt-3 h-8" onClick={() => setRows([...rows, { itemId: choices[0]?.id || "", qty: 1 }])}>
        <Plus className="h-3 w-3 mr-1" /> Добавить ингредиент
      </Button>
      <DialogFooter className="mt-4">
        <Button variant="ghost" onClick={onCancel}>Отмена</Button>
        <Button onClick={() => onSave(rows.filter((r) => r.itemId && r.qty > 0))}>Сохранить техкарту</Button>
      </DialogFooter>
    </>
  );
};
