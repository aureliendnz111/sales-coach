import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { TEMPLATES } from "@/lib/templates";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const template = TEMPLATES[0];
  const scriptLines = template.script.steps.reduce<Record<number, string[]>>(
    (acc, step) => ({ ...acc, [step.order]: step.script_lines }),
    {}
  );

  // Récupérer tous les scripts de l'utilisateur
  const { data: scripts } = await supabase
    .from("scripts")
    .select("id")
    .eq("user_id", userId);

  if (!scripts?.length) return NextResponse.json({ message: "Aucun script trouvé" });

  let updated = 0;
  for (const script of scripts) {
    const { data: steps } = await supabase
      .from("steps")
      .select("id, order")
      .eq("script_id", script.id);

    if (!steps) continue;

    for (const step of steps) {
      const lines = scriptLines[step.order];
      if (lines !== undefined) {
        await supabase
          .from("steps")
          .update({ script_lines: lines })
          .eq("id", step.id);
        updated++;
      }
    }
  }

  return NextResponse.json({ success: true, stepsUpdated: updated });
}
