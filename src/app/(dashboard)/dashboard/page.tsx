import { auth, currentUser } from "@clerk/nextjs/server";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Zap, FileText, PhoneCall, TrendingUp, Plus } from "lucide-react";
import { DashboardGreeting } from "@/components/dashboard/DashboardGreeting";
import { cn } from "@/lib/utils";

type RecentAnalysis = {
  id: string;
  prospect_name: string | null;
  call_date: string | null;
  outcome: string | null;
  status: string;
  scores: { overall: number } | null;
  created_at: string;
};

const OUTCOME_LABELS: Record<string, { label: string; color: string }> = {
  closed:      { label: "Signé",        color: "text-emerald-600 bg-emerald-50" },
  next_call:   { label: "Prochain RDV", color: "text-sky-600 bg-sky-50" },
  no_decision: { label: "Sans décision",color: "text-stone-500 bg-stone-100" },
  lost:        { label: "Perdu",         color: "text-rose-600 bg-rose-50" },
};

export default async function DashboardPage() {
  const { userId } = await auth();
  const user = await currentUser();
  const supabase = await createClient();

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [
    { count: scriptCount },
    { count: callsThisMonth },
    { data: scoresData },
    { data: recentAnalyses },
  ] = await Promise.all([
    supabase.from("scripts").select("*", { count: "exact", head: true }).eq("user_id", userId!).is("archived_at", null),
    supabase.from("call_analyses").select("*", { count: "exact", head: true }).eq("user_id", userId!).eq("status", "done").gte("created_at", startOfMonth.toISOString()),
    supabase.from("call_analyses").select("scores").eq("user_id", userId!).eq("status", "done").gte("created_at", startOfMonth.toISOString()),
    supabase.from("call_analyses").select("id, prospect_name, call_date, outcome, status, scores, created_at").eq("user_id", userId!).neq("status", "archived").order("created_at", { ascending: false }).limit(5),
  ]);

  const firstName = user?.firstName ?? "vous";
  const scripts = scriptCount ?? 0;
  const calls = callsThisMonth ?? 0;

  const overallScores = (scoresData ?? []).map(d => (d.scores as { overall?: number } | null)?.overall).filter((s): s is number => typeof s === "number");
  const avgScore = overallScores.length > 0 ? Math.round(overallScores.reduce((a, b) => a + b, 0) / overallScores.length) : null;
  const scoreColor = avgScore === null ? "text-stone-400" : avgScore >= 75 ? "text-emerald-600" : avgScore >= 50 ? "text-amber-600" : "text-rose-600";

  return (
    <div className="max-w-4xl mx-auto px-8 py-10 space-y-8">
      <DashboardGreeting initialFirstName={firstName} />

      {scripts === 0 && (
        <div className="border border-amber-200 bg-amber-50/80 rounded-xl p-5 flex items-start gap-3.5">
          <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
            <Zap className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <p className="font-semibold text-amber-900 text-sm">Créez votre premier script</p>
            <p className="text-amber-700/80 text-xs mt-0.5 mb-3 leading-relaxed">
              Importez votre process de vente pour que le copilote puisse vous assister en temps réel pendant vos calls.
            </p>
            <Button size="sm" asChild className="bg-amber-600 hover:bg-amber-700 text-white h-8 text-xs">
              <Link href="/scripts/new">Créer mon premier script</Link>
            </Button>
          </div>
        </div>
      )}

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border border-stone-200 rounded-xl p-5 space-y-1">
          <div className="flex items-center gap-2 text-stone-400 text-[11px] font-semibold uppercase tracking-wider">
            <FileText className="w-3.5 h-3.5" /> Scripts actifs
          </div>
          <p className="text-[32px] font-bold text-stone-900 tabular-nums leading-none pt-1">{scripts}</p>
          <p className="text-[11px] text-stone-400">script{scripts > 1 ? "s" : ""} disponible{scripts > 1 ? "s" : ""}</p>
        </div>

        <div className="bg-white border border-stone-200 rounded-xl p-5 space-y-1">
          <div className="flex items-center gap-2 text-stone-400 text-[11px] font-semibold uppercase tracking-wider">
            <PhoneCall className="w-3.5 h-3.5" /> Calls ce mois
          </div>
          <p className="text-[32px] font-bold text-stone-900 tabular-nums leading-none pt-1">{calls}</p>
          <p className="text-[11px] text-stone-400">call{calls > 1 ? "s" : ""} analysé{calls > 1 ? "s" : ""}</p>
        </div>

        <div className="bg-white border border-stone-200 rounded-xl p-5 space-y-1">
          <div className="flex items-center gap-2 text-stone-400 text-[11px] font-semibold uppercase tracking-wider">
            <TrendingUp className="w-3.5 h-3.5" /> Score moyen
          </div>
          <p className={cn("text-[32px] font-bold tabular-nums leading-none pt-1", scoreColor)}>
            {avgScore ?? "—"}
          </p>
          <p className="text-[11px] text-stone-400">{overallScores.length > 0 ? `sur ${overallScores.length} call${overallScores.length > 1 ? "s" : ""} ce mois` : "aucun call ce mois"}</p>
        </div>
      </div>

      {/* Recent analyses */}
      {(recentAnalyses ?? []).length > 0 ? (
        <div className="border border-stone-200 rounded-xl bg-white overflow-hidden">
          <div className="px-5 py-3.5 border-b border-stone-100 flex items-center justify-between">
            <h2 className="text-[13px] font-semibold text-stone-700">Dernières analyses</h2>
            <Link href="/call-analysis" className="text-[12px] text-stone-400 hover:text-stone-700 transition-colors">
              Voir tout →
            </Link>
          </div>
          <table className="w-full">
            <tbody className="divide-y divide-stone-100">
              {(recentAnalyses as RecentAnalysis[]).map(a => {
                const overall = a.scores?.overall ?? null;
                const scoreCol = overall === null ? "text-stone-300" : overall >= 75 ? "text-emerald-600 bg-emerald-50" : overall >= 50 ? "text-amber-600 bg-amber-50" : "text-rose-600 bg-rose-50";
                const outcome = a.outcome ? OUTCOME_LABELS[a.outcome] : null;
                return (
                  <tr key={a.id}>
                    <td className="px-5 py-3">
                      <p className="text-[13px] font-medium text-stone-800">{a.prospect_name ?? <span className="text-stone-400 italic text-[12px]">Sans nom</span>}</p>
                      {a.call_date && <p className="text-[11px] text-stone-400">{new Date(a.call_date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}</p>}
                    </td>
                    <td className="px-5 py-3">
                      {outcome && (
                        <span className={cn("text-[11px] font-medium px-2 py-0.5 rounded-full", outcome.color)}>{outcome.label}</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right">
                      {a.status === "analyzing" ? (
                        <span className="text-[12px] text-stone-400">En cours…</span>
                      ) : a.status === "error" ? (
                        <span className="text-[12px] text-rose-400">Erreur</span>
                      ) : overall !== null ? (
                        <span className={cn("text-[13px] font-bold tabular-nums px-2 py-0.5 rounded-lg", scoreCol)}>{overall}</span>
                      ) : (
                        <span className="text-stone-300 text-[12px]">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Link href={`/call-analysis/${a.id}`} className="text-[12px] text-stone-400 hover:text-stone-700 transition-colors">
                        Voir →
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="border border-stone-200 rounded-xl bg-white p-8 flex flex-col items-center gap-3 text-center">
          <PhoneCall className="w-8 h-8 text-stone-200" />
          <p className="text-[13px] text-stone-500 font-medium">Aucune analyse pour l'instant</p>
          <Link href="/call-analysis/new" className="flex items-center gap-1.5 text-[13px] font-medium px-3.5 py-2 rounded-lg bg-stone-900 text-white hover:bg-stone-700 transition-colors">
            <Plus className="w-3.5 h-3.5" /> Analyser un call
          </Link>
        </div>
      )}
    </div>
  );
}
