import { useStore } from "./store";
import { Panel, SectionHeader } from "./ui";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Activity } from "lucide-react";

export const Profile = () => (
  <div className="fade-in max-w-3xl">
    <SectionHeader title="Profile" subtitle="Your account information." />
    <Panel>
      <div className="flex items-center gap-4 mb-6">
        <div className="h-16 w-16 rounded-full bg-primary text-primary-foreground grid place-items-center text-xl font-semibold">AM</div>
        <div>
          <div className="font-medium">Alex Mercer</div>
          <div className="text-xs text-muted-foreground">Owner • MBE Workspace</div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><Label>Full name</Label><Input defaultValue="Alex Mercer" /></div>
        <div><Label>Email</Label><Input defaultValue="alex@mbe.app" /></div>
        <div><Label>Company</Label><Input defaultValue="MBE Studio" /></div>
        <div><Label>Currency</Label><Input defaultValue="USD" /></div>
      </div>
    </Panel>
  </div>
);

export const SettingsPage = ({ onGoto }: { onGoto?: (s: string) => void }) => {
  const { settings, updateSettings, heldOrders } = useStore();
  return (
    <div className="fade-in max-w-3xl">
      <SectionHeader title="Settings" subtitle="Workspace preferences." />

      <Panel className="mb-4">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-lg bg-foreground text-background grid place-items-center"><Activity className="h-4 w-4" /></div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">Live orders dashboard</div>
                <div className="text-xs text-muted-foreground">Real-time view of open POS orders with timers and prep comments. Built for coffee shops & restaurants.</div>
              </div>
              <Switch checked={settings.liveOrdersEnabled} onCheckedChange={(v) => updateSettings({ liveOrdersEnabled: v })} />
            </div>
            {settings.liveOrdersEnabled && (
              <div className="mt-3 flex items-center justify-between rounded-lg bg-secondary/40 hairline p-3">
                <div className="text-xs text-muted-foreground">{heldOrders.length} open orders right now</div>
                <Button size="sm" className="h-8" onClick={() => onGoto?.("live")}>Open live dashboard</Button>
              </div>
            )}
          </div>
        </div>
      </Panel>

      <Panel>
        <div className="space-y-4">
          {[
            ["Email notifications", "Get notified about deals and low stock"],
            ["Auto-sync CRM to Finance", "Issue receipts when deals are completed"],
            ["Show overdue task badges", "Highlight overdue items prominently"],
          ].map(([t, d]) => (
            <div key={t} className="flex items-center justify-between py-2 border-b border-border last:border-0">
              <div>
                <div className="text-sm font-medium">{t}</div>
                <div className="text-xs text-muted-foreground">{d}</div>
              </div>
              <Switch defaultChecked />
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
};
