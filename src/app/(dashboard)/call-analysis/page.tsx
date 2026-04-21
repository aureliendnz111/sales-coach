"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Archive, Loader2, PhoneCall, ArchiveX, RefreshCw } from "lucide-react";
import { OutcomeBadge, Outcome } from "@/components/call-analysis/OutcomeBadge";
import { cn } from "@/lib/utils";

type Analysis = {
  id: string; prospect_name: string | null; call_date: string | null;
  outcome: Outcome; status: string;
  scores: { overall: number } | null;
  created_at: string;
  scripts: { name: string } | null;
};

function ScoreBadge({ score }: { score: number | null }) {
  if (score === null) return <span className="text-stone-300 text-[12px]">—</span>;
  const color = score >= 75 ? "text-emerald-600 bg-emerald-50" : score >= 50 ? "text-amber-600 bg-amber-50" : "text-rose-600 bg-rose-50";
  return <span className={cn("text-[13px] font-bold tabular-nums px-2 py-0.5 rounded-lg", color)}>{score}</span>;
}

export default function CallAnalysisPage() {
  const router = useRouter();
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [showArchived, setShowArchived] = useState(false);

  async function load(archived = false) {
    setLoading(true);
    const res = await fetch(`/api/call-analysis${archived ? "?archived=true" : ""}`);
    const data = await res.json();
    setAnalyses(data.analyses ?? []);
    setLoading(false);
  }

  useEffect(() => { load(showArchived); }, [showArchived]);

  // Auto-refresh while analyses are pending
  useEffect(() => {
    const hasPending = analyses.some(a => a.status === "analyzing");
    if (!hasPending) return;
    const interval = setInterval(() => load(showArchived), 4000);
    return () => clearInterval(interval);
  }, [analyses, showArchived]);

  async function archive(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    await fetch(`/api/call-analysis/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "archived" }) });
    setAnalyses(a => a.filter(x => x.id !== id));
  }

  async function unarchive(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    await fetch(`/api/call-analysis/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "done" }) });
    setAnalyses(a => a.filter(x => x.id !== id));
  }

  async function retry(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    setAnalyses(a => a.map(x => x.id === id ? { ...x, status: "analyzing" } : x));
    await fetch(`/api/call-analysis/${id}`, { method: "POST" });
  }

  async function remove(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm("Supprimer cette analyse définitivement ?")) return;
    await fetch(`/api/call-analysis/${id}`, { method: "DELETE" });
    setAnalyses(a => a.filter(x => x.id !== id));
  }

  return (
    <div className="max-w-4xl mx-auto px-8 py-10 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-semibold text-stone-900 tracking-tight">Analyse de calls</h1>
          <p className="text-sm text-stone-400 mt-0.5">Scores, recommandations IA et historique de vos appels.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowArchived(a => !a)}
            className={cn(
              "flex items-center gap-1.5 text-[13px] px-3.5 py-2 rounded-lg border transition-colors",
              showArchived
                ? "bg-stone-100 border-stone-300 text-stone-700 font-medium"
                : "border-stone-200 text-stone-500 hover:bg-stone-50"
            )}
          >
            <Archive className="w-3.5 h-3.5" />
            {showArchived ? "Masquer les archives" : "Archives"}
          </button>
          {!showArchived && (
            <button
              onClick={() => router.push("/call-analysis/new")}
              className="flex items-center gap-1.5 text-[13px] font-medium px-3.5 py-2 rounded-lg bg-stone-900 text-white hover:bg-stone-700 transition-colors"
            >
              <Plus className="w-4 h-4" /> Nouvelle analyse
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-stone-400 gap-2">
          <Loader2 className="w-4 h-4 animate-spin" /> Chargement…
        </div>
      ) : analyses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
          <div className="w-14 h-14 bg-stone-100 rounded-2xl flex items-center justify-center">
            <PhoneCall className="w-7 h-7 text-stone-300" />
          </div>
          <div>
            <p className="text-[14px] font-medium text-stone-600">Aucune analyse pour l'instant</p>
            <p className="text-[13px] text-stone-400 mt-1">Importez un transcript pour commencer.</p>
          </div>
          <button onClick={() => router.push("/call-analysis/new")} className="flex items-center gap-1.5 text-[13px] font-medium px-3.5 py-2 rounded-lg bg-stone-900 text-white hover:bg-stone-700 transition-colors">
            <Plus className="w-4 h-4" /> Nouvelle analyse
          </button>
        </div>
      ) : (
        <div className="border border-stone-200 rounded-xl bg-white overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-stone-100">
                <th className="text-left text-[11px] font-semibold text-stone-400 uppercase tracking-wider px-4 py-3">Prospect</th>
                <th className="text-left text-[11px] font-semibold text-stone-400 uppercase tracking-wider px-4 py-3">Date</th>
                <th className="text-left text-[11px] font-semibold text-stone-400 uppercase tracking-wider px-4 py-3">Script</th>
                <th className="text-left text-[11px] font-semibold text-stone-400 uppercase tracking-wider px-4 py-3">Résultat</th>
                <th className="text-center text-[11px] font-semibold text-stone-400 uppercase tracking-wider px-4 py-3">Score</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {analyses.map(a => (
                <tr
                  key={a.id}
                  onClick={() => router.push(`/call-analysis/${a.id}`)}
                  className="hover:bg-stone-50 cursor-pointer transition-colors group"
                >
                  <td className="px-4 py-3">
                    <p className="text-[13px] font-medium text-stone-800">{a.prospect_name ?? <span className="text-stone-400 italic">Sans nom</span>}</p>
                  </td>
                  <td className="px-4 py-3 text-[12.5px] text-stone-500">
                    {a.call_date ? new Date(a.call_date).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                  </td>
                  <td className="px-4 py-3 text-[12.5px] text-stone-500 max-w-[160px] truncate">
                    {a.scripts?.name ?? <span className="text-stone-300">Analyse générale</span>}
                  </td>
                  <td className="px-4 py-3">
                    <OutcomeBadge outcome={a.outcome} />
                  </td>
                  <td className="px-4 py-3 text-center">
                    {a.status === "analyzing" ? (
                      <span className="flex items-center justify-center gap-1.5 text-[12px] text-stone-400">
                        <Loader2 className="w-3 h-3 animate-spin" /> En cours…
                      </span>
                    ) : a.status === "error" ? (
                      <span className="text-[12px] text-rose-400">Erreur</span>
                    ) : (
                      <ScoreBadge score={a.scores?.overall ?? null} />
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {a.status === "error" && (
                        <button onClick={e => retry(a.id, e)} title="Relancer l'analyse" className="p-1.5 rounded-md text-stone-400 hover:text-sky-600 hover:bg-sky-50 transition-colors">
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {showArchived ? (
                        <button onClick={e => unarchive(a.id, e)} title="Désarchiver" className="p-1.5 rounded-md text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors">
                          <ArchiveX className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <button onClick={e => archive(a.id, e)} title="Archiver" className="p-1.5 rounded-md text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors">
                          <Archive className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button onClick={e => remove(a.id, e)} title="Supprimer" className="p-1.5 rounded-md text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
