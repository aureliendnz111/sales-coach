import { LayoutDashboard, FileText, Headphones, PhoneCall, Swords, Settings, type LucideIcon } from "lucide-react";
import type { Lang } from "@/lib/lang-context";

type Txt = Record<Lang, string>;

export type NavGroupKey = "before" | "during" | "after" | null;
export type NavItem = { href: string; icon: LucideIcon; soon?: boolean; tone: string };

export const NAV_LABELS: Record<string, Txt> = {
  "/dashboard":     { fr: "Dashboard",        en: "Dashboard",     pt: "Dashboard" },
  "/scripts":       { fr: "Scripts",          en: "Scripts",       pt: "Guiões" },
  "/call-analysis": { fr: "Analyse de calls", en: "Call Analysis", pt: "Análise de chamadas" },
  "/playground":    { fr: "Playground",       en: "Playground",    pt: "Playground" },
  "/sessions":      { fr: "Live Copilot",     en: "Live Copilot",  pt: "Live Copilot" },
  "/settings":      { fr: "Paramètres",       en: "Settings",      pt: "Definições" },
};

// Nav grouped by moment of the sales cycle, mirroring the categories on the landing page.
// `tone` is the icon chip color used in the page header (same colors as the landing).
export const NAV_GROUPS: { key: NavGroupKey; items: NavItem[] }[] = [
  { key: null,     items: [{ href: "/dashboard", icon: LayoutDashboard, tone: "bg-amber-50 text-amber-600" }] },
  { key: "before", items: [{ href: "/scripts", icon: FileText, tone: "bg-violet-50 text-violet-600" }, { href: "/playground", icon: Swords, tone: "bg-sky-50 text-sky-600" }] },
  { key: "during", items: [{ href: "/sessions", icon: Headphones, soon: true, tone: "bg-fuchsia-50 text-fuchsia-600" }] },
  { key: "after",  items: [{ href: "/call-analysis", icon: PhoneCall, tone: "bg-emerald-50 text-emerald-600" }] },
];

const SETTINGS_ITEM: NavItem = { href: "/settings", icon: Settings, tone: "bg-stone-100 text-stone-600" };

const SUB_LABELS: Record<"new" | "edit" | "detail", Txt> = {
  new:    { fr: "Nouveau",  en: "New",     pt: "Novo" },
  edit:   { fr: "Modifier", en: "Edit",    pt: "Editar" },
  detail: { fr: "Détail",   en: "Details", pt: "Detalhe" },
};

/** Finds the nav group, section and optional sub-page for a pathname. */
export function resolveNav(pathname: string) {
  const all = [...NAV_GROUPS.flatMap(g => g.items.map(item => ({ group: g.key, item }))), { group: null as NavGroupKey, item: SETTINGS_ITEM }];
  const match = all.find(({ item }) => pathname === item.href || pathname.startsWith(item.href + "/"));
  if (!match) return null;
  const rest = pathname.slice(match.item.href.length).split("/").filter(Boolean);
  const sub: keyof typeof SUB_LABELS | null =
    rest.length === 0 ? null : rest[0] === "new" ? "new" : rest[rest.length - 1] === "edit" ? "edit" : "detail";
  return { ...match, sub, subLabel: sub ? SUB_LABELS[sub] : null };
}
