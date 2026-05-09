import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const archived = searchParams.get("archived") === "true";

  let query = supabase
    .from("training_sessions")
    .select("id, script_id, script_name, persona_id, persona_name, duration_seconds, created_at, archived_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);

  query = archived ? query.not("archived_at", "is", null) : query.is("archived_at", null);

  const { data, error } = await query;
  if (error) return NextResponse.json({ sessions: [] });
  return NextResponse.json({ sessions: data ?? [] });
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { script_id, script_name, duration_seconds, persona_id, persona_name } = await req.json();
  if (!script_name) return NextResponse.json({ error: "script_name requis" }, { status: 400 });

  const { data, error } = await supabase
    .from("training_sessions")
    .insert({ user_id: userId, script_id: script_id ?? null, script_name, duration_seconds: duration_seconds ?? 0, persona_id: persona_id ?? null, persona_name: persona_name ?? null })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ session: data });
}
