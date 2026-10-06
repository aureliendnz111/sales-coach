"use client";
import { useAuth } from "@clerk/nextjs";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { CheckCircle2, TrendingUp, BarChart2, ArrowRight, Mic, Target, Brain, Menu, X, AlertTriangle, RefreshCw, TrendingDown, Heart, ChevronDown, Check, GraduationCap, Rocket, Sparkles, Lock, Swords, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { RumiosLogo } from "@/components/RumiosLogo";
import { useLang, type Lang } from "@/lib/lang-context";
import { FeatureShowcase } from "@/components/landing/FeatureShowcase";
import { ScoreCard } from "@/components/landing/ScoreCard";
import { CtaBand } from "@/components/landing/CtaBand";

const PROBLEM_STYLES = [
  { icon: AlertTriangle, iconBg: "bg-rose-50", iconColor: "text-rose-500", accent: "border-rose-100" },
  { icon: RefreshCw,     iconBg: "bg-orange-50", iconColor: "text-orange-500", accent: "border-orange-100" },
  { icon: TrendingDown,  iconBg: "bg-red-50", iconColor: "text-red-500", accent: "border-red-100" },
] as const;

const PROFILE_STYLES: Record<"closer" | "coach" | "founder", { icon: LucideIcon; chip: string; bar: string }> = {
  closer:  { icon: Target,        chip: "bg-rose-50 text-rose-600",   bar: "from-rose-400 to-rose-500" },
  coach:   { icon: GraduationCap, chip: "bg-violet-50 text-violet-600", bar: "from-violet-400 to-violet-600" },
  founder: { icon: Rocket,        chip: "bg-amber-50 text-amber-600", bar: "from-amber-300 to-amber-500" },
};

const UI_EXTRA: Record<Lang, { signin: string; trust: [string, string, string]; menu: string; footerLinks: string }> = {
  fr: { signin: "Se connecter", trust: ["Gratuit pour commencer", "Sans carte bancaire", "Compatible tl;dv, Fathom, Otter.ai"], menu: "Menu", footerLinks: "Liens" },
  en: { signin: "Sign in", trust: ["Free to start", "No credit card", "Works with tl;dv, Fathom, Otter.ai"], menu: "Menu", footerLinks: "Links" },
  pt: { signin: "Entrar", trust: ["Grátis para começar", "Sem cartão de crédito", "Compatível com tl;dv, Fathom, Otter.ai"], menu: "Menu", footerLinks: "Links" },
};

const METRIC_CHIPS = [
  "bg-violet-500/10 ring-violet-400/20",
  "bg-sky-500/10 ring-sky-400/20",
  "bg-emerald-500/10 ring-emerald-400/20",
  "bg-amber-500/10 ring-amber-400/20",
  "bg-blue-500/10 ring-blue-400/20",
  "bg-violet-400/10 ring-violet-300/20",
] as const;

const METRIC_COLORS = [
  "text-violet-400",
  "text-sky-400",
  "text-emerald-400",
  "text-amber-400",
  "text-blue-400",
  "text-violet-300",
] as const;

const CONTENT = {
  fr: {
    nav: { signin: "Se connecter", signup: "Essayer gratuitement" },
    floatingNav: [
      { label: "Fonctionnalités", href: "#features" },
      { label: "Tarifs", href: "#pricing" },
      { label: "FAQ", href: "#faq" },
    ],
    badge: "Coach IA pour augmenter ses ventes",
    hero: {
      headline: "Augmentez vos ventes de 20 à 50 %",
      tagline: "Closez plus. Perdez moins.",
      sub: "Rumios analyse vos appels de vente, score votre performance sur 6 dimensions\net vous dit précisément quoi corriger avant le prochain appel.",
      cta: "Commencer gratuitement",
      ctaSecondary: "Se connecter",
    },
    mockCard: {
      label: "Analyse · Call avec Marie D.",
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
        { type: "warn", text: "Objection prix non recadrée, à corriger au prochain call" },
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
    profiles: {
      label: "Pour qui",
      headline: "Pour tous ceux qui vendent leur expertise.",
      items: [
        { kind: "closer", title: "Closers indépendants", desc: "Chaque deal compte. Analysez chaque call pour ne plus laisser de vente sur la table par manque de feedback." },
        { kind: "coach", title: "Coachs", desc: "Vous vendez votre accompagnement en appel. Structurez votre closing, mesurez ce qui bloque, progressez à chaque conversation." },
        { kind: "founder", title: "Entrepreneurs et freelances", desc: "La vente n'est pas votre métier, mais elle conditionne votre croissance. Rumios vous donne les outils pour la maîtriser." },
      ],
    },
    pricing: {
      label: "Tarifs",
      headline: "Simple. Transparent.",
      free: {
        name: "Start",
        desc: "Pour démarrer et tester Rumios.",
        price: "0 €",
        period: "pour toujours",
        cta: "Commencer gratuitement",
        features: [
          "2 scripts actifs",
          "5 analyses de calls / mois",
          "Accès aux templates",
          "Score sur 6 dimensions",
          "Synthèse IA après chaque call",
          "Playground : simulation d'appels",
        ],
      },
      pro: {
        name: "Pro",
        desc: "Pour les coachs et closers qui scalent.",
        price: "Bientôt",
        period: "",
        cta: "Être notifié",
        badge: "Bientôt",
        features: [
          "Scripts illimités",
          "Analyses illimitées",
          "Analytics & suivi de progression",
          "Live Copilot en temps réel",
          "Support prioritaire",
        ],
      },
    },
    faq: {
      label: "Questions fréquentes",
      headline: "Tout ce que vous voulez savoir.",
      items: [
        { q: "Ai-je besoin d'enregistrer mes calls ?", a: "Non. Vous avez juste besoin du transcript texte de votre call. Des outils comme tl;dv, Fathom ou Otter.ai génèrent ces transcripts automatiquement. Vous pouvez aussi en coller un manuellement." },
        { q: "Quels types de calls peuvent être analysés ?", a: "Tout appel de vente avec un transcript : closing, découverte, suivi, relance. Peu importe le format ou la plateforme. Google Meet, Zoom, Teams : du moment que vous avez le texte, Rumios peut l'analyser." },
        { q: "Comment fonctionne le scoring ?", a: "L'IA analyse le transcript sur 6 dimensions (process, découverte, objections, posture, conclusion, score global) et retourne une note sur 100 avec des recommandations concrètes pour chaque axe." },
        { q: "C'est quoi le Playground ?", a: "Une simulation d'appel face à une IA qui joue le rôle du prospect. Vous pouvez vous entraîner autant de fois que vous voulez avant un vrai call, sans aucun enjeu. Choisissez un persona, lancez l'appel à la voix et entraînez-vous directement sur votre script." },
        { q: "Combien coûte Rumios ?", a: "Rumios est gratuit pour commencer : 2 scripts et 5 analyses de calls par mois. Des plans avec plus de capacités arriveront prochainement." },
        { q: "Puis-je utiliser Rumios sans script préexistant ?", a: "Oui. L'analyse fonctionne même sans script de référence. Mais les résultats sont bien plus précis quand l'IA peut comparer le call à vos étapes et vos objections préparées." },
      ],
    },
    cta: {
      headline: "Votre prochain call sera différent.",
      sub: "Rejoignez les coachs et closers qui ont arrêté de perdre des deals sans comprendre pourquoi.",
      button: "Commencer gratuitement",
      note: "Gratuit pour commencer. Sans carte bancaire.",
    },
    footer: "Tous droits réservés",
    legal: "Mentions légales",
  },
  en: {
    nav: { signin: "Sign in", signup: "Try for free" },
    floatingNav: [
      { label: "Features", href: "#features" },
      { label: "Pricing", href: "#pricing" },
      { label: "FAQ", href: "#faq" },
    ],
    badge: "AI coach to boost your sales",
    hero: {
      headline: "Increase your sales by 20 to 50%",
      tagline: "Close more. Lose less.",
      sub: "Rumios analyzes your sales calls, scores your performance across 6 dimensions,\nand tells you exactly what to fix before your next call.",
      cta: "Get started for free",
      ctaSecondary: "Sign in",
    },
    mockCard: {
      label: "Analysis · Call with Marie D.",
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
        { type: "warn", text: "Price objection not reframed, fix this on the next call" },
      ],
    },
    problem: {
      label: "The problem",
      headline: "You leave every call with a feeling. Rarely with an analysis.",
      sub: "Without data, you repeat the same mistakes. You don't know what made the deal close, or why it didn't.",
      pains: [
        { title: "You don't know why you lost", desc: "Every lost deal stays vague. You improvise the next time." },
        { title: "Your script changes every call", desc: "Nothing is formalized. What works disappears with the call." },
        { title: "No way to measure progress", desc: "You're flying blind, with no idea if you're actually improving." },
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
    profiles: {
      label: "Who it's for",
      headline: "For everyone who sells their expertise.",
      items: [
        { kind: "closer", title: "Independent closers", desc: "Every deal matters. Analyze every call so you stop leaving sales on the table from lack of feedback." },
        { kind: "coach", title: "Coaches", desc: "You sell your coaching over the phone. Structure your closing, measure what blocks, and improve with every conversation." },
        { kind: "founder", title: "Entrepreneurs and freelancers", desc: "Sales isn't your job, but it drives your growth. Rumios gives you the tools to get good at it." },
      ],
    },
    pricing: {
      label: "Pricing",
      headline: "Simple. Transparent.",
      free: {
        name: "Start",
        desc: "To get started and try Rumios.",
        price: "$0",
        period: "forever",
        cta: "Get started for free",
        features: [
          "2 active scripts",
          "5 call analyses / month",
          "Access to templates",
          "Score across 6 dimensions",
          "AI summary after every call",
          "Playground: call simulation",
        ],
      },
      pro: {
        name: "Pro",
        desc: "For coaches and closers who scale.",
        price: "Coming soon",
        period: "",
        cta: "Get notified",
        badge: "Coming soon",
        features: [
          "Unlimited scripts",
          "Unlimited analyses",
          "Analytics & progress tracking",
          "Live Copilot in real time",
          "Priority support",
        ],
      },
    },
    faq: {
      label: "FAQ",
      headline: "Everything you need to know.",
      items: [
        { q: "Do I need to record my calls?", a: "No. You just need the text transcript of your call. Tools like tl;dv, Fathom, or Otter.ai generate these automatically. You can also paste one manually." },
        { q: "What types of calls can be analyzed?", a: "Any sales call with a transcript: closing, discovery, follow-up, re-engagement. Format doesn't matter. Google Meet, Zoom, Teams: as long as you have the text, Rumios can analyze it." },
        { q: "How does the scoring work?", a: "The AI analyzes the transcript across 6 dimensions (process, discovery, objections, posture, close, overall score) and returns a grade out of 100 with concrete recommendations for each area." },
        { q: "What is the Playground?", a: "A simulated sales call against an AI playing the prospect. You can practice as many times as you want before a real call, with nothing at stake. Pick a persona, start a voice call and practice directly on your own script." },
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
    legal: "Legal notice",
  },
  pt: {
    nav: { signin: "Entrar", signup: "Começar grátis" },
    floatingNav: [
      { label: "Funcionalidades", href: "#features" },
      { label: "Preços", href: "#pricing" },
      { label: "FAQ", href: "#faq" },
    ],
    badge: "Coach IA para aumentar as suas vendas",
    hero: {
      headline: "Aumente as suas vendas em 20 a 50%",
      tagline: "Feche mais. Perca menos.",
      sub: "O Rumios analisa as suas chamadas de venda, avalia o seu desempenho\nem 6 dimensões e diz-lhe exatamente o que corrigir antes da próxima chamada.",
      cta: "Começar gratuitamente",
      ctaSecondary: "Entrar",
    },
    mockCard: {
      label: "Análise · Chamada com Marie D.",
      subtitle: "Descoberta + Fecho, 47 min",
      scoreLabel: "Pontuação global",
      items: [
        { label: "Processo", score: 82, color: "bg-emerald-500" },
        { label: "Descoberta", score: 75, color: "bg-emerald-500" },
        { label: "Objeções", score: 68, color: "bg-amber-400" },
        { label: "Postura", score: 85, color: "bg-emerald-500" },
        { label: "Fecho", score: 70, color: "bg-amber-400" },
        { label: "Talk ratio", score: 42, color: "bg-sky-500", suffix: "%" },
      ],
      insights: [
        { type: "good", text: "Boa fase de descoberta, as dores foram bem identificadas" },
        { type: "warn", text: "Objeção de preço não recadrada, a corrigir na próxima chamada" },
      ],
    },
    problem: {
      label: "O problema",
      headline: "Sai de cada chamada com uma impressão. Raramente com uma análise.",
      sub: "Sem dados, repete os mesmos erros. Não sabe o que fez fechar o negócio, nem o que o fez perder.",
      pains: [
        { title: "Não sabe por que perdeu", desc: "Cada negócio perdido fica em aberto. Improvisa na próxima vez." },
        { title: "O seu guião muda a cada chamada", desc: "Nada está formalizado. O que funciona desaparece com a chamada." },
        { title: "Impossível medir o progresso", desc: "Avança às cegas, sem saber se está realmente a melhorar." },
      ],
    },
    metrics: {
      label: "O que o Rumios mede",
      headline: "Uma pontuação precisa em seis dimensões.",
      sub: "Não uma nota global vaga. Seis eixos distintos para saber exatamente onde concentrar os seus esforços.",
      items: [
        { icon: Target, label: "Processo", desc: "Cada etapa do seu guião foi respeitada?" },
        { icon: Brain, label: "Descoberta", desc: "Qualificou bem as dores do prospect?" },
        { icon: Mic, label: "Postura", desc: "O seu tom, ritmo e nível de confiança." },
        { icon: TrendingUp, label: "Fecho", desc: "O pedido de fecho foi bem colocado?" },
        { icon: BarChart2, label: "Gestão de objeções", desc: "Cada objeção é detetada e avaliada." },
        { icon: CheckCircle2, label: "Pontuação global", desc: "Uma nota clara, comparável de chamada em chamada." },
      ],
    },
    profiles: {
      label: "Para quem",
      headline: "Para todos os que vendem a sua expertise.",
      items: [
        { kind: "closer", title: "Closers independentes", desc: "Cada negócio conta. Analise cada chamada para não deixar vendas na mesa por falta de feedback." },
        { kind: "coach", title: "Coaches", desc: "Vende o seu acompanhamento ao telefone. Estruture o seu fecho, meça o que bloqueia, progrida em cada conversa." },
        { kind: "founder", title: "Empreendedores e freelancers", desc: "A venda não é o seu trabalho principal, mas condiciona o seu crescimento. O Rumios dá-lhe as ferramentas para a dominar." },
      ],
    },
    pricing: {
      label: "Preços",
      headline: "Simples. Transparente.",
      free: {
        name: "Start",
        desc: "Para começar e testar o Rumios.",
        price: "0 €",
        period: "para sempre",
        cta: "Começar gratuitamente",
        features: [
          "2 guiões ativos",
          "5 análises de chamadas / mês",
          "Acesso aos modelos",
          "Pontuação em 6 dimensões",
          "Síntese IA após cada chamada",
          "Playground: simulação de chamadas",
        ],
      },
      pro: {
        name: "Pro",
        desc: "Para coaches e closers que escalam.",
        price: "Em breve",
        period: "",
        cta: "Ser notificado",
        badge: "Em breve",
        features: [
          "Guiões ilimitados",
          "Análises ilimitadas",
          "Analytics & acompanhamento de progresso",
          "Live Copilot em tempo real",
          "Suporte prioritário",
        ],
      },
    },
    faq: {
      label: "Perguntas frequentes",
      headline: "Tudo o que precisa de saber.",
      items: [
        { q: "Preciso de gravar as minhas chamadas?", a: "Não. Precisa apenas do transcript em texto da sua chamada. Ferramentas como tl;dv, Fathom ou Otter.ai geram esses transcripts automaticamente. Também pode colar um manualmente." },
        { q: "Que tipos de chamadas podem ser analisadas?", a: "Qualquer chamada de venda com transcript: fecho, descoberta, acompanhamento, reativação. O formato não importa. Google Meet, Zoom, Teams: desde que tenha o texto, o Rumios pode analisar." },
        { q: "Como funciona a pontuação?", a: "A IA analisa o transcript em 6 dimensões (processo, descoberta, objeções, postura, fecho, pontuação global) e devolve uma nota em 100 com recomendações concretas para cada área." },
        { q: "O que é o Playground?", a: "Uma simulação de chamada com uma IA que interpreta o prospect. Pode praticar quantas vezes quiser antes de uma chamada real, sem nenhum risco. Escolha uma persona, inicie a chamada por voz e treine diretamente com o seu guião." },
        { q: "Quanto custa o Rumios?", a: "O Rumios é gratuito para começar: 2 guiões e 5 análises de chamadas por mês. Planos com mais capacidade chegam em breve." },
        { q: "Posso usar o Rumios sem guião?", a: "Sim. A análise funciona mesmo sem guião de referência. Mas os resultados são muito mais precisos quando a IA pode comparar a chamada com as suas etapas e objeções preparadas." },
      ],
    },
    cta: {
      headline: "A sua próxima chamada será diferente.",
      sub: "Junte-se aos coaches e closers que deixaram de perder negócios sem perceber porquê.",
      button: "Começar gratuitamente",
      note: "Grátis para começar. Sem cartão de crédito.",
    },
    footer: "Todos os direitos reservados",
    legal: "Informação legal",
  },
} as const;

const LANG_LABELS: Record<Lang, string> = { fr: "Français", en: "English", pt: "Português" };

function FloatingNav({ lang, setLang }: { lang: Lang; setLang: (l: Lang) => void }) {
  const c = CONTENT[lang];
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const langRef = useRef<HTMLDivElement>(null);
  const ui = UI_EXTRA[lang];

  // Highlight the nav item of the section currently in view
  useEffect(() => {
    const ids = c.floatingNav.map(i => i.href);
    const els = ids.map(id => document.querySelector(id)).filter((el): el is Element => !!el);
    const obs = new IntersectionObserver(
      entries => {
        const visible = entries.filter(e => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) setActiveSection(`#${visible.target.id}`);
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, [c.floatingNav]);

  function smoothScroll(targetY: number) {
    const startY = window.scrollY;
    const distance = targetY - startY;
    const duration = 900;
    const start = performance.now();
    const ease = (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      window.scrollTo(0, startY + distance * ease(p));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  function scrollToSection(href: string) {
    const el = document.querySelector(href);
    if (el) smoothScroll(el.getBoundingClientRect().top + window.scrollY - 80);
  }

  function handleLogoClick(e: React.MouseEvent) {
    if (pathname === "/") {
      e.preventDefault();
      smoothScroll(0);
    }
  }

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const ctaLabel = lang === "fr" ? "Commencer" : lang === "en" ? "Get started" : "Começar";

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] md:w-auto">
      <div className="flex items-center justify-between md:justify-start gap-1 bg-[#09090B] text-white rounded-full px-3 py-2 shadow-2xl shadow-black/40 border border-white/8">
        <Link href="/" onClick={handleLogoClick} className="flex items-center gap-1.5 px-2 md:mr-1 hover:opacity-80 transition-opacity">
          <RumiosLogo size={18} inverted />
          <span className="text-[12px] font-semibold tracking-tight">RUMIOS</span>
          <span className="text-[9px] font-medium leading-none bg-violet-600/30 text-violet-300 border border-violet-500/30 rounded-full px-1.5 py-[2px]">BETA</span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          <div className="w-px h-4 bg-white/10" />
          {c.floatingNav.map((item) => (
            <button key={item.href} onClick={() => scrollToSection(item.href)} aria-current={activeSection === item.href ? "true" : undefined}
              className={cn("text-[12.5px] whitespace-nowrap px-3 py-1 rounded-full transition-colors",
                activeSection === item.href ? "text-white bg-white/10" : "text-stone-400 hover:text-white hover:bg-white/8")}>
              {item.label}
            </button>
          ))}
          <div className="w-px h-4 bg-white/10" />
          <div ref={langRef} className="relative">
            <button
              onClick={() => setLangOpen(o => !o)}
              aria-haspopup="listbox"
              aria-expanded={langOpen}
              className="flex items-center gap-1 text-[11px] font-medium text-stone-400 hover:text-white px-2 py-1 rounded-full hover:bg-white/8 transition-colors"
            >
              {lang.toUpperCase()} <ChevronDown className="w-2.5 h-2.5" />
            </button>
            {langOpen && (
              <div className="absolute right-0 top-full mt-2 bg-[#111111] border border-white/10 rounded-xl overflow-hidden shadow-xl min-w-[120px]">
                {(["fr", "en", "pt"] as Lang[]).map(l => (
                  <button
                    key={l}
                    onClick={() => { setLang(l); setLangOpen(false); }}
                    className={cn(
                      "flex items-center justify-between gap-3 w-full px-4 py-2.5 text-[12px] transition-colors",
                      l === lang ? "text-white bg-white/10" : "text-stone-400 hover:text-white hover:bg-white/5"
                    )}
                  >
                    <span>{LANG_LABELS[l]}</span>
                    {l === lang && <Check className="w-3 h-3 shrink-0" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <button onClick={() => setMobileOpen(o => !o)} aria-label={ui.menu} aria-expanded={mobileOpen} className="p-1.5 rounded-full hover:bg-white/8 transition-colors">
            {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
          <Link href="/sign-up" className="text-[12.5px] font-semibold bg-violet-600 text-white px-3.5 py-1.5 rounded-full hover:bg-violet-500 transition-colors">
            {ctaLabel}
          </Link>
        </div>

        <Link href="/sign-in" className="hidden md:block ml-1 whitespace-nowrap text-[12.5px] text-stone-300 hover:text-white px-3 py-1 rounded-full hover:bg-white/8 transition-colors">
          {ui.signin}
        </Link>
        <Link href="/sign-up" className="hidden md:block whitespace-nowrap text-[12.5px] font-semibold bg-violet-600 text-white px-3.5 py-1.5 rounded-full hover:bg-violet-500 transition-colors">
          {ctaLabel}
        </Link>
      </div>

      {mobileOpen && (
        <div className="md:hidden mt-2 bg-[#09090B] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
          <div className="px-2 py-2 space-y-0.5">
            {c.floatingNav.map((item) => (
              <button key={item.href} onClick={() => { scrollToSection(item.href); setMobileOpen(false); }}
                className="flex items-center w-full px-4 py-3 text-[14px] text-stone-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors">
                {item.label}
              </button>
            ))}
          </div>
          <div className="border-t border-white/10 px-2 py-2">
            <Link href="/sign-in" className="flex items-center w-full px-4 py-3 text-[14px] text-stone-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors">
              {ui.signin}
            </Link>
          </div>
          <div className="border-t border-white/10 px-2 py-2 space-y-0.5">
            {(["fr", "en", "pt"] as Lang[]).map(l => (
              <button key={l} onClick={() => { setLang(l); setMobileOpen(false); }}
                className={cn("flex items-center justify-between w-full px-4 py-3 text-[13px] rounded-xl transition-colors",
                  l === lang ? "text-white bg-white/10" : "text-stone-400 hover:text-white hover:bg-white/5")}>
                <span>{LANG_LABELS[l]}</span>
                {l === lang && <Check className="w-3.5 h-3.5" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function FaqItem({ q, a, id }: { q: string; a: string; id: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={cn("border rounded-xl bg-white transition-all", open ? "border-violet-200 shadow-sm" : "border-stone-200 hover:border-stone-300")}>
      <h3>
        <button
          onClick={() => setOpen(o => !o)}
          aria-expanded={open}
          aria-controls={`faq-${id}`}
          className="w-full flex items-center justify-between px-5 py-4 gap-4 text-left rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
        >
          <span className="text-[14px] font-medium text-stone-800">{q}</span>
          <span className={cn("shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-colors", open ? "bg-violet-100" : "bg-stone-100")}>
            <ChevronDown className={cn("w-3.5 h-3.5 transition-transform duration-200", open ? "rotate-180 text-violet-600" : "text-stone-500")} />
          </span>
        </button>
      </h3>
      <div id={`faq-${id}`} role="region" className={cn("grid transition-[grid-template-rows] duration-200 ease-out", open ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
        <div className="overflow-hidden">
          <p className="px-5 pb-4 text-[13.5px] text-stone-500 leading-relaxed">{a}</p>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();
  const { lang, setLang } = useLang();
  useEffect(() => {
    if (isLoaded && isSignedIn) router.push("/dashboard");
  }, [isLoaded, isSignedIn, router]);

  const c = CONTENT[lang];

  return (
    <div className="bg-white text-stone-900 min-h-screen">
      <FloatingNav lang={lang} setLang={setLang} />

      {/* ── HERO ── */}
      <section className="relative pt-24 pb-20 px-5 md:pt-32 md:pb-24 md:px-6 bg-[#09090B] overflow-hidden">
        {/* Subtle violet radial glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_40%_at_50%_0%,rgba(124,58,237,0.18),transparent)] pointer-events-none" />

        <div className="max-w-3xl mx-auto text-center relative z-10">
          {/* Badge pill */}
          <div className="inline-flex items-center gap-2 bg-violet-950/80 text-violet-300 border border-violet-700/40 text-[10.5px] font-semibold px-4 py-1.5 rounded-full mb-8 tracking-widest uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse shrink-0" />
            {c.badge}
          </div>

          {/* Main headline */}
          <h1 className="text-[38px] sm:text-[48px] md:text-[72px] font-bold tracking-tight leading-[1.1] md:leading-[1.0] text-white mb-4 text-balance">
            {c.hero.headline}
          </h1>

          {/* Tagline */}
          <p className="text-[22px] md:text-[28px] font-semibold text-violet-300 mb-6">
            {(c.hero as typeof c.hero & { tagline: string }).tagline}
          </p>

          {/* Sub */}
          <p className="text-[16px] md:text-[18px] text-stone-400 max-w-2xl mx-auto leading-relaxed mb-10">
            {c.hero.sub.split("\n").flatMap((line, i) =>
              i === 0 ? [line] : [<br key={i} className="hidden md:block" />, line]
            )}
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/sign-up" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-violet-600 text-white text-[14px] font-semibold px-7 py-3 rounded-lg hover:bg-violet-500 hover:shadow-xl hover:shadow-violet-900/40 hover:-translate-y-0.5 transition-all">
              {c.hero.cta} <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link href="/sign-in" className="w-full sm:w-auto text-[14px] text-stone-400 hover:text-white px-5 py-3 rounded-lg border border-stone-700 hover:border-stone-500 transition-all">
              {c.hero.ctaSecondary}
            </Link>
          </div>

          {/* Trust row */}
          <ul className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-x-5 gap-y-2 text-[12.5px] text-stone-400">
            {UI_EXTRA[lang].trust.map(item => (
              <li key={item} className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />{item}
              </li>
            ))}
          </ul>
        </div>

      </section>

      {/* ── PROBLEM ── */}
      <section className="py-14 px-5 md:py-20 md:px-6 bg-stone-50 border-t border-stone-100">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-[11px] font-semibold text-violet-500 uppercase tracking-widest mb-4">{c.problem.label}</p>
          <h2 className="text-[26px] md:text-[34px] font-bold tracking-tight leading-tight mb-4">
            {lang === "en" ? <>You leave every call with a feeling.<br />Rarely with an analysis.</>
            : lang === "pt" ? <>Sai de cada chamada com uma impressão.<br />Raramente com uma análise.</>
            : c.problem.headline}
          </h2>
          <p className="text-[14px] md:text-[15px] text-stone-500 leading-relaxed max-w-xl mx-auto mb-8 md:mb-10">{c.problem.sub}</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
            {c.problem.pains.map((item, i) => {
              const style = PROBLEM_STYLES[i];
              const Icon = style.icon;
              return (
                <div key={i} className={cn("bg-white border rounded-2xl p-6 flex flex-col gap-4 hover:shadow-xl hover:-translate-y-1 transition-all duration-200", style.accent)}>
                  <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center", style.iconBg)}>
                    <Icon className={cn("w-5 h-5", style.iconColor)} />
                  </div>
                  <div>
                    <p className="text-[15px] font-semibold text-stone-900 mb-2 leading-snug">{item.title}</p>
                    <p className="text-[13px] text-stone-500 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA strip, problem */}
      <div className="px-5 md:px-6 pt-2 pb-16 md:pb-24 bg-stone-50">
        <CtaBand
          title={lang === "fr" ? "Rumios règle ces 3 problèmes." : lang === "en" ? "Rumios fixes all three." : "O Rumios resolve estes 3 problemas."}
          sub={`${UI_EXTRA[lang].trust[0]} · ${UI_EXTRA[lang].trust[1]}`}
          cta={lang === "fr" ? "Commencer gratuitement" : lang === "en" ? "Get started for free" : "Começar gratuitamente"}
        />
      </div>

      {/* ── FEATURES (by category, with mockups) ── */}
      <FeatureShowcase lang={lang} />

      {/* ── METRICS ── */}
      <section className="relative py-14 px-5 md:py-24 md:px-6 bg-[#09090B] text-white overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_60%_at_25%_55%,rgba(124,58,237,0.16),transparent)] pointer-events-none" aria-hidden />
        <div className="relative max-w-6xl mx-auto">
          <div className="text-center mb-10 md:mb-14">
            <p className="text-[11px] font-semibold text-violet-400 uppercase tracking-widest mb-3">{c.metrics.label}</p>
            <h2 className="text-[26px] md:text-[34px] font-bold tracking-tight mb-3">{c.metrics.headline}</h2>
            <p className="text-[14px] md:text-[15px] text-stone-400 max-w-lg mx-auto">{c.metrics.sub}</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-stretch">
            <ScoreCard
              label={c.mockCard.label}
              subtitle={c.mockCard.subtitle}
              scoreLabel={c.mockCard.scoreLabel}
              score={78}
              items={c.mockCard.items}
              insights={c.mockCard.insights}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {c.metrics.items.map((m, i) => (
                <div key={m.label} className="bg-white/5 border border-white/8 rounded-xl p-4 flex items-start gap-3 hover:bg-white/8 hover:border-violet-700/30 transition-colors duration-200">
                  <div className={cn("w-9 h-9 rounded-lg ring-1 flex items-center justify-center shrink-0", METRIC_CHIPS[i])}>
                    <m.icon className={cn("w-4 h-4", METRIC_COLORS[i])} />
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-white">{m.label}</p>
                    <p className="text-[12px] text-stone-400 mt-0.5 leading-relaxed">{m.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FOR WHO ── */}
      <section className="py-14 px-5 md:py-20 md:px-6 bg-stone-50 border-y border-stone-100">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8 md:mb-10">
            <p className="text-[11px] font-semibold text-violet-500 uppercase tracking-widest mb-3">{c.profiles.label}</p>
            <h2 className="text-[26px] md:text-[32px] font-bold tracking-tight">{c.profiles.headline}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {c.profiles.items.map((p) => {
              const st = PROFILE_STYLES[p.kind];
              const Icon = st.icon;
              return (
                <div key={p.title} className="relative overflow-hidden bg-white border border-stone-200 rounded-2xl p-6 hover:border-violet-200 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                  <span className={cn("absolute inset-x-0 top-0 h-1 bg-gradient-to-r", st.bar)} aria-hidden />
                  <span className={cn("w-11 h-11 rounded-xl flex items-center justify-center mb-4", st.chip)}>
                    <Icon className="w-5 h-5" />
                  </span>
                  <h3 className="text-[15px] font-semibold text-stone-900 mb-2">{p.title}</h3>
                  <p className="text-[13px] text-stone-500 leading-relaxed">{p.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA strip, practice */}
      <div className="px-5 md:px-6 pt-14 md:pt-20">
        <CtaBand
          icon={Swords}
          title={lang === "fr" ? "Entraînez-vous avant votre prochain call." : lang === "en" ? "Practice before your next call." : "Treine antes da sua próxima chamada."}
          sub={lang === "fr" ? "Simulez un appel face à un prospect IA, gratuitement." : lang === "en" ? "Simulate a call with an AI prospect, for free." : "Simule uma chamada com um prospeto IA, gratuitamente."}
          cta={lang === "fr" ? "Lancer une simulation" : lang === "en" ? "Start a simulation" : "Iniciar uma simulação"}
        />
      </div>

      {/* ── PRICING ── */}
      <section id="pricing" className="py-14 px-5 md:py-24 md:px-6 scroll-mt-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8 md:mb-12">
            <p className="text-[11px] font-semibold text-violet-500 uppercase tracking-widest mb-3">{c.pricing.label}</p>
            <h2 className="text-[26px] md:text-[34px] font-bold tracking-tight">{c.pricing.headline}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Free */}
            <div className="bg-white border-2 border-violet-600 rounded-2xl p-7 flex flex-col shadow-lg shadow-violet-100">
              <div className="mb-6">
                <h3 className="text-[17px] font-bold text-stone-900 mb-1">{c.pricing.free.name}</h3>
                <p className="text-[13px] text-stone-500">{c.pricing.free.desc}</p>
              </div>
              <div className="mb-7">
                <span className="text-[42px] font-bold text-stone-900 tracking-tight">{c.pricing.free.price}</span>
                {c.pricing.free.period && <span className="text-[13px] text-stone-400 ml-2">{c.pricing.free.period}</span>}
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {c.pricing.free.features.map((feat, i) => (
                  <li key={i} className="flex items-center gap-2.5 text-[13.5px] text-stone-700">
                    <CheckCircle2 className="w-4 h-4 text-violet-500 shrink-0" />
                    {feat}
                  </li>
                ))}
              </ul>
              <Link href="/sign-up" className="flex items-center justify-center gap-2 bg-violet-600 text-white text-[14px] font-semibold px-6 py-3 rounded-lg hover:bg-violet-500 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-violet-900/30 transition-all">
                {c.pricing.free.cta} <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Pro */}
            <div className="bg-stone-50 border border-dashed border-stone-300 rounded-2xl p-7 flex flex-col relative overflow-hidden">
              <div className="absolute top-5 right-5">
                <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-stone-900 text-white px-2.5 py-1 rounded-full">
                  <Sparkles className="w-3 h-3 text-violet-300" />{c.pricing.pro.badge}
                </span>
              </div>
              <div className="mb-6">
                <h3 className="text-[17px] font-bold text-stone-700 mb-1">{c.pricing.pro.name}</h3>
                <p className="text-[13px] text-stone-500">{c.pricing.pro.desc}</p>
              </div>
              <div className="mb-7 flex items-center gap-2 h-[50px]">
                <Lock className="w-5 h-5 text-stone-400" />
                <span className="text-[22px] font-semibold text-stone-500 tracking-tight">{c.pricing.pro.price}</span>
              </div>
              <ul className="space-y-3 mb-2 flex-1">
                {c.pricing.pro.features.map((feat, i) => (
                  <li key={i} className="flex items-center gap-2.5 text-[13.5px] text-stone-600">
                    <CheckCircle2 className="w-4 h-4 text-stone-400 shrink-0" />
                    {feat}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="py-14 px-5 md:py-24 md:px-6 bg-stone-50 border-t border-stone-100 scroll-mt-20">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8 md:mb-12">
            <p className="text-[11px] font-semibold text-violet-500 uppercase tracking-widest mb-3">{c.faq.label}</p>
            <h2 className="text-[26px] md:text-[34px] font-bold tracking-tight">{c.faq.headline}</h2>
          </div>
          <div className="space-y-2">
            {c.faq.items.map((item, i) => <FaqItem key={i} id={String(i)} q={item.q} a={item.a} />)}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="relative py-20 px-5 md:py-32 md:px-6 bg-[#09090B] overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_100%,rgba(124,58,237,0.15),transparent)] pointer-events-none" />
        <div className="max-w-xl md:max-w-3xl mx-auto text-center relative z-10">
          <h2 className="text-[30px] md:text-[48px] font-bold tracking-tight leading-tight mb-4 text-white">
            {c.cta.headline}
          </h2>
          <p className="text-[14px] md:text-[16px] text-stone-400 leading-relaxed mb-8">{c.cta.sub}</p>
          <Link href="/sign-up" className="inline-flex items-center gap-2 bg-violet-600 text-white text-[14px] font-semibold px-8 py-3.5 rounded-lg hover:bg-violet-500 hover:shadow-xl hover:shadow-violet-900/50 hover:-translate-y-0.5 transition-all">
            {c.cta.button} <ArrowRight className="w-4 h-4" />
          </Link>
          <p className="text-[12px] text-stone-600 mt-4">{c.cta.note}</p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/5 bg-[#09090B] py-8 px-5 md:px-6">
        <div className="max-w-5xl mx-auto flex flex-col gap-6 md:flex-row md:items-center md:justify-between text-[12px] text-stone-500">
          <div className="flex items-center justify-center gap-2">
            <RumiosLogo size={18} inverted />
            <span className="font-medium text-stone-300">RUMIOS</span>
            <span className="text-stone-700">·</span>
            <span>rumios.ai</span>
          </div>
          <nav aria-label={UI_EXTRA[lang].footerLinks} className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            {c.floatingNav.map(item => (
              <a key={item.href} href={item.href} className="hover:text-white transition-colors">{item.label}</a>
            ))}
            <Link href="/sign-in" className="hover:text-white transition-colors">{UI_EXTRA[lang].signin}</Link>
            <Link href="/mentions-legales" className="hover:text-white transition-colors">{c.legal}</Link>
          </nav>
          <div className="flex flex-col items-center md:items-end gap-1">
            <p>© 2026 Vereda Numérica · {c.footer}</p>
            <p className="flex items-center gap-1 text-stone-600">
              Made by Aurélien with <Heart className="w-3 h-3 fill-rose-500 text-rose-500" /> in Portugal
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
