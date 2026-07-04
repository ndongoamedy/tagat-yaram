export type FaqTheme = "Entraînement" | "Nutrition" | "Récupération" | "Matériel";

export type FaqItem = {
  id: string;
  theme: FaqTheme;
  q: string;
  a: string;
  keywords?: string[];
};

export const FAQ: FaqItem[] = [
  // Entraînement
  { id: "e1", theme: "Entraînement", q: "Je ne sens rien dans le muscle, est-ce normal ?", a: "Oui, surtout au début. La connexion muscle-cerveau se travaille. Concentre-toi sur des mouvements lents, contrôlés, et une amplitude complète. La sensation vient avec l'expérience.", keywords: ["sensation","ressens","pas sentir"] },
  { id: "e2", theme: "Entraînement", q: "Combien de temps de repos entre les séries ?", a: "60 à 90 s pour l'hypertrophie (prise de masse), 2 à 3 min pour la force sur les gros exercices (squat, développé, soulevé). Isolation (biceps, mollets) : 45-60 s suffisent." },
  { id: "e3", theme: "Entraînement", q: "Combien de fois par semaine dois-je m'entraîner ?", a: "3 à 4 séances par semaine sont idéales pour un débutant. 2 séances suffisent pour progresser, 5-6 c'est possible mais assure d'abord une bonne récupération et un bon sommeil." },
  { id: "e4", theme: "Entraînement", q: "Comment savoir si je progresse ?", a: "Trois signes : tu ajoutes du poids ou des répétitions d'une séance à l'autre, tes mensurations ou photos évoluent sur 4-6 semaines, tu te sens plus fort dans la vie quotidienne. Note tes séances." },
  { id: "e5", theme: "Entraînement", q: "Faut-il aller à l'échec sur chaque série ?", a: "Non. Garde 1 à 3 répétitions en réserve la plupart du temps. L'échec total est utile occasionnellement sur les dernières séries d'isolation, mais épuise le système nerveux s'il est fait à chaque exercice." },
  { id: "e6", theme: "Entraînement", q: "Mieux vaut plus de poids ou plus de répétitions ?", a: "Les deux progressent le muscle. Reste dans une fourchette 6-12 reps la plupart du temps, avec une technique propre. Ajoute du poids quand tu atteins facilement le haut de la fourchette." },
  { id: "e7", theme: "Entraînement", q: "Combien de temps dure une bonne séance ?", a: "45 à 75 min hors échauffement. Au-delà, la qualité baisse. Mieux vaut une séance courte et intense qu'une longue et molle." },
  { id: "e8", theme: "Entraînement", q: "Je débute, cardio ou musculation ?", a: "Musculation en priorité si l'objectif est physique. Ajoute 20-30 min de cardio 2-3× par semaine pour la santé cardiovasculaire. Marche quotidienne toujours bénéfique." },
  { id: "e9", theme: "Entraînement", q: "Faut-il s'échauffer avant chaque séance ?", a: "Oui. 5 min de cardio léger puis 1-2 séries légères sur le premier exercice du jour. Ça réduit le risque de blessure et améliore la performance." },
  { id: "e10", theme: "Entraînement", q: "Je suis débutant, half body ou split ?", a: "Half body (2-3 séances) est parfait pour débuter : plus de fréquence par muscle. Passe au split PPL quand tu peux tenir 4-5 séances régulières." },

  // Nutrition
  { id: "n1", theme: "Nutrition", q: "Que manger avant la séance ?", a: "Un repas 1h30 à 2h avant contenant glucides (riz, pain, banane) et protéines (œufs, poulet, yaourt). Si peu de temps : une banane et un peu de miel 30 min avant." },
  { id: "n2", theme: "Nutrition", q: "Que manger après la séance ?", a: "Dans les 1-2h : protéines (poulet, poisson, œufs, tofu) + glucides (riz, patate douce, pain). Bois beaucoup d'eau. Pas d'urgence à la seconde près." },
  { id: "n3", theme: "Nutrition", q: "Combien de protéines par jour ?", a: "Vise 1,6 à 2 g par kg de poids corporel. Pour 70 kg : 112-140 g/jour, répartis en 3-4 repas. Œufs, poulet, poisson, légumineuses, produits laitiers." },
  { id: "n4", theme: "Nutrition", q: "Faut-il prendre de la whey ?", a: "Non, ce n'est pas obligatoire. La whey n'est qu'une protéine en poudre pratique quand tu n'atteins pas tes besoins avec les repas. Priorité aux vrais aliments." },
  { id: "n5", theme: "Nutrition", q: "Comment prendre du muscle sans grossir en gras ?", a: "Léger surplus calorique (+200 à +300 kcal/jour), protéines suffisantes, entraînement progressif. Prise de muscle propre = lente (0,5 à 1 kg/mois pour un débutant)." },
  { id: "n6", theme: "Nutrition", q: "Puis-je perdre du gras et prendre du muscle en même temps ?", a: "Oui, surtout en tant que débutant ou après une longue pause. Léger déficit calorique, beaucoup de protéines, entraînement lourd. C'est plus lent que de faire l'un puis l'autre." },
  { id: "n7", theme: "Nutrition", q: "Combien d'eau boire par jour ?", a: "35 ml par kg de poids en base, plus 500 ml par heure d'entraînement. Pour 70 kg qui s'entraîne 1h : ~3 L. Urine claire = tu es bien hydraté." },
  { id: "n8", theme: "Nutrition", q: "Les créatines valent-elles le coup ?",  a: "La créatine monohydrate est le complément le plus étudié et sûr. 3-5 g/jour, à n'importe quel moment. Aide à la force et à la récupération. Pas indispensable, utile." },

  // Récupération
  { id: "r1", theme: "Récupération", q: "J'ai des courbatures, est-ce grave ?", a: "Non, elles apparaissent 24-48h après une séance intense ou nouvelle. Douleurs musculaires = normal. Douleur articulaire, aiguë ou localisée = arrête et consulte." },
  { id: "r2", theme: "Récupération", q: "Puis-je m'entraîner avec des courbatures ?", a: "Oui si elles sont modérées, en évitant de retravailler directement le muscle très douloureux. Ça peut même aider à évacuer. Écoute ton corps." },
  { id: "r3", theme: "Récupération", q: "Combien d'heures de sommeil pour progresser ?", a: "7 à 9h par nuit. Le sommeil est le moment principal où le muscle se répare. Sans sommeil, pas de progrès, même avec le meilleur entraînement." },
  { id: "r4", theme: "Récupération", q: "Faut-il des jours de repos complets ?", a: "Oui, au moins 1 par semaine. Le muscle grandit au repos, pas à l'entraînement. Marche, étirements légers restent bénéfiques les jours off." },
  { id: "r5", theme: "Récupération", q: "Que faire en cas de blessure ?", a: "Arrête l'exercice concerné immédiatement. Applique le protocole GREC (Glace, Repos, Élévation, Compression) 48-72h. Si la douleur persiste ou est intense, consulte un médecin ou kinésithérapeute." },
  { id: "r6", theme: "Récupération", q: "Les étirements avant la séance sont-ils utiles ?", a: "Les étirements statiques longs avant sont contre-productifs pour la force. Fais plutôt un échauffement dynamique. Étirements statiques : plutôt après la séance ou sur des séances dédiées." },
  { id: "r7", theme: "Récupération", q: "Bain froid ou massage après séance ?", a: "Utiles pour se sentir mieux, mais impact limité sur la récupération réelle. Priorité : sommeil, hydratation, protéines. Un massage est agréable et détend, sans être magique." },

  // Matériel
  { id: "m1", theme: "Matériel", q: "Quelles chaussures pour la salle ?", a: "Semelle plate et rigide (converse, chaussures d'haltéro) pour squat/soulevé. Chaussures de running trop molles = instabilité. Pieds nus ou chaussettes fonctionnent aussi." },
  { id: "m2", theme: "Matériel", q: "Ai-je besoin d'une ceinture de force ?", a: "Non au début. Elle sert au-dessus de ~1,3× ton poids au squat/soulevé. Apprends d'abord à gainer naturellement avec le diaphragme." },
  { id: "m3", theme: "Matériel", q: "Sangles de tirage, oui ou non ?", a: "Utile quand ta prise lâche avant le dos (rowing, soulevé lourd). Alterne avec et sans, sinon tes avant-bras ne se renforcent jamais." },
  { id: "m4", theme: "Matériel", q: "Puis-je m'entraîner à la maison sans matériel ?", a: "Oui pour débuter : pompes (variations), tractions, squats, fentes, gainage, dips sur chaise. Progrès limités au bout de quelques mois — un peu de matériel (bandes, haltères, barre) débloque la suite." },
  { id: "m5", theme: "Matériel", q: "Quels haltères acheter pour la maison ?", a: "Haltères réglables 2-25 kg couvrent la plupart des besoins. Un banc inclinable ajoute énormément d'exercices. Une barre de traction sur porte est un excellent achat pas cher." },
];

export const THEMES: FaqTheme[] = ["Entraînement", "Nutrition", "Récupération", "Matériel"];

// Simple fuzzy search: tokenize, score by shared normalized tokens + substring boost.
function normalize(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2);
}

export function searchFaq(query: string, items: FaqItem[]): FaqItem[] {
  const q = query.trim();
  if (!q) return items;
  const qTokens = normalize(q);
  if (qTokens.length === 0) return items;
  const scored = items.map((it) => {
    const hay = normalize(`${it.q} ${it.a} ${(it.keywords ?? []).join(" ")}`);
    let score = 0;
    for (const t of qTokens) {
      if (hay.includes(t)) score += 3;
      for (const h of hay) if (h.startsWith(t) || t.startsWith(h)) score += 1;
    }
    return { it, score };
  });
  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((s) => s.it);
}
