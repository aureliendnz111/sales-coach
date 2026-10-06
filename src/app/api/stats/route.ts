import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Raw rows for the Statistics page; aggregation happens client-side (src/lib/stats.ts)
// so period / script filters don't need a round trip.
export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const [analyses, sessions] = await Promise.all([
    supabase
      .from("call_analyses")
      .select("id, call_date, created_at, outcome, lead_status, scores, talk_ratio, script_id, scripts(name)")
      .eq("user_id", userId)
      .eq("status", "done")
      .order("created_at", { ascending: true }),
    supabase
      .from("training_sessions")
      .select("id, created_at, duration_seconds, script_id, script_name, persona_id, scores")
      .eq("user_id", userId)
      .order("created_at", { ascending: true }),
  ]);

  if (analyses.error) return NextResponse.json({ error: analyses.error.message }, { status: 500 });
  return NextResponse.json({ analyses: analyses.data ?? [], sessions: sessions.data ?? [] });
}
