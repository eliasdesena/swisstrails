import { AppHeader } from "@/components/app/app-header";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-dvh flex flex-col bg-trail-950">
      <AppHeader />
      <main className="flex-1 relative overflow-hidden lg:pt-14 pb-16 lg:pb-0">
        {children}
      </main>
    </div>
  );
}
