"use client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Zap, FileText, PhoneCall, TrendingUp } from "lucide-react";
import { DashboardGreeting } from "@/components/dashboard/DashboardGreeting";
import { RecentAnalyses } from "@/components/dashboard/RecentAnalyses";
import { cn } from "@/lib/utils";
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

type Props = {
  firstName: string;
  scripts: number;
  calls: number;
  avgScore: number | null;
  overallScores: number[];
  recentAnalyses: Analysis[];
};

export function DashboardContent({ firstName, scripts, calls, avgScore, overallScores, recentAnalyses }: Props) {
  const { lang } = useLang();
  const scoreColor = avgScore === null ? "text-stone-400" : avgScore >= 75 ? "text-emerald-600" : avgScore >= 50 ? "text-amber-600" : "text-rose-600";

  const scriptLabel = scripts > 1
    ? `${scripts} ${lang === "fr" ? "scripts disponibles" : lang === "en" ? "scripts available" : "guiões disponíveis"}`
    : `${scripts} ${lang === "fr" ? "script disponible" : lang === "en" ? "script available" : "guião disponível"}`;

  const callLabel = calls > 1
    ? `${calls} ${lang === "fr" ? "calls analysés" : lang === "en" ? "calls analyzed" : "chamadas analisadas"}`
    : `${calls} ${lang === "fr" ? "call analysé" : lang === "en" ? "call analyzed" : "chamada analisada"}`;

  const scoreSubLabel = overallScores.length > 0
    ? lang === "fr" ? `sur ${overallScores.length} call${overallScores.length > 1 ? "s" : ""} ce mois`
    : lang === "en" ? `from ${overallScores.length} call${overallScores.length > 1 ? "s" : ""} this month`
    : `de ${overallScores.length} chamada${overallScores.length > 1 ? "s" : ""} este mês`
    : i18n.dashboard.noCallsThisMonth[lang];

  return (
    <div className="max-w-4xl mx-auto px-8 py-10 space-y-8">
      <DashboardGreeting initialFirstName={firstName} />

      {scripts === 0 && (
        <div className="border border-amber-200 bg-amber-50/80 rounded-xl p-5 flex items-start gap-3.5">
          <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
            <Zap className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <p className="font-semibold text-amber-900 text-sm">{i18n.dashboard.firstScriptTitle[lang]}</p>
            <p className="text-amber-700/80 text-xs mt-0.5 mb-3 leading-relaxed">{i18n.dashboard.firstScriptSub[lang]}</p>
            <Button size="sm" asChild className="bg-amber-600 hover:bg-amber-700 text-white h-8 text-xs">
              <Link href="/scripts/new">{i18n.dashboard.firstScriptButton[lang]}</Link>
            </Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border border-stone-200 rounded-xl shadow-sm p-5 space-y-1">
          <div className="flex items-center gap-2 text-stone-400 text-[11px] font-semibold uppercase tracking-wider">
            <FileText className="w-3.5 h-3.5" /> {i18n.dashboard.activeScripts[lang]}
          </div>
          <p className="text-[32px] font-bold text-stone-900 tabular-nums leading-none pt-1">{scripts}</p>
          <p className="text-[11px] text-stone-500">{scriptLabel}</p>
        </div>

        <div className="bg-white border border-stone-200 rounded-xl shadow-sm p-5 space-y-1">
          <div className="flex items-center gap-2 text-stone-400 text-[11px] font-semibold uppercase tracking-wider">
            <PhoneCall className="w-3.5 h-3.5" /> {i18n.dashboard.callsThisMonth[lang]}
          </div>
          <p className="text-[32px] font-bold text-stone-900 tabular-nums leading-none pt-1">{calls}</p>
          <p className="text-[11px] text-stone-500">{callLabel}</p>
        </div>

        <div className="bg-white border border-stone-200 rounded-xl shadow-sm p-5 space-y-1">
          <div className="flex items-center gap-2 text-stone-400 text-[11px] font-semibold uppercase tracking-wider">
            <TrendingUp className="w-3.5 h-3.5" /> {i18n.dashboard.avgScore[lang]}
          </div>
          <p className={cn("text-[32px] font-bold tabular-nums leading-none pt-1", scoreColor)}>
            {avgScore ?? "—"}
          </p>
          <p className="text-[11px] text-stone-500">{scoreSubLabel}</p>
        </div>
      </div>

      <RecentAnalyses analyses={recentAnalyses as Parameters<typeof RecentAnalyses>[0]["analyses"]} />
    </div>
  );
}
