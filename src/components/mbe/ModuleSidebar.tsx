import { Logo } from "./Logo";
import { cn } from "@/lib/utils";
import { modules } from "./modules";
import { useNav } from "./navStore";

export const ModuleSidebar = () => {
  const { activeModule, setModule } = useNav();
  return (
    <aside className="w-[220px] shrink-0 h-screen sticky top-0 panel border-r border-border flex flex-col">
      <div className="px-6 pt-7 pb-5 border-b border-border flex items-center justify-center">
        <Logo />
      </div>
      <div className="px-3 py-4 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
        Модули
      </div>
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {modules.map((m) => {
          const Icon = m.icon;
          const isActive = activeModule === m.id;
          return (
            <button
              key={m.id}
              onClick={() => setModule(m.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all",
                isActive
                  ? "bg-primary text-primary-foreground shadow-elegant"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="font-medium tracking-tight">{m.label}</span>
            </button>
          );
        })}
      </nav>
      <div className="px-3 pb-5 pt-3 border-t border-border">
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-secondary/50">
          <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground grid place-items-center text-xs font-semibold">
            AM
          </div>
          <div className="leading-tight">
            <div className="text-xs font-medium">Алекс Мерсер</div>
            <div className="text-[10px] text-muted-foreground">Владелец</div>
          </div>
        </div>
      </div>
    </aside>
  );
};
