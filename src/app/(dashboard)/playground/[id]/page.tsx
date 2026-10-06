"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Loader2, ArrowLeft, BookOpen, MessageSquare, Zap, Mic, CheckCircle2,
  TrendingUp, TrendingDown, Clock, Archive, ArchiveX, Trash2,
} from "lucide-react";
import { ScoreGauge } from "@/components/call-analysis/ScoreGauge";
import { TalkRatioBar } from "@/components/call-analysis/TalkRatioBar";
import { cn } from "@/lib/utils";
import { useLang } from "@/lib/lang-context";
import { i18n } from "@/lib/i18n";

type KeyMoment = { time: string; label: string; category: string };

type Session = {
  id: string;
  script_id: string | null;
  script_name: string;
  persona_id: string | null;
  persona_name: string | null;
  duration_seconds: number;
  created_at: string;
  archived_at: string | null;
  status: string;
  scores: Record<string, number> | null;
  recommendations: Record<string, string | string[]> | null;
  talk_ratio: { coach: number; prospect: number; coach_name?: string; prospect_name?: string } | null;
  key_moments: KeyMoment[] | null;
};

const PERSONA_EMOJI: Record<string, string> = {
  sophie: "👩‍💼", marc: "👨‍💻", lucie: "👩‍🦱", thomas: "👨‍💼",
};

const CATEGORY_COLORS: Record<string, string> = {
  process: "bg-violet-100 text-violet-700",
  discovery: "bg-sky-100 text-sky-700",
  objections: "bg-amber-100 text-amber-700",
  posture: "bg-emerald-100 text-emerald-700",
  conclusion: "bg-rose-100 text-rose-700",
};

function formatDuration(s: number) {
  if (s < 60) return `${s} sec`;
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return rem > 0 ? `${m} min ${rem} sec` : `${m} min`;
}

export default function PlaygroundSessionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { lang } = useLang();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [archiving, setArchiving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const scoreCategories = [
    { key: "process",    label: i18n.analysisDetail.process[lang],    icon: <BookOpen className="w-3.5 h-3.5" /> },
    { key: "discovery",  label: i18n.analysisDetail.discovery[lang],  icon: <MessageSquare className="w-3.5 h-3.5" /> },
    { key: "objections", label: i18n.analysisDetail.objections[lang], icon: <Zap className="w-3.5 h-3.5" /> },
    { key: "posture",    label: i18n.analysisDetail.posture[lang],    icon: <Mic className="w-3.5 h-3.5" /> },
    { key: "conclusion", label: i18n.analysisDetail.conclusion[lang], icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    async function fetch_() {
      const res = await fetch(`/api/playground/sessions/${id}`);
      const data = await res.json();
      if (data.session) {
        setSession(data.session);
        setLoading(false);
        if (data.session.status === "done" || data.session.status === "error") {
          clearInterval(interval);
        }
      } else {
        setLoading(false);
      }
    }
    fetch_();
    interval = setInterval(fetch_, 3000);
    return () => clearInterval(interval);
  }, [id]);

  async function toggleArchive() {
    if (!session) return;
    setArchiving(true);
    const archived = !session.archived_at;
    await fetch(`/api/playground/sessions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ archived }),
    });
    setSession(s => s ? { ...s, archived_at: archived ? new Date().toISOString() : null } : s);
    setArchiving(false);
  }

  async function deleteSession() {
    setDeleting(true);
    await fetch(`/api/playground/sessions/${id}`, { method: "DELETE" });
    router.push("/playground");
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh] gap-3 text-stone-400">
      <Loader2 className="w-5 h-5 animate-spin" />
      <span className="text-[13px]">{i18n.common.loading[lang]}</span>
    </div>
  );

  if (!session) return (
    <div className="max-w-4xl mx-auto px-8 py-10">
      <button onClick={() => router.push("/playground")} className="flex items-center gap-1 text-sm text-stone-500 hover:text-stone-700 transition-colors mb-6">
        <ArrowLeft className="w-4 h-4" /> Playground
      </button>
      <p className="text-stone-400 text-sm">{i18n.playground.notFound[lang]}</p>
    </div>
  );

  if (session.status === "analyzing") return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-8">
      <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
      <div>
        <p className="text-[15px] font-medium text-stone-700">{i18n.analysisDetail.analyzingTitle[lang]}</p>
        <p className="text-[13px] text-stone-500 mt-1">{i18n.analysisDetail.analyzingSub[lang]}</p>
      </div>
    </div>
  );

  if (session.status === "error") return (
    <div className="max-w-lg mx-auto py-16 text-center space-y-3">
      <p className="text-[15px] font-medium text-rose-600">{i18n.analysisDetail.failed[lang]}</p>
      <p className="text-[13px] text-stone-500">{i18n.analysisDetail.failedSub[lang]}</p>
      <button onClick={() => router.push("/playground")} className="text-[13px] text-stone-600 underline">{i18n.playground.errorBack[lang]}</button>
    </div>
  );

  const overall = session.scores?.overall ?? 0;
  const overallColor = overall >= 75 ? "text-emerald-600" : overall >= 50 ? "text-amber-600" : "text-rose-600";
  const overallBg = overall >= 75 ? "bg-emerald-50" : overall >= 50 ? "bg-amber-50" : "bg-rose-50";
  const isArchived = !!session.archived_at;
  const emoji = session.persona_id ? (PERSONA_EMOJI[session.persona_id] ?? "🧑‍💼") : "🧑‍💼";
  const strengths = session.recommendations?.strengths as string[] | undefined;
  const improvements = session.recommendations?.improvements as string[] | undefined;
  const keyMoments = session.key_moments ?? [];
  const hasDone = session.status === "done" && session.scores;

  return (
    <div className="max-w-4xl mx-auto px-8 py-10 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <button onClick={() => router.push("/playground")} className="mt-1 text-stone-400 hover:text-stone-700 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-violet-50 flex items-center justify-center text-2xl shrink-0">
              {emoji}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-[22px] font-semibold text-stone-900 tracking-tight">
                  {session.persona_name ?? "Prospect IA"}
                </h1>
                {isArchived && (
                  <span className="text-[10px] bg-stone-100 text-stone-400 px-2 py-0.5 rounded-full font-medium">{i18n.playground.archivedBadge[lang]}</span>
                )}
              </div>
              <div className="flex items-center gap-3 mt-1 text-[12px] text-stone-500">
                <span>{session.script_name}</span>
                <span>·</span>
                <span>{formatDuration(session.duration_seconds)}</span>
                <span>·</span>
                <span>{new Date(session.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {hasDone && (
            <div className={cn("flex flex-col items-center justify-center w-14 h-14 rounded-2xl", overallBg)}>
              <div className={cn("text-[24px] font-bold tabular-nums leading-none", overallColor)}>{overall}</div>
              <div className="text-[9px] font-semibold text-stone-400 uppercase tracking-wider mt-0.5">{i18n.analysisDetail.overallScore[lang]}</div>
            </div>
          )}
          <button
            onClick={toggleArchive}
            disabled={archiving}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-stone-500 border border-stone-200 rounded-lg hover:bg-stone-50 hover:border-stone-300 transition-all disabled:opacity-50"
          >
            {archiving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : isArchived ? <ArchiveX className="w-3.5 h-3.5" /> : <Archive className="w-3.5 h-3.5" />}
            {isArchived ? i18n.playground.unarchive[lang] : i18n.playground.archive[lang]}
          </button>
          {!confirmDelete ? (
            <button
              onClick={() => setConfirmDelete(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-rose-500 border border-rose-200 rounded-lg hover:bg-rose-50 hover:border-rose-300 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" /> {i18n.playground.delete_[lang]}
            </button>
          ) : (
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-stone-500">{i18n.playground.confirmQ[lang]}</span>
              <button onClick={deleteSession} disabled={deleting} className="px-2.5 py-1.5 text-xs text-white bg-rose-500 hover:bg-rose-400 rounded-lg transition-colors disabled:opacity-50">
                {deleting ? <Loader2 className="w-3 h-3 animate-spin" /> : i18n.playground.yes[lang]}
              </button>
              <button onClick={() => setConfirmDelete(false)} className="px-2.5 py-1.5 text-xs text-stone-500 border border-stone-200 rounded-lg hover:bg-stone-50 transition-colors">
                {i18n.common.cancel[lang]}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Pending state */}
      {session.status === "pending" && (
        <div className="border border-stone-200 rounded-xl bg-white p-8 flex flex-col items-center text-center gap-3">
          <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center">
            <Clock className="w-5 h-5 text-stone-400" />
          </div>
          <p className="text-[14px] font-medium text-stone-600">{i18n.playground.pendingTitle[lang]}</p>
          <p className="text-[13px] text-stone-400 max-w-xs leading-relaxed">
            {i18n.playground.pendingSub[lang]}
          </p>
        </div>
      )}

      {/* AI Summary */}
      {hasDone && session.recommendations?.overall && (
        <div className="bg-[#0E0E16] rounded-xl px-5 py-4 border-l-4 border-violet-500">
          <p className="text-[11px] font-semibold text-violet-400 uppercase tracking-wider mb-2">{i18n.analysisDetail.aiSummary[lang]}</p>
          <p className="text-[13.5px] text-stone-300 leading-relaxed">{session.recommendations.overall as string}</p>
        </div>
      )}

      {/* Strengths / Improvements */}
      {hasDone && (strengths?.length || improvements?.length) ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {strengths?.length ? (
            <div className="border border-emerald-100 bg-emerald-50/50 rounded-xl p-4 space-y-3">
              <p className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5" /> {i18n.analysisDetail.strengths[lang]}
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
                <TrendingDown className="w-3.5 h-3.5" /> {i18n.analysisDetail.improvements[lang]}
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

      {/* Key moments */}
      {hasDone && keyMoments.length > 0 && (
        <div className="border border-stone-200 rounded-xl bg-white shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-stone-100 flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-stone-400" />
            <h2 className="text-[13px] font-semibold text-stone-700">{i18n.analysisDetail.keyMoments[lang]}</h2>
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
      {hasDone && session.talk_ratio && <TalkRatioBar ratio={session.talk_ratio} />}

      {/* Detailed scores */}
      {hasDone && (
        <div className="space-y-3">
          <h2 className="text-[12px] font-semibold text-stone-400 uppercase tracking-wider">{i18n.analysisDetail.detailedScores[lang]}</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {scoreCategories.map(({ key, label, icon }) => (
              <ScoreGauge
                key={key}
                label={label}
                score={session.scores![key] ?? 0}
                recommendation={session.recommendations?.[key] as string | undefined}
                icon={icon}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
