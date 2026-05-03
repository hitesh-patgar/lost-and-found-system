import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { isAuthed } from "@/lib/auth";
import { AppHeader } from "@/components/AppHeader";
import { PackageX, PackageCheck, LayoutGrid, Search } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — East Point Lost & Found" }] }),
  component: Dashboard,
});

const tiles = [
  { to: "/report-lost", title: "I Lost Something", desc: "Report an item you've lost on campus.", icon: PackageX },
  { to: "/report-found", title: "I Found Something", desc: "Help return an item you've found.", icon: PackageCheck },
  { to: "/browse", title: "Browse Found Items", desc: "See all items reported as found.", icon: LayoutGrid },
  { to: "/search", title: "Search Items", desc: "Search by description and location.", icon: Search },
] as const;

function Dashboard() {
  const navigate = useNavigate();
  useEffect(() => {
    if (!isAuthed()) navigate({ to: "/login" });
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="mx-auto max-w-6xl px-4 py-12">
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="mt-1 text-muted-foreground">What would you like to do today?</p>
        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          {tiles.map((t) => (
            <Link
              key={t.to}
              to={t.to}
              className="group rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)] transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-[var(--shadow-elegant)]"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[image:var(--gradient-primary)] text-primary-foreground">
                  <t.icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground group-hover:text-primary">{t.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{t.desc}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
