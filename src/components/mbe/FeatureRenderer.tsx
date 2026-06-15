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
import {
  AddTransactionForm, FinanceCategories, CustomersList, AddCustomerForm,
  AddDealForm, StagesEditor, SalesHistory, Loyalty, AddTaskForm, StaffInvites,
} from "./Features";
import { ModuleId } from "./navStore";

type Key = `${ModuleId}.${string}`;

const map: Partial<Record<Key, () => JSX.Element>> = {
  // Finance
  "finance.dashboard":  () => <Finance hideAdd />,
  "finance.add-sale":   () => <AddTransactionForm defaultType="income" />,
  "finance.add-expense":() => <AddTransactionForm defaultType="expense" />,
  "finance.reports":    () => <Reports focus="sales" />,
  "finance.categories": () => <FinanceCategories />,
  // Inventory
  "inventory.arrivals": () => <Inventory view="arrivals" />,
  "inventory.sales":    () => <Inventory view="sales" />,
  "inventory.stock":    () => <Inventory view="stock" />,
  "inventory.critical": () => <Inventory view="critical" />,
  "inventory.recipes":  () => <Inventory view="recipes" />,
  "inventory.suppliers":() => <Inventory view="suppliers" />,
  // CRM
  "crm.pipeline":     () => <CRM />,
  "crm.customers":    () => <CustomersList />,
  "crm.add-customer": () => <AddCustomerForm />,
  "crm.add-deal":     () => <AddDealForm />,
  "crm.stages":       () => <StagesEditor />,
  // POS
  "pos.new-sale": () => <POS />,
  "pos.history":  () => <SalesHistory />,
  "pos.reports":  () => <Reports focus="sales" />,
  "pos.loyalty":  () => <Loyalty />,
  // Tasks
  "tasks.my":  () => <TaskList />,
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
  "tasks.add": () => <AddTaskForm />,
  // Staff
  "staff.list":    () => <StaffPage />,
  "staff.kpi":     () => <StaffPage focus="kpi" hideAdd />,
  "staff.invites": () => <StaffInvites />,
  // Reports
  "reports.overview": () => <Reports focus="overview" />,
  "reports.revision": () => <Reports focus="revision" />,
  "reports.sales":    () => <Reports focus="sales" />,
  // Settings
  "settings.profile":       () => <Profile />,
  "settings.subscription":  () => <Premium />,
  "settings.referral":      () => <Referral />,
  "settings.notifications": () => <SettingsPage />,
};

export const FeatureRenderer = ({ moduleId, featureId }: { moduleId: ModuleId; featureId: string }) => {
  const key = `${moduleId}.${featureId}` as Key;
  const Comp = map[key];
  if (!Comp) {
    return (
      <div className="fade-in rounded-2xl bg-card hairline p-10 text-center text-sm text-muted-foreground">
        Раздел в разработке.
      </div>
    );
  }
  return <Comp />;
};
