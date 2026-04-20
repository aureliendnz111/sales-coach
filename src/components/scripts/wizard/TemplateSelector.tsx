"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { TEMPLATES } from "@/lib/templates";
import { Button } from "@/components/ui/button";
import { StepCard } from "@/components/scripts/StepCard";
import { ObjectionCard } from "@/components/scripts/ObjectionCard";
import { ChevronLeft, Eye, Copy, Loader2, FileText, Clock, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORY_STYLES: Record<string, { bg: string; text: string }> = {
  Business:  { bg: "bg-violet-100", text: "text-violet-700" },
  Finances:  { bg: "bg-emerald-100", text: "text-emerald-700" },
  Sport:     { bg: "bg-sky-100",     text: "text-sky-700" },
};

function CategoryBadge({ category }: { category: string }) {
  const style = CATEGORY_STYLES[category] ?? { bg: "bg-stone-100", text: "text-stone-500" };
  return (
    <span className={cn("text-[11px] font-semibold px-2.5 py-1 rounded-full", style.bg, style.text)}>
      {category}
    </span>
  );
}

export function TemplateSelector() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const categories = Array.from(new Set(TEMPLATES.map(t => t.category)));
  const filtered = activeCategory ? TEMPLATES.filter(t => t.category === activeCategory) : TEMPLATES;
  const previewedTemplate = TEMPLATES.find(t => t.id === preview);

  async function useTemplate(templateId: string) {
    const template = TEMPLATES.find(t => t.id === templateId);
    if (!template) return;
    setLoading(templateId); setError(null);
    try {
      const res = await fetch("/api/scripts/save", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ script: template.script }) });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      router.push(`/scripts/${data.scriptId}`);
    } catch (e) { setError(e instanceof Error ? e.message : "Erreur lors de la copie"); setLoading(null); }
  }

  if (previewedTemplate) {
    const s = previewedTemplate.script;
    return (
      <div className="space-y-6 pb-8">
        <div className="flex items-center justify-between">
          <button onClick={() => setPreview(null)} className="flex items-center gap-1 text-sm text-stone-400 hover:text-stone-700 transition-colors">
            <ChevronLeft className="w-4 h-4" /> Templates
          </button>
          <Button onClick={() => useTemplate(previewedTemplate.id)} disabled={!!loading} className="gap-2 h-8 text-xs">
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Copy className="w-3.5 h-3.5" />}
            Utiliser ce template
          </Button>
        </div>

        <div className="border border-stone-200 rounded-xl p-5 bg-white space-y-3">
          <div className="flex items-center gap-2">
            <CategoryBadge category={previewedTemplate.category} />
            <p className="text-[11px] text-stone-400">Par {previewedTemplate.author}</p>
          </div>
          <h2 className="text-[18px] font-semibold text-stone-900">{s.name}</h2>
          <p className="text-sm text-stone-500">{s.goal}</p>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {previewedTemplate.tags.map(tag => (
              <span key={tag} className="text-[11px] bg-stone-100 text-stone-500 px-2 py-0.5 rounded-full">{tag}</span>
            ))}
          </div>
        </div>

        {s.reminders?.length > 0 && (
          <div className="border border-amber-200 bg-amber-50 rounded-xl p-4 space-y-1.5">
            <p className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider">Rappels</p>
            {s.reminders.map((r, i) => <p key={i} className="text-sm text-amber-800">· {r}</p>)}
          </div>
        )}

        <div className="space-y-2">
          <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">Étapes · {s.steps.length}</p>
          {s.steps.map(step => <StepCard key={step.order} step={{ ...step, id: String(step.order) }} />)}
        </div>

        <div className="space-y-2">
          <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">Objections · {s.objections.length}</p>
          {s.objections.map(obj => <ObjectionCard key={obj.order} objection={{ ...obj, id: String(obj.order) }} />)}
        </div>

        {error && <p className="text-sm text-rose-500 bg-rose-50 px-3 py-2 rounded-lg">{error}</p>}
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-8">
      {/* Filtre par catégorie */}
      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => setActiveCategory(null)}
          className={cn("text-xs px-3 py-1.5 rounded-full border transition-colors", activeCategory === null ? "bg-stone-900 text-white border-stone-900" : "border-stone-200 text-stone-500 hover:border-stone-400")}
        >
          Tous
        </button>
        {categories.map(cat => {
          const style = CATEGORY_STYLES[cat] ?? { bg: "bg-stone-100", text: "text-stone-500" };
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
              className={cn("text-xs px-3 py-1.5 rounded-full border transition-colors font-medium", activeCategory === cat ? cn(style.bg, style.text, "border-transparent") : "border-stone-200 text-stone-500 hover:border-stone-400")}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Liste des templates */}
      {filtered.map(template => (
        <div key={template.id} className="border border-stone-200 rounded-xl p-5 bg-white hover:border-stone-300 transition-colors">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <CategoryBadge category={template.category} />
                <p className="text-[11px] text-stone-400">Par {template.author}</p>
              </div>
              <p className="font-semibold text-[14px] text-stone-900">{template.name}</p>
              <p className="text-xs text-stone-500 mt-0.5">{template.description}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5 mb-4">
            {template.tags.map(tag => (
              <span key={tag} className="text-[11px] bg-stone-100 text-stone-500 px-2 py-0.5 rounded-full">{tag}</span>
            ))}
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-xs text-stone-400">
              <span className="flex items-center gap-1"><FileText className="w-3 h-3" />{template.script.steps.length} étapes</span>
              <span className="flex items-center gap-1"><ShieldAlert className="w-3 h-3" />{template.script.objections.length} objections</span>
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{template.script.duration_minutes} min</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setPreview(template.id)} className="h-7 text-xs gap-1 border-stone-200">
                <Eye className="w-3.5 h-3.5" /> Aperçu
              </Button>
              <Button size="sm" onClick={() => useTemplate(template.id)} disabled={loading === template.id} className="h-7 text-xs gap-1">
                {loading === template.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Copy className="w-3.5 h-3.5" />}
                Utiliser
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
