"use client";
import { SignInButton, SignUpButton, useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { PhoneCall, FileText, Zap, CheckCircle2, TrendingUp, BarChart2, ArrowRight, Mic, Target, Brain } from "lucide-react";
import { cn } from "@/lib/utils";

function Navbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm border-b border-stone-100">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-stone-900 rounded-md flex items-center justify-center">
            <span className="text-white text-[10px] font-bold">R</span>
          </div>
          <span className="font-semibold text-[13.5px] text-stone-900">ceciestuntest.com</span>
        </div>
        <div className="flex items-center gap-3">
          <SignInButton mode="modal">
            <button className="text-[13px] text-stone-600 hover:text-stone-900 transition-colors px-3 py-1.5 rounded-lg hover:bg-stone-100">
              Se connecter
            </button>
          </SignInButton>
          <SignUpButton mode="modal">
            <button className="text-[13px] font-medium bg-stone-900 text-white px-4 py-1.5 rounded-lg hover:bg-stone-700 transition-colors">
              Essayer gratuitement
            </button>
          </SignUpButton>
        </div>
      </div>
    </header>
  );
}

const FEATURES = [
  {
    icon: FileText,
    title: "Script Builder IA",
    description: "Construisez votre process de vente étape par étape. L'IA structure vos arguments, anticipe les objections et génère un script complet en quelques minutes.",
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
];

const METRICS = [
  { icon: Target, label: "Process respecté", desc: "Suivez chaque étape de votre script" },
  { icon: Brain, label: "Découverte qualité", desc: "Mesure la profondeur de qualification" },
  { icon: Mic, label: "Posture & énergie", desc: "Votre ton, votre confiance, votre autorité" },
  { icon: TrendingUp, label: "Taux de closing", desc: "Trackez votre progression sur la durée" },
  { icon: BarChart2, label: "Gestion objections", desc: "Détecte et évalue chaque traitement" },
  { icon: CheckCircle2, label: "Score global", desc: "Une note claire après chaque appel" },
];

const STEPS = [
  {
    number: "01",
    title: "Créez votre script",
    description: "Décrivez votre offre et votre process. L'IA génère un script structuré avec les étapes, les questions clés et les réponses aux objections courantes.",
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
];

const PROFILES = [
  { emoji: "🎯", title: "Closers indépendants", desc: "Vous vendez pour vous-même ou pour des clients. Chaque call compte — analysez chacun pour ne plus laisser de deal sur la table." },
  { emoji: "🧑‍💼", title: "Coachs en vente", desc: "Vous formez d'autres commerciaux. Donnez à vos élèves un feedback objectif et mesurable sur chaque appel qu'ils font." },
  { emoji: "🚀", title: "Entrepreneurs & freelances", desc: "Vous avez un super produit mais la vente n'est pas votre domaine naturel. Structurez vos calls et progressez vite." },
];

export default function HomePage() {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && isSignedIn) router.push("/dashboard");
  }, [isLoaded, isSignedIn, router]);

  return (
    <div className="bg-white text-stone-900 min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-stone-100 text-stone-600 text-[12px] font-medium px-3.5 py-1.5 rounded-full mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Script Builder & Analyse de calls disponibles
          </div>
          <h1 className="text-[56px] font-bold tracking-tight leading-[1.1] text-stone-900 mb-6">
            Closez plus.
            <br />
            <span className="text-stone-400">Perdez moins.</span>
          </h1>
          <p className="text-[18px] text-stone-500 max-w-2xl mx-auto leading-relaxed mb-10">
            L'IA qui analyse vos appels de vente, score vos performances et vous dit exactement quoi améliorer — pour que chaque call vous rende meilleur que le précédent.
          </p>
          <div className="flex items-center justify-center gap-3">
            <SignUpButton mode="modal">
              <button className="flex items-center gap-2 bg-stone-900 text-white text-[14px] font-medium px-6 py-3 rounded-xl hover:bg-stone-700 transition-colors shadow-sm">
                Commencer gratuitement <ArrowRight className="w-4 h-4" />
              </button>
            </SignUpButton>
            <SignInButton mode="modal">
              <button className="text-[14px] text-stone-500 hover:text-stone-900 px-6 py-3 rounded-xl border border-stone-200 hover:border-stone-300 transition-colors">
                Se connecter
              </button>
            </SignInButton>
          </div>
        </div>

        {/* Score preview card */}
        <div className="max-w-2xl mx-auto mt-16">
          <div className="bg-white border border-stone-200 rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-stone-900 px-6 py-4 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">Analyse IA — Call avec Marie D.</p>
                <p className="text-white font-semibold mt-0.5">Découverte + Closing — 47 min</p>
              </div>
              <div className="text-right">
                <div className="text-[42px] font-bold text-emerald-400 leading-none">78</div>
                <p className="text-[11px] text-stone-400">Score global</p>
              </div>
            </div>
            <div className="px-6 py-4 grid grid-cols-3 gap-4 border-b border-stone-100">
              {[
                { label: "Process", score: 82, color: "bg-emerald-500" },
                { label: "Découverte", score: 75, color: "bg-emerald-500" },
                { label: "Objections", score: 68, color: "bg-amber-400" },
                { label: "Posture", score: 85, color: "bg-emerald-500" },
                { label: "Conclusion", score: 70, color: "bg-amber-400" },
                { label: "Talk ratio", score: 42, color: "bg-sky-500", label2: "% coach" },
              ].map((item, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-stone-500">{item.label}</span>
                    <span className="text-[12px] font-semibold text-stone-800">{item.score}{item.label2 ? "%" : ""}</span>
                  </div>
                  <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
                    <div className={cn("h-full rounded-full", item.color)} style={{ width: `${item.score}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="px-6 py-3.5 flex gap-6 text-[12px]">
              <div className="flex items-start gap-2">
                <span className="mt-0.5 w-4 h-4 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center shrink-0">✓</span>
                <span className="text-stone-600">Excellente phase de découverte — tu as bien cerné les douleurs</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="mt-0.5 w-4 h-4 rounded-full bg-amber-400 text-white text-[10px] font-bold flex items-center justify-center shrink-0">!</span>
                <span className="text-stone-600">L'objection prix n'a pas été recadrée — à travailler</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="py-20 px-6 bg-stone-50 border-y border-stone-100">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <p className="text-[12px] font-semibold text-stone-400 uppercase tracking-widest">Le problème</p>
          <h2 className="text-[36px] font-bold tracking-tight leading-tight">
            Vous sortez de chaque call sans savoir<br />ce qui a vraiment bloqué.
          </h2>
          <p className="text-[16px] text-stone-500 leading-relaxed max-w-2xl mx-auto">
            Pas de feedback objectif. Pas de données. Juste votre ressenti — et souvent, votre ressenti vous ment. Résultat : vous répétez les mêmes erreurs, call après call.
          </p>
          <div className="grid grid-cols-3 gap-4 pt-6 text-left max-w-2xl mx-auto">
            {[
              "Vous ne savez pas pourquoi un prospect a décroché",
              "Votre script existe dans votre tête mais pas vraiment ailleurs",
              "Vous n'avez aucune mesure objective de vos progrès",
            ].map((item, i) => (
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
            <p className="text-[12px] font-semibold text-stone-400 uppercase tracking-widest mb-3">La solution</p>
            <h2 className="text-[36px] font-bold tracking-tight">Trois outils. Un seul objectif : signer plus.</h2>
          </div>
          <div className="grid grid-cols-3 gap-6">
            {FEATURES.map((f) => (
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
            <p className="text-[12px] font-semibold text-stone-400 uppercase tracking-widest mb-3">Ce qu'on mesure</p>
            <h2 className="text-[32px] font-bold tracking-tight">Un score sur 6 dimensions,<br />pour savoir exactement où progresser.</h2>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {METRICS.map((m) => (
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
            <p className="text-[12px] font-semibold text-stone-400 uppercase tracking-widest mb-3">Comment ça marche</p>
            <h2 className="text-[36px] font-bold tracking-tight">Opérationnel en 10 minutes.</h2>
          </div>
          <div className="space-y-6">
            {STEPS.map((step, i) => (
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
            <p className="text-[12px] font-semibold text-stone-400 uppercase tracking-widest mb-3">Pour qui ?</p>
            <h2 className="text-[32px] font-bold tracking-tight">Fait pour ceux qui vendent<br />par eux-mêmes.</h2>
          </div>
          <div className="grid grid-cols-3 gap-5">
            {PROFILES.map((p) => (
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
            Votre prochain call<br />sera meilleur que le dernier.
          </h2>
          <p className="text-[16px] text-stone-500 leading-relaxed">
            Rejoignez les coachs et closers qui utilisent l'IA pour progresser à chaque appel. Gratuit pour commencer.
          </p>
          <SignUpButton mode="modal">
            <button className="inline-flex items-center gap-2 bg-stone-900 text-white text-[15px] font-medium px-8 py-3.5 rounded-xl hover:bg-stone-700 transition-colors shadow-sm">
              Commencer gratuitement <ArrowRight className="w-4 h-4" />
            </button>
          </SignUpButton>
          <p className="text-[12px] text-stone-400">Aucune carte bancaire requise · Accès immédiat</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-stone-100 py-8 px-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between text-[12px] text-stone-400">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-stone-900 rounded-md flex items-center justify-center">
              <span className="text-white text-[9px] font-bold">R</span>
            </div>
            <span>ceciestuntest.com</span>
          </div>
          <p>© 2026 · Tous droits réservés</p>
        </div>
      </footer>
    </div>
  );
}
