import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Upload, Trash2, Search, FileImage, X, Check } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMedia, useUploadMedia, useDeleteMedia } from "@/hooks/useMedia";
import { useAuth } from "@/context/AuthContext";
import { useDebounce } from "@/hooks/useDebounce";
import { cn } from "@/lib/utils";

const TAGS = ["showroom", "bike", "hero", "delivery", "workshop", "event", "detail"];

export default function MediaLibrary() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [tag, setTag] = useState("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const debouncedSearch = useDebounce(search, 300);
  const { data: media, isLoading } = useMedia({
    search: debouncedSearch || undefined,
    tag,
  });

  const uploadMedia = useUploadMedia();
  const deleteMedia = useDeleteMedia();

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    uploadMedia.mutate({ files: Array.from(files), uploadedBy: user?.name ?? "Staff" });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleBulkDelete = () => {
    if (confirm(`Delete ${selected.size} file${selected.size > 1 ? "s" : ""}?`)) {
      deleteMedia.mutate(Array.from(selected), { onSuccess: () => setSelected(new Set()) });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Media Library"
        description="Upload and organise images across both showrooms"
        actions={
          <>
            {selected.size > 0 && (
              <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
                <Trash2 className="h-4 w-4" /> Delete {selected.size}
              </Button>
            )}
            <Button
              variant="accent"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadMedia.isPending}
            >
              <Upload className="h-4 w-4" />
              {uploadMedia.isPending ? "Uploading…" : "Upload"}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              multiple
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
          </>
        }
      />

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          "flex cursor-pointer flex-col items-center gap-3 rounded-card border-2 border-dashed p-10 text-center transition-colors",
          isDragging ? "border-lime bg-lime/10" : "border-line bg-surface hover:border-ink/30 hover:bg-canvas"
        )}
      >
        <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl", isDragging ? "bg-lime text-lime-ink" : "bg-canvas-dim text-muted")}>
          <FileImage className="h-6 w-6" />
        </div>
        <div>
          <div className="font-semibold text-ink">
            {isDragging ? "Drop files here" : "Drag & drop or click to upload"}
          </div>
          <div className="mt-1 text-sm text-muted">JPG, PNG, WebP, MP4 supported</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[200px] flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search files…"
            className="rounded-full pl-10"
          />
        </div>
        <Select value={tag} onValueChange={setTag}>
          <SelectTrigger className="w-[150px] rounded-full">
            <SelectValue placeholder="Filter by tag" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tags</SelectItem>
            {TAGS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
        {selected.size > 0 && (
          <button onClick={() => setSelected(new Set())} className="flex items-center gap-1.5 text-sm text-muted hover:text-ink">
            <X className="h-4 w-4" /> Clear selection
          </button>
        )}
      </div>

      {!isLoading && (
        <p className="text-sm text-muted">
          {media?.length ?? 0} file{media?.length !== 1 ? "s" : ""}
          {selected.size > 0 && ` · ${selected.size} selected`}
        </p>
      )}

      {/* Grid */}
      <div className="grid gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {isLoading
          ? Array.from({ length: 12 }).map((_, i) => <Skeleton key={i} className="aspect-square rounded-xl" />)
          : (media ?? []).map((item, i) => {
              const isSelected = selected.has(item.id);
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.25, delay: i * 0.015 }}
                  className={cn(
                    "group relative cursor-pointer overflow-hidden rounded-xl border-2 transition-all",
                    isSelected ? "border-lime shadow-lift" : "border-transparent"
                  )}
                  onClick={() => toggleSelect(item.id)}
                >
                  <img
                    src={item.url}
                    alt={item.name}
                    className="aspect-square w-full object-cover"
                    loading="lazy"
                  />
                  <div className={cn(
                    "absolute inset-0 flex flex-col justify-between p-2 opacity-0 transition-opacity group-hover:opacity-100",
                    isSelected && "opacity-100",
                    "bg-gradient-to-t from-ink/60 via-transparent"
                  )}>
                    <div className="flex justify-end">
                      <div className={cn(
                        "flex h-6 w-6 items-center justify-center rounded-full border-2 transition-colors",
                        isSelected ? "border-lime bg-lime text-lime-ink" : "border-white bg-white/20"
                      )}>
                        {isSelected && <Check className="h-3.5 w-3.5" />}
                      </div>
                    </div>
                    <div>
                      <div className="truncate text-xs font-medium text-white">{item.name}</div>
                      <div className="text-[10px] text-white/60">{Math.round(item.sizeKb)} KB</div>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {item.tags.map((t) => (
                          <Badge key={t} variant="dark" className="h-4 px-1.5 text-[10px]">{t}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
      </div>

      {!isLoading && (media ?? []).length === 0 && (
        <div className="py-16 text-center text-sm text-muted">
          No files found. Upload some images to get started.
        </div>
      )}
    </div>
  );
}
