import { Sidebar } from "@/components/layout/Sidebar";
import { MobileBlock } from "@/components/layout/MobileBlock";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <MobileBlock />
      {/* Desktop content */}
      <div className="hidden md:flex h-screen overflow-hidden bg-stone-50">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </>
  );
}
