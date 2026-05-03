import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { isAuthed } from "@/lib/auth";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/claim/$itemId")({
  head: () => ({ meta: [{ title: "Claim Item — East Point Lost & Found" }] }),
  component: ClaimPage,
});

function ClaimPage() {
  const navigate = useNavigate();
  const { itemId } = Route.useParams();
  const [form, setForm] = useState({ description: "", location: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (!isAuthed()) navigate({ to: "/login" }); }, [navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post(`/items/claim/${itemId}`, form);
      if (data?.status !== "Approved") {
        toast.error("Verification failed. Details did not match.");
      } else {
        toast.success("Verified! Reporter contact details below.");
        navigate({ to: "/contact/$itemId", params: { itemId: String(data.claim_id) } });
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Verification failed");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="mx-auto max-w-xl px-4 py-12">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[image:var(--gradient-primary)] text-primary-foreground">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Verify Ownership</h1>
            <p className="text-sm text-muted-foreground">Provide details to prove the item is yours.</p>
          </div>
        </div>
        <form onSubmit={submit} className="space-y-5 rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)] sm:p-8">
          <div className="space-y-2">
            <Label htmlFor="description">Describe the item</Label>
            <Textarea id="description" required rows={4}
              placeholder="Describe distinguishing details only the owner would know..."
              value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Where did you lose it?</Label>
            <Input id="location" required value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })} />
          </div>
          <Button type="submit" disabled={loading} size="lg" className="w-full bg-[image:var(--gradient-primary)] shadow-[var(--shadow-elegant)]">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Submit Claim
          </Button>
        </form>
      </main>
    </div>
  );
}
