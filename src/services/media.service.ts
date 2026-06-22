import { apiClient, USE_MOCK_API } from "@/api/client";
import { mockDb, networkDelay, newId } from "@/api/mockDb";
import type { MediaItem } from "@/types";

export interface MediaFilters {
  search?: string;
  tag?: string | "all";
  linkedBikeId?: string;
}

export const mediaService = {
  async list(filters: MediaFilters = {}): Promise<MediaItem[]> {
    if (USE_MOCK_API) {
      await networkDelay();
      let result = [...mockDb.get().media];
      if (filters.search) {
        const q = filters.search.toLowerCase();
        result = result.filter((m) => m.name.toLowerCase().includes(q));
      }
      if (filters.tag && filters.tag !== "all") {
        result = result.filter((m) => m.tags.includes(filters.tag!));
      }
      if (filters.linkedBikeId) {
        result = result.filter((m) => m.linkedBikeId === filters.linkedBikeId);
      }
      result.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
      return result;
    }
    const { data } = await apiClient.get<MediaItem[]>("/media", { params: filters });
    return data;
  },

  /** Mocks a file upload — in production this posts multipart/form-data and the
   *  server returns the stored asset URL (e.g. S3 / Cloudinary). */
  async upload(files: File[], uploadedBy: string): Promise<MediaItem[]> {
    if (USE_MOCK_API) {
      await networkDelay(600, 1400);
      const items: MediaItem[] = files.map((file, i) => ({
        id: newId("md"),
        name: file.name,
        url: URL.createObjectURL(file),
        type: file.type.startsWith("video") ? "video" : "image",
        sizeKb: Math.round(file.size / 1024),
        tags: [],
        uploadedAt: new Date().toISOString(),
        uploadedBy,
      }));
      mockDb.update((d) => d.media.unshift(...items));
      return items;
    }
    const form = new FormData();
    files.forEach((f) => form.append("files", f));
    const { data } = await apiClient.post<MediaItem[]>("/media/upload", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  async update(id: string, input: Partial<Pick<MediaItem, "tags" | "linkedBikeId" | "name">>): Promise<MediaItem> {
    if (USE_MOCK_API) {
      await networkDelay();
      let updated: MediaItem | undefined;
      mockDb.update((d) => {
        d.media = d.media.map((m) => {
          if (m.id !== id) return m;
          updated = { ...m, ...input };
          return updated;
        });
      });
      if (!updated) throw new Error("Media not found");
      return updated;
    }
    const { data } = await apiClient.patch<MediaItem>(`/media/${id}`, input);
    return data;
  },

  async remove(ids: string[]): Promise<void> {
    if (USE_MOCK_API) {
      await networkDelay();
      mockDb.update((d) => {
        d.media = d.media.filter((m) => !ids.includes(m.id));
      });
      return;
    }
    await apiClient.post("/media/bulk-delete", { ids });
  },
};
