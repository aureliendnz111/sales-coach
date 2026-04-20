"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TagInput } from "./TagInput";
import { Plus, Trash2, Loader2, Check, X, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScriptBuilderNav } from "./ScriptBuilderNav";

type Step = { order: number; name: string; goal: string; duration_estimate_minutes: number; script_lines: string[]; questions: string[]; key_phrases: string[]; tips: string[] };
type Objection = { order: number; label: string; category: string; responses: string[]; key_reframe: string; trigger_phrases: string[]; applicable_step_orders: number[] };
type Category = { value: string; label: string };

const DEFAULT_CATEGORIES: Category[] = [
  { value: "price", label: "Prix" }, { value: "budget", label: "Budget" },
  { value: "stall", label: "Temporise" }, { value: "timing", label: "Timing" },
  { value: "competition", label: "Concurrents" }, { value: "doubt", label: "Doute" },
  { value: "third_party", label: "Tiers" },
];

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-1.5">{children}</p>;
}

type Props = {
  scriptId: string;
  initialData: { name: string; goal: string; duration_minutes: number; reminders: string[]; steps: Step[]; objections: Objection[] };
};

export function ScriptEditor({ scriptId, initialData }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState(initialData.name);
  const [goal, setGoal] = useState(initialData.goal ?? "");
  const [duration, setDuration] = useState(initialData.duration_minutes ?? 30);
  const [reminders, setReminders] = useState<string[]>(initialData.reminders ?? []);
  const [steps, setSteps] = useState<Step[]>(initialData.steps);
  const [objections, setObjections] = useState<Objection[]>(initialData.objections);

  const [categories, setCategories] = useState<Category[]>(() => {
    const cats = [...DEFAULT_CATEGORIES];
    initialData.objections.forEach(obj => {
      if (obj.category && !cats.find(c => c.value === obj.category)) {
        cats.push({ value: obj.category, label: obj.category });
      }
    });
    return cats;
  });
  const [newCat, setNewCat] = useState("");

  const [dragStepIdx, setDragStepIdx] = useState<number | null>(null);
  const [dragOverStepIdx, setDragOverStepIdx] = useState<number | null>(null);
  const [dragObjIdx, setDragObjIdx] = useState<number | null>(null);
  const [dragOverObjIdx, setDragOverObjIdx] = useState<number | null>(null);

  function addCategory() {
    const trimmed = newCat.trim();
    if (trimmed && !categories.find(c => c.label.toLowerCase() === trimmed.toLowerCase())) {
      const value = trimmed.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");
      setCategories(c => [...c, { value: value || trimmed, label: trimmed }]);
    }
    setNewCat("");
  }
  function removeCategory(value: string) { setCategories(c => c.filter(cat => cat.value !== value)); }

  function updateStep(i: number, field: keyof Step, value: unknown) { setSteps(s => s.map((step, j) => j === i ? { ...step, [field]: value } : step)); }
  function addStep() { setSteps(s => [...s, { order: s.length + 1, name: "", goal: "", duration_estimate_minutes: 5, script_lines: [], questions: [], key_phrases: [], tips: [] }]); }
  function removeStep(i: number) { setSteps(s => s.filter((_, j) => j !== i).map((s, j) => ({ ...s, order: j + 1 }))); }

  function updateObjection(i: number, field: keyof Objection, value: unknown) { setObjections(o => o.map((obj, j) => j === i ? { ...obj, [field]: value } : obj)); }
  function addObjection() { setObjections(o => [...o, { order: o.length + 1, label: "", category: categories[0]?.value ?? "other", responses: [], key_reframe: "", trigger_phrases: [], applicable_step_orders: [] }]); }
  function removeObjection(i: number) { setObjections(o => o.filter((_, j) => j !== i).map((o, j) => ({ ...o, order: j + 1 }))); }

  function onStepDragStart(e: React.DragEvent, i: number) {
    if (!(e.target as HTMLElement).closest("[data-drag-handle]")) { e.preventDefault(); return; }
    setDragStepIdx(i);
  }
  function onStepDrop(i: number) {
    if (dragStepIdx === null || dragStepIdx === i) return;
    const reordered = [...steps];
    const [moved] = reordered.splice(dragStepIdx, 1);
    reordered.splice(i, 0, moved);
    setSteps(reordered.map((s, j) => ({ ...s, order: j + 1 })));
    setDragStepIdx(null); setDragOverStepIdx(null);
  }

  function onObjDragStart(e: React.DragEvent, i: number) {
    if (!(e.target as HTMLElement).closest("[data-drag-handle]")) { e.preventDefault(); return; }
    setDragObjIdx(i);
  }
  function onObjDrop(i: number) {
    if (dragObjIdx === null || dragObjIdx === i) return;
    const reordered = [...objections];
    const [moved] = reordered.splice(dragObjIdx, 1);
    reordered.splice(i, 0, moved);
    setObjections(reordered.map((o, j) => ({ ...o, order: j + 1 })));
    setDragObjIdx(null); setDragOverObjIdx(null);
  }

  async function save() {
    if (!name.trim()) return setError("Le nom du script est requis");
    setSaving(true); setError(null);
    try {
      const res = await fetch(`/api/scripts/${scriptId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ script: { name, goal, duration_minutes: duration, reminders, steps, objections } }) });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      router.push(`/scripts/${scriptId}`);
      router.refresh();
    } catch (e) { setError(e instanceof Error ? e.message : "Erreur lors de la sauvegarde"); setSaving(false); }
  }

  return (
    <div className="flex gap-10 items-start">
      <div className="flex-1 min-w-0 space-y-6 pb-8">
        <section className="border border-stone-200 rounded-xl p-5 space-y-4 bg-white">
          <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">Informations générales</p>
          <div className="space-y-1.5">
            <Label className="text-xs text-stone-600">Nom du script *</Label>
            <Input value={name} onChange={e => setName(e.target.value)} className="h-9 text-sm border-stone-200" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-stone-600">Objectif du call</Label>
            <Input value={goal} onChange={e => setGoal(e.target.value)} className="h-9 text-sm border-stone-200" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-stone-600">Durée estimée (min)</Label>
            <Input type="number" value={duration} onChange={e => setDuration(parseInt(e.target.value) || 30)} className="h-9 text-sm w-24 border-stone-200" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-stone-600">Rappels avant le call</Label>
            <TagInput values={reminders} onChange={setReminders} placeholder="Ajouter un rappel, appuyer Entrée" />
          </div>
        </section>

        <section id="section-steps" className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">Étapes · {steps.length}</p>
            <Button variant="outline" size="sm" onClick={addStep} className="h-7 text-xs gap-1 border-stone-200 text-stone-600 hover:text-stone-900">
              <Plus className="w-3.5 h-3.5" /> Ajouter
            </Button>
          </div>
          {steps.map((step, i) => (
            <div
              key={i} id={`step-${i}`}
              draggable
              onDragStart={e => onStepDragStart(e, i)}
              onDragOver={e => { e.preventDefault(); setDragOverStepIdx(i); }}
              onDrop={() => onStepDrop(i)}
              onDragEnd={() => { setDragStepIdx(null); setDragOverStepIdx(null); }}
              className={cn(
                "border rounded-xl bg-white overflow-hidden transition-all",
                dragStepIdx === i ? "opacity-40" : dragOverStepIdx === i && dragStepIdx !== null ? "border-stone-400 shadow-sm" : "border-stone-200"
              )}
            >
              <div className="flex items-center gap-2 px-3 py-3 border-b border-stone-100">
                <div data-drag-handle className="cursor-grab active:cursor-grabbing text-stone-300 hover:text-stone-500 transition-colors shrink-0">
                  <GripVertical className="w-4 h-4" />
                </div>
                <span className="w-6 h-6 rounded-full bg-stone-900 text-white text-[11px] font-bold flex items-center justify-center shrink-0">{step.order}</span>
                <Input value={step.name} onChange={e => updateStep(i, "name", e.target.value)} placeholder="Nom de l'étape" className="h-8 text-sm font-medium border-stone-200 flex-1" />
                <button onClick={() => removeStep(i)} disabled={steps.length === 1} className="text-stone-300 hover:text-rose-500 transition-colors disabled:opacity-30 shrink-0">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="px-4 py-4 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div><FieldLabel>Objectif</FieldLabel><Input value={step.goal} onChange={e => updateStep(i, "goal", e.target.value)} placeholder="Objectif de cette étape" className="h-8 text-xs border-stone-200" /></div>
                  <div><FieldLabel>Durée (min)</FieldLabel><Input type="number" value={step.duration_estimate_minutes} onChange={e => updateStep(i, "duration_estimate_minutes", parseInt(e.target.value) || 0)} className="h-8 text-xs w-20 border-stone-200" /></div>
                </div>
                <div><FieldLabel>À dire</FieldLabel><TagInput values={step.script_lines ?? []} onChange={v => updateStep(i, "script_lines", v)} placeholder="Phrase à dire + Entrée" variant="blue" /></div>
                <div><FieldLabel>Questions à poser</FieldLabel><TagInput values={step.questions ?? []} onChange={v => updateStep(i, "questions", v)} placeholder="Question + Entrée" variant="violet" /></div>
                <div><FieldLabel>Déclencheurs copilote</FieldLabel><TagInput values={step.key_phrases ?? []} onChange={v => updateStep(i, "key_phrases", v)} placeholder="Phrase clé + Entrée" variant="outline" /></div>
                <div><FieldLabel>Tips stratégiques</FieldLabel><TagInput values={step.tips ?? []} onChange={v => updateStep(i, "tips", v)} placeholder="Tip + Entrée" variant="amber" /></div>
              </div>
            </div>
          ))}
        </section>

        <section id="section-objections" className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">Objections · {objections.length}</p>
            <Button variant="outline" size="sm" onClick={addObjection} className="h-7 text-xs gap-1 border-stone-200 text-stone-600 hover:text-stone-900">
              <Plus className="w-3.5 h-3.5" /> Ajouter
            </Button>
          </div>
          <div className="border border-stone-200 rounded-xl p-4 bg-white">
            <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-2.5">Catégories</p>
            <div className="flex flex-wrap gap-1.5 items-center">
              {categories.map(cat => (
                <span key={cat.value} className="inline-flex items-center gap-1 text-xs bg-stone-100 text-stone-700 px-2.5 py-1 rounded-full">
                  {cat.label}
                  <button type="button" onClick={() => removeCategory(cat.value)} className="text-stone-400 hover:text-rose-500 transition-colors"><X className="w-3 h-3" /></button>
                </span>
              ))}
              <input value={newCat} onChange={e => setNewCat(e.target.value)} onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addCategory())} onBlur={addCategory} placeholder="+ Ajouter" className="text-xs text-stone-500 placeholder:text-stone-400 bg-transparent border-none outline-none w-20" />
            </div>
          </div>
          {objections.map((obj, i) => (
            <div
              key={i} id={`objection-${i}`}
              draggable
              onDragStart={e => onObjDragStart(e, i)}
              onDragOver={e => { e.preventDefault(); setDragOverObjIdx(i); }}
              onDrop={() => onObjDrop(i)}
              onDragEnd={() => { setDragObjIdx(null); setDragOverObjIdx(null); }}
              className={cn(
                "border rounded-xl bg-white overflow-hidden transition-all",
                dragObjIdx === i ? "opacity-40" : dragOverObjIdx === i && dragObjIdx !== null ? "border-stone-400 shadow-sm" : "border-stone-200"
              )}
            >
              <div className="flex items-center gap-2 px-3 py-3 border-b border-stone-100">
                <div data-drag-handle className="cursor-grab active:cursor-grabbing text-stone-300 hover:text-stone-500 transition-colors shrink-0">
                  <GripVertical className="w-4 h-4" />
                </div>
                <span className="w-6 h-6 rounded-full bg-rose-100 text-rose-600 text-[11px] font-bold flex items-center justify-center shrink-0">{obj.order}</span>
                <Input value={obj.label} onChange={e => updateObjection(i, "label", e.target.value)} placeholder="L'objection telle que formulée par le prospect" className="h-8 text-sm font-medium border-stone-200 flex-1" />
                <button onClick={() => removeObjection(i)} disabled={objections.length === 1} className="text-stone-300 hover:text-rose-500 transition-colors disabled:opacity-30 shrink-0">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="px-4 py-4 space-y-4">
                <div>
                  <FieldLabel>Catégorie</FieldLabel>
                  <div className="flex flex-wrap gap-1.5">
                    {categories.map(cat => (
                      <button key={cat.value} type="button" onClick={() => updateObjection(i, "category", cat.value)}
                        className={cn("text-xs px-2.5 py-1 rounded-full border transition-colors", obj.category === cat.value ? "bg-stone-900 text-white border-stone-900" : "border-stone-200 text-stone-600 hover:border-stone-400")}>
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div><FieldLabel>Réponses suggérées</FieldLabel><TagInput values={obj.responses ?? []} onChange={v => updateObjection(i, "responses", v)} placeholder="Réponse + Entrée" /></div>
                <div><FieldLabel>Principe de retournement</FieldLabel><Input value={obj.key_reframe} onChange={e => updateObjection(i, "key_reframe", e.target.value)} placeholder="Ex: Dépense vs investissement" className="h-8 text-xs border-stone-200" /></div>
                <div><FieldLabel>Déclencheurs copilote</FieldLabel><TagInput values={obj.trigger_phrases ?? []} onChange={v => updateObjection(i, "trigger_phrases", v)} placeholder="Variante de l'objection + Entrée" variant="outline" /></div>
              </div>
            </div>
          ))}
        </section>

        {error && <p className="text-sm text-rose-500 bg-rose-50 px-3 py-2 rounded-lg">{error}</p>}
        <div className="flex justify-end">
          <Button onClick={save} disabled={saving} className="gap-2 h-9 text-sm">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            Sauvegarder les modifications
          </Button>
        </div>
      </div>
      <ScriptBuilderNav steps={steps} objections={objections} />
    </div>
  );
}
