import {
  LayoutDashboard,
  Scissors,
  CalendarCheck,
  Users,
  ListChecks,
  Wallet,
  UserCog,
  FileBarChart2,
  Settings,
  TrendingUp,
  PlusCircle,
  MinusCircle,
  FileText,
  Tags,
  UserPlus,
  CalendarDays,
  KanbanSquare,
  BarChart3,
  Send,
  Sparkles,
  User as UserIcon,
  Crown,
  Share2,
  Bell,
  Briefcase,
  type LucideIcon,
} from "lucide-react";
import { ModuleId } from "./navStore";

export type Feature = {
  id: string;
  label: string;
  icon: LucideIcon;
};

export type ModuleDef = {
  id: ModuleId;
  label: string;
  icon: LucideIcon;
  features: Feature[];
};

export const modules: ModuleDef[] = [
  {
    id: "overview",
    label: "Обзор",
    icon: LayoutDashboard,
    features: [
      { id: "dashboard", label: "Главная", icon: Sparkles },
    ],
  },
  {
    id: "services",
    label: "Услуги",
    icon: Scissors,
    features: [
      { id: "list", label: "Список услуг", icon: Scissors },
      { id: "add", label: "Добавить услугу", icon: PlusCircle },
    ],
  },
  {
    id: "bookings",
    label: "Записи",
    icon: CalendarCheck,
    features: [
      { id: "list", label: "Все записи", icon: CalendarCheck },
      { id: "new", label: "Создать запись", icon: PlusCircle },
      { id: "broadcast", label: "Рассылка в WhatsApp", icon: Send },
    ],
  },
  {
    id: "crm",
    label: "Клиенты",
    icon: Users,
    features: [
      { id: "customers", label: "Список клиентов", icon: Users },
      { id: "add-customer", label: "Добавить клиента", icon: UserPlus },
      { id: "pipeline", label: "Воронка продаж", icon: KanbanSquare },
    ],
  },
  {
    id: "tasks",
    label: "Задачи",
    icon: ListChecks,
    features: [
      { id: "my", label: "Мои задачи", icon: ListChecks },
      { id: "all", label: "Все задачи", icon: Users },
      { id: "projects", label: "Проекты", icon: Briefcase },
      { id: "calendar", label: "Календарь", icon: CalendarDays },
      { id: "add", label: "Добавить задачу", icon: PlusCircle },
    ],
  },
  {
    id: "finance",
    label: "Финансы",
    icon: Wallet,
    features: [
      { id: "dashboard", label: "Выручка и расходы", icon: TrendingUp },
      { id: "add-sale", label: "Добавить доход", icon: PlusCircle },
      { id: "add-expense", label: "Добавить расход", icon: MinusCircle },
      { id: "reports", label: "Отчёты (P&L)", icon: FileText },
      { id: "categories", label: "Категории", icon: Tags },
    ],
  },
  {
    id: "staff",
    label: "Сотрудники",
    icon: UserCog,
    features: [
      { id: "list", label: "Список сотрудников", icon: Users },
      { id: "kpi", label: "KPI и показатели", icon: BarChart3 },
      { id: "invites", label: "Приглашения", icon: UserPlus },
    ],
  },
  {
    id: "reports",
    label: "Отчёты",
    icon: FileBarChart2,
    features: [
      { id: "overview", label: "Сводка", icon: BarChart3 },
      { id: "sales", label: "По услугам", icon: TrendingUp },
    ],
  },
  {
    id: "settings",
    label: "Настройки",
    icon: Settings,
    features: [
      { id: "profile", label: "Профиль", icon: UserIcon },
      { id: "subscription", label: "Тариф", icon: Crown },
      { id: "referral", label: "Рефералы", icon: Share2 },
      { id: "notifications", label: "Уведомления", icon: Bell },
    ],
  },
];

export const getModule = (id: ModuleId) => modules.find((m) => m.id === id)!;
