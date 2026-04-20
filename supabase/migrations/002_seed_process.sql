-- Seed: process de vente Aurélien "Méthode 0 to 1"
-- À exécuter après avoir créé un user Clerk et remplacé USER_ID_CLERK

do $$
declare
  v_script_id uuid;
  v_step_1 uuid; v_step_2 uuid; v_step_3 uuid; v_step_4 uuid; v_step_5 uuid;
  v_step_6 uuid; v_step_7 uuid; v_step_8 uuid; v_step_9 uuid;
begin

-- Remplacer par ton Clerk user ID réel
perform set_config('app.user_id', 'USER_ID_CLERK', true);

-- Script principal
insert into scripts (user_id, name, goal, duration_minutes, reminders, is_default)
values (
  'USER_ID_CLERK',
  'Call de closing — Méthode 0 to 1',
  'Closer le prospect sur l''accompagnement coaching 0 to 1 (3 mois, 3000€)',
  30,
  array[
    'Le prospect n''en a rien à faire de ton offre — parle de LUI, ses problèmes, ses rêves',
    'Pose des questions, ne donne pas de réponses — prospect 80%, toi 20%',
    'Oublie que tu veux vendre, commence à aider',
    'N''aie pas peur des objections — la vente commence au premier NON'
  ],
  true
) returning id into v_script_id;

-- ============================================================
-- 9 ÉTAPES
-- ============================================================

insert into steps (script_id, "order", name, goal, duration_estimate_minutes, key_phrases, questions, tips)
values (v_script_id, 1, 'Intro et plan d''appel', 'Créer la connexion et poser le cadre du call', 3,
  array['Tu es dans quelle énergie aujourd''hui ?', 'J''ai quelques critères de sélection', 'Je ne peux pas prendre plus de 4 coachés', 'Ça va durer 30 min'],
  array['Tu es dans quelle énergie aujourd''hui ?', 'C''est ok pour toi ?'],
  array['Poser le cadre de rareté (4 coachés max) dès le début pour créer l''autorité', 'Obtenir un OUI sur le déroulé avant de commencer']
) returning id into v_step_1;

insert into steps (script_id, "order", name, goal, duration_estimate_minutes, key_phrases, questions, tips)
values (v_script_id, 2, 'Qualification — Découvrir les douleurs', 'Comprendre pourquoi il est là, son business, ses concurrents, ses freins profonds et qui décide', 10,
  array['Pourquoi tu as réservé cet échange ?', 'C''est quoi ton business ?', 'Qu''est-ce que tu regardes comme autre programme ?', 'Qui prend la décision ?'],
  array['Pourquoi tu as réservé cet échange avec moi ?', 'C''est quoi ton business ?', 'C''est quel type de client ?', 'C''est quoi tes objectifs de CA ?', 'Qu''est-ce que tu regardes comme autre programme ?', 'C''est quoi les 2 points forts avec eux ? Les 2 points d''amélioration ?', 'Qu''est-ce que tu faisais avant ?', 'Pourquoi tu veux lancer cette boîte ?', 'Qu''est-ce qu''il te manque aujourd''hui ?', 'Qui prend la décision ?', 'Quelle expérience tu as en prospection ? De 1 à 5 ?', 'À ton avis, ce seraient quoi tes 3 focus sur les 3 prochains mois ?'],
  array['Identifier le décideur dès cette étape — crucial pour le closing', 'Écouter 80% du temps, ne pas pitcher', 'Choisir les questions compétences en fonction de la douleur principale identifiée']
) returning id into v_step_2;

insert into steps (script_id, "order", name, goal, duration_estimate_minutes, key_phrases, questions, tips)
values (v_script_id, 3, 'Jauger la motivation', 'Mesurer l''urgence, identifier les freins à l''action autonome', 3,
  array['Sur une échelle de 0 à 10', 'Qu''est-ce qui t''empêche de le faire par toi-même ?', 'Qu''est-ce que tu es prêt à faire ?'],
  array['Sur une échelle de 0 à 10, à combien tu évalues l''urgence de trouver une solution ?', 'Qu''est-ce qui t''empêche de le faire par toi-même ?', 'Quand est-ce que tu aimerais commencer ?', 'Qu''est-ce que tu es prêt à faire pour atteindre tes objectifs ?'],
  array['Si score < 7, creuser pourquoi — soit sous-exprimé, soit prospect non qualifié', 'Garder la réponse au ''par toi-même'' pour la réutiliser à l''étape Offre']
) returning id into v_step_3;

insert into steps (script_id, "order", name, goal, duration_estimate_minutes, key_phrases, questions, tips)
values (v_script_id, 4, 'Projeter sur les objectifs', 'Cristalliser les objectifs et créer une vision émotionnelle du futur réussi', 3,
  array['Quels sont tes objectifs dans 3 mois ?', 'Là on est dans 3 mois, tu as atteint ton objectif'],
  array['Quels sont tes objectifs dans 3 mois ? Et dans 6 mois ?', 'Quel serait ton objectif idéal ?', 'Pourquoi c''est important pour toi ?', 'Là on est dans 3 mois, tu as atteint ton objectif — qu''est-ce que ça change dans ta vie ?'],
  array['La projection dans 3 mois est une technique de visualisation — laisser le prospect s''exprimer pleinement', 'Mémoriser les réponses émotionnelles pour le récapitulatif']
) returning id into v_step_4;

insert into steps (script_id, "order", name, goal, duration_estimate_minutes, key_phrases, questions, tips)
values (v_script_id, 5, 'Récapitulatif et permission pitcher', 'Valider les enjeux et obtenir l''accord pour présenter l''offre + la promesse de décision', 2,
  array['Si j''ai bien compris tes objectifs', 'C''est bien ça ?', 'Est-ce que tu me permets de te présenter', 'J''aimerais qu''on évite les je vais y réfléchir', 'Un bon entrepreneur sait prendre des décisions rapidement'],
  array['Si j''ai bien compris tes objectifs c''est de [...] — c''est bien ça ?', 'Est-ce que tu me permets de te présenter mon programme ?', 'Est-ce que c''est okay pour toi de prendre une décision claire à la fin de l''appel ?'],
  array['Obtenir DEUX accords : (1) sur le recap, (2) sur la promesse de décision', 'La promesse de décision neutralise ''je vais y réfléchir'' avant qu''elle arrive', 'Ne pas pitcher sans ces deux accords']
) returning id into v_step_5;

insert into steps (script_id, "order", name, goal, duration_estimate_minutes, key_phrases, questions, tips)
values (v_script_id, 6, 'Présentation de l''offre', 'Pitcher le programme 0 to 1 avec storytelling, contenu et bénéfices', 5,
  array['La méthode 0 to 1', '3 mois', 'J''ai commencé comme peintre', '10 000 clients', '1,5 million', '6 millions', 'Sur une échelle de 0 à 10, à combien tu es chaud ?'],
  array['Okay ça va jusqu''ici ?', 'As-tu des questions sur des points en particulier ?', 'Sur une échelle de 0 à 10, à combien tu es chaud pour rejoindre le programme ?', 'Qu''est-ce qui te manque pour aller à 9 ou 10 ?'],
  array['Storytelling avant programme — créer la crédibilité avant de pitcher', 'Vérifier la compréhension après chaque grande partie', 'Le score 0-10 après le pitch révèle les objections cachées']
) returning id into v_step_6;

insert into steps (script_id, "order", name, goal, duration_estimate_minutes, key_phrases, questions, tips)
values (v_script_id, 7, 'Éligibilité', 'Retourner la dynamique — c''est toi qui choisis, pas lui', 2,
  array['J''ai 3 critères', 'As-tu la capacité de te faire coacher ?', 'As-tu une vraie ambition ?', 'As-tu la capacité de prendre des décisions ?', 'Tu m''as donné envie de te prendre en coaching'],
  array['Critère 1 : as-tu la capacité de te faire coacher ?', 'Critère 2 : as-tu une vraie ambition sur ce projet ?', 'Critère 3 : as-tu la capacité de prendre des décisions ?'],
  array['Les 3 critères sont rhétoriques — tout bon prospect dira oui', 'L''inversion ''tu m''as donné envie'' renverse le rapport de force', 'Enchaîner directement sur le prix sans pause']
) returning id into v_step_7;

insert into steps (script_id, "order", name, goal, duration_estimate_minutes, key_phrases, questions, tips)
values (v_script_id, 8, 'Prix', 'Annoncer le prix clairement et ancrer la valeur', 2,
  array['3000 euros', '3000€', '1000€ par mois', 'le coût d''un stagiaire'],
  array[],
  array['Annoncer le prix sans hésitation ni excuses', 'Récapituler immédiatement ce qui est inclus pour ancrer la valeur', 'Se taire après avoir annoncé le prix']
) returning id into v_step_8;

insert into steps (script_id, "order", name, goal, duration_estimate_minutes, key_phrases, questions, tips)
values (v_script_id, 9, 'Closing', 'Obtenir le OUI et lancer le paiement immédiatement', 2,
  array['On part là-dessus ?', 'Je t''envoie un lien de paiement', 'Des zones d''ombre ?'],
  array['Est-ce que c''est clair pour toi, on part là-dessus ?', 'Est-ce qu''il y a encore des zones d''ombre que tu aimerais qu''on éclaircisse ?'],
  array['RÈGLE D''OR : se taire après ''on part là-dessus ?'' — le premier qui parle perd', 'Traiter toute réponse non-OUI comme une objection', 'Enchaîner sur les next steps immédiatement après le OUI']
) returning id into v_step_9;

-- ============================================================
-- 7 OBJECTIONS
-- ============================================================

insert into objections (script_id, "order", label, category, trigger_phrases, applicable_step_orders, responses, key_reframe)
values (v_script_id, 1, 'C''est trop cher', 'price',
  array['c''est cher', 'c''est trop cher', 'c''est beaucoup', 'le prix', 'c''est élevé'],
  array[8, 9],
  array['Je comprends que ça puisse être un prix important — c''est parce que c''est une offre importante.', 'Est-ce que c''est trop cher parce que tu n''as pas le budget, ou parce que tu penses que ça ne vaut pas ce prix ?', 'Si je t''offrais ce service gratuitement, le prendrais-tu ?', 'Si tu atteins tes objectifs, tu trouveras ça toujours trop cher ?', 'Ce que je te propose aujourd''hui, ce n''est pas une dépense — c''est un investissement. Tu vas le retrouver cet argent.', 'Poses-toi la bonne question : est-ce que tu es prêt à faire des changements, ou est-ce que cet objectif n''est pas si important pour toi ?'],
  'Dépense vs investissement — faire calculer mentalement le ROI si les objectifs sont atteints'
);

insert into objections (script_id, "order", label, category, trigger_phrases, applicable_step_orders, responses, key_reframe)
values (v_script_id, 2, 'Je n''ai pas le budget', 'budget',
  array['j''ai pas l''argent', 'pas de budget', 'je n''ai pas les moyens', 'financièrement c''est compliqué', 'je peux pas me le permettre'],
  array[8, 9],
  array['À part le problème du budget, tout est bon — on pourrait commencer si il n''y avait pas ça ?', 'Est-ce une question logistique (pas de trésorerie) ou une part trop importante de ton budget ?', 'Combien tu as sur ton compte et combien tu vas recevoir dans les 30 jours ?', 'Si on pouvait faire un paiement en 2 ou 3 fois, est-ce que tu serais d''accord pour qu''on commence ?'],
  'Isoler le budget comme seul frein, puis proposer un échelonnement — ne jamais proposer avant d''avoir isolé ce frein'
);

insert into objections (script_id, "order", label, category, trigger_phrases, applicable_step_orders, responses, key_reframe)
values (v_script_id, 3, 'Je vais y réfléchir', 'stall',
  array['je vais y réfléchir', 'j''ai besoin de temps', 'laisse-moi réfléchir', 'je reviens vers toi', 'pas maintenant'],
  array[8, 9],
  array['Je comprends — à quoi dois-tu réfléchir simplement ?', 'Y a-t-il un sujet qu''on n''a pas abordé durant l''appel ?', 'Qu''est-ce qui te bloque pour passer à l''action maintenant ?', 'Ta décision est liée aux informations que tu as — je suis là maintenant, pose-moi tes questions.', 'De toute façon, qu''on bosse ensemble ou non, ça n''impacte pas ma vie — par contre ça va impacter la tienne.'],
  'La réflexion n''est jamais une question de temps — c''est une question d''informations manquantes. Identifier laquelle.'
);

insert into objections (script_id, "order", label, category, trigger_phrases, applicable_step_orders, responses, key_reframe)
values (v_script_id, 4, 'Ce n''est pas le bon moment', 'timing',
  array['c''est pas le bon moment', 'pas maintenant', 'plus tard', 'dans quelques mois', 'j''attends de'],
  array[8, 9],
  array['Qu''est-ce qu''il nous manque pour commencer dès maintenant ?', 'Tu n''auras pas évolué entre maintenant et dans 3 mois sans action.', 'Pose-moi les questions que tu as — ce n''est pas une question de temps, c''est une question d''informations.', 'De toute façon, qu''on bosse ensemble ou non, ça n''impacte pas ma vie — par contre ça va impacter la tienne.'],
  'Le ''bon moment'' n''existe pas — la situation ne changera pas d''elle-même sans action'
);

insert into objections (script_id, "order", label, category, trigger_phrases, applicable_step_orders, responses, key_reframe)
values (v_script_id, 5, 'Je parle aussi avec vos concurrents', 'competition',
  array['je regarde d''autres options', 'j''ai parlé avec', 'je compare', 'j''ai une autre proposition', 'concurrent', 'autre programme'],
  array[2, 8, 9],
  array['Mes concurrents sont très bons. Mais si tu leur as déjà parlé, qu''est-ce qui te retient de travailler avec eux ?', 'Qu''est-ce qui t''a amené à réserver cet appel avec moi aussi ?'],
  'Amener le prospect à ses propres conclusions — s''il est encore là, c''est qu''il n''a pas trouvé satisfaction ailleurs. Ne jamais dénigrer.'
);

insert into objections (script_id, "order", label, category, trigger_phrases, applicable_step_orders, responses, key_reframe)
values (v_script_id, 6, 'Est-ce que ça va vraiment marcher pour moi ?', 'doubt',
  array['est-ce que ça marche vraiment', 'j''ai des doutes', 'comment tu peux garantir', 'et si ça ne fonctionne pas', 'ça va vraiment fonctionner'],
  array[6, 7, 8, 9],
  array['La seule chose que je peux garantir : si tu ne fais rien, tu conserveras ton problème.', 'Il m''est impossible de garantir 100% — ça dépend aussi de ton implication. Mais si tu ne fais rien, il ne se passera rien.', 'Rappelle-toi ce que tu m''as dit sur tes objectifs — est-ce que tu veux que dans 3 mois rien n''ait changé ?'],
  'Honnêteté totale + retourner vers les objectifs : l''inaction est la seule certitude de ne pas réussir'
);

insert into objections (script_id, "order", label, category, trigger_phrases, applicable_step_orders, responses, key_reframe)
values (v_script_id, 7, 'Je dois en parler avec mon associé / ma femme', 'third_party',
  array['j''en parle à ma femme', 'j''en parle à mon mari', 'mon associé', 'j''ai besoin de l''accord de', 'on décide ensemble'],
  array[8, 9],
  array['Est-ce que tu penses que ton/ta partenaire va te soutenir dans cette démarche ?', 'Pourquoi tu as besoin de lui/elle demander son avis ?', 'Est-ce qu''il/elle sait que tu as les problèmes dont on a parlé ?', 'Est-ce qu''il/elle approuve que tu aies encore ces problèmes non résolus ?', 'Ça veut dire que tu fais déjà quelque chose qu''il/elle n''approuve pas — tu n''as pas encore résolu ces problèmes.', 'À la fin de la journée, il vaut mieux demander pardon que demander la permission — surtout en business.'],
  'Retourner la logique : ne pas avoir résolu le problème est aussi une décision que le partenaire n''approuve pas'
);

end $$;
