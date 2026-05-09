"use client";
import { useState, useEffect, useRef } from "react";
import { Mic, MicOff, PhoneOff, ChevronLeft, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type ScriptItem = {
  id: string;
  name: string;
  goal: string;
  is_default: boolean;
  duration_minutes: number;
  steps: { count: number }[];
  objections: { count: number }[];
};

type Step = {
  id: string;
  order: number;
  name: string;
  goal: string | null;
  duration_estimate_minutes: number | null;
};

type Objection = {
  id: string;
  order: number;
  label: string;
  key_reframe: string | null;
};

type FullScript = {
  id: string;
  name: string;
  goal: string;
  duration_minutes: number;
  steps: Step[];
  objections: Objection[];
};

function VoiceWave({ active }: { active: boolean }) {
  const bars = [0.35, 0.65, 1.0, 0.8, 0.55, 0.9, 0.45, 0.7, 0.4];
  return (
    <>
      <style>{`
        @keyframes voicebar {
          from { transform: scaleY(0.2); }
          to   { transform: scaleY(1); }
        }
        .vbar { transform-origin: center; }
        .vbar-active { animation: voicebar 0.45s ease-in-out infinite alternate; }
      `}</style>
      <div className="flex items-center justify-center gap-[5px] h-14">
        {bars.map((h, i) => (
          <div
            key={i}
            className={cn("vbar rounded-full transition-all duration-300", active ? "vbar-active bg-violet-400" : "bg-white/20")}
            style={{
              width: "3px",
              height: active ? `${h * 52}px` : "5px",
              animationDelay: `${i * 55}ms`,
            }}
          />
        ))}
      </div>
    </>
  );
}

function formatTime(s: number) {
  const m = Math.floor(s / 60).toString().padStart(2, "0");
  return `${m}:${(s % 60).toString().padStart(2, "0")}`;
}

export default function PlaygroundPage() {
  const [phase, setPhase] = useState<"setup" | "call">("setup");
  const [scripts, setScripts] = useState<ScriptItem[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [fullScript, setFullScript] = useState<FullScript | null>(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingScript, setLoadingScript] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [aiSpeaking, setAiSpeaking] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [callDuration, setCallDuration] = useState(0);
  const [cameraError, setCameraError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

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
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: false })
      .then(stream => {
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      })
      .catch(() => setCameraError(true));
    return () => {
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
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
    setCallDuration(0);
    setCurrentStep(0);
    setIsMuted(false);
    setCameraError(false);
    setPhase("call");
  }

  function endCall() {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setPhase("setup");
    setCallDuration(0);
    setAiSpeaking(false);
  }

  const selected = scripts.find(s => s.id === selectedId);
  const steps: Step[] = fullScript?.steps ?? [];
  const objections: Objection[] = fullScript?.objections ?? [];

  // ── SETUP ──
  if (phase === "setup") {
    return (
      <div className="h-full flex flex-col items-center justify-center px-8 py-10">
        <div className="w-full max-w-[500px] space-y-6">
          <Link href="/dashboard" className="flex items-center gap-1 text-sm text-stone-500 hover:text-stone-700 transition-colors">
            <ChevronLeft className="w-4 h-4" /> Dashboard
          </Link>

          <div>
            <h1 className="text-[22px] font-semibold text-stone-900 tracking-tight">Playground</h1>
            <p className="text-sm text-stone-500 mt-0.5">Entraîne-toi face à un prospect IA. L'appel sera scoré à la fin.</p>
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

  // ── CALL ──
  return (
    <div className="h-full flex overflow-hidden">
      {/* Left: call area */}
      <div className="flex-1 flex flex-col bg-[#0F0F12]">
        {/* Top bar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-sm text-white/50 font-mono tabular-nums">{formatTime(callDuration)}</span>
          </div>
          <p className="text-[13px] text-white/30 truncate max-w-[220px]">{fullScript?.name}</p>
          <div className="w-24" />
        </div>

        {/* Video tiles */}
        <div className="flex-1 grid grid-cols-2 gap-3 p-4">
          {/* AI tile */}
          <div className="relative rounded-2xl bg-[#18181D] flex flex-col items-center justify-center border border-white/[0.06] overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-violet-950/20 to-transparent pointer-events-none" />
            <VoiceWave active={aiSpeaking} />
            {aiSpeaking && (
              <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
            )}
            <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
              <span className="text-xs text-white/40 font-medium">Sophie · Prospect</span>
            </div>
          </div>

          {/* User tile */}
          <div className="relative rounded-2xl bg-[#18181D] overflow-hidden border border-white/[0.06]">
            {!cameraError ? (
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover scale-x-[-1]"
              />
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

        {/* Controls */}
        <div className="flex items-center justify-center gap-4 py-5 border-t border-white/[0.06]">
          <button
            onClick={() => setIsMuted(m => !m)}
            title={isMuted ? "Activer le micro" : "Couper le micro"}
            className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center transition-all",
              isMuted
                ? "bg-rose-500 hover:bg-rose-400 shadow-lg shadow-rose-900/30"
                : "bg-white/10 hover:bg-white/15"
            )}
          >
            {isMuted ? <MicOff className="w-5 h-5 text-white" /> : <Mic className="w-5 h-5 text-white" />}
          </button>
          <button
            onClick={endCall}
            title="Terminer l'appel"
            className="w-14 h-14 rounded-full bg-rose-500 hover:bg-rose-400 flex items-center justify-center transition-all shadow-lg shadow-rose-900/30"
          >
            <PhoneOff className="w-6 h-6 text-white" />
          </button>
        </div>
      </div>

      {/* Right: script panel */}
      <div className="flex-1 flex flex-col bg-white border-l border-stone-200">
        <div className="px-5 py-4 border-b border-stone-100 shrink-0">
          <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider">Process</p>
          <p className="text-[14px] font-semibold text-stone-800 mt-0.5 truncate">{fullScript?.name}</p>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
          {steps.length > 0 && (
            <div className="space-y-1">
              <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider mb-2">
                Étapes · {steps.length}
              </p>
              {steps.map((step, i) => {
                const active = i === currentStep;
                const done = i < currentStep;
                return (
                  <button
                    key={step.id}
                    onClick={() => setCurrentStep(i)}
                    className={cn(
                      "w-full flex items-start gap-3 px-3 py-2.5 rounded-xl text-left transition-all",
                      active
                        ? "bg-violet-50 border border-violet-200 shadow-sm"
                        : done
                        ? "opacity-40 hover:opacity-60"
                        : "hover:bg-stone-50 border border-transparent"
                    )}
                  >
                    <div
                      className={cn(
                        "shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold mt-0.5",
                        active ? "bg-violet-600 text-white" : done ? "bg-emerald-500 text-white" : "bg-stone-100 text-stone-400"
                      )}
                    >
                      {done ? "✓" : i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn("text-[13px] font-medium leading-snug", active ? "text-violet-900" : "text-stone-700")}>
                        {step.name}
                      </p>
                      {step.goal && (
                        <p className="text-[11px] text-stone-400 mt-0.5 leading-relaxed line-clamp-2">{step.goal}</p>
                      )}
                    </div>
                    {step.duration_estimate_minutes != null && (
                      <span className="text-[10px] text-stone-300 shrink-0 mt-1">{step.duration_estimate_minutes}min</span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {objections.length > 0 && (
            <div className="space-y-1">
              <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider mb-2">
                Objections · {objections.length}
              </p>
              {objections.map(obj => (
                <div
                  key={obj.id}
                  className="px-3 py-2.5 rounded-xl border border-stone-100 hover:border-stone-200 transition-colors bg-white"
                >
                  <p className="text-[13px] font-medium text-stone-700">{obj.label}</p>
                  {obj.key_reframe && (
                    <p className="text-[11px] text-stone-400 mt-1 leading-relaxed">{obj.key_reframe}</p>
                  )}
                </div>
              ))}
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
            <button
              onClick={() => setCurrentStep(s => Math.max(0, s - 1))}
              disabled={currentStep === 0}
              className="text-xs text-stone-400 hover:text-stone-700 disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
            >
              ← Précédente
            </button>
            <span className="text-xs text-stone-400 tabular-nums">{currentStep + 1} / {steps.length}</span>
            <button
              onClick={() => setCurrentStep(s => Math.min(steps.length - 1, s + 1))}
              disabled={currentStep === steps.length - 1}
              className="text-xs text-stone-400 hover:text-stone-700 disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
            >
              Suivante →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
