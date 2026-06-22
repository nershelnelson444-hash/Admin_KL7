import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { mediaService, type MediaFilters } from "@/services/media.service";
import { toast } from "sonner";

export const mediaKeys = {
  all: ["media"] as const,
  list: (filters: MediaFilters) => [...mediaKeys.all, "list", filters] as const,
};

export function useMedia(filters: MediaFilters = {}) {
  return useQuery({ queryKey: mediaKeys.list(filters), queryFn: () => mediaService.list(filters) });
}

export function useUploadMedia() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ files, uploadedBy }: { files: File[]; uploadedBy: string }) => mediaService.upload(files, uploadedBy),
    onSuccess: (items) => {
      qc.invalidateQueries({ queryKey: mediaKeys.all });
      toast.success(`${items.length} file${items.length > 1 ? "s" : ""} uploaded`);
    },
    onError: () => toast.error("Upload failed. Try again."),
  });
}

export function useUpdateMedia() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Parameters<typeof mediaService.update>[1] }) =>
      mediaService.update(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: mediaKeys.all });
      toast.success("Asset updated");
    },
    onError: () => toast.error("Couldn't update this asset."),
  });
}

export function useDeleteMedia() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => mediaService.remove(ids),
    onSuccess: (_data, ids) => {
      qc.invalidateQueries({ queryKey: mediaKeys.all });
      toast.success(`${ids.length} file${ids.length > 1 ? "s" : ""} deleted`);
    },
    onError: () => toast.error("Couldn't delete these files."),
  });
}
