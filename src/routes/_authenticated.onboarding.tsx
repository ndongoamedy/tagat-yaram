import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import { generateProgram } from "@/lib/programs.functions";
import { toast } from "sonner";
import { Loader2, ArrowRight, ArrowLeft, Sparkles } from "lucide-react";

export const Route = createFileRoute("/_authenticated/onboarding")({
  component: OnboardingPage,
});

type Form = {
  first_name: string;
  age: number;
  height_cm: number;
  weight_kg: number;
  sex: "homme" | "femme" | "autre";
  morphotype: "ectomorphe" | "mesomorphe" | "endomorphe" | "inconnu";
  goal: "prise_de_masse" | "perte_de_poids" | "entretien" | "force";
  training_days_per_week: number;
  experience_level: "debutant" | "intermediaire" | "avance";
};

const defaults: Form = {
  first_name: "",
  age: 25,
  height_cm: 175,
  weight_kg: 70,
  sex: "homme",
  morphotype: "inconnu",
  goal: "prise_de_masse",
  training_days_per_week: 4,
  experience_level: "debutant",
};

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<Form>(defaults);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const generate = useServerFn(generateProgram);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      const { data: p } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", data.user.id)
        .maybeSingle();
      if (p) {
        setForm((f) => ({
          ...f,
          first_name: p.first_name ?? f.first_name,
          age: p.age ?? f.age,
          height_cm: p.height_cm ?? f.height_cm,
          weight_kg: p.weight_kg ? Number(p.weight_kg) : f.weight_kg,
          sex: (p.sex as any) ?? f.sex,
          morphotype: (p.morphotype as any) ?? f.morphotype,
          goal: (p.goal as any) ?? f.goal,
          training_days_per_week: p.training_days_per_week ?? f.training_days_per_week,
          experience_level: (p.experience_level as any) ?? f.experience_level,
        }));
      }
    });
  }, []);

  const steps = ["Toi", "Corps", "Objectif", "Programme"];

  async function submit() {
    setLoading(true);
    try {
      await generate({ data: form });
      toast.success("Programme prêt !");
      navigate({ to: "/dashboard" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur");
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="grid min-h-[80vh] place-items-center px-6">
        <div className="max-w-md text-center">
          <div className="mx-auto grid size-16 place-items-center rounded-full bg-brand-muted">
            <Sparkles className="size-8 animate-pulse text-brand" />
          </div>
          <h2 className="mt-6 text-2xl font-bold">L'IA construit ton programme…</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Analyse de ton profil, choix des exercices, structure hebdomadaire. Ça prend 20 à
            40 secondes.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-10 md:py-16">
      <div className="mb-8 flex items-center justify-between text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        <span>Étape {step + 1} / {steps.length}</span>
        <span className="text-brand">{steps[step]}</span>
      </div>
      <div className="mb-8 h-1 w-full overflow-hidden rounded-full bg-surface">
        <div
          className="h-full bg-brand transition-all"
          style={{ width: `${((step + 1) / steps.length) * 100}%` }}
        />
      </div>

      <div className="rounded-3xl border border-border bg-surface p-6 md:p-8">
        {step === 0 && (
          <div className="space-y-5">
            <h2 className="text-2xl font-bold">Comment tu t'appelles ?</h2>
            <Field label="Prénom">
              <input
                value={form.first_name}
                onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                placeholder="Amedy"
                className="input"
              />
            </Field>
            <Field label="Âge">
              <input
                type="number"
                value={form.age}
                onChange={(e) => setForm({ ...form, age: Number(e.target.value) })}
                className="input"
              />
            </Field>
            <Choices
              label="Sexe"
              value={form.sex}
              onChange={(v) => setForm({ ...form, sex: v as Form["sex"] })}
              options={[
                { v: "homme", l: "Homme" },
                { v: "femme", l: "Femme" },
                { v: "autre", l: "Autre" },
              ]}
            />
          </div>
        )}

        {step === 1 && (
          <div className="space-y-5">
            <h2 className="text-2xl font-bold">Ton corps aujourd'hui</h2>
            <Field label="Taille (cm)">
              <input
                type="number"
                value={form.height_cm}
                onChange={(e) => setForm({ ...form, height_cm: Number(e.target.value) })}
                className="input"
              />
            </Field>
            <Field label="Poids (kg)">
              <input
                type="number"
                value={form.weight_kg}
                onChange={(e) => setForm({ ...form, weight_kg: Number(e.target.value) })}
                className="input"
              />
            </Field>
            <Choices
              label="Morphotype"
              value={form.morphotype}
              onChange={(v) => setForm({ ...form, morphotype: v as Form["morphotype"] })}
              options={[
                { v: "ectomorphe", l: "Ectomorphe", d: "Fin, du mal à prendre" },
                { v: "mesomorphe", l: "Mésomorphe", d: "Athlétique naturel" },
                { v: "endomorphe", l: "Endomorphe", d: "Prend facilement" },
                { v: "inconnu", l: "Je ne sais pas" },
              ]}
            />
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <h2 className="text-2xl font-bold">Ton objectif</h2>
            <Choices
              label="Objectif principal"
              value={form.goal}
              onChange={(v) => setForm({ ...form, goal: v as Form["goal"] })}
              options={[
                { v: "prise_de_masse", l: "Prise de masse" },
                { v: "force", l: "Prise de force" },
                { v: "perte_de_poids", l: "Perte de poids" },
                { v: "entretien", l: "Entretien" },
              ]}
            />
            <Choices
              label="Niveau"
              value={form.experience_level}
              onChange={(v) =>
                setForm({ ...form, experience_level: v as Form["experience_level"] })
              }
              options={[
                { v: "debutant", l: "Débutant", d: "0-6 mois" },
                { v: "intermediaire", l: "Intermédiaire", d: "6 mois - 2 ans" },
                { v: "avance", l: "Avancé", d: "2 ans+" },
              ]}
            />
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            <h2 className="text-2xl font-bold">Ta disponibilité</h2>
            <Choices
              label="Jours par semaine à la salle"
              value={String(form.training_days_per_week)}
              onChange={(v) => setForm({ ...form, training_days_per_week: Number(v) })}
              options={[
                { v: "2", l: "2 jours" },
                { v: "3", l: "3 jours" },
                { v: "4", l: "4 jours" },
                { v: "5", l: "5 jours" },
                { v: "6", l: "6 jours" },
              ]}
            />
            <div className="rounded-xl border border-brand/20 bg-brand-muted p-4 text-sm text-brand-foreground/90">
              <p className="font-medium">Prêt·e ?</p>
              <p className="mt-1 text-muted-foreground">
                L'IA va générer ton programme personnalisé maintenant.
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 flex justify-between">
        <button
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-3 text-sm font-medium text-muted-foreground disabled:opacity-40"
        >
          <ArrowLeft className="size-4" /> Retour
        </button>
        {step < steps.length - 1 ? (
          <button
            onClick={() => setStep((s) => s + 1)}
            className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-brand-foreground shadow-brand hover:brightness-110"
          >
            Continuer <ArrowRight className="size-4" />
          </button>
        ) : (
          <button
            onClick={submit}
            className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-brand-foreground shadow-brand hover:brightness-110"
          >
            <Sparkles className="size-4" /> Générer mon programme
          </button>
        )}
      </div>

      <style>{`
        .input {
          width: 100%;
          border-radius: 0.75rem;
          border: 1px solid var(--input);
          background: var(--surface-2);
          padding: 0.75rem 1rem;
          color: var(--foreground);
          outline: none;
          font-size: 1rem;
        }
        .input:focus { border-color: var(--brand); }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

function Choices({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { v: string; l: string; d?: string }[];
}) {
  return (
    <div>
      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <div className="mt-2 grid grid-cols-2 gap-2">
        {options.map((o) => {
          const active = value === o.v;
          return (
            <button
              key={o.v}
              type="button"
              onClick={() => onChange(o.v)}
              className={`rounded-xl border p-3 text-left text-sm transition ${
                active
                  ? "border-brand bg-brand-muted text-foreground"
                  : "border-border bg-surface-2 text-muted-foreground hover:border-brand/40"
              }`}
            >
              <div className="font-semibold text-foreground">{o.l}</div>
              {o.d && <div className="mt-0.5 text-xs text-muted-foreground">{o.d}</div>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
