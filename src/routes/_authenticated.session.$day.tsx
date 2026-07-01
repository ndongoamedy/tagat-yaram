import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { ProgramData, ProgramDay } from "@/lib/programs.functions";
import { toast } from "sonner";
import { Loader2, ArrowLeft, Check, Trophy } from "lucide-react";

export const Route = createFileRoute("/_authenticated/session/$day")({
  component: SessionPage,
});

type SetLog = { weight_kg: number | ""; reps: number | ""; completed: boolean };
type ExerciseLog = { exercise_name: string; sets: SetLog[] };

function SessionPage() {
  const { day } = Route.useParams();
  const dayNum = Number(day);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [dayData, setDayData] = useState<ProgramDay | null>(null);
  const [programId, setProgramId] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [logs, setLogs] = useState<ExerciseLog[]>([]);
  const [finished, setFinished] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    (async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;
      const { data: prog } = await supabase
        .from("programs")
        .select("id, program_data")
        .eq("user_id", userData.user.id)
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .maybeSingle();
      if (!prog) return;
      const program = prog.program_data as unknown as ProgramData;
      const found = program.days.find((d) => d.day_number === dayNum);
      if (!found) return;
      setProgramId(prog.id);
      setDayData(found);
      setLogs(
        found.exercises.map((ex) => ({
          exercise_name: ex.name,
          sets: Array.from({ length: ex.sets }, () => ({
            weight_kg: "" as const,
            reps: "" as const,
            completed: false,
          })),
        })),
      );

      // Create session row
      const { data: s } = await supabase
        .from("sessions")
        .insert({
          user_id: userData.user.id,
          program_id: prog.id,
          day_number: dayNum,
          day_name: found.name,
          session_data: { exercises: [] },
        })
        .select("id")
        .single();
      if (s) setSessionId(s.id);
      setLoading(false);
    })();
  }, [dayNum]);

  // Debounced autosave
  useEffect(() => {
    if (!sessionId) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      supabase
        .from("sessions")
        .update({ session_data: { exercises: logs } as any })
        .eq("id", sessionId)
        .then(() => {});
    }, 1500);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [logs, sessionId]);

  function updateSet(exIdx: number, setIdx: number, patch: Partial<SetLog>) {
    setLogs((prev) => {
      const next = [...prev];
      const ex = { ...next[exIdx] };
      ex.sets = ex.sets.map((s, i) => (i === setIdx ? { ...s, ...patch } : s));
      next[exIdx] = ex;
      return next;
    });
  }

  const totalSets = logs.reduce((n, e) => n + e.sets.length, 0);
  const doneSets = logs.reduce((n, e) => n + e.sets.filter((s) => s.completed).length, 0);
  const progress = totalSets ? (doneSets / totalSets) * 100 : 0;

  async function finish() {
    if (!sessionId) return;
    const { error } = await supabase
      .from("sessions")
      .update({
        session_data: { exercises: logs } as any,
        completed: true,
        completed_at: new Date().toISOString(),
      })
      .eq("id", sessionId);
    if (error) {
      toast.error(error.message);
      return;
    }
    setFinished(true);
  }

  if (loading || !dayData) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <Loader2 className="size-6 animate-spin text-brand" />
      </div>
    );
  }

  if (finished) {
    const volume = logs.reduce(
      (n, e) =>
        n +
        e.sets.reduce(
          (s, x) => s + (Number(x.weight_kg) || 0) * (Number(x.reps) || 0),
          0,
        ),
      0,
    );
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <div className="mx-auto grid size-20 place-items-center rounded-full bg-brand-muted">
          <Trophy className="size-10 text-brand" />
        </div>
        <h1 className="mt-6 text-3xl font-bold">Séance terminée !</h1>
        <p className="mt-2 text-muted-foreground">Bien joué. On continue demain.</p>
        <div className="mt-8 grid grid-cols-3 gap-3">
          <Stat label="Exos" value={String(logs.length)} />
          <Stat label="Séries" value={`${doneSets}/${totalSets}`} />
          <Stat label="Volume" value={`${Math.round(volume)} kg`} />
        </div>
        <div className="mt-8 flex flex-col gap-3">
          <Link
            to="/dashboard"
            className="rounded-full bg-brand py-4 text-sm font-semibold text-brand-foreground shadow-brand hover:brightness-110"
          >
            Retour au programme
          </Link>
          <Link to="/history" className="text-sm text-muted-foreground hover:text-foreground">
            Voir l'historique
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <div className="sticky top-16 z-20 -mx-4 mb-6 border-b border-border/60 bg-canvas/95 px-4 pb-3 pt-2 backdrop-blur">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Quitter
        </Link>
        <div className="mt-2 flex items-baseline justify-between gap-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-brand">
              Jour {dayNum}
            </p>
            <h1 className="text-2xl font-bold">{dayData.name}</h1>
          </div>
          <span className="text-sm font-semibold text-muted-foreground">
            {doneSets}/{totalSets}
          </span>
        </div>
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-surface">
          <div
            className="h-full bg-brand transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="space-y-4">
        {dayData.exercises.map((ex, exIdx) => (
          <div key={exIdx} className="rounded-2xl border border-border bg-surface p-5">
            <div className="mb-3 flex items-baseline justify-between gap-2">
              <h2 className="text-lg font-bold">{ex.name}</h2>
              <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                {ex.sets} × {ex.reps}
              </span>
            </div>

            <div className="space-y-2">
              {logs[exIdx]?.sets.map((s, setIdx) => (
                <div
                  key={setIdx}
                  className={`grid grid-cols-[auto_1fr_1fr_auto] items-center gap-3 rounded-xl p-3 transition ${
                    s.completed ? "bg-brand-muted" : "bg-surface-2"
                  }`}
                >
                  <span className="w-6 text-center text-sm font-bold text-muted-foreground">
                    {setIdx + 1}
                  </span>
                  <label className="block">
                    <span className="text-[10px] font-semibold uppercase text-muted-foreground">
                      kg
                    </span>
                    <input
                      inputMode="decimal"
                      value={s.weight_kg}
                      onChange={(e) =>
                        updateSet(exIdx, setIdx, {
                          weight_kg: e.target.value === "" ? "" : Number(e.target.value),
                        })
                      }
                      className="mt-0.5 w-full rounded-lg border border-input bg-canvas px-3 py-2 text-lg font-semibold text-foreground outline-none focus:border-brand"
                    />
                  </label>
                  <label className="block">
                    <span className="text-[10px] font-semibold uppercase text-muted-foreground">
                      Reps
                    </span>
                    <input
                      inputMode="numeric"
                      value={s.reps}
                      onChange={(e) =>
                        updateSet(exIdx, setIdx, {
                          reps: e.target.value === "" ? "" : Number(e.target.value),
                        })
                      }
                      className="mt-0.5 w-full rounded-lg border border-input bg-canvas px-3 py-2 text-lg font-semibold text-foreground outline-none focus:border-brand"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => updateSet(exIdx, setIdx, { completed: !s.completed })}
                    className={`grid size-12 place-items-center rounded-xl transition ${
                      s.completed
                        ? "bg-brand text-brand-foreground"
                        : "bg-canvas text-muted-foreground ring-1 ring-border hover:text-foreground"
                    }`}
                    aria-label="Marquer série faite"
                  >
                    <Check className="size-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={finish}
        disabled={doneSets === 0}
        className="mt-8 w-full rounded-2xl bg-brand py-5 text-base font-bold text-brand-foreground shadow-brand transition hover:brightness-110 disabled:opacity-50"
      >
        Terminer la séance
      </button>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-3">
      <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 text-xl font-bold">{value}</div>
    </div>
  );
}
