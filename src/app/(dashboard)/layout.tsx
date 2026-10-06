import { Sidebar } from "@/components/layout/Sidebar";
import { MobileBlock } from "@/components/layout/MobileBlock";
import { AppHeader } from "@/components/layout/AppHeader";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <MobileBlock />
      {/* Desktop content */}
      <div className="hidden md:flex h-screen overflow-hidden bg-stone-50">
        <Sidebar />
        <div className="flex-1 min-w-0 flex flex-col">
          <AppHeader />
          <main className="flex-1 min-h-0 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </>
  );
}
