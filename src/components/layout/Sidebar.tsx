"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useUser, useClerk } from "@clerk/nextjs";
import { LayoutDashboard, FileText, Headphones, PhoneCall, BarChart2, Swords, LogOut, Settings, ChevronUp, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useRef, useEffect } from "react";

const NAV = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/scripts", icon: FileText, label: "Scripts" },
  { href: "/call-analysis", icon: PhoneCall, label: "Analyse de calls" },
  { href: "/playground", icon: Swords, label: "Playground", soon: true },
  { href: "/sessions", icon: Headphones, label: "Live Copilot", soon: true },
  { href: "/analytics", icon: BarChart2, label: "Analytics", soon: true },
] as const;

function UserMenu({ collapsed }: { collapsed: boolean }) {
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

  const avatar = (
    <div className="w-7 h-7 rounded-full bg-violet-500 text-white text-[11px] font-bold flex items-center justify-center shrink-0 overflow-hidden">
      {user.hasImage
        ? <img src={user.imageUrl} alt="" className="w-full h-full object-cover" />
        : initials
      }
    </div>
  );

  return (
    <div ref={ref} className="relative">
      {open && (
        <div className="absolute bottom-full left-0 right-0 mb-1 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden z-50">
          <button
            onClick={() => { router.push("/settings"); setOpen(false); }}
            className="flex items-center gap-2.5 w-full px-3 py-2.5 text-[13px] text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Settings className="w-3.5 h-3.5 text-slate-400" />
            {!collapsed && "Paramètres"}
          </button>
          <div className="border-t border-slate-100" />
          <button
            onClick={() => signOut({ redirectUrl: "/" })}
            className="flex items-center gap-2.5 w-full px-3 py-2.5 text-[13px] text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            {!collapsed && "Se déconnecter"}
          </button>
        </div>
      )}

      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "flex items-center w-full rounded-lg px-2 py-2 hover:bg-white/5 transition-colors",
          collapsed ? "justify-center" : "gap-2.5"
        )}
      >
        {avatar}
        {!collapsed && (
          <>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-[12.5px] font-medium text-white truncate leading-tight">{displayName}</p>
              <p className="text-[11px] text-slate-400 truncate leading-tight">{email}</p>
            </div>
            <ChevronUp className={cn("w-3.5 h-3.5 text-slate-500 shrink-0 transition-transform", open ? "rotate-0" : "rotate-180")} />
          </>
        )}
      </button>
    </div>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("sidebar-collapsed");
    if (saved === "true") setCollapsed(true);
  }, []);

  function toggle() {
    setCollapsed(c => {
      localStorage.setItem("sidebar-collapsed", String(!c));
      return !c;
    });
  }

  return (
    <aside className={cn(
      "relative shrink-0 h-screen bg-slate-900 flex flex-col px-3 py-4 transition-all duration-200",
      collapsed ? "w-[60px]" : "w-[240px]"
    )}>
      {/* Logo */}
      <div className={cn("px-2 py-1.5 mb-5 flex items-center", collapsed ? "justify-center" : "gap-2.5")}>
        <div className="w-7 h-7 bg-violet-600 rounded-lg flex items-center justify-center shrink-0 shadow-lg shadow-violet-900/40">
          <span className="text-white text-[11px] font-bold">R</span>
        </div>
        {!collapsed && <span className="font-semibold text-[13.5px] text-white leading-none tracking-tight">ceciestuntest.com</span>}
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5">
        {NAV.map(({ href, icon: Icon, label, ...rest }) => {
          const soon = "soon" in rest ? rest.soon : false;
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              className={cn(
                "flex items-center rounded-lg text-[13px] transition-all",
                collapsed ? "justify-center px-2 py-2.5" : "gap-2.5 px-3 py-2",
                active
                  ? "bg-violet-500/20 text-white font-medium"
                  : "text-slate-400 hover:bg-white/5 hover:text-slate-100"
              )}
            >
              <Icon className={cn("w-4 h-4 shrink-0 transition-colors", active ? "text-violet-400" : "text-slate-500")} />
              {!collapsed && (
                <>
                  <span className="flex-1">{label}</span>
                  {soon && (
                    <span className="text-[10px] bg-white/10 text-slate-400 px-1.5 py-0.5 rounded-full font-medium leading-none">
                      Bientôt
                    </span>
                  )}
                </>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="border-t border-white/10 pt-2">
        <UserMenu collapsed={collapsed} />
      </div>

      {/* Toggle button */}
      <button
        onClick={toggle}
        className="absolute -right-3 top-8 w-6 h-6 bg-slate-800 border border-slate-700 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-600 transition-colors shadow-md cursor-pointer"
      >
        <ChevronLeft className={cn("w-3.5 h-3.5 transition-transform duration-200", collapsed && "rotate-180")} />
      </button>
    </aside>
  );
}
