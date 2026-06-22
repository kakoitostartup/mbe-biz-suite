import { create } from "zustand";

export type ModuleId =
  | "overview"
  | "services"
  | "bookings"
  | "crm"
  | "tasks"
  | "finance"
  | "staff"
  | "reports"
  | "settings"
  // legacy (kept for type-compat with archived components)
  | "inventory"
  | "pos";

type NavState = {
  activeModule: ModuleId;
  activeFeature: Record<ModuleId, string>;
  mobileOpen: boolean;
  setModule: (m: ModuleId) => void;
  setFeature: (m: ModuleId, f: string) => void;
  setMobileOpen: (b: boolean) => void;
};

const defaults: Record<ModuleId, string> = {
  overview: "dashboard",
  services: "list",
  bookings: "list",
  crm: "customers",
  tasks: "my",
  finance: "dashboard",
  staff: "list",
  reports: "overview",
  settings: "profile",
  inventory: "stock",
  pos: "new-sale",
};

export const useNav = create<NavState>((set) => ({
  activeModule: "overview",
  activeFeature: { ...defaults },
  mobileOpen: false,
  setModule: (m) => set({ activeModule: m, mobileOpen: false }),
  setFeature: (m, f) =>
    set((s) => ({ activeFeature: { ...s.activeFeature, [m]: f }, mobileOpen: false })),
  setMobileOpen: (b) => set({ mobileOpen: b }),
}));
