"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Upload, FileText, X, ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { OUTCOME_CONFIG } from "@/components/call-analysis/OutcomeBadge";

type Script = { id: string; name: string; is_default: boolean };

export default function NewAnalysisPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [transcript, setTranscript] = useState("");
  const [filename, setFilename] = useState("");
  const [scripts, setScripts] = useState<Script[]>([]);
  const [scriptId, setScriptId] = useState("");
  const [outcome, setOutcome] = useState("");
  const [prospectName, setProspectName] = useState("");
  const [callDate, setCallDate] = useState(new Date().toISOString().split("T")[0]);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [usageAnalyses, setUsageAnalyses] = useState<{ used: number; max: number } | null>(null);
  const [scriptDropdown, setScriptDropdown] = useState(false);
  const scriptDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/scripts/list").then(r => r.json()).then(d => {
      const list: Script[] = d.scripts ?? [];
      setScripts(list);
      const def = list.find(s => s.is_default);
      if (def) setScriptId(def.id);
    });
    fetch("/api/call-analysis").then(r => r.json()).then(d => {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const thisMonth = (d.analyses ?? []).filter((a: { created_at: string; status: string }) =>
        a.status !== "archived" && new Date(a.created_at) >= startOfMonth
      ).length;
      setUsageAnalyses({ used: thisMonth, max: 5 });
    });
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (scriptDropdownRef.current && !scriptDropdownRef.current.contains(e.target as Node)) setScriptDropdown(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleFile(file: File) {
    if (!file.name.match(/\.(txt|md)$/i)) {
      setError("Format non supporté. Utilisez un fichier .txt ou collez le texte directement.");
      return;
    }
    const reader = new FileReader();
    reader.onload = e => { setTranscript(e.target?.result as string); setFilename(file.name); };
    reader.readAsText(file);
  }

  async function submit() {
    if (!transcript.trim()) { setError("Le transcript est requis."); return; }
    setError("");
    const res = await fetch("/api/call-analysis", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transcript_text: transcript, transcript_filename: filename || null, script_id: scriptId || null, prospect_name: prospectName || null, call_date: callDate || null, outcome: outcome || null }),
    });
    if (res.status === 403) {
      setError("Vous avez atteint la limite de 5 analyses par mois sur le plan gratuit.");
      return;
    }
    setTimeout(() => router.push("/call-analysis"), 400);
  }

  return (
    <div className="max-w-4xl mx-auto px-8 py-10 space-y-6">
      <div>
        <h1 className="text-[22px] font-semibold text-stone-900 tracking-tight">Nouvelle analyse</h1>
        <p className="text-sm text-stone-500 mt-0.5">Importez un transcript pour obtenir un score et des recommandations IA.</p>
      </div>

      {usageAnalyses && (
        <div className={cn(
          "flex items-center justify-between px-4 py-3 rounded-xl border text-[13px]",
          usageAnalyses.used >= usageAnalyses.max
            ? "bg-rose-50 border-rose-200 text-rose-700"
            : usageAnalyses.used >= usageAnalyses.max - 1
            ? "bg-amber-50 border-amber-200 text-amber-700"
            : "bg-stone-50 border-stone-200 text-stone-600"
        )}>
          <span>
            {usageAnalyses.used >= usageAnalyses.max
              ? "Vous avez atteint la limite de 5 analyses ce mois-ci."
              : `${usageAnalyses.used} / ${usageAnalyses.max} analyses utilisées ce mois-ci.`}
          </span>
          <span className="font-semibold tabular-nums">{usageAnalyses.used}/{usageAnalyses.max}</span>
        </div>
      )}

      {/* Recorder tools */}
      <div className="border border-stone-200 rounded-xl bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-stone-100">
          <h2 className="text-[13px] font-semibold text-stone-700">Obtenir un transcript</h2>
          <p className="text-[12px] text-stone-500 mt-0.5">Ces outils enregistrent et transcrivent automatiquement vos calls Meet, Zoom ou Teams.</p>
        </div>
        <div className="grid grid-cols-2 gap-px bg-stone-100 sm:grid-cols-4">
          {[
            { name: "tl;dv", tag: "Gratuit", desc: "Enregistre & résume vos réunions", url: "https://tldv.io" },
            { name: "Fathom", tag: "Gratuit", desc: "Notetaker IA, highlights auto", url: "https://fathom.video" },
            { name: "Fireflies", tag: "Freemium", desc: "Transcription + recherche dans vos calls", url: "https://fireflies.ai" },
            { name: "Otter.ai", tag: "Freemium", desc: "Transcription en temps réel", url: "https://otter.ai" },
          ].map(tool => (
            <a
              key={tool.name}
              href={tool.url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white px-4 py-3.5 flex flex-col gap-1 hover:bg-stone-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-semibold text-stone-800">{tool.name}</span>
                <span className="text-[10px] bg-stone-100 text-stone-500 px-1.5 py-0.5 rounded-full font-medium leading-none">{tool.tag}</span>
              </div>
              <p className="text-[11.5px] text-stone-500 leading-snug">{tool.desc}</p>
            </a>
          ))}
        </div>
      </div>

      {/* Transcript */}
      <div className="border border-stone-200 rounded-xl bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-stone-100">
          <h2 className="text-[13px] font-semibold text-stone-700">Transcript de l'appel</h2>
        </div>
        <div className="p-4 space-y-3">
          {/* Drop zone */}
          {!transcript && (
            <div
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "border-2 border-dashed rounded-xl p-8 flex flex-col items-center gap-2 cursor-pointer transition-colors",
                dragOver ? "border-stone-400 bg-stone-50" : "border-stone-200 hover:border-stone-300 hover:bg-stone-50"
              )}
            >
              <Upload className="w-7 h-7 text-stone-300" />
              <p className="text-[13px] font-medium text-stone-500">Glisser un fichier .txt ici</p>
              <p className="text-[11px] text-stone-500">ou cliquer pour parcourir</p>
              <input ref={fileInputRef} type="file" accept=".txt,.md" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
            </div>
          )}

          {filename && (
            <div className="flex items-center gap-2 text-[12.5px] text-stone-600 bg-stone-50 rounded-lg px-3 py-2">
              <FileText className="w-3.5 h-3.5 text-stone-400 shrink-0" />
              <span className="flex-1 truncate">{filename}</span>
              <button onClick={() => { setTranscript(""); setFilename(""); }} className="text-stone-400 hover:text-stone-700">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <div className="relative">
            <textarea
              value={transcript}
              onChange={e => { setTranscript(e.target.value); if (e.target.value) setFilename(""); }}
              placeholder={transcript ? "" : "Ou collez votre transcript ici…\n\nExemple :\nAurélien : Bonjour, comment ça va ?\nMarc : Bien merci…"}
              rows={transcript ? 10 : 6}
              className="w-full text-[13px] border border-stone-200 rounded-xl px-3 py-2.5 bg-white text-stone-800 placeholder:text-stone-400 focus:outline-none focus:border-stone-400 resize-none transition-colors"
            />
            {transcript && (
              <div className="absolute top-2 right-2 text-[10px] text-stone-400">
                {transcript.split(/\s+/).length} mots
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Metadata */}
      <div className="border border-stone-200 rounded-xl bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-stone-100">
          <h2 className="text-[13px] font-semibold text-stone-700">Informations</h2>
        </div>
        <div className="px-5 py-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[12px] text-stone-600 font-medium">Nom du prospect</label>
              <input value={prospectName} onChange={e => setProspectName(e.target.value)} placeholder="Ex : Marie Dupont" className="w-full text-[13px] border border-stone-200 rounded-lg px-3 py-2 focus:outline-none focus:border-stone-400 transition-colors" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[12px] text-stone-600 font-medium">Date de l'appel</label>
              <input type="date" value={callDate} onChange={e => setCallDate(e.target.value)} className="w-full text-[13px] border border-stone-200 rounded-lg px-3 py-2 focus:outline-none focus:border-stone-400 transition-colors" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[12px] text-stone-600 font-medium">Script de référence <span className="text-stone-300">(optionnel)</span></label>
            <div ref={scriptDropdownRef} className="relative">
              <button
                type="button"
                onClick={() => setScriptDropdown(o => !o)}
                className="w-full flex items-center justify-between text-[13px] border border-stone-200 rounded-lg px-3 py-2 bg-white hover:border-stone-300 hover:bg-stone-50 focus:outline-none focus:border-stone-400 transition-colors text-left"
              >
                <span className="flex items-center gap-2 min-w-0">
                  {scriptId ? (
                    <>
                      <span className="truncate">{scripts.find(s => s.id === scriptId)?.name}</span>
                      {scripts.find(s => s.id === scriptId)?.is_default && (
                        <span className="shrink-0 text-[10px] bg-stone-900 text-white px-1.5 py-0.5 rounded-full font-medium leading-none">Par défaut</span>
                      )}
                    </>
                  ) : (
                    <span className="text-stone-400">Sans script — analyse générale</span>
                  )}
                </span>
                <ChevronDown className={cn("w-3.5 h-3.5 text-stone-400 shrink-0 ml-2 transition-transform", scriptDropdown && "rotate-180")} />
              </button>
              {scriptDropdown && (
                <div className="absolute z-20 mt-1 w-full bg-white border border-stone-200 rounded-xl shadow-lg overflow-hidden">
                  <button
                    type="button"
                    onClick={() => { setScriptId(""); setScriptDropdown(false); }}
                    className="flex items-center justify-between w-full px-3 py-2 text-[13px] text-stone-500 hover:bg-stone-50 transition-colors"
                  >
                    Sans script — analyse générale
                    {!scriptId && <Check className="w-3.5 h-3.5 text-stone-500" />}
                  </button>
                  {scripts.length > 0 && <div className="border-t border-stone-100" />}
                  {scripts.map(s => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => { setScriptId(s.id); setScriptDropdown(false); }}
                      className="flex items-center justify-between w-full px-3 py-2 text-[13px] text-stone-700 hover:bg-stone-50 transition-colors"
                    >
                      <span className="flex items-center gap-2 min-w-0">
                        <span className="truncate">{s.name}</span>
                        {s.is_default && (
                          <span className="shrink-0 text-[10px] bg-stone-900 text-white px-1.5 py-0.5 rounded-full font-medium leading-none">Par défaut</span>
                        )}
                      </span>
                      {scriptId === s.id && <Check className="w-3.5 h-3.5 text-stone-500 shrink-0 ml-2" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[12px] text-stone-600 font-medium">Résultat de l'appel <span className="text-stone-300">(optionnel)</span></label>
            <div className="grid grid-cols-2 gap-2">
              {(["closed", "next_call", "no_decision", "lost"] as const).map(key => {
                const c = OUTCOME_CONFIG[key];
                return (
                  <button
                    key={key}
                    onClick={() => setOutcome(outcome === key ? "" : key)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-lg border text-[13px] transition-colors",
                      outcome === key ? `${c.bg} ${c.text} border-transparent font-medium` : "border-stone-200 text-stone-600 hover:bg-stone-50"
                    )}
                  >
                    {c.icon}
                    {c.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {error && <p className="text-[13px] text-rose-600 bg-rose-50 rounded-lg px-3 py-2">{error}</p>}

      <div className="flex items-center justify-between">
        <button onClick={() => router.back()} className="text-[13px] text-stone-500 hover:text-stone-700 transition-colors">
          Annuler
        </button>
        <button
          onClick={submit}
          disabled={!transcript.trim()}
          className="flex items-center gap-2 text-[13px] font-medium px-4 py-2 rounded-lg bg-stone-900 text-white hover:bg-stone-700 disabled:opacity-50 transition-colors"
        >
          Lancer l'analyse
        </button>
      </div>
    </div>
  );
}
