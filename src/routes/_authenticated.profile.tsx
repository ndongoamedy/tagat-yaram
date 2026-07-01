import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, LogOut, RefreshCcw } from "lucide-react";

export const Route = createFileRoute("/_authenticated/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [profile, setProfile] = useState<Record<string, any>>({});

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      setEmail(u.user.email ?? "");
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", u.user.id)
        .maybeSingle();
      if (data) setProfile(data);
      setLoading(false);
    })();
  }, []);

  if (loading)
    return (
      <div className="grid min-h-[50vh] place-items-center">
        <Loader2 className="size-6 animate-spin text-brand" />
      </div>
    );

  const rows: [string, string][] = [
    ["Prénom", profile.first_name ?? "—"],
    ["Email", email],
    ["Âge", profile.age ? `${profile.age} ans` : "—"],
    ["Taille", profile.height_cm ? `${profile.height_cm} cm` : "—"],
    ["Poids", profile.weight_kg ? `${profile.weight_kg} kg` : "—"],
    ["Morphotype", profile.morphotype ?? "—"],
    ["Objectif", profile.goal?.replaceAll("_", " ") ?? "—"],
    ["Niveau", profile.experience_level ?? "—"],
    ["Jours/semaine", profile.training_days_per_week ?? "—"],
  ];

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-8">
      <h1 className="text-3xl font-bold tracking-tight">Profil</h1>

      <div className="divide-y divide-border rounded-2xl border border-border bg-surface">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-center justify-between px-5 py-4">
            <span className="text-sm text-muted-foreground">{label}</span>
            <span className="font-medium capitalize">{value}</span>
          </div>
        ))}
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <button
          onClick={() => navigate({ to: "/onboarding" })}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-surface px-5 py-3 text-sm font-semibold hover:bg-surface-2"
        >
          <RefreshCcw className="size-4" /> Regénérer mon programme
        </button>
        <button
          onClick={async () => {
            await supabase.auth.signOut();
            toast.success("À bientôt !");
            navigate({ to: "/" });
          }}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-5 py-3 text-sm font-semibold text-destructive hover:bg-destructive/20"
        >
          <LogOut className="size-4" /> Déconnexion
        </button>
      </div>
    </div>
  );
}
