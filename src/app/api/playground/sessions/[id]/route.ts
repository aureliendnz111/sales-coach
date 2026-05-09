import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

type Params = { params: Promise<{ id: string }> };

async function owns(userId: string, id: string) {
  const { data } = await supabase
    .from("training_sessions")
    .select("id")
    .eq("id", id)
    .eq("user_id", userId)
    .single();
  return !!data;
}

export async function GET(_req: Request, { params }: Params) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  const { id } = await params;

  const { data, error } = await supabase
    .from("training_sessions")
    .select("id, script_id, script_name, persona_id, persona_name, duration_seconds, created_at, archived_at")
    .eq("id", id)
    .eq("user_id", userId)
    .single();

  if (error || !data) return NextResponse.json({ error: "Session introuvable" }, { status: 404 });
  return NextResponse.json({ session: data });
}

export async function PATCH(req: Request, { params }: Params) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  const { id } = await params;
  if (!(await owns(userId, id))) return NextResponse.json({ error: "Introuvable" }, { status: 404 });

  const body = await req.json();
  const update: Record<string, unknown> = {};
  if ("archived" in body) update.archived_at = body.archived ? new Date().toISOString() : null;

  const { error } = await supabase.from("training_sessions").update(update).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

export async function DELETE(_req: Request, { params }: Params) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  const { id } = await params;
  if (!(await owns(userId, id))) return NextResponse.json({ error: "Introuvable" }, { status: 404 });

  const { error } = await supabase.from("training_sessions").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
