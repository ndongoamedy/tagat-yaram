import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { MessageCircle, X, Send, Loader2, Dumbbell } from "lucide-react";
import { askCoach } from "@/lib/chat.functions";

type Msg = { role: "user" | "assistant"; content: string };

const WELCOME: Msg = {
  role: "assistant",
  content:
    "Salut 👋 je suis TagatCoach. Pose-moi ta question sur l'entraînement, la nutrition, la récupération ou le matériel.",
};

const SUGGESTIONS = [
  "Combien de repos entre les séries ?",
  "Que manger avant la séance ?",
  "J'ai des courbatures, je m'entraîne quand même ?",
];

export function FloatingChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const ask = useServerFn(askCoach);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  async function send(text: string) {
    const q = text.trim();
    if (!q || loading) return;
    const next = [...messages, { role: "user" as const, content: q }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const { content } = await ask({ data: { messages: next } });
      setMessages([...next, { role: "assistant", content: content || "…" }]);
    } catch (e) {
      setMessages([
        ...next,
        {
          role: "assistant",
          content:
            e instanceof Error ? e.message : "Une erreur est survenue. Réessaie dans un instant.",
        },
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Ouvrir TagatCoach"
          className="fixed bottom-24 right-4 z-40 grid size-14 place-items-center rounded-full bg-brand text-brand-foreground shadow-brand transition hover:brightness-110 md:bottom-6 md:right-6"
        >
          <MessageCircle className="size-6" />
        </button>
      )}

      {open && (
        <div className="fixed inset-x-0 bottom-0 z-50 md:inset-auto md:bottom-6 md:right-6">
          <div className="mx-auto flex h-[85vh] w-full max-w-md flex-col overflow-hidden border border-border bg-canvas shadow-2xl md:h-[600px] md:rounded-2xl">
            <header className="flex items-center justify-between gap-3 border-b border-border bg-surface px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="grid size-9 place-items-center rounded-full bg-brand text-brand-foreground">
                  <Dumbbell className="size-4" />
                </div>
                <div>
                  <p className="text-sm font-bold leading-tight">TagatCoach</p>
                  <p className="text-[11px] text-muted-foreground">Ton coach IA — en ligne</p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Fermer"
                className="grid size-8 place-items-center rounded-full text-muted-foreground hover:bg-surface-2 hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </header>

            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                      m.role === "user"
                        ? "bg-brand text-brand-foreground"
                        : "bg-surface text-foreground"
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="inline-flex items-center gap-2 rounded-2xl bg-surface px-3.5 py-2.5 text-sm text-muted-foreground">
                    <Loader2 className="size-3.5 animate-spin" /> TagatCoach écrit…
                  </div>
                </div>
              )}
              {messages.length <= 1 && !loading && (
                <div className="space-y-2 pt-2">
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                    Suggestions
                  </p>
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => void send(s)}
                      className="block w-full rounded-xl border border-border bg-surface px-3 py-2 text-left text-xs text-muted-foreground transition hover:border-brand hover:text-foreground"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                void send(input);
              }}
              className="flex items-end gap-2 border-t border-border bg-surface px-3 py-3"
            >
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void send(input);
                  }
                }}
                rows={1}
                placeholder="Pose ta question…"
                className="max-h-32 flex-1 resize-none rounded-xl border border-border bg-canvas px-3 py-2 text-sm outline-none focus:border-brand"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand text-brand-foreground transition hover:brightness-110 disabled:opacity-40"
              >
                <Send className="size-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
