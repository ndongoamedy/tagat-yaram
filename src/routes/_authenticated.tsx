import { createFileRoute, Outlet, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dumbbell, Home, History, User, LogOut, Loader2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated")({
  component: AuthLayout,
});

function AuthLayout() {
  const [ready, setReady] = useState(false);
  const [firstName, setFirstName] = useState<string>("");
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      if (!data.session) {
        navigate({ to: "/auth" });
        return;
      }
      setReady(true);
      supabase
        .from("profiles")
        .select("first_name")
        .eq("id", data.session.user.id)
        .maybeSingle()
        .then(({ data: p }) => {
          if (p?.first_name) setFirstName(p.first_name);
        });
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_ev, session) => {
      if (!session) navigate({ to: "/auth" });
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [navigate]);

  if (!ready) {
    return (
      <div className="grid min-h-screen place-items-center bg-canvas">
        <Loader2 className="size-6 animate-spin text-brand" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas pb-24 text-foreground md:pb-0">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-canvas/85 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <Link to="/dashboard" className="flex items-center gap-2 font-bold">
            <div className="grid size-8 place-items-center rounded-lg bg-brand text-brand-foreground">
              <Dumbbell className="size-4" />
            </div>
            TagatYaram
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            <NavItem to="/dashboard" icon={<Home className="size-4" />} label="Programme" />
            <NavItem to="/history" icon={<History className="size-4" />} label="Historique" />
            <NavItem to="/profile" icon={<User className="size-4" />} label="Profil" />
          </nav>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-muted-foreground md:inline">
              {firstName && `Salut, ${firstName}`}
            </span>
            <div className="grid size-9 place-items-center rounded-full bg-brand-muted text-sm font-semibold text-brand ring-1 ring-brand/30">
              {(firstName[0] ?? "T").toUpperCase()}
            </div>
          </div>
        </div>
      </header>

      <main>
        <Outlet />
      </main>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-border/60 bg-canvas/95 backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-5xl items-center justify-around px-4 py-2">
          <MobileNavItem to="/dashboard" icon={<Home className="size-5" />} label="Séances" />
          <MobileNavItem to="/history" icon={<History className="size-5" />} label="Historique" />
          <MobileNavItem to="/profile" icon={<User className="size-5" />} label="Profil" />
          <button
            onClick={async () => {
              await supabase.auth.signOut();
            }}
            className="flex flex-col items-center gap-1 rounded-lg px-3 py-2 text-xs text-muted-foreground transition hover:text-foreground"
          >
            <LogOut className="size-5" />
            Sortir
          </button>
        </div>
      </nav>
    </div>
  );
}

function NavItem({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition hover:bg-surface hover:text-foreground [&.active]:bg-brand-muted [&.active]:text-brand"
      activeProps={{ className: "active" }}
    >
      {icon}
      {label}
    </Link>
  );
}

function MobileNavItem({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      to={to}
      className="flex flex-col items-center gap-1 rounded-lg px-3 py-2 text-xs text-muted-foreground transition hover:text-foreground [&.active]:text-brand"
      activeProps={{ className: "active" }}
    >
      {icon}
      {label}
    </Link>
  );
}
