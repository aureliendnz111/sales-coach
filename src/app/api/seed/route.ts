import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() { return handler(); }
export async function POST() { return handler(); }

async function handler() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  // Vérifier si un script existe déjà pour cet utilisateur
  const { data: existing } = await supabase
    .from("scripts")
    .select("id")
    .eq("user_id", userId)
    .limit(1);

  if (existing && existing.length > 0) {
    return NextResponse.json({ message: "Seed déjà effectué", scriptId: existing[0].id });
  }

  // Créer le script
  const { data: script, error: scriptError } = await supabase
    .from("scripts")
    .insert({
      user_id: userId,
      name: "Call de closing — Méthode 0 to 1",
      goal: "Closer le prospect sur l'accompagnement coaching 0 to 1 (3 mois, 3000€)",
      duration_minutes: 30,
      reminders: [
        "Le prospect n'en a rien à faire de ton offre — parle de LUI, ses problèmes, ses rêves",
        "Pose des questions, ne donne pas de réponses — prospect 80%, toi 20%",
        "Oublie que tu veux vendre, commence à aider",
        "N'aie pas peur des objections — la vente commence au premier NON",
      ],
      is_default: true,
    })
    .select()
    .single();

  if (scriptError) return NextResponse.json({ error: scriptError.message }, { status: 500 });

  const scriptId = script.id;

  // Insérer les 9 étapes
  const steps = [
    { order: 1, name: "Intro et plan d'appel", goal: "Créer la connexion et poser le cadre du call", duration_estimate_minutes: 3, key_phrases: ["Tu es dans quelle énergie aujourd'hui ?", "J'ai quelques critères de sélection", "Je ne peux pas prendre plus de 4 coachés", "Ça va durer 30 min"], questions: ["Tu es dans quelle énergie aujourd'hui ?", "C'est ok pour toi ?"], tips: ["Poser le cadre de rareté (4 coachés max) dès le début pour créer l'autorité", "Obtenir un OUI sur le déroulé avant de commencer"] },
    { order: 2, name: "Qualification — Découvrir les douleurs", goal: "Comprendre pourquoi il est là, son business, ses concurrents, ses freins profonds et qui décide", duration_estimate_minutes: 10, key_phrases: ["Pourquoi tu as réservé cet échange ?", "C'est quoi ton business ?", "Qu'est-ce que tu regardes comme autre programme ?", "Qui prend la décision ?"], questions: ["Pourquoi tu as réservé cet échange avec moi ?", "C'est quoi ton business ?", "C'est quel type de client ?", "C'est quoi tes objectifs de CA ?", "Qu'est-ce que tu regardes comme autre programme ?", "C'est quoi les 2 points forts avec eux ? Les 2 points d'amélioration ?", "Qu'est-ce que tu faisais avant ?", "Pourquoi tu veux lancer cette boîte ?", "Qu'est-ce qu'il te manque aujourd'hui ?", "Qui prend la décision ?", "Quelle expérience tu as en prospection ? De 1 à 5 ?", "À ton avis, ce seraient quoi tes 3 focus sur les 3 prochains mois ?"], tips: ["Identifier le décideur dès cette étape — crucial pour le closing", "Écouter 80% du temps, ne pas pitcher"] },
    { order: 3, name: "Jauger la motivation", goal: "Mesurer l'urgence, identifier les freins à l'action autonome", duration_estimate_minutes: 3, key_phrases: ["Sur une échelle de 0 à 10", "Qu'est-ce qui t'empêche de le faire par toi-même ?"], questions: ["Sur une échelle de 0 à 10, à combien tu évalues l'urgence de trouver une solution ?", "Qu'est-ce qui t'empêche de le faire par toi-même ?", "Quand est-ce que tu aimerais commencer ?", "Qu'est-ce que tu es prêt à faire pour atteindre tes objectifs ?"], tips: ["Si score < 7, creuser pourquoi — soit sous-exprimé, soit prospect non qualifié"] },
    { order: 4, name: "Projeter sur les objectifs", goal: "Cristalliser les objectifs et créer une vision émotionnelle du futur réussi", duration_estimate_minutes: 3, key_phrases: ["Quels sont tes objectifs dans 3 mois ?", "Là on est dans 3 mois, tu as atteint ton objectif"], questions: ["Quels sont tes objectifs dans 3 mois ? Et dans 6 mois ?", "Quel serait ton objectif idéal ?", "Pourquoi c'est important pour toi ?", "Là on est dans 3 mois, tu as atteint ton objectif — qu'est-ce que ça change dans ta vie ?"], tips: ["La projection dans 3 mois est une technique de visualisation — laisser le prospect s'exprimer pleinement"] },
    { order: 5, name: "Récapitulatif et permission pitcher", goal: "Valider les enjeux et obtenir l'accord pour présenter l'offre + la promesse de décision", duration_estimate_minutes: 2, key_phrases: ["Si j'ai bien compris tes objectifs", "C'est bien ça ?", "Est-ce que tu me permets de te présenter", "J'aimerais qu'on évite les je vais y réfléchir"], questions: ["Si j'ai bien compris tes objectifs c'est de [...] — c'est bien ça ?", "Est-ce que tu me permets de te présenter mon programme ?", "Est-ce que c'est okay pour toi de prendre une décision claire à la fin de l'appel ?"], tips: ["Obtenir DEUX accords : (1) sur le recap, (2) sur la promesse de décision", "La promesse de décision neutralise 'je vais y réfléchir' avant qu'elle arrive"] },
    { order: 6, name: "Présentation de l'offre", goal: "Pitcher le programme 0 to 1 avec storytelling, contenu et bénéfices", duration_estimate_minutes: 5, key_phrases: ["La méthode 0 to 1", "3 mois", "10 000 clients", "1,5 million", "6 millions", "Sur une échelle de 0 à 10, à combien tu es chaud ?"], questions: ["Okay ça va jusqu'ici ?", "As-tu des questions sur des points en particulier ?", "Sur une échelle de 0 à 10, à combien tu es chaud ?", "Qu'est-ce qui te manque pour aller à 9 ou 10 ?"], tips: ["Storytelling avant programme — créer la crédibilité avant de pitcher", "Le score 0-10 après le pitch révèle les objections cachées"] },
    { order: 7, name: "Éligibilité", goal: "Retourner la dynamique — c'est toi qui choisis, pas lui", duration_estimate_minutes: 2, key_phrases: ["J'ai 3 critères", "As-tu la capacité de te faire coacher ?", "Tu m'as donné envie de te prendre en coaching"], questions: ["Critère 1 : as-tu la capacité de te faire coacher ?", "Critère 2 : as-tu une vraie ambition sur ce projet ?", "Critère 3 : as-tu la capacité de prendre des décisions ?"], tips: ["Les 3 critères sont rhétoriques — tout bon prospect dira oui", "L'inversion 'tu m'as donné envie' renverse le rapport de force"] },
    { order: 8, name: "Prix", goal: "Annoncer le prix clairement et ancrer la valeur", duration_estimate_minutes: 2, key_phrases: ["3000 euros", "3000€", "1000€ par mois", "le coût d'un stagiaire"], questions: [], tips: ["Annoncer le prix sans hésitation ni excuses", "Se taire après avoir annoncé le prix"] },
    { order: 9, name: "Closing", goal: "Obtenir le OUI et lancer le paiement immédiatement", duration_estimate_minutes: 2, key_phrases: ["On part là-dessus ?", "Je t'envoie un lien de paiement"], questions: ["Est-ce que c'est clair pour toi, on part là-dessus ?", "Est-ce qu'il y a encore des zones d'ombre ?"], tips: ["RÈGLE D'OR : se taire après 'on part là-dessus ?' — le premier qui parle perd"] },
  ];

  const { error: stepsError } = await supabase
    .from("steps")
    .insert(steps.map((s) => ({ ...s, script_id: scriptId })));

  if (stepsError) return NextResponse.json({ error: stepsError.message }, { status: 500 });

  // Insérer les 7 objections
  const objections = [
    { order: 1, label: "C'est trop cher", category: "price", trigger_phrases: ["c'est cher", "c'est trop cher", "c'est beaucoup", "le prix", "c'est élevé"], applicable_step_orders: [8, 9], responses: ["Je comprends que ça puisse être un prix important — c'est parce que c'est une offre importante.", "Est-ce que c'est trop cher parce que tu n'as pas le budget, ou parce que tu penses que ça ne vaut pas ce prix ?", "Si je t'offrais ce service gratuitement, le prendrais-tu ?", "Si tu atteins tes objectifs, tu trouveras ça toujours trop cher ?", "Ce que je te propose aujourd'hui, ce n'est pas une dépense — c'est un investissement.", "Poses-toi la bonne question : est-ce que tu es prêt à faire des changements ?"], key_reframe: "Dépense vs investissement — faire calculer mentalement le ROI si les objectifs sont atteints" },
    { order: 2, label: "Je n'ai pas le budget", category: "budget", trigger_phrases: ["j'ai pas l'argent", "pas de budget", "je n'ai pas les moyens", "financièrement c'est compliqué"], applicable_step_orders: [8, 9], responses: ["À part le problème du budget, tout est bon — on pourrait commencer si il n'y avait pas ça ?", "Est-ce une question logistique ou une part trop importante de ton budget ?", "Combien tu as sur ton compte et combien tu vas recevoir dans les 30 jours ?", "Si on pouvait faire un paiement en 2 ou 3 fois, est-ce que tu serais d'accord ?"], key_reframe: "Isoler le budget comme seul frein, puis proposer un échelonnement" },
    { order: 3, label: "Je vais y réfléchir", category: "stall", trigger_phrases: ["je vais y réfléchir", "j'ai besoin de temps", "laisse-moi réfléchir", "je reviens vers toi"], applicable_step_orders: [8, 9], responses: ["Je comprends — à quoi dois-tu réfléchir simplement ?", "Y a-t-il un sujet qu'on n'a pas abordé durant l'appel ?", "Qu'est-ce qui te bloque pour passer à l'action maintenant ?", "Ta décision est liée aux informations que tu as — je suis là maintenant.", "De toute façon, qu'on bosse ensemble ou non, ça n'impacte pas ma vie — par contre ça va impacter la tienne."], key_reframe: "La réflexion n'est jamais une question de temps — c'est une question d'informations manquantes" },
    { order: 4, label: "Ce n'est pas le bon moment", category: "timing", trigger_phrases: ["c'est pas le bon moment", "pas maintenant", "plus tard", "dans quelques mois"], applicable_step_orders: [8, 9], responses: ["Qu'est-ce qu'il nous manque pour commencer dès maintenant ?", "Tu n'auras pas évolué entre maintenant et dans 3 mois sans action.", "Ce n'est pas une question de temps, c'est une question d'informations.", "De toute façon, ça n'impacte pas ma vie — par contre ça va impacter la tienne."], key_reframe: "Le 'bon moment' n'existe pas — la situation ne changera pas sans action" },
    { order: 5, label: "Je parle aussi avec vos concurrents", category: "competition", trigger_phrases: ["je regarde d'autres options", "j'ai parlé avec", "je compare", "j'ai une autre proposition"], applicable_step_orders: [2, 8, 9], responses: ["Mes concurrents sont très bons. Mais si tu leur as déjà parlé, qu'est-ce qui te retient de travailler avec eux ?", "Qu'est-ce qui t'a amené à réserver cet appel avec moi aussi ?"], key_reframe: "Amener le prospect à ses propres conclusions — ne jamais dénigrer les concurrents" },
    { order: 6, label: "Est-ce que ça va vraiment marcher pour moi ?", category: "doubt", trigger_phrases: ["est-ce que ça marche vraiment", "j'ai des doutes", "comment tu peux garantir", "et si ça ne fonctionne pas"], applicable_step_orders: [6, 7, 8, 9], responses: ["La seule chose que je peux garantir : si tu ne fais rien, tu conserveras ton problème.", "Il m'est impossible de garantir 100% — ça dépend aussi de ton implication.", "Rappelle-toi tes objectifs — est-ce que tu veux que dans 3 mois rien n'ait changé ?"], key_reframe: "L'inaction est la seule certitude de ne pas réussir" },
    { order: 7, label: "Je dois en parler avec mon associé / ma femme", category: "third_party", trigger_phrases: ["j'en parle à ma femme", "j'en parle à mon mari", "mon associé", "on décide ensemble"], applicable_step_orders: [8, 9], responses: ["Est-ce que tu penses que ton/ta partenaire va te soutenir dans cette démarche ?", "Pourquoi tu as besoin de lui/elle demander son avis ?", "Est-ce qu'il/elle sait que tu as les problèmes dont on a parlé ?", "Est-ce qu'il/elle approuve que tu aies encore ces problèmes non résolus ?", "À la fin de la journée, il vaut mieux demander pardon que demander la permission."], key_reframe: "Ne pas avoir résolu le problème est aussi une décision que le partenaire n'approuve pas" },
  ];

  const { error: objectionsError } = await supabase
    .from("objections")
    .insert(objections.map((o) => ({ ...o, script_id: scriptId })));

  if (objectionsError) return NextResponse.json({ error: objectionsError.message }, { status: 500 });

  return NextResponse.json({ success: true, scriptId });
}
