"use client";
import { cn } from "@/lib/utils";
import { Trophy, Calendar, Minus, XCircle } from "lucide-react";
import { useLang } from "@/lib/lang-context";
import { i18n } from "@/lib/i18n";

export type Outcome = "closed" | "next_call" | "no_decision" | "lost" | null;

export const OUTCOME_STYLE: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
  closed:      { bg: "bg-emerald-50", text: "text-emerald-700", icon: <Trophy className="w-3 h-3" /> },
  next_call:   { bg: "bg-blue-50",    text: "text-blue-700",    icon: <Calendar className="w-3 h-3" /> },
  no_decision: { bg: "bg-stone-100",  text: "text-stone-600",   icon: <Minus className="w-3 h-3" /> },
  lost:        { bg: "bg-rose-50",    text: "text-rose-700",    icon: <XCircle className="w-3 h-3" /> },
};

// Legacy export kept for callers that only need styling (bg/text/icon)
export const OUTCOME_CONFIG = OUTCOME_STYLE as Record<string, { bg: string; text: string; icon: React.ReactNode; label: string }>;

export function OutcomeBadge({ outcome }: { outcome: Outcome }) {
  const { lang } = useLang();
  if (!outcome) return <span className="text-[12px] text-stone-500 italic">{i18n.outcomes.none[lang]}</span>;
  const style = OUTCOME_STYLE[outcome];
  const label = (i18n.outcomes as Record<string, Record<string, string>>)[outcome]?.[lang] ?? outcome;
  return (
    <span className={cn("inline-flex items-center gap-1 text-[12px] font-medium px-2 py-0.5 rounded-full", style.bg, style.text)}>
      {style.icon}
      {label}
    </span>
  );
}
