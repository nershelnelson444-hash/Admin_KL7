import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { calendarService } from "@/services/calendar.service";
import type { CalendarTask } from "@/types";
import { toast } from "sonner";

export const calendarKeys = {
  all: ["calendarTasks"] as const,
  list: () => [...calendarKeys.all, "list"] as const,
};

export function useCalendarTasks() {
  return useQuery({ queryKey: calendarKeys.list(), queryFn: () => calendarService.list() });
}

export function useCreateCalendarTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Omit<CalendarTask, "id" | "createdAt">) => calendarService.create(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: calendarKeys.all });
      toast.success("Task added to calendar");
    },
    onError: () => toast.error("Couldn't create task."),
  });
}

export function useUpdateCalendarTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<Omit<CalendarTask, "id" | "createdAt">> }) =>
      calendarService.update(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: calendarKeys.all });
      toast.success("Task updated");
    },
    onError: () => toast.error("Couldn't update task."),
  });
}

export function useDeleteCalendarTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => calendarService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: calendarKeys.all });
      toast.success("Task removed");
    },
    onError: () => toast.error("Couldn't remove task."),
  });
}
