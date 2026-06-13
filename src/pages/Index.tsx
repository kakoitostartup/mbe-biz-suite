import { useState } from "react";
import { Sidebar, Section } from "@/components/mbe/Sidebar";
import { Dashboard } from "@/components/mbe/Dashboard";
import { Inventory } from "@/components/mbe/Inventory";
import { CRM } from "@/components/mbe/CRM";
import { StaffPage } from "@/components/mbe/Staff";
import { Reports } from "@/components/mbe/Reports";
import { Profile } from "@/components/mbe/Misc";
import { FinanceHub, TasksHub, SettingsHub } from "@/components/mbe/hubs";
import { HeaderBell } from "@/components/mbe/HeaderBell";
import { HeaderCalendar } from "@/components/mbe/HeaderCalendar";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const Index = () => {
  const [active, setActive] = useState<Section>("overview");

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      <Sidebar active={active} onChange={setActive} />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-border flex items-center gap-3 px-6 panel">
          <div className="relative flex-1 max-w-md">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Поиск сделок, товаров, операций…" className="pl-9 h-9 bg-secondary border-transparent" />
          </div>
          <div className="ml-auto flex items-center gap-2">
            <HeaderBell />
            <div className="h-9 w-9 rounded-lg bg-primary text-primary-foreground grid place-items-center text-xs font-semibold">AM</div>
          </div>
        </header>

        <main className="flex-1 p-8 overflow-auto">
          {active === "overview" && <Dashboard onGoto={(s) => setActive((s === "pos" ? "finance" : s) as Section)} />}
          {active === "finance" && <FinanceHub />}
          {active === "inventory" && <Inventory />}
          {active === "crm" && <CRM />}
          {active === "tasks" && <TasksHub />}
          {active === "staff" && <StaffPage />}
          {active === "reports" && <Reports />}
          {active === "settings" && <SettingsHub />}
          {active === "profile" && <Profile />}
        </main>
      </div>
    </div>
  );
};

export default Index;
