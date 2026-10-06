"use client";
import { useEffect, useRef, useState } from "react";
import { Check, Clock, Mic, PhoneOff, Sparkles, ShieldAlert, ChevronRight, FileText, Lightbulb, ArrowUpRight, Video } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Lang } from "@/lib/lang-context";

// Realistic, fully coded mockups of the app screens used on the landing page.
// Static data only — no network, no auth.

type L<T> = Record<Lang, T>;

function AppFrame({ url, children, dark = false, className }: { url: string; children: React.ReactNode; dark?: boolean; className?: string }) {
  return (
    <div className={cn("rounded-2xl overflow-hidden shadow-2xl shadow-stone-900/15 ring-1", dark ? "ring-white/10 bg-[#0E0E16]" : "ring-stone-200 bg-white", className)}>
      <div className={cn("flex items-center gap-3 px-3.5 py-2.5 border-b", dark ? "bg-[#16161F] border-white/5" : "bg-stone-100 border-stone-200")}>
        <div className="flex items-center gap-1.5 shrink-0" aria-hidden>
          <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
        </div>
        <div className={cn("flex-1 min-w-0 rounded-md px-2.5 py-1 text-[10.5px] truncate", dark ? "bg-white/5 text-stone-500" : "bg-white text-stone-400")}>
          {url}
        </div>
      </div>
      {children}
    </div>
  );
}

function scoreTone(s: number) {
  if (s >= 75) return { bar: "bg-emerald-500", text: "text-emerald-600", soft: "bg-emerald-50" };
  if (s >= 60) return { bar: "bg-amber-400", text: "text-amber-600", soft: "bg-amber-50" };
  return { bar: "bg-rose-500", text: "text-rose-600", soft: "bg-rose-50" };
}

// ── 1. Script Builder ────────────────────────────────────────────────────────

const SCRIPT: L<{
  name: string; default_: string; tabs: [string, string]; steps: { name: string; min: number }[];
  stepLabel: string; goalLabel: string; goal: string; questionsLabel: string; questions: string[];
  phrasesLabel: string; phrases: string[]; objection: string; category: string; reframe: string;
}> = {
  fr: {
    name: "Closing — Accompagnement 3 mois", default_: "Par défaut", tabs: ["Étapes", "Objections"],
    steps: [{ name: "Cadre & rapport", min: 3 }, { name: "Découverte", min: 15 }, { name: "Reformulation", min: 5 }, { name: "Présentation de l'offre", min: 10 }, { name: "Closing", min: 7 }],
    stepLabel: "Étape 2", goalLabel: "Objectif", goal: "Faire émerger la douleur principale et chiffrer le coût de l'inaction.",
    questionsLabel: "Questions clés", questions: ["Qu'est-ce qui vous a poussé à réserver cet appel aujourd'hui ?", "Si rien ne change d'ici 6 mois, qu'est-ce que ça vous coûte ?", "Qu'avez-vous déjà essayé jusqu'ici ?"],
    phrasesLabel: "Phrases clés", phrases: ["Si je comprends bien…", "Sur une échelle de 1 à 10…", "Et concrètement ?"],
    objection: "« C'est trop cher »", category: "Prix", reframe: "Revenir au coût de l'inaction chiffré en découverte",
  },
  en: {
    name: "Closing — 3-month coaching", default_: "Default", tabs: ["Stages", "Objections"],
    steps: [{ name: "Frame & rapport", min: 3 }, { name: "Discovery", min: 15 }, { name: "Recap", min: 5 }, { name: "Offer presentation", min: 10 }, { name: "Close", min: 7 }],
    stepLabel: "Stage 2", goalLabel: "Goal", goal: "Surface the main pain and put a number on the cost of doing nothing.",
    questionsLabel: "Key questions", questions: ["What made you book this call today?", "If nothing changes in 6 months, what does it cost you?", "What have you already tried so far?"],
    phrasesLabel: "Key phrases", phrases: ["If I understand correctly…", "On a scale of 1 to 10…", "What does that look like?"],
    objection: "“It's too expensive”", category: "Price", reframe: "Bring it back to the cost of inaction from discovery",
  },
  pt: {
    name: "Fecho — Acompanhamento 3 meses", default_: "Predefinido", tabs: ["Etapas", "Objeções"],
    steps: [{ name: "Enquadramento", min: 3 }, { name: "Descoberta", min: 15 }, { name: "Reformulação", min: 5 }, { name: "Apresentação da oferta", min: 10 }, { name: "Fecho", min: 7 }],
    stepLabel: "Etapa 2", goalLabel: "Objetivo", goal: "Fazer emergir a dor principal e quantificar o custo da inação.",
    questionsLabel: "Perguntas-chave", questions: ["O que o levou a marcar esta chamada hoje?", "Se nada mudar em 6 meses, quanto lhe custa?", "O que já experimentou até agora?"],
    phrasesLabel: "Frases-chave", phrases: ["Se bem percebi…", "Numa escala de 1 a 10…", "E em concreto?"],
    objection: "« É demasiado caro »", category: "Preço", reframe: "Voltar ao custo da inação quantificado na descoberta",
  },
};

export function ScriptBuilderMockup({ lang }: { lang: Lang }) {
  const t = SCRIPT[lang];
  const active = 1;
  return (
    <AppFrame url="rumios.ai/scripts/closing-3-mois">
      <div className="bg-stone-50 p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <FileText className="w-3.5 h-3.5 text-violet-500 shrink-0" />
              <p className="text-[13px] font-semibold text-stone-900 truncate">{t.name}</p>
            </div>
            <div className="flex items-center gap-2 mt-1.5 text-[10.5px] text-stone-500">
              <span className="bg-violet-100 text-violet-700 font-medium rounded-full px-1.5 py-px whitespace-nowrap">{t.default_}</span>
              <span className="flex items-center gap-1 whitespace-nowrap"><Clock className="w-3 h-3" /> 40 min</span>
            </div>
          </div>
          <div className="flex self-start bg-white border border-stone-200 rounded-lg p-0.5 text-[10.5px] font-medium shrink-0">
            <span className="px-2 py-1 rounded-md bg-stone-900 text-white">{t.tabs[0]} · 5</span>
            <span className="px-2 py-1 text-stone-500">{t.tabs[1]} · 6</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-[150px_minmax(0,1fr)] gap-3">
          <ol className="hidden sm:flex flex-col gap-1">
            {t.steps.map((s, i) => (
              <li key={s.name} className={cn("flex items-center gap-2 rounded-lg px-2 py-1.5 text-[11px]",
                i === active ? "bg-white border border-violet-200 shadow-sm text-stone-900 font-medium" : "text-stone-500")}>
                <span className={cn("w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0",
                  i < active ? "bg-emerald-500 text-white" : i === active ? "bg-violet-600 text-white" : "bg-stone-200 text-stone-500")}>
                  {i < active ? <Check className="w-2.5 h-2.5" /> : i + 1}
                </span>
                <span className="truncate flex-1">{s.name}</span>
                <span className="text-[9.5px] text-stone-400 tabular-nums">{s.min}′</span>
              </li>
            ))}
          </ol>

          <div className="bg-white border border-stone-200 rounded-xl p-3.5 space-y-3 min-w-0">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-violet-500">{t.stepLabel} · {t.steps[active].name}</p>
              <span className="text-[10px] text-stone-400 tabular-nums">{t.steps[active].min} min</span>
            </div>
            <div>
              <p className="text-[10px] font-medium text-stone-400 mb-0.5">{t.goalLabel}</p>
              <p className="text-[11.5px] text-stone-700 leading-snug">{t.goal}</p>
            </div>
            <div>
              <p className="text-[10px] font-medium text-stone-400 mb-1">{t.questionsLabel}</p>
              <ul className="space-y-1">
                {t.questions.map(q => (
                  <li key={q} className="flex gap-1.5 text-[11px] text-stone-700 leading-snug">
                    <ChevronRight className="w-3 h-3 text-violet-400 shrink-0 mt-px" />{q}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-[10px] font-medium text-stone-400 mb-1">{t.phrasesLabel}</p>
              <div className="flex flex-wrap gap-1">
                {t.phrases.map(p => (
                  <span key={p} className="text-[10px] bg-stone-100 text-stone-600 rounded-md px-1.5 py-0.5">{p}</span>
                ))}
              </div>
            </div>
            <div className="border border-amber-200 bg-amber-50/60 rounded-lg p-2.5 flex items-start gap-2">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-px" />
              <div className="min-w-0">
                <p className="text-[11px] font-semibold text-stone-800">{t.objection} <span className="ml-1 text-[9.5px] font-medium text-amber-700 bg-amber-100 rounded-full px-1.5 py-px">{t.category}</span></p>
                <p className="text-[10.5px] text-stone-600 mt-0.5 leading-snug">→ {t.reframe}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppFrame>
  );
}

// ── 2. Playground ────────────────────────────────────────────────────────────

const PLAY: L<{
  role: string; live: string; lines: { who: "p" | "me"; text: string }[]; you: string; aiTag: string; title: string;
  stepLabel: string; step: string; hintLabel: string; hint: string; reply: string;
}> = {
  fr: {
    role: "Directrice commerciale · PME", live: "En appel", you: "Aurélien (vous)", aiTag: "Prospect IA", title: "Simulation · Closing 3 mois",
    lines: [
      { who: "p", text: "Honnêtement, on a déjà fait un coaching l'an dernier et ça n'a rien changé." },
      { who: "me", text: "Je comprends. Qu'est-ce qui n'avait pas fonctionné, selon vous ?" },
      { who: "p", text: "Trop théorique. Mes commerciaux n'ont rien appliqué en appel." },
    ],
    stepLabel: "Étape en cours", step: "Découverte", hintLabel: "Objection détectée", hint: "Mauvaise expérience passée", reply: "Creuser : « Qu'est-ce qui devrait être différent cette fois ? »",
  },
  en: {
    role: "Head of Sales · SMB", live: "On call", you: "Aurélien (you)", aiTag: "AI prospect", title: "Practice call · 3-month closing",
    lines: [
      { who: "p", text: "Honestly, we did a coaching program last year and nothing changed." },
      { who: "me", text: "I hear you. What didn't work for you, in your view?" },
      { who: "p", text: "Too theoretical. My reps never applied any of it on calls." },
    ],
    stepLabel: "Current stage", step: "Discovery", hintLabel: "Objection detected", hint: "Bad past experience", reply: "Dig in: “What would need to be different this time?”",
  },
  pt: {
    role: "Diretora comercial · PME", live: "Em chamada", you: "Aurélien (você)", aiTag: "Prospeto IA", title: "Simulação · Fecho 3 meses",
    lines: [
      { who: "p", text: "Sinceramente, já fizemos um coaching no ano passado e nada mudou." },
      { who: "me", text: "Compreendo. O que é que não funcionou, na sua opinião?" },
      { who: "p", text: "Demasiado teórico. A minha equipa não aplicou nada nas chamadas." },
    ],
    stepLabel: "Etapa atual", step: "Descoberta", hintLabel: "Objeção detetada", hint: "Má experiência anterior", reply: "Aprofundar: « O que teria de ser diferente desta vez? »",
  },
};

// Founder photo in the user's video tile. Drop the file at public/aurelien.jpg;
// until it exists, initials are shown instead.
const USER_PHOTO = "/aurelien.jpg";

function UserAvatar({ size }: { size: number }) {
  const [failed, setFailed] = useState(false);
  const ref = useRef<HTMLImageElement>(null);
  // The 404 can happen before hydration, in which case onError never fires
  useEffect(() => {
    const img = ref.current;
    if (img && img.complete && img.naturalWidth === 0) setFailed(true);
  }, []);
  if (failed) {
    return (
      <span className="rounded-full bg-gradient-to-br from-stone-500 to-stone-700 text-white font-semibold flex items-center justify-center" style={{ width: size, height: size, fontSize: size * 0.32 }}>
        AD
      </span>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img ref={ref} src={USER_PHOTO} alt="Aurélien" onError={() => setFailed(true)} className="rounded-full object-cover" style={{ width: size, height: size }} />
  );
}

export function PlaygroundMockup({ lang }: { lang: Lang }) {
  const t = PLAY[lang];
  const bars = [0.4, 0.75, 1, 0.65, 0.9, 0.5, 0.8];
  const caption = t.lines[t.lines.length - 1].text;
  return (
    <AppFrame url="rumios.ai/playground" dark>
      <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_170px]">
        <div className="p-3 sm:p-4 flex flex-col gap-3 min-w-0">
          {/* Call header */}
          <div className="flex items-center justify-between gap-3">
            <p className="text-[11px] font-medium text-stone-400 truncate">{t.title}</p>
            <div className="flex items-center gap-1.5 text-[10.5px] text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-full px-2 py-0.5 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" /> {t.live} · <span className="tabular-nums">04:32</span>
            </div>
          </div>

          {/* Video tiles */}
          <div className="grid grid-cols-2 gap-2">
            {/* AI prospect — speaking */}
            <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-gradient-to-br from-violet-950 via-[#1A1530] to-[#101018] ring-2 ring-violet-500/70 flex flex-col items-center justify-center gap-2">
              <div className="relative">
                <span className="absolute -inset-2 rounded-full bg-violet-500/25 animate-ping" aria-hidden />
                <span className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-violet-500 via-fuchsia-500 to-sky-400 flex items-center justify-center shadow-lg shadow-violet-900/50">
                  <Sparkles className="w-6 h-6 text-white" />
                </span>
              </div>
              <div className="flex items-end gap-[3px] h-4" aria-hidden>
                {bars.map((h, i) => (
                  <span key={i} className="rumios-wave w-[3px] rounded-full bg-violet-300" style={{ height: `${h * 16}px`, animationDelay: `${i * 80}ms` }} />
                ))}
              </div>
              <span className="absolute bottom-1.5 left-1.5 flex items-center gap-1 text-[9.5px] text-white bg-black/50 rounded px-1.5 py-0.5 max-w-[calc(100%-12px)]">
                <span className="truncate">Sophie · {t.role}</span>
              </span>
              <span className="absolute top-1.5 right-1.5 text-[8.5px] font-semibold uppercase tracking-wider text-violet-100 bg-violet-600/80 rounded px-1.5 py-0.5">{t.aiTag}</span>
            </div>

            {/* The user, with photo */}
            <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-gradient-to-br from-stone-700 to-stone-900 flex items-center justify-center">
              <span className="rounded-full ring-2 ring-white/20 shadow-lg shadow-black/40">
                <UserAvatar size={64} />
              </span>
              <span className="absolute bottom-1.5 left-1.5 flex items-center gap-1 text-[9.5px] text-white bg-black/50 rounded px-1.5 py-0.5">
                <Mic className="w-2.5 h-2.5" />{t.you}
              </span>
            </div>
          </div>

          {/* Live caption */}
          <p className="text-[11px] leading-snug text-white/90 bg-black/50 rounded-lg px-3 py-2 text-center">
            <span className="font-semibold text-violet-300">Sophie :</span> « {caption} »
          </p>

          {/* Controls */}
          <div className="flex items-center justify-center gap-2.5">
            <span className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center"><Mic className="w-4 h-4 text-white" /></span>
            <span className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center"><Video className="w-4 h-4 text-white" /></span>
            <span className="w-12 h-9 rounded-full bg-rose-600 flex items-center justify-center shadow-lg shadow-rose-900/40"><PhoneOff className="w-4 h-4 text-white" /></span>
          </div>
        </div>

        <aside className="hidden sm:flex flex-col gap-3 border-l border-white/5 bg-white/[0.02] p-3.5">
          <div>
            <p className="text-[9.5px] font-semibold uppercase tracking-wider text-stone-500 mb-1.5">{t.stepLabel}</p>
            <p className="text-[12px] font-semibold text-white">{t.step}</p>
            <div className="flex gap-1 mt-2" aria-hidden>
              {[0, 1, 2, 3, 4].map(i => (
                <span key={i} className={cn("h-1 flex-1 rounded-full", i < 1 ? "bg-emerald-400" : i === 1 ? "bg-violet-400" : "bg-white/10")} />
              ))}
            </div>
            <p className="text-[10px] text-stone-500 mt-1 tabular-nums">2 / 5</p>
          </div>
          <div className="rounded-lg border border-amber-400/20 bg-amber-400/5 p-2.5">
            <p className="text-[9.5px] font-semibold uppercase tracking-wider text-amber-300/80 mb-1">{t.hintLabel}</p>
            <p className="text-[11px] font-medium text-amber-100">{t.hint}</p>
            <p className="text-[10.5px] text-stone-400 mt-1.5 leading-snug">{t.reply}</p>
          </div>
        </aside>
      </div>
    </AppFrame>
  );
}

// ── 3. Call analysis ─────────────────────────────────────────────────────────

const ANALYSIS: L<{
  title: string; meta: string; outcome: string; overall: string; dims: { label: string; score: number }[];
  talk: string; you: string; prospect: string; momentLabel: string; prospectLine: string; myLine: string;
  note: string; actionsLabel: string; actions: string[];
}> = {
  fr: {
    title: "Call avec Marie D.", meta: "12 sept. · 47 min", outcome: "Closé", overall: "Score global",
    dims: [{ label: "Process", score: 82 }, { label: "Découverte", score: 76 }, { label: "Objections", score: 58 }, { label: "Posture", score: 85 }, { label: "Conclusion", score: 70 }],
    talk: "Temps de parole", you: "Vous", prospect: "Prospect",
    momentLabel: "Moment clé · 32:14", prospectLine: "C'est quand même un sacré budget pour nous…", myLine: "Je peux vous faire 20 % si vous signez cette semaine.",
    note: "Objection prix non recadrée : remise accordée au lieu de revenir à la valeur.",
    actionsLabel: "3 actions pour le prochain call", actions: ["Chiffrer la douleur en découverte", "Reformuler avant de répondre au prix", "Poser la question de closing plus tôt"],
  },
  en: {
    title: "Call with Marie D.", meta: "Sep 12 · 47 min", outcome: "Closed", overall: "Overall score",
    dims: [{ label: "Process", score: 82 }, { label: "Discovery", score: 76 }, { label: "Objections", score: 58 }, { label: "Posture", score: 85 }, { label: "Close", score: 70 }],
    talk: "Talk ratio", you: "You", prospect: "Prospect",
    momentLabel: "Key moment · 32:14", prospectLine: "That's still a serious budget for us…", myLine: "I can do 20% off if you sign this week.",
    note: "Price objection not reframed: you discounted instead of going back to value.",
    actionsLabel: "3 actions for your next call", actions: ["Quantify the pain during discovery", "Recap before answering on price", "Ask the closing question earlier"],
  },
  pt: {
    title: "Chamada com Marie D.", meta: "12 set. · 47 min", outcome: "Fechado", overall: "Pontuação global",
    dims: [{ label: "Processo", score: 82 }, { label: "Descoberta", score: 76 }, { label: "Objeções", score: 58 }, { label: "Postura", score: 85 }, { label: "Fecho", score: 70 }],
    talk: "Tempo de fala", you: "Você", prospect: "Prospeto",
    momentLabel: "Momento-chave · 32:14", prospectLine: "Ainda assim é um orçamento considerável para nós…", myLine: "Posso fazer 20% de desconto se assinar esta semana.",
    note: "Objeção de preço não recadrada: deu desconto em vez de voltar ao valor.",
    actionsLabel: "3 ações para a próxima chamada", actions: ["Quantificar a dor na descoberta", "Reformular antes de responder ao preço", "Fazer a pergunta de fecho mais cedo"],
  },
};

function RingScore({ score, size = 76 }: { score: number; size?: number }) {
  const r = (size - 10) / 2;
  const c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0" role="img" aria-label={`${score}/100`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#F5F5F4" strokeWidth="7" />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#10B981" strokeWidth="7" strokeLinecap="round"
        strokeDasharray={`${(score / 100) * c} ${c}`} transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      <text x="50%" y="50%" dominantBaseline="central" textAnchor="middle" className="fill-stone-900" style={{ fontSize: size * 0.3, fontWeight: 700 }}>{score}</text>
    </svg>
  );
}

export function AnalysisMockup({ lang }: { lang: Lang }) {
  const t = ANALYSIS[lang];
  return (
    <AppFrame url="rumios.ai/call-analysis/marie-d">
      <div className="bg-stone-50 p-4 sm:p-5 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-stone-900 truncate">{t.title}</p>
            <p className="text-[10.5px] text-stone-500">{t.meta}</p>
          </div>
          <span className="text-[10.5px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-full px-2 py-0.5 shrink-0">{t.outcome}</span>
        </div>

        <div className="bg-white border border-stone-200 rounded-xl p-3.5 flex items-center gap-4">
          <div className="flex flex-col items-center gap-1">
            <RingScore score={78} />
            <p className="text-[9.5px] text-stone-400">{t.overall}</p>
          </div>
          <div className="flex-1 min-w-0 space-y-1.5">
            {t.dims.map(d => {
              const tone = scoreTone(d.score);
              return (
                <div key={d.label} className="flex items-center gap-2">
                  <span className="text-[10.5px] text-stone-500 w-[68px] truncate">{d.label}</span>
                  <span className="flex-1 h-1.5 bg-stone-100 rounded-full overflow-hidden">
                    <span className={cn("block h-full rounded-full", tone.bar)} style={{ width: `${d.score}%` }} />
                  </span>
                  <span className={cn("text-[10.5px] font-semibold tabular-nums w-5 text-right", tone.text)}>{d.score}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-white border border-stone-200 rounded-xl p-3 space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">{t.momentLabel}</p>
            <p className="text-[11px] text-stone-500 leading-snug"><span className="font-medium text-stone-700">{t.prospect} :</span> {t.prospectLine}</p>
            <p className="text-[11px] leading-snug bg-amber-50 border-l-2 border-amber-400 rounded-r px-2 py-1 text-stone-800"><span className="font-medium">{t.you} :</span> {t.myLine}</p>
            <p className="text-[10.5px] text-amber-700 leading-snug flex gap-1"><Lightbulb className="w-3 h-3 shrink-0 mt-px" />{t.note}</p>
          </div>
          <div className="bg-white border border-stone-200 rounded-xl p-3 space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">{t.talk}</p>
            <div className="flex h-4 rounded-full overflow-hidden text-[9px] font-semibold">
              <span className="bg-stone-800 text-white flex items-center justify-center" style={{ width: "42%" }}>42%</span>
              <span className="bg-stone-200 text-stone-500 flex items-center justify-center" style={{ width: "58%" }}>58%</span>
            </div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400 pt-1">{t.actionsLabel}</p>
            <ol className="space-y-1">
              {t.actions.map((a, i) => (
                <li key={a} className="flex gap-1.5 text-[10.5px] text-stone-700 leading-snug">
                  <span className="w-3.5 h-3.5 rounded-full bg-violet-100 text-violet-700 text-[8.5px] font-bold flex items-center justify-center shrink-0">{i + 1}</span>{a}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </AppFrame>
  );
}

// ── 4. Progress dashboard ────────────────────────────────────────────────────

const PROGRESS: L<{
  hello: string; kpis: [string, string, string]; delta: string; chartLabel: string; weeks: string;
  recentLabel: string; rows: { name: string; outcome: string; tone: string; score: number }[]; weakLabel: string; weak: string;
}> = {
  fr: {
    hello: "Bonjour Camille", kpis: ["Scripts actifs", "Calls ce mois", "Score moyen"], delta: "+9 pts vs mois dernier",
    chartLabel: "Évolution du score", weeks: "8 dernières semaines", recentLabel: "Dernières analyses",
    rows: [{ name: "Marie D.", outcome: "Closé", tone: "text-emerald-600 bg-emerald-50", score: 78 }, { name: "Julien R.", outcome: "Prochain appel", tone: "text-sky-600 bg-sky-50", score: 71 }, { name: "Sarah K.", outcome: "Perdu", tone: "text-rose-600 bg-rose-50", score: 54 }],
    weakLabel: "Axe à travailler", weak: "Objections",
  },
  en: {
    hello: "Hello Camille", kpis: ["Active scripts", "Calls this month", "Average score"], delta: "+9 pts vs last month",
    chartLabel: "Score trend", weeks: "Last 8 weeks", recentLabel: "Recent analyses",
    rows: [{ name: "Marie D.", outcome: "Closed", tone: "text-emerald-600 bg-emerald-50", score: 78 }, { name: "Julien R.", outcome: "Next call", tone: "text-sky-600 bg-sky-50", score: 71 }, { name: "Sarah K.", outcome: "Lost", tone: "text-rose-600 bg-rose-50", score: 54 }],
    weakLabel: "Focus area", weak: "Objections",
  },
  pt: {
    hello: "Olá Camille", kpis: ["Guiões ativos", "Chamadas este mês", "Pontuação média"], delta: "+9 pts vs mês passado",
    chartLabel: "Evolução da pontuação", weeks: "Últimas 8 semanas", recentLabel: "Análises recentes",
    rows: [{ name: "Marie D.", outcome: "Fechado", tone: "text-emerald-600 bg-emerald-50", score: 78 }, { name: "Julien R.", outcome: "Próxima chamada", tone: "text-sky-600 bg-sky-50", score: 71 }, { name: "Sarah K.", outcome: "Perdido", tone: "text-rose-600 bg-rose-50", score: 54 }],
    weakLabel: "Eixo a trabalhar", weak: "Objeções",
  },
};

const TREND = [52, 58, 55, 63, 66, 64, 71, 78];

function TrendChart() {
  const w = 300, h = 92, pad = 6;
  const min = 40, max = 90;
  const pts = TREND.map((v, i) => [pad + (i * (w - pad * 2)) / (TREND.length - 1), h - pad - ((v - min) / (max - min)) * (h - pad * 2)] as const);
  const line = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area = `${line} L${pts[pts.length - 1][0]},${h} L${pts[0][0]},${h} Z`;
  const last = pts[pts.length - 1];
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-[92px]" preserveAspectRatio="none" role="img" aria-label={TREND.join(", ")}>
      <defs>
        <linearGradient id="rumios-trend" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#7C3AED" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map(f => <line key={f} x1="0" x2={w} y1={h * f} y2={h * f} stroke="#F5F5F4" strokeWidth="1" />)}
      <path d={area} fill="url(#rumios-trend)" />
      <path d={line} fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      <circle cx={last[0]} cy={last[1]} r="3.5" fill="#7C3AED" stroke="white" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

export function ProgressMockup({ lang }: { lang: Lang }) {
  const t = PROGRESS[lang];
  const values = ["2", "12", "74"];
  return (
    <AppFrame url="rumios.ai/dashboard">
      <div className="bg-stone-50 p-4 sm:p-5 space-y-3">
        <p className="text-[15px] font-semibold text-stone-900 tracking-tight">{t.hello}</p>
        <div className="grid grid-cols-3 gap-2">
          {t.kpis.map((k, i) => (
            <div key={k} className="bg-white border border-stone-200 rounded-lg p-2.5 min-w-0">
              <p className="text-[9px] font-semibold uppercase tracking-wider text-violet-500 truncate">{k}</p>
              <p className={cn("text-[20px] font-bold tabular-nums leading-none mt-1.5", i === 2 ? "text-amber-600" : "text-stone-900")}>{values[i]}</p>
              {i === 2 && <p className="text-[9px] text-emerald-600 font-medium mt-1 flex items-center gap-0.5 truncate"><ArrowUpRight className="w-2.5 h-2.5 shrink-0" />{t.delta}</p>}
            </div>
          ))}
        </div>
        <div className="bg-white border border-stone-200 rounded-lg p-3">
          <div className="flex items-baseline justify-between mb-1">
            <p className="text-[11px] font-semibold text-stone-700">{t.chartLabel}</p>
            <p className="text-[9.5px] text-stone-400">{t.weeks}</p>
          </div>
          <TrendChart />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_120px] gap-2">
          <div className="bg-white border border-stone-200 rounded-lg overflow-hidden">
            <p className="text-[11px] font-semibold text-stone-700 px-3 py-2 border-b border-stone-100">{t.recentLabel}</p>
            {t.rows.map(r => {
              const tone = scoreTone(r.score);
              return (
                <div key={r.name} className="flex items-center gap-2 px-3 py-1.5 border-b border-stone-50 last:border-0">
                  <span className="text-[11px] font-medium text-stone-800 flex-1 truncate">{r.name}</span>
                  <span className={cn("text-[9.5px] font-medium px-1.5 py-px rounded-full", r.tone)}>{r.outcome}</span>
                  <span className={cn("text-[11px] font-bold tabular-nums px-1.5 rounded-md", tone.text, tone.soft)}>{r.score}</span>
                </div>
              );
            })}
          </div>
          <div className="hidden sm:flex flex-col justify-center bg-amber-50 border border-amber-100 rounded-lg p-3">
            <p className="text-[9.5px] font-semibold uppercase tracking-wider text-amber-700/80">{t.weakLabel}</p>
            <p className="text-[13px] font-semibold text-amber-900 mt-1">{t.weak}</p>
            <p className="text-[18px] font-bold text-amber-600 tabular-nums mt-0.5">58</p>
          </div>
        </div>
      </div>
    </AppFrame>
  );
}

// ── 5. Live Copilot ──────────────────────────────────────────────────────────

const COPILOT: L<{ you: string; caption: string; detected: string; objection: string; suggested: string; reply: string; steps: string[] }> = {
  fr: {
    you: "Vous", caption: "« Ça me plaît, mais je dois d'abord en parler à mon associé. »",
    detected: "Objection détectée", objection: "Besoin de consulter un tiers", suggested: "Réponse suggérée",
    reply: "« Bien sûr. À votre avis, qu'est-ce qui le fera hésiter ? Voyons-le ensemble maintenant. »",
    steps: ["Cadre", "Découverte", "Offre", "Closing"],
  },
  en: {
    you: "You", caption: "“I like it, but I need to run it by my partner first.”",
    detected: "Objection detected", objection: "Needs to consult someone", suggested: "Suggested reply",
    reply: "“Of course. What do you think will make them hesitate? Let's look at it together now.”",
    steps: ["Frame", "Discovery", "Offer", "Close"],
  },
  pt: {
    you: "Você", caption: "« Gosto, mas primeiro tenho de falar com o meu sócio. »",
    detected: "Objeção detetada", objection: "Precisa de consultar alguém", suggested: "Resposta sugerida",
    reply: "« Claro. Na sua opinião, o que o fará hesitar? Vamos ver isso juntos agora. »",
    steps: ["Enquadramento", "Descoberta", "Oferta", "Fecho"],
  },
};

export function CopilotMockup({ lang }: { lang: Lang }) {
  const t = COPILOT[lang];
  return (
    <AppFrame url="meet.google.com/abc-defg-hij" dark>
      <div className="p-3 sm:p-4 flex flex-col sm:flex-row gap-3">
        <div className="flex-1 min-w-0">
          <div className="grid grid-cols-2 gap-2">
            <div className="aspect-[4/3] rounded-xl bg-gradient-to-br from-stone-700 to-stone-800 flex items-center justify-center relative">
              <span className="w-11 h-11 rounded-full bg-sky-600 text-white text-[14px] font-semibold flex items-center justify-center">TL</span>
              <span className="absolute bottom-1.5 left-1.5 text-[9.5px] text-white/80 bg-black/40 rounded px-1.5 py-0.5">Thomas L.</span>
            </div>
            <div className="aspect-[4/3] rounded-xl bg-gradient-to-br from-stone-800 to-stone-900 flex items-center justify-center relative">
              <span className="w-11 h-11 rounded-full bg-violet-600 text-white text-[14px] font-semibold flex items-center justify-center">CM</span>
              <span className="absolute bottom-1.5 left-1.5 text-[9.5px] text-white/80 bg-black/40 rounded px-1.5 py-0.5 flex items-center gap-1"><Video className="w-2.5 h-2.5" />{t.you}</span>
            </div>
          </div>
          <p className="mt-2.5 text-center text-[11px] text-white/85 bg-black/50 rounded-lg px-3 py-1.5">{t.caption}</p>
          <div className="hidden sm:flex items-center justify-center gap-2.5 mt-3" aria-hidden>
            <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"><Mic className="w-3.5 h-3.5 text-white" /></span>
            <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"><Video className="w-3.5 h-3.5 text-white" /></span>
            <span className="w-10 h-8 rounded-full bg-rose-600 flex items-center justify-center"><PhoneOff className="w-3.5 h-3.5 text-white" /></span>
          </div>
        </div>

        <div className="sm:w-[210px] shrink-0 self-start bg-white rounded-xl shadow-2xl shadow-black/40 ring-1 ring-black/5 overflow-hidden">
          <div className="flex items-center gap-1.5 px-3 py-2 bg-violet-600 text-white">
            <Sparkles className="w-3 h-3" />
            <span className="text-[10.5px] font-semibold">Rumios Copilot</span>
            <span className="ml-auto flex items-center gap-1 text-[9px] font-medium bg-white/15 rounded-full px-1.5 py-px"><span className="w-1 h-1 rounded-full bg-emerald-300 animate-pulse" />LIVE</span>
          </div>
          <div className="p-3 space-y-2.5">
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-wider text-amber-600">{t.detected}</p>
              <p className="text-[11.5px] font-semibold text-stone-900 mt-0.5">{t.objection}</p>
            </div>
            <div className="bg-violet-50 rounded-lg p-2">
              <p className="text-[9px] font-semibold uppercase tracking-wider text-violet-500 mb-0.5">{t.suggested}</p>
              <p className="text-[10.5px] text-stone-700 leading-snug">{t.reply}</p>
            </div>
            <div className="flex items-center gap-1" aria-hidden>
              {t.steps.map((s, i) => (
                <div key={s} className="flex-1 min-w-0">
                  <span className={cn("block h-1 rounded-full", i < 3 ? "bg-emerald-400" : "bg-violet-500")} />
                  <span className={cn("block text-[8.5px] mt-1 truncate", i === 3 ? "text-violet-600 font-semibold" : "text-stone-400")}>{s}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppFrame>
  );
}
