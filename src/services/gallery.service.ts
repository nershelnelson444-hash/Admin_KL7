import { apiClient, USE_MOCK_API } from "@/api/client";
import { mockDb, networkDelay, newId } from "@/api/mockDb";
import type { GalleryItem } from "@/types";

export type GalleryInput = Omit<GalleryItem, "id" | "createdAt" | "order">;

export const galleryService = {
  async list(category?: GalleryItem["category"] | "all"): Promise<GalleryItem[]> {
    if (USE_MOCK_API) {
      await networkDelay();
      let result = [...mockDb.get().gallery];
      if (category && category !== "all") {
        result = result.filter((g) => g.category === category);
      }
      result.sort((a, b) => a.order - b.order);
      return result;
    }
    const { data } = await apiClient.get<GalleryItem[]>("/gallery", { params: { category } });
    return data;
  },

  async create(input: GalleryInput): Promise<GalleryItem> {
    if (USE_MOCK_API) {
      await networkDelay();
      const item: GalleryItem = {
        ...input,
        id: newId("gl"),
        order: mockDb.get().gallery.length,
        createdAt: new Date().toISOString(),
      };
      mockDb.update((d) => d.gallery.push(item));
      return item;
    }
    const { data } = await apiClient.post<GalleryItem>("/gallery", input);
    return data;
  },

  async update(id: string, input: Partial<GalleryInput>): Promise<GalleryItem> {
    if (USE_MOCK_API) {
      await networkDelay();
      let updated: GalleryItem | undefined;
      mockDb.update((d) => {
        d.gallery = d.gallery.map((g) => {
          if (g.id !== id) return g;
          updated = { ...g, ...input };
          return updated;
        });
      });
      if (!updated) throw new Error("Gallery item not found");
      return updated;
    }
    const { data } = await apiClient.patch<GalleryItem>(`/gallery/${id}`, input);
    return data;
  },

  async reorder(orderedIds: string[]): Promise<void> {
    if (USE_MOCK_API) {
      await networkDelay(150, 300);
      mockDb.update((d) => {
        d.gallery = d.gallery.map((g) => ({ ...g, order: orderedIds.indexOf(g.id) }));
      });
      return;
    }
    await apiClient.post("/gallery/reorder", { orderedIds });
  },

  async remove(id: string): Promise<void> {
    if (USE_MOCK_API) {
      await networkDelay();
      mockDb.update((d) => {
        d.gallery = d.gallery.filter((g) => g.id !== id);
      });
      return;
    }
    await apiClient.delete(`/gallery/${id}`);
  },
};
