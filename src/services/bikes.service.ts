import { USE_MOCK_API } from "@/api/client";
import { mockDb, networkDelay, newId } from "@/api/mockDb";
import { supabase } from "@/config/SupabaseClient";
import type { Bike, BikeStatus, Showroom } from "@/types";

export interface BikeFilters {
  search?: string;
  status?: BikeStatus | "all";
  showroom?: Showroom | "all";
  brand?: string | "all";
  sort?: "newest" | "price-asc" | "price-desc" | "year-desc";
}

export type BikeInput = Omit<Bike, "id" | "createdAt" | "updatedAt" | "views" | "enquiries">;

// ─── Snake-case / camel-case helpers for Supabase ──────────────────────────
function toCamelCase(obj: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    out[k.replace(/_([a-z])/g, (_, c) => c.toUpperCase())] = v;
  }
  return out;
}

function toSnakeCase(obj: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    out[k.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`)] = v;
  }
  return out;
}

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
    let query = supabase.from("bikes").select("*");
    if (filters.status && filters.status !== "all") query = query.eq("status", filters.status);
    if (filters.showroom && filters.showroom !== "all") query = query.eq("showroom", filters.showroom);
    if (filters.brand && filters.brand !== "all") query = query.eq("brand", filters.brand);
    if (filters.search) {
      const q = `%${filters.search.toLowerCase()}%`;
      query = query.or(`brand.ilike.${q},model.ilike.${q},color.ilike.${q}`);
    }
    switch (filters.sort) {
      case "price-asc": query = query.order("price", { ascending: true }); break;
      case "price-desc": query = query.order("price", { ascending: false }); break;
      case "year-desc": query = query.order("year", { ascending: false }); break;
      default: query = query.order("created_at", { ascending: false });
    }
    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []).map((d) => toCamelCase(d as unknown as Record<string, unknown>)) as unknown as Bike[];
  },

  async get(id: string): Promise<Bike | undefined> {
    if (USE_MOCK_API) {
      await networkDelay(150, 350);
      return mockDb.get().bikes.find((b) => b.id === id);
    }
    const { data, error } = await supabase.from("bikes").select("*").eq("id", id).single();
    if (error) throw error;
    return toCamelCase(data as unknown as Record<string, unknown>) as unknown as Bike;
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
    const { data, error } = await supabase
      .from("bikes")
      .insert(toSnakeCase(input as unknown as Record<string, unknown>) as never)
      .select()
      .single();
    if (error) throw error;
    return toCamelCase(data as unknown as Record<string, unknown>) as unknown as Bike;
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
    const { data, error } = await supabase
      .from("bikes")
      .update({ ...toSnakeCase(input as unknown as Record<string, unknown>), updated_at: new Date().toISOString() } as never)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return toCamelCase(data as unknown as Record<string, unknown>) as unknown as Bike;
  },

  async remove(id: string): Promise<void> {
    if (USE_MOCK_API) {
      await networkDelay();
      mockDb.update((d) => {
        d.bikes = d.bikes.filter((b) => b.id !== id);
      });
      return;
    }
    const { error } = await supabase.from("bikes").delete().eq("id", id);
    if (error) throw error;
  },

  async updateStatus(id: string, status: BikeStatus): Promise<Bike> {
    return bikesService.update(id, { status });
  },

  async brands(): Promise<string[]> {
    if (USE_MOCK_API) {
      await networkDelay(100, 200);
      return Array.from(new Set(mockDb.get().bikes.map((b) => b.brand))).sort();
    }
    const { data, error } = await supabase.from("bikes").select("brand");
    if (error) throw error;
    return Array.from(new Set((data ?? []).map((b: unknown) => (b as Record<string, string>).brand))).sort();
  },
};
