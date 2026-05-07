import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const LIMITS = {
  scripts: 2,
  analysesPerMonth: 5,
};

export async function checkScriptLimit(userId: string) {
  const { count } = await supabase
    .from("scripts")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);
  const used = count ?? 0;
  return { allowed: used < LIMITS.scripts, used, max: LIMITS.scripts };
}

export async function checkAnalysisLimit(userId: string) {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  const { count } = await supabase
    .from("call_analyses")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .neq("status", "archived")
    .gte("created_at", startOfMonth.toISOString());
  const used = count ?? 0;
  return { allowed: used < LIMITS.analysesPerMonth, used, max: LIMITS.analysesPerMonth };
}
