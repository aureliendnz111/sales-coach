import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const handler = async (event: { body: string | null }) => {
  let id: string | undefined;
  try {
    const body = JSON.parse(event.body || "{}");
    id = body.id;
  } catch {
    return { statusCode: 400, body: "Invalid body" };
  }

  if (!id) return { statusCode: 400, body: "Missing id" };

  const { data: record } = await supabase
    .from("call_analyses")
    .select("id, transcript_text, script_id")
    .eq("id", id)
    .single();

  if (!record) return { statusCode: 404, body: "Not found" };

  let scriptContext = "";
  const script_id = record.script_id;

  if (script_id) {
    const { data: script } = await supabase.from("scripts").select("name, goal").eq("id", script_id).single();
    const { data: steps } = await supabase.from("steps").select("order, name, goal, questions, key_phrases").eq("script_id", script_id).order("order");
    const { data: objections } = await supabase.from("objections").select("label, category, responses, key_reframe").eq("script_id", script_id);

    if (script) {
      scriptContext = `
SCRIPT DE RÉFÉRENCE : "${script.name}"
Objectif : ${script.goal ?? "Non défini"}

ÉTAPES DU SCRIPT (pour chaque étape, détecte si l'INTENTION a été couverte dans le transcript, pas les mots exacts) :
${steps?.map((s: { order: number; name: string; goal?: string; key_phrases?: string[]; questions?: string[] }) => `${s.order}. ${s.name}${s.goal ? `\n   Objectif : ${s.goal}` : ""}${s.key_phrases?.length ? `\n   Signaux possibles : ${s.key_phrases.join(", ")}` : ""}${s.questions?.length ? `\n   Questions types : ${s.questions.slice(0, 2).join(" | ")}` : ""}`).join("\n") ?? "Aucune"}

OBJECTIONS PRÉVUES :
${objections?.map((o: { label: string; category: string; key_reframe?: string; responses?: string[] }) => `- "${o.label}" (${o.category}) → ${o.key_reframe ?? o.responses?.[0] ?? ""}`).join("\n") ?? "Aucune"}`;
    }
  }

  const prompt = `Tu es un expert en vente et closing. Analyse ce transcript d'appel de vente et retourne un JSON structuré avec des scores et recommandations.

${scriptContext ? scriptContext + "\n\n" : ""}TRANSCRIPT DE L'APPEL :
${record.transcript_text.slice(0, 60000)}

Analyse le transcript et retourne UNIQUEMENT ce JSON (sans texte avant/après) :
{
  "scores": {
    "overall": <0-100>,
    "process": <0-100>,
    "discovery": <0-100>,
    "objections": <0-100>,
    "posture": <0-100>,
    "conclusion": <0-100>
  },
  "recommendations": {
    "overall": "<2-3 phrases de synthèse globale>",
    "process": "<recommandation sur le respect du process et des étapes>",
    "discovery": "<recommandation sur la qualité des questions et de la qualification>",
    "objections": "<recommandation sur la gestion des objections>",
    "posture": "<recommandation sur le ton, la confiance, l'énergie>",
    "conclusion": "<recommandation sur la tentative de closing et les prochaines étapes>"
  },
  "strengths": [
    "<point fort 1 — formule en 1 phrase courte et concrète>",
    "<point fort 2>",
    "<point fort 3>"
  ],
  "improvements": [
    "<axe d'amélioration 1 — formule en 1 phrase courte et actionnable>",
    "<axe d'amélioration 2>",
    "<axe d'amélioration 3>"
  ],
  "key_moments": [
    { "time": "<timestamp tel qu'il apparaît dans le transcript, ex: 03:45 ou 00:12:34>", "label": "<ce qui s'est passé, ex: Accroche et cadrage de l'appel>", "category": "<process|discovery|objections|posture|conclusion>" }
  ],
  "talk_ratio": {
    "coach": <pourcentage entier ex: 42>,
    "prospect": <pourcentage entier ex: 58>,
    "coach_name": "<prénom détecté du coach ou 'Coach'>",
    "prospect_name": "<prénom détecté du prospect ou 'Prospect'>"
  }
}

Pour key_moments : détecte les timestamps dans le transcript. Indique les 4 à 8 moments les plus significatifs. Si pas de timestamps, retourne [].
Pour strengths et improvements : sois concret et actionnable, cite ce qui s'est passé dans l'appel.

Règles de scoring — sois juste et bienveillant, pas sévère :
- Un appel professionnel correct : 65-80
- Un très bon appel : 80-92
- Exceptionnel : 92+
- Moins de 50 uniquement si vraiment catastrophique

DÉTECTION DES ÉTAPES — détecte l'INTENTION, pas les mots exacts :
- "Présentation de l'offre" : coach explique programme/service, mentionne durée/format/prix
- "Tentative de closing" : annonce un prix, demande une décision, prospect accepte/valide
- "Découverte" : questions sur situation actuelle, problèmes, objectifs du prospect
- "Accroche" : présentation mutuelle, mise en contexte de l'appel
- "Projection" : aide le prospect à imaginer sa situation après l'accompagnement

CRITÈRES :
- process : progression logique${script_id ? ", compare aux étapes du script (intention, pas mots exacts)" : ""}
- discovery : qualité des questions de qualification
- objections : gestion des objections (75 par défaut si pas d'objections)
- posture : aisance, professionnalisme, posture de force
- conclusion : proposition claire ou closing, prochaines étapes (≥ 75 si prix mentionné ou prospect accepte)
- overall : moyenne pondérée (process 20%, discovery 25%, objections 20%, posture 15%, conclusion 20%)

Recommandations constructives et encourageantes. Réponds UNIQUEMENT avec le JSON valide.`;

  try {
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 3000,
      messages: [{ role: "user", content: prompt }],
    });

    const text = message.content[0].type === "text" ? message.content[0].text.trim() : "";
    console.log("[analyze-call-bg] Claude response length:", text.length);

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found: " + text.slice(0, 200));

    const analysis = JSON.parse(jsonMatch[0]);

    const { error: updateError } = await supabase.from("call_analyses").update({
      scores: analysis.scores,
      recommendations: {
        ...analysis.recommendations,
        strengths: analysis.strengths ?? [],
        improvements: analysis.improvements ?? [],
      },
      talk_ratio: analysis.talk_ratio,
      key_moments: analysis.key_moments ?? [],
      status: "done",
    }).eq("id", id);

    if (updateError) console.error("[analyze-call-bg] Supabase update error:", updateError);

    return { statusCode: 200 };
  } catch (e) {
    console.error("[analyze-call-bg] Error:", String(e));
    await supabase.from("call_analyses").update({ status: "error" }).eq("id", id);
    return { statusCode: 500, body: String(e) };
  }
};
