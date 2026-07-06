import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { ProgramData, ProgramDay } from "@/lib/programs.functions";
import { Loader2, ArrowLeft, Play, RefreshCcw } from "lucide-react";
import { MuscleMap } from "@/components/MuscleMap";
import { ExerciseVideo } from "@/components/ExerciseVideo";

export const Route = createFileRoute("/_authenticated/program/$day")({
  component: ProgramDayPage,
});

function ProgramDayPage() {
  const { day } = Route.useParams();
  const dayNum = Number(day);
  const [dayData, setDayData] = useState<ProgramDay | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;
      const { data } = await supabase
        .from("programs")
        .select("program_data")
        .eq("user_id", userData.user.id)
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .maybeSingle();
      const program = data?.program_data as unknown as ProgramData | undefined;
      const found = program?.days.find((d) => d.day_number === dayNum);
      setDayData(found ?? null);
      setLoading(false);
    })();
  }, [dayNum]);

  if (loading) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <Loader2 className="size-6 animate-spin text-brand" />
      </div>
    );
  }

  if (!dayData) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <p className="text-muted-foreground">Jour introuvable.</p>
        <Link to="/dashboard" className="mt-4 inline-flex text-brand">
          ← Retour
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Programme
      </Link>

      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">
            Jour {dayData.day_number} · {dayData.tag}
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">{dayData.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {dayData.exercises.length} exercices
          </p>
        </div>
        <Link
          to="/session/$day"
          params={{ day }}
          className="inline-flex shrink-0 items-center gap-2 rounded-full bg-brand px-5 py-3 text-sm font-semibold text-brand-foreground shadow-brand hover:brightness-110"
        >
          <Play className="size-4" /> Commencer
        </Link>
      </div>

      <div className="space-y-4">
        {dayData.exercises.map((ex, i) => (
          <div key={i} className="overflow-hidden rounded-2xl border border-border bg-surface">
            {ex.youtube_id && <ExerciseVideo youtubeId={ex.youtube_id} title={ex.name} />}
            <div className="space-y-3 p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="text-lg font-bold">{ex.name}</h3>
                <span className="rounded-full bg-brand-muted px-3 py-1 text-xs font-bold text-brand">
                  {ex.sets} × {ex.reps}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {ex.muscles.map((m) => (
                  <span
                    key={m}
                    className="rounded-full bg-surface-2 px-2.5 py-0.5 text-xs text-muted-foreground"
                  >
                    {m}
                  </span>
                ))}
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">{ex.description}</p>
              {ex.alternative && (
                <p className="flex items-center gap-2 text-xs text-muted-foreground">
                  <RefreshCcw className="size-3" />
                  Alternative : <span className="text-foreground">{ex.alternative}</span>
                </p>
              )}
              <div className="rounded-xl bg-surface-2/50 p-3">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Muscles ciblés
                </p>
                <MuscleMap muscles={ex.muscles} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
