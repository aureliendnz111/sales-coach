"use client";
import { FileText, PhoneCall, TrendingUp } from "lucide-react";
import { DashboardGreeting } from "@/components/dashboard/DashboardGreeting";
import { RecentAnalyses } from "@/components/dashboard/RecentAnalyses";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { OnboardingChecklist } from "@/components/dashboard/OnboardingChecklist";
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
  hasAnalysis: boolean;
  hasTraining: boolean;
  recentAnalyses: Analysis[];
};

export function DashboardContent({ firstName, scripts, calls, avgScore, overallScores, hasAnalysis, hasTraining, recentAnalyses }: Props) {
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
    <div className="max-w-4xl px-8 py-10 space-y-8">
      <DashboardGreeting initialFirstName={firstName} />

      <OnboardingChecklist hasScript={scripts > 0} hasTraining={hasTraining} hasAnalysis={hasAnalysis} />

      <QuickActions />

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border border-stone-200 rounded-xl shadow-sm p-5 space-y-1">
          <div className="flex items-center gap-2 text-violet-500 text-[11px] font-semibold uppercase tracking-wider">
            <FileText className="w-3.5 h-3.5" /> {i18n.dashboard.activeScripts[lang]}
          </div>
          <p className="text-[32px] font-bold text-stone-900 tabular-nums leading-none pt-1">{scripts}</p>
          <p className="text-[11px] text-stone-500">{scriptLabel}</p>
        </div>

        <div className="bg-white border border-stone-200 rounded-xl shadow-sm p-5 space-y-1">
          <div className="flex items-center gap-2 text-violet-500 text-[11px] font-semibold uppercase tracking-wider">
            <PhoneCall className="w-3.5 h-3.5" /> {i18n.dashboard.callsThisMonth[lang]}
          </div>
          <p className="text-[32px] font-bold text-stone-900 tabular-nums leading-none pt-1">{calls}</p>
          <p className="text-[11px] text-stone-500">{callLabel}</p>
        </div>

        <div className="bg-white border border-stone-200 rounded-xl shadow-sm p-5 space-y-1">
          <div className="flex items-center gap-2 text-violet-500 text-[11px] font-semibold uppercase tracking-wider">
            <TrendingUp className="w-3.5 h-3.5" /> {i18n.dashboard.avgScore[lang]}
          </div>
          <p className={cn("text-[32px] font-bold tabular-nums leading-none pt-1", scoreColor)}>
            {avgScore ?? "-"}
          </p>
          <p className="text-[11px] text-stone-500">{scoreSubLabel}</p>
        </div>
      </div>

      <RecentAnalyses analyses={recentAnalyses as Parameters<typeof RecentAnalyses>[0]["analyses"]} />
    </div>
  );
}
