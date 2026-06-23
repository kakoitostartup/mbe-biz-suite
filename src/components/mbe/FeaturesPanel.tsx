import { cn } from "@/lib/utils";
import { getModule, isModalFeature } from "./modules";
import { useNav, useModal } from "./navStore";

export const FeaturesPanel = () => {
  const { activeModule, activeFeature, setFeature } = useNav();
  const openModal = useModal((s) => s.open);
  const mod = getModule(activeModule);
  const current = activeFeature[activeModule];

  return (
    <aside className="w-[260px] shrink-0 h-screen sticky top-0 bg-sidebar border-r border-border flex flex-col">
      <div className="px-5 pt-7 pb-4 border-b border-border">
        <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          Модуль
        </div>
        <div className="mt-1 flex items-center gap-2">
          <mod.icon className="h-4 w-4 text-foreground" />
          <h2 className="text-lg font-semibold tracking-tight">{mod.label}</h2>
        </div>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {mod.features.map((f) => {
          const Icon = f.icon;
          const asModal = isModalFeature(mod.id, f.id);
          const isActive = !asModal && current === f.id;
          return (
            <button
              key={f.id}
              onClick={() => {
                if (asModal) openModal(mod.id, f.id);
                else setFeature(mod.id, f.id);
              }}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-left transition-colors",
                isActive
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="truncate">{f.label}</span>
              {asModal && (
                <span className="ml-auto text-[9px] uppercase tracking-widest text-muted-foreground/70">
                  окно
                </span>
              )}
              {isActive && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-foreground/70" />
              )}
            </button>
          );
        })}
      </nav>
    </aside>
  );
};
