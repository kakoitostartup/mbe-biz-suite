import { useState } from "react";
import { useStore, InventoryItem, RecipeItem } from "./store";
import { Panel, SectionHeader, Stat } from "./ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Minus, AlertTriangle, Package, Coffee, Warehouse, ChefHat, Trash2, X } from "lucide-react";

type Tab = "stock" | "products";

export const Inventory = () => {
  const { inventory, addInventory, updateStock } = useStore();
  const [tab, setTab] = useState<Tab>("stock");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", sku: "", stock: "", threshold: "", price: "", unit: "pcs" });
  const [recipeOpen, setRecipeOpen] = useState<string | null>(null);

  const stockItems = inventory.filter((i) => !i.isProduct);
  const productItems = inventory.filter((i) => i.isProduct);

  const totalValue = stockItems.reduce((s, i) => s + i.stock * i.price, 0);
  const low = stockItems.filter((i) => i.stock <= i.threshold);

  const isProductTab = tab === "products";

  return (
    <div className="fade-in">
      <SectionHeader
        title="Inventory"
        subtitle="Two layers: warehouse stock that arrives, and POS products that consume it via tech cards."
        action={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button className="h-9"><Plus className="h-4 w-4 mr-1" /> Add {isProductTab ? "product" : "stock item"}</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{isProductTab ? "New POS product" : "New stock item"}</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>SKU</Label><Input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} /></div>
                  <div><Label>Price</Label><Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></div>
                </div>
                {!isProductTab && (
                  <div className="grid grid-cols-3 gap-3">
                    <div><Label>Stock</Label><Input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} /></div>
                    <div><Label>Threshold</Label><Input type="number" value={form.threshold} onChange={(e) => setForm({ ...form, threshold: e.target.value })} /></div>
                    <div>
                      <Label>Unit</Label>
                      <Select value={form.unit} onValueChange={(v) => setForm({ ...form, unit: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{["pcs","ml","g","kg","l"].map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
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
                    unit: form.unit, isProduct: isProductTab, recipe: isProductTab ? [] : undefined,
                  });
                  setForm({ name: "", sku: "", stock: "", threshold: "", price: "", unit: "pcs" });
                  setOpen(false);
                }}>Save</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="flex gap-1 mb-5 p-1 rounded-lg bg-secondary/50 w-fit hairline">
        <button onClick={() => setTab("stock")}
          className={`px-3 h-8 text-xs rounded-md transition-all flex items-center gap-1.5 ${tab === "stock" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"}`}>
          <Warehouse className="h-3.5 w-3.5" /> Stock arrivals · {stockItems.length}
        </button>
        <button onClick={() => setTab("products")}
          className={`px-3 h-8 text-xs rounded-md transition-all flex items-center gap-1.5 ${tab === "products" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"}`}>
          <Coffee className="h-3.5 w-3.5" /> POS products · {productItems.length}
        </button>
      </div>

      {tab === "stock" && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Stat label="SKUs in stock" value={`${stockItems.length}`} />
            <Stat label="Inventory value" value={`$${totalValue.toLocaleString()}`} />
            <Stat label="Low-stock alerts" value={`${low.length}`} delta={low.length ? "Action recommended" : "All good"} />
          </div>

          {low.length > 0 && (
            <Panel className="mb-4 border border-destructive/30">
              <div className="flex items-start gap-3">
                <div className="h-9 w-9 rounded-lg bg-destructive/15 text-destructive grid place-items-center"><AlertTriangle className="h-4 w-4" /></div>
                <div className="flex-1">
                  <div className="text-sm font-medium">Low stock alerts</div>
                  <div className="text-xs text-muted-foreground">{low.map((i) => i.name).join(" • ")}</div>
                </div>
              </div>
            </Panel>
          )}

          <Panel>
            <div className="text-sm font-medium mb-3">Stock arrivals — raw ingredients & goods received</div>
            <div className="divide-y divide-border">
              {stockItems.map((i) => {
                const isLow = i.stock <= i.threshold;
                return (
                  <div key={i.id} className="flex items-center gap-4 py-3">
                    <div className="h-10 w-10 rounded-lg bg-secondary grid place-items-center"><Package className="h-4 w-4" /></div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{i.name}</div>
                      <div className="text-xs text-muted-foreground">SKU {i.sku} • ${i.price.toFixed(3)} / {i.unit}</div>
                    </div>
                    <div className="text-right mr-3">
                      <div className={`text-sm font-semibold ${isLow ? "text-destructive" : ""}`}>{i.stock} {i.unit || ""}</div>
                      <div className="text-[10px] text-muted-foreground">threshold {i.threshold}</div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button size="icon" variant="secondary" className="h-8 w-8" onClick={() => updateStock(i.id, -1)}><Minus className="h-3 w-3" /></Button>
                      <Button size="icon" variant="secondary" className="h-8 w-8" onClick={() => updateStock(i.id, 1)}><Plus className="h-3 w-3" /></Button>
                    </div>
                  </div>
                );
              })}
              {stockItems.length === 0 && <div className="text-xs text-muted-foreground py-8 text-center">No warehouse items yet.</div>}
            </div>
          </Panel>
        </>
      )}

      {tab === "products" && (
        <Panel>
          <div className="text-sm font-medium mb-1">POS-sellable products</div>
          <div className="text-xs text-muted-foreground mb-3">Click <ChefHat className="inline h-3 w-3 align-text-bottom" /> to set the tech card — ingredients consumed per sale. This makes stocktake (ревизия) automatic.</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {productItems.map((p) => (
              <ProductCard key={p.id} item={p} onEditRecipe={() => setRecipeOpen(p.id)} />
            ))}
            {productItems.length === 0 && <div className="col-span-full text-xs text-muted-foreground py-8 text-center">No POS products yet.</div>}
          </div>
        </Panel>
      )}

      <RecipeDialog itemId={recipeOpen} onClose={() => setRecipeOpen(null)} />
    </div>
  );
};

const ProductCard = ({ item, onEditRecipe }: { item: InventoryItem; onEditRecipe: () => void }) => {
  const { inventory, setPrepInstructions, prepInstructions, updateInventory } = useStore();
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
          title="Tech card / recipe">
          <ChefHat className="h-4 w-4" />
        </button>
      </div>
      <div className="mt-3 rounded-lg bg-background/60 p-2.5 text-[11px] min-h-[36px]">
        <div className="text-[9px] uppercase tracking-widest text-muted-foreground mb-1">Tech card</div>
        {ingr ? <div className="text-foreground/80">{ingr}</div> : <div className="text-muted-foreground italic">No recipe — set ingredients</div>}
      </div>
      <div className="mt-2">
        <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Prep instructions (shown in POS)</Label>
        <Textarea
          value={prepInstructions[item.id] || ""}
          onChange={(e) => setPrepInstructions(item.id, e.target.value)}
          placeholder="Step 1…"
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
          <DialogTitle className="flex items-center gap-2"><ChefHat className="h-4 w-4" /> Tech card · {item?.name}</DialogTitle>
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
        {rows.length === 0 && <div className="text-xs text-muted-foreground py-4 text-center">No ingredients yet. Add the first one below.</div>}
        {rows.map((r, idx) => {
          const inv = choices.find((c) => c.id === r.itemId);
          return (
            <div key={idx} className="flex items-center gap-2">
              <Select value={r.itemId} onValueChange={(v) => setRows(rows.map((x, i) => i === idx ? { ...x, itemId: v } : x))}>
                <SelectTrigger className="flex-1"><SelectValue placeholder="Pick ingredient" /></SelectTrigger>
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
        <Plus className="h-3 w-3 mr-1" /> Add ingredient
      </Button>
      <DialogFooter className="mt-4">
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button onClick={() => onSave(rows.filter((r) => r.itemId && r.qty > 0))}>Save tech card</Button>
      </DialogFooter>
    </>
  );
};
