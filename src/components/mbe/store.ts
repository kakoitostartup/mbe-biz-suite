import { create } from "zustand";

export type Stage = {
  id: string;
  label: string;
  color: string;
};

export type Deal = {
  id: string;
  client: string;
  title: string;
  amount: number;
  stageId: string;
  createdAt: string;
};

export type Transaction = {
  id: string;
  label: string;
  amount: number;
  type: "income" | "expense";
  date: string;
  fromDealId?: string;
  receipt?: string;
  category?: string;
};

export type RecipeItem = { itemId: string; qty: number };

export type InventoryItem = {
  id: string;
  name: string;
  sku: string;
  stock: number;
  threshold: number;
  price: number;
  unit?: string;
  isProduct?: boolean;
  recipe?: RecipeItem[];
};

export type Task = {
  id: string;
  title: string;
  due: string;
  done: boolean;
  dealId?: string; // CRM-linked task
  client?: string; // CRM-linked
};

export type Customer = {
  id: string;
  phone: string;
  name?: string;
  note?: string;
  createdAt: string;
};

export type CartLine = { itemId: string; name: string; price: number; qty: number };

export type HeldOrder = {
  id: string;
  label: string;
  lines: CartLine[];
  customerId?: string;
  createdAt: string;
  comment?: string;
};

export type PaymentKind = "cash" | "card" | "bank";

export type PaymentMethod = {
  id: string;
  kind: PaymentKind;
  label: string;
  brand?: string; // e.g. "Stripe", "Sberbank", "Visa"
  enabled: boolean;
};

export type Receipt = {
  id: string;
  number: string;
  lines: CartLine[];
  total: number;
  customerId?: string;
  cashierId: string;
  createdAt: string;
  voided?: boolean;
  paymentMethodId?: string;
};

export type AuditEvent = {
  id: string;
  at: string;
  actor: string;
  action: string;
  detail: string;
  severity: "info" | "warn" | "alert";
};

export type Appointment = {
  id: string;
  dealId?: string;
  title: string;
  clients: string[];
  start: string;
  duration: number;
  color?: string;
  note?: string;
};

export type StaffRole = "owner" | "manager" | "cashier" | "barista" | "sales";

export type Staff = {
  id: string;
  name: string;
  role: StaffRole;
  phone?: string;
  email?: string;
  pin: string;
  hiredAt: string;
  kpiTarget?: number;
};

export type Shift = {
  id: string;
  staffId: string;
  start: string;
  end?: string;
};

export type PremiumPlan = "Starter" | "Pro" | "Business" | "Enterprise";

export type Subscription = {
  plan: PremiumPlan;
  priceMonthly: number;
  status: "active" | "trial" | "past_due" | "canceled";
  startedAt: string;
  renewsAt: string;
  cardBrand: string;
  cardLast4: string;
  cardExpiry: string;
  autoRenew: boolean;
};

export type AppSettings = {
  liveOrdersEnabled: boolean; // online kitchen/bar dashboard
};

export type WidgetState = Record<string, boolean>; // id → collapsed?


const uid = () => Math.random().toString(36).slice(2, 9);
const pin = () => Math.floor(10_000_000 + Math.random() * 89_999_999).toString();

type State = {
  stages: Stage[];
  deals: Deal[];
  transactions: Transaction[];
  inventory: InventoryItem[];
  tasks: Task[];
  customers: Customer[];
  heldOrders: HeldOrder[];
  receipts: Receipt[];
  audit: AuditEvent[];
  appointments: Appointment[];
  staff: Staff[];
  shifts: Shift[];
  subscription: Subscription;
  paymentMethods: PaymentMethod[];
  settings: AppSettings;
  prepInstructions: Record<string, string>;
  widgets: WidgetState;
  toggleWidget: (id: string) => void;


  addStage: () => void;
  updateStage: (id: string, patch: Partial<Stage>) => void;
  removeStage: (id: string) => void;
  addDeal: (d: Omit<Deal, "id" | "createdAt">) => void;
  moveDeal: (id: string, stageId: string) => void;

  addAppointment: (a: Omit<Appointment, "id">) => void;
  updateAppointment: (id: string, patch: Partial<Appointment>) => void;
  removeAppointment: (id: string) => void;

  addTransaction: (t: Omit<Transaction, "id">) => void;

  addInventory: (i: Omit<InventoryItem, "id">) => void;
  updateStock: (id: string, delta: number) => void;
  updateInventory: (id: string, patch: Partial<InventoryItem>) => void;
  removeInventory: (id: string) => void;
  setPrepInstructions: (id: string, text: string) => void;

  addTask: (t: Omit<Task, "id" | "done">) => void;
  toggleTask: (id: string) => void;
  removeTask: (id: string) => void;

  addCustomer: (c: Omit<Customer, "id" | "createdAt">) => Customer;
  updateCustomer: (id: string, patch: Partial<Customer>) => void;

  holdOrder: (label: string, lines: CartLine[], customerId?: string, comment?: string) => void;
  resumeOrder: (id: string) => HeldOrder | undefined;
  removeHeldOrder: (id: string) => void;
  updateHeldOrder: (id: string, patch: Partial<HeldOrder>) => void;
  checkoutOrder: (lines: CartLine[], customerId?: string, paymentMethodId?: string) => Receipt;
  voidReceipt: (id: string, reason: string) => void;

  addStaff: (s: Omit<Staff, "id" | "hiredAt" | "pin"> & { pin?: string }) => Staff;
  updateStaff: (id: string, patch: Partial<Staff>) => void;
  removeStaff: (id: string) => void;
  resetPin: (id: string) => string;
  clockIn: (staffId: string) => void;
  clockOut: (staffId: string) => void;

  updateSubscription: (patch: Partial<Subscription>) => void;

  addPaymentMethod: (m: Omit<PaymentMethod, "id">) => void;
  updatePaymentMethod: (id: string, patch: Partial<PaymentMethod>) => void;
  removePaymentMethod: (id: string) => void;

  updateSettings: (patch: Partial<AppSettings>) => void;

  log: (e: Omit<AuditEvent, "id" | "at">) => void;
};

const today = new Date();
const daysAgo = (n: number) => new Date(today.getTime() - n * 86400000).toISOString();
const minsAgo = (n: number) => new Date(today.getTime() - n * 60000).toISOString();

const milkId = uid();
const beanId = uid();
const cupId = uid();
const syrupId = uid();
const cappId = uid();
const espId = uid();
const latteId = uid();
const croissantId = uid();

const dealAcme = uid();
const dealNova = uid();

export const useStore = create<State>((set, get) => ({
  stages: [
    { id: "new", label: "New Client", color: "stage-new" },
    { id: "progress", label: "In Progress", color: "stage-progress" },
    { id: "noresponse", label: "No Response", color: "stage-noresponse" },
    { id: "completed", label: "Deal Completed", color: "stage-completed" },
    { id: "lost", label: "Deal Lost", color: "stage-lost" },
  ],
  deals: [
    { id: dealAcme, client: "Acme Corp", title: "Annual retainer", amount: 12500, stageId: "progress", createdAt: daysAgo(3) },
    { id: dealNova, client: "Nova Studio", title: "Brand identity", amount: 4800, stageId: "new", createdAt: daysAgo(1) },
    { id: uid(), client: "Helix Labs", title: "Platform license", amount: 22000, stageId: "completed", createdAt: daysAgo(8) },
  ],
  transactions: [
    { id: uid(), label: "Helix Labs — Platform license", amount: 22000, type: "income", date: daysAgo(8), receipt: "RCPT-1042" },
    { id: uid(), label: "Server hosting", amount: 480, type: "expense", date: daysAgo(2), category: "Infrastructure" },
    { id: uid(), label: "Rent", amount: 1800, type: "expense", date: daysAgo(1), category: "Rent" },
  ],
  inventory: [
    { id: milkId, name: "Milk", sku: "ING-MLK", stock: 4200, threshold: 2000, price: 0.004, unit: "ml" },
    { id: beanId, name: "Coffee beans", sku: "ING-BEAN", stock: 1800, threshold: 500, price: 0.05, unit: "g" },
    { id: cupId, name: "Paper cup 12oz", sku: "ING-CUP", stock: 120, threshold: 50, price: 0.12, unit: "pcs" },
    { id: syrupId, name: "Vanilla syrup", sku: "ING-SYR", stock: 800, threshold: 300, price: 0.02, unit: "ml" },
    { id: cappId, name: "Cappuccino", sku: "PRD-CAP", stock: 0, threshold: 0, price: 4.5, unit: "pcs", isProduct: true,
      recipe: [{ itemId: milkId, qty: 200 }, { itemId: beanId, qty: 18 }, { itemId: cupId, qty: 1 }] },
    { id: espId, name: "Espresso", sku: "PRD-ESP", stock: 0, threshold: 0, price: 3, unit: "pcs", isProduct: true,
      recipe: [{ itemId: beanId, qty: 9 }, { itemId: cupId, qty: 1 }] },
    { id: latteId, name: "Vanilla Latte", sku: "PRD-LAT", stock: 0, threshold: 0, price: 5.2, unit: "pcs", isProduct: true,
      recipe: [{ itemId: milkId, qty: 220 }, { itemId: beanId, qty: 18 }, { itemId: cupId, qty: 1 }, { itemId: syrupId, qty: 15 }] },
    { id: croissantId, name: "Croissant", sku: "PRD-CRS", stock: 8, threshold: 6, price: 3.8, unit: "pcs", isProduct: true },
  ],
  tasks: [
    { id: uid(), title: "Order milk delivery", due: new Date(today.getTime() + 3600_000 * 5).toISOString(), done: false },
    { id: uid(), title: "Send proposal to Acme Corp", due: new Date(today.getTime() + 86400000).toISOString(), done: false, dealId: dealAcme, client: "Acme Corp" },
    { id: uid(), title: "Follow up with Nova Studio", due: new Date(today.getTime() + 86400000 * 2).toISOString(), done: false, dealId: dealNova, client: "Nova Studio" },
  ],
  customers: [
    { id: uid(), phone: "+1 555 0142", name: "Anna", note: "Allergic to peanuts • likes window seat", createdAt: daysAgo(6) },
    { id: uid(), phone: "+1 555 0177", name: "Marco", note: "Always orders double espresso", createdAt: daysAgo(2) },
  ],
  heldOrders: [
    { id: uid(), label: "Table 4", lines: [
      { itemId: cappId, name: "Cappuccino", price: 4.5, qty: 2 },
      { itemId: croissantId, name: "Croissant", price: 3.8, qty: 1 },
    ], createdAt: minsAgo(4), comment: "Oat milk on the cappuccino" },
    { id: uid(), label: "Table 7", lines: [
      { itemId: latteId, name: "Vanilla Latte", price: 5.2, qty: 1 },
    ], createdAt: minsAgo(1), comment: "Extra hot" },
  ],
  receipts: [
    { id: uid(), number: "Z-1001", lines: [{ itemId: espId, name: "Espresso", price: 3, qty: 1 }], total: 3, cashierId: "cashier-1", createdAt: minsAgo(35) },
    { id: uid(), number: "Z-1002", lines: [{ itemId: cappId, name: "Cappuccino", price: 4.5, qty: 2 }], total: 9, cashierId: "cashier-1", createdAt: minsAgo(20) },
  ],
  audit: [
    { id: uid(), at: minsAgo(18), actor: "cashier-1", action: "Discount applied", detail: "Z-1002 • -10%", severity: "warn" },
    { id: uid(), at: minsAgo(40), actor: "system", action: "Low stock", detail: "Vanilla syrup near threshold", severity: "alert" },
  ],
  appointments: (() => {
    const base = new Date(); base.setHours(10, 0, 0, 0);
    const t = (h: number, m: number) => { const d = new Date(base); d.setHours(h, m, 0, 0); return d.toISOString(); };
    return [
      { id: uid(), title: "Brand kickoff", clients: ["Nova Studio"], start: t(10, 0), duration: 45, color: "stage-progress", dealId: dealNova },
      { id: uid(), title: "Discovery call", clients: ["Acme Corp", "Helix Labs"], start: t(11, 30), duration: 30, color: "stage-new", dealId: dealAcme },
      { id: uid(), title: "Contract review", clients: ["Helix Labs"], start: t(14, 15), duration: 60, color: "stage-completed" },
    ];
  })(),
  staff: [
    { id: "owner", name: "Alex Mercer", role: "owner", phone: "+1 555 0001", email: "alex@mbe.app", pin: pin(), hiredAt: daysAgo(420), kpiTarget: 30 },
    { id: "cashier-1", name: "Mia Chen", role: "cashier", phone: "+1 555 0188", pin: pin(), hiredAt: daysAgo(60), kpiTarget: 0 },
    { id: "sales-1", name: "Daria Volkova", role: "sales", phone: "+1 555 0212", pin: pin(), hiredAt: daysAgo(180), kpiTarget: 12 },
    { id: "barista-1", name: "Tom Reyes", role: "barista", phone: "+1 555 0233", pin: pin(), hiredAt: daysAgo(45), kpiTarget: 0 },
  ],
  shifts: [
    { id: uid(), staffId: "cashier-1", start: new Date(today.getTime() - 3600_000 * 4).toISOString() },
    { id: uid(), staffId: "barista-1", start: new Date(today.getTime() - 3600_000 * 2.5).toISOString() },
  ],
  subscription: {
    plan: "Pro", priceMonthly: 49, status: "active",
    startedAt: daysAgo(120),
    renewsAt: new Date(today.getTime() + 86400000 * 14).toISOString(),
    cardBrand: "Visa", cardLast4: "4242", cardExpiry: "08/28", autoRenew: true,
  },
  paymentMethods: [
    { id: uid(), kind: "cash", label: "Cash", enabled: true },
    { id: uid(), kind: "card", label: "Card terminal", brand: "Generic POS", enabled: true },
  ],
  settings: { liveOrdersEnabled: true },
  prepInstructions: {
    [cappId]: "1. Grind 18g of beans (medium-fine)\n2. Pull a double espresso (~25s, 36g out)\n3. Steam 200ml milk to 65°C, microfoam\n4. Pour into 12oz cup — heart latte art\n5. Serve immediately",
    [espId]: "1. Grind 9g of beans (fine)\n2. Tamp evenly, 30lb pressure\n3. Pull single shot, 22–28s\n4. Serve in warm demitasse cup",
    [latteId]: "1. Pull double espresso (18g in / 36g out)\n2. Add 15ml vanilla syrup to cup\n3. Steam 220ml milk silky\n4. Pour latte art on top\n5. Sleeve cup, serve",
    [croissantId]: "Reheat 90s at 160°C in convection oven. Serve on small plate with butter knife.",
  },

  addStage: () => set((s) => ({ stages: [...s.stages, { id: uid(), label: "New Stage", color: "stage-progress" }] })),
  updateStage: (id, patch) => set((s) => ({ stages: s.stages.map((x) => (x.id === id ? { ...x, ...patch } : x)) })),
  removeStage: (id) => set((s) => ({ stages: s.stages.filter((x) => x.id !== id) })),

  addDeal: (d) => set((s) => ({ deals: [{ ...d, id: uid(), createdAt: new Date().toISOString() }, ...s.deals] })),
  moveDeal: (id, stageId) => {
    const deal = get().deals.find((d) => d.id === id);
    set((s) => ({ deals: s.deals.map((d) => (d.id === id ? { ...d, stageId } : d)) }));
    if (deal && stageId === "completed") {
      const exists = get().transactions.some((t) => t.fromDealId === id);
      if (!exists) {
        get().addTransaction({
          label: `${deal.client} — ${deal.title}`,
          amount: deal.amount, type: "income", date: new Date().toISOString(),
          fromDealId: id, receipt: `RCPT-${1000 + Math.floor(Math.random() * 9000)}`,
        });
      }
    }
  },

  addTransaction: (t) => set((s) => ({ transactions: [{ ...t, id: uid() }, ...s.transactions] })),

  addInventory: (i) => set((s) => ({ inventory: [{ ...i, id: uid() }, ...s.inventory] })),
  updateStock: (id, delta) =>
    set((s) => ({ inventory: s.inventory.map((x) => (x.id === id ? { ...x, stock: Math.max(0, x.stock + delta) } : x)) })),
  updateInventory: (id, patch) =>
    set((s) => ({ inventory: s.inventory.map((x) => (x.id === id ? { ...x, ...patch } : x)) })),
  removeInventory: (id) => set((s) => ({ inventory: s.inventory.filter((x) => x.id !== id) })),
  setPrepInstructions: (id, text) => set((s) => ({ prepInstructions: { ...s.prepInstructions, [id]: text } })),

  addTask: (t) => set((s) => ({ tasks: [...s.tasks, { ...t, id: uid(), done: false }] })),
  toggleTask: (id) => set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)) })),
  removeTask: (id) => set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),

  addCustomer: (c) => {
    const cust = { ...c, id: uid(), createdAt: new Date().toISOString() };
    set((s) => ({ customers: [cust, ...s.customers] }));
    get().log({ actor: "owner", action: "Customer added", detail: cust.phone, severity: "info" });
    return cust;
  },
  updateCustomer: (id, patch) =>
    set((s) => ({ customers: s.customers.map((x) => (x.id === id ? { ...x, ...patch } : x)) })),

  holdOrder: (label, lines, customerId, comment) => {
    set((s) => ({ heldOrders: [{ id: uid(), label, lines, customerId, comment, createdAt: new Date().toISOString() }, ...s.heldOrders] }));
    get().log({ actor: "cashier-1", action: "Order held", detail: `${label} • ${lines.length} items`, severity: "info" });
  },
  resumeOrder: (id) => {
    const order = get().heldOrders.find((o) => o.id === id);
    set((s) => ({ heldOrders: s.heldOrders.filter((o) => o.id !== id) }));
    return order;
  },
  removeHeldOrder: (id) => set((s) => ({ heldOrders: s.heldOrders.filter((o) => o.id !== id) })),
  updateHeldOrder: (id, patch) => set((s) => ({ heldOrders: s.heldOrders.map((o) => o.id === id ? { ...o, ...patch } : o) })),

  checkoutOrder: (lines, customerId, paymentMethodId) => {
    const total = lines.reduce((s, l) => s + l.price * l.qty, 0);
    const number = `Z-${1000 + get().receipts.length + 1}`;
    const receipt: Receipt = { id: uid(), number, lines, total, customerId, paymentMethodId, cashierId: "cashier-1", createdAt: new Date().toISOString() };
    set((s) => ({ receipts: [receipt, ...s.receipts] }));
    const inv = get().inventory;
    const updates: Record<string, number> = {};
    lines.forEach((l) => {
      const item = inv.find((i) => i.id === l.itemId);
      if (!item) return;
      if (item.recipe?.length) {
        item.recipe.forEach((r) => {
          updates[r.itemId] = (updates[r.itemId] ?? 0) - r.qty * l.qty;
        });
      } else {
        updates[l.itemId] = (updates[l.itemId] ?? 0) - l.qty;
      }
    });
    Object.entries(updates).forEach(([id, delta]) => get().updateStock(id, delta));
    get().addTransaction({ label: `POS ${number}`, amount: total, type: "income", date: receipt.createdAt, receipt: number });
    get().log({ actor: "cashier-1", action: "Sale", detail: `${number} • $${total.toFixed(2)}`, severity: "info" });
    return receipt;
  },

  voidReceipt: (id, reason) => {
    const r = get().receipts.find((x) => x.id === id);
    set((s) => ({ receipts: s.receipts.map((x) => (x.id === id ? { ...x, voided: true } : x)) }));
    if (r) get().log({ actor: "cashier-1", action: "Receipt voided", detail: `${r.number} • ${reason}`, severity: "alert" });
  },

  addAppointment: (a) => set((s) => ({ appointments: [...s.appointments, { ...a, id: uid() }] })),
  updateAppointment: (id, patch) => set((s) => ({ appointments: s.appointments.map((x) => x.id === id ? { ...x, ...patch } : x) })),
  removeAppointment: (id) => set((s) => ({ appointments: s.appointments.filter((x) => x.id !== id) })),

  addStaff: (s) => {
    const st: Staff = { ...s, id: uid(), pin: s.pin ?? pin(), hiredAt: new Date().toISOString() };
    set((state) => ({ staff: [...state.staff, st] }));
    get().log({ actor: "owner", action: "Staff added", detail: `${st.name} (${st.role})`, severity: "info" });
    return st;
  },
  updateStaff: (id, patch) => set((s) => ({ staff: s.staff.map((x) => x.id === id ? { ...x, ...patch } : x) })),
  removeStaff: (id) => set((s) => ({ staff: s.staff.filter((x) => x.id !== id) })),
  resetPin: (id) => {
    const np = pin();
    set((s) => ({ staff: s.staff.map((x) => x.id === id ? { ...x, pin: np } : x) }));
    get().log({ actor: "owner", action: "PIN reset", detail: id, severity: "warn" });
    return np;
  },
  clockIn: (staffId) => {
    const open = get().shifts.find((sh) => sh.staffId === staffId && !sh.end);
    if (open) return;
    set((s) => ({ shifts: [...s.shifts, { id: uid(), staffId, start: new Date().toISOString() }] }));
  },
  clockOut: (staffId) => set((s) => ({
    shifts: s.shifts.map((sh) => (sh.staffId === staffId && !sh.end) ? { ...sh, end: new Date().toISOString() } : sh),
  })),

  updateSubscription: (patch) => set((s) => ({ subscription: { ...s.subscription, ...patch } })),

  addPaymentMethod: (m) => set((s) => ({ paymentMethods: [...s.paymentMethods, { ...m, id: uid() }] })),
  updatePaymentMethod: (id, patch) => set((s) => ({ paymentMethods: s.paymentMethods.map((x) => x.id === id ? { ...x, ...patch } : x) })),
  removePaymentMethod: (id) => set((s) => ({ paymentMethods: s.paymentMethods.filter((x) => x.id !== id) })),

  updateSettings: (patch) => set((s) => ({ settings: { ...s.settings, ...patch } })),

  log: (e) => set((s) => ({ audit: [{ ...e, id: uid(), at: new Date().toISOString() }, ...s.audit].slice(0, 100) })),
}));
