import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { AppHeader } from "@/components/AppHeader";
import { Search, PackageSearch, HandHeart, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { isAuthed } from "@/lib/auth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "East Point Lost & Found — Reunite with your belongings" },
      {
        name: "description",
        content: "Official Lost & Found portal for East Point College, Bangalore. Report and recover lost items on campus.",
      },
      { property: "og:title", content: "East Point Lost & Found" },
      { property: "og:description", content: "Report and recover lost items on the East Point College campus." },
    ],
  }),
  component: Landing,
});

function Landing() {
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    setAuthed(isAuthed());
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[image:var(--gradient-hero)] opacity-95" />
          <div className="relative mx-auto max-w-6xl px-4 py-24 sm:py-32 text-center text-primary-foreground">
            <span className="inline-block rounded-full bg-white/15 px-4 py-1 text-xs font-medium backdrop-blur-sm">
              East Point College • Bangalore
            </span>
            <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-6xl">
              Lost something on campus?
              <br />
              <span className="text-white/90">We'll help you find it.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-white/85">
              The official Lost & Found portal for East Point College. Report items you've lost,
              return items you've found, and reunite belongings with their owners.
            </p>
            {!authed && (
              <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link to="/register">
                  <Button size="lg" className="bg-white text-primary hover:bg-white/90 shadow-[var(--shadow-elegant)]">
                    Register
                  </Button>
                </Link>
                <Link to="/login">
                  <Button size="lg" variant="outline" className="border-white/40 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 hover:text-white">
                    Login
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Features */}
        <section className="mx-auto max-w-6xl px-4 py-20">
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              { icon: PackageSearch, title: "Report Lost Items", desc: "Quickly file a report describing what you've lost and where." },
              { icon: HandHeart, title: "Return Found Items", desc: "Help fellow students by reporting items you've found on campus." },
              { icon: ShieldCheck, title: "Verified Claims", desc: "Owners verify ownership through descriptions to prevent fraud." },
            ].map((f) => (
              <div
                key={f.title}
                className="group rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)] transition hover:-translate-y-1 hover:shadow-[var(--shadow-elegant)]"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[image:var(--gradient-primary)] text-primary-foreground">
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-t border-border bg-muted/30 py-16">
          <div className="mx-auto max-w-3xl px-4 text-center">
            <Search className="mx-auto h-10 w-10 text-primary" />
            <h2 className="mt-4 text-3xl font-bold text-foreground">Start your search</h2>
            <p className="mt-2 text-muted-foreground">
              {authed ? "Access the dashboard and browse all reported items." : "Sign in to access the dashboard and browse all reported items."}
            </p>
            <Link to={authed ? "/dashboard" : "/login"} className="mt-6 inline-block">
              <Button size="lg" className="bg-[image:var(--gradient-primary)] shadow-[var(--shadow-elegant)]">
                Get Started
              </Button>
            </Link>
          </div>
        </section>
      </main>
      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} East Point College, Bangalore
      </footer>
    </div>
  );
}
