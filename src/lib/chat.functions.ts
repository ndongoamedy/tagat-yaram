import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { FAQ } from "@/lib/faq";

const messageSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(4000),
      }),
    )
    .min(1)
    .max(30),
});

export const askCoach = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => messageSchema.parse(data))
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("LOVABLE_API_KEY manquant");

    const knowledge = FAQ.map((f) => `Q: ${f.q}\nR: ${f.a}`).join("\n\n");

    const systemPrompt = `Tu es TagatCoach, l'assistant francophone de l'app TagatYaram, conçu pour les débutants d'Afrique de l'Ouest.

TON STYLE :
- Réponses courtes (3 à 6 phrases), chaleureuses, tutoiement, sans jargon.
- Pas de listes à puces sauf si vraiment utile.
- Si la question parle d'une blessure, douleur aiguë ou symptôme médical : rappelle poliment de consulter un médecin ou kiné.
- Si la question sort du sport / nutrition / récupération / matériel : recentre gentiment.

BASE DE CONNAISSANCES (utilise-la en priorité, reformule si besoin) :
${knowledge}`;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "system", content: systemPrompt }, ...data.messages],
      }),
    });

    if (!res.ok) {
      if (res.status === 429) throw new Error("Trop de requêtes, réessaie dans un instant.");
      if (res.status === 402) throw new Error("Crédits IA insuffisants.");
      throw new Error(`Erreur IA (${res.status})`);
    }

    const payload = await res.json();
    const content: string = payload?.choices?.[0]?.message?.content ?? "";
    return { content: content.trim() };
  });
