import {
  Wallet,
  Boxes,
  Users,
  ListChecks,
  UserCog,
  FileBarChart2,
  ShoppingCart,
  Settings,
  TrendingUp,
  PlusCircle,
  MinusCircle,
  FileText,
  Tags,
  PackagePlus,
  PackageMinus,
  Package,
  AlertTriangle,
  ClipboardList,
  Truck,
  KanbanSquare,
  UserPlus,
  Handshake,
  Palette,
  History,
  BarChart3,
  Gift,
  CalendarDays,
  User as UserIcon,
  Crown,
  Share2,
  Bell,
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
    icon: Boxes,
    features: [
      { id: "arrivals", label: "Приход товаров", icon: PackagePlus },
      { id: "sales", label: "Продажа товаров", icon: PackageMinus },
      { id: "stock", label: "Товары на складе", icon: Package },
      { id: "critical", label: "Критический запас", icon: AlertTriangle },
      { id: "recipes", label: "Техкарты", icon: ClipboardList },
      { id: "suppliers", label: "Поставщики", icon: Truck },
    ],
  },
  {
    id: "crm",
    label: "CRM",
    icon: Users,
    features: [
      { id: "pipeline", label: "Воронка продаж", icon: KanbanSquare },
      { id: "customers", label: "Список клиентов", icon: Users },
      { id: "add-customer", label: "Добавить клиента", icon: UserPlus },
      { id: "add-deal", label: "Добавить сделку", icon: Handshake },
      { id: "stages", label: "Настройка статусов", icon: Palette },
    ],
  },
  {
    id: "pos",
    label: "POS",
    icon: ShoppingCart,
    features: [
      { id: "new-sale", label: "Новая продажа", icon: ShoppingCart },
      { id: "history", label: "История продаж", icon: History },
      { id: "reports", label: "Отчёты по продажам", icon: BarChart3 },
      { id: "loyalty", label: "Бонусные карты", icon: Gift },
    ],
  },
  {
    id: "tasks",
    label: "Задачи",
    icon: ListChecks,
    features: [
      { id: "my", label: "Мои задачи", icon: ListChecks },
      { id: "all", label: "Все задачи (команда)", icon: Users },
      { id: "calendar", label: "Календарь", icon: CalendarDays },
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
      { id: "revision", label: "Ревизия склада", icon: ClipboardList },
      { id: "sales", label: "По продажам", icon: TrendingUp },
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
