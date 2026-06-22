import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { customerEnquiryService } from "@/services/customerEnquiry.service";
import type { CustomerEnquiryStatus } from "@/types";
import { toast } from "sonner";

export const customerEnquiryKeys = {
  all: ["customerEnquiries"] as const,
  list: () => [...customerEnquiryKeys.all, "list"] as const,
  detail: (id: string) => [...customerEnquiryKeys.all, "detail", id] as const,
};

export function useCustomerEnquiries() {
  return useQuery({ queryKey: customerEnquiryKeys.list(), queryFn: () => customerEnquiryService.list() });
}

export function useCustomerEnquiry(id: string | undefined) {
  return useQuery({
    queryKey: customerEnquiryKeys.detail(id ?? ""),
    queryFn: () => customerEnquiryService.get(id as string),
    enabled: Boolean(id),
  });
}

export function useUpdateCustomerEnquiryStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: CustomerEnquiryStatus }) =>
      customerEnquiryService.updateStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: customerEnquiryKeys.all });
      toast.success("Status updated");
    },
    onError: () => toast.error("Couldn't update status."),
  });
}

export function useDeleteCustomerEnquiry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => customerEnquiryService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: customerEnquiryKeys.all });
      toast.success("Enquiry removed");
    },
    onError: () => toast.error("Couldn't remove enquiry."),
  });
}
