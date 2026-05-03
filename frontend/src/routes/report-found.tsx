import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { isAuthed } from "@/lib/auth";
import { AppHeader } from "@/components/AppHeader";
import { ItemForm } from "@/components/ItemForm";

export const Route = createFileRoute("/report-found")({
  head: () => ({ meta: [{ title: "Report Found Item — East Point Lost & Found" }] }),
  component: ReportFound,
});

function ReportFound() {
  const navigate = useNavigate();
  useEffect(() => { if (!isAuthed()) navigate({ to: "/login" }); }, [navigate]);

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="mx-auto max-w-2xl px-4 py-12">
        <h1 className="text-3xl font-bold text-foreground">Report a Found Item</h1>
        <p className="mt-1 text-muted-foreground">Help reunite this item with its owner.</p>
        <div className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)] sm:p-8">
          <ItemForm type="found" />
        </div>
      </main>
    </div>
  );
}
