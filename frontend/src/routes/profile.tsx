import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { isAuthed, getUser } from "@/lib/auth";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, User, Award, Package, Edit2, Trash2, X, Save } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "My Profile — East Point Lost & Found" }] }),
  component: Profile,
});

const CATEGORIES = [
  "Electronics",
  "Books & Stationery",
  "ID Cards & Documents",
  "Bags & Wallets",
  "Clothing",
  "Keys",
  "Jewelry",
  "Other",
];

function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [editForm, setEditForm] = useState<any>({});
  const user = getUser();

  const fetchProfile = async () => {
    try {
      const { data } = await api.get("/profile");
      setProfile(data);
    } catch (err) {
      console.error("Failed to fetch profile:", err);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthed()) {
      navigate({ to: "/login" });
      return;
    }
    fetchProfile();
  }, [navigate]);

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setEditForm({
      item_name: item.item_name,
      category: item.category,
      description: item.description,
      location: item.location,
      date_reported: item.date_reported,
      contact_number: item.contact_number,
      image_url: item.image_url || "",
    });
  };

  const handleSave = async () => {
    try {
      await api.put(`/items/${editingItem.item_id}`, editForm);
      toast.success("Item updated successfully");
      setEditingItem(null);
      fetchProfile();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update item");
    }
  };

  const handleDelete = async (itemId: number) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    
    try {
      await api.delete(`/items/${itemId}`);
      toast.success("Item deleted successfully");
      fetchProfile();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to delete item");
    }
  };

  const lostItems = profile?.items?.filter((item: any) => item.status === "Lost") || [];
  const foundItems = profile?.items?.filter((item: any) => item.status === "Found") || [];

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="mx-auto max-w-6xl px-4 py-12">
        {/* Profile Header */}
        <div className="rounded-2xl border border-border bg-card p-8 shadow-[var(--shadow-card)]">
          <div className="flex items-center gap-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[image:var(--gradient-primary)] text-primary-foreground">
              <User className="h-10 w-10" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-foreground">{profile?.user?.name || user?.name}</h1>
              <p className="mt-1 text-muted-foreground">{profile?.user?.email || user?.email}</p>
            </div>
            <div className="rounded-xl border border-border bg-muted/30 p-4 text-center">
              <Award className="mx-auto h-8 w-8 text-primary" />
              <div className="mt-2 text-2xl font-bold text-primary">{profile?.user?.points || 0}</div>
              <div className="text-xs text-muted-foreground">Community Points</div>
            </div>
          </div>
        </div>

        {/* Lost Items */}
        <section className="mt-8">
          <div className="mb-4 flex items-center gap-2">
            <Package className="h-5 w-5 text-destructive" />
            <h2 className="text-2xl font-bold text-foreground">Lost Items ({lostItems.length})</h2>
          </div>
          {lostItems.length === 0 ? (
            <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
              No lost items reported yet
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {lostItems.map((item: any) => (
                <ItemCard
                  key={item.item_id}
                  item={item}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  isEditing={editingItem?.item_id === item.item_id}
                  editForm={editForm}
                  setEditForm={setEditForm}
                  onSave={handleSave}
                  onCancel={() => setEditingItem(null)}
                />
              ))}
            </div>
          )}
        </section>

        {/* Found Items */}
        <section className="mt-8">
          <div className="mb-4 flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">Found Items ({foundItems.length})</h2>
          </div>
          {foundItems.length === 0 ? (
            <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
              No found items reported yet
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {foundItems.map((item: any) => (
                <ItemCard
                  key={item.item_id}
                  item={item}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  isEditing={editingItem?.item_id === item.item_id}
                  editForm={editForm}
                  setEditForm={setEditForm}
                  onSave={handleSave}
                  onCancel={() => setEditingItem(null)}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-elegant)]">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-foreground">Edit Item</h3>
              <Button variant="ghost" size="sm" onClick={() => setEditingItem(null)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="space-y-4">
              <div>
                <Label>Item Name</Label>
                <Input
                  value={editForm.item_name}
                  onChange={(e) => setEditForm({ ...editForm, item_name: e.target.value })}
                />
              </div>
              <div>
                <Label>Category</Label>
                <Select value={editForm.category} onValueChange={(v) => setEditForm({ ...editForm, category: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  rows={4}
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Location</Label>
                  <Input
                    value={editForm.location}
                    onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={editForm.date_reported}
                    onChange={(e) => setEditForm({ ...editForm, date_reported: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label>Contact Number</Label>
                <Input
                  value={editForm.contact_number}
                  onChange={(e) => setEditForm({ ...editForm, contact_number: e.target.value })}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSave} className="flex-1 bg-[image:var(--gradient-primary)]">
                  <Save className="mr-2 h-4 w-4" /> Save Changes
                </Button>
                <Button variant="outline" onClick={() => setEditingItem(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ItemCard({ item, onEdit, onDelete, isEditing }: any) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-[var(--shadow-card)]">
      {item.image_url && (
        <div className="aspect-video w-full overflow-hidden bg-muted">
          <img src={item.image_url} alt={item.item_name} className="h-full w-full object-cover" />
        </div>
      )}
      <div className="p-4">
        <h3 className="font-semibold text-foreground">{item.item_name}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{item.category}</p>
        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{item.description}</p>
        <div className="mt-3 flex gap-2">
          <Button size="sm" variant="outline" onClick={() => onEdit(item)} className="flex-1">
            <Edit2 className="mr-1 h-3 w-3" /> Edit
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onDelete(item.item_id)}
            className="text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}
