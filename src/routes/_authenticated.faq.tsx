import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { FAQ, THEMES, searchFaq, type FaqTheme } from "@/lib/faq";
import { Search, ChevronDown, MessageCircle, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/_authenticated/faq")({
  component: FaqPage,
});

function FaqPage() {
  const [query, setQuery] = useState("");
  const [theme, setTheme] = useState<FaqTheme | "all">("all");
  const [openId, setOpenId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const base = theme === "all" ? FAQ : FAQ.filter((f) => f.theme === theme);
    return searchFaq(query, base);
  }, [query, theme]);

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">Assistant</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Questions fréquentes</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Les réponses aux questions que se posent tous les débutants.
        </p>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Pose ta question…"
          className="w-full rounded-full border border-border bg-surface py-3 pl-11 pr-4 text-sm outline-none focus:border-brand"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <ThemeChip active={theme === "all"} onClick={() => setTheme("all")} label="Tout" />
        {THEMES.map((t) => (
          <ThemeChip key={t} active={theme === t} onClick={() => setTheme(t)} label={t} />
        ))}
      </div>

      <div className="space-y-2">
        {filtered.length === 0 ? (
          <p className="rounded-xl border border-border bg-surface p-6 text-center text-sm text-muted-foreground">
            Aucune réponse ne correspond. Reformule ta question ou change de thème.
          </p>
        ) : (
          filtered.map((it) => {
            const isOpen = openId === it.id;
            const isHealth = /(blessure|douleur|médecin|grave)/i.test(it.q + it.a);
            return (
              <div
                key={it.id}
                className="overflow-hidden rounded-xl border border-border bg-surface"
              >
                <button
                  onClick={() => setOpenId(isOpen ? null : it.id)}
                  className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
                >
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-brand">
                      {it.theme}
                    </p>
                    <p className="mt-0.5 text-sm font-semibold">{it.q}</p>
                  </div>
                  <ChevronDown
                    className={`size-4 shrink-0 text-muted-foreground transition ${isOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {isOpen && (
                  <div className="border-t border-border bg-surface-2/50 px-4 py-3 text-sm leading-relaxed text-muted-foreground">
                    <p>{it.a}</p>
                    {isHealth && (
                      <p className="mt-3 inline-flex items-center gap-2 rounded-lg bg-warning/10 px-3 py-2 text-xs text-warning">
                        <AlertTriangle className="size-4" /> En cas de doute, consulte un médecin
                        ou un coach diplômé.
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <div className="rounded-2xl border border-dashed border-border bg-surface/50 p-5 text-center">
        <MessageCircle className="mx-auto size-6 text-brand" />
        <p className="mt-2 text-sm font-semibold">Tu ne trouves pas ta réponse ?</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Consulte un coach diplômé ou un professionnel de santé pour les cas spécifiques.
        </p>
        <Link
          to="/profile"
          className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-brand hover:underline"
        >
          Contacter le support →
        </Link>
      </div>
    </div>
  );
}

function ThemeChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
        active
          ? "bg-brand text-brand-foreground"
          : "border border-border bg-surface text-muted-foreground hover:text-foreground"
      }`}
    >
      {label}
    </button>
  );
}
