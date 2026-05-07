"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ScriptCard } from "@/components/scripts/ScriptCard";
import { Plus, FileText, Archive, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Script = {
  id: string; name: string; goal?: string | null;
  is_default?: boolean; archived_at?: string | null;
  duration_minutes?: number | null;
  steps: { count: number }[]; objections: { count: number }[];
};

export default function ScriptsPage() {
  const router = useRouter();
  const [scripts, setScripts] = useState<Script[]>([]);
  const [loading, setLoading] = useState(true);
  const [showArchived, setShowArchived] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch("/api/scripts/list?all=true")
      .then(r => r.json())
      .then(d => { setScripts(d.scripts ?? []); setLoading(false); });
  }, []);

  const active = scripts.filter(s => !s.archived_at);
  const archived = scripts.filter(s => s.archived_at);
  const displayed = showArchived ? archived : active;
  const atScriptLimit = active.length >= 2;

  return (
    <div className="max-w-4xl mx-auto px-8 py-10 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-semibold text-stone-900 tracking-tight">Scripts</h1>
          <p className="text-sm text-stone-500 mt-0.5">Vos process de vente et réponses aux objections</p>
        </div>
        <div className="flex items-center gap-2">
          {archived.length > 0 && (
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
          )}
          {!showArchived && (
            <button
              onClick={() => !atScriptLimit && router.push("/scripts/new")}
              disabled={atScriptLimit}
              title={atScriptLimit ? "Limite de 2 scripts atteinte sur le plan gratuit" : undefined}
              className={cn(
                "flex items-center gap-1.5 text-[13px] font-medium px-3.5 py-2 rounded-lg transition-colors",
                atScriptLimit
                  ? "bg-stone-200 text-stone-400 cursor-not-allowed"
                  : "bg-stone-900 text-white hover:bg-stone-700"
              )}
            >
              <Plus className="w-4 h-4" /> Nouveau script
            </button>
          )}
        </div>
      </div>

      {!loading && !showArchived && (
        <div className={cn(
          "flex items-center justify-between px-4 py-3 rounded-xl border text-[13px]",
          atScriptLimit
            ? "bg-rose-50 border-rose-200 text-rose-700"
            : "bg-stone-50 border-stone-200 text-stone-600"
        )}>
          <span>
            {atScriptLimit
              ? "Limite atteinte — 2 scripts maximum sur le plan gratuit."
              : `${active.length} / 2 scripts utilisés sur le plan gratuit.`}
          </span>
          <span className="font-semibold tabular-nums">{active.length}/2</span>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20 text-stone-400 gap-2">
          <Loader2 className="w-4 h-4 animate-spin" /> Chargement…
        </div>
      ) : displayed.length === 0 && !showArchived ? (
        <div className="border-2 border-dashed border-stone-200 rounded-xl flex flex-col items-center justify-center py-16 text-center gap-3">
          <div className="w-12 h-12 bg-stone-100 rounded-xl flex items-center justify-center">
            <FileText className="w-6 h-6 text-stone-400" />
          </div>
          <div>
            <p className="font-medium text-stone-800 text-sm">Aucun script pour l'instant</p>
            <p className="text-stone-400 text-xs mt-1">Créez votre premier script ou importez un template.</p>
          </div>
          <button
            onClick={() => router.push("/scripts/new")}
            className="flex items-center gap-1.5 text-[13px] font-medium px-3.5 py-2 rounded-lg bg-stone-900 text-white hover:bg-stone-700 transition-colors mt-1"
          >
            <Plus className="w-4 h-4" /> Créer un script
          </button>
        </div>
      ) : displayed.length === 0 && showArchived ? (
        <div className="flex flex-col items-center justify-center py-20 text-center gap-2">
          <p className="text-[14px] font-medium text-stone-600">Aucun script archivé</p>
        </div>
      ) : (
        <div className="border border-stone-200 rounded-xl overflow-hidden divide-y divide-stone-100">
          {displayed.map(script => (
            <ScriptCard
              key={script.id}
              script={script as Parameters<typeof ScriptCard>[0]["script"]}
            />
          ))}
        </div>
      )}
    </div>
  );
}
