import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { isAuthed } from "@/lib/auth";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Loader2, MapPin, Calendar, ImageIcon, ArrowRight, Sparkles } from "lucide-react";

export const Route = createFileRoute("/matches")({
  head: () => ({ meta: [{ title: "My Matches — East Point Lost & Found" }] }),
  component: Matches,
});

type Match = {
  lost_item: any;
  found_item: any;
  match_score: number;
  match_percentage: string;
};

function Matches() {
  const navigate = useNavigate();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthed()) { navigate({ to: "/login" }); return; }
    (async () => {
      try {
        const { data } = await api.get("/items/my-matches");
        setMatches(data.matches || []);
      } catch (err: any) {
        setError(err?.response?.data?.message || "Could not load matches.");
      } finally { setLoading(false); }
    })();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="mx-auto max-w-6xl px-4 py-12">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[image:var(--gradient-primary)] text-primary-foreground">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">AI Matches</h1>
            <p className="mt-1 text-muted-foreground">Potential matches for your lost items</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : error ? (
          <div className="mt-8 rounded-xl border border-destructive/40 bg-destructive/5 p-6 text-center text-destructive">{error}</div>
        ) : matches.length === 0 ? (
          <div className="mt-8 rounded-xl border border-border bg-card p-12 text-center">
            <Sparkles className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold text-foreground">No matches yet</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Report a lost item to see potential matches from found items.
            </p>
            <Link to="/report-lost" className="mt-6 inline-block">
              <Button className="bg-[image:var(--gradient-primary)] shadow-[var(--shadow-card)]">
                Report Lost Item
              </Button>
            </Link>
          </div>
        ) : (
          <div className="mt-8 space-y-6">
            {matches.map((match, idx) => (
              <article
                key={idx}
                className="overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-card)] transition hover:shadow-[var(--shadow-elegant)]"
              >
                <div className="bg-muted/30 px-6 py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-primary" />
                      <span className="font-semibold text-foreground">Match Found</span>
                    </div>
                    <div className="rounded-full bg-primary/10 px-3 py-1 text-sm font-bold text-primary">
                      {match.match_percentage} Match
                    </div>
                  </div>
                </div>

                <div className="grid gap-6 p-6 md:grid-cols-2">
                  {/* Lost Item */}
                  <div className="space-y-3">
                    <div className="text-xs font-semibold uppercase text-destructive">Your Lost Item</div>
                    <div className="aspect-video w-full overflow-hidden rounded-lg bg-muted">
                      {match.lost_item.image_url ? (
                        <img src={match.lost_item.image_url} alt={match.lost_item.item_name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-muted-foreground">
                          <ImageIcon className="h-8 w-8" />
                        </div>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">{match.lost_item.item_name}</h3>
                    <p className="text-sm text-muted-foreground">{match.lost_item.description}</p>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      {match.lost_item.location && (
                        <div className="flex items-center gap-1.5">
                          <MapPin className="h-4 w-4" /> {match.lost_item.location}
                        </div>
                      )}
                      {match.lost_item.date_reported && (
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-4 w-4" /> {match.lost_item.date_reported}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Arrow */}
                  <div className="hidden items-center justify-center md:flex">
                    <ArrowRight className="h-8 w-8 text-primary" />
                  </div>

                  {/* Found Item */}
                  <div className="space-y-3">
                    <div className="text-xs font-semibold uppercase text-primary">Potential Match</div>
                    <div className="aspect-video w-full overflow-hidden rounded-lg bg-muted">
                      {match.found_item.image_url ? (
                        <img src={match.found_item.image_url} alt={match.found_item.item_name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-muted-foreground">
                          <ImageIcon className="h-8 w-8" />
                        </div>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">{match.found_item.item_name}</h3>
                    <p className="text-sm text-muted-foreground">{match.found_item.description}</p>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      {match.found_item.location && (
                        <div className="flex items-center gap-1.5">
                          <MapPin className="h-4 w-4" /> {match.found_item.location}
                        </div>
                      )}
                      {match.found_item.date_reported && (
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-4 w-4" /> {match.found_item.date_reported}
                        </div>
                      )}
                    </div>
                    <Link to="/contact/$itemId" params={{ itemId: String(match.found_item.item_id) }} search={{ type: 'direct' }} className="block">
                      <Button className="w-full bg-[image:var(--gradient-primary)] shadow-[var(--shadow-card)]">
                        View Contact Details
                      </Button>
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
