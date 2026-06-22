import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { bikesService, type BikeFilters, type BikeInput } from "@/services/bikes.service";
import type { BikeStatus } from "@/types";
import { toast } from "sonner";

export const bikeKeys = {
  all: ["bikes"] as const,
  list: (filters: BikeFilters) => [...bikeKeys.all, "list", filters] as const,
  detail: (id: string) => [...bikeKeys.all, "detail", id] as const,
  brands: () => [...bikeKeys.all, "brands"] as const,
};

export function useBikes(filters: BikeFilters = {}) {
  return useQuery({
    queryKey: bikeKeys.list(filters),
    queryFn: () => bikesService.list(filters),
  });
}

export function useBike(id: string | undefined) {
  return useQuery({
    queryKey: bikeKeys.detail(id ?? ""),
    queryFn: () => bikesService.get(id as string),
    enabled: Boolean(id),
  });
}

export function useBikeBrands() {
  return useQuery({ queryKey: bikeKeys.brands(), queryFn: bikesService.brands });
}

export function useCreateBike() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: BikeInput) => bikesService.create(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: bikeKeys.all });
      toast.success("Bike added to inventory");
    },
    onError: () => toast.error("Couldn't save this bike. Try again."),
  });
}

export function useUpdateBike() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<BikeInput> }) => bikesService.update(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: bikeKeys.all });
      toast.success("Changes saved");
    },
    onError: () => toast.error("Couldn't save changes. Try again."),
  });
}

export function useUpdateBikeStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: BikeStatus }) => bikesService.updateStatus(id, status),
    onSuccess: (bike) => {
      qc.invalidateQueries({ queryKey: bikeKeys.all });
      toast.success(`Marked ${bike.brand} ${bike.model} as ${bike.status}`);
    },
    onError: () => toast.error("Couldn't update status."),
  });
}

export function useDeleteBike() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => bikesService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: bikeKeys.all });
      toast.success("Bike removed from inventory");
    },
    onError: () => toast.error("Couldn't remove this bike."),
  });
}
