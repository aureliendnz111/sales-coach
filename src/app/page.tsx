"use client";
import { useAuth } from "@clerk/nextjs";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { PhoneCall, FileText, Zap, CheckCircle2, TrendingUp, BarChart2, ArrowRight, Mic, Target, Brain, Swords, Plus, Minus, Menu, X, AlertTriangle, RefreshCw, TrendingDown, Heart, ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { RumiosLogo } from "@/components/RumiosLogo";
import { useLang, type Lang } from "@/lib/lang-context";

const PROBLEM_STYLES = [
  { icon: AlertTriangle, iconBg: "bg-rose-50", iconColor: "text-rose-500", accent: "border-rose-100" },
  { icon: RefreshCw,     iconBg: "bg-orange-50", iconColor: "text-orange-500", accent: "border-orange-100" },
  { icon: TrendingDown,  iconBg: "bg-red-50", iconColor: "text-red-500", accent: "border-red-100" },
] as const;

const FEATURE_STYLES = [
  { iconBg: "bg-violet-50", iconColor: "text-violet-600" },
  { iconBg: "bg-emerald-50", iconColor: "text-emerald-600" },
  { iconBg: "bg-amber-50", iconColor: "text-amber-500" },
  { iconBg: "bg-sky-50", iconColor: "text-sky-600" },
] as const;

const STEP_COLORS = ["text-violet-400", "text-blue-400", "text-emerald-400"] as const;

const METRIC_COLORS = [
  "text-violet-400",
  "text-sky-400",
  "text-emerald-400",
  "text-amber-400",
  "text-blue-400",
  "text-violet-300",
] as const;

const PREVIEW_TABS: Record<Lang, { label: string; src: string; url: string; caption: string }[]> = {
  fr: [
    { label: "Script Builder", src: "/screenshot-script-builder.png", url: "app.rumios.io/scripts/mon-script", caption: "Structurez vos étapes, questions et objections dans un script guidé — prêt à utiliser en appel." },
    { label: "Dashboard", src: "/screenshot-2.png", url: "app.rumios.io/dashboard", caption: "Vue d'ensemble de votre activité — scripts actifs, calls du mois et score moyen." },
    { label: "Analyse de call", src: "/screenshot-analyses.png", url: "app.rumios.io/call-analysis", caption: "Score détaillé sur 6 dimensions, synthèse IA, points forts et axes d'amélioration après chaque call." },
  ],
  en: [
    { label: "Script Builder", src: "/screenshot-script-builder.png", url: "app.rumios.io/scripts/my-script", caption: "Structure your steps, questions and objections in a guided script — ready to use on every call." },
    { label: "Dashboard", src: "/screenshot-2.png", url: "app.rumios.io/dashboard", caption: "Overview of your activity — active scripts, calls this month, and average score." },
    { label: "Call Analysis", src: "/screenshot-analyses.png", url: "app.rumios.io/call-analysis", caption: "Detailed score across 6 dimensions, AI synthesis, strengths and improvement areas after every call." },
  ],
  pt: [
    { label: "Script Builder", src: "/screenshot-script-builder.png", url: "app.rumios.io/scripts/meu-guiao", caption: "Estruture as suas etapas, perguntas e objeções num guião guiado — pronto para usar em cada chamada." },
    { label: "Dashboard", src: "/screenshot-2.png", url: "app.rumios.io/dashboard", caption: "Vista geral da sua atividade — guiões ativos, chamadas do mês e pontuação média." },
    { label: "Análise de chamada", src: "/screenshot-analyses.png", url: "app.rumios.io/call-analysis", caption: "Pontuação detalhada em 6 dimensões, síntese IA, pontos fortes e eixos de melhoria após cada chamada." },
  ],
};

const CONTENT = {
  fr: {
    nav: { signin: "Se connecter", signup: "Essayer gratuitement" },
    floatingNav: [
      { label: "Fonctionnalités", href: "#features" },
      { label: "Comment ça marche", href: "#how" },
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
        { icon: FileText, title: "Builder", description: "Partez de zéro ou d'un template. Structurez vos étapes, vos questions clés, vos réponses aux objections. Votre process, formalisé.", tag: "Disponible", tagColor: "bg-emerald-50 text-emerald-700" },
        { icon: PhoneCall, title: "Analyse", description: "Collez le transcript. Recevez un score sur 100, vos points forts, ce qui a bloqué et trois actions concrètes pour le prochain appel.", tag: "Disponible", tagColor: "bg-emerald-50 text-emerald-700" },
        { icon: Zap, title: "Copilot", description: "Suggestions en temps réel basées sur votre script. Sachez toujours où vous en êtes et quoi dire face à chaque objection.", tag: "Bientôt", tagColor: "bg-stone-100 text-stone-500" },
        { icon: Swords, title: "Playground", description: "Simulez un appel complet face à une IA qui joue le prospect. Rodez votre pitch, testez vos réponses, sans aucun enjeu.", tag: "Bientôt", tagColor: "bg-stone-100 text-stone-500" },
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
        { number: "01", title: "Créez votre script", description: "Décrivez votre offre ou partez d'un template. Rumios structure vos étapes, vos questions clés et vos réponses aux objections. C'est votre référence pour chaque call." },
        { number: "02", title: "Collez le transcript de votre call", description: "Enregistrez avec tl;dv, Fathom ou Otter.ai, puis collez le transcript dans Rumios. L'IA compare votre call à votre script et calcule un score sur 100 en quelques secondes." },
        { number: "03", title: "Lisez le feedback, corrigez, progressez", description: "Score détaillé sur 6 dimensions, écarts par rapport à votre script, erreurs identifiées et trois actions concrètes pour le prochain call. Suivez votre progression dans le temps." },
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
    pricing: {
      label: "Tarifs",
      headline: "Simple. Transparent.",
      free: {
        name: "Gratuit",
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
          "Playground — simulation d'appels",
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
        { q: "Quels types de calls peuvent être analysés ?", a: "Tout appel de vente avec un transcript : closing, découverte, suivi, relance. Peu importe le format ou la plateforme. Google Meet, Zoom, Teams — du moment que vous avez le texte, Rumios peut l'analyser." },
        { q: "Comment fonctionne le scoring ?", a: "L'IA analyse le transcript sur 6 dimensions (process, découverte, objections, posture, conclusion, score global) et retourne une note sur 100 avec des recommandations concrètes pour chaque axe." },
        { q: "C'est quoi le Playground ?", a: "Une simulation d'appel face à une IA qui joue le rôle du prospect. Vous pouvez vous entraîner autant de fois que vous voulez avant un vrai call, sans aucun enjeu. Cette fonctionnalité est en cours de développement." },
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
  },
  en: {
    nav: { signin: "Sign in", signup: "Try for free" },
    floatingNav: [
      { label: "Features", href: "#features" },
      { label: "How it works", href: "#how" },
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
        { icon: FileText, title: "Builder", description: "Start from scratch or a template. Structure your stages, key questions, and objection responses. Your process, formalized.", tag: "Available", tagColor: "bg-emerald-50 text-emerald-700" },
        { icon: PhoneCall, title: "Analyse", description: "Paste the transcript. Get a score out of 100, your strengths, what blocked the deal, and three concrete actions for the next call.", tag: "Available", tagColor: "bg-emerald-50 text-emerald-700" },
        { icon: Zap, title: "Copilot", description: "Real-time suggestions based on your script. Always know where you are and what to say when an objection comes up.", tag: "Coming soon", tagColor: "bg-stone-100 text-stone-500" },
        { icon: Swords, title: "Playground", description: "Simulate a full sales call against an AI playing the prospect. Test your responses, sharpen your pitch, with nothing at stake.", tag: "Coming soon", tagColor: "bg-stone-100 text-stone-500" },
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
        { number: "01", title: "Build your script", description: "Describe your offer or start from a template. Rumios structures your stages, key questions, and objection responses. This becomes your reference for every call." },
        { number: "02", title: "Paste your call transcript", description: "Record with tl;dv, Fathom, or Otter.ai, then paste the transcript into Rumios. The AI compares your call against your script and generates a score out of 100 in seconds." },
        { number: "03", title: "Read the feedback. Fix it. Repeat.", description: "Detailed score across 6 dimensions, gaps vs. your script, identified mistakes, and three concrete actions for the next call. Track your improvement over time." },
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
    pricing: {
      label: "Pricing",
      headline: "Simple. Transparent.",
      free: {
        name: "Free",
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
          "Playground — call simulation",
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
  pt: {
    nav: { signin: "Entrar", signup: "Começar grátis" },
    floatingNav: [
      { label: "Funcionalidades", href: "#features" },
      { label: "Como funciona", href: "#how" },
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
      label: "Análise — Chamada com Marie D.",
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
        { type: "warn", text: "Objeção de preço não recadrada — a corrigir na próxima chamada" },
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
    features: {
      label: "A solução",
      headline: "Tudo o que precisa para vender melhor ao telefone.",
      items: [
        { icon: FileText, title: "Builder", description: "Comece do zero ou de um modelo. Estruture as suas etapas, perguntas-chave e respostas às objeções. O seu processo, formalizado.", tag: "Disponível", tagColor: "bg-emerald-50 text-emerald-700" },
        { icon: PhoneCall, title: "Análise", description: "Cole o transcript. Receba uma pontuação em 100, os seus pontos fortes, o que bloqueou e três ações concretas para a próxima chamada.", tag: "Disponível", tagColor: "bg-emerald-50 text-emerald-700" },
        { icon: Zap, title: "Copilot", description: "Sugestões em tempo real baseadas no seu guião. Saiba sempre onde está e o que dizer perante cada objeção.", tag: "Em breve", tagColor: "bg-stone-100 text-stone-500" },
        { icon: Swords, title: "Playground", description: "Simule uma chamada completa com uma IA que interpreta o prospect. Treine o seu pitch, teste as suas respostas, sem nenhum risco.", tag: "Em breve", tagColor: "bg-stone-100 text-stone-500" },
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
    steps: {
      label: "Como funciona",
      headline: "Três passos. Dez minutos.",
      items: [
        { number: "01", title: "Crie o seu guião", description: "Descreva a sua oferta ou parta de um modelo. O Rumios estrutura as suas etapas, perguntas-chave e respostas às objeções. É a sua referência para cada chamada." },
        { number: "02", title: "Cole o transcript da sua chamada", description: "Grave com tl;dv, Fathom ou Otter.ai, depois cole o transcript no Rumios. A IA compara a sua chamada com o seu guião e calcula uma pontuação em 100 em segundos." },
        { number: "03", title: "Leia o feedback, corrija, progrida", description: "Pontuação detalhada em 6 dimensões, desvios em relação ao seu guião, erros identificados e três ações concretas para a próxima chamada. Acompanhe o seu progresso ao longo do tempo." },
      ],
    },
    profiles: {
      label: "Para quem",
      headline: "Para todos os que vendem a sua expertise.",
      items: [
        { emoji: "🎯", title: "Closers independentes", desc: "Cada negócio conta. Analise cada chamada para não deixar vendas na mesa por falta de feedback." },
        { emoji: "🧑‍💼", title: "Coaches", desc: "Vende o seu acompanhamento ao telefone. Estruture o seu fecho, meça o que bloqueia, progrida em cada conversa." },
        { emoji: "🚀", title: "Empreendedores e freelancers", desc: "A venda não é o seu trabalho principal, mas condiciona o seu crescimento. O Rumios dá-lhe as ferramentas para a dominar." },
      ],
    },
    pricing: {
      label: "Preços",
      headline: "Simples. Transparente.",
      free: {
        name: "Grátis",
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
          "Playground — simulação de chamadas",
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
        { q: "Que tipos de chamadas podem ser analisadas?", a: "Qualquer chamada de venda com transcript: fecho, descoberta, acompanhamento, reativação. O formato não importa. Google Meet, Zoom, Teams — desde que tenha o texto, o Rumios pode analisar." },
        { q: "Como funciona a pontuação?", a: "A IA analisa o transcript em 6 dimensões (processo, descoberta, objeções, postura, fecho, pontuação global) e devolve uma nota em 100 com recomendações concretas para cada área." },
        { q: "O que é o Playground?", a: "Uma simulação de chamada com uma IA que interpreta o prospect. Pode praticar quantas vezes quiser antes de uma chamada real, sem nenhum risco. Esta funcionalidade está em desenvolvimento." },
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
  },
} as const;

const LANG_LABELS: Record<Lang, string> = { fr: "Français", en: "English", pt: "Português" };

function FloatingNav({ lang, setLang }: { lang: Lang; setLang: (l: Lang) => void }) {
  const c = CONTENT[lang];
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

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
            <button key={item.href} onClick={() => scrollToSection(item.href)} className="text-[12.5px] text-stone-400 hover:text-white px-3 py-1 rounded-full hover:bg-white/8 transition-colors">
              {item.label}
            </button>
          ))}
          <div className="w-px h-4 bg-white/10" />
          <div ref={langRef} className="relative">
            <button
              onClick={() => setLangOpen(o => !o)}
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
          <button onClick={() => setMobileOpen(o => !o)} className="p-1.5 rounded-full hover:bg-white/8 transition-colors">
            {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
          <Link href="/sign-up" className="text-[12.5px] font-semibold bg-violet-600 text-white px-3.5 py-1.5 rounded-full hover:bg-violet-500 transition-colors">
            {ctaLabel}
          </Link>
        </div>

        <Link href="/sign-up" className="hidden md:block ml-1 text-[12.5px] font-semibold bg-violet-600 text-white px-3.5 py-1.5 rounded-full hover:bg-violet-500 transition-colors">
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

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <button onClick={() => setOpen(o => !o)}
      className="w-full text-left border border-stone-200 rounded-xl overflow-hidden hover:border-stone-300 hover:shadow-sm transition-all">
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
  const { lang, setLang } = useLang();
  const [activePreview, setActivePreview] = useState(0);
  const [heroScore, setHeroScore] = useState(0);
  const [barsReady, setBarsReady] = useState(false);

  useEffect(() => {
    if (isLoaded && isSignedIn) router.push("/dashboard");
  }, [isLoaded, isSignedIn, router]);

  useEffect(() => {
    const t = setTimeout(() => {
      setBarsReady(true);
      const duration = 1200;
      const target = 78;
      const start = performance.now();
      const tick = (now: number) => {
        const p = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        setHeroScore(Math.round(eased * target));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, 400);
    return () => clearTimeout(t);
  }, []);

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
        </div>

        {/* Score card mock */}
        <div className="max-w-xl mx-auto mt-16 relative z-10">
          <div className="bg-white rounded-2xl overflow-hidden shadow-2xl shadow-black/50 ring-1 ring-white/10">
            <div className="bg-[#0E0E16] px-5 py-4 flex items-start justify-between">
              <div>
                <p className="text-[11px] font-medium text-stone-500 uppercase tracking-widest">{c.mockCard.label}</p>
                <p className="text-[14px] font-medium text-white mt-1">{c.mockCard.subtitle}</p>
              </div>
              <div className="text-right shrink-0">
                <div className="text-[44px] font-bold text-violet-400 leading-none tabular-nums">{heroScore}</div>
                <p className="text-[11px] text-stone-500 mt-0.5">{c.mockCard.scoreLabel}</p>
              </div>
            </div>
            <div className="px-5 py-4 grid grid-cols-2 sm:grid-cols-3 gap-3 border-b border-stone-100">
              {c.mockCard.items.map((item, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-stone-500">{item.label}</span>
                    <span className="text-[11px] font-semibold text-stone-700">{item.score}{"suffix" in item ? item.suffix : ""}</span>
                  </div>
                  <div className="h-1 bg-stone-100 rounded-full overflow-hidden">
                    <div
                      className={cn("h-full rounded-full transition-all ease-out", item.color)}
                      style={{
                        width: barsReady ? `${item.score}%` : "0%",
                        transitionDuration: "900ms",
                        transitionDelay: barsReady ? `${i * 80}ms` : "0ms",
                      }}
                    />
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

      {/* ── PROBLEM ── */}
      <section className="py-14 px-5 md:py-20 md:px-6 bg-stone-50 border-y border-stone-100">
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

      {/* CTA strip — Problem */}
      <div className="px-5 md:px-6 pb-6 bg-stone-50">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 bg-white border border-stone-200 rounded-2xl px-6 py-5 shadow-sm">
          <p className="text-[15px] font-semibold text-stone-900 text-center sm:text-left">
            {lang === "fr" ? "Rumios règle ces 3 problèmes." : lang === "en" ? "Rumios fixes all three." : "O Rumios resolve estes 3 problemas."}
          </p>
          <Link href="/sign-up" className="shrink-0 flex items-center gap-2 bg-violet-600 text-white text-[13.5px] font-semibold px-5 py-2.5 rounded-lg hover:bg-violet-500 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-violet-900/30 transition-all">
            {lang === "fr" ? "Commencer gratuitement" : lang === "en" ? "Get started for free" : "Começar gratuitamente"} <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* ── FEATURES ── */}
      <section id="features" className="py-14 px-5 md:py-24 md:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8 md:mb-12">
            <p className="text-[11px] font-semibold text-violet-500 uppercase tracking-widest mb-3">{c.features.label}</p>
            <h2 className="text-[26px] md:text-[34px] font-bold tracking-tight">{c.features.headline}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
            {c.features.items.map((f, i) => (
              <div key={f.title} className="bg-white border border-stone-200 rounded-2xl p-6 flex flex-col gap-4 hover:border-violet-200 hover:shadow-lg hover:shadow-violet-100/50 hover:-translate-y-1 transition-all duration-200">
                <div className="flex items-start justify-between">
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", FEATURE_STYLES[i].iconBg)}>
                    <f.icon className={cn("w-5 h-5", FEATURE_STYLES[i].iconColor)} />
                  </div>
                  <span className={cn("text-[11px] font-medium px-2.5 py-1 rounded-full", f.tagColor)}>{f.tag}</span>
                </div>
                <div>
                  <h3 className="text-[15px] font-semibold text-stone-900 mb-2 leading-snug">{f.title}</h3>
                  <p className="text-[13px] text-stone-500 leading-relaxed">{f.description}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-10 md:mt-12">
            <Link href="/sign-up" className="inline-flex items-center gap-2 bg-violet-600 text-white text-[14px] font-semibold px-6 py-2.5 rounded-lg hover:bg-violet-500 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-violet-900/30 transition-all">
              {lang === "fr" ? "Essayer gratuitement" : lang === "en" ? "Try for free" : "Experimentar gratuitamente"} <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <p className="text-[12px] text-stone-400 mt-2.5">
              {lang === "fr" ? "Gratuit · Sans carte bancaire" : lang === "en" ? "Free · No credit card required" : "Grátis · Sem cartão de crédito"}
            </p>
          </div>
        </div>
      </section>

      {/* ── PRODUCT PREVIEW ── */}
      <section className="py-14 px-5 md:py-24 md:px-6 bg-stone-50 border-y border-stone-100">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8 md:mb-10">
            <p className="text-[11px] font-semibold text-violet-500 uppercase tracking-widest mb-3">
              {lang === "fr" ? "Aperçu" : lang === "en" ? "Preview" : "Pré-visualização"}
            </p>
            <h2 className="text-[26px] md:text-[34px] font-bold tracking-tight">
              {lang === "fr" ? "Voyez Rumios en action." : lang === "en" ? "See Rumios in action." : "Veja o Rumios em ação."}
            </h2>
          </div>
          <div className="flex items-center justify-center gap-2 mb-8 flex-wrap">
            {PREVIEW_TABS[lang].map((tab, i) => (
              <button key={i} onClick={() => setActivePreview(i)}
                className={cn("text-[13px] font-medium px-4 py-2 rounded-full transition-colors",
                  activePreview === i ? "bg-violet-600 text-white shadow-md shadow-violet-900/20" : "bg-stone-100 text-stone-500 hover:bg-stone-200 hover:text-stone-700")}>
                {tab.label}
              </button>
            ))}
          </div>
          {/* Browser frame */}
          <div className="rounded-2xl overflow-hidden shadow-2xl border border-stone-200">
            {/* Chrome bar */}
            <div className="bg-[#E8E8E8] px-4 py-2.5 flex items-center gap-3 border-b border-stone-300">
              {/* Traffic lights */}
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="w-3 h-3 rounded-full bg-[#FF5F57]" />
                <span className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
                <span className="w-3 h-3 rounded-full bg-[#28C840]" />
              </div>
              {/* URL bar */}
              <div className="flex-1 bg-white/70 rounded-md px-3 py-1 flex items-center gap-2 min-w-0">
                <svg className="w-3 h-3 text-stone-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                <span className="text-[11px] text-stone-500 truncate">{PREVIEW_TABS[lang][activePreview].url}</span>
              </div>
            </div>
            {/* Screenshot */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={PREVIEW_TABS[lang][activePreview].src} alt={PREVIEW_TABS[lang][activePreview].label} className="w-full h-auto block" />
          </div>
          <p className="text-center text-[13px] text-stone-400 mt-4">{PREVIEW_TABS[lang][activePreview].caption}</p>
        </div>
      </section>

      {/* ── METRICS ── */}
      <section className="py-14 px-5 md:py-20 md:px-6 bg-[#09090B] text-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8 md:mb-10">
            <p className="text-[11px] font-semibold text-violet-400 uppercase tracking-widest mb-3">{c.metrics.label}</p>
            <h2 className="text-[26px] md:text-[32px] font-bold tracking-tight mb-3">{c.metrics.headline}</h2>
            <p className="text-[14px] md:text-[15px] text-stone-400 max-w-lg mx-auto">{c.metrics.sub}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {c.metrics.items.map((m, i) => (
              <div key={m.label} className="bg-white/5 border border-white/8 rounded-xl p-5 flex items-start gap-3 hover:bg-white/8 hover:border-violet-700/30 transition-colors duration-200">
                <div className="w-8 h-8 bg-white/8 rounded-lg flex items-center justify-center shrink-0">
                  <m.icon className={cn("w-4 h-4", METRIC_COLORS[i])} />
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

      {/* ── HOW IT WORKS ── */}
      <section id="how" className="py-14 px-5 md:py-24 md:px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8 md:mb-12">
            <p className="text-[11px] font-semibold text-violet-500 uppercase tracking-widest mb-3">{c.steps.label}</p>
            <h2 className="text-[26px] md:text-[34px] font-bold tracking-tight">{c.steps.headline}</h2>
          </div>
          <div className="space-y-3">
            {c.steps.items.map((step, i) => (
              <div key={step.number} className="flex items-start gap-4 md:gap-6 px-5 py-5 md:px-7 md:py-6 bg-white border border-stone-200 rounded-2xl hover:border-violet-200 hover:shadow-md hover:shadow-violet-100/40 transition-all duration-200">
                <span className={cn("text-[32px] md:text-[36px] font-bold leading-none tabular-nums shrink-0 mt-0.5", STEP_COLORS[i])}>{step.number}</span>
                <div>
                  <h3 className="text-[14px] md:text-[15px] font-semibold text-stone-900 mb-1.5">{step.title}</h3>
                  <p className="text-[13px] md:text-[13.5px] text-stone-500 leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link href="/sign-up" className="inline-flex items-center gap-1.5 text-[14px] font-medium text-violet-600 hover:text-violet-700 transition-colors group">
              {lang === "fr" ? "Créer mon compte gratuitement" : lang === "en" ? "Create my free account" : "Criar a minha conta grátis"}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
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
            {c.profiles.items.map((p) => (
              <div key={p.title} className="bg-white border border-stone-200 rounded-2xl p-6 hover:border-violet-200 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                <div className="text-2xl mb-3">{p.emoji}</div>
                <h3 className="text-[14.5px] font-semibold text-stone-900 mb-2">{p.title}</h3>
                <p className="text-[13px] text-stone-500 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="py-14 px-5 md:py-24 md:px-6">
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
            <div className="bg-stone-50 border border-stone-200 rounded-2xl p-7 flex flex-col relative overflow-hidden">
              <div className="absolute top-5 right-5">
                <span className="text-[11px] font-medium bg-stone-800 text-stone-300 px-2.5 py-1 rounded-full">{c.pricing.pro.badge}</span>
              </div>
              <div className="mb-6">
                <h3 className="text-[17px] font-bold text-stone-400 mb-1">{c.pricing.pro.name}</h3>
                <p className="text-[13px] text-stone-400">{c.pricing.pro.desc}</p>
              </div>
              <div className="mb-7">
                <span className="text-[42px] font-bold text-stone-300 tracking-tight">{c.pricing.pro.price}</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {c.pricing.pro.features.map((feat, i) => (
                  <li key={i} className="flex items-center gap-2.5 text-[13.5px] text-stone-400">
                    <CheckCircle2 className="w-4 h-4 text-stone-300 shrink-0" />
                    {feat}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA strip — before FAQ */}
      <div className="py-14 px-5 md:px-6 bg-[#09090B]">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-white text-[20px] md:text-[24px] font-bold tracking-tight mb-2">
            {lang === "fr" ? "Prêt à analyser votre prochain call ?" : lang === "en" ? "Ready to analyze your next call?" : "Pronto para analisar a sua próxima chamada?"}
          </p>
          <p className="text-stone-500 text-[14px] mb-6">
            {lang === "fr" ? "Gratuit pour commencer. Sans carte bancaire." : lang === "en" ? "Free to start. No credit card." : "Grátis para começar. Sem cartão de crédito."}
          </p>
          <Link href="/sign-up" className="inline-flex items-center gap-2 bg-violet-600 text-white text-[14px] font-semibold px-7 py-3 rounded-lg hover:bg-violet-500 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-violet-900/40 transition-all">
            {lang === "fr" ? "Commencer gratuitement" : lang === "en" ? "Get started for free" : "Começar gratuitamente"} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* ── FAQ ── */}
      <section id="faq" className="py-14 px-5 md:py-24 md:px-6">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8 md:mb-12">
            <p className="text-[11px] font-semibold text-violet-500 uppercase tracking-widest mb-3">{c.faq.label}</p>
            <h2 className="text-[26px] md:text-[34px] font-bold tracking-tight">{c.faq.headline}</h2>
          </div>
          <div className="space-y-2">
            {c.faq.items.map((item, i) => <FaqItem key={i} q={item.q} a={item.a} />)}
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
      <footer className="border-t border-white/5 bg-[#09090B] py-6 px-5 md:py-7 md:px-6">
        <div className="max-w-5xl mx-auto flex flex-col items-center gap-2 md:flex-row md:items-center md:justify-between text-[12px] text-stone-600">
          <div className="flex items-center gap-2">
            <RumiosLogo size={18} inverted />
            <span className="font-medium text-stone-400">RUMIOS</span>
            <span className="text-stone-700">·</span>
            <span>rumios.ai</span>
          </div>
          <p>© 2026 · {c.footer}</p>
          <p className="flex items-center gap-1 text-stone-600">
            Made by Aurélien with <Heart className="w-3 h-3 fill-stone-500 text-stone-500" /> in Portugal
          </p>
        </div>
      </footer>
    </div>
  );
}
