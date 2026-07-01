import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { ProgramData, ProgramDay } from "@/lib/programs.functions";
import { Loader2, Play, CheckCircle2, Dumbbell, Sparkles } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: Dashboard,
});

const DAYS_FR = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [program, setProgram] = useState<ProgramData | null>(null);
  const [programId, setProgramId] = useState<string | null>(null);
  const [completedDays, setCompletedDays] = useState<Set<number>>(new Set());
  const [firstName, setFirstName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const [{ data: profile }, { data: prog }, { data: sessions }] = await Promise.all([
        supabase
          .from("profiles")
          .select("first_name, onboarded")
          .eq("id", userData.user.id)
          .maybeSingle(),
        supabase
          .from("programs")
          .select("id, program_data")
          .eq("user_id", userData.user.id)
          .eq("is_active", true)
          .order("created_at", { ascending: false })
          .maybeSingle(),
        supabase
          .from("sessions")
          .select("day_number, completed, started_at")
          .eq("user_id", userData.user.id)
          .eq("completed", true)
          .gte("started_at", new Date(Date.now() - 7 * 864e5).toISOString()),
      ]);

      if (profile?.first_name) setFirstName(profile.first_name);

      if (!profile?.onboarded || !prog) {
        navigate({ to: "/onboarding" });
        return;
      }

      setProgram(prog.program_data as unknown as ProgramData);
      setProgramId(prog.id);
      setCompletedDays(new Set((sessions ?? []).map((s) => s.day_number)));
      setLoading(false);
    })();
  }, [navigate]);

  if (loading) {
    return (
      <div className="grid min-h-[70vh] place-items-center">
        <Loader2 className="size-6 animate-spin text-brand" />
      </div>
    );
  }

  if (!program) return null;

  const today = new Date().getDay(); // 0 Sun - 6 Sat
  const todayIdx = today === 0 ? 6 : today - 1; // Lundi = 0

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">
          Bienvenue{firstName ? `, ${firstName}` : ""}
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">Ton programme</h1>
      </div>

      {/* Week strip */}
      <div className="rounded-2xl border border-border bg-surface p-4 md:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Cette semaine</h2>
          <span className="text-xs text-muted-foreground">
            {completedDays.size} / {program.days.length} séance{program.days.length > 1 ? "s" : ""}
          </span>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {DAYS_FR.map((d, i) => {
            const isToday = i === todayIdx;
            const done = completedDays.has(i + 1);
            const isTrain = i < program.days.length;
            return (
              <div key={d} className="flex flex-col items-center gap-2">
                <span
                  className={`text-[10px] font-semibold uppercase ${
                    isToday ? "text-brand" : "text-muted-foreground"
                  }`}
                >
                  {d}
                </span>
                <div
                  className={`grid size-10 place-items-center rounded-full text-xs font-bold transition ${
                    done
                      ? "bg-brand text-brand-foreground"
                      : isToday
                        ? "ring-2 ring-brand text-foreground"
                        : isTrain
                          ? "bg-surface-2 text-foreground"
                          : "bg-surface-2 text-muted-foreground opacity-40"
                  }`}
                >
                  {done ? <CheckCircle2 className="size-5" /> : isTrain ? i + 1 : "·"}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Days list */}
      <div className="space-y-4">
        {program.days.map((day, idx) => (
          <DayCard
            key={day.day_number}
            day={day}
            done={completedDays.has(day.day_number)}
            isToday={idx === todayIdx}
          />
        ))}
      </div>
    </div>
  );
}

function DayCard({
  day,
  done,
  isToday,
}: {
  day: ProgramDay;
  done: boolean;
  isToday: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-5 transition ${
        isToday
          ? "border-brand/60 bg-gradient-to-br from-brand-muted to-surface"
          : "border-border bg-surface"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-lg bg-brand-muted text-xs font-bold text-brand">
              J{day.day_number}
            </span>
            <h3 className="text-lg font-bold">{day.name}</h3>
            {done && (
              <span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-success">
                <CheckCircle2 className="size-3" /> Fait
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {day.exercises.length} exercices · {day.tag}
          </p>
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          <Link
            to="/program/$day"
            params={{ day: String(day.day_number) }}
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-xs font-semibold hover:bg-surface-2"
          >
            <Dumbbell className="size-3.5" /> Détails
          </Link>
          <Link
            to="/session/$day"
            params={{ day: String(day.day_number) }}
            className="inline-flex items-center gap-1.5 rounded-full bg-brand px-4 py-2 text-xs font-semibold text-brand-foreground shadow-brand hover:brightness-110"
          >
            <Play className="size-3.5" /> {done ? "Refaire" : "Commencer"}
          </Link>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {day.exercises.slice(0, 4).map((ex) => (
          <span
            key={ex.name}
            className="rounded-full bg-surface-2 px-2.5 py-1 text-xs text-muted-foreground"
          >
            {ex.name}
          </span>
        ))}
        {day.exercises.length > 4 && (
          <span className="rounded-full bg-surface-2 px-2.5 py-1 text-xs text-muted-foreground">
            +{day.exercises.length - 4}
          </span>
        )}
      </div>
    </div>
  );
}
