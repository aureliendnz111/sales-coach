"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { StepCard } from "@/components/scripts/StepCard";
import { ObjectionCard } from "@/components/scripts/ObjectionCard";
import { ArrowLeft, ArrowRight, Sparkles, Check, Loader2 } from "lucide-react";

const QUESTIONS = [
  { key: "offer", label: "Quelle est ton offre ?", placeholder: "Ex: Coaching business 0 to 1 — 3 mois d'accompagnement intensif pour lancer sa boîte et signer ses premiers clients", hint: "Décris ce que tu vends en une phrase claire." },
  { key: "price", label: "Quel est le prix et la durée de ton offre ?", placeholder: "Ex: 3000€ pour 3 mois, soit 1000€/mois", hint: "Sois précis — ça servira à construire l'étape prix." },
  { key: "target", label: "Qui est ta cible idéale ?", placeholder: "Ex: Entrepreneurs en devenir de 25-40 ans, salariés qui veulent se lancer, avec une idée de business mais sans méthode", hint: "Plus c'est précis, meilleur sera le script." },
  { key: "pains", label: "Quelles sont les 3 douleurs principales de ta cible ?", placeholder: "Ex: Ne sait pas par où commencer, peur de l'échec, se sent seul et sans guidance, perd du temps sur les mauvaises priorités", hint: "Ces douleurs seront utilisées dans les questions de qualification." },
  { key: "objections", label: "Quelles objections entends-tu le plus souvent ?", placeholder: "Ex: C'est trop cher, je vais y réfléchir, ce n'est pas le bon moment, j'en parle à ma femme", hint: "Liste-les séparées par des virgules." },
  { key: "duration", label: "Combien de temps dure ton call de closing habituel ?", placeholder: "30", hint: "En minutes." },
  { key: "tone", label: "Comment tu décrirais ton style de vente ?", placeholder: "Ex: Direct et honnête, basé sur la valeur plutôt que la pression, je veux vraiment aider mes prospects", hint: "Le ton du script s'adaptera à ta personnalité." },
];

type Answers = Record<string, string>;
type GeneratedScript = {
  name: string;
  goal: string;
  reminders: string[];
  steps: unknown[];
  objections: unknown[];
};

export function GuidedWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [generated, setGenerated] = useState<GeneratedScript | null>(null);
  const [error, setError] = useState<string | null>(null);

  const current = QUESTIONS[step];
  const isLast = step === QUESTIONS.length - 1;
  const progress = ((step) / QUESTIONS.length) * 100;

  async function generate() {
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch("/api/scripts/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setGenerated(data.script);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur inconnue");
    } finally {
      setGenerating(false);
    }
  }

  async function save() {
    if (!generated) return;
    setSaving(true);
    try {
      const res = await fetch("/api/scripts/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ script: { ...generated, duration_minutes: parseInt(answers.duration) || 30 } }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      router.push(`/scripts/${data.scriptId}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur lors de la sauvegarde");
      setSaving(false);
    }
  }

  // Écran de génération
  if (generating) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="font-semibold text-lg">Génération de ton script en cours…</p>
        <p className="text-sm text-muted-foreground max-w-sm">Claude analyse tes réponses et construit les étapes, les questions et les réponses aux objections.</p>
      </div>
    );
  }

  // Écran de preview du script généré
  if (generated) {
    return (
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-xs font-semibold text-primary uppercase tracking-wide">Script généré par IA</span>
            </div>
            <h2 className="text-xl font-bold">{generated.name}</h2>
            <p className="text-sm text-muted-foreground mt-1">{generated.goal}</p>
          </div>
          <Button onClick={save} disabled={saving} className="flex-shrink-0">
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check className="w-4 h-4 mr-2" />}
            Sauvegarder
          </Button>
        </div>

        {generated.reminders?.length > 0 && (
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 rounded-lg p-4 space-y-1">
            <p className="text-xs font-semibold text-amber-800 uppercase tracking-wide">Rappels</p>
            {(generated.reminders as string[]).map((r, i) => <p key={i} className="text-sm text-amber-900">• {r}</p>)}
          </div>
        )}

        <div className="space-y-2">
          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">{(generated.steps as unknown[]).length} étapes</p>
          {(generated.steps as Parameters<typeof StepCard>[0]["step"][]).map((s) => (
            <StepCard key={s.order} step={{ ...s, id: String(s.order) }} />
          ))}
        </div>

        <div className="space-y-2">
          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">{(generated.objections as unknown[]).length} objections</p>
          {(generated.objections as Parameters<typeof ObjectionCard>[0]["objection"][]).map((o) => (
            <ObjectionCard key={o.order} objection={{ ...o, id: String(o.order) }} />
          ))}
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    );
  }

  // Wizard questions
  return (
    <div className="max-w-xl mx-auto space-y-8">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Question {step + 1} sur {QUESTIONS.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-1.5" />
      </div>

      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">{current.label}</h2>
          <p className="text-sm text-muted-foreground mt-1">{current.hint}</p>
        </div>

        {current.key === "duration" ? (
          <Input
            type="number"
            placeholder={current.placeholder}
            value={answers[current.key] ?? ""}
            onChange={(e) => setAnswers({ ...answers, [current.key]: e.target.value })}
            className="text-base"
          />
        ) : (
          <Textarea
            placeholder={current.placeholder}
            value={answers[current.key] ?? ""}
            onChange={(e) => setAnswers({ ...answers, [current.key]: e.target.value })}
            rows={4}
            className="text-base resize-none"
          />
        )}

        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setStep(s => s - 1)} disabled={step === 0}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Précédent
        </Button>

        {isLast ? (
          <Button onClick={generate} disabled={!answers[current.key]?.trim()}>
            <Sparkles className="w-4 h-4 mr-2" /> Générer mon script
          </Button>
        ) : (
          <Button onClick={() => setStep(s => s + 1)} disabled={!answers[current.key]?.trim()}>
            Suivant <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
}
