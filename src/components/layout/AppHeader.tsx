"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLang } from "@/lib/lang-context";
import { i18n } from "@/lib/i18n";
import { NAV_LABELS, resolveNav } from "@/lib/nav";

// White page header: category of the current page (same groups as the sidebar) + page name.
export function AppHeader() {
  const pathname = usePathname();
  const { lang } = useLang();
  const nav = resolveNav(pathname);
  if (!nav) return null;

  const Icon = nav.item.icon;
  const section = NAV_LABELS[nav.item.href]?.[lang] ?? nav.item.href;
  const category = nav.group ? i18n.nav[nav.group][lang] : null;

  return (
    <header className="shrink-0 h-14 bg-white border-b border-stone-200 px-8 flex items-center gap-3">
      <span className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", nav.item.tone)}>
        <Icon className="w-4 h-4" />
      </span>
      <nav aria-label="Breadcrumb" className="min-w-0">
        <ol className="flex items-center gap-1.5 text-[13.5px] min-w-0">
          {category && (
            <>
              <li className="text-stone-400 whitespace-nowrap">{category}</li>
              <li aria-hidden><ChevronRight className="w-3.5 h-3.5 text-stone-300" /></li>
            </>
          )}
          <li className="min-w-0 truncate">
            {nav.subLabel ? (
              <Link href={nav.item.href} className="text-stone-500 hover:text-stone-900 transition-colors">{section}</Link>
            ) : (
              <span className="font-semibold text-stone-900" aria-current="page">{section}</span>
            )}
          </li>
          {nav.subLabel && (
            <>
              <li aria-hidden><ChevronRight className="w-3.5 h-3.5 text-stone-300" /></li>
              <li className="font-semibold text-stone-900 whitespace-nowrap" aria-current="page">{nav.subLabel[lang]}</li>
            </>
          )}
        </ol>
      </nav>
    </header>
  );
}
