import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

type Params = { params: Promise<{ id: string }> };

export async function POST(_req: Request, { params }: Params) {
  const { id } = await params;
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { data: original, error: fetchError } = await supabase
    .from("scripts")
    .select("*, steps(*), objections(*)")
    .eq("id", id)
    .eq("user_id", userId)
    .single();

  if (fetchError || !original) return NextResponse.json({ error: "Script introuvable" }, { status: 404 });

  const { data: copy, error: copyError } = await supabase
    .from("scripts")
    .insert({
      user_id: userId,
      name: `${original.name} (copie)`,
      goal: original.goal,
      duration_minutes: original.duration_minutes,
      reminders: original.reminders,
      is_default: false,
    })
    .select()
    .single();

  if (copyError) return NextResponse.json({ error: copyError.message }, { status: 500 });

  if (original.steps?.length) {
    const { error } = await supabase.from("steps").insert(
      original.steps.map(({ id: _id, script_id: _sid, ...step }: Record<string, unknown>) => ({ ...step, script_id: copy.id }))
    );
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (original.objections?.length) {
    const { error } = await supabase.from("objections").insert(
      original.objections.map(({ id: _id, script_id: _sid, ...obj }: Record<string, unknown>) => ({ ...obj, script_id: copy.id }))
    );
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, scriptId: copy.id });
}
