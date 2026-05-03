import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { api, normalizeItem, type Item } from "@/lib/api";
import { isAuthed } from "@/lib/auth";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, MapPin, Calendar, ImageIcon, Search as SearchIcon } from "lucide-react";

export const Route = createFileRoute("/search")({
  head: () => ({ meta: [{ title: "Search Items — East Point Lost & Found" }] }),
  component: SearchPage,
});

function SearchPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ description: "", location: "" });
  const [results, setResults] = useState<Item[] | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (!isAuthed()) navigate({ to: "/login" }); }, [navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post("/items/match", {
        description: form.description,
        location: form.location,
        status: "Lost",
      });
      setResults((data?.matches || []).map(normalizeItem));
    } catch {
      setResults([]);
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="mx-auto max-w-4xl px-4 py-12">
        <h1 className="text-3xl font-bold text-foreground">Search Items</h1>
        <p className="mt-1 text-muted-foreground">Find matching items by description and location.</p>

        <form onSubmit={submit} className="mt-8 grid gap-4 rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)] sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input id="description" placeholder="e.g. black leather wallet"
              value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input id="location" placeholder="e.g. Library"
              value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          </div>
          <Button type="submit" disabled={loading} className="bg-[image:var(--gradient-primary)] shadow-[var(--shadow-elegant)]">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><SearchIcon className="mr-2 h-4 w-4" /> Search</>}
          </Button>
        </form>

        {results !== null && (
          <div className="mt-10">
            <h2 className="text-lg font-semibold text-foreground">{results.length} match{results.length === 1 ? "" : "es"}</h2>
            {results.length === 0 ? (
              <p className="mt-4 rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">No matches found. Try different keywords.</p>
            ) : (
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {results.map((it) => (
                  <article key={it.id} className="overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-card)]">
                    <div className="aspect-video w-full overflow-hidden bg-muted">
                      {it.image_url ? <img src={it.image_url} alt={it.item_name} className="h-full w-full object-cover" /> :
                        <div className="flex h-full items-center justify-center text-muted-foreground"><ImageIcon className="h-8 w-8" /></div>}
                    </div>
                    <div className="p-5">
                      <h3 className="font-semibold text-foreground">{it.item_name}</h3>
                      <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                        {it.location && <div className="flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {it.location}</div>}
                        {it.date && <div className="flex items-center gap-1.5"><Calendar className="h-4 w-4" /> {it.date}</div>}
                      </div>
                      <Link to="/contact/$itemId" params={{ itemId: String(it.id) }} search={{ type: 'direct' }} className="mt-4 block">
                        <Button variant="outline" className="w-full">View Contact</Button>
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
