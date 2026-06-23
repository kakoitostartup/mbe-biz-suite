import {
  LayoutDashboard,
  Wallet,
  Package,
  Users,
  ListChecks,
  UserCog,
  FileBarChart2,
  Settings,
  TrendingUp,
  PlusCircle,
  MinusCircle,
  FileText,
  Tags,
  UserPlus,
  CalendarCheck,
  KanbanSquare,
  BarChart3,
  User as UserIcon,
  Crown,
  Share2,
  Bell,
  Briefcase,
  Scissors,
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
      { id: "dashboard", label: "Главная", icon: LayoutDashboard },
    ],
  },
  {
    id: "finance",
    label: "Финансы",
    icon: Wallet,
    features: [
      { id: "dashboard", label: "Выручка и расходы", icon: TrendingUp },
      { id: "add-sale", label: "Добавить продажу", icon: PlusCircle },
      { id: "add-expense", label: "Добавить расход", icon: MinusCircle },
      { id: "reports", label: "Отчёты (P&L)", icon: FileText },
      { id: "categories", label: "Категории", icon: Tags },
    ],
  },
  {
    id: "inventory",
    label: "Склад",
    icon: Package,
    features: [
      { id: "stock", label: "Список расходников", icon: Package },
      { id: "critical", label: "Заканчивается", icon: Bell },
    ],
  },
  {
    id: "crm",
    label: "CRM",
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
      { id: "bookings", label: "Записи", icon: CalendarCheck },
      { id: "add", label: "Добавить задачу", icon: PlusCircle },
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
      { id: "subscription", label: "Подписка", icon: Crown },
      { id: "services", label: "Услуги", icon: Scissors },
      { id: "referral", label: "Рефералы", icon: Share2 },
      { id: "notifications", label: "Уведомления", icon: Bell },
    ],
  },
];

export const getModule = (id: ModuleId) => modules.find((m) => m.id === id)!;

/**
 * Features that should open as a centered modal popup over the module's
 * default page, instead of replacing the main content.
 */
export const MODAL_FEATURES: Record<string, { title: string }> = {
  "finance.add-sale":     { title: "Добавить продажу" },
  "finance.add-expense":  { title: "Добавить расход" },
  "finance.categories":   { title: "Категории" },
  "crm.add-customer":     { title: "Добавить клиента" },
  "tasks.add":            { title: "Новая задача" },
  "staff.invites":        { title: "Пригласить сотрудника" },
};

export const isModalFeature = (moduleId: string, featureId: string) =>
  !!MODAL_FEATURES[`${moduleId}.${featureId}`];
