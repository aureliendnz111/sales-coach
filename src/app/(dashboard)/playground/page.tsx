"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { Mic, MicOff, PhoneOff, ChevronLeft, ChevronDown, Loader2, Plus, Swords, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type Phase = "home" | "setup" | "call";

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
  id: string; order: number; label: string; key_reframe: string | null;
  responses: string[] | null; trigger_phrases: string[] | null;
};

type FullScript = {
  id: string; name: string; goal: string;
  duration_minutes: number; steps: Step[]; objections: Objection[];
};

type TrainingSession = {
  id: string; script_id: string | null; script_name: string;
  duration_seconds: number; created_at: string;
};

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

function DetailList({ label, items }: { label: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <div className="mt-2">
      <p className="text-[9px] font-semibold text-stone-400 uppercase tracking-wider mb-1">{label}</p>
      <ul className="space-y-0.5">
        {items.map((item, i) => (
          <li key={i} className="text-[11px] text-stone-500 leading-relaxed flex gap-1.5">
            <span className="shrink-0 text-stone-300 mt-0.5">·</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ── main component ────────────────────────────────────────────────────────────

export default function PlaygroundPage() {
  const [phase, setPhase] = useState<Phase>("home");

  // home state
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);

  // setup state
  const [scripts, setScripts] = useState<ScriptItem[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [fullScript, setFullScript] = useState<FullScript | null>(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingScript, setLoadingScript] = useState(false);

  // call state
  const [isMuted, setIsMuted] = useState(false);
  const [aiSpeaking, setAiSpeaking] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [callDuration, setCallDuration] = useState(0);
  const [cameraError, setCameraError] = useState(false);
  const [stepsOpen, setStepsOpen] = useState(true);
  const [objectionsOpen, setObjectionsOpen] = useState(true);
  const [expandedStepId, setExpandedStepId] = useState<string | null>(null);
  const [expandedObjId, setExpandedObjId] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const loadSessions = useCallback(() => {
    fetch("/api/playground/sessions")
      .then(r => r.json())
      .then(d => setSessions(d.sessions ?? []))
      .finally(() => setLoadingSessions(false));
  }, []);

  useEffect(() => { loadSessions(); }, [loadSessions]);

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
    setCallDuration(0); setCurrentStep(0); setIsMuted(false);
    setCameraError(false); setExpandedStepId(null); setExpandedObjId(null);
    setPhase("call");
  }

  function endCall() {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setAiSpeaking(false);
    if (fullScript) {
      fetch("/api/playground/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ script_id: fullScript.id, script_name: fullScript.name, duration_seconds: callDuration }),
      }).then(loadSessions);
    }
    setCallDuration(0);
    setPhase("home");
  }

  const selected = scripts.find(s => s.id === selectedId);
  const steps: Step[] = fullScript?.steps ?? [];
  const objections: Objection[] = fullScript?.objections ?? [];

  // ── HOME ──────────────────────────────────────────────────────────────────
  if (phase === "home") {
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
              <p className="text-[14px] font-medium text-stone-700">Aucun appel d'entraînement</p>
              <p className="text-sm text-stone-400 mt-0.5">Lance ton premier appel pour commencer à progresser.</p>
            </div>
            <Button onClick={() => setPhase("setup")} className="gap-2 mt-1">
              <Plus className="w-4 h-4" /> Démarrer un appel
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
              Derniers appels · {sessions.length}
            </p>
            {sessions.map(s => (
              <div
                key={s.id}
                className="flex items-center gap-4 px-5 py-4 bg-white border border-stone-200 rounded-xl hover:border-stone-300 transition-colors"
              >
                <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center shrink-0">
                  <Swords className="w-4.5 h-4.5 text-violet-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-stone-800 truncate">{s.script_name}</p>
                  <p className="text-xs text-stone-400 mt-0.5">{relativeDate(s.created_at)}</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0 text-xs text-stone-400">
                  <Clock className="w-3.5 h-3.5" />
                  {formatDuration(s.duration_seconds)}
                </div>
                <span className="text-[10px] bg-stone-100 text-stone-400 px-2 py-1 rounded-full font-medium shrink-0">
                  Score bientôt
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ── SETUP ─────────────────────────────────────────────────────────────────
  if (phase === "setup") {
    return (
      <div className="h-full flex flex-col items-center justify-center px-8 py-10">
        <div className="w-full max-w-[500px] space-y-6">
          <button
            onClick={() => setPhase("home")}
            className="flex items-center gap-1 text-sm text-stone-500 hover:text-stone-700 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Playground
          </button>

          <div>
            <h1 className="text-[22px] font-semibold text-stone-900 tracking-tight">Nouvel appel</h1>
            <p className="text-sm text-stone-500 mt-0.5">Choisis le script à utiliser pour cet entraînement.</p>
          </div>

          <div className="space-y-2">
            <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">Script à utiliser</p>
            {loadingList ? (
              <div className="flex items-center gap-2 text-sm text-stone-400 py-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Chargement des scripts...
              </div>
            ) : scripts.length === 0 ? (
              <p className="text-sm text-stone-400">
                Aucun script.{" "}
                <Link href="/scripts/new" className="text-violet-600 hover:underline">Crée-en un</Link> d'abord.
              </p>
            ) : (
              <div className="space-y-2">
                {scripts.map(s => (
                  <button
                    key={s.id}
                    onClick={() => setSelectedId(s.id)}
                    className={cn(
                      "w-full text-left px-4 py-3 rounded-xl border transition-all",
                      selectedId === s.id
                        ? "border-violet-300 bg-violet-50 ring-1 ring-violet-200"
                        : "border-stone-200 bg-white hover:border-stone-300"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-stone-900">{s.name}</p>
                      {s.is_default && (
                        <span className="text-[10px] bg-violet-100 text-violet-600 px-2 py-0.5 rounded-full font-medium">Par défaut</span>
                      )}
                    </div>
                    <p className="text-xs text-stone-400 mt-0.5">
                      {s.steps[0]?.count ?? 0} étapes · {s.objections[0]?.count ?? 0} objections · {s.duration_minutes} min
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {selected && (
            <div className="rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center shrink-0 text-lg">
                🧑‍💼
              </div>
              <div>
                <p className="text-sm font-medium text-stone-800">Sophie — Prospect IA</p>
                <p className="text-xs text-stone-400">Briefée sur ton script · répondra aux objections</p>
              </div>
            </div>
          )}

          <Button
            className="w-full gap-2 h-10"
            disabled={!selectedId || loadingScript || loadingList}
            onClick={startCall}
          >
            {loadingScript && <Loader2 className="w-4 h-4 animate-spin" />}
            Démarrer l'appel
          </Button>
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
            <VoiceWave active={aiSpeaking} />
            {aiSpeaking && <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-violet-400 animate-pulse" />}
            <div className="absolute bottom-3 left-3">
              <span className="text-xs text-white/40 font-medium">Sophie · Prospect</span>
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
      <div className="flex-1 flex flex-col bg-white border-l border-stone-200 min-w-0">
        <div className="px-5 py-4 border-b border-stone-100 shrink-0">
          <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider">Process</p>
          <p className="text-[14px] font-semibold text-stone-800 mt-0.5 truncate">{fullScript?.name}</p>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
          {/* Étapes section */}
          {steps.length > 0 && (
            <div>
              <button
                onClick={() => setStepsOpen(o => !o)}
                className="flex items-center justify-between w-full px-2 py-2 rounded-lg hover:bg-stone-50 transition-colors group"
              >
                <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider">Étapes · {steps.length}</p>
                <ChevronDown className={cn("w-3.5 h-3.5 text-stone-300 group-hover:text-stone-400 transition-transform duration-200", !stepsOpen && "-rotate-90")} />
              </button>

              {stepsOpen && (
                <div className="space-y-0.5 mt-0.5">
                  {steps.map((step, i) => {
                    const active = i === currentStep;
                    const done = i < currentStep;
                    const expanded = expandedStepId === step.id;
                    const hasDetails = [step.script_lines, step.questions, step.tips, step.key_phrases].some(a => (a?.length ?? 0) > 0);
                    return (
                      <div key={step.id} className={cn("rounded-xl border transition-all", active ? "border-violet-200 bg-violet-50" : done ? "border-transparent opacity-45 hover:opacity-70" : "border-transparent hover:bg-stone-50")}>
                        <button
                          className="w-full flex items-start gap-2.5 px-3 py-2.5 text-left"
                          onClick={() => { setCurrentStep(i); if (hasDetails || step.goal) setExpandedStepId(expanded ? null : step.id); }}
                        >
                          <div className={cn("shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold mt-0.5", active ? "bg-violet-600 text-white" : done ? "bg-emerald-500 text-white" : "bg-stone-100 text-stone-400")}>
                            {done ? "✓" : i + 1}
                          </div>
                          <p className={cn("flex-1 text-[13px] font-medium leading-snug", active ? "text-violet-900" : "text-stone-700")}>{step.name}</p>
                          <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
                            {step.duration_estimate_minutes != null && <span className="text-[10px] text-stone-300">{step.duration_estimate_minutes}min</span>}
                            {(hasDetails || step.goal) && <ChevronDown className={cn("w-3 h-3 text-stone-300 transition-transform duration-200", expanded && "rotate-180")} />}
                          </div>
                        </button>
                        {expanded && (
                          <div className="px-3 pb-3 border-t border-stone-100 pt-2 space-y-0.5">
                            {step.goal && <p className="text-[11px] text-stone-500 leading-relaxed">{step.goal}</p>}
                            <DetailList label="Phrases clés" items={step.key_phrases ?? []} />
                            <DetailList label="Script" items={step.script_lines ?? []} />
                            <DetailList label="Questions" items={step.questions ?? []} />
                            <DetailList label="Tips" items={step.tips ?? []} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Objections section */}
          {objections.length > 0 && (
            <div className="mt-2">
              <button
                onClick={() => setObjectionsOpen(o => !o)}
                className="flex items-center justify-between w-full px-2 py-2 rounded-lg hover:bg-stone-50 transition-colors group"
              >
                <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider">Objections · {objections.length}</p>
                <ChevronDown className={cn("w-3.5 h-3.5 text-stone-300 group-hover:text-stone-400 transition-transform duration-200", !objectionsOpen && "-rotate-90")} />
              </button>

              {objectionsOpen && (
                <div className="space-y-0.5 mt-0.5">
                  {objections.map(obj => {
                    const expanded = expandedObjId === obj.id;
                    const hasDetails = [(obj.responses?.length ?? 0), (obj.trigger_phrases?.length ?? 0)].some(Boolean);
                    return (
                      <div key={obj.id} className="rounded-xl border border-transparent hover:bg-stone-50 transition-all">
                        <button
                          className="w-full flex items-start gap-2.5 px-3 py-2.5 text-left"
                          onClick={() => setExpandedObjId(expanded ? null : obj.id)}
                        >
                          <div className="shrink-0 w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center mt-0.5">
                            <span className="text-[9px] text-amber-600 font-bold">!</span>
                          </div>
                          <p className="flex-1 text-[13px] font-medium text-stone-700 leading-snug">{obj.label}</p>
                          {(obj.key_reframe || hasDetails) && <ChevronDown className={cn("w-3 h-3 text-stone-300 shrink-0 mt-1 transition-transform duration-200", expanded && "rotate-180")} />}
                        </button>
                        {expanded && (
                          <div className="px-3 pb-3 border-t border-stone-100 pt-2 space-y-0.5">
                            {obj.key_reframe && <p className="text-[11px] text-stone-500 leading-relaxed">{obj.key_reframe}</p>}
                            <DetailList label="Réponses" items={obj.responses ?? []} />
                            <DetailList label="Phrases déclencheurs" items={obj.trigger_phrases ?? []} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {steps.length === 0 && objections.length === 0 && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-5 h-5 animate-spin text-stone-300" />
            </div>
          )}
        </div>

        {steps.length > 0 && (
          <div className="px-4 py-3 border-t border-stone-100 shrink-0 flex items-center justify-between">
            <button onClick={() => setCurrentStep(s => Math.max(0, s - 1))} disabled={currentStep === 0} className="text-xs text-stone-400 hover:text-stone-700 disabled:opacity-25 disabled:cursor-not-allowed transition-colors">← Précédente</button>
            <span className="text-xs text-stone-400 tabular-nums">{currentStep + 1} / {steps.length}</span>
            <button onClick={() => setCurrentStep(s => Math.min(steps.length - 1, s + 1))} disabled={currentStep === steps.length - 1} className="text-xs text-stone-400 hover:text-stone-700 disabled:opacity-25 disabled:cursor-not-allowed transition-colors">Suivante →</button>
          </div>
        )}
      </div>
    </div>
  );
}
