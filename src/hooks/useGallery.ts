import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { galleryService, type GalleryInput } from "@/services/gallery.service";
import type { GalleryItem } from "@/types";
import { toast } from "sonner";

export const galleryKeys = {
  all: ["gallery"] as const,
  list: (category?: string) => [...galleryKeys.all, "list", category ?? "all"] as const,
};

export function useGallery(category?: GalleryItem["category"] | "all") {
  return useQuery({ queryKey: galleryKeys.list(category), queryFn: () => galleryService.list(category) });
}

export function useCreateGalleryItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: GalleryInput) => galleryService.create(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: galleryKeys.all });
      toast.success("Added to gallery");
    },
    onError: () => toast.error("Couldn't add to gallery."),
  });
}

export function useUpdateGalleryItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<GalleryInput> }) => galleryService.update(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: galleryKeys.all }),
    onError: () => toast.error("Couldn't update this item."),
  });
}

export function useReorderGallery() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (orderedIds: string[]) => galleryService.reorder(orderedIds),
    onSuccess: () => qc.invalidateQueries({ queryKey: galleryKeys.all }),
  });
}

export function useDeleteGalleryItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => galleryService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: galleryKeys.all });
      toast.success("Removed from gallery");
    },
    onError: () => toast.error("Couldn't remove this item."),
  });
}
