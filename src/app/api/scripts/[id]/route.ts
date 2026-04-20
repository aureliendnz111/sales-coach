import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

type Params = { params: Promise<{ id: string }> };

// Mise à jour complète du script (métadonnées + étapes + objections)
export async function PUT(req: Request, { params }: Params) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { id } = await params;
  const { script } = await req.json();

  // Vérifier que le script appartient à l'user
  const { data: existing } = await supabase
    .from("scripts")
    .select("id")
    .eq("id", id)
    .eq("user_id", userId)
    .single();

  if (!existing) return NextResponse.json({ error: "Script introuvable" }, { status: 404 });

  // Désarchivage
  if (script._unarchive) {
    await supabase.from("scripts").update({ archived_at: null }).eq("id", id);
    return NextResponse.json({ success: true });
  }

  // Mettre à jour les métadonnées
  const { error: scriptError } = await supabase
    .from("scripts")
    .update({
      name: script.name,
      goal: script.goal,
      duration_minutes: script.duration_minutes,
      reminders: script.reminders,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (scriptError) return NextResponse.json({ error: scriptError.message }, { status: 500 });

  // Remplacer toutes les étapes
  await supabase.from("steps").delete().eq("script_id", id);
  if (script.steps?.length) {
    const { error } = await supabase.from("steps").insert(
      script.steps.map((s: Record<string, unknown>) => ({ ...s, script_id: id }))
    );
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Remplacer toutes les objections
  await supabase.from("objections").delete().eq("script_id", id);
  if (script.objections?.length) {
    const { error } = await supabase.from("objections").insert(
      script.objections.map((o: Record<string, unknown>) => ({ ...o, script_id: id }))
    );
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

// Archive ou suppression
export async function DELETE(req: Request, { params }: Params) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { id } = await params;
  const { archive } = await req.json().catch(() => ({ archive: false }));

  const { data: existing } = await supabase
    .from("scripts")
    .select("id")
    .eq("id", id)
    .eq("user_id", userId)
    .single();

  if (!existing) return NextResponse.json({ error: "Script introuvable" }, { status: 404 });

  if (archive) {
    const { error } = await supabase
      .from("scripts")
      .update({ archived_at: new Date().toISOString() })
      .eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, action: "archived" });
  }

  const { error } = await supabase.from("scripts").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, action: "deleted" });
}
