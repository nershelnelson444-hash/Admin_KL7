import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { sellEnquiryService } from "@/services/sellEnquiry.service";
import type { SellEnquiryStatus } from "@/types";
import { toast } from "sonner";

export const sellEnquiryKeys = {
  all: ["sellEnquiries"] as const,
  list: () => [...sellEnquiryKeys.all, "list"] as const,
  detail: (id: string) => [...sellEnquiryKeys.all, "detail", id] as const,
};

export function useSellEnquiries() {
  return useQuery({ queryKey: sellEnquiryKeys.list(), queryFn: () => sellEnquiryService.list() });
}

export function useSellEnquiry(id: string | undefined) {
  return useQuery({
    queryKey: sellEnquiryKeys.detail(id ?? ""),
    queryFn: () => sellEnquiryService.get(id as string),
    enabled: Boolean(id),
  });
}

export function useUpdateSellEnquiryStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: SellEnquiryStatus }) =>
      sellEnquiryService.updateStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: sellEnquiryKeys.all });
      toast.success("Status updated");
    },
    onError: () => toast.error("Couldn't update status."),
  });
}

export function useDeleteSellEnquiry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => sellEnquiryService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: sellEnquiryKeys.all });
      toast.success("Enquiry removed");
    },
    onError: () => toast.error("Couldn't remove enquiry."),
  });
}
