import { create } from "zustand";

const uid = () => Math.random().toString(36).slice(2, 9);
const daysAhead = (n: number) =>
  new Date(Date.now() + n * 86400000).toISOString();

export type Service = {
  id: string;
  name: string;
  price: number;
  durationMin: number;
  description?: string;
};

export type BookingStatus = "planned" | "arrived" | "no_show" | "done";

export type Booking = {
  id: string;
  customerName: string;
  phone: string;
  serviceId?: string;
  staffId?: string;
  start: string; // ISO
  status: BookingStatus;
  note?: string;
  customerId?: string; // links to CRM
  price?: number;
};

export type ProjectStatus = "active" | "paused" | "done";

export type Project = {
  id: string;
  name: string;
  description?: string;
  startAt: string;
  deadline: string;
  ownerId?: string;
  budget: number;
  status: ProjectStatus;
  createdAt: string;
};

type State = {
  services: Service[];
  bookings: Booking[];
  projects: Project[];

  addService: (s: Omit<Service, "id">) => Service;
  updateService: (id: string, patch: Partial<Service>) => void;
  removeService: (id: string) => void;

  addBooking: (b: Omit<Booking, "id">) => Booking;
  updateBooking: (id: string, patch: Partial<Booking>) => void;
  removeBooking: (id: string) => void;

  addProject: (p: Omit<Project, "id" | "createdAt">) => Project;
  updateProject: (id: string, patch: Partial<Project>) => void;
  removeProject: (id: string) => void;
};

const s1 = uid();
const s2 = uid();
const s3 = uid();

export const useServices = create<State>((set) => ({
  services: [
    { id: s1, name: "Женская стрижка", price: 2500, durationMin: 60, description: "Стрижка + укладка" },
    { id: s2, name: "Маникюр классический", price: 1800, durationMin: 45 },
    { id: s3, name: "Консультация", price: 0, durationMin: 30 },
  ],
  bookings: [
    {
      id: uid(),
      customerName: "Анна Смирнова",
      phone: "+7 999 123 45 67",
      serviceId: s1,
      start: daysAhead(0),
      status: "planned",
      price: 2500,
    },
    {
      id: uid(),
      customerName: "Марк Иванов",
      phone: "+7 999 765 43 21",
      serviceId: s2,
      start: daysAhead(1),
      status: "planned",
      price: 1800,
    },
    {
      id: uid(),
      customerName: "Ольга Петрова",
      phone: "+7 999 555 11 22",
      serviceId: s3,
      start: daysAhead(-1),
      status: "done",
      price: 0,
    },
  ],
  projects: [
    {
      id: uid(),
      name: "Запуск нового салона",
      description: "Открытие филиала на Тверской",
      startAt: daysAhead(-10),
      deadline: daysAhead(30),
      budget: 350000,
      status: "active",
      createdAt: daysAhead(-10),
    },
  ],

  addService: (s) => {
    const v = { ...s, id: uid() };
    set((st) => ({ services: [v, ...st.services] }));
    return v;
  },
  updateService: (id, patch) =>
    set((st) => ({ services: st.services.map((x) => (x.id === id ? { ...x, ...patch } : x)) })),
  removeService: (id) =>
    set((st) => ({ services: st.services.filter((x) => x.id !== id) })),

  addBooking: (b) => {
    const v = { ...b, id: uid() };
    set((st) => ({ bookings: [v, ...st.bookings] }));
    return v;
  },
  updateBooking: (id, patch) =>
    set((st) => ({ bookings: st.bookings.map((x) => (x.id === id ? { ...x, ...patch } : x)) })),
  removeBooking: (id) =>
    set((st) => ({ bookings: st.bookings.filter((x) => x.id !== id) })),

  addProject: (p) => {
    const v = { ...p, id: uid(), createdAt: new Date().toISOString() };
    set((st) => ({ projects: [v, ...st.projects] }));
    return v;
  },
  updateProject: (id, patch) =>
    set((st) => ({ projects: st.projects.map((x) => (x.id === id ? { ...x, ...patch } : x)) })),
  removeProject: (id) =>
    set((st) => ({ projects: st.projects.filter((x) => x.id !== id) })),
}));

export const statusLabel: Record<BookingStatus, string> = {
  planned: "Запланировано",
  arrived: "Пришёл",
  no_show: "Не пришёл",
  done: "Выполнено",
};

export const statusTone: Record<BookingStatus, string> = {
  planned: "bg-blue-500/15 text-blue-400",
  arrived: "bg-amber-500/15 text-amber-400",
  no_show: "bg-destructive/15 text-destructive",
  done: "bg-emerald-500/15 text-emerald-400",
};

export const projectStatusLabel: Record<ProjectStatus, string> = {
  active: "Активен",
  paused: "На паузе",
  done: "Завершён",
};
