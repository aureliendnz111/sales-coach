"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Mic, MicOff, PhoneOff, ChevronLeft, Loader2, Plus, Swords, Clock, FileText, ShieldAlert, Archive, ArchiveX, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { StepCard } from "@/components/scripts/StepCard";
import { ObjectionCard } from "@/components/scripts/ObjectionCard";
import Link from "next/link";

type Phase = "home" | "setup" | "countdown" | "call";

type ScriptItem = {
  id: string; name: string; goal: string; is_default: boolean;
  duration_minutes: number;
  steps: { count: number }[]; objections: { count: number }[];
};

type Step = {
  id: string; order: number; name: string; goal: string | null;
  duration_estimate_minutes: number | null;
  script_lines: string[] | null; questions: string[] | null;
  tips: string[] | null; key_phrases: string[] | null;
};

type Objection = {
  id: string; order: number; label: string; category: string;
  key_reframe: string | null; responses: string[] | null;
  trigger_phrases: string[] | null; applicable_step_orders: number[] | null;
};

type FullScript = {
  id: string; name: string; goal: string;
  duration_minutes: number; steps: Step[]; objections: Objection[];
};

type TrainingSession = {
  id: string; script_id: string | null; script_name: string;
  persona_id: string | null; persona_name: string | null;
  duration_seconds: number; created_at: string; archived_at: string | null;
};

type Persona = {
  id: string; emoji: string; name: string; role: string;
  description: string; tags: string[];
};

const AI_PERSONAS: Persona[] = [
  {
    id: "sophie",
    emoji: "👩‍💼",
    name: "Sophie",
    role: "Dirigeante PME",
    description: "Pragmatique et directe. Peu de temps, pose vite la question du prix.",
    tags: ["B2B", "PME"],
  },
  {
    id: "marc",
    emoji: "👨‍💻",
    name: "Marc",
    role: "DSI Grands comptes",
    description: "Analytique, beaucoup de questions techniques. Cycle de décision long.",
    tags: ["Tech", "Enterprise"],
  },
  {
    id: "lucie",
    emoji: "👩‍🦱",
    name: "Lucie",
    role: "Coach sportif indépendant",
    description: "Enthousiaste mais sensible au prix. Veut voir des résultats rapides.",
    tags: ["Sport", "B2C"],
  },
  {
    id: "thomas",
    emoji: "👨‍💼",
    name: "Thomas",
    role: "Directeur commercial",
    description: "Connaît bien les techniques de vente. Met la pression sur la valeur ajoutée.",
    tags: ["Sales", "B2B"],
  },
];

// ── helpers ──────────────────────────────────────────────────────────────────

function formatTime(s: number) {
  const m = Math.floor(s / 60).toString().padStart(2, "0");
  return `${m}:${(s % 60).toString().padStart(2, "0")}`;
}

function formatDuration(s: number) {
  if (s < 60) return `${s} sec`;
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return rem > 0 ? `${m} min ${rem} sec` : `${m} min`;
}

function relativeDate(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (min < 2) return "À l'instant";
  if (min < 60) return `Il y a ${min} min`;
  if (h < 24) return `Il y a ${h}h`;
  if (d === 1) return "Hier";
  if (d < 7) return `Il y a ${d} jours`;
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

// ── sub-components ────────────────────────────────────────────────────────────

function VoiceWave({ active }: { active: boolean }) {
  const bars = [0.35, 0.65, 1.0, 0.8, 0.55, 0.9, 0.45, 0.7, 0.4];
  return (
    <>
      <style>{`
        @keyframes voicebar { from { transform: scaleY(0.2); } to { transform: scaleY(1); } }
        .vbar { transform-origin: center; }
        .vbar-active { animation: voicebar 0.45s ease-in-out infinite alternate; }
      `}</style>
      <div className="flex items-center justify-center gap-[5px] h-14">
        {bars.map((h, i) => (
          <div
            key={i}
            className={cn("vbar rounded-full transition-all duration-300", active ? "vbar-active bg-violet-400" : "bg-white/20")}
            style={{ width: "3px", height: active ? `${h * 52}px` : "5px", animationDelay: `${i * 55}ms` }}
          />
        ))}
      </div>
    </>
  );
}


// ── main component ────────────────────────────────────────────────────────────

const PERSONA_EMOJI: Record<string, string> = {
  sophie: "👩‍💼", marc: "👨‍💻", lucie: "👩‍🦱", thomas: "👨‍💼",
};

export default function PlaygroundPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("home");

  // home state
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [showArchived, setShowArchived] = useState(false);

  // setup state
  const [scripts, setScripts] = useState<ScriptItem[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [selectedPersonaId, setSelectedPersonaId] = useState("");
  const [fullScript, setFullScript] = useState<FullScript | null>(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingScript, setLoadingScript] = useState(false);

  // call state
  const [isMuted, setIsMuted] = useState(false);
  const [aiSpeaking, setAiSpeaking] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [cameraError, setCameraError] = useState(false);
  const [countdownNum, setCountdownNum] = useState(3);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const loadSessions = useCallback((archived = false) => {
    setLoadingSessions(true);
    fetch(`/api/playground/sessions?archived=${archived}`)
      .then(r => r.json())
      .then(d => setSessions(d.sessions ?? []))
      .finally(() => setLoadingSessions(false));
  }, []);

  useEffect(() => { loadSessions(showArchived); }, [loadSessions, showArchived]);

  useEffect(() => {
    fetch("/api/scripts/list")
      .then(r => r.json())
      .then(d => {
        const list: ScriptItem[] = d.scripts ?? [];
        setScripts(list);
        const def = list.find(s => s.is_default) ?? list[0];
        if (def) setSelectedId(def.id);
      })
      .finally(() => setLoadingList(false));
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    setLoadingScript(true);
    fetch(`/api/scripts/${selectedId}`)
      .then(r => r.json())
      .then(d => setFullScript(d.script ?? null))
      .finally(() => setLoadingScript(false));
  }, [selectedId]);

  useEffect(() => {
    if (phase !== "countdown") return;
    const t = setTimeout(() => {
      if (countdownNum > 1) setCountdownNum(n => n - 1);
      else setPhase("call");
    }, 1000);
    return () => clearTimeout(t);
  }, [phase, countdownNum]);

  useEffect(() => {
    if (phase !== "call") return;
    navigator.mediaDevices.getUserMedia({ video: true, audio: false })
      .then(stream => {
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      })
      .catch(() => setCameraError(true));
    return () => { streamRef.current?.getTracks().forEach(t => t.stop()); };
  }, [phase]);

  useEffect(() => {
    if (phase !== "call") return;
    const id = setInterval(() => setCallDuration(d => d + 1), 1000);
    return () => clearInterval(id);
  }, [phase]);

  useEffect(() => {
    if (phase !== "call") return;
    let on = false;
    const id = setInterval(() => { on = !on; setAiSpeaking(on); }, 2800);
    return () => clearInterval(id);
  }, [phase]);

  function startCall() {
    if (!selectedId || !selectedPersonaId) return;
    setCallDuration(0); setIsMuted(false); setCameraError(false);
    setCountdownNum(3);
    setPhase("countdown");
  }

  function endCall() {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setAiSpeaking(false);
    if (fullScript) {
      fetch("/api/playground/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          script_id: fullScript.id,
          script_name: fullScript.name,
          duration_seconds: callDuration,
          persona_id: activePersona.id,
          persona_name: activePersona.name,
        }),
      }).then(() => loadSessions(false));
    }
    setCallDuration(0);
    setPhase("home");
  }

  const selected = scripts.find(s => s.id === selectedId);
  const activePersona = AI_PERSONAS.find(p => p.id === selectedPersonaId) ?? AI_PERSONAS[0];
  const steps: Step[] = fullScript?.steps ?? [];
  const objections: Objection[] = fullScript?.objections ?? [];

  // ── HOME ──────────────────────────────────────────────────────────────────
  if (phase === "home") {
    async function archiveSession(id: string, archive: boolean) {
      setSessions(prev => prev.filter(s => s.id !== id));
      await fetch(`/api/playground/sessions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ archived: archive }),
      });
    }

    async function deleteSession(id: string) {
      setSessions(prev => prev.filter(s => s.id !== id));
      await fetch(`/api/playground/sessions/${id}`, { method: "DELETE" });
    }

    return (
      <div className="max-w-4xl mx-auto px-8 py-10 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[22px] font-semibold text-stone-900 tracking-tight">Playground</h1>
            <p className="text-sm text-stone-500 mt-0.5">Entraîne-toi face à un prospect IA et obtiens un score après chaque appel.</p>
          </div>
          <Button onClick={() => setPhase("setup")} className="gap-2 h-9 text-sm">
            <Plus className="w-4 h-4" /> Nouvel appel
          </Button>
        </div>

        {/* Archived toggle */}
        <div className="flex items-center gap-2">
          {[false, true].map(archived => (
            <button
              key={String(archived)}
              onClick={() => setShowArchived(archived)}
              className={cn(
                "text-xs px-3 py-1.5 rounded-full border transition-colors",
                showArchived === archived
                  ? "bg-stone-900 text-white border-stone-900"
                  : "border-stone-200 text-stone-500 hover:border-stone-400"
              )}
            >
              {archived ? "Archivés" : "Actifs"}
            </button>
          ))}
        </div>

        {loadingSessions ? (
          <div className="flex items-center gap-2 text-sm text-stone-400 py-8 justify-center">
            <Loader2 className="w-4 h-4 animate-spin" /> Chargement...
          </div>
        ) : sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-14 h-14 bg-violet-50 rounded-2xl flex items-center justify-center">
              <Swords className="w-7 h-7 text-violet-400" />
            </div>
            <div className="text-center">
              <p className="text-[14px] font-medium text-stone-700">
                {showArchived ? "Aucun appel archivé" : "Aucun appel d'entraînement"}
              </p>
              <p className="text-sm text-stone-400 mt-0.5">
                {showArchived ? "Les appels archivés apparaîtront ici." : "Lance ton premier appel pour commencer à progresser."}
              </p>
            </div>
            {!showArchived && (
              <Button onClick={() => setPhase("setup")} className="gap-2 mt-1">
                <Plus className="w-4 h-4" /> Démarrer un appel
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
              {showArchived ? "Archivés" : "Derniers appels"} · {sessions.length}
            </p>
            {sessions.map(s => {
              const emoji = s.persona_id ? (PERSONA_EMOJI[s.persona_id] ?? "🧑‍💼") : "🧑‍💼";
              return (
                <div
                  key={s.id}
                  onClick={() => router.push(`/playground/${s.id}`)}
                  className="group flex items-center gap-4 px-5 py-4 bg-white border border-stone-200 rounded-xl hover:border-stone-300 hover:shadow-sm transition-all cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center shrink-0 text-xl">
                    {emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-stone-800 truncate">
                      {s.persona_name ? `${s.persona_name} · ` : ""}{s.script_name}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="flex items-center gap-1 text-xs text-stone-400">
                        <Clock className="w-3 h-3" />{formatDuration(s.duration_seconds)}
                      </span>
                      <span className="text-stone-200">·</span>
                      <span className="text-xs text-stone-400">{relativeDate(s.created_at)}</span>
                    </div>
                  </div>

                  {/* Hover actions */}
                  <div
                    className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={e => e.stopPropagation()}
                  >
                    <button
                      onClick={() => archiveSession(s.id, !showArchived)}
                      title={showArchived ? "Désarchiver" : "Archiver"}
                      className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
                    >
                      {showArchived ? <ArchiveX className="w-4 h-4" /> : <Archive className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => deleteSession(s.id)}
                      title="Supprimer"
                      className="p-1.5 rounded-lg text-stone-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <span className="text-[10px] bg-stone-100 text-stone-400 px-2 py-1 rounded-full font-medium shrink-0 group-hover:opacity-0 transition-opacity">
                    Score bientôt
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // ── COUNTDOWN ─────────────────────────────────────────────────────────────
  if (phase === "countdown") {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-[#0F0F12] gap-5 select-none">
        <style>{`
          @keyframes countpop {
            0%   { transform: scale(1.6); opacity: 0; }
            18%  { transform: scale(1);   opacity: 1; }
            75%  { transform: scale(1);   opacity: 1; }
            100% { transform: scale(0.7); opacity: 0; }
          }
          .count-digit { animation: countpop 0.95s ease forwards; }
        `}</style>
        <p className="text-white/30 text-sm tracking-wide">
          {activePersona.emoji} {activePersona.name} · {fullScript?.name}
        </p>
        <div key={countdownNum} className="count-digit text-[160px] font-bold text-white leading-none tabular-nums">
          {countdownNum}
        </div>
        <p className="text-white/20 text-xs uppercase tracking-widest">Prépare-toi</p>
      </div>
    );
  }

  // ── SETUP ─────────────────────────────────────────────────────────────────
  if (phase === "setup") {
    const canStart = !!selectedId && !!selectedPersonaId && !loadingScript;
    const chosenPersona = AI_PERSONAS.find(p => p.id === selectedPersonaId);

    return (
      <div className="max-w-3xl mx-auto px-8 py-10 space-y-10">
        <div>
          <button
            onClick={() => setPhase("home")}
            className="flex items-center gap-1 text-sm text-stone-500 hover:text-stone-700 transition-colors mb-6"
          >
            <ChevronLeft className="w-4 h-4" /> Playground
          </button>
          <h1 className="text-[22px] font-semibold text-stone-900 tracking-tight">Nouvel appel d'entraînement</h1>
          <p className="text-sm text-stone-500 mt-0.5">Configure ton appel en deux étapes, puis lance.</p>
        </div>

        {/* ── 1. Script ── */}
        <div className="space-y-3">
          <div className="flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-full bg-stone-900 text-white text-[11px] font-bold flex items-center justify-center shrink-0">1</span>
            <p className="text-[13px] font-semibold text-stone-800">Choisis ton script</p>
          </div>

          {loadingList ? (
            <div className="flex items-center gap-2 text-sm text-stone-400 py-4 pl-8">
              <Loader2 className="w-4 h-4 animate-spin" /> Chargement...
            </div>
          ) : scripts.length === 0 ? (
            <div className="ml-8 border border-dashed border-stone-200 rounded-xl px-5 py-8 text-center">
              <p className="text-sm text-stone-500 mb-2">Aucun script disponible.</p>
              <Link href="/scripts/new" className="text-sm text-violet-600 hover:text-violet-700 font-medium">Créer un script →</Link>
            </div>
          ) : (
            <div className="ml-8 space-y-2">
              {scripts.map(s => (
                <button
                  key={s.id}
                  onClick={() => setSelectedId(s.id)}
                  className={cn(
                    "w-full text-left p-4 rounded-xl border transition-all",
                    selectedId === s.id
                      ? "border-violet-300 bg-violet-50 ring-1 ring-violet-200"
                      : "border-stone-200 bg-white hover:border-stone-300 hover:shadow-sm"
                  )}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-[13px] font-semibold text-stone-900 truncate">{s.name}</p>
                        {s.is_default && <span className="text-[10px] bg-violet-100 text-violet-600 px-2 py-0.5 rounded-full font-medium shrink-0">Par défaut</span>}
                      </div>
                      {s.goal && <p className="text-xs text-stone-400 line-clamp-1">{s.goal}</p>}
                    </div>
                    {selectedId === s.id && (
                      <div className="w-5 h-5 rounded-full bg-violet-600 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-[9px] text-white font-bold">✓</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1 text-[11px] text-stone-400"><FileText className="w-3 h-3" />{s.steps[0]?.count ?? 0} étapes</span>
                    <span className="flex items-center gap-1 text-[11px] text-stone-400"><ShieldAlert className="w-3 h-3" />{s.objections[0]?.count ?? 0} objections</span>
                    <span className="flex items-center gap-1 text-[11px] text-stone-400"><Clock className="w-3 h-3" />{s.duration_minutes} min</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── 2. Persona ── */}
        <div className="space-y-3">
          <div className="flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-full bg-stone-900 text-white text-[11px] font-bold flex items-center justify-center shrink-0">2</span>
            <p className="text-[13px] font-semibold text-stone-800">Choisis ton prospect IA</p>
          </div>

          <div className="ml-8 grid grid-cols-2 gap-3">
            {AI_PERSONAS.map(persona => (
              <button
                key={persona.id}
                onClick={() => setSelectedPersonaId(persona.id)}
                className={cn(
                  "text-left p-4 rounded-xl border transition-all",
                  selectedPersonaId === persona.id
                    ? "border-violet-300 bg-violet-50 ring-1 ring-violet-200"
                    : "border-stone-200 bg-white hover:border-stone-300 hover:shadow-sm"
                )}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl leading-none">{persona.emoji}</span>
                    <div>
                      <p className="text-[13px] font-semibold text-stone-900 leading-tight">{persona.name}</p>
                      <p className="text-[11px] text-stone-400">{persona.role}</p>
                    </div>
                  </div>
                  {selectedPersonaId === persona.id && (
                    <div className="w-5 h-5 rounded-full bg-violet-600 flex items-center justify-center shrink-0">
                      <span className="text-[9px] text-white font-bold">✓</span>
                    </div>
                  )}
                </div>
                <p className="text-[11px] text-stone-500 leading-relaxed">{persona.description}</p>
                <div className="flex gap-1 mt-2.5">
                  {persona.tags.map(tag => (
                    <span key={tag} className="text-[10px] bg-stone-100 text-stone-400 px-2 py-0.5 rounded-full">{tag}</span>
                  ))}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ── CTA ── */}
        <div className="ml-8">
          <div className={cn("rounded-xl border p-4 flex items-center justify-between gap-4 transition-all", canStart ? "border-violet-200 bg-violet-50" : "border-stone-200 bg-stone-50")}>
            <div className="text-sm">
              {canStart ? (
                <p className="font-medium text-stone-800">
                  Appel avec <span className="text-violet-700">{chosenPersona?.name}</span> sur <span className="text-violet-700">{selected?.name}</span>
                </p>
              ) : (
                <p className="text-stone-400">Sélectionne un script et un prospect pour continuer.</p>
              )}
            </div>
            <Button
              className="shrink-0 gap-2 h-9 px-5"
              disabled={!canStart}
              onClick={startCall}
            >
              {loadingScript && <Loader2 className="w-4 h-4 animate-spin" />}
              Démarrer l'appel
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ── CALL ──────────────────────────────────────────────────────────────────
  return (
    <div className="h-full flex overflow-hidden">
      {/* Left: call area */}
      <div className="flex-1 flex flex-col bg-[#0F0F12]">
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-sm text-white/50 font-mono tabular-nums">{formatTime(callDuration)}</span>
          </div>
          <p className="text-[13px] text-white/30 truncate max-w-[220px]">{fullScript?.name}</p>
          <div className="w-24" />
        </div>

        <div className="flex-1 flex flex-col gap-3 p-4">
          {/* AI tile */}
          <div className="flex-1 relative rounded-2xl bg-[#18181D] flex flex-col items-center justify-center border border-white/[0.06] overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-violet-950/20 to-transparent pointer-events-none" />
            <div className="flex flex-col items-center gap-4">
              <span className="text-5xl leading-none opacity-80">{activePersona.emoji}</span>
              <VoiceWave active={aiSpeaking} />
            </div>
            {aiSpeaking && <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-violet-400 animate-pulse" />}
            <div className="absolute bottom-3 left-3">
              <span className="text-xs text-white/40 font-medium">{activePersona.name} · {activePersona.role}</span>
            </div>
          </div>

          {/* User tile */}
          <div className="flex-1 relative rounded-2xl bg-[#18181D] overflow-hidden border border-white/[0.06]">
            {!cameraError ? (
              <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover scale-x-[-1]" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-stone-800 flex items-center justify-center">
                  <span className="text-2xl">👤</span>
                </div>
              </div>
            )}
            {isMuted && (
              <div className="absolute top-3 right-3 bg-rose-500/90 backdrop-blur-sm rounded-full p-1.5">
                <MicOff className="w-3 h-3 text-white" />
              </div>
            )}
            <div className="absolute bottom-3 left-3">
              <span className="text-xs text-white/40 font-medium">Toi</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-4 py-5 border-t border-white/[0.06]">
          <button
            onClick={() => setIsMuted(m => !m)}
            className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center transition-all",
              isMuted ? "bg-rose-500 hover:bg-rose-400 shadow-lg shadow-rose-900/30" : "bg-white/10 hover:bg-white/15"
            )}
          >
            {isMuted ? <MicOff className="w-5 h-5 text-white" /> : <Mic className="w-5 h-5 text-white" />}
          </button>
          <button
            onClick={endCall}
            className="w-14 h-14 rounded-full bg-rose-500 hover:bg-rose-400 flex items-center justify-center transition-all shadow-lg shadow-rose-900/30"
          >
            <PhoneOff className="w-6 h-6 text-white" />
          </button>
        </div>
      </div>

      {/* Right: script panel */}
      <div className="flex-1 flex flex-col bg-stone-50 border-l border-stone-200 min-w-0">
        <div className="px-5 py-4 border-b border-stone-200 bg-white shrink-0">
          <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider">Process</p>
          <p className="text-[14px] font-semibold text-stone-800 mt-0.5 truncate">{fullScript?.name}</p>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
          {steps.length === 0 && objections.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-5 h-5 animate-spin text-stone-300" />
            </div>
          ) : (
            <>
              {steps.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
                    Étapes · {steps.length}
                  </p>
                  {steps.map(step => (
                    <StepCard key={step.id} step={step} />
                  ))}
                </div>
              )}

              {objections.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
                    Objections · {objections.length}
                  </p>
                  {objections.map(obj => (
                    <ObjectionCard key={obj.id} objection={obj} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
