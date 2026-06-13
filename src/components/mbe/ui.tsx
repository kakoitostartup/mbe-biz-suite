import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import { useStore } from "./store";

export const Panel = ({ className, children }: { className?: string; children: ReactNode }) => (
  <div className={cn("rounded-2xl bg-card hairline p-5", className)}>{children}</div>
);

export const SectionHeader = ({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) => (
  <div className="flex items-end justify-between mb-6 slide-up gap-4 flex-wrap">
    <div>
      <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
      {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
    </div>
    {action}
  </div>
);

export const Stat = ({ label, value, delta }: { label: string; value: string; delta?: string }) => (
  <Panel>
    <div className="text-[11px] uppercase tracking-widest text-muted-foreground">{label}</div>
    <div className="mt-2 text-3xl font-semibold tracking-tight">{value}</div>
    {delta && <div className="mt-1 text-xs text-muted-foreground">{delta}</div>}
  </Panel>
);

/**
 * Collapsible widget. Persists open/closed state in zustand by `id`.
 * Defaults to expanded.
 */
export const Widget = ({
  id,
  title,
  subtitle,
  action,
  className,
  defaultCollapsed,
  children,
}: {
  id: string;
  title: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  className?: string;
  defaultCollapsed?: boolean;
  children: ReactNode;
}) => {
  const widgets = useStore((s) => s.widgets);
  const toggle = useStore((s) => s.toggleWidget);
  const stored = widgets[id];
  const collapsed = stored === undefined ? !!defaultCollapsed : stored;

  return (
    <div className={cn("rounded-2xl bg-card hairline overflow-hidden", className)}>
      <header className="flex items-center gap-3 px-5 py-3 border-b border-border/60">
        <button
          onClick={() => toggle(id)}
          className="flex items-center gap-2 flex-1 min-w-0 text-left group"
        >
          <ChevronDown
            className={cn(
              "h-4 w-4 text-muted-foreground transition-transform shrink-0",
              collapsed && "-rotate-90"
            )}
          />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">{title}</div>
            {subtitle && <div className="text-[11px] text-muted-foreground truncate">{subtitle}</div>}
          </div>
        </button>
        {action && <div onClick={(e) => e.stopPropagation()}>{action}</div>}
      </header>
      {!collapsed && <div className="p-5">{children}</div>}
    </div>
  );
};
