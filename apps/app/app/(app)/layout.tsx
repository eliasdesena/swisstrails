import { AppHeader } from "@/components/app/app-header";
import { ScrollLock } from "@/components/app/scroll-lock";
import { MapAppPicker } from "@/components/app/map-app-picker";
import { PageTransition } from "@/components/app/page-transition";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-dvh flex flex-col bg-trail-950">
      <ScrollLock />
      <AppHeader />
      <main className="flex-1 relative overflow-hidden lg:pt-14">
        <PageTransition>{children}</PageTransition>
      </main>
      <MapAppPicker />
    </div>
  );
}
