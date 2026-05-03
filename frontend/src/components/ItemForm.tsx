import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { api } from "@/lib/api";
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
import { toast } from "sonner";
import { Loader2, Upload } from "lucide-react";

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

export function ItemForm({ type }: { type: "lost" | "found" }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    item_name: "",
    category: "",
    description: "",
    location: "",
    date_reported: new Date().toISOString().slice(0, 10),
    contact_number: "",
  });
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const update = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleFile = (f: File | null) => {
    setImage(f);
    if (f) {
      const r = new FileReader();
      r.onload = () => setPreview(r.result as string);
      r.readAsDataURL(f);
    } else setPreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      let imageUrl = "";
      
      // Upload image to Cloudinary if selected
      if (image) {
        toast.info("Uploading image...");
        const formData = new FormData();
        formData.append("file", image);
        formData.append("upload_preset", "lost_found_preset"); // Unsigned preset
        
        try {
          const cloudinaryResponse = await fetch(
            `https://api.cloudinary.com/v1_1/djutlrluy/image/upload`,
            {
              method: "POST",
              body: formData,
            }
          );
          
          if (cloudinaryResponse.ok) {
            const cloudinaryData = await cloudinaryResponse.json();
            imageUrl = cloudinaryData.secure_url;
            console.log("Image uploaded successfully:", imageUrl);
            toast.success("Image uploaded successfully");
          } else {
            const errorData = await cloudinaryResponse.json();
            console.error("Cloudinary upload failed:", errorData);
            toast.error(`Image upload failed: ${errorData.error?.message || "Unknown error"}`);
          }
        } catch (uploadErr: any) {
          console.error("Image upload error:", uploadErr);
          toast.error("Failed to upload image. Continuing without image.");
        }
      }

      // Backend expects JSON payload (not multipart form data).
      console.log("Submitting form with image_url:", imageUrl);
      const response = await api.post(type === "lost" ? "/items/lost" : "/items/found", {
        ...form,
        image_url: imageUrl,
      });
      
      const pointsEarned = response.data.points_earned || 0;
      toast.success(`${type === "lost" ? "Lost" : "Found"} item reported successfully! +${pointsEarned} points`);
      navigate({ to: "/dashboard" });
    } catch (err: any) {
      console.error("Form submission error:", err);
      toast.error(err?.response?.data?.message || "Failed to submit. Make sure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="item_name">Item Name</Label>
          <Input
            id="item_name"
            required
            value={form.item_name}
            onChange={(e) => update("item_name", e.target.value)}
            placeholder="e.g. Black Wallet"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select value={form.category} onValueChange={(v) => update("category", v)}>
            <SelectTrigger id="category">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          required
          rows={4}
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
          placeholder="Color, brand, distinguishing features..."
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            required
            value={form.location}
            onChange={(e) => update("location", e.target.value)}
            placeholder="e.g. Library, Block A"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="date_reported">Date</Label>
          <Input
            id="date_reported"
            type="date"
            required
            value={form.date_reported}
            onChange={(e) => update("date_reported", e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="contact_number">Contact Number</Label>
        <Input
          id="contact_number"
          required
          type="tel"
          value={form.contact_number}
          onChange={(e) => update("contact_number", e.target.value)}
          placeholder="+91 9876543210"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="image">Image</Label>
        <label
          htmlFor="image"
          className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-muted/30 px-4 py-6 text-center transition hover:border-primary hover:bg-muted/50"
        >
          {preview ? (
            <img src={preview} alt="Preview" className="max-h-40 rounded-md" />
          ) : (
            <>
              <Upload className="h-6 w-6 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Click to upload an image</span>
            </>
          )}
          <input
            id="image"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0] || null)}
          />
        </label>
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-[image:var(--gradient-primary)] shadow-[var(--shadow-elegant)]"
        size="lg"
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Submit Report
      </Button>
    </form>
  );
}
