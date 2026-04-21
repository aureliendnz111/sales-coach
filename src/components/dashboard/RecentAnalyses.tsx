"use client";
import { useRouter } from "next/navigation";
import { PhoneCall, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

type Analysis = {
  id: string;
  prospect_name: string | null;
  call_date: string | null;
  outcome: string | null;
  status: string;
  scores: { overall: number } | null;
};

const OUTCOME_LABELS: Record<string, { label: string; color: string }> = {
  closed:      { label: "Closé",         color: "text-emerald-600 bg-emerald-50" },
  next_call:   { label: "Prochain RDV",  color: "text-sky-600 bg-sky-50" },
  no_decision: { label: "Sans décision", color: "text-stone-500 bg-stone-100" },
  lost:        { label: "Perdu",          color: "text-rose-600 bg-rose-50" },
};

export function RecentAnalyses({ analyses }: { analyses: Analysis[] }) {
  const router = useRouter();

  if (analyses.length === 0) {
    return (
      <div className="border border-stone-200 rounded-xl bg-white p-8 flex flex-col items-center gap-3 text-center">
        <PhoneCall className="w-8 h-8 text-stone-200" />
        <p className="text-[13px] text-stone-500 font-medium">Aucune analyse pour l'instant</p>
        <Link href="/call-analysis/new" className="flex items-center gap-1.5 text-[13px] font-medium px-3.5 py-2 rounded-lg bg-stone-900 text-white hover:bg-stone-700 transition-colors">
          <Plus className="w-3.5 h-3.5" /> Analyser un call
        </Link>
      </div>
    );
  }

  return (
    <div className="border border-stone-200 rounded-xl bg-white overflow-hidden">
      <div className="px-5 py-3.5 border-b border-stone-100 flex items-center justify-between">
        <h2 className="text-[13px] font-semibold text-stone-700">Dernières analyses</h2>
        <Link href="/call-analysis" className="text-[12px] text-stone-500 hover:text-stone-700 transition-colors">
          Voir tout →
        </Link>
      </div>
      <table className="w-full">
        <tbody className="divide-y divide-stone-100">
          {analyses.map(a => {
            const overall = a.scores?.overall ?? null;
            const scoreCol = overall === null ? "text-stone-300" : overall >= 75 ? "text-emerald-600 bg-emerald-50" : overall >= 50 ? "text-amber-600 bg-amber-50" : "text-rose-600 bg-rose-50";
            const outcome = a.outcome ? OUTCOME_LABELS[a.outcome] : null;
            return (
              <tr
                key={a.id}
                onClick={() => router.push(`/call-analysis/${a.id}`)}
                className="hover:bg-stone-50 cursor-pointer transition-colors"
              >
                <td className="px-5 py-3">
                  <p className="text-[13px] font-medium text-stone-800">{a.prospect_name ?? <span className="text-stone-400 italic text-[12px]">Sans nom</span>}</p>
                  {a.call_date && <p className="text-[11px] text-stone-500">{new Date(a.call_date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}</p>}
                </td>
                <td className="px-5 py-3">
                  {outcome && (
                    <span className={cn("text-[11px] font-medium px-2 py-0.5 rounded-full", outcome.color)}>{outcome.label}</span>
                  )}
                </td>
                <td className="px-5 py-3 text-right">
                  {a.status === "analyzing" ? (
                    <span className="text-[12px] text-stone-500">En cours…</span>
                  ) : a.status === "error" ? (
                    <span className="text-[12px] text-rose-400">Erreur</span>
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
