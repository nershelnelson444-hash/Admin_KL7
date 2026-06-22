import { apiClient, USE_MOCK_API } from "@/api/client";
import { mockDb, networkDelay, newId } from "@/api/mockDb";
import type { Bike, BikeStatus, Showroom } from "@/types";

export interface BikeFilters {
  search?: string;
  status?: BikeStatus | "all";
  showroom?: Showroom | "all";
  brand?: string | "all";
  sort?: "newest" | "price-asc" | "price-desc" | "year-desc";
}

export type BikeInput = Omit<Bike, "id" | "createdAt" | "updatedAt" | "views" | "enquiries">;

function applyFilters(bikes: Bike[], filters: BikeFilters = {}): Bike[] {
  let result = [...bikes];
  if (filters.search) {
    const q = filters.search.toLowerCase();
    result = result.filter(
      (b) =>
        b.brand.toLowerCase().includes(q) ||
        b.model.toLowerCase().includes(q) ||
        b.color.toLowerCase().includes(q) ||
        b.id.toLowerCase().includes(q)
    );
  }
  if (filters.status && filters.status !== "all") {
    result = result.filter((b) => b.status === filters.status);
  }
  if (filters.showroom && filters.showroom !== "all") {
    result = result.filter((b) => b.showroom === filters.showroom);
  }
  if (filters.brand && filters.brand !== "all") {
    result = result.filter((b) => b.brand === filters.brand);
  }
  switch (filters.sort) {
    case "price-asc":
      result.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      result.sort((a, b) => b.price - a.price);
      break;
    case "year-desc":
      result.sort((a, b) => b.year - a.year);
      break;
    default:
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  return result;
}

export const bikesService = {
  async list(filters: BikeFilters = {}): Promise<Bike[]> {
    if (USE_MOCK_API) {
      await networkDelay();
      return applyFilters(mockDb.get().bikes, filters);
    }
    const { data } = await apiClient.get<Bike[]>("/bikes", { params: filters });
    return data;
  },

  async get(id: string): Promise<Bike | undefined> {
    if (USE_MOCK_API) {
      await networkDelay(150, 350);
      return mockDb.get().bikes.find((b) => b.id === id);
    }
    const { data } = await apiClient.get<Bike>(`/bikes/${id}`);
    return data;
  },

  async create(input: BikeInput): Promise<Bike> {
    if (USE_MOCK_API) {
      await networkDelay();
      const bike: Bike = {
        ...input,
        id: newId("bk"),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        views: 0,
        enquiries: 0,
      };
      mockDb.update((d) => d.bikes.unshift(bike));
      return bike;
    }
    const { data } = await apiClient.post<Bike>("/bikes", input);
    return data;
  },

  async update(id: string, input: Partial<BikeInput>): Promise<Bike> {
    if (USE_MOCK_API) {
      await networkDelay();
      let updated: Bike | undefined;
      mockDb.update((d) => {
        d.bikes = d.bikes.map((b) => {
          if (b.id !== id) return b;
          updated = { ...b, ...input, updatedAt: new Date().toISOString() };
          return updated;
        });
      });
      if (!updated) throw new Error("Bike not found");
      return updated;
    }
    const { data } = await apiClient.patch<Bike>(`/bikes/${id}`, input);
    return data;
  },

  async remove(id: string): Promise<void> {
    if (USE_MOCK_API) {
      await networkDelay();
      mockDb.update((d) => {
        d.bikes = d.bikes.filter((b) => b.id !== id);
      });
      return;
    }
    await apiClient.delete(`/bikes/${id}`);
  },

  async updateStatus(id: string, status: BikeStatus): Promise<Bike> {
    return bikesService.update(id, { status });
  },

  async brands(): Promise<string[]> {
    if (USE_MOCK_API) {
      await networkDelay(100, 200);
      return Array.from(new Set(mockDb.get().bikes.map((b) => b.brand))).sort();
    }
    const { data } = await apiClient.get<string[]>("/bikes/brands");
    return data;
  },
};
