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
    <div className="max-w-2xl mx-auto space-y-6">
      <Link href={`/scripts/${id}`} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Retour au script
      </Link>
      <div>
        <h1 className="text-2xl font-bold">Modifier le script</h1>
        <p className="text-sm text-muted-foreground mt-1">Les modifications remplacent le contenu existant.</p>
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
