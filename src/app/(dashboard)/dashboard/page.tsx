import { auth, currentUser } from "@clerk/nextjs/server";
import { createClient } from "@/lib/supabase/server";
import { DashboardContent } from "@/components/dashboard/DashboardContent";

export default async function DashboardPage() {
  const { userId } = await auth();
  const user = await currentUser();
  const supabase = await createClient();

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [
    { count: scriptCount },
    { count: callsThisMonth },
    { data: scoresData },
    { data: recentAnalyses },
  ] = await Promise.all([
    supabase.from("scripts").select("*", { count: "exact", head: true }).eq("user_id", userId!).is("archived_at", null),
    supabase.from("call_analyses").select("*", { count: "exact", head: true }).eq("user_id", userId!).eq("status", "done").gte("created_at", startOfMonth.toISOString()),
    supabase.from("call_analyses").select("scores").eq("user_id", userId!).eq("status", "done").gte("created_at", startOfMonth.toISOString()),
    supabase.from("call_analyses").select("id, prospect_name, call_date, outcome, status, scores, created_at").eq("user_id", userId!).neq("status", "archived").order("created_at", { ascending: false }).limit(5),
  ]);

  const firstName = user?.firstName ?? "vous";
  const scripts = scriptCount ?? 0;
  const calls = callsThisMonth ?? 0;

  const overallScores = (scoresData ?? []).map(d => (d.scores as { overall?: number } | null)?.overall).filter((s): s is number => typeof s === "number");
  const avgScore = overallScores.length > 0 ? Math.round(overallScores.reduce((a, b) => a + b, 0) / overallScores.length) : null;

  return (
    <DashboardContent
      firstName={firstName}
      scripts={scripts}
      calls={calls}
      avgScore={avgScore}
      overallScores={overallScores}
      recentAnalyses={(recentAnalyses ?? []) as Parameters<typeof DashboardContent>[0]["recentAnalyses"]}
    />
  );
}
