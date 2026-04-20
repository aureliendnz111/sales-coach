"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useUser, useClerk } from "@clerk/nextjs";
import { LayoutDashboard, FileText, Headphones, PhoneCall, BarChart2, Swords, LogOut, Settings, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useRef, useEffect } from "react";

const NAV = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/scripts", icon: FileText, label: "Scripts" },
  { href: "/playground", icon: Swords, label: "Playground", soon: true },
  { href: "/sessions", icon: Headphones, label: "Live Copilot", soon: true },
  { href: "/call-analysis", icon: PhoneCall, label: "Analyse de calls", soon: true },
  { href: "/analytics", icon: BarChart2, label: "Analytics", soon: true },
] as const;

function UserMenu() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!user) return null;

  const initials = [user.firstName, user.lastName]
    .filter(Boolean)
    .map(n => n![0])
    .join("")
    .toUpperCase() || user.emailAddresses[0]?.emailAddress[0].toUpperCase();

  const displayName = user.firstName
    ? `${user.firstName}${user.lastName ? " " + user.lastName : ""}`
    : user.emailAddresses[0]?.emailAddress;

  const email = user.emailAddresses[0]?.emailAddress;

  return (
    <div ref={ref} className="relative">
      {open && (
        <div className="absolute bottom-full left-0 right-0 mb-1 bg-white border border-stone-200 rounded-xl shadow-lg overflow-hidden z-50">
          <button
            onClick={() => { router.push("/settings"); setOpen(false); }}
            className="flex items-center gap-2.5 w-full px-3 py-2.5 text-[13px] text-stone-700 hover:bg-stone-50 transition-colors"
          >
            <Settings className="w-3.5 h-3.5 text-stone-400" />
            Paramètres
          </button>
          <div className="border-t border-stone-100" />
          <button
            onClick={() => signOut({ redirectUrl: "/" })}
            className="flex items-center gap-2.5 w-full px-3 py-2.5 text-[13px] text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Se déconnecter
          </button>
        </div>
      )}

      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2.5 w-full rounded-lg px-2 py-2 hover:bg-stone-200/40 transition-colors group"
      >
        <div className="w-7 h-7 rounded-full bg-stone-900 text-white text-[11px] font-bold flex items-center justify-center shrink-0 overflow-hidden">
          {user.hasImage
            ? <img src={user.imageUrl} alt="" className="w-full h-full object-cover" />
            : initials
          }
        </div>
        <div className="flex-1 min-w-0 text-left">
          <p className="text-[12.5px] font-medium text-stone-800 truncate leading-tight">{displayName}</p>
          <p className="text-[11px] text-stone-400 truncate leading-tight">{email}</p>
        </div>
        <ChevronUp className={cn("w-3.5 h-3.5 text-stone-400 shrink-0 transition-transform", open ? "rotate-0" : "rotate-180")} />
      </button>
    </div>
  );
}

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-[232px] shrink-0 h-screen border-r border-stone-200 bg-stone-50 flex flex-col px-2 py-3">
      {/* Logo */}
      <div className="px-3 py-2 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 bg-stone-900 rounded-md flex items-center justify-center shrink-0">
            <span className="text-white text-[11px] font-bold">R</span>
          </div>
          <span className="font-semibold text-[13px] text-stone-800 leading-none">Rumos.ai</span>
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
      <div className="border-t border-stone-200 pt-2">
        <UserMenu />
      </div>
    </aside>
  );
}
