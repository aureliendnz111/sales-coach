import { auth } from "@clerk/nextjs/server";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScriptActions } from "@/components/scripts/ScriptActions";
import { ScriptContent } from "@/components/scripts/ScriptContent";
import { PlaceholderBanner } from "@/components/scripts/PlaceholderBanner";
import { Clock, AlertTriangle, Pencil, ChevronLeft } from "lucide-react";

import Link from "next/link";

type Params = { params: Promise<{ id: string }> };

export default async function ScriptDetailPage({ params }: Params) {
  const { id } = await params;
  const { userId } = await auth();
  const supabase = await createClient();

  const { data: script } = await supabase
    .from("scripts")
    .select("*, steps(*), objections(*)")
    .eq("id", id)
    .eq("user_id", userId!)
    .order("order", { referencedTable: "steps", ascending: true })
    .order("order", { referencedTable: "objections", ascending: true })
    .single();

  if (!script) notFound();

  const steps = (script.steps as Step[]) ?? [];
  const objections = (script.objections as Objection[]) ?? [];
  const totalMinutes = steps.reduce((acc, s) => acc + (s.duration_estimate_minutes ?? 0), 0);

  const hasPlaceholder = (s: string | null) => s != null && /\[.+?\]/.test(s);
  const hasPlaceholders =
    hasPlaceholder(script.name) || hasPlaceholder(script.goal) ||
    steps.some(s => hasPlaceholder(s.name) || hasPlaceholder(s.goal) ||
      [...(s.script_lines ?? []), ...(s.questions ?? []), ...(s.tips ?? []), ...(s.key_phrases ?? [])].some(hasPlaceholder)
    ) ||
    objections.some(o => hasPlaceholder(o.label) || hasPlaceholder(o.key_reframe) ||
      [...(o.responses ?? []), ...(o.trigger_phrases ?? [])].some(hasPlaceholder)
    );

  return (
    <div className="max-w-4xl mx-auto px-8 py-10 space-y-8">
      {/* Back + actions */}
      <div className="flex items-center justify-between">
        <Link
          href="/scripts"
          className="flex items-center gap-1 text-sm text-stone-400 hover:text-stone-700 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Scripts
        </Link>
        <div className="flex items-center gap-2">
          <Button asChild size="sm" variant="outline" className="h-8 text-xs gap-1.5 border-stone-200">
            <Link href={`/scripts/${id}/edit`}>
              <Pencil className="w-3.5 h-3.5" /> Modifier
            </Link>
          </Button>
          <ScriptActions scriptId={id} isArchived={!!script.archived_at} isDefault={!!script.is_default} />
        </div>
      </div>

      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2.5 flex-wrap">
          <h1 className="text-[22px] font-semibold text-stone-900 tracking-tight">
            {script.name}
          </h1>
          {script.is_default && (
            <span className="text-[11px] bg-stone-900 text-white px-2 py-1 rounded-full font-medium leading-none">
              Par défaut
            </span>
          )}
          {script.archived_at && (
            <Badge variant="outline" className="text-stone-400 border-stone-200 text-xs">Archivé</Badge>
          )}
        </div>
        {script.goal && (
          <p className="text-stone-500 text-sm leading-relaxed max-w-2xl">{script.goal}</p>
        )}
        <div className="flex items-center gap-1.5 text-xs text-stone-400">
          <Clock className="w-3.5 h-3.5" />
          <span>{totalMinutes} min · {steps.length} étapes · {objections.length} objections</span>
        </div>
      </div>

      {hasPlaceholders && <PlaceholderBanner scriptId={id} />}

      {/* Reminders */}
      {script.reminders && (script.reminders as string[]).length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-2">
          <p className="text-xs font-semibold text-amber-700 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" /> Rappels avant le call
          </p>
          <ul className="space-y-1">
            {(script.reminders as string[]).map((r, i) => (
              <li key={i} className="text-sm text-amber-800">· {r}</li>
            ))}
          </ul>
        </div>
      )}

      <ScriptContent steps={steps} objections={objections} />
    </div>
  );
}

type Step = {
  id: string; order: number; name: string; goal: string | null;
  duration_estimate_minutes: number | null; key_phrases: string[] | null;
  questions: string[] | null; script_lines: string[] | null; tips: string[] | null;
};
type Objection = {
  id: string; order: number; label: string; category: string;
  trigger_phrases: string[] | null; applicable_step_orders: number[] | null;
  responses: string[] | null; key_reframe: string | null;
};
