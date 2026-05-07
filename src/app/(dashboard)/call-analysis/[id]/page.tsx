"use client";
import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, ArrowLeft, BookOpen, MessageSquare, Zap, Mic, CheckCircle2, TrendingUp, TrendingDown, Clock, Pencil } from "lucide-react";
import { ScoreGauge } from "@/components/call-analysis/ScoreGauge";
import { TalkRatioBar } from "@/components/call-analysis/TalkRatioBar";
import { OutcomeBadge, OUTCOME_CONFIG, Outcome } from "@/components/call-analysis/OutcomeBadge";
import { cn } from "@/lib/utils";

type KeyMoment = { time: string; label: string; category: string };

type Analysis = {
  id: string; prospect_name: string | null; call_date: string | null;
  outcome: Outcome; outcome_updated_at: string | null;
  lead_status: Outcome; lead_status_updated_at: string | null;
  status: string;
  scores: Record<string, number> | null;
  recommendations: Record<string, string | string[]> | null;
  talk_ratio: { coach: number; prospect: number; coach_name?: string; prospect_name?: string } | null;
  key_moments: KeyMoment[] | null;
  scripts: { name: string } | null;
};

const SCORE_CATEGORIES = [
  { key: "process",    label: "Respect du process",       icon: <BookOpen className="w-3.5 h-3.5" /> },
  { key: "discovery",  label: "Qualité de la découverte", icon: <MessageSquare className="w-3.5 h-3.5" /> },
  { key: "objections", label: "Gestion des objections",   icon: <Zap className="w-3.5 h-3.5" /> },
  { key: "posture",    label: "Posture & énergie",         icon: <Mic className="w-3.5 h-3.5" /> },
  { key: "conclusion", label: "Conclusion",                icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
];

const CATEGORY_COLORS: Record<string, string> = {
  process: "bg-violet-100 text-violet-700",
  discovery: "bg-sky-100 text-sky-700",
  objections: "bg-amber-100 text-amber-700",
  posture: "bg-emerald-100 text-emerald-700",
  conclusion: "bg-rose-100 text-rose-700",
};

export default function AnalysisDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [outcome, setOutcome] = useState<Outcome>(null);
  const [leadStatus, setLeadStatus] = useState<Outcome>(null);
  const [leadStatusUpdatedAt, setLeadStatusUpdatedAt] = useState<string | null>(null);
  const [savingOutcome, setSavingOutcome] = useState(false);
  const [savingLeadStatus, setSavingLeadStatus] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState("");
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    async function fetch_() {
      const res = await fetch(`/api/call-analysis/${id}`);
      const data = await res.json();
      if (data.analysis) {
        setAnalysis(data.analysis);
        setOutcome(data.analysis.outcome);
        setLeadStatus(data.analysis.lead_status);
        setLeadStatusUpdatedAt(data.analysis.lead_status_updated_at);
        setLoading(false);
        if (data.analysis.status === "done" || data.analysis.status === "error") clearInterval(interval);
      }
    }
    fetch_();
    interval = setInterval(fetch_, 3000);
    return () => clearInterval(interval);
  }, [id]);

  async function updateOutcome(value: Outcome) {
    const newValue = outcome === value ? null : value;
    setOutcome(newValue);
    setSavingOutcome(true);
    await fetch(`/api/call-analysis/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ outcome: newValue }) });
    setSavingOutcome(false);
  }

  function startEditName() {
    setNameValue(analysis?.prospect_name ?? "");
    setEditingName(true);
    setTimeout(() => nameInputRef.current?.focus(), 0);
  }

  async function saveName() {
    setEditingName(false);
    const trimmed = nameValue.trim();
    if (trimmed === (analysis?.prospect_name ?? "")) return;
    setAnalysis(a => a ? { ...a, prospect_name: trimmed || null } : a);
    await fetch(`/api/call-analysis/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prospect_name: trimmed || null }) });
  }

  async function updateLeadStatus(value: Outcome) {
    const newValue = leadStatus === value ? null : value;
    setLeadStatus(newValue);
    setSavingLeadStatus(true);
    const now = new Date().toISOString();
    await fetch(`/api/call-analysis/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ lead_status: newValue }) });
    setLeadStatusUpdatedAt(now);
    setSavingLeadStatus(false);
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh] gap-3 text-stone-400">
      <Loader2 className="w-5 h-5 animate-spin" />
      <span className="text-[13px]">Chargement…</span>
    </div>
  );

  if (!analysis) return <div className="p-8 text-stone-400 text-sm">Analyse introuvable.</div>;

  if (analysis.status === "analyzing") return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-8">
      <Loader2 className="w-8 h-8 animate-spin text-stone-400" />
      <div>
        <p className="text-[15px] font-medium text-stone-700">Analyse en cours…</p>
        <p className="text-[13px] text-stone-500 mt-1">L'IA analyse le transcript. Cela prend 15 à 30 secondes.</p>
      </div>
    </div>
  );

  if (analysis.status === "error") return (
    <div className="max-w-lg mx-auto py-16 text-center space-y-3">
      <p className="text-[15px] font-medium text-rose-600">L'analyse a échoué.</p>
      <p className="text-[13px] text-stone-500">Veuillez réessayer avec un nouveau transcript.</p>
      <button onClick={() => router.push("/call-analysis/new")} className="text-[13px] text-stone-600 underline">Nouvelle analyse</button>
    </div>
  );

  const overall = analysis.scores?.overall ?? 0;
  const overallColor = overall >= 75 ? "text-emerald-600" : overall >= 50 ? "text-amber-600" : "text-rose-600";

  const strengths = analysis.recommendations?.strengths as string[] | undefined;
  const improvements = analysis.recommendations?.improvements as string[] | undefined;
  const keyMoments = analysis.key_moments ?? [];

  return (
    <div className="max-w-4xl mx-auto px-8 py-10 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <button onClick={() => router.push("/call-analysis")} className="mt-1 text-stone-400 hover:text-stone-700 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            {editingName ? (
              <input
                ref={nameInputRef}
                value={nameValue}
                onChange={e => setNameValue(e.target.value)}
                onBlur={saveName}
                onKeyDown={e => { if (e.key === "Enter") saveName(); if (e.key === "Escape") setEditingName(false); }}
                className="text-[22px] font-semibold text-stone-900 tracking-tight border-b-2 border-stone-400 focus:outline-none focus:border-stone-700 bg-transparent w-72"
              />
            ) : (
              <button onClick={startEditName} className="flex items-center gap-2 group/hname text-left">
                <h1 className="text-[22px] font-semibold text-stone-900 tracking-tight">
                  {analysis.prospect_name ?? <span className="text-stone-400">Appel sans nom</span>}
                </h1>
                <Pencil className="w-3.5 h-3.5 text-stone-300 group-hover/hname:text-stone-500 transition-colors mt-0.5" />
              </button>
            )}
            <div className="flex items-center gap-3 mt-1.5 text-[12px] text-stone-500">
              {analysis.call_date && <span>{new Date(analysis.call_date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</span>}
              {analysis.scripts?.name && <span>· {analysis.scripts.name}</span>}
            </div>
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className={cn("text-4xl font-bold tabular-nums", overallColor)}>{overall}</div>
          <div className="text-[11px] text-stone-500 mt-0.5">Score global</div>
        </div>
      </div>

      {/* Résultat de l'appel + Statut du lead */}
      <div className="grid grid-cols-2 gap-4">
        {/* Résultat de l'appel — figé après le call */}
        <div className="border border-stone-200 rounded-xl bg-white shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[12px] font-semibold text-stone-700 uppercase tracking-wide">Résultat de l'appel</p>
            {savingOutcome && <span className="text-[11px] text-stone-400">Sauvegarde…</span>}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {(["closed", "next_call", "no_decision", "lost"] as const).map(key => {
              const c = OUTCOME_CONFIG[key];
              return (
                <button key={key} onClick={() => updateOutcome(key)}
                  className={cn("flex items-center gap-2 px-3 py-2 rounded-lg border text-[12.5px] transition-colors",
                    outcome === key ? `${c.bg} ${c.text} border-transparent font-medium` : "border-stone-200 text-stone-500 hover:bg-stone-50"
                  )}>
                  {c.icon}{c.label}
                </button>
              );
            })}
          </div>
          <p className="text-[11px] text-stone-400 mt-2.5">Résultat immédiat à l'issue du call.</p>
        </div>

        {/* Statut du lead — mis à jour dans le temps */}
        <div className="border border-stone-200 rounded-xl bg-white shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[12px] font-semibold text-stone-700 uppercase tracking-wide">Statut du lead</p>
            {savingLeadStatus && <span className="text-[11px] text-stone-400">Sauvegarde…</span>}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {(["closed", "next_call", "no_decision", "lost"] as const).map(key => {
              const c = OUTCOME_CONFIG[key];
              return (
                <button key={key} onClick={() => updateLeadStatus(key)}
                  className={cn("flex items-center gap-2 px-3 py-2 rounded-lg border text-[12.5px] transition-colors",
                    leadStatus === key ? `${c.bg} ${c.text} border-transparent font-medium` : "border-stone-200 text-stone-500 hover:bg-stone-50"
                  )}>
                  {c.icon}{c.label}
                </button>
              );
            })}
          </div>
          <p className="text-[11px] text-stone-400 mt-2.5">
            {leadStatusUpdatedAt
              ? <>Mis à jour le {new Date(leadStatusUpdatedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })} à {new Date(leadStatusUpdatedAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</>
              : "Évolution du lead dans le temps."}
          </p>
        </div>
      </div>

      {/* Synthèse globale */}
      {analysis.recommendations?.overall && (
        <div className="bg-stone-900 rounded-xl px-5 py-4">
          <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-2">Synthèse IA</p>
          <p className="text-[13.5px] text-white leading-relaxed">{analysis.recommendations.overall as string}</p>
        </div>
      )}

      {/* Points forts / Axes d'amélioration */}
      {(strengths?.length || improvements?.length) ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {strengths?.length ? (
            <div className="border border-emerald-100 bg-emerald-50/50 rounded-xl p-4 space-y-3">
              <p className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5" /> Points forts
              </p>
              <ul className="space-y-2">
                {strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-[13px] text-stone-700">
                    <span className="mt-0.5 w-4 h-4 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {improvements?.length ? (
            <div className="border border-amber-100 bg-amber-50/50 rounded-xl p-4 space-y-3">
              <p className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider flex items-center gap-1.5">
                <TrendingDown className="w-3.5 h-3.5" /> Axes d'amélioration
              </p>
              <ul className="space-y-2">
                {improvements.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-[13px] text-stone-700">
                    <span className="mt-0.5 w-4 h-4 rounded-full bg-amber-400 text-white text-[10px] font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}

      {/* Moments clés */}
      {keyMoments.length > 0 && (
        <div className="border border-stone-200 rounded-xl bg-white shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-stone-100 flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-stone-400" />
            <h2 className="text-[13px] font-semibold text-stone-700">Moments clés</h2>
          </div>
          <div className="divide-y divide-stone-100">
            {keyMoments.map((m, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-3">
                <span className="shrink-0 text-[12px] font-mono font-medium text-stone-500 w-14">{m.time}</span>
                <span className="flex-1 text-[13px] text-stone-700">{m.label}</span>
                <span className={cn("shrink-0 text-[10px] px-2 py-0.5 rounded-full font-medium", CATEGORY_COLORS[m.category] ?? "bg-stone-100 text-stone-500")}>
                  {m.category}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Talk ratio */}
      {analysis.talk_ratio && <TalkRatioBar ratio={analysis.talk_ratio} />}

      {/* Scores détaillés */}
      {analysis.scores && (
        <div className="space-y-3">
          <h2 className="text-[12px] font-semibold text-stone-400 uppercase tracking-wider">Scores détaillés</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {SCORE_CATEGORIES.map(({ key, label, icon }) => (
              <ScoreGauge
                key={key}
                label={label}
                score={analysis.scores![key] ?? 0}
                recommendation={analysis.recommendations?.[key] as string | undefined}
                icon={icon}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
