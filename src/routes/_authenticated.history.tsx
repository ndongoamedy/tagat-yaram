import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, CheckCircle2, Calendar } from "lucide-react";

export const Route = createFileRoute("/_authenticated/history")({
  component: HistoryPage,
});

type Row = {
  id: string;
  day_number: number;
  day_name: string | null;
  started_at: string;
  completed: boolean;
  session_data: any;
};

function HistoryPage() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    (async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;
      const { data } = await supabase
        .from("sessions")
        .select("id, day_number, day_name, started_at, completed, session_data")
        .eq("user_id", userData.user.id)
        .order("started_at", { ascending: false })
        .limit(50);
      setRows((data ?? []) as Row[]);
      setLoading(false);
    })();
  }, []);

  if (loading)
    return (
      <div className="grid min-h-[50vh] place-items-center">
        <Loader2 className="size-6 animate-spin text-brand" />
      </div>
    );

  const completed = rows.filter((r) => r.completed);
  const totalVolume = completed.reduce((n, r) => {
    const ex = (r.session_data?.exercises ?? []) as any[];
    return (
      n +
      ex.reduce(
        (s, e) =>
          s +
          (e.sets ?? []).reduce(
            (t: number, x: any) => t + (Number(x.weight_kg) || 0) * (Number(x.reps) || 0),
            0,
          ),
        0,
      )
    );
  }, 0);

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Historique</h1>
        <p className="mt-1 text-sm text-muted-foreground">Tes séances passées et ta progression.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <StatCard label="Séances complétées" value={String(completed.length)} />
        <StatCard label="Volume total (kg)" value={Math.round(totalVolume).toLocaleString("fr-FR")} />
        <StatCard label="Sessions totales" value={String(rows.length)} />
      </div>

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-surface p-8 text-center">
          <p className="text-muted-foreground">Aucune séance encore. Vas-y !</p>
          <Link
            to="/dashboard"
            className="mt-4 inline-flex rounded-full bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground"
          >
            Voir le programme
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {rows.map((r) => {
            const ex = (r.session_data?.exercises ?? []) as any[];
            const doneSets = ex.reduce(
              (n, e) => n + (e.sets ?? []).filter((x: any) => x.completed).length,
              0,
            );
            return (
              <div
                key={r.id}
                className="flex items-center justify-between rounded-2xl border border-border bg-surface p-4"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`grid size-11 place-items-center rounded-xl ${
                      r.completed ? "bg-brand text-brand-foreground" : "bg-surface-2 text-muted-foreground"
                    }`}
                  >
                    {r.completed ? <CheckCircle2 className="size-5" /> : <Calendar className="size-5" />}
                  </div>
                  <div>
                    <div className="font-semibold">
                      {r.day_name ?? `Jour ${r.day_number}`}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(r.started_at).toLocaleDateString("fr-FR", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                      })}{" "}
                      · {doneSets} séries faites
                    </div>
                  </div>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${
                    r.completed ? "bg-success/15 text-success" : "bg-surface-2 text-muted-foreground"
                  }`}
                >
                  {r.completed ? "Terminée" : "En cours"}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </div>
      <div className="mt-2 text-2xl font-bold">{value}</div>
    </div>
  );
}
