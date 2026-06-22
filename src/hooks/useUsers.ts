import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { usersService, type UserInput } from "@/services/users.service";
import type { UserStatus } from "@/types";
import { toast } from "sonner";

export const userKeys = {
  all: ["users"] as const,
};

export function useUsers() {
  return useQuery({ queryKey: userKeys.all, queryFn: usersService.list });
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UserInput) => usersService.create(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: userKeys.all });
      toast.success("Invite sent");
    },
    onError: () => toast.error("Couldn't invite this user."),
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<UserInput> }) => usersService.update(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: userKeys.all });
      toast.success("User updated");
    },
    onError: () => toast.error("Couldn't update this user."),
  });
}

export function useUpdateUserStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: UserStatus }) => usersService.updateStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: userKeys.all });
      toast.success("Status updated");
    },
    onError: () => toast.error("Couldn't update status."),
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => usersService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: userKeys.all });
      toast.success("User removed");
    },
    onError: () => toast.error("Couldn't remove this user."),
  });
}
