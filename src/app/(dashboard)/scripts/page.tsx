import { auth } from "@clerk/nextjs/server";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { ScriptCard } from "@/components/scripts/ScriptCard";
import Link from "next/link";
import { Plus, FileText } from "lucide-react";

export default async function ScriptsPage() {
  const { userId } = await auth();
  const supabase = await createClient();

  const { data: scripts } = await supabase
    .from("scripts")
    .select("*, steps(count), objections(count)")
    .eq("user_id", userId!)
    .order("created_at", { ascending: false });

  const active = scripts?.filter(s => !s.archived_at) ?? [];
  const archived = scripts?.filter(s => s.archived_at) ?? [];

  return (
    <div className="max-w-3xl mx-auto px-8 py-12 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[24px] font-semibold text-stone-900 tracking-tight">Scripts</h1>
          <p className="text-stone-500 text-sm mt-0.5">Vos process de vente et réponses aux objections</p>
        </div>
        <Button size="sm" asChild className="gap-1.5 h-8 text-xs">
          <Link href="/scripts/new">
            <Plus className="w-3.5 h-3.5" /> Nouveau
          </Link>
        </Button>
      </div>

      {active.length === 0 && archived.length === 0 ? (
        <div className="border-2 border-dashed border-stone-200 rounded-xl flex flex-col items-center justify-center py-16 text-center gap-3">
          <div className="w-12 h-12 bg-stone-100 rounded-xl flex items-center justify-center">
            <FileText className="w-6 h-6 text-stone-400" />
          </div>
          <div>
            <p className="font-medium text-stone-800 text-sm">Aucun script pour l'instant</p>
            <p className="text-stone-400 text-xs mt-1">Créez votre premier script ou importez un template.</p>
          </div>
          <Button asChild size="sm" className="mt-1 h-8 text-xs">
            <Link href="/scripts/new">Créer un script</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {active.length > 0 && (
            <div className="border border-stone-200 rounded-xl overflow-hidden divide-y divide-stone-100">
              {active.map(script => (
                <ScriptCard
                  key={script.id}
                  script={script as Parameters<typeof ScriptCard>[0]["script"]}
                />
              ))}
            </div>
          )}

          {archived.length > 0 && (
            <div>
              <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-2 px-1">
                Archivés ({archived.length})
              </p>
              <div className="border border-stone-200 rounded-xl overflow-hidden divide-y divide-stone-100 opacity-60">
                {archived.map(script => (
                  <ScriptCard
                    key={script.id}
                    script={script as Parameters<typeof ScriptCard>[0]["script"]}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
