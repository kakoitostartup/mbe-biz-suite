import { create } from "zustand";

export type NotificationType = "booking" | "inventory" | "task";

export type Notification = {
  id: string;
  type: NotificationType;
  text: string;
  date: string; // ISO
  read?: boolean;
};

type State = {
  items: Notification[];
  markAllRead: () => void;
  remove: (id: string) => void;
  add: (n: Omit<Notification, "id" | "date"> & { date?: string }) => void;
};

const seed: Notification[] = [
  {
    id: "n1",
    type: "booking",
    text: "Алина Смирнова записалась на «Женскую стрижку» сегодня в 15:00",
    date: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
  },
  {
    id: "n2",
    type: "inventory",
    text: 'Товар «Ванильный сироп» заканчивается (остаток 2 шт.)',
    date: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
  },
  {
    id: "n3",
    type: "task",
    text: 'Задача «Отправить договор» просрочена на 2 дня',
    date: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
  },
  {
    id: "n4",
    type: "booking",
    text: "Игорь Петров перенёс запись на завтра в 11:30",
    date: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(),
  },
];

export const useNotifications = create<State>((set) => ({
  items: seed,
  markAllRead: () => set((s) => ({ items: s.items.map((i) => ({ ...i, read: true })) })),
  remove: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
  add: (n) =>
    set((s) => ({
      items: [
        { id: crypto.randomUUID(), date: n.date ?? new Date().toISOString(), ...n },
        ...s.items,
      ],
    })),
}));
