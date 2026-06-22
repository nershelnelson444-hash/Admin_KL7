import { apiClient, USE_MOCK_API } from "@/api/client";
import { mockDb, networkDelay, newId } from "@/api/mockDb";
import type { Lead, LeadStatus, Showroom } from "@/types";

export interface LeadFilters {
  search?: string;
  status?: LeadStatus | "all";
  showroom?: Showroom | "all";
  interest?: Lead["interest"] | "all";
}

export type LeadInput = Omit<Lead, "id" | "createdAt" | "lastContact">;

function applyFilters(leads: Lead[], filters: LeadFilters = {}): Lead[] {
  let result = [...leads];
  if (filters.search) {
    const q = filters.search.toLowerCase();
    result = result.filter(
      (l) => l.name.toLowerCase().includes(q) || l.email.toLowerCase().includes(q) || l.phone.includes(q)
    );
  }
  if (filters.status && filters.status !== "all") {
    result = result.filter((l) => l.status === filters.status);
  }
  if (filters.showroom && filters.showroom !== "all") {
    result = result.filter((l) => l.showroom === filters.showroom);
  }
  if (filters.interest && filters.interest !== "all") {
    result = result.filter((l) => l.interest === filters.interest);
  }
  result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return result;
}

export const leadsService = {
  async list(filters: LeadFilters = {}): Promise<Lead[]> {
    if (USE_MOCK_API) {
      await networkDelay();
      return applyFilters(mockDb.get().leads, filters);
    }
    const { data } = await apiClient.get<Lead[]>("/leads", { params: filters });
    return data;
  },

  async get(id: string): Promise<Lead | undefined> {
    if (USE_MOCK_API) {
      await networkDelay(150, 300);
      return mockDb.get().leads.find((l) => l.id === id);
    }
    const { data } = await apiClient.get<Lead>(`/leads/${id}`);
    return data;
  },

  async create(input: LeadInput): Promise<Lead> {
    if (USE_MOCK_API) {
      await networkDelay();
      const lead: Lead = {
        ...input,
        id: newId("ld"),
        createdAt: new Date().toISOString(),
        lastContact: new Date().toISOString(),
      };
      mockDb.update((d) => d.leads.unshift(lead));
      return lead;
    }
    const { data } = await apiClient.post<Lead>("/leads", input);
    return data;
  },

  async update(id: string, input: Partial<LeadInput>): Promise<Lead> {
    if (USE_MOCK_API) {
      await networkDelay();
      let updated: Lead | undefined;
      mockDb.update((d) => {
        d.leads = d.leads.map((l) => {
          if (l.id !== id) return l;
          updated = { ...l, ...input, lastContact: new Date().toISOString() };
          return updated;
        });
      });
      if (!updated) throw new Error("Lead not found");
      return updated;
    }
    const { data } = await apiClient.patch<Lead>(`/leads/${id}`, input);
    return data;
  },

  async updateStatus(id: string, status: LeadStatus): Promise<Lead> {
    return leadsService.update(id, { status });
  },

  async remove(id: string): Promise<void> {
    if (USE_MOCK_API) {
      await networkDelay();
      mockDb.update((d) => {
        d.leads = d.leads.filter((l) => l.id !== id);
      });
      return;
    }
    await apiClient.delete(`/leads/${id}`);
  },
};
