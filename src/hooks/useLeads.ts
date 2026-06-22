import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { leadsService, type LeadFilters, type LeadInput } from "@/services/leads.service";
import type { Lead, LeadStatus } from "@/types";
import { toast } from "sonner";

export const leadKeys = {
  all: ["leads"] as const,
  list: (filters: LeadFilters) => [...leadKeys.all, "list", filters] as const,
  detail: (id: string) => [...leadKeys.all, "detail", id] as const,
};

export function useLeads(filters: LeadFilters = {}) {
  return useQuery({ queryKey: leadKeys.list(filters), queryFn: () => leadsService.list(filters) });
}

export function useLead(id: string | undefined) {
  return useQuery({
    queryKey: leadKeys.detail(id ?? ""),
    queryFn: () => leadsService.get(id as string),
    enabled: Boolean(id),
  });
}

export function useCreateLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: LeadInput) => leadsService.create(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: leadKeys.all });
      toast.success("Lead added");
    },
    onError: () => toast.error("Couldn't add this lead."),
  });
}

export function useUpdateLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<LeadInput> }) => leadsService.update(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: leadKeys.all });
      toast.success("Lead updated");
    },
    onError: () => toast.error("Couldn't update this lead."),
  });
}

export function useUpdateLeadStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: LeadStatus }) => leadsService.updateStatus(id, status),
    onMutate: async ({ id, status }) => {
      await qc.cancelQueries({ queryKey: leadKeys.all });
      const previous = qc.getQueriesData<Lead[]>({ queryKey: leadKeys.all });
      qc.setQueriesData<Lead[]>({ queryKey: leadKeys.all }, (old) => {
        if (!old) return old;
        return old.map((l) => (l.id === id ? { ...l, status } : l));
      });
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      ctx?.previous?.forEach(([key, data]) => qc.setQueryData(key, data));
      toast.error("Couldn't move this lead.");
    },
    onSettled: () => qc.invalidateQueries({ queryKey: leadKeys.all }),
  });
}

export function useDeleteLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => leadsService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: leadKeys.all });
      toast.success("Lead removed");
    },
    onError: () => toast.error("Couldn't remove this lead."),
  });
}
