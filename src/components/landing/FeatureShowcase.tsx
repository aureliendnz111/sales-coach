"use client";
import { useRef, useState } from "react";
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
  accent: { chip: string; icon: string };
  Mockup: (p: { lang: Lang }) => React.ReactElement;
  copy: Record<Lang, CategoryCopy>;
}[] = [
  {
    id: "prepare", icon: FileText, Mockup: ScriptBuilderMockup,
    accent: { chip: "bg-violet-50", icon: "text-violet-600" },
    copy: {
      fr: { label: "Préparer", feature: "Script Builder", title: "Votre process de vente, enfin formalisé.", desc: "Partez d'un template éprouvé ou laissez l'IA structurer votre offre. Étapes, questions clés et réponses aux objections : tout est prêt avant l'appel.", bullets: ["Templates par secteur, personnalisables en minutes", "Étapes chronométrées avec objectifs et questions clés", "Bibliothèque d'objections avec recadrages"] },
      en: { label: "Prepare", feature: "Script Builder", title: "Your sales process, finally written down.", desc: "Start from a proven template or let AI structure your offer. Stages, key questions and objection responses: everything is ready before the call.", bullets: ["Industry templates you can tailor in minutes", "Timed stages with goals and key questions", "Objection library with reframes"] },
      pt: { label: "Preparar", feature: "Script Builder", title: "O seu processo de vendas, finalmente formalizado.", desc: "Parta de um modelo comprovado ou deixe a IA estruturar a sua oferta. Etapas, perguntas-chave e respostas às objeções: tudo pronto antes da chamada.", bullets: ["Modelos por setor, personalizáveis em minutos", "Etapas cronometradas com objetivos e perguntas-chave", "Biblioteca de objeções com recadragens"] },
    },
  },
  {
    id: "practice", icon: Swords, Mockup: PlaygroundMockup,
    accent: { chip: "bg-sky-50", icon: "text-sky-600" },
    copy: {
      fr: { label: "S'entraîner", feature: "Playground", title: "Répétez face à un prospect IA, sans enjeu.", desc: "Choisissez un persona, lancez l'appel à la voix et entraînez-vous sur votre script. Le prospect objecte, hésite, relance — comme en vrai.", bullets: ["4 personas réalistes (B2B, tech, B2C…)", "Appel vocal avec votre script affiché en direct", "Objections signalées au moment où elles arrivent"] },
      en: { label: "Practice", feature: "Playground", title: "Rehearse against an AI prospect, risk-free.", desc: "Pick a persona, start a voice call and practice on your own script. The prospect objects, hesitates and pushes back — just like the real thing.", bullets: ["4 realistic personas (B2B, tech, B2C…)", "Voice call with your script shown live", "Objections flagged the moment they come up"] },
      pt: { label: "Treinar", feature: "Playground", title: "Ensaie com um prospeto IA, sem riscos.", desc: "Escolha uma persona, inicie a chamada por voz e treine com o seu guião. O prospeto objeta, hesita e insiste — como na realidade.", bullets: ["4 personas realistas (B2B, tech, B2C…)", "Chamada por voz com o seu guião em direto", "Objeções sinalizadas no momento em que surgem"] },
    },
  },
  {
    id: "analyze", icon: PhoneCall, Mockup: AnalysisMockup,
    accent: { chip: "bg-emerald-50", icon: "text-emerald-600" },
    copy: {
      fr: { label: "Analyser", feature: "Analyse de call", title: "Sachez exactement ce qui a fait signer — ou décrocher.", desc: "Collez le transcript de votre appel. En quelques secondes : un score sur 100, les moments clés annotés et trois actions concrètes pour le prochain call.", bullets: ["Score sur 6 dimensions, comparé à votre script", "Moments clés du transcript annotés par l'IA", "Temps de parole et 3 actions prioritaires"] },
      en: { label: "Analyze", feature: "Call Analysis", title: "Know exactly what closed the deal — or lost it.", desc: "Paste your call transcript. Within seconds: a score out of 100, annotated key moments and three concrete actions for the next call.", bullets: ["Score across 6 dimensions, checked against your script", "Key transcript moments annotated by AI", "Talk ratio and 3 priority actions"] },
      pt: { label: "Analisar", feature: "Análise de chamada", title: "Saiba exatamente o que fez fechar — ou perder.", desc: "Cole o transcript da sua chamada. Em segundos: uma pontuação em 100, os momentos-chave anotados e três ações concretas para a próxima chamada.", bullets: ["Pontuação em 6 dimensões, comparada com o seu guião", "Momentos-chave do transcript anotados pela IA", "Tempo de fala e 3 ações prioritárias"] },
    },
  },
  {
    id: "progress", icon: TrendingUp, Mockup: ProgressMockup,
    accent: { chip: "bg-amber-50", icon: "text-amber-600" },
    copy: {
      fr: { label: "Progresser", feature: "Dashboard", title: "Mesurez vos progrès, call après call.", desc: "Votre score moyen, vos résultats et vos axes faibles réunis sur un seul écran. Vous savez où vous en êtes et sur quoi travailler cette semaine.", bullets: ["Score moyen et évolution dans le temps", "Historique de vos calls et de leurs résultats", "Votre axe faible récurrent mis en avant"] },
      en: { label: "Improve", feature: "Dashboard", title: "Track your progress, call after call.", desc: "Your average score, outcomes and weak spots on a single screen. You know where you stand and what to work on this week.", bullets: ["Average score and trend over time", "History of your calls and their outcomes", "Your recurring weak spot highlighted"] },
      pt: { label: "Progredir", feature: "Dashboard", title: "Meça o seu progresso, chamada após chamada.", desc: "A sua pontuação média, resultados e pontos fracos num único ecrã. Sabe onde está e no que trabalhar esta semana.", bullets: ["Pontuação média e evolução ao longo do tempo", "Histórico das chamadas e respetivos resultados", "O seu ponto fraco recorrente em destaque"] },
    },
  },
  {
    id: "live", icon: Headphones, Mockup: CopilotMockup, soon: true,
    accent: { chip: "bg-fuchsia-50", icon: "text-fuchsia-600" },
    copy: {
      fr: { label: "En direct", feature: "Live Copilot", title: "La bonne réponse, au bon moment, pendant l'appel.", desc: "Rumios écoute votre appel, suit votre progression dans le script et vous souffle une réponse dès qu'une objection apparaît.", bullets: ["Détection des objections en temps réel", "Réponses tirées de votre propre script", "Suivi de l'étape en cours, discret à l'écran"] },
      en: { label: "Live", feature: "Live Copilot", title: "The right answer, at the right time, during the call.", desc: "Rumios listens to your call, tracks where you are in your script and suggests a reply the moment an objection comes up.", bullets: ["Real-time objection detection", "Replies drawn from your own script", "Current-stage tracking, discreet on screen"] },
      pt: { label: "Em direto", feature: "Live Copilot", title: "A resposta certa, no momento certo, durante a chamada.", desc: "O Rumios ouve a sua chamada, acompanha a sua posição no guião e sugere uma resposta assim que surge uma objeção.", bullets: ["Deteção de objeções em tempo real", "Respostas retiradas do seu próprio guião", "Acompanhamento da etapa atual, discreto no ecrã"] },
    },
  },
];

const UI: Record<Lang, { label: string; headline: string; sub: string; available: string; soon: string; cta: string; note: string }> = {
  fr: { label: "Fonctionnalités", headline: "Un seul outil, de la préparation au closing.", sub: "Cinq modules, un par moment de votre cycle de vente. Cliquez pour voir chacun en action.", available: "Disponible", soon: "Bientôt", cta: "Essayer gratuitement", note: "Gratuit · Sans carte bancaire" },
  en: { label: "Features", headline: "One tool, from prep to close.", sub: "Five modules, one for each moment of your sales cycle. Click to see each one in action.", available: "Available", soon: "Coming soon", cta: "Try for free", note: "Free · No credit card required" },
  pt: { label: "Funcionalidades", headline: "Uma só ferramenta, da preparação ao fecho.", sub: "Cinco módulos, um para cada momento do seu ciclo de vendas. Clique para ver cada um em ação.", available: "Disponível", soon: "Em breve", cta: "Experimentar gratuitamente", note: "Grátis · Sem cartão de crédito" },
};

export function FeatureShowcase({ lang }: { lang: Lang }) {
  const [active, setActive] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const ui = UI[lang];
  const cat = CATEGORIES[active];
  const copy = cat.copy[lang];
  const Mockup = cat.Mockup;

  function select(i: number, focus = false) {
    const next = (i + CATEGORIES.length) % CATEGORIES.length;
    setActive(next);
    const el = tabRefs.current[next];
    if (focus) el?.focus();
    el?.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "smooth" });
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowRight" || e.key === "ArrowDown") { e.preventDefault(); select(active + 1, true); }
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") { e.preventDefault(); select(active - 1, true); }
    else if (e.key === "Home") { e.preventDefault(); select(0, true); }
    else if (e.key === "End") { e.preventDefault(); select(CATEGORIES.length - 1, true); }
  }

  return (
    <section id="features" className="py-14 px-5 md:py-24 md:px-6 scroll-mt-20">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8 md:mb-12">
          <p className="text-[11px] font-semibold text-violet-500 uppercase tracking-widest mb-3">{ui.label}</p>
          <h2 className="text-[26px] md:text-[34px] font-bold tracking-tight text-balance">{ui.headline}</h2>
          <p className="text-[14px] md:text-[15px] text-stone-500 mt-3 max-w-xl mx-auto">{ui.sub}</p>
        </div>

        {/* Category tabs */}
        <div
          role="tablist"
          aria-label={ui.label}
          onKeyDown={onKeyDown}
          className="flex md:grid md:grid-cols-5 gap-2 overflow-x-auto -mx-5 px-5 md:mx-0 md:px-0 pb-2 md:pb-0 snap-x [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {CATEGORIES.map((c, i) => {
            const selected = i === active;
            const Icon = c.icon;
            return (
              <button
                key={c.id}
                ref={el => { tabRefs.current[i] = el; }}
                role="tab"
                id={`feature-tab-${c.id}`}
                aria-selected={selected}
                aria-controls={`feature-panel-${c.id}`}
                tabIndex={selected ? 0 : -1}
                onClick={() => select(i)}
                className={cn(
                  "snap-start shrink-0 w-[150px] md:w-auto text-left rounded-xl border px-3.5 py-3 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2",
                  selected ? "border-violet-300 bg-white shadow-md shadow-violet-100" : "border-stone-200 bg-stone-50/60 hover:bg-white hover:border-stone-300"
                )}
              >
                <div className="flex items-center justify-between mb-2.5">
                  <span className={cn("w-8 h-8 rounded-lg flex items-center justify-center", selected ? c.accent.chip : "bg-stone-100")}>
                    <Icon className={cn("w-4 h-4", selected ? c.accent.icon : "text-stone-400")} />
                  </span>
                  <span className="text-[10.5px] font-semibold tabular-nums text-stone-300">0{i + 1}</span>
                </div>
                <p className={cn("text-[14px] font-semibold leading-tight", selected ? "text-stone-900" : "text-stone-600")}>{c.copy[lang].label}</p>
                <p className="text-[11.5px] text-stone-400 mt-0.5 flex items-center gap-1.5">
                  {c.copy[lang].feature}
                  {c.soon && <span className="text-[9.5px] font-medium bg-stone-200/70 text-stone-500 rounded-full px-1.5 py-px">{ui.soon}</span>}
                </p>
              </button>
            );
          })}
        </div>

        {/* Active panel */}
        <div
          key={cat.id}
          role="tabpanel"
          id={`feature-panel-${cat.id}`}
          aria-labelledby={`feature-tab-${cat.id}`}
          className="rumios-fade-up mt-6 md:mt-8 grid grid-cols-1 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-8 lg:gap-12 items-center bg-gradient-to-b from-stone-50 to-white border border-stone-100 rounded-3xl p-5 sm:p-8 md:p-10"
        >
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className={cn("text-[11px] font-semibold uppercase tracking-widest", cat.accent.icon)}>0{active + 1} · {copy.label}</span>
              <span className={cn("text-[10.5px] font-medium px-2 py-0.5 rounded-full", cat.soon ? "bg-stone-100 text-stone-500" : "bg-emerald-50 text-emerald-700")}>
                {cat.soon ? ui.soon : ui.available}
              </span>
            </div>
            <h3 className="text-[22px] md:text-[28px] font-bold tracking-tight leading-tight text-stone-900 text-balance">{copy.title}</h3>
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
            <div className="mt-7 flex flex-col sm:flex-row sm:items-center gap-3">
              <Link href="/sign-up" className="inline-flex items-center justify-center gap-2 bg-violet-600 text-white text-[14px] font-semibold px-5 py-2.5 rounded-lg hover:bg-violet-500 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-violet-900/30 transition-all">
                {ui.cta} <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <span className="text-[12px] text-stone-400 text-center sm:text-left">{ui.note}</span>
            </div>
          </div>

          <div className="relative min-w-0">
            <div className="absolute -inset-4 bg-[radial-gradient(ellipse_at_center,rgba(124,58,237,0.10),transparent_70%)] pointer-events-none" aria-hidden />
            <div className="relative">
              <Mockup lang={lang} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
