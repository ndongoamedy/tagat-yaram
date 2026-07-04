import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { EXERCISES_LIBRARY, EXERCISE_BY_NAME } from "@/lib/exercises-library";

const profileSchema = z.object({
  first_name: z.string().min(1).max(50),
  age: z.number().int().min(12).max(90),
  height_cm: z.number().int().min(120).max(230),
  weight_kg: z.number().min(30).max(250),
  sex: z.enum(["homme", "femme"]),
  morphotype: z.enum(["ectomorphe", "mesomorphe", "endomorphe", "inconnu"]),
  goal: z.enum(["prise_de_masse", "perte_de_poids", "entretien", "force"]),
  training_days_per_week: z.number().int().min(1).max(6),
  experience_level: z.enum(["debutant", "intermediaire", "avance"]),
});

export type ProgramExercise = {
  name: string;
  muscles: string[];
  sets: number;
  reps: string;
  description: string;
  alternative: string;
  youtube_id: string;
};

export type ProgramDay = {
  day_number: number;
  name: string;
  tag: string;
  exercises: ProgramExercise[];
};

export type ProgramData = { days: ProgramDay[] };

export const generateProgram = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => profileSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    // Save profile
    const { error: pErr } = await supabase
      .from("profiles")
      .update({ ...data, onboarded: true })
      .eq("id", userId);
    if (pErr) throw new Error(`Profil : ${pErr.message}`);

    // Build prompt with the allowed exercise list
    const allowedList = EXERCISES_LIBRARY.map(
      (e) => `- "${e.name}" [${e.category}] muscles: ${e.muscles.join(", ")}`,
    ).join("\n");

    const systemPrompt = `Tu es un coach de musculation francophone spécialisé pour les débutants d'Afrique de l'Ouest. Génère un programme de musculation en français, adapté au profil de l'utilisateur.

RÈGLES STRICTES :
- Réponds UNIQUEMENT en JSON valide, aucun texte autour, aucun markdown, aucun \`\`\`.
- Utilise UNIQUEMENT les exercices de la liste autorisée ci-dessous. N'invente JAMAIS un nom d'exercice.
- N'inclus PAS de champ youtube_id : il sera ajouté automatiquement.
- Copie le nom d'exercice EXACTEMENT comme dans la liste (accents, majuscules, tirets).
- Utilise EXACTEMENT ce schéma :
{
  "days": [
    {
      "day_number": 1,
      "name": "Haut du corps (Poussée)",
      "tag": "push",
      "exercises": [
        {
          "name": "Développé couché à la barre",
          "sets": 4,
          "reps": "8-10",
          "description": "Description courte, 2 lignes max, conseils débutant."
        }
      ]
    }
  ]
}
- 6 à 8 exercices par jour selon le groupe musculaire : jours jambes/dos peuvent monter à 8, jours bras isolés 6. Ne dépasse JAMAIS 8.
- Charges et répétitions modérées adaptées débutants (8-12 reps le plus souvent, 10-15 pour isolation).
- Adapte structure : half body si 2-3 jours/semaine, split PPL si 4-6 jours.
- Tag valides : "push", "pull", "legs", "upper", "lower", "full_body".

LISTE AUTORISÉE :
${allowedList}`;

    const userPrompt = `Profil :
- Prénom : ${data.first_name}
- Âge : ${data.age} ans
- Taille : ${data.height_cm} cm
- Poids : ${data.weight_kg} kg
- Sexe : ${data.sex}
- Morphotype : ${data.morphotype}
- Objectif : ${data.goal}
- Jours d'entraînement par semaine : ${data.training_days_per_week}
- Niveau : ${data.experience_level}

Génère le programme de musculation en JSON.`;

    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("LOVABLE_API_KEY manquant");

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("AI gateway error", res.status, text);
      if (res.status === 429) throw new Error("Trop de requêtes, réessaie dans un instant.");
      if (res.status === 402) throw new Error("Crédits IA insuffisants.");
      throw new Error(`Erreur IA (${res.status})`);
    }

    const payload = await res.json();
    const content: string = payload?.choices?.[0]?.message?.content ?? "";
    const cleaned = content.replace(/```json|```/g, "").trim();

    let program: ProgramData;
    try {
      program = JSON.parse(cleaned);
    } catch {
      const match = cleaned.match(/\{[\s\S]*\}/);
      if (!match) throw new Error("Réponse IA invalide");
      program = JSON.parse(match[0]);
    }

    if (!program?.days?.length) throw new Error("Programme vide");

    // Enrich every exercise with library data (youtube_id, muscles, alternative)
    // and filter out any hallucinated names.
    program.days = program.days.map((day) => ({
      ...day,
      exercises: day.exercises
        .map((ex) => {
          const lib = EXERCISE_BY_NAME[ex.name];
          if (!lib) return null;
          return {
            name: lib.name,
            muscles: lib.muscles,
            sets: ex.sets,
            reps: ex.reps,
            description: ex.description,
            alternative: lib.alternative,
            youtube_id: lib.youtube_id,
          };
        })
        .filter((e): e is NonNullable<typeof e> => e !== null),
    }));

    // Deactivate old programs
    await supabase.from("programs").update({ is_active: false }).eq("user_id", userId);

    // Insert new
    const { data: inserted, error: iErr } = await supabase
      .from("programs")
      .insert({ user_id: userId, program_data: program as any, is_active: true })
      .select("id")
      .single();
    if (iErr) throw new Error(`Sauvegarde : ${iErr.message}`);

    return { id: inserted.id, program };
  });
