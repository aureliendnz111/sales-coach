"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { LayoutDashboard, FileText, Headphones, PhoneCall, BarChart2 } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/scripts", icon: FileText, label: "Scripts" },
  { href: "/sessions", icon: Headphones, label: "Live Copilot", soon: true },
  { href: "/call-analysis", icon: PhoneCall, label: "Analyse de calls", soon: true },
  { href: "/analytics", icon: BarChart2, label: "Analytics", soon: true },
] as const;

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-[232px] shrink-0 h-screen border-r border-stone-200 bg-stone-50 flex flex-col px-2 py-3">
      {/* Logo */}
      <div className="px-3 py-2 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 bg-stone-900 rounded-md flex items-center justify-center shrink-0">
            <span className="text-white text-[11px] font-bold">SC</span>
          </div>
          <span className="font-semibold text-[13px] text-stone-800 leading-none">Sales Coach</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-px">
        {NAV.map(({ href, icon: Icon, label, soon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2 px-3 py-[6px] rounded-md text-[13.5px] transition-colors",
                active
                  ? "bg-stone-200/70 text-stone-900 font-medium"
                  : "text-stone-600 hover:bg-stone-200/40 hover:text-stone-900"
              )}
            >
              <Icon className={cn("w-4 h-4 shrink-0", active ? "text-stone-700" : "text-stone-400")} />
              <span className="flex-1">{label}</span>
              {soon && (
                <span className="text-[10px] bg-stone-200 text-stone-500 px-1.5 py-0.5 rounded-full font-medium leading-none">
                  Bientôt
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="border-t border-stone-200 px-3 pt-3">
        <UserButton
          appearance={{ elements: { userButtonAvatarBox: "w-7 h-7" } }}
        />
      </div>
    </aside>
  );
}
