import { auth } from "@clerk/nextjs/server";
import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const body = await req.json();
  const { answers } = body;

  const prompt = `Tu es un expert en vente et closing. À partir des réponses suivantes d'un coach/vendeur, génère un script de vente structuré en JSON.

RÉPONSES DU COACH :
- Offre vendue : ${answers.offer}
- Prix et durée : ${answers.price}
- Cible idéale : ${answers.target}
- Douleurs principales de la cible : ${answers.pains}
- Objections les plus fréquentes : ${answers.objections}
- Durée habituelle du call : ${answers.duration} minutes
- Style de vente / ton : ${answers.tone}

Génère un script JSON avec cette structure exacte :
{
  "name": "Nom du script",
  "goal": "Objectif du call en une phrase",
  "reminders": ["reminder1", "reminder2", "reminder3"],
  "steps": [
    {
      "order": 1,
      "name": "Nom de l'étape",
      "goal": "Objectif de cette étape",
      "duration_estimate_minutes": 3,
      "key_phrases": ["phrase clé 1", "phrase clé 2"],
      "questions": ["Question 1 ?", "Question 2 ?"],
      "tips": ["Conseil stratégique 1"]
    }
  ],
  "objections": [
    {
      "order": 1,
      "label": "L'objection telle que formulée par le prospect",
      "category": "price|budget|stall|timing|competition|doubt|third_party",
      "trigger_phrases": ["variante 1", "variante 2"],
      "applicable_step_orders": [8, 9],
      "responses": ["Réponse 1", "Réponse 2", "Réponse 3"],
      "key_reframe": "Le principe de retournement en une phrase"
    }
  ]
}

Règles :
- 6 à 10 étapes selon la complexité de la vente
- Au moins 4 objections couvrant les cas les plus fréquents
- Les questions doivent être ouvertes et orientées vers le prospect
- Les tips doivent être des conseils stratégiques non-évidents
- Tout en français
- Réponds UNIQUEMENT avec le JSON, sans texte avant ou après`;

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4000,
    messages: [{ role: "user", content: prompt }],
  });

  const content = message.content[0];
  if (content.type !== "text") {
    return NextResponse.json({ error: "Réponse invalide" }, { status: 500 });
  }

  try {
    const script = JSON.parse(content.text.trim());
    return NextResponse.json({ script });
  } catch {
    return NextResponse.json({ error: "Parsing JSON échoué", raw: content.text }, { status: 500 });
  }
}
