import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { api, normalizeItem, type Item } from "@/lib/api";
import { isAuthed } from "@/lib/auth";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Loader2, Mail, Phone, User, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/contact/$itemId")({
  head: () => ({ meta: [{ title: "Contact Reporter — East Point Lost & Found" }] }),
  component: ContactPage,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      type: (search.type as string) || 'claim', // 'claim' or 'direct'
    }
  },
});

function ContactPage() {
  const navigate = useNavigate();
  const { itemId } = Route.useParams();
  const { type } = Route.useSearch();
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [marking, setMarking] = useState(false);

  useEffect(() => {
    if (!isAuthed()) { navigate({ to: "/login" }); return; }
    (async () => {
      try {
        // Use different endpoint based on type
        const endpoint = type === 'direct' 
          ? `/items/direct-contact/${itemId}` 
          : `/items/contact/${itemId}`;
        
        const { data } = await api.get(endpoint);
        setItem(normalizeItem(data));
      } catch (err: any) {
        setError(err?.response?.data?.message || "Could not load contact details.");
      } finally { setLoading(false); }
    })();
  }, [itemId, type, navigate]);

  const handleMarkClaimed = async () => {
    if (!confirm("Mark this item as received/claimed? This will hide it from all listings.")) return;
    
    setMarking(true);
    try {
      await api.post(`/items/${itemId}/mark-claimed`);
      alert("Item marked as claimed! It will no longer appear in listings.");
      navigate({ to: "/dashboard" });
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to mark item as claimed");
    } finally {
      setMarking(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="mx-auto max-w-xl px-4 py-12">
        <Link to="/browse" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary">
          <ArrowLeft className="mr-1 h-4 w-4" /> Back
        </Link>
        <h1 className="mt-4 text-3xl font-bold text-foreground">Reporter Contact Details</h1>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : error ? (
          <div className="mt-8 rounded-xl border border-destructive/40 bg-destructive/5 p-6 text-destructive">{error}</div>
        ) : item ? (
          <div className="mt-8 space-y-4 rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)] sm:p-8">
            <h2 className="text-xl font-semibold text-foreground">{item.item_name}</h2>
            <div className="space-y-3 border-t border-border pt-4">
              <Row icon={User} label="Reporter" value={item.reporter_name || "—"} />
              <Row icon={Phone} label="Phone" value={item.contact_number || "—"} href={item.contact_number ? `tel:${item.contact_number}` : undefined} />
              <Row icon={Mail} label="Email" value={item.email || "—"} href={item.email ? `mailto:${item.email}` : undefined} />
            </div>
            <div className="flex gap-2 border-t border-border pt-4">
              <Button 
                onClick={handleMarkClaimed} 
                disabled={marking}
                className="flex-1 bg-[image:var(--gradient-primary)]"
              >
                {marking ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Mark as Received
              </Button>
              <Link to="/dashboard" className="flex-1">
                <Button variant="outline" className="w-full">Back to Dashboard</Button>
              </Link>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}

function Row({ icon: Icon, label, value, href }: { icon: any; label: string; value: string; href?: string }) {
  const content = (
    <div className="flex items-center gap-3 rounded-lg p-3 transition hover:bg-muted/50">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="font-medium text-foreground">{value}</div>
      </div>
    </div>
  );
  return href ? <a href={href} className="block">{content}</a> : content;
}
