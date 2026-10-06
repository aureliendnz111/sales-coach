"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, FileText, Headphones, PhoneCall, Swords, TrendingUp, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Lang } from "@/lib/lang-context";
import { AnalysisMockup, CopilotMockup, PlaygroundMockup, ProgressMockup, ScriptBuilderMockup } from "./mockups";

type CategoryId = "prepare" | "practice" | "analyze" | "progress" | "live";

type CategoryCopy = { label: string; feature: string; title: string; desc: string; bullets: [string, string, string] };

const CATEGORIES: {
  id: CategoryId;
  icon: LucideIcon;
  soon?: boolean;
  accent: { chip: string; icon: string; pill: string };
  Mockup: (p: { lang: Lang }) => React.ReactElement;
  copy: Record<Lang, CategoryCopy>;
}[] = [
  {
    id: "prepare", icon: FileText, Mockup: ScriptBuilderMockup,
    accent: { chip: "bg-violet-50", icon: "text-violet-600", pill: "bg-violet-50 text-violet-700 ring-violet-200" },
    copy: {
      fr: { label: "Préparer", feature: "Script Builder", title: "Votre process de vente, enfin formalisé.", desc: "Partez d'un template éprouvé ou laissez l'IA structurer votre offre. Étapes, questions clés et réponses aux objections : tout est prêt avant l'appel.", bullets: ["Templates par secteur, personnalisables en minutes", "Étapes chronométrées avec objectifs et questions clés", "Bibliothèque d'objections avec recadrages"] },
      en: { label: "Prepare", feature: "Script Builder", title: "Your sales process, finally written down.", desc: "Start from a proven template or let AI structure your offer. Stages, key questions and objection responses: everything is ready before the call.", bullets: ["Industry templates you can tailor in minutes", "Timed stages with goals and key questions", "Objection library with reframes"] },
      pt: { label: "Preparar", feature: "Script Builder", title: "O seu processo de vendas, finalmente formalizado.", desc: "Parta de um modelo comprovado ou deixe a IA estruturar a sua oferta. Etapas, perguntas-chave e respostas às objeções: tudo pronto antes da chamada.", bullets: ["Modelos por setor, personalizáveis em minutos", "Etapas cronometradas com objetivos e perguntas-chave", "Biblioteca de objeções com recadragens"] },
    },
  },
  {
    id: "practice", icon: Swords, Mockup: PlaygroundMockup,
    accent: { chip: "bg-sky-50", icon: "text-sky-600", pill: "bg-sky-50 text-sky-700 ring-sky-200" },
    copy: {
      fr: { label: "S'entraîner", feature: "Playground", title: "Répétez face à un prospect IA, sans enjeu.", desc: "Choisissez un persona, lancez l'appel à la voix et entraînez-vous sur votre script. Le prospect objecte, hésite, relance — comme en vrai.", bullets: ["4 personas réalistes (B2B, tech, B2C…)", "Appel vocal avec votre script affiché en direct", "Questions du script cochées au fil de l'appel"] },
      en: { label: "Practice", feature: "Playground", title: "Rehearse against an AI prospect, risk-free.", desc: "Pick a persona, start a voice call and practice on your own script. The prospect objects, hesitates and pushes back — just like the real thing.", bullets: ["4 realistic personas (B2B, tech, B2C…)", "Voice call with your script shown live", "Script questions checked off as you go"] },
      pt: { label: "Treinar", feature: "Playground", title: "Ensaie com um prospeto IA, sem riscos.", desc: "Escolha uma persona, inicie a chamada por voz e treine com o seu guião. O prospeto objeta, hesita e insiste — como na realidade.", bullets: ["4 personas realistas (B2B, tech, B2C…)", "Chamada por voz com o seu guião em direto", "Perguntas do guião assinaladas ao longo da chamada"] },
    },
  },
  {
    id: "analyze", icon: PhoneCall, Mockup: AnalysisMockup,
    accent: { chip: "bg-emerald-50", icon: "text-emerald-600", pill: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
    copy: {
      fr: { label: "Analyser", feature: "Analyse de call", title: "Sachez exactement ce qui a fait signer — ou décrocher.", desc: "Collez le transcript de votre appel. En quelques secondes : un score sur 100, les moments clés annotés et trois actions concrètes pour le prochain call.", bullets: ["Score sur 6 dimensions, comparé à votre script", "Moments clés du transcript annotés par l'IA", "Temps de parole et 3 actions prioritaires"] },
      en: { label: "Analyze", feature: "Call Analysis", title: "Know exactly what closed the deal — or lost it.", desc: "Paste your call transcript. Within seconds: a score out of 100, annotated key moments and three concrete actions for the next call.", bullets: ["Score across 6 dimensions, checked against your script", "Key transcript moments annotated by AI", "Talk ratio and 3 priority actions"] },
      pt: { label: "Analisar", feature: "Análise de chamada", title: "Saiba exatamente o que fez fechar — ou perder.", desc: "Cole o transcript da sua chamada. Em segundos: uma pontuação em 100, os momentos-chave anotados e três ações concretas para a próxima chamada.", bullets: ["Pontuação em 6 dimensões, comparada com o seu guião", "Momentos-chave do transcript anotados pela IA", "Tempo de fala e 3 ações prioritárias"] },
    },
  },
  {
    id: "progress", icon: TrendingUp, Mockup: ProgressMockup,
    accent: { chip: "bg-amber-50", icon: "text-amber-600", pill: "bg-amber-50 text-amber-700 ring-amber-200" },
    copy: {
      fr: { label: "Progresser", feature: "Dashboard", title: "Mesurez vos progrès, call après call.", desc: "Votre score moyen, vos résultats et vos axes faibles réunis sur un seul écran. Vous savez où vous en êtes et sur quoi travailler cette semaine.", bullets: ["Score moyen et évolution dans le temps", "Historique de vos calls et de leurs résultats", "Votre axe faible récurrent mis en avant"] },
      en: { label: "Improve", feature: "Dashboard", title: "Track your progress, call after call.", desc: "Your average score, outcomes and weak spots on a single screen. You know where you stand and what to work on this week.", bullets: ["Average score and trend over time", "History of your calls and their outcomes", "Your recurring weak spot highlighted"] },
      pt: { label: "Progredir", feature: "Dashboard", title: "Meça o seu progresso, chamada após chamada.", desc: "A sua pontuação média, resultados e pontos fracos num único ecrã. Sabe onde está e no que trabalhar esta semana.", bullets: ["Pontuação média e evolução ao longo do tempo", "Histórico das chamadas e respetivos resultados", "O seu ponto fraco recorrente em destaque"] },
    },
  },
  {
    id: "live", icon: Headphones, Mockup: CopilotMockup, soon: true,
    accent: { chip: "bg-fuchsia-50", icon: "text-fuchsia-600", pill: "bg-fuchsia-50 text-fuchsia-700 ring-fuchsia-200" },
    copy: {
      fr: { label: "En direct", feature: "Live Copilot", title: "La bonne réponse, au bon moment, pendant l'appel.", desc: "Rumios écoute votre appel, suit votre progression dans le script et vous souffle une réponse dès qu'une objection apparaît.", bullets: ["Détection des objections en temps réel", "Réponses tirées de votre propre script", "Suivi de l'étape en cours, discret à l'écran"] },
      en: { label: "Live", feature: "Live Copilot", title: "The right answer, at the right time, during the call.", desc: "Rumios listens to your call, tracks where you are in your script and suggests a reply the moment an objection comes up.", bullets: ["Real-time objection detection", "Replies drawn from your own script", "Current-stage tracking, discreet on screen"] },
      pt: { label: "Em direto", feature: "Live Copilot", title: "A resposta certa, no momento certo, durante a chamada.", desc: "O Rumios ouve a sua chamada, acompanha a sua posição no guião e sugere uma resposta assim que surge uma objeção.", bullets: ["Deteção de objeções em tempo real", "Respostas retiradas do seu próprio guião", "Acompanhamento da etapa atual, discreto no ecrã"] },
    },
  },
];

const UI: Record<Lang, { label: string; headline: string; sub: string; available: string; soon: string; cta: string; note: string }> = {
  fr: { label: "Fonctionnalités", headline: "Un seul outil, de la préparation au closing.", sub: "Cinq modules, un par moment de votre cycle de vente.", available: "Disponible", soon: "Bientôt", cta: "Essayer gratuitement", note: "Gratuit · Sans carte bancaire" },
  en: { label: "Features", headline: "One tool, from prep to close.", sub: "Five modules, one for each moment of your sales cycle.", available: "Available", soon: "Coming soon", cta: "Try for free", note: "Free · No credit card required" },
  pt: { label: "Funcionalidades", headline: "Uma só ferramenta, da preparação ao fecho.", sub: "Cinco módulos, um para cada momento do seu ciclo de vendas.", available: "Disponível", soon: "Em breve", cta: "Experimentar gratuitamente", note: "Grátis · Sem cartão de crédito" },
};

export function FeatureShowcase({ lang }: { lang: Lang }) {
  const ui = UI[lang];
  const [active, setActive] = useState<CategoryId>(CATEGORIES[0].id);
  const chipRefs = useRef<Partial<Record<CategoryId, HTMLAnchorElement | null>>>({});

  // Highlight the chip of the category currently in view
  useEffect(() => {
    const els = CATEGORIES.map(c => document.getElementById(`feature-${c.id}`)).filter((el): el is HTMLElement => !!el);
    const obs = new IntersectionObserver(
      entries => {
        const hit = entries.filter(e => e.isIntersecting)[0];
        if (hit) setActive(hit.target.id.replace("feature-", "") as CategoryId);
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  function goTo(e: React.MouseEvent<HTMLAnchorElement>, id: CategoryId) {
    const target = document.getElementById(`feature-${id}`);
    if (!target) return;
    e.preventDefault();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // scroll-mt on the target leaves room for the floating nav
    target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    history.replaceState(null, "", `#feature-${id}`);
    setActive(id);
  }

  // Keep the active chip visible in the horizontally scrollable bar (mobile)
  useEffect(() => {
    const chip = chipRefs.current[active];
    const bar = chip?.parentElement;
    if (chip && bar && bar.scrollWidth > bar.clientWidth) {
      bar.scrollTo({ left: chip.offsetLeft - bar.clientWidth / 2 + chip.clientWidth / 2, behavior: "smooth" });
    }
  }, [active]);

  return (
    <section id="features" className="py-14 px-5 md:py-24 md:px-6 scroll-mt-20">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8 md:mb-10">
          <p className="text-[11px] font-semibold text-violet-500 uppercase tracking-widest mb-3">{ui.label}</p>
          <h2 className="text-[26px] md:text-[34px] font-bold tracking-tight text-balance">{ui.headline}</h2>
          <p className="text-[14px] md:text-[15px] text-stone-500 mt-3 max-w-xl mx-auto">{ui.sub}</p>
        </div>

        {/* Sticky category bar */}
        <div className="flex justify-center mb-6 md:mb-10 -mx-5 px-5 md:mx-0 md:px-0">
          <nav
            aria-label={ui.label}
            className="flex gap-1 overflow-x-auto max-w-full bg-white border border-stone-200 rounded-full p-1 shadow-lg shadow-stone-900/10 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {CATEGORIES.map((c, i) => {
              const selected = c.id === active;
              const Icon = c.icon;
              return (
                <a
                  key={c.id}
                  ref={el => { chipRefs.current[c.id] = el; }}
                  href={`#feature-${c.id}`}
                  onClick={e => goTo(e, c.id)}
                  aria-current={selected ? "true" : undefined}
                  className={cn(
                    "shrink-0 flex items-center gap-1.5 rounded-full pl-2 pr-3 py-1.5 text-[12.5px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500",
                    selected ? "bg-stone-900 text-white" : "text-stone-500 hover:text-stone-900 hover:bg-stone-100"
                  )}
                >
                  <span className={cn("w-5 h-5 rounded-full flex items-center justify-center", selected ? "bg-white/15" : c.accent.chip)}>
                    <Icon className={cn("w-3 h-3", selected ? "text-white" : c.accent.icon)} />
                  </span>
                  <span className="tabular-nums text-[10.5px] opacity-50">0{i + 1}</span>
                  {c.copy[lang].label}
                </a>
              );
            })}
          </nav>
        </div>

        {/* One block per category, all visible */}
        <div className="space-y-6 md:space-y-8">
          {CATEGORIES.map((cat, i) => {
            const copy = cat.copy[lang];
            const Mockup = cat.Mockup;
            const flip = i % 2 === 1;
            return (
              <article
                key={cat.id}
                id={`feature-${cat.id}`}
                aria-labelledby={`feature-title-${cat.id}`}
                className="scroll-mt-24 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center bg-violet-500/[0.04] border border-violet-100 rounded-3xl p-5 sm:p-8 md:p-10"
              >
                <div className={cn("lg:col-span-5 xl:col-span-4", flip && "lg:order-2")}>
                  <div className="flex flex-wrap items-center gap-x-2.5 gap-y-2 mb-4">
                    <span className={cn("w-9 h-9 rounded-xl flex items-center justify-center", cat.accent.chip)}>
                      <cat.icon className={cn("w-[18px] h-[18px]", cat.accent.icon)} />
                    </span>
                    <span className={cn("text-[13px] font-bold uppercase tracking-wider", cat.accent.icon)}>{copy.label}</span>
                    <span className={cn("text-[13px] font-semibold px-3 py-1 rounded-full ring-1", cat.accent.pill)}>{copy.feature}</span>
                    <span className={cn("flex items-center gap-1 text-[11px] font-medium", cat.soon ? "text-stone-400" : "text-emerald-600")}>
                      <span className={cn("w-1.5 h-1.5 rounded-full", cat.soon ? "bg-stone-300" : "bg-emerald-500")} />
                      {cat.soon ? ui.soon : ui.available}
                    </span>
                  </div>
                  <h3 id={`feature-title-${cat.id}`} className="text-[22px] md:text-[28px] font-bold tracking-tight leading-tight text-stone-900 text-balance">{copy.title}</h3>
                  <p className="text-[14px] text-stone-500 leading-relaxed mt-3">{copy.desc}</p>
                  <ul className="mt-5 space-y-2.5">
                    {copy.bullets.map(b => (
                      <li key={b} className="flex items-start gap-2.5 text-[13.5px] text-stone-700">
                        <span className="mt-0.5 w-4 h-4 rounded-full bg-violet-100 flex items-center justify-center shrink-0">
                          <Check className="w-2.5 h-2.5 text-violet-600" />
                        </span>
                        {b}
                      </li>
                    ))}
                  </ul>
                  {!cat.soon && (
                    <Link href="/sign-up" className="mt-7 inline-flex items-center gap-1.5 text-[14px] font-semibold text-violet-600 hover:text-violet-700 group">
                      {ui.cta} <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  )}
                </div>

                <div className={cn("lg:col-span-7 xl:col-span-8 relative min-w-0", flip && "lg:order-1")}>
                  <div className="absolute -inset-4 bg-[radial-gradient(ellipse_at_center,rgba(124,58,237,0.10),transparent_70%)] pointer-events-none" aria-hidden />
                  <div className="relative">
                    <Mockup lang={lang} />
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <div className="text-center mt-10 md:mt-12">
          <Link href="/sign-up" className="inline-flex items-center gap-2 bg-violet-600 text-white text-[14px] font-semibold px-6 py-3 rounded-lg hover:bg-violet-500 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-violet-900/30 transition-all">
            {ui.cta} <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <p className="text-[12px] text-stone-400 mt-2.5">{ui.note}</p>
        </div>
      </div>
    </section>
  );
}
