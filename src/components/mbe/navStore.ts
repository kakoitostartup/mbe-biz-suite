import { create } from "zustand";

export type ModuleId =
  | "overview"
  | "finance"
  | "inventory"
  | "crm"
  | "tasks"
  | "staff"
  | "reports"
  | "settings"
  // legacy (kept for type-compat with archived components)
  | "services"
  | "bookings"
  | "pos";

type NavState = {
  activeModule: ModuleId;
  activeFeature: Record<ModuleId, string>;
  mobileOpen: boolean;
  setModule: (m: ModuleId) => void;
  setFeature: (m: ModuleId, f: string) => void;
  setMobileOpen: (b: boolean) => void;
};

export const defaultFeatures: Record<ModuleId, string> = {
  overview: "dashboard",
  finance: "dashboard",
  inventory: "stock",
  crm: "customers",
  tasks: "my",
  staff: "list",
  reports: "overview",
  settings: "profile",
  services: "list",
  bookings: "list",
  pos: "new-sale",
};

export const useNav = create<NavState>((set) => ({
  activeModule: "overview",
  activeFeature: { ...defaultFeatures },
  mobileOpen: false,
  setModule: (m) => set({ activeModule: m, mobileOpen: false }),
  setFeature: (m, f) =>
    set((s) => ({ activeFeature: { ...s.activeFeature, [m]: f }, mobileOpen: false })),
  setMobileOpen: (b) => set({ mobileOpen: b }),
}));

// ── Modal store (popup feature windows) ───────────────────────────────────
type ModalState = {
  moduleId: ModuleId | null;
  featureId: string | null;
  open: (moduleId: ModuleId, featureId: string) => void;
  close: () => void;
};

export const useModal = create<ModalState>((set) => ({
  moduleId: null,
  featureId: null,
  open: (moduleId, featureId) => set({ moduleId, featureId }),
  close: () => set({ moduleId: null, featureId: null }),
}));
