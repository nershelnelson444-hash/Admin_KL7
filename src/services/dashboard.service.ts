import { apiClient, USE_MOCK_API } from "@/api/client";
import { mockDb, networkDelay } from "@/api/mockDb";
import type { DashboardStats, SalesTrendPoint, InventoryByBrand, Bike, Lead } from "@/types";

function computeStats(bikes: Bike[], leads: Lead[]): DashboardStats {
  const available = bikes.filter((b) => b.status === "available").length;
  const sold = bikes.filter((b) => b.status === "sold").length;
  const reserved = bikes.filter((b) => b.status === "reserved").length;
  const totalRevenue = bikes.filter((b) => b.status === "sold").reduce((sum, b) => sum + b.price, 0);

  const now = new Date();
  const thisMonth = bikes.filter((b) => {
    const d = new Date(b.updatedAt);
    return b.status === "sold" && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const monthRevenue = thisMonth.reduce((sum, b) => sum + b.price, 0);

  const activeLeads = leads.filter((l) => !["converted", "lost"].includes(l.status)).length;
  const hotLeads = leads.filter((l) => l.interest === "Hot" && !["converted", "lost"].includes(l.status)).length;
  const converted = leads.filter((l) => l.status === "converted").length;

  return {
    totalInventory: bikes.length,
    available,
    sold,
    reserved,
    totalRevenue,
    monthRevenue,
    revenueDelta: 12.4,
    activeLeads,
    hotLeads,
    avgDaysToSell: 18,
    inventoryHealthPct: Math.round((available / Math.max(bikes.length, 1)) * 100),
    conversionRate: leads.length ? Math.round((converted / leads.length) * 100) : 0,
  };
}

function computeSalesTrend(bikes: Bike[]): SalesTrendPoint[] {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  const sold = bikes.filter((b) => b.status === "sold");
  return months.map((month, i) => {
    const slice = sold.filter((_, idx) => idx % months.length === i);
    const count = Math.max(2, slice.length + ((i * 3) % 5));
    return {
      month,
      sold: count,
      revenue: count * (165000 + ((i * 18000) % 60000)),
    };
  });
}

function computeBrandBreakdown(bikes: Bike[]): InventoryByBrand[] {
  const map = new Map<string, number>();
  bikes.forEach((b) => map.set(b.brand, (map.get(b.brand) ?? 0) + 1));
  return Array.from(map.entries())
    .map(([brand, count]) => ({ brand, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);
}

export const dashboardService = {
  async stats(): Promise<DashboardStats> {
    if (USE_MOCK_API) {
      await networkDelay();
      const { bikes, leads } = mockDb.get();
      return computeStats(bikes, leads);
    }
    const { data } = await apiClient.get<DashboardStats>("/dashboard/stats");
    return data;
  },

  async salesTrend(): Promise<SalesTrendPoint[]> {
    if (USE_MOCK_API) {
      await networkDelay();
      return computeSalesTrend(mockDb.get().bikes);
    }
    const { data } = await apiClient.get<SalesTrendPoint[]>("/dashboard/sales-trend");
    return data;
  },

  async brandBreakdown(): Promise<InventoryByBrand[]> {
    if (USE_MOCK_API) {
      await networkDelay();
      return computeBrandBreakdown(mockDb.get().bikes);
    }
    const { data } = await apiClient.get<InventoryByBrand[]>("/dashboard/brand-breakdown");
    return data;
  },
};
