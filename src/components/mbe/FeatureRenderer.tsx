import { Finance } from "./Finance";
import { Inventory } from "./Inventory";
import { CRM } from "./CRM";
import { POS } from "./POS";
import { TaskList } from "./TaskList";
import { CalendarBoard } from "./Calendar";
import { StaffPage } from "./Staff";
import { Reports } from "./Reports";
import { Profile, SettingsPage } from "./Misc";
import { Premium } from "./Premium";
import { Referral } from "./Referral";
import { ModuleId } from "./navStore";
import { Construction } from "lucide-react";

const Stub = ({ title, hint }: { title: string; hint?: string }) => (
  <div className="fade-in">
    <div className="mb-6">
      <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
      {hint && <p className="text-sm text-muted-foreground mt-1">{hint}</p>}
    </div>
    <div className="rounded-2xl bg-card hairline p-10 grid place-items-center text-center">
      <Construction className="h-10 w-10 text-muted-foreground mb-3" />
      <div className="text-sm text-muted-foreground max-w-md">
        Этот раздел в разработке. Каркас навигации готов — здесь появится форма / таблица / виджеты для «{title}».
      </div>
    </div>
  </div>
);

type Key = `${ModuleId}.${string}`;

const map: Partial<Record<Key, () => JSX.Element>> = {
  // Finance
  "finance.dashboard": () => <Finance />,
  "finance.add-sale": () => <Finance />,
  "finance.add-expense": () => <Finance />,
  "finance.reports": () => <Reports />,
  "finance.categories": () => <Stub title="Категории доходов и расходов" hint="Управление категориями операций." />,
  // Inventory
  "inventory.arrivals": () => <Inventory />,
  "inventory.sales": () => <Inventory />,
  "inventory.stock": () => <Inventory />,
  "inventory.critical": () => <Inventory />,
  "inventory.recipes": () => <Inventory />,
  "inventory.suppliers": () => <Stub title="Поставщики" hint="База поставщиков и условия поставок." />,
  // CRM
  "crm.pipeline": () => <CRM />,
  "crm.customers": () => <CRM />,
  "crm.add-customer": () => <CRM />,
  "crm.add-deal": () => <CRM />,
  "crm.stages": () => <Stub title="Настройка статусов" hint="Цвета и порядок этапов воронки." />,
  // POS
  "pos.new-sale": () => <POS />,
  "pos.history": () => <Stub title="История продаж" hint="Чеки и операции из кассы." />,
  "pos.reports": () => <Reports />,
  "pos.loyalty": () => <Stub title="Бонусные карты" hint="Привязка карт лояльности к клиентам CRM." />,
  // Tasks
  "tasks.my": () => <TaskList />,
  "tasks.all": () => <TaskList />,
  "tasks.calendar": () => (
    <div className="fade-in">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold tracking-tight">Календарь</h1>
        <p className="text-sm text-muted-foreground mt-1">Задачи и дедлайны команды.</p>
      </div>
      <div className="rounded-2xl bg-card hairline p-5"><CalendarBoard /></div>
    </div>
  ),
  "tasks.add": () => <TaskList />,
  // Staff
  "staff.list": () => <StaffPage />,
  "staff.kpi": () => <StaffPage />,
  "staff.invites": () => <Stub title="Приглашения" hint="Пригласите сотрудника по e-mail." />,
  // Reports
  "reports.overview": () => <Reports />,
  "reports.revision": () => <Reports />,
  "reports.sales": () => <Reports />,
  // Settings
  "settings.profile": () => <Profile />,
  "settings.subscription": () => <Premium />,
  "settings.referral": () => <Referral />,
  "settings.notifications": () => <SettingsPage />,
};

export const FeatureRenderer = ({ moduleId, featureId }: { moduleId: ModuleId; featureId: string }) => {
  const key = `${moduleId}.${featureId}` as Key;
  const Comp = map[key];
  if (!Comp) return <Stub title="Скоро" hint="Эта фича появится позже." />;
  return <Comp />;
};
