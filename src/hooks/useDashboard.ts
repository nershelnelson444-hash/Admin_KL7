import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "@/services/dashboard.service";

export function useDashboardStats() {
  return useQuery({ queryKey: ["dashboard", "stats"], queryFn: dashboardService.stats });
}

export function useSalesTrend() {
  return useQuery({ queryKey: ["dashboard", "sales-trend"], queryFn: dashboardService.salesTrend });
}

export function useBrandBreakdown() {
  return useQuery({ queryKey: ["dashboard", "brand-breakdown"], queryFn: dashboardService.brandBreakdown });
}
