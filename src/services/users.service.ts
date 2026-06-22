import { apiClient, USE_MOCK_API } from "@/api/client";
import { mockDb, networkDelay, newId } from "@/api/mockDb";
import type { AdminUser, UserStatus } from "@/types";

export type UserInput = Omit<AdminUser, "id" | "joinedAt" | "lastActive" | "dealsClosed">;

export const usersService = {
  async list(): Promise<AdminUser[]> {
    if (USE_MOCK_API) {
      await networkDelay();
      return [...mockDb.get().users].sort((a, b) => new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime());
    }
    const { data } = await apiClient.get<AdminUser[]>("/users");
    return data;
  },

  async create(input: UserInput): Promise<AdminUser> {
    if (USE_MOCK_API) {
      await networkDelay();
      const user: AdminUser = {
        ...input,
        id: newId("usr"),
        dealsClosed: 0,
        joinedAt: new Date().toISOString(),
        lastActive: new Date().toISOString(),
      };
      mockDb.update((d) => d.users.push(user));
      return user;
    }
    const { data } = await apiClient.post<AdminUser>("/users", input);
    return data;
  },

  async update(id: string, input: Partial<UserInput>): Promise<AdminUser> {
    if (USE_MOCK_API) {
      await networkDelay();
      let updated: AdminUser | undefined;
      mockDb.update((d) => {
        d.users = d.users.map((u) => {
          if (u.id !== id) return u;
          updated = { ...u, ...input };
          return updated;
        });
      });
      if (!updated) throw new Error("User not found");
      return updated;
    }
    const { data } = await apiClient.patch<AdminUser>(`/users/${id}`, input);
    return data;
  },

  async updateStatus(id: string, status: UserStatus): Promise<AdminUser> {
    return usersService.update(id, { status });
  },

  async remove(id: string): Promise<void> {
    if (USE_MOCK_API) {
      await networkDelay();
      mockDb.update((d) => {
        d.users = d.users.filter((u) => u.id !== id);
      });
      return;
    }
    await apiClient.delete(`/users/${id}`);
  },
};
