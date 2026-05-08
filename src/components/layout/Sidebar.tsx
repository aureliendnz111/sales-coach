"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useUser, useClerk } from "@clerk/nextjs";
import { LayoutDashboard, FileText, Headphones, PhoneCall, BarChart2, Swords, LogOut, Settings, ChevronUp, ChevronLeft, ChevronDown, Check } from "lucide-react";
import { RumiosLogo } from "@/components/RumiosLogo";
import { cn } from "@/lib/utils";
import { useState, useRef, useEffect } from "react";
import { useLang, type Lang } from "@/lib/lang-context";

const NAV_LABELS: Record<string, Record<Lang, string>> = {
  "/dashboard":    { fr: "Dashboard",         en: "Dashboard",      pt: "Dashboard" },
  "/scripts":      { fr: "Scripts",            en: "Scripts",        pt: "Guiões" },
  "/call-analysis":{ fr: "Analyse de calls",   en: "Call Analysis",  pt: "Análise de chamadas" },
  "/playground":   { fr: "Playground",         en: "Playground",     pt: "Playground" },
  "/sessions":     { fr: "Live Copilot",       en: "Live Copilot",   pt: "Live Copilot" },
  "/analytics":    { fr: "Analytics",          en: "Analytics",      pt: "Análises" },
};

const SOON_LABEL: Record<Lang, string> = { fr: "Bientôt", en: "Soon", pt: "Em breve" };
const SETTINGS_LABEL: Record<Lang, string> = { fr: "Paramètres", en: "Settings", pt: "Definições" };
const SIGNOUT_LABEL: Record<Lang, string> = { fr: "Se déconnecter", en: "Sign out", pt: "Terminar sessão" };
const LANG_LABELS: Record<Lang, string> = { fr: "Français", en: "English", pt: "Português" };

const NAV = [
  { href: "/dashboard", icon: LayoutDashboard },
  { href: "/scripts", icon: FileText },
  { href: "/call-analysis", icon: PhoneCall },
  { href: "/playground", icon: Swords, soon: true },
  { href: "/sessions", icon: Headphones, soon: true },
  { href: "/analytics", icon: BarChart2, soon: true },
] as const;

function UserMenu({ collapsed, lang }: { collapsed: boolean; lang: Lang }) {
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
    <div className="w-7 h-7 rounded-full bg-stone-900 text-white text-[11px] font-bold flex items-center justify-center shrink-0 overflow-hidden">
      {user.hasImage
        ? <img src={user.imageUrl} alt="" className="w-full h-full object-cover" />
        : initials
      }
    </div>
  );

  return (
    <div ref={ref} className="relative">
      {open && (
        <div className="absolute bottom-full left-0 right-0 mb-1 bg-white border border-stone-200 rounded-xl shadow-lg overflow-hidden z-50">
          <button
            onClick={() => { router.push("/settings"); setOpen(false); }}
            className="flex items-center gap-2.5 w-full px-3 py-2.5 text-[13px] text-stone-700 hover:bg-stone-50 transition-colors"
          >
            <Settings className="w-3.5 h-3.5 text-stone-400" />
            {!collapsed && SETTINGS_LABEL[lang]}
          </button>
          <div className="border-t border-stone-100" />
          <button
            onClick={() => signOut({ redirectUrl: "/" })}
            className="flex items-center gap-2.5 w-full px-3 py-2.5 text-[13px] text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            {!collapsed && SIGNOUT_LABEL[lang]}
          </button>
        </div>
      )}

      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "flex items-center w-full rounded-lg px-2 py-2 hover:bg-stone-100 transition-colors",
          collapsed ? "justify-center" : "gap-2.5"
        )}
      >
        {avatar}
        {!collapsed && (
          <>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-[12.5px] font-medium text-stone-800 truncate leading-tight">{displayName}</p>
              <p className="text-[11px] text-stone-400 truncate leading-tight">{email}</p>
            </div>
            <ChevronUp className={cn("w-3.5 h-3.5 text-stone-400 shrink-0 transition-transform", open ? "rotate-0" : "rotate-180")} />
          </>
        )}
      </button>
    </div>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { lang, setLang } = useLang();
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("sidebar-collapsed");
    if (saved === "true") setCollapsed(true);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function toggle() {
    setCollapsed(c => {
      localStorage.setItem("sidebar-collapsed", String(!c));
      return !c;
    });
  }

  return (
    <aside className={cn(
      "relative shrink-0 h-screen border-r border-stone-200 bg-white flex flex-col px-2 py-3 transition-all duration-200",
      collapsed ? "w-[52px]" : "w-[232px]"
    )}>
      {/* Logo */}
      <Link href="/" className={cn("px-3 py-2 mb-3 flex items-center hover:opacity-80 transition-opacity", collapsed ? "justify-center" : "gap-2.5")}>
        <RumiosLogo size={22} />
        {!collapsed && (
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-[13px] text-stone-800 leading-none tracking-tight">RUMIOS</span>
            <span className="inline-flex items-center justify-center h-[18px] px-2 text-[9px] font-semibold leading-none bg-violet-100 text-violet-600 rounded-full tracking-wider">BETA</span>
          </div>
        )}
      </Link>

      {/* Nav */}
      <nav className="flex-1 space-y-px">
        {NAV.map(({ href, icon: Icon, ...rest }) => {
          const soon = "soon" in rest ? rest.soon : false;
          const active = pathname === href || pathname.startsWith(href + "/");
          const label = NAV_LABELS[href]?.[lang] ?? href;
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              className={cn(
                "flex items-center rounded-md text-[13.5px] transition-colors",
                collapsed ? "justify-center px-2 py-[7px]" : "gap-2 px-3 py-[6px]",
                active
                  ? "bg-violet-50 text-violet-900 font-medium"
                  : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
              )}
            >
              <Icon className={cn("w-4 h-4 shrink-0", active ? "text-violet-700" : "text-stone-400")} />
              {!collapsed && (
                <>
                  <span className="flex-1">{label}</span>
                  {soon && (
                    <span className="text-[10px] bg-stone-100 text-stone-500 px-1.5 py-0.5 rounded-full font-medium leading-none">
                      {SOON_LABEL[lang]}
                    </span>
                  )}
                </>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Language selector */}
      {!collapsed && (
        <div ref={langRef} className="relative px-1 mb-2">
          <button
            onClick={() => setLangOpen(o => !o)}
            className="flex items-center gap-1.5 w-full px-2 py-1.5 rounded-lg text-[12px] text-stone-500 hover:bg-stone-100 hover:text-stone-700 transition-colors"
          >
            <span className="flex-1 text-left">{LANG_LABELS[lang]}</span>
            <ChevronDown className={cn("w-3 h-3 shrink-0 transition-transform", langOpen && "rotate-180")} />
          </button>
          {langOpen && (
            <div className="absolute bottom-full left-0 right-0 mb-1 bg-white border border-stone-200 rounded-xl shadow-lg overflow-hidden z-50">
              {(["fr", "en", "pt"] as Lang[]).map(l => (
                <button
                  key={l}
                  onClick={() => { setLang(l); setLangOpen(false); }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-[12.5px] text-stone-700 hover:bg-stone-50 transition-colors"
                >
                  <span className="flex-1 text-left">{LANG_LABELS[l]}</span>
                  {lang === l && <Check className="w-3 h-3 text-stone-500" />}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* User */}
      <div className="border-t border-stone-200 pt-2">
        <UserMenu collapsed={collapsed} lang={lang} />
      </div>

      {/* Toggle button */}
      <button
        onClick={toggle}
        className="absolute -right-3 top-8 w-6 h-6 bg-white border border-stone-200 rounded-full flex items-center justify-center text-stone-400 hover:text-stone-700 hover:border-stone-300 transition-colors shadow-sm cursor-pointer"
      >
        <ChevronLeft className={cn("w-3.5 h-3.5 transition-transform duration-200", collapsed && "rotate-180")} />
      </button>
    </aside>
  );
}
