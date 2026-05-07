import { Sidebar } from "@/components/layout/Sidebar";
import { Monitor } from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Mobile block */}
      <div className="flex md:hidden min-h-screen bg-white flex-col items-center justify-center px-8 text-center gap-5">
        <div className="w-12 h-12 bg-stone-100 rounded-2xl flex items-center justify-center">
          <Monitor className="w-6 h-6 text-stone-400" />
        </div>
        <div className="space-y-2">
          <p className="text-[16px] font-semibold text-stone-900">Dashboard disponible sur desktop</p>
          <p className="text-[13.5px] text-stone-400 leading-relaxed max-w-xs">
            Rumios est optimisé pour une utilisation sur ordinateur. Connecte-toi depuis ton Mac ou PC pour accéder à l&apos;application.
          </p>
        </div>
      </div>
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
