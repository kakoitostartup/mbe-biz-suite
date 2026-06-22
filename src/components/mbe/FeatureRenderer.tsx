import { Finance } from "./Finance";
import { CRM } from "./CRM";
import { TaskList } from "./TaskList";
import { CalendarBoard } from "./Calendar";
import { StaffPage } from "./Staff";
import { Reports } from "./Reports";
import { Profile, SettingsPage } from "./Misc";
import { Premium } from "./Premium";
import { Referral } from "./Referral";
import {
  AddTransactionForm, FinanceCategories, CustomersList, AddCustomerForm,
  AddTaskForm, StaffInvites,
} from "./Features";
import { Overview } from "./Overview";
import { BookingsPage } from "./Bookings";
import { ServicesPage } from "./Services";
import { ProjectsPage } from "./Projects";
import { ModuleId } from "./navStore";

type Key = `${ModuleId}.${string}`;

const map: Partial<Record<Key, () => JSX.Element>> = {
  // Overview
  "overview.dashboard": () => <Overview />,

  // Services
  "services.list": () => <ServicesPage />,
  "services.add":  () => <ServicesPage focus="add" />,

  // Bookings
  "bookings.list":      () => <BookingsPage focus="list" />,
  "bookings.new":       () => <BookingsPage focus="new" />,
  "bookings.broadcast": () => <BookingsPage focus="broadcast" />,

  // Finance
  "finance.dashboard":  () => <Finance hideAdd />,
  "finance.add-sale":   () => <AddTransactionForm defaultType="income" />,
  "finance.add-expense":() => <AddTransactionForm defaultType="expense" />,
  "finance.reports":    () => <Reports focus="sales" />,
  "finance.categories": () => <FinanceCategories />,

  // CRM (clients)
  "crm.pipeline":     () => <CRM />,
  "crm.customers":    () => <CustomersList />,
  "crm.add-customer": () => <AddCustomerForm />,

  // Tasks
  "tasks.my":       () => <TaskList />,
  "tasks.all":      () => <TaskList />,
  "tasks.projects": () => <ProjectsPage />,
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
