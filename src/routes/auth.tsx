import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { toast } from "sonner";
import { Dumbbell, Loader2 } from "lucide-react";

const searchSchema = z.object({
  mode: z.enum(["signin", "signup"]).optional(),
});

export const Route = createFileRoute("/auth")({
  validateSearch: searchSchema,
  component: AuthPage,
});

function AuthPage() {
  const { mode: initialMode } = Route.useSearch();
  const [mode, setMode] = useState<"signin" | "signup">(initialMode ?? "signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard" });
    });
  }, [navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { first_name: firstName || email.split("@")[0] },
            emailRedirectTo: `${window.location.origin}/dashboard`,
          },
        });
        if (error) throw error;
        toast.success("Compte créé ! Passons à ton profil.");
        navigate({ to: "/onboarding" });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Bienvenue !");
        navigate({ to: "/dashboard" });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur d'authentification");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) throw new Error(result.error.message ?? "Google sign-in failed");
      if (result.redirected) return;
      navigate({ to: "/dashboard" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur Google");
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen bg-canvas md:grid-cols-2">
      <div className="hidden bg-[url('/hero-poster.jpg')] bg-cover bg-center md:block relative">
        <div className="absolute inset-0 bg-gradient-to-tr from-canvas via-canvas/70 to-brand/30" />
        <div className="relative flex h-full flex-col justify-between p-12">
          <Link to="/" className="flex items-center gap-2 text-lg font-bold">
            <div className="grid size-8 place-items-center rounded-lg bg-brand text-brand-foreground">
              <Dumbbell className="size-4" />
            </div>
            TagatYaram
          </Link>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand">
              Sahel · Force · Discipline
            </p>
            <h2 className="mt-3 text-4xl font-bold leading-tight">
              Ta première séance <br /> commence maintenant.
            </h2>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm space-y-8">
          <div className="md:hidden">
            <Link to="/" className="inline-flex items-center gap-2 text-lg font-bold">
              <div className="grid size-8 place-items-center rounded-lg bg-brand text-brand-foreground">
                <Dumbbell className="size-4" />
              </div>
              TagatYaram
            </Link>
          </div>

          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {mode === "signin" ? "Connexion" : "Créer un compte"}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {mode === "signin"
                ? "Retrouve ton programme et ta progression."
                : "Gratuit. Ton programme IA t'attend."}
            </p>
          </div>

          <button
            onClick={handleGoogle}
            disabled={loading}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-surface px-4 py-3 text-sm font-medium text-foreground transition hover:bg-surface-2 disabled:opacity-50"
          >
            <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
              <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.9 32.1 29.4 35 24 35c-6.1 0-11-4.9-11-11s4.9-11 11-11c2.8 0 5.4 1 7.4 2.8l5.7-5.7C33.7 6.5 29.1 4.5 24 4.5 13.2 4.5 4.5 13.2 4.5 24S13.2 43.5 24 43.5c10.5 0 19.5-7.6 19.5-19.5 0-1.2-.1-2.3-.4-3.5z"/>
              <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.6 19 13 24 13c2.8 0 5.4 1 7.4 2.8l5.7-5.7C33.7 6.5 29.1 4.5 24 4.5 16.3 4.5 9.7 8.8 6.3 14.7z"/>
              <path fill="#4CAF50" d="M24 43.5c5 0 9.6-1.9 13-5l-6-5.1C29.2 34.7 26.7 35.5 24 35.5c-5.4 0-9.9-2.9-11.3-7l-6.5 5C9.6 39.1 16.2 43.5 24 43.5z"/>
              <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.7 1.9-1.9 3.6-3.5 4.9l6 5.1c-.4.4 6.7-4.9 6.7-14 0-1.2-.1-2.3-.9-3.5z"/>
            </svg>
            Continuer avec Google
          </button>

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <div className="h-px flex-1 bg-border" /> ou <div className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Prénom
                </label>
                <input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  placeholder="Amedy"
                  className="mt-1 w-full rounded-xl border border-input bg-surface px-4 py-3 text-foreground outline-none focus:border-brand"
                />
              </div>
            )}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="toi@exemple.com"
                className="mt-1 w-full rounded-xl border border-input bg-surface px-4 py-3 text-foreground outline-none focus:border-brand"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Mot de passe
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                placeholder="••••••••"
                className="mt-1 w-full rounded-xl border border-input bg-surface px-4 py-3 text-foreground outline-none focus:border-brand"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand px-4 py-3 text-sm font-semibold text-brand-foreground shadow-brand transition hover:brightness-110 disabled:opacity-50"
            >
              {loading && <Loader2 className="size-4 animate-spin" />}
              {mode === "signin" ? "Se connecter" : "Créer mon compte"}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            {mode === "signin" ? "Pas encore de compte ?" : "Déjà inscrit ?"}{" "}
            <button
              type="button"
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
              className="font-semibold text-brand hover:underline"
            >
              {mode === "signin" ? "Créer un compte" : "Se connecter"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
