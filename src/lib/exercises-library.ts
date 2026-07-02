// Static library of exercises with verified YouTube video IDs.
// The AI generator MUST pick names + youtube_id from this list only.

export type LibraryExercise = {
  name: string;
  muscles: string[];
  youtube_id: string; // verified 11-char ID
  alternative: string;
  category: "push" | "pull" | "legs" | "core" | "full_body";
};

export const EXERCISES_LIBRARY: LibraryExercise[] = [
  // Push
  { name: "Développé couché à la barre", muscles: ["pectoraux", "triceps", "épaules"], youtube_id: "gRVjAtPip0Y", alternative: "Pompes", category: "push" },
  { name: "Développé incliné haltères", muscles: ["haut des pectoraux", "épaules"], youtube_id: "8iPEnn-ltC8", alternative: "Pompes surélevées", category: "push" },
  { name: "Développé militaire", muscles: ["épaules", "triceps"], youtube_id: "qEwKCR5JCog", alternative: "Développé haltères assis", category: "push" },
  { name: "Élévations latérales", muscles: ["épaules"], youtube_id: "3VcKaXpzqRo", alternative: "Élévations avec bouteilles", category: "push" },
  { name: "Dips", muscles: ["pectoraux", "triceps"], youtube_id: "2z8JmcrW-As", alternative: "Dips sur banc", category: "push" },
  { name: "Extension triceps à la poulie", muscles: ["triceps"], youtube_id: "2-LAMcpzODU", alternative: "Extension haltère au-dessus tête", category: "push" },
  { name: "Pompes", muscles: ["pectoraux", "triceps"], youtube_id: "IODxDxX7oi4", alternative: "Pompes sur genoux", category: "push" },

  // Pull
  { name: "Tractions", muscles: ["dos", "biceps"], youtube_id: "eGo4IYlbE5g", alternative: "Tirage vertical", category: "pull" },
  { name: "Tirage vertical à la poulie", muscles: ["dos", "biceps"], youtube_id: "CAwf7n6Luuc", alternative: "Tractions assistées", category: "pull" },
  { name: "Rowing barre", muscles: ["dos", "biceps"], youtube_id: "kBWAon7ItDw", alternative: "Rowing haltère", category: "pull" },
  { name: "Rowing haltère", muscles: ["dos", "biceps"], youtube_id: "roCP6wCXPqo", alternative: "Rowing barre", category: "pull" },
  { name: "Curl biceps barre", muscles: ["biceps"], youtube_id: "kwG2ipFRgfo", alternative: "Curl haltères", category: "pull" },
  { name: "Curl haltères", muscles: ["biceps"], youtube_id: "ykJmrZ5v0Oo", alternative: "Curl barre", category: "pull" },
  { name: "Face pull", muscles: ["arrière épaules", "dos"], youtube_id: "rep-qVOkqgk", alternative: "Élévations arrière", category: "pull" },

  // Legs
  { name: "Squat barre", muscles: ["quadriceps", "fessiers"], youtube_id: "ultWZbUMPL8", alternative: "Squat sans charge", category: "legs" },
  { name: "Presse à cuisses", muscles: ["quadriceps", "fessiers"], youtube_id: "IZxyjW7MPJQ", alternative: "Squat haltères", category: "legs" },
  { name: "Fentes haltères", muscles: ["quadriceps", "fessiers"], youtube_id: "QOVaHwm-Q6U", alternative: "Fentes au poids du corps", category: "legs" },
  { name: "Soulevé de terre roumain", muscles: ["ischio-jambiers", "fessiers", "dos"], youtube_id: "jEy_czb3RKA", alternative: "Good morning", category: "legs" },
  { name: "Leg curl", muscles: ["ischio-jambiers"], youtube_id: "1Tq3QdYUuHs", alternative: "Soulevé de terre roumain", category: "legs" },
  { name: "Mollets debout", muscles: ["mollets"], youtube_id: "gwLzBJYoWlI", alternative: "Mollets sur marche", category: "legs" },

  // Core
  { name: "Gainage planche", muscles: ["abdominaux", "core"], youtube_id: "ASdvN_XEl_c", alternative: "Gainage sur genoux", category: "core" },
  { name: "Crunch", muscles: ["abdominaux"], youtube_id: "Xyd_fa5zoEU", alternative: "Relevés de bassin", category: "core" },
];

export const EXERCISE_BY_NAME: Record<string, LibraryExercise> = Object.fromEntries(
  EXERCISES_LIBRARY.map((e) => [e.name, e]),
);
