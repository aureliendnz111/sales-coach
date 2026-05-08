"use client";
import { useRouter } from "next/navigation";
import { PhoneCall, Plus, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useLang } from "@/lib/lang-context";
import { i18n } from "@/lib/i18n";

type Analysis = {
  id: string;
  prospect_name: string | null;
  call_date: string | null;
  outcome: string | null;
  status: string;
  scores: { overall: number } | null;
};

const OUTCOME_STYLE: Record<string, { color: string }> = {
  closed:      { color: "text-emerald-600 bg-emerald-50" },
  next_call:   { color: "text-sky-600 bg-sky-50" },
  no_decision: { color: "text-stone-500 bg-stone-100" },
  lost:        { color: "text-rose-600 bg-rose-50" },
};

const DATE_LOCALE: Record<string, string> = { fr: "fr-FR", en: "en-GB", pt: "pt-PT" };

export function RecentAnalyses({ analyses }: { analyses: Analysis[] }) {
  const router = useRouter();
  const { lang } = useLang();

  if (analyses.length === 0) {
    return (
      <div className="border border-stone-200 rounded-xl bg-white shadow-sm p-8 flex flex-col items-center gap-3 text-center">
        <div className="w-12 h-12 bg-violet-50 rounded-2xl flex items-center justify-center">
          <PhoneCall className="w-6 h-6 text-violet-400" />
        </div>
        <p className="text-[13px] text-stone-500 font-medium">{i18n.dashboard.noAnalysis[lang]}</p>
        <Link href="/call-analysis/new" className="flex items-center gap-1.5 text-[13px] font-medium px-3.5 py-2 rounded-lg bg-violet-600 text-white hover:bg-violet-700 transition-colors">
          <Plus className="w-3.5 h-3.5" /> {i18n.dashboard.analyzeCall[lang]}
        </Link>
      </div>
    );
  }

  return (
    <div className="border border-stone-200 rounded-xl bg-white shadow-sm overflow-hidden">
      <div className="px-5 py-3.5 border-b border-stone-100 flex items-center justify-between">
        <h2 className="text-[13px] font-semibold text-stone-700">{i18n.dashboard.recentTitle[lang]}</h2>
        <Link href="/call-analysis" className="text-[12px] text-violet-500 hover:text-violet-700 transition-colors">
          {i18n.common.seeAll[lang]}
        </Link>
      </div>
      <table className="w-full">
        <tbody className="divide-y divide-stone-100">
          {analyses.map(a => {
            const overall = a.scores?.overall ?? null;
            const scoreCol = overall === null ? "text-stone-300" : overall >= 75 ? "text-emerald-600 bg-emerald-50" : overall >= 50 ? "text-amber-600 bg-amber-50" : "text-rose-600 bg-rose-50";
            const outcomeLabel = a.outcome ? (i18n.outcomes as Record<string, Record<string, string>>)[a.outcome]?.[lang] : null;
            const outcomeColor = a.outcome ? OUTCOME_STYLE[a.outcome]?.color : null;
            return (
              <tr
                key={a.id}
                onClick={() => router.push(`/call-analysis/${a.id}`)}
                className="hover:bg-stone-50 cursor-pointer transition-colors"
              >
                <td className="px-5 py-3">
                  <p className="text-[13px] font-medium text-stone-800">
                    {a.prospect_name ?? <span className="text-stone-400 italic text-[12px]">{i18n.common.noName[lang]}</span>}
                  </p>
                  {a.call_date && (
                    <p className="text-[11px] text-stone-500">
                      {new Date(a.call_date).toLocaleDateString(DATE_LOCALE[lang] ?? "fr-FR", { day: "numeric", month: "short" })}
                    </p>
                  )}
                </td>
                <td className="px-5 py-3">
                  {outcomeLabel && outcomeColor && (
                    <span className={cn("text-[11px] font-medium px-2 py-0.5 rounded-full", outcomeColor)}>{outcomeLabel}</span>
                  )}
                </td>
                <td className="px-5 py-3 text-right">
                  {a.status === "analyzing" ? (
                    <span className="flex items-center justify-end gap-1.5 text-[12px] text-stone-500">
                      <Loader2 className="w-3 h-3 animate-spin" /> {i18n.common.analyzing[lang]}
                    </span>
                  ) : a.status === "error" ? (
                    <span className="text-[12px] text-rose-400">{i18n.common.error[lang]}</span>
                  ) : overall !== null ? (
                    <span className={cn("text-[13px] font-bold tabular-nums px-2 py-0.5 rounded-lg", scoreCol)}>{overall}</span>
                  ) : (
                    <span className="text-stone-300 text-[12px]">—</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
