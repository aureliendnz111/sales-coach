import { auth } from "@clerk/nextjs/server";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { ScriptEditor } from "@/components/scripts/wizard/ScriptEditor";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type Params = { params: Promise<{ id: string }> };

export default async function EditScriptPage({ params }: Params) {
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

  return (
    <div className="max-w-4xl mx-auto px-8 py-10 space-y-6">
      <Link href={`/scripts/${id}`} className="flex items-center gap-1 text-sm text-stone-500 hover:text-stone-700 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Retour au script
      </Link>
      <div>
        <h1 className="text-[22px] font-semibold text-stone-900 tracking-tight">Modifier le script</h1>
        <p className="text-sm text-stone-500 mt-0.5">Les modifications remplacent le contenu existant.</p>
      </div>
      <ScriptEditor
        scriptId={id}
        initialData={{
          name: script.name,
          goal: script.goal ?? "",
          duration_minutes: script.duration_minutes ?? 30,
          reminders: (script.reminders as string[]) ?? [],
          steps: script.steps as never[],
          objections: script.objections as never[],
        }}
      />
    </div>
  );
}
