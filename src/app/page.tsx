"use client";
import { SignInButton, SignUpButton, useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PhoneCall, FileText, Zap, CheckCircle2, TrendingUp, BarChart2, ArrowRight, Mic, Target, Brain, Swords } from "lucide-react";
import { cn } from "@/lib/utils";

type Lang = "fr" | "en";

const CONTENT = {
  fr: {
    nav: { signin: "Se connecter", signup: "Essayer gratuitement" },
    badge: "Script Builder & Analyse de calls disponibles",
    hero: {
      headline: ["Closez plus.", "Perdez moins."],
      sub: "L'IA qui analyse vos appels de vente, score vos performances et vous dit exactement quoi améliorer — pour que chaque call vous rende meilleur que le précédent.",
      cta: "Commencer gratuitement",
      ctaSecondary: "Se connecter",
    },
    mockCard: {
      label: "Analyse IA — Call avec Marie D.",
      subtitle: "Découverte + Closing — 47 min",
      scoreLabel: "Score global",
      items: [
        { label: "Process", score: 82, color: "bg-emerald-500" },
        { label: "Découverte", score: 75, color: "bg-emerald-500" },
        { label: "Objections", score: 68, color: "bg-amber-400" },
        { label: "Posture", score: 85, color: "bg-emerald-500" },
        { label: "Conclusion", score: 70, color: "bg-amber-400" },
        { label: "Talk ratio", score: 42, color: "bg-sky-500", suffix: "%" },
      ],
      insights: [
        { type: "good", text: "Excellente phase de découverte — tu as bien cerné les douleurs" },
        { type: "warn", text: "L'objection prix n'a pas été recadrée — à travailler" },
      ],
    },
    problem: {
      label: "Le problème",
      headline: ["Vous sortez de chaque call sans savoir", "ce qui a vraiment bloqué."],
      sub: "Pas de feedback objectif. Pas de données. Juste votre ressenti — et souvent, votre ressenti vous ment. Résultat : vous répétez les mêmes erreurs, call après call.",
      pains: [
        "Vous ne savez pas pourquoi un prospect a décroché",
        "Votre script existe dans votre tête mais pas vraiment ailleurs",
        "Vous n'avez aucune mesure objective de vos progrès",
      ],
    },
    features: {
      label: "La solution",
      headline: "Quatre outils. Un seul objectif : signer plus.",
      items: [
        {
          icon: FileText,
          title: "Script Builder IA",
          description: "Partez de zéro ou d'un template. L'IA structure vos arguments, anticipe les objections et génère un script complet en quelques minutes.",
          tag: "Disponible",
          tagColor: "bg-emerald-50 text-emerald-700",
        },
        {
          icon: PhoneCall,
          title: "Analyse de calls",
          description: "Importez un transcript, obtenez un score sur 100, des points forts, des axes d'amélioration et des recommandations concrètes pour votre prochain appel.",
          tag: "Disponible",
          tagColor: "bg-emerald-50 text-emerald-700",
        },
        {
          icon: Zap,
          title: "Live Copilot",
          description: "Pendant l'appel, l'IA détecte l'étape en cours et vous souffle les bonnes réponses aux objections en temps réel — sans que votre prospect le sache.",
          tag: "Bientôt",
          tagColor: "bg-amber-50 text-amber-600",
        },
        {
          icon: Swords,
          title: "Playground",
          description: "Entraînez-vous en conditions réelles : simulez un appel de vente face à une IA qui joue le prospect. Répétez, échouez, progressez — sans enjeu.",
          tag: "Bientôt",
          tagColor: "bg-amber-50 text-amber-600",
        },
      ],
    },
    metrics: {
      label: "Ce qu'on mesure",
      headline: ["Un score sur 6 dimensions,", "pour savoir exactement où progresser."],
      items: [
        { icon: Target, label: "Process respecté", desc: "Suivez chaque étape de votre script" },
        { icon: Brain, label: "Découverte qualité", desc: "Mesure la profondeur de qualification" },
        { icon: Mic, label: "Posture & énergie", desc: "Votre ton, votre confiance, votre autorité" },
        { icon: TrendingUp, label: "Taux de closing", desc: "Trackez votre progression sur la durée" },
        { icon: BarChart2, label: "Gestion objections", desc: "Détecte et évalue chaque traitement" },
        { icon: CheckCircle2, label: "Score global", desc: "Une note claire après chaque appel" },
      ],
    },
    steps: {
      label: "Comment ça marche",
      headline: "Opérationnel en 10 minutes.",
      items: [
        {
          number: "01",
          title: "Créez votre script",
          description: "Partez de zéro en décrivant votre offre, ou choisissez un template existant. L'IA génère un script structuré avec les étapes, les questions clés et les réponses aux objections courantes.",
        },
        {
          number: "02",
          title: "Importez vos appels",
          description: "Enregistrez vos calls avec tl;dv, Fathom ou Otter.ai, puis collez le transcript. L'analyse IA démarre automatiquement.",
        },
        {
          number: "03",
          title: "Progressez à chaque call",
          description: "Recevez un score détaillé, vos points forts du jour et 3 actions concrètes pour votre prochain appel. Mesurez votre progression dans le temps.",
        },
      ],
    },
    profiles: {
      label: "Pour qui ?",
      headline: ["Fait pour ceux qui vendent", "par eux-mêmes."],
      items: [
        { emoji: "🎯", title: "Closers indépendants", desc: "Vous vendez pour vous-même ou pour des clients. Chaque call compte — analysez chacun pour ne plus laisser de deal sur la table." },
        { emoji: "🧑‍💼", title: "Coachs", desc: "Vous vendez votre accompagnement en appel. Quel que soit votre domaine — business, life, bien-être — structurez votre closing et mesurez ce qui bloque vraiment." },
        { emoji: "🚀", title: "Entrepreneurs & freelances", desc: "Vous avez un super produit mais la vente n'est pas votre domaine naturel. Structurez vos calls et progressez vite." },
      ],
    },
    cta: {
      headline: ["Votre prochain call", "sera meilleur que le dernier."],
      sub: "Rejoignez les coachs et closers qui utilisent l'IA pour progresser à chaque appel. Gratuit pour commencer.",
      button: "Commencer gratuitement",
      note: "Aucune carte bancaire requise · Accès immédiat",
    },
    footer: "Tous droits réservés",
  },
  en: {
    nav: { signin: "Sign in", signup: "Try for free" },
    badge: "Script Builder & Call Analysis available",
    hero: {
      headline: ["Close more.", "Lose less."],
      sub: "The AI that analyzes your sales calls, scores your performance, and tells you exactly what to improve — so every call makes you better than the last.",
      cta: "Get started for free",
      ctaSecondary: "Sign in",
    },
    mockCard: {
      label: "AI Analysis — Call with Marie D.",
      subtitle: "Discovery + Closing — 47 min",
      scoreLabel: "Overall score",
      items: [
        { label: "Process", score: 82, color: "bg-emerald-500" },
        { label: "Discovery", score: 75, color: "bg-emerald-500" },
        { label: "Objections", score: 68, color: "bg-amber-400" },
        { label: "Posture", score: 85, color: "bg-emerald-500" },
        { label: "Close", score: 70, color: "bg-amber-400" },
        { label: "Talk ratio", score: 42, color: "bg-sky-500", suffix: "%" },
      ],
      insights: [
        { type: "good", text: "Excellent discovery phase — you nailed the pain points" },
        { type: "warn", text: "The price objection wasn't reframed — needs work" },
      ],
    },
    problem: {
      label: "The problem",
      headline: ["You end every call without knowing", "what really went wrong."],
      sub: "No objective feedback. No data. Just your gut — and your gut often lies. Result: you repeat the same mistakes, call after call.",
      pains: [
        "You don't know why a prospect went cold",
        "Your script lives in your head, nowhere else",
        "You have no objective measure of your progress",
      ],
    },
    features: {
      label: "The solution",
      headline: "Four tools. One goal: close more deals.",
      items: [
        {
          icon: FileText,
          title: "AI Script Builder",
          description: "Start from scratch or from a template. The AI structures your arguments, anticipates objections, and generates a complete script in minutes.",
          tag: "Available",
          tagColor: "bg-emerald-50 text-emerald-700",
        },
        {
          icon: PhoneCall,
          title: "Call Analysis",
          description: "Import a transcript, get a score out of 100, strengths, improvement areas, and concrete recommendations for your next call.",
          tag: "Available",
          tagColor: "bg-emerald-50 text-emerald-700",
        },
        {
          icon: Zap,
          title: "Live Copilot",
          description: "During the call, the AI detects the current stage and whispers the right objection responses in real time — without your prospect knowing.",
          tag: "Coming soon",
          tagColor: "bg-amber-50 text-amber-600",
        },
        {
          icon: Swords,
          title: "Playground",
          description: "Train in real conditions: simulate a sales call against an AI playing the prospect. Repeat, fail, improve — without any real stakes.",
          tag: "Coming soon",
          tagColor: "bg-amber-50 text-amber-600",
        },
      ],
    },
    metrics: {
      label: "What we measure",
      headline: ["A score across 6 dimensions,", "so you know exactly where to improve."],
      items: [
        { icon: Target, label: "Process adherence", desc: "Follow every step of your script" },
        { icon: Brain, label: "Discovery quality", desc: "Measures depth of qualification" },
        { icon: Mic, label: "Posture & energy", desc: "Your tone, confidence, and authority" },
        { icon: TrendingUp, label: "Closing rate", desc: "Track your progress over time" },
        { icon: BarChart2, label: "Objection handling", desc: "Detects and evaluates every response" },
        { icon: CheckCircle2, label: "Overall score", desc: "A clear grade after every call" },
      ],
    },
    steps: {
      label: "How it works",
      headline: "Up and running in 10 minutes.",
      items: [
        {
          number: "01",
          title: "Build your script",
          description: "Start from scratch by describing your offer, or pick an existing template. The AI generates a structured script with stages, key questions, and answers to common objections.",
        },
        {
          number: "02",
          title: "Import your calls",
          description: "Record your calls with tl;dv, Fathom, or Otter.ai, then paste the transcript. AI analysis starts automatically.",
        },
        {
          number: "03",
          title: "Improve every call",
          description: "Get a detailed score, your strengths of the day, and 3 concrete actions for your next call. Measure your progress over time.",
        },
      ],
    },
    profiles: {
      label: "Who is it for?",
      headline: ["Built for people who sell", "for themselves."],
      items: [
        { emoji: "🎯", title: "Independent closers", desc: "You sell for yourself or for clients. Every call counts — analyze each one to stop leaving deals on the table." },
        { emoji: "🧑‍💼", title: "Coaches", desc: "You sell your coaching program over the phone. Whatever your niche — business, life, wellness — structure your closing and measure what's really blocking you." },
        { emoji: "🚀", title: "Entrepreneurs & freelancers", desc: "You have a great product but sales isn't your natural domain. Structure your calls and improve fast." },
      ],
    },
    cta: {
      headline: ["Your next call", "will be better than the last."],
      sub: "Join the coaches and closers using AI to improve every call. Free to start.",
      button: "Get started for free",
      note: "No credit card required · Instant access",
    },
    footer: "All rights reserved",
  },
} as const;

function Navbar({ lang, setLang }: { lang: Lang; setLang: (l: Lang) => void }) {
  const c = CONTENT[lang].nav;
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm border-b border-stone-100">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-stone-900 rounded-md flex items-center justify-center">
            <span className="text-white text-[10px] font-bold">R</span>
          </div>
          <span className="font-semibold text-[13.5px] text-stone-900">RUMIOS</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setLang(lang === "fr" ? "en" : "fr")}
            className="text-[12px] font-medium text-stone-400 hover:text-stone-700 px-2.5 py-1 rounded-md border border-stone-200 hover:border-stone-300 transition-colors tabular-nums"
          >
            {lang === "fr" ? "EN" : "FR"}
          </button>
          <SignInButton mode="modal">
            <button className="text-[13px] text-stone-600 hover:text-stone-900 transition-colors px-3 py-1.5 rounded-lg hover:bg-stone-100">
              {c.signin}
            </button>
          </SignInButton>
          <SignUpButton mode="modal">
            <button className="text-[13px] font-medium bg-stone-900 text-white px-4 py-1.5 rounded-lg hover:bg-stone-700 transition-colors">
              {c.signup}
            </button>
          </SignUpButton>
        </div>
      </div>
    </header>
  );
}

export default function HomePage() {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();
  const [lang, setLang] = useState<Lang>("fr");

  useEffect(() => {
    if (isLoaded && isSignedIn) router.push("/dashboard");
  }, [isLoaded, isSignedIn, router]);

  const c = CONTENT[lang];

  return (
    <div className="bg-white text-stone-900 min-h-screen">
      <Navbar lang={lang} setLang={setLang} />

      {/* Hero */}
      <section className="pt-32 pb-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-stone-100 text-stone-600 text-[12px] font-medium px-3.5 py-1.5 rounded-full mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            {c.badge}
          </div>
          <h1 className="text-[56px] font-bold tracking-tight leading-[1.1] text-stone-900 mb-6">
            {c.hero.headline[0]}
            <br />
            <span className="text-stone-400">{c.hero.headline[1]}</span>
          </h1>
          <p className="text-[18px] text-stone-500 max-w-2xl mx-auto leading-relaxed mb-10">
            {c.hero.sub}
          </p>
          <div className="flex items-center justify-center gap-3">
            <SignUpButton mode="modal">
              <button className="flex items-center gap-2 bg-stone-900 text-white text-[14px] font-medium px-6 py-3 rounded-xl hover:bg-stone-700 transition-colors shadow-sm">
                {c.hero.cta} <ArrowRight className="w-4 h-4" />
              </button>
            </SignUpButton>
            <SignInButton mode="modal">
              <button className="text-[14px] text-stone-500 hover:text-stone-900 px-6 py-3 rounded-xl border border-stone-200 hover:border-stone-300 transition-colors">
                {c.hero.ctaSecondary}
              </button>
            </SignInButton>
          </div>
        </div>

        {/* Score preview card */}
        <div className="max-w-2xl mx-auto mt-16">
          <div className="bg-white border border-stone-200 rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-stone-900 px-6 py-4 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">{c.mockCard.label}</p>
                <p className="text-white font-semibold mt-0.5">{c.mockCard.subtitle}</p>
              </div>
              <div className="text-right">
                <div className="text-[42px] font-bold text-emerald-400 leading-none">78</div>
                <p className="text-[11px] text-stone-400">{c.mockCard.scoreLabel}</p>
              </div>
            </div>
            <div className="px-6 py-4 grid grid-cols-3 gap-4 border-b border-stone-100">
              {c.mockCard.items.map((item, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-stone-500">{item.label}</span>
                    <span className="text-[12px] font-semibold text-stone-800">{item.score}{"suffix" in item ? item.suffix : ""}</span>
                  </div>
                  <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
                    <div className={cn("h-full rounded-full", item.color)} style={{ width: `${item.score}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="px-6 py-3.5 flex gap-6 text-[12px]">
              {c.mockCard.insights.map((ins, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className={cn(
                    "mt-0.5 w-4 h-4 rounded-full text-white text-[10px] font-bold flex items-center justify-center shrink-0",
                    ins.type === "good" ? "bg-emerald-500" : "bg-amber-400"
                  )}>
                    {ins.type === "good" ? "✓" : "!"}
                  </span>
                  <span className="text-stone-600">{ins.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="py-20 px-6 bg-stone-50 border-y border-stone-100">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <p className="text-[12px] font-semibold text-stone-400 uppercase tracking-widest">{c.problem.label}</p>
          <h2 className="text-[36px] font-bold tracking-tight leading-tight">
            {c.problem.headline[0]}<br />{c.problem.headline[1]}
          </h2>
          <p className="text-[16px] text-stone-500 leading-relaxed max-w-2xl mx-auto">
            {c.problem.sub}
          </p>
          <div className="grid grid-cols-3 gap-4 pt-6 text-left max-w-2xl mx-auto">
            {c.problem.pains.map((item, i) => (
              <div key={i} className="bg-white border border-stone-200 rounded-xl p-4 shadow-sm">
                <p className="text-[13px] text-stone-600 leading-snug">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-[12px] font-semibold text-stone-400 uppercase tracking-widest mb-3">{c.features.label}</p>
            <h2 className="text-[36px] font-bold tracking-tight">{c.features.headline}</h2>
          </div>
          <div className="grid grid-cols-2 gap-6">
            {c.features.items.map((f) => (
              <div key={f.title} className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm flex flex-col gap-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 bg-stone-100 rounded-xl flex items-center justify-center">
                    <f.icon className="w-5 h-5 text-stone-700" />
                  </div>
                  <span className={cn("text-[11px] font-medium px-2.5 py-1 rounded-full", f.tagColor)}>{f.tag}</span>
                </div>
                <div>
                  <h3 className="text-[15px] font-semibold text-stone-900 mb-1.5">{f.title}</h3>
                  <p className="text-[13px] text-stone-500 leading-relaxed">{f.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Metrics */}
      <section className="py-20 px-6 bg-stone-900 text-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-[12px] font-semibold text-stone-400 uppercase tracking-widest mb-3">{c.metrics.label}</p>
            <h2 className="text-[32px] font-bold tracking-tight">{c.metrics.headline[0]}<br />{c.metrics.headline[1]}</h2>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {c.metrics.items.map((m) => (
              <div key={m.label} className="bg-white/5 border border-white/10 rounded-xl p-5 flex items-start gap-3.5">
                <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center shrink-0">
                  <m.icon className="w-4 h-4 text-stone-300" />
                </div>
                <div>
                  <p className="text-[13.5px] font-semibold text-white">{m.label}</p>
                  <p className="text-[12px] text-stone-400 mt-0.5">{m.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-[12px] font-semibold text-stone-400 uppercase tracking-widest mb-3">{c.steps.label}</p>
            <h2 className="text-[36px] font-bold tracking-tight">{c.steps.headline}</h2>
          </div>
          <div className="space-y-6">
            {c.steps.items.map((step) => (
              <div key={step.number} className="flex items-start gap-8 p-7 bg-white border border-stone-200 rounded-2xl shadow-sm">
                <div className="shrink-0">
                  <span className="text-[42px] font-bold text-stone-100 leading-none tabular-nums">{step.number}</span>
                </div>
                <div className="pt-1">
                  <h3 className="text-[17px] font-semibold text-stone-900 mb-2">{step.title}</h3>
                  <p className="text-[14px] text-stone-500 leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For who */}
      <section className="py-20 px-6 bg-stone-50 border-y border-stone-100">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-[12px] font-semibold text-stone-400 uppercase tracking-widest mb-3">{c.profiles.label}</p>
            <h2 className="text-[32px] font-bold tracking-tight">{c.profiles.headline[0]}<br />{c.profiles.headline[1]}</h2>
          </div>
          <div className="grid grid-cols-3 gap-5">
            {c.profiles.items.map((p) => (
              <div key={p.title} className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm">
                <div className="text-3xl mb-3">{p.emoji}</div>
                <h3 className="text-[15px] font-semibold text-stone-900 mb-2">{p.title}</h3>
                <p className="text-[13px] text-stone-500 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-28 px-6">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <h2 className="text-[42px] font-bold tracking-tight leading-tight">
            {c.cta.headline[0]}<br />{c.cta.headline[1]}
          </h2>
          <p className="text-[16px] text-stone-500 leading-relaxed">
            {c.cta.sub}
          </p>
          <SignUpButton mode="modal">
            <button className="inline-flex items-center gap-2 bg-stone-900 text-white text-[15px] font-medium px-8 py-3.5 rounded-xl hover:bg-stone-700 transition-colors shadow-sm">
              {c.cta.button} <ArrowRight className="w-4 h-4" />
            </button>
          </SignUpButton>
          <p className="text-[12px] text-stone-400">{c.cta.note}</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-stone-100 py-8 px-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between text-[12px] text-stone-400">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-stone-900 rounded-md flex items-center justify-center">
              <span className="text-white text-[9px] font-bold">R</span>
            </div>
            <span>rumios.ai</span>
          </div>
          <p>© 2026 RUMIOS · {c.footer}</p>
        </div>
      </footer>
    </div>
  );
}
