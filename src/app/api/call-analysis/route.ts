import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { checkAnalysisLimit } from "@/lib/limits";

export const maxDuration = 120;

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
    .from("call_analyses")
    .select("id, prospect_name, call_date, outcome, status, scores, created_at, script_id, scripts(name)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  query = archived ? query.eq("status", "archived") : query.neq("status", "archived");

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ analyses: data });
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { transcript_text, transcript_filename, script_id, prospect_name, call_date, outcome } = await req.json();

  if (!transcript_text?.trim()) return NextResponse.json({ error: "Transcript manquant" }, { status: 400 });

  const limit = await checkAnalysisLimit(userId);
  if (!limit.allowed) return NextResponse.json({ error: "limit_analyses", used: limit.used, max: limit.max }, { status: 403 });

  // Insert record
  const { data: record, error: insertError } = await supabase
    .from("call_analyses")
    .insert({ user_id: userId, transcript_text, transcript_filename, script_id, prospect_name, call_date, outcome, status: "analyzing" })
    .select()
    .single();

  if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 });

  // On Netlify: fire background function and return immediately (avoids 30s timeout)
  const netlifyUrl = process.env.URL;
  if (netlifyUrl) {
    try {
      await fetch(`${netlifyUrl}/.netlify/functions/analyze-call-bg-background`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: record.id }),
      });
    } catch (e) {
      console.error("[call-analysis] Failed to trigger background function:", e);
      await supabase.from("call_analyses").update({ status: "error" }).eq("id", record.id);
      return NextResponse.json({ error: "Impossible de démarrer l'analyse", id: record.id }, { status: 500 });
    }
    return NextResponse.json({ id: record.id });
  }

  // Local dev: run analysis synchronously
  // Fetch script if provided
  let scriptContext = "";
  if (script_id) {
    const { data: script } = await supabase.from("scripts").select("name, goal").eq("id", script_id).single();
    const { data: steps } = await supabase.from("steps").select("order, name, goal, questions, key_phrases").eq("script_id", script_id).order("order");
    const { data: objections } = await supabase.from("objections").select("label, category, responses, key_reframe").eq("script_id", script_id);

    if (script) {
      scriptContext = `
SCRIPT DE RÉFÉRENCE : "${script.name}"
Objectif : ${script.goal ?? "Non défini"}

ÉTAPES DU SCRIPT (pour chaque étape, détecte si l'INTENTION a été couverte dans le transcript, pas les mots exacts) :
${steps?.map(s => `${s.order}. ${s.name}${s.goal ? `\n   Objectif : ${s.goal}` : ""}${s.key_phrases?.length ? `\n   Signaux possibles : ${s.key_phrases.join(", ")}` : ""}${s.questions?.length ? `\n   Questions types : ${s.questions.slice(0, 2).join(" | ")}` : ""}`).join("\n") ?? "Aucune"}

OBJECTIONS PRÉVUES :
${objections?.map(o => `- "${o.label}" (${o.category}) → ${o.key_reframe ?? o.responses?.[0] ?? ""}`).join("\n") ?? "Aucune"}`;
    }
  }

  const prompt = `Tu es un expert en vente et closing. Analyse ce transcript d'appel de vente et retourne un JSON structuré avec des scores et recommandations.

${scriptContext ? scriptContext + "\n\n" : ""}TRANSCRIPT DE L'APPEL :
${transcript_text.slice(0, 60000)}

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

Pour key_moments : détecte les timestamps dans le transcript (formats [MM:SS], [HH:MM:SS], ou en début de ligne). Indique les 4 à 8 moments les plus significatifs de l'appel (début d'une étape clé, objection importante, moment de closing…). Si le transcript n'a pas de timestamps, retourne un tableau vide [].
Pour strengths et improvements : sois concret et actionnable, pas générique. Cite si possible ce qui s'est passé dans l'appel.

Règles de scoring — IMPORTANT : sois juste et bienveillant, pas sévère :

CALIBRATION (obligatoire) :
- Un appel professionnel correct doit scorer entre 65 et 80
- Un très bon appel score entre 80 et 92
- Un appel exceptionnel score 92+
- Moins de 50 uniquement si l'appel est vraiment catastrophique
- Ne pénalise pas ce qui n'est pas mentionné dans le transcript — l'absence de preuve n'est pas une preuve d'absence

DÉTECTION DES ÉTAPES — RÈGLE FONDAMENTALE :
Tu dois détecter l'INTENTION et non les mots exacts. Voici des équivalences universelles en vente :

"Présentation de l'offre" / "Proposition commerciale" est couverte si l'une de ces situations se produit :
→ Le coach explique ce qu'il propose (programme, coaching, service, formation…)
→ Le coach mentionne une durée, un format, un nombre de séances, un accompagnement
→ Le coach mentionne un prix, un tarif, un investissement, un forfait
→ Le coach dit "je vais te présenter", "laisse-moi t'expliquer", "voici comment ça se passe"

"Tentative de closing" / "Conclusion" est couverte si :
→ Le coach annonce un prix ("c'est X euros", "l'investissement c'est", "le tarif c'est")
→ Le coach demande une décision ("qu'est-ce que tu en penses ?", "tu veux qu'on y aille ?", "on démarre ?")
→ Le prospect dit oui, accepte, valide, ou demande comment payer
→ Il y a une discussion sur les modalités de paiement ou les prochaines étapes concrètes

"Découverte" / "Qualification" est couverte si :
→ Le coach pose des questions sur la situation actuelle du prospect
→ Le coach explore les problèmes, les douleurs, les objectifs, les motivations
→ Le coach cherche à comprendre pourquoi le prospect est là

"Accroche" / "Introduction" est couverte si :
→ Il y a une présentation mutuelle ou une mise en contexte de l'appel
→ Le coach explique l'objectif de l'échange

"Projection" est couverte si :
→ Le coach aide le prospect à imaginer sa situation après l'accompagnement
→ Il y a une discussion sur les résultats attendus, les bénéfices, la transformation

CRITÈRES :
- process : la conversation suit-elle une progression logique ?${script_id ? ` Compare aux étapes du script fourni en utilisant les équivalences ci-dessus. Une étape est validée si son INTENTION a été couverte à n'importe quel moment de l'appel. Score élevé si les étapes principales (découverte, proposition, conclusion) sont présentes, même dans un ordre légèrement différent.` : " Évalue la structure générale sans script de référence."}
- discovery : le coach a-t-il posé des questions pour comprendre la situation, les douleurs et les objectifs du prospect ?
- objections : les objections ont-elles été accueillies calmement et traitées ? S'il n'y a pas eu d'objections, score 75 par défaut.
- posture : le coach semblait-il à l'aise, professionnel, dans une posture de force ? Pas trop timide ni trop agressif ?
- conclusion : y a-t-il eu une proposition claire ou une tentative de closing ? Des prochaines étapes définies ? IMPORTANT : si le transcript mentionne un prix ou si le prospect accepte quelque chose, le score doit être ≥ 75.
- overall : moyenne pondérée (process 20%, discovery 25%, objections 20%, posture 15%, conclusion 20%)

RECOMMANDATIONS : formule-les de manière constructive et encourageante. Commence par ce qui a bien fonctionné, puis suggère 1-2 axes d'amélioration concrets. Pas de liste exhaustive de reproches.

Pour le talk_ratio, estime la répartition en comptant les lignes de texte par speaker.
Réponds UNIQUEMENT avec le JSON valide`;

  try {
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 3000,
      messages: [{ role: "user", content: prompt }],
    });

    const text = message.content[0].type === "text" ? message.content[0].text.trim() : "";
    console.log("[call-analysis] Claude raw response:", text.slice(0, 300));

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found in response: " + text.slice(0, 200));

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
    }).eq("id", record.id);

    if (updateError) console.error("[call-analysis] Supabase update error:", updateError);

    return NextResponse.json({ id: record.id, analysis });
  } catch (e) {
    console.error("[call-analysis] Error:", e);
    await supabase.from("call_analyses").update({ status: "error" }).eq("id", record.id);
    return NextResponse.json({ error: String(e), id: record.id }, { status: 500 });
  }
}
