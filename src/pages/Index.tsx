import { ModuleSidebar } from "@/components/mbe/ModuleSidebar";
import { FeaturesPanel } from "@/components/mbe/FeaturesPanel";
import { FeatureRenderer } from "@/components/mbe/FeatureRenderer";
import { FeatureModal } from "@/components/mbe/FeatureModal";
import { HeaderBell } from "@/components/mbe/HeaderBell";
import { useNav } from "@/components/mbe/navStore";
import { Search, Menu, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

const Index = () => {
  const { activeModule, activeFeature, mobileOpen, setMobileOpen } = useNav();
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      {/* Desktop nav */}
      {!isMobile && (
        <>
          <ModuleSidebar />
          <FeaturesPanel />
        </>
      )}

      {/* Mobile overlay */}
      {isMobile && mobileOpen && (
        <div className="fixed inset-0 z-50 flex">
          <ModuleSidebar />
          <FeaturesPanel />
          <button
            className="flex-1 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
            aria-label="Закрыть меню"
          />
          <Button
            size="icon"
            variant="secondary"
            className="absolute top-3 right-3"
            onClick={() => setMobileOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-border flex items-center gap-3 px-4 md:px-6 panel">
          {isMobile && (
            <Button size="icon" variant="ghost" onClick={() => setMobileOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
          )}
          <div className="relative flex-1 max-w-md">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Поиск сделок, товаров, операций…"
              className="pl-9 h-9 bg-secondary border-transparent"
            />
          </div>
          <div className="ml-auto flex items-center gap-2">
            <HeaderBell />
            <div className="h-9 w-9 rounded-lg bg-primary text-primary-foreground grid place-items-center text-xs font-semibold">
              AM
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8 overflow-auto">
          <FeatureRenderer
            moduleId={activeModule}
            featureId={activeFeature[activeModule]}
          />
        </main>
      </div>

      <FeatureModal />
    </div>
  );
};

export default Index;
