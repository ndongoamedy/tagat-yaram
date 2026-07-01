import { createFileRoute, Link } from "@tanstack/react-router";
import heroImage from "@/assets/hero-athlete.jpg";
import { Dumbbell, Sparkles, PlayCircle, ArrowRight, Check } from "lucide-react";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

function LandingPage() {
  return (
    <div className="min-h-screen bg-canvas text-foreground">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-canvas/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="grid size-8 place-items-center rounded-lg bg-brand text-brand-foreground">
              <Dumbbell className="size-4" />
            </div>
            <span className="text-lg font-bold tracking-tight">TagatYaram</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/auth"
              className="text-sm font-medium text-muted-foreground transition hover:text-foreground"
            >
              Connexion
            </Link>
            <Link
              to="/auth"
              search={{ mode: "signup" }}
              className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground shadow-brand transition hover:brightness-110"
            >
              Commencer
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 py-16 lg:py-24">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 md:items-center">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-brand">
              <Sparkles className="size-3.5" /> Fitness IA · Afrique de l'Ouest
            </span>
            <h1 className="text-balance text-5xl font-bold leading-[1.02] tracking-tight lg:text-6xl">
              La force du Sahel <br />
              <span className="text-brand">dans votre poche.</span>
            </h1>
            <p className="max-w-lg text-pretty text-lg leading-relaxed text-muted-foreground">
              Un programme de musculation généré par IA, adapté à ton corps, ton objectif et ta
              salle. Tout en français, avec une vidéo pour chaque exercice.
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                to="/auth"
                search={{ mode: "signup" }}
                className="inline-flex items-center gap-2 rounded-full bg-brand px-7 py-4 text-base font-semibold text-brand-foreground shadow-brand transition hover:brightness-110"
              >
                Commencer gratuitement <ArrowRight className="size-4" />
              </Link>
              <Link
                to="/auth"
                className="inline-flex items-center gap-2 rounded-full border border-border px-7 py-4 text-base font-medium text-foreground transition hover:bg-surface"
              >
                J'ai déjà un compte
              </Link>
            </div>
            <ul className="grid grid-cols-1 gap-2 pt-4 text-sm text-muted-foreground sm:grid-cols-2">
              {[
                "Programme 100% personnalisé",
                "Exercices expliqués en français",
                "Vidéo YouTube pour chaque mouvement",
                "Suivi de progression simple",
              ].map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <Check className="size-4 text-brand" /> {t}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative">
            <div className="absolute -inset-6 -z-10 rounded-3xl bg-gradient-to-tr from-brand/20 to-transparent blur-2xl" />
            <img
              src={heroImage}
              alt="Athlète en séance de musculation au coucher du soleil à Dakar"
              width={1024}
              height={1280}
              className="aspect-[4/5] w-full rounded-3xl object-cover ring-1 ring-border"
            />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-border/60 bg-surface/40">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="text-3xl font-bold tracking-tight">Comment ça marche</h2>
          <p className="mt-2 max-w-xl text-muted-foreground">
            Trois étapes pour te mettre à la musculation aujourd'hui.
          </p>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              {
                n: "01",
                title: "Ton profil en 2 minutes",
                desc: "Âge, taille, poids, objectif, jours dispo. On sait ce qu'il te faut.",
              },
              {
                n: "02",
                title: "L'IA construit ton programme",
                desc: "Un plan de musculation complet, adapté à ton morphotype et ton niveau.",
              },
              {
                n: "03",
                title: "Tu suis, tu coches, tu progresses",
                desc: "Une séance = une checklist. Poids, reps, terminé. C'est tout.",
              },
            ].map((s) => (
              <div
                key={s.n}
                className="rounded-2xl border border-border bg-surface p-6 transition hover:border-brand/40"
              >
                <span className="font-mono text-sm text-brand">{s.n}</span>
                <h3 className="mt-3 text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="rounded-3xl border border-border bg-gradient-to-br from-brand/15 via-surface to-surface p-10 text-center md:p-16">
          <PlayCircle className="mx-auto size-10 text-brand" />
          <h2 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">
            Ton premier programme t'attend.
          </h2>
          <p className="mx-auto mt-3 max-w-md text-muted-foreground">
            Gratuit pendant tout le MVP. Aucune carte bancaire requise.
          </p>
          <Link
            to="/auth"
            search={{ mode: "signup" }}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand px-7 py-4 text-base font-semibold text-brand-foreground shadow-brand transition hover:brightness-110"
          >
            Créer mon compte <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-border/60 py-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 text-sm text-muted-foreground">
          <span>© {new Date().getFullYear()} TagatYaram</span>
          <span>Fait à Dakar 🇸🇳</span>
        </div>
      </footer>
    </div>
  );
}
