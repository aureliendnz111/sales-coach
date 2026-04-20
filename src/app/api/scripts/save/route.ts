import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { script } = await req.json();

  const { data: savedScript, error: scriptError } = await supabase
    .from("scripts")
    .insert({
      user_id: userId,
      name: script.name,
      goal: script.goal,
      duration_minutes: script.duration_minutes ?? 30,
      reminders: script.reminders ?? [],
      is_default: false,
    })
    .select()
    .single();

  if (scriptError) return NextResponse.json({ error: scriptError.message }, { status: 500 });

  const scriptId = savedScript.id;

  if (script.steps?.length) {
    const { error } = await supabase.from("steps").insert(
      script.steps.map((s: Record<string, unknown>) => ({ ...s, script_id: scriptId }))
    );
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (script.objections?.length) {
    const { error } = await supabase.from("objections").insert(
      script.objections.map((o: Record<string, unknown>) => ({ ...o, script_id: scriptId }))
    );
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, scriptId });
}
