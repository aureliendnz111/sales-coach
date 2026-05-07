"use client";
import { SignInButton, SignUpButton, useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PhoneCall, FileText, Zap, CheckCircle2, TrendingUp, BarChart2, ArrowRight, Mic, Target, Brain, Swords, Plus, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { RumiosLogo } from "@/components/RumiosLogo";

type Lang = "fr" | "en";

const CONTENT = {
  fr: {
    nav: { signin: "Se connecter", signup: "Essayer gratuitement" },
    floatingNav: [
      { label: "Fonctionnalités", href: "#features" },
      { label: "Comment ça marche", href: "#how" },
      { label: "FAQ", href: "#faq" },
    ],
    badge: "Script Builder et Analyse de calls disponibles",
    hero: {
      headline: "Closez plus. Perdez moins.",
      sub: "Rumios analyse vos appels de vente, score votre performance sur 6 dimensions et vous dit précisément quoi corriger avant le prochain appel.",
      cta: "Commencer gratuitement",
      ctaSecondary: "Se connecter",
    },
    mockCard: {
      label: "Analyse — Call avec Marie D.",
      subtitle: "Découverte + Closing, 47 min",
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
        { type: "good", text: "Bonne phase de découverte, les douleurs sont bien identifiées" },
        { type: "warn", text: "Objection prix non recadrée — à corriger au prochain call" },
      ],
    },
    problem: {
      label: "Le problème",
      headline: "Vous sortez de chaque call avec une impression. Rarement avec une analyse.",
      sub: "Sans données, vous répétez les mêmes erreurs. Vous ne savez pas ce qui a fait signer, ni ce qui a fait décrocher.",
      pains: [
        { title: "Vous ne savez pas pourquoi vous avez perdu", desc: "Chaque deal raté reste flou. Vous improvisez la prochaine fois." },
        { title: "Votre script change à chaque appel", desc: "Rien n'est formalisé. Ce qui marche disparaît avec le call." },
        { title: "Impossible de mesurer vos progrès", desc: "Vous avancez à l'aveugle, sans savoir si vous vous améliorez vraiment." },
      ],
    },
    features: {
      label: "La solution",
      headline: "Tout ce qu'il faut pour mieux vendre en appel.",
      items: [
        { icon: FileText, title: "Construisez votre script une bonne fois pour toutes", description: "Partez de zéro ou d'un template. Structurez vos étapes, vos questions clés, vos réponses aux objections. Votre process, formalisé.", tag: "Disponible", tagColor: "bg-emerald-50 text-emerald-700" },
        { icon: PhoneCall, title: "Un vrai diagnostic après chaque call", description: "Collez le transcript. Recevez un score sur 100, vos points forts, ce qui a bloqué et trois actions concrètes pour le prochain appel.", tag: "Disponible", tagColor: "bg-emerald-50 text-emerald-700" },
        { icon: Zap, title: "Un copilote pendant l'appel", description: "Suggestions en temps réel basées sur votre script. Sachez toujours où vous en êtes et quoi dire face à chaque objection.", tag: "Bientôt", tagColor: "bg-stone-100 text-stone-500" },
        { icon: Swords, title: "Entraînez-vous avant de jouer", description: "Simulez un appel complet face à une IA qui joue le prospect. Rodez votre pitch, testez vos réponses, sans aucun enjeu.", tag: "Bientôt", tagColor: "bg-stone-100 text-stone-500" },
      ],
    },
    metrics: {
      label: "Ce que Rumios mesure",
      headline: "Un score précis sur six dimensions.",
      sub: "Pas une note globale floue. Six axes distincts pour savoir exactement où concentrer vos efforts.",
      items: [
        { icon: Target, label: "Process", desc: "Chaque étape de votre script est-elle respectée ?" },
        { icon: Brain, label: "Découverte", desc: "Avez-vous bien qualifié les douleurs du prospect ?" },
        { icon: Mic, label: "Posture", desc: "Votre ton, votre rythme, votre niveau de confiance." },
        { icon: TrendingUp, label: "Conclusion", desc: "La demande de closing est-elle bien posée ?" },
        { icon: BarChart2, label: "Gestion des objections", desc: "Chaque objection est détectée et évaluée." },
        { icon: CheckCircle2, label: "Score global", desc: "Une note claire, comparable d'un call à l'autre." },
      ],
    },
    steps: {
      label: "Comment ça marche",
      headline: "Trois étapes. Dix minutes.",
      items: [
        { number: "01", title: "Créez votre script", description: "Décrivez votre offre ou partez d'un template. Rumios structure vos étapes, vos questions et vos réponses aux objections courantes." },
        { number: "02", title: "Collez le transcript de votre call", description: "Enregistrez avec tl;dv, Fathom ou Otter.ai, puis collez le texte dans Rumios. L'analyse démarre en quelques secondes." },
        { number: "03", title: "Lisez le feedback, corrigez, progressez", description: "Score détaillé, erreurs identifiées, recommandations concrètes. Suivez votre progression call après call." },
      ],
    },
    profiles: {
      label: "Pour qui",
      headline: "Pour tous ceux qui vendent leur expertise.",
      items: [
        { emoji: "🎯", title: "Closers indépendants", desc: "Chaque deal compte. Analysez chaque call pour ne plus laisser de vente sur la table par manque de feedback." },
        { emoji: "🧑‍💼", title: "Coachs", desc: "Vous vendez votre accompagnement en appel. Structurez votre closing, mesurez ce qui bloque, progressez à chaque conversation." },
        { emoji: "🚀", title: "Entrepreneurs et freelances", desc: "La vente n'est pas votre métier, mais elle conditionne votre croissance. Rumios vous donne les outils pour la maîtriser." },
      ],
    },
    faq: {
      label: "Questions fréquentes",
      headline: "Tout ce que vous voulez savoir.",
      items: [
        {
          q: "Ai-je besoin d'enregistrer mes calls ?",
          a: "Non. Vous avez juste besoin du transcript texte de votre call. Des outils comme tl;dv, Fathom ou Otter.ai génèrent ces transcripts automatiquement. Vous pouvez aussi en coller un manuellement.",
        },
        {
          q: "Quels types de calls peuvent être analysés ?",
          a: "Tout appel de vente avec un transcript : closing, découverte, suivi, relance. Peu importe le format ou la plateforme. Google Meet, Zoom, Teams — du moment que vous avez le texte, Rumios peut l'analyser.",
        },
        {
          q: "Comment fonctionne le scoring ?",
          a: "L'IA analyse le transcript sur 6 dimensions (process, découverte, objections, posture, conclusion, score global) et retourne une note sur 100 avec des recommandations concrètes pour chaque axe.",
        },
        {
          q: "C'est quoi le Playground ?",
          a: "Une simulation d'appel face à une IA qui joue le rôle du prospect. Vous pouvez vous entraîner autant de fois que vous voulez avant un vrai call, sans aucun enjeu. Cette fonctionnalité est en cours de développement.",
        },
        {
          q: "Combien coûte Rumios ?",
          a: "Rumios est gratuit pour commencer : 2 scripts et 5 analyses de calls par mois. Des plans avec plus de capacités arriveront prochainement.",
        },
        {
          q: "Puis-je utiliser Rumios sans script préexistant ?",
          a: "Oui. L'analyse fonctionne même sans script de référence. Mais les résultats sont bien plus précis quand l'IA peut comparer le call à vos étapes et vos objections préparées.",
        },
      ],
    },
    cta: {
      headline: "Votre prochain call sera différent.",
      sub: "Rejoignez les coachs et closers qui ont arrêté de perdre des deals sans comprendre pourquoi.",
      button: "Commencer gratuitement",
      note: "Gratuit pour commencer. Sans carte bancaire.",
    },
    footer: "Tous droits réservés",
  },
  en: {
    nav: { signin: "Sign in", signup: "Try for free" },
    floatingNav: [
      { label: "Features", href: "#features" },
      { label: "How it works", href: "#how" },
      { label: "FAQ", href: "#faq" },
    ],
    badge: "Script Builder and Call Analysis available now",
    hero: {
      headline: "Close more. Lose less.",
      sub: "Rumios analyzes your sales calls, scores your performance across 6 dimensions, and tells you exactly what to fix before your next call.",
      cta: "Get started for free",
      ctaSecondary: "Sign in",
    },
    mockCard: {
      label: "Analysis — Call with Marie D.",
      subtitle: "Discovery + Closing, 47 min",
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
        { type: "good", text: "Strong discovery phase, pain points are well identified" },
        { type: "warn", text: "Price objection not reframed — fix this on the next call" },
      ],
    },
    problem: {
      label: "The problem",
      headline: "You leave every call with a feeling. Rarely with an analysis.",
      sub: "Without data, you repeat the same mistakes. You don't know what made the deal close — or why it didn't.",
      pains: [
        { title: "You don't know why you lost", desc: "Every lost deal stays vague. You improvise the next time." },
        { title: "Your script changes every call", desc: "Nothing is formalized. What works disappears with the call." },
        { title: "No way to measure progress", desc: "You're flying blind, with no idea if you're actually improving." },
      ],
    },
    features: {
      label: "The solution",
      headline: "Everything you need to sell better on calls.",
      items: [
        { icon: FileText, title: "Build your script once and for all", description: "Start from scratch or a template. Structure your stages, key questions, and objection responses. Your process, formalized.", tag: "Available", tagColor: "bg-emerald-50 text-emerald-700" },
        { icon: PhoneCall, title: "A real diagnosis after every call", description: "Paste the transcript. Get a score out of 100, your strengths, what blocked the deal, and three concrete actions for the next call.", tag: "Available", tagColor: "bg-emerald-50 text-emerald-700" },
        { icon: Zap, title: "A copilot during the call", description: "Real-time suggestions based on your script. Always know where you are and what to say when an objection comes up.", tag: "Coming soon", tagColor: "bg-stone-100 text-stone-500" },
        { icon: Swords, title: "Train before you play", description: "Simulate a full sales call against an AI playing the prospect. Test your responses, sharpen your pitch, with nothing at stake.", tag: "Coming soon", tagColor: "bg-stone-100 text-stone-500" },
      ],
    },
    metrics: {
      label: "What Rumios measures",
      headline: "A precise score across six dimensions.",
      sub: "Not one blurry grade. Six distinct areas so you know exactly where to focus your efforts.",
      items: [
        { icon: Target, label: "Process", desc: "Did you follow each step of your script?" },
        { icon: Brain, label: "Discovery", desc: "Did you properly qualify the prospect's pain?" },
        { icon: Mic, label: "Posture", desc: "Your tone, pace, and confidence level." },
        { icon: TrendingUp, label: "Close", desc: "Was the closing ask clear and well-timed?" },
        { icon: BarChart2, label: "Objection handling", desc: "Every objection is detected and evaluated." },
        { icon: CheckCircle2, label: "Overall score", desc: "A clear grade, comparable call to call." },
      ],
    },
    steps: {
      label: "How it works",
      headline: "Three steps. Ten minutes.",
      items: [
        { number: "01", title: "Build your script", description: "Describe your offer or start from a template. Rumios structures your stages, questions, and answers to common objections." },
        { number: "02", title: "Paste your call transcript", description: "Record with tl;dv, Fathom, or Otter.ai, then paste the text into Rumios. Analysis starts in seconds." },
        { number: "03", title: "Read the feedback. Fix it. Repeat.", description: "Detailed score, identified mistakes, concrete recommendations. Track your progress call after call." },
      ],
    },
    profiles: {
      label: "Who it's for",
      headline: "For everyone who sells their expertise.",
      items: [
        { emoji: "🎯", title: "Independent closers", desc: "Every deal matters. Analyze every call so you stop leaving sales on the table from lack of feedback." },
        { emoji: "🧑‍💼", title: "Coaches", desc: "You sell your coaching over the phone. Structure your closing, measure what blocks, and improve with every conversation." },
        { emoji: "🚀", title: "Entrepreneurs and freelancers", desc: "Sales isn't your job, but it drives your growth. Rumios gives you the tools to get good at it." },
      ],
    },
    faq: {
      label: "FAQ",
      headline: "Everything you need to know.",
      items: [
        { q: "Do I need to record my calls?", a: "No. You just need the text transcript of your call. Tools like tl;dv, Fathom, or Otter.ai generate these automatically. You can also paste one manually." },
        { q: "What types of calls can be analyzed?", a: "Any sales call with a transcript: closing, discovery, follow-up, re-engagement. Format doesn't matter. Google Meet, Zoom, Teams — as long as you have the text, Rumios can analyze it." },
        { q: "How does the scoring work?", a: "The AI analyzes the transcript across 6 dimensions (process, discovery, objections, posture, close, overall score) and returns a grade out of 100 with concrete recommendations for each area." },
        { q: "What is the Playground?", a: "A simulated sales call against an AI playing the prospect. You can practice as many times as you want before a real call, with nothing at stake. This feature is coming soon." },
        { q: "How much does Rumios cost?", a: "Rumios is free to start: 2 scripts and 5 call analyses per month. Plans with higher limits are coming soon." },
        { q: "Can I use Rumios without a script?", a: "Yes. Analysis works even without a reference script. But results are much more precise when the AI can compare the call to your prepared stages and objections." },
      ],
    },
    cta: {
      headline: "Your next call will be different.",
      sub: "Join the coaches and closers who stopped losing deals without understanding why.",
      button: "Get started for free",
      note: "Free to start. No credit card required.",
    },
    footer: "All rights reserved",
  },
} as const;

function FloatingNav({ lang, setLang }: { lang: Lang; setLang: (l: Lang) => void }) {
  const c = CONTENT[lang];
  return (
    <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50">
      <div className="flex items-center gap-1 bg-stone-900 text-white rounded-full px-3 py-2 shadow-2xl shadow-stone-900/30 border border-white/10">
        {/* Logo */}
        <div className="flex items-center gap-1.5 px-2 mr-1">
          <RumiosLogo size={18} inverted />
          <span className="text-[12px] font-semibold tracking-tight">RUMIOS</span>
        </div>
        <div className="w-px h-4 bg-white/10" />
        {/* Nav links */}
        {c.floatingNav.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="text-[12.5px] text-stone-300 hover:text-white px-3 py-1 rounded-full hover:bg-white/10 transition-colors"
          >
            {item.label}
          </a>
        ))}
        <div className="w-px h-4 bg-white/10" />
        {/* Lang toggle */}
        <button
          onClick={() => setLang(lang === "fr" ? "en" : "fr")}
          className="text-[11px] font-medium text-stone-400 hover:text-white px-2 py-1 rounded-full hover:bg-white/10 transition-colors"
        >
          {lang === "fr" ? "EN" : "FR"}
        </button>
        {/* CTA */}
        <SignUpButton mode="modal">
          <button className="ml-1 text-[12.5px] font-medium bg-white text-stone-900 px-3.5 py-1.5 rounded-full hover:bg-stone-100 transition-colors">
            {lang === "fr" ? "Commencer" : "Get started"}
          </button>
        </SignUpButton>
      </div>
    </div>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <button
      onClick={() => setOpen(o => !o)}
      className="w-full text-left border border-stone-200 rounded-xl overflow-hidden hover:border-stone-300 transition-colors"
    >
      <div className="flex items-center justify-between px-5 py-4 gap-4">
        <span className="text-[14px] font-medium text-stone-800">{q}</span>
        <span className="shrink-0 w-5 h-5 rounded-full bg-stone-100 flex items-center justify-center">
          {open ? <Minus className="w-3 h-3 text-stone-600" /> : <Plus className="w-3 h-3 text-stone-600" />}
        </span>
      </div>
      {open && (
        <div className="px-5 pb-4 text-[13.5px] text-stone-500 leading-relaxed border-t border-stone-100 pt-3.5 bg-stone-50/50">
          {a}
        </div>
      )}
    </button>
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
      <FloatingNav lang={lang} setLang={setLang} />

      {/* Hero */}
      <section className="pt-28 pb-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-stone-100 text-stone-600 text-[12px] font-medium px-3.5 py-1.5 rounded-full mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            {c.badge}
          </div>
          <h1 className="text-[52px] font-bold tracking-tight leading-[1.1] mb-5">
            <span className="text-stone-900">{c.hero.headline.split(". ")[0]}.</span>
            {" "}
            <span className="text-stone-400">{c.hero.headline.split(". ")[1]}</span>
          </h1>
          <p className="text-[17px] text-stone-500 max-w-xl mx-auto leading-relaxed mb-9">
            {c.hero.sub}
          </p>
          <div className="flex items-center justify-center gap-3">
            <SignUpButton mode="modal">
              <button className="flex items-center gap-2 bg-stone-900 text-white text-[14px] font-medium px-6 py-2.5 rounded-lg hover:bg-stone-700 transition-colors">
                {c.hero.cta} <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </SignUpButton>
            <SignInButton mode="modal">
              <button className="text-[14px] text-stone-500 hover:text-stone-900 px-5 py-2.5 rounded-lg border border-stone-200 hover:border-stone-300 transition-colors">
                {c.hero.ctaSecondary}
              </button>
            </SignInButton>
          </div>
        </div>

        {/* Score card */}
        <div className="max-w-xl mx-auto mt-14">
          <div className="bg-white rounded-2xl border border-stone-200 shadow-xl overflow-hidden">
            <div className="bg-stone-900 px-5 py-4 flex items-start justify-between">
              <div>
                <p className="text-[11px] font-medium text-stone-500 uppercase tracking-widest">{c.mockCard.label}</p>
                <p className="text-[14px] font-medium text-white mt-1">{c.mockCard.subtitle}</p>
              </div>
              <div className="text-right shrink-0">
                <div className="text-[44px] font-bold text-emerald-400 leading-none">78</div>
                <p className="text-[11px] text-stone-500 mt-0.5">{c.mockCard.scoreLabel}</p>
              </div>
            </div>
            <div className="px-5 py-4 grid grid-cols-3 gap-3 border-b border-stone-100">
              {c.mockCard.items.map((item, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-stone-500">{item.label}</span>
                    <span className="text-[11px] font-semibold text-stone-700">{item.score}{"suffix" in item ? item.suffix : ""}</span>
                  </div>
                  <div className="h-1 bg-stone-100 rounded-full overflow-hidden">
                    <div className={cn("h-full rounded-full", item.color)} style={{ width: `${item.score}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="px-5 py-3 space-y-2">
              {c.mockCard.insights.map((ins, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className={cn("mt-0.5 w-4 h-4 rounded-full text-white text-[9px] font-bold flex items-center justify-center shrink-0", ins.type === "good" ? "bg-emerald-500" : "bg-amber-400")}>
                    {ins.type === "good" ? "✓" : "!"}
                  </span>
                  <span className="text-[12px] text-stone-600 leading-snug">{ins.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="py-20 px-6 bg-stone-50 border-y border-stone-100">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-widest mb-4">{c.problem.label}</p>
          <h2 className="text-[34px] font-bold tracking-tight leading-tight mb-4">{c.problem.headline}</h2>
          <p className="text-[15px] text-stone-500 leading-relaxed max-w-xl mx-auto mb-10">{c.problem.sub}</p>
          <div className="grid grid-cols-3 gap-4 text-left">
            {c.problem.pains.map((item, i) => (
              <div key={i} className="bg-white border border-stone-200 rounded-xl p-5 shadow-sm">
                <p className="text-[13.5px] font-semibold text-stone-800 mb-1.5">{item.title}</p>
                <p className="text-[12.5px] text-stone-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-widest mb-3">{c.features.label}</p>
            <h2 className="text-[34px] font-bold tracking-tight">{c.features.headline}</h2>
          </div>
          <div className="grid grid-cols-2 gap-5">
            {c.features.items.map((f) => (
              <div key={f.title} className="bg-white border border-stone-200 rounded-2xl p-6 flex flex-col gap-4 hover:border-stone-300 hover:shadow-sm transition-all">
                <div className="flex items-start justify-between">
                  <div className="w-9 h-9 bg-stone-100 rounded-lg flex items-center justify-center">
                    <f.icon className="w-[18px] h-[18px] text-stone-600" />
                  </div>
                  <span className={cn("text-[11px] font-medium px-2.5 py-1 rounded-full", f.tagColor)}>{f.tag}</span>
                </div>
                <div>
                  <h3 className="text-[14.5px] font-semibold text-stone-900 mb-2 leading-snug">{f.title}</h3>
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
          <div className="text-center mb-10">
            <p className="text-[11px] font-semibold text-stone-500 uppercase tracking-widest mb-3">{c.metrics.label}</p>
            <h2 className="text-[32px] font-bold tracking-tight mb-3">{c.metrics.headline}</h2>
            <p className="text-[15px] text-stone-400 max-w-lg mx-auto">{c.metrics.sub}</p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {c.metrics.items.map((m) => (
              <div key={m.label} className="bg-white/5 border border-white/8 rounded-xl p-5 flex items-start gap-3">
                <div className="w-8 h-8 bg-white/8 rounded-lg flex items-center justify-center shrink-0">
                  <m.icon className="w-4 h-4 text-stone-400" />
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-white">{m.label}</p>
                  <p className="text-[12px] text-stone-500 mt-0.5 leading-relaxed">{m.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-widest mb-3">{c.steps.label}</p>
            <h2 className="text-[34px] font-bold tracking-tight">{c.steps.headline}</h2>
          </div>
          <div className="space-y-3">
            {c.steps.items.map((step) => (
              <div key={step.number} className="flex items-start gap-6 px-7 py-6 bg-white border border-stone-200 rounded-2xl hover:border-stone-300 transition-colors">
                <span className="text-[36px] font-bold text-stone-100 leading-none tabular-nums shrink-0 mt-0.5">{step.number}</span>
                <div>
                  <h3 className="text-[15px] font-semibold text-stone-900 mb-1.5">{step.title}</h3>
                  <p className="text-[13.5px] text-stone-500 leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For who */}
      <section className="py-20 px-6 bg-stone-50 border-y border-stone-100">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-widest mb-3">{c.profiles.label}</p>
            <h2 className="text-[32px] font-bold tracking-tight">{c.profiles.headline}</h2>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {c.profiles.items.map((p) => (
              <div key={p.title} className="bg-white border border-stone-200 rounded-2xl p-6">
                <div className="text-2xl mb-3">{p.emoji}</div>
                <h3 className="text-[14.5px] font-semibold text-stone-900 mb-2">{p.title}</h3>
                <p className="text-[13px] text-stone-500 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-widest mb-3">{c.faq.label}</p>
            <h2 className="text-[34px] font-bold tracking-tight">{c.faq.headline}</h2>
          </div>
          <div className="space-y-2">
            {c.faq.items.map((item, i) => (
              <FaqItem key={i} q={item.q} a={item.a} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-28 px-6 bg-stone-50 border-t border-stone-100">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-[40px] font-bold tracking-tight leading-tight mb-4">{c.cta.headline}</h2>
          <p className="text-[15px] text-stone-500 leading-relaxed mb-7">{c.cta.sub}</p>
          <SignUpButton mode="modal">
            <button className="inline-flex items-center gap-2 bg-stone-900 text-white text-[14px] font-medium px-7 py-3 rounded-lg hover:bg-stone-700 transition-colors">
              {c.cta.button} <ArrowRight className="w-4 h-4" />
            </button>
          </SignUpButton>
          <p className="text-[12px] text-stone-400 mt-4">{c.cta.note}</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-stone-100 py-7 px-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between text-[12px] text-stone-400">
          <div className="flex items-center gap-2">
            <RumiosLogo size={18} />
            <span className="font-medium text-stone-500">RUMIOS</span>
            <span className="text-stone-300">·</span>
            <span>rumios.ai</span>
          </div>
          <p>© 2026 · {c.footer}</p>
        </div>
      </footer>
    </div>
  );
}
