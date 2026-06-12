import { ReactNode, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Finance } from "./Finance";
import { POS } from "./POS";
import { TaskList } from "./TaskList";
import { CalendarBoard } from "./Calendar";
import { LiveOrders } from "./LiveOrders";
import { Premium } from "./Premium";
import { Referral } from "./Referral";
import { Profile, SettingsPage } from "./Misc";

const HubShell = ({
  title,
  subtitle,
  tabs,
  defaultTab,
}: {
  title: string;
  subtitle: string;
  tabs: { value: string; label: string; content: ReactNode }[];
  defaultTab?: string;
}) => {
  const [tab, setTab] = useState(defaultTab ?? tabs[0].value);
  return (
    <div className="fade-in">
      <div className="mb-6 slide-up">
        <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
        <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
      </div>
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-secondary mb-4">
          {tabs.map((t) => (
            <TabsTrigger key={t.value} value={t.value}>{t.label}</TabsTrigger>
          ))}
        </TabsList>
        {tabs.map((t) => (
          <TabsContent key={t.value} value={t.value} className="mt-0">{t.content}</TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export const FinanceHub = () => (
  <HubShell
    title="Финансы"
    subtitle="Доходы, расходы, касса и аналитика."
    tabs={[
      { value: "overview", label: "Обзор", content: <Finance /> },
      { value: "pos", label: "Касса (POS)", content: <POS /> },
    ]}
  />
);

export const TasksHub = () => (
  <HubShell
    title="Задачи"
    subtitle="Задачи команды, календарь и живые заказы."
    tabs={[
      { value: "list", label: "Список", content: <TaskList /> },
      { value: "calendar", label: "Календарь", content: <div className="rounded-2xl bg-card hairline p-5"><CalendarBoard /></div> },
      { value: "live", label: "Live-заказы", content: <LiveOrders /> },
    ]}
  />
);

export const SettingsHub = () => (
  <HubShell
    title="Настройки"
    subtitle="Профиль, тариф, рефералы и уведомления."
    tabs={[
      { value: "profile", label: "Профиль", content: <Profile /> },
      { value: "subscription", label: "Тариф", content: <Premium /> },
      { value: "referral", label: "Рефералы", content: <Referral /> },
      { value: "notifications", label: "Уведомления", content: <SettingsPage /> },
    ]}
  />
);
