import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { api, normalizeItem, type Item } from "@/lib/api";
import { isAuthed, getUser } from "@/lib/auth";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Loader2, MapPin, Calendar, ImageIcon, Filter } from "lucide-react";

export const Route = createFileRoute("/browse")({
  head: () => ({ meta: [{ title: "Browse Found Items — East Point Lost & Found" }] }),
  component: Browse,
});

function Browse() {
  const navigate = useNavigate();
  const [items, setItems] = useState<Item[]>([]);
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  useEffect(() => {
    if (!isAuthed()) { navigate({ to: "/login" }); return; }
    (async () => {
      try {
        const { data } = await api.get("/items/found");
        const rawItems = Array.isArray(data) ? data : data.items || [];
        const currentUser = getUser();
        const currentUserId = currentUser?.id;
        
        // Filter out items reported by the current user
        const normalized = rawItems
          .map(normalizeItem)
          .filter((item: any) => item.user_id !== currentUserId && item.userId !== currentUserId);
        
        setItems(normalized);
        setFilteredItems(normalized);
      } catch (err: any) {
        setError(err?.response?.data?.message || "Could not load items.");
      } finally { setLoading(false); }
    })();
  }, [navigate]);

  useEffect(() => {
    if (selectedCategory === "all") {
      setFilteredItems(items);
    } else {
      setFilteredItems(items.filter(item => item.category === selectedCategory));
    }
  }, [selectedCategory, items]);

  const categories = ["all", ...Array.from(new Set(items.map(item => item.category).filter(Boolean)))];

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="mx-auto max-w-6xl px-4 py-12">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Found Items</h1>
            <p className="mt-1 text-muted-foreground">Browse items reported as found on campus.</p>
          </div>
          {!loading && items.length > 0 && (
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground shadow-sm transition hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === "all" ? "All Categories" : cat}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : error ? (
          <div className="mt-8 rounded-xl border border-destructive/40 bg-destructive/5 p-6 text-center text-destructive">{error}</div>
        ) : items.length === 0 ? (
          <div className="mt-8 rounded-xl border border-border bg-card p-12 text-center text-muted-foreground">
            No found items reported yet.
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="mt-8 rounded-xl border border-border bg-card p-12 text-center text-muted-foreground">
            No items found in this category.
          </div>
        ) : (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredItems.map((it) => (
              <article key={it.id} className="overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-card)] transition hover:-translate-y-1 hover:shadow-[var(--shadow-elegant)]">
                <div className="aspect-video w-full overflow-hidden bg-muted">
                  {it.image_url ? (
                    <img src={it.image_url} alt={it.item_name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground"><ImageIcon className="h-8 w-8" /></div>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-semibold text-foreground">{it.item_name}</h3>
                  <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                    {it.location && <div className="flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {it.location}</div>}
                    {it.date && <div className="flex items-center gap-1.5"><Calendar className="h-4 w-4" /> {it.date}</div>}
                  </div>
                  <Link to="/claim/$itemId" params={{ itemId: String(it.id) }} className="mt-4 block">
                    <Button className="w-full bg-[image:var(--gradient-primary)] shadow-[var(--shadow-card)]">Claim</Button>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
