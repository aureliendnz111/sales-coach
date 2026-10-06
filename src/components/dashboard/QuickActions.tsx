"use client";
import Link from "next/link";
import { ArrowRight, FileText, PhoneCall, Swords } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLang } from "@/lib/lang-context";
import { i18n } from "@/lib/i18n";

const ACTIONS = [
  { href: "/scripts/new",       icon: FileText,  title: "qaScriptTitle",   sub: "qaScriptSub",   chip: "bg-violet-50 text-violet-600" },
  { href: "/playground",        icon: Swords,    title: "qaPracticeTitle", sub: "qaPracticeSub", chip: "bg-sky-50 text-sky-600" },
  { href: "/call-analysis/new", icon: PhoneCall, title: "qaAnalyzeTitle",  sub: "qaAnalyzeSub",  chip: "bg-emerald-50 text-emerald-600" },
] as const;

export function QuickActions() {
  const { lang } = useLang();
  return (
    <section aria-label={i18n.dashboard.quickTitle[lang]}>
      <h2 className="text-[13px] font-semibold text-stone-700 mb-3">{i18n.dashboard.quickTitle[lang]}</h2>
      <div className="grid grid-cols-3 gap-4">
        {ACTIONS.map(({ href, icon: Icon, title, sub, chip }) => (
          <Link
            key={href}
            href={href}
            className="group bg-white border border-stone-200 rounded-xl shadow-sm p-4 flex items-start gap-3 hover:border-violet-200 hover:shadow-md transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
          >
            <span className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0", chip)}>
              <Icon className="w-4 h-4" />
            </span>
            <span className="flex-1 min-w-0">
              <span className="flex items-center gap-1 text-[13.5px] font-semibold text-stone-900">
                {i18n.dashboard[title][lang]}
                <ArrowRight className="w-3.5 h-3.5 text-stone-300 group-hover:text-violet-500 group-hover:translate-x-0.5 transition-all" />
              </span>
              <span className="block text-[12px] text-stone-500 mt-0.5 leading-snug">{i18n.dashboard[sub][lang]}</span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
