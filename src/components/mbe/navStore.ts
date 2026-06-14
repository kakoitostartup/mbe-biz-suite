import { create } from "zustand";

export type ModuleId =
  | "finance"
  | "inventory"
  | "crm"
  | "tasks"
  | "staff"
  | "reports"
  | "pos"
  | "settings";

type NavState = {
  activeModule: ModuleId;
  activeFeature: Record<ModuleId, string>;
  mobileOpen: boolean;
  setModule: (m: ModuleId) => void;
  setFeature: (m: ModuleId, f: string) => void;
  setMobileOpen: (b: boolean) => void;
};

const defaults: Record<ModuleId, string> = {
  finance: "dashboard",
  inventory: "arrivals",
  crm: "pipeline",
  tasks: "my",
  staff: "list",
  reports: "overview",
  pos: "new-sale",
  settings: "profile",
};

export const useNav = create<NavState>((set) => ({
  activeModule: "finance",
  activeFeature: { ...defaults },
  mobileOpen: false,
  setModule: (m) => set({ activeModule: m, mobileOpen: false }),
  setFeature: (m, f) =>
    set((s) => ({ activeFeature: { ...s.activeFeature, [m]: f }, mobileOpen: false })),
  setMobileOpen: (b) => set({ mobileOpen: b }),
}));
