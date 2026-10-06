"use client";
import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLang } from "@/lib/lang-context";
import { i18n } from "@/lib/i18n";

type Props = { hasScript: boolean; hasTraining: boolean; hasAnalysis: boolean };

export function OnboardingChecklist({ hasScript, hasTraining, hasAnalysis }: Props) {
  const { lang } = useLang();
  const steps = [
    { done: hasScript,   label: i18n.dashboard.onboardScript[lang],   href: "/scripts/new" },
    { done: hasTraining, label: i18n.dashboard.onboardPractice[lang], href: "/playground" },
    { done: hasAnalysis, label: i18n.dashboard.onboardAnalyze[lang],  href: "/call-analysis/new" },
  ];
  const doneCount = steps.filter(s => s.done).length;
  if (doneCount === steps.length) return null;
  const nextIndex = steps.findIndex(s => !s.done);

  return (
    <section className="bg-white border border-violet-200 rounded-xl shadow-sm overflow-hidden">
      <div className="px-5 pt-4 pb-3 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-[14px] font-semibold text-stone-900">{i18n.dashboard.onboardTitle[lang]}</h2>
          <p className="text-[12px] text-stone-500 mt-0.5">{i18n.dashboard.onboardSub[lang]}</p>
        </div>
        <span className="text-[11px] font-medium text-violet-700 bg-violet-50 rounded-full px-2 py-0.5 shrink-0 tabular-nums">
          {i18n.dashboard.onboardProgress[lang].replace("{n}", String(doneCount))}
        </span>
      </div>
      <div className="h-1 bg-stone-100 mx-5 rounded-full overflow-hidden" aria-hidden>
        <div className="h-full bg-violet-500 rounded-full transition-all duration-500" style={{ width: `${(doneCount / steps.length) * 100}%` }} />
      </div>
      <ol className="px-2 py-2 mt-1">
        {steps.map((s, i) => (
          <li key={s.href}>
            <Link
              href={s.href}
              aria-disabled={s.done}
              tabIndex={s.done ? -1 : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors",
                s.done ? "pointer-events-none" : "hover:bg-stone-50 group"
              )}
            >
              <span className={cn(
                "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0",
                s.done ? "bg-emerald-500 text-white" : i === nextIndex ? "bg-violet-600 text-white" : "border border-stone-300 text-stone-400"
              )}>
                {s.done ? <Check className="w-3 h-3" /> : i + 1}
              </span>
              <span className={cn("flex-1 text-[13px]", s.done ? "text-stone-400 line-through" : "text-stone-800 font-medium")}>{s.label}</span>
              {!s.done && (
                <span className={cn(
                  "flex items-center gap-1 text-[12px] font-medium",
                  i === nextIndex ? "text-violet-600" : "text-stone-400 opacity-0 group-hover:opacity-100 transition-opacity"
                )}>
                  {i18n.dashboard.onboardStart[lang]} <ArrowRight className="w-3 h-3" />
                </span>
              )}
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}
