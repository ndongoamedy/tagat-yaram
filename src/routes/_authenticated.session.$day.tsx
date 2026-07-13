import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { ProgramData, ProgramDay } from "@/lib/programs.functions";

import { ExerciseVideo } from "@/components/ExerciseVideo";
import { toast } from "sonner";
import {
  Loader2,
  ArrowLeft,
  Check,
  Trophy,
  Minus,
  Plus,
  ChevronLeft,
  ChevronRight,
  SkipForward,
  Timer,
  X,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/session/$day")({
  component: SessionPage,
});

type SetLog = { weight_kg: number; reps: number; completed: boolean };
type ExerciseLog = { exercise_name: string; sets: SetLog[]; skipped?: boolean };

const REST_OPTIONS = [60, 90, 120, 180];

function parseTargetReps(reps: string): number {
  const nums = reps.match(/\d+/g)?.map(Number) ?? [];
  if (nums.length === 0) return 10;
  if (nums.length === 1) return nums[0];
  return Math.round((nums[0] + nums[1]) / 2);
}

function suggestWeight(name: string): number {
  const n = name.toLowerCase();
  if (/(pompes|traction|dips|gainage|planche|mollets sur|au poids|crunch)/.test(n)) return 0;
  if (/(squat barre|soulevé|développé couché|rowing barre)/.test(n)) return 20;
  if (/(presse|tirage|leg curl|leg extension)/.test(n)) return 25;
  if (/(développé militaire|développé incliné|rowing haltère|fentes)/.test(n)) return 10;
  if (/(curl|élévation|face pull|extension triceps|mollets)/.test(n)) return 6;
  return 8;
}

function beep() {
  try {
    const Ctx =
      (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g);
    g.connect(ctx.destination);
    o.frequency.value = 880;
    g.gain.setValueAtTime(0.001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + 0.02);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    o.start();
    o.stop(ctx.currentTime + 0.55);
  } catch {}
  try {
    (navigator as any).vibrate?.([200, 100, 200]);
  } catch {}
}

function SessionPage() {
  const { day } = Route.useParams();
  const dayNum = Number(day);

  const [loading, setLoading] = useState(true);
  const [dayData, setDayData] = useState<ProgramDay | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [logs, setLogs] = useState<ExerciseLog[]>([]);
  const [current, setCurrent] = useState(0);
  const [finished, setFinished] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Rest timer
  const [restDuration, setRestDuration] = useState(90);
  const [restLeft, setRestLeft] = useState(0);
  const restTick = useRef<ReturnType<typeof setInterval> | null>(null);

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
      setDayData(found);

      const { data: lastSessions } = await supabase
        .from("sessions")
        .select("session_data")
        .eq("user_id", userData.user.id)
        .eq("day_number", dayNum)
        .eq("completed", true)
        .order("completed_at", { ascending: false })
        .limit(1);
      const lastExercises: ExerciseLog[] =
        (lastSessions?.[0]?.session_data as any)?.exercises ?? [];
      const lastByName = new Map(lastExercises.map((e) => [e.exercise_name, e]));

      setLogs(
        found.exercises.map((ex) => {
          const target = parseTargetReps(ex.reps);
          const prev = lastByName.get(ex.name);
          return {
            exercise_name: ex.name,
            sets: Array.from({ length: ex.sets }, (_, i) => {
              const prevSet = prev?.sets[i] ?? prev?.sets[prev.sets.length - 1];
              return {
                weight_kg: prevSet?.weight_kg ?? suggestWeight(ex.name),
                reps: prevSet?.reps ?? target,
                completed: false,
              };
            }),
          };
        }),
      );

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

  // Rest timer tick
  useEffect(() => {
    if (restLeft <= 0) {
      if (restTick.current) {
        clearInterval(restTick.current);
        restTick.current = null;
      }
      return;
    }
    if (!restTick.current) {
      restTick.current = setInterval(() => {
        setRestLeft((v) => {
          if (v <= 1) {
            beep();
            return 0;
          }
          return v - 1;
        });
      }, 1000);
    }
    return () => {
      if (restTick.current) {
        clearInterval(restTick.current);
        restTick.current = null;
      }
    };
  }, [restLeft]);

  function updateSet(exIdx: number, setIdx: number, patch: Partial<SetLog>) {
    setLogs((prev) => {
      const next = [...prev];
      const ex = { ...next[exIdx] };
      ex.sets = ex.sets.map((s, i) => (i === setIdx ? { ...s, ...patch } : s));
      next[exIdx] = ex;
      return next;
    });
    if (patch.completed === true) {
      setRestLeft(restDuration);
    }
  }

  function skipCurrent() {
    setLogs((prev) => {
      const next = [...prev];
      next[current] = { ...next[current], skipped: true };
      return next;
    });
    goNext();
  }

  function goNext() {
    setRestLeft(0);
    if (dayData && current < dayData.exercises.length - 1) setCurrent(current + 1);
  }
  function goPrev() {
    setRestLeft(0);
    if (current > 0) setCurrent(current - 1);
  }

  const totalSets = useMemo(
    () => logs.reduce((n, e) => n + (e.skipped ? 0 : e.sets.length), 0),
    [logs],
  );
  const doneSets = useMemo(
    () => logs.reduce((n, e) => n + e.sets.filter((s) => s.completed).length, 0),
    [logs],
  );
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
      (n, e) => n + e.sets.reduce((s, x) => s + (x.completed ? x.weight_kg * x.reps : 0), 0),
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
          <Stat label="Exos" value={String(logs.filter((l) => !l.skipped).length)} />
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

  const ex = dayData.exercises[current];
  const exLog = logs[current];
  const isLast = current === dayData.exercises.length - 1;

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      {/* Sticky header */}
      <div className="sticky top-16 z-20 -mx-4 mb-6 border-b border-border/60 bg-canvas/95 px-4 pb-3 pt-2 backdrop-blur">
        <div className="flex items-center justify-between gap-2">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" /> Quitter
          </Link>
          <span className="text-xs font-semibold text-muted-foreground">
            Exercice {current + 1} / {dayData.exercises.length}
          </span>
        </div>
        <div className="mt-2">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-brand">
            Jour {dayNum} · {dayData.name}
          </p>
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface">
          <div
            className="h-full bg-brand transition-all"
            style={{ width: `${((current + 1) / dayData.exercises.length) * 100}%` }}
          />
        </div>
        <p className="mt-1 text-[10px] text-muted-foreground">
          Séries totales : {doneSets}/{totalSets} ({Math.round(progress)}%)
        </p>
      </div>

      {/* Rest timer */}
      <div className="mb-4 rounded-2xl border border-border bg-surface p-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Timer className="size-4 text-brand" />
            <span className="text-sm font-semibold">
              {restLeft > 0 ? `Repos : ${restLeft}s` : "Repos entre séries"}
            </span>
          </div>
          {restLeft > 0 && (
            <div className="flex gap-2">
              <button
                onClick={() => setRestLeft((v) => v + 15)}
                className="rounded-full bg-surface-2 px-3 py-1 text-xs font-semibold"
              >
                +15s
              </button>
              <button
                onClick={() => setRestLeft(0)}
                className="inline-flex items-center gap-1 rounded-full bg-brand px-3 py-1 text-xs font-semibold text-brand-foreground"
              >
                <X className="size-3" /> Sauter
              </button>
            </div>
          )}
        </div>
        {restLeft > 0 ? (
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
            <div
              className="h-full bg-brand transition-all duration-1000 ease-linear"
              style={{ width: `${(restLeft / restDuration) * 100}%` }}
            />
          </div>
        ) : (
          <div className="mt-2 flex flex-wrap gap-2">
            {REST_OPTIONS.map((s) => (
              <button
                key={s}
                onClick={() => setRestDuration(s)}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                  restDuration === s
                    ? "bg-brand text-brand-foreground"
                    : "bg-surface-2 text-muted-foreground hover:text-foreground"
                }`}
              >
                {s}s
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Current exercise */}
      <div className="overflow-hidden rounded-2xl border border-border bg-surface">
        {ex.youtube_id && <ExerciseVideo youtubeId={ex.youtube_id} title={ex.name} />}
        <div className="p-5">
          <div className="mb-2 flex items-baseline justify-between gap-2">
            <h2 className="text-xl font-bold">{ex.name}</h2>
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {ex.sets} × {ex.reps}
            </span>
          </div>
          <div className="mb-3 flex flex-wrap gap-1.5">
            {ex.muscles.map((m) => (
              <span
                key={m}
                className="rounded-full bg-brand-muted px-2 py-0.5 text-[10px] font-semibold text-brand"
              >
                {m}
              </span>
            ))}
          </div>
          <p className="mb-4 text-sm leading-relaxed text-muted-foreground">{ex.description}</p>


          <div className="space-y-2">
            {exLog?.sets.map((s, setIdx) => (
              <div
                key={setIdx}
                className={`rounded-xl p-3 transition ${
                  s.completed ? "bg-brand-muted" : "bg-surface-2"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="grid size-7 place-items-center rounded-full bg-canvas text-xs font-bold text-muted-foreground">
                    {setIdx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => updateSet(current, setIdx, { completed: !s.completed })}
                    className={`grid size-11 place-items-center rounded-full transition ${
                      s.completed
                        ? "bg-brand text-brand-foreground"
                        : "bg-canvas text-muted-foreground ring-1 ring-border hover:text-foreground"
                    }`}
                    aria-label="Marquer série faite"
                  >
                    <Check className="size-5" />
                  </button>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <Stepper
                    label="Kg"
                    value={s.weight_kg}
                    step={2.5}
                    min={0}
                    onChange={(v) => updateSet(current, setIdx, { weight_kg: v })}
                  />
                  <Stepper
                    label="Reps"
                    value={s.reps}
                    step={1}
                    min={0}
                    onChange={(v) => updateSet(current, setIdx, { reps: v })}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Nav bar */}
      <div className="mt-6 grid grid-cols-3 gap-2">
        <button
          onClick={goPrev}
          disabled={current === 0}
          className="inline-flex items-center justify-center gap-1 rounded-xl border border-border bg-surface py-3 text-sm font-semibold disabled:opacity-40"
        >
          <ChevronLeft className="size-4" /> Précédent
        </button>
        <button
          onClick={skipCurrent}
          className="inline-flex items-center justify-center gap-1 rounded-xl border border-border bg-surface py-3 text-sm font-semibold text-muted-foreground hover:text-foreground"
        >
          <SkipForward className="size-4" /> Passer
        </button>
        {isLast ? (
          <button
            onClick={finish}
            disabled={doneSets === 0}
            className="inline-flex items-center justify-center gap-1 rounded-xl bg-brand py-3 text-sm font-bold text-brand-foreground shadow-brand disabled:opacity-50"
          >
            Terminer
          </button>
        ) : (
          <button
            onClick={goNext}
            className="inline-flex items-center justify-center gap-1 rounded-xl bg-brand py-3 text-sm font-bold text-brand-foreground shadow-brand"
          >
            Suivant <ChevronRight className="size-4" />
          </button>
        )}
      </div>
    </div>
  );
}

function Stepper({
  label,
  value,
  step,
  min,
  onChange,
}: {
  label: string;
  value: number;
  step: number;
  min: number;
  onChange: (v: number) => void;
}) {
  const dec = () => onChange(Math.max(min, +(value - step).toFixed(2)));
  const inc = () => onChange(+(value + step).toFixed(2));
  return (
    <div className="rounded-lg bg-canvas p-2">
      <div className="mb-1 text-center text-[10px] font-semibold uppercase text-muted-foreground">
        {label}
      </div>
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={dec}
          className="grid size-10 place-items-center rounded-lg bg-surface-2 text-foreground transition hover:bg-brand hover:text-brand-foreground"
          aria-label={`Diminuer ${label}`}
        >
          <Minus className="size-5" />
        </button>
        <span className="min-w-[3ch] text-center text-xl font-bold tabular-nums text-foreground">
          {value}
        </span>
        <button
          type="button"
          onClick={inc}
          className="grid size-10 place-items-center rounded-lg bg-surface-2 text-foreground transition hover:bg-brand hover:text-brand-foreground"
          aria-label={`Augmenter ${label}`}
        >
          <Plus className="size-5" />
        </button>
      </div>
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
