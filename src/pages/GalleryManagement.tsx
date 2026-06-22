import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, Eye, EyeOff } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  useGallery,
  useCreateGalleryItem,
  useUpdateGalleryItem,
  useDeleteGalleryItem,
} from "@/hooks/useGallery";
import { cn } from "@/lib/utils";
import type { GalleryItem } from "@/types";

const CATEGORIES: (GalleryItem["category"] | "all")[] = [
  "all",
  "Showroom",
  "Customer Delivery",
  "Events",
  "Workshop",
  "Bikes",
];

export default function GalleryManagement() {
  const [category, setCategory] = useState<GalleryItem["category"] | "all">("all");
  const [addOpen, setAddOpen] = useState(false);
  const [newUrl, setNewUrl] = useState("");
  const [newCaption, setNewCaption] = useState("");
  const [newCategory, setNewCategory] = useState<GalleryItem["category"]>("Showroom");
  const [newShowroom, setNewShowroom] = useState<GalleryItem["showroom"]>("Both");

  const { data: items, isLoading } = useGallery(category);
  const createItem = useCreateGalleryItem();
  const updateItem = useUpdateGalleryItem();
  const deleteItem = useDeleteGalleryItem();

  const handleAdd = () => {
    if (!newUrl) return;
    createItem.mutate(
      { imageUrl: newUrl, caption: newCaption, category: newCategory, showroom: newShowroom, published: true },
      {
        onSuccess: () => {
          setAddOpen(false);
          setNewUrl("");
          setNewCaption("");
        },
      }
    );
  };

  const togglePublish = (item: GalleryItem) => {
    updateItem.mutate({ id: item.id, input: { published: !item.published } });
  };

  const handleDelete = (id: string) => {
    if (confirm("Remove this image from the gallery?")) deleteItem.mutate(id);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gallery"
        description="Manage images shown on the public KL7 Garage website"
        actions={
          <Button variant="accent" size="sm" onClick={() => setAddOpen(true)}>
            <Plus className="h-4 w-4" /> Add Image
          </Button>
        }
      />

      {/* Category tabs */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              category === cat
                ? "bg-ink text-white"
                : "bg-surface text-muted shadow-soft hover:bg-canvas-dim hover:text-ink"
            }`}
          >
            {cat === "all" ? "All" : cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-card" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {(items ?? []).map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.03 }}
              className={cn(
                "group relative overflow-hidden rounded-card border-2 transition-all",
                item.published ? "border-transparent" : "border-line opacity-60"
              )}
            >
              <img
                src={item.imageUrl}
                alt={item.caption}
                className="aspect-square w-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 flex flex-col justify-between bg-gradient-to-t from-ink/70 via-transparent p-3 opacity-0 transition-opacity group-hover:opacity-100">
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => togglePublish(item)}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 backdrop-blur hover:bg-white/30"
                  >
                    {item.published ? <Eye className="h-4 w-4 text-white" /> : <EyeOff className="h-4 w-4 text-white" />}
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-danger/80 backdrop-blur hover:bg-danger"
                  >
                    <Trash2 className="h-4 w-4 text-white" />
                  </button>
                </div>
                <div>
                  <div className="text-sm font-medium leading-snug text-white">{item.caption}</div>
                  <div className="mt-1 flex items-center gap-2">
                    <Badge variant="dark" className="text-[10px]">{item.category}</Badge>
                    <Badge variant={item.published ? "ok" : "outline"} className="text-[10px]">
                      {item.published ? "Published" : "Hidden"}
                    </Badge>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}

          {/* Add card */}
          <button
            onClick={() => setAddOpen(true)}
            className="flex aspect-square flex-col items-center justify-center gap-3 rounded-card border-2 border-dashed border-line bg-surface text-muted transition-colors hover:border-ink/30 hover:bg-canvas hover:text-ink"
          >
            <Plus className="h-8 w-8" />
            <span className="text-sm font-medium">Add image</span>
          </button>
        </div>
      )}

      {!isLoading && (items ?? []).length === 0 && (
        <Card>
          <CardContent className="py-16 text-center text-sm text-muted">
            No gallery images yet. Add some to get started.
          </CardContent>
        </Card>
      )}

      {/* Add dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Gallery Image</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <Label>Image URL</Label>
              <Input
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder="https://…"
              />
              {newUrl && (
                <img src={newUrl} alt="preview" className="mt-2 h-40 w-full rounded-xl object-cover" />
              )}
            </div>
            <div>
              <Label>Caption</Label>
              <Input
                value={newCaption}
                onChange={(e) => setNewCaption(e.target.value)}
                placeholder="Describe the image…"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Category</Label>
                <Select value={newCategory} onValueChange={(v) => setNewCategory(v as GalleryItem["category"])}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(["Showroom", "Customer Delivery", "Events", "Workshop", "Bikes"] as const).map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Showroom</Label>
                <Select value={newShowroom} onValueChange={(v) => setNewShowroom(v as GalleryItem["showroom"])}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Ernakulam">Ernakulam</SelectItem>
                    <SelectItem value="Aluva">Aluva</SelectItem>
                    <SelectItem value="Both">Both</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button
              onClick={handleAdd}
              variant="accent"
              className="w-full"
              disabled={!newUrl || createItem.isPending}
            >
              {createItem.isPending ? "Adding…" : "Add to Gallery"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
