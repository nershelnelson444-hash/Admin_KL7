import { mockDb, networkDelay, newId } from "@/api/mockDb";
import type { CalendarTask } from "@/types";

export const calendarService = {
  async list(): Promise<CalendarTask[]> {
    await networkDelay(100, 200);
    return (mockDb.get() as any).calendarTasks ?? [];
  },

  async create(input: Omit<CalendarTask, "id" | "createdAt">): Promise<CalendarTask> {
    await networkDelay(100, 200);
    const task: CalendarTask = {
      ...input,
      id: newId("ct"),
      createdAt: new Date().toISOString(),
    };
    mockDb.update((d: any) => {
      if (!d.calendarTasks) d.calendarTasks = [];
      d.calendarTasks.push(task);
    });
    return task;
  },

  async update(id: string, input: Partial<Omit<CalendarTask, "id" | "createdAt">>): Promise<CalendarTask> {
    await networkDelay(100, 200);
    let updated: CalendarTask | undefined;
    mockDb.update((d: any) => {
      d.calendarTasks = (d.calendarTasks ?? []).map((t: CalendarTask) => {
        if (t.id !== id) return t;
        updated = { ...t, ...input };
        return updated;
      });
    });
    if (!updated) throw new Error("Task not found");
    return updated;
  },

  async remove(id: string): Promise<void> {
    await networkDelay(100, 200);
    mockDb.update((d: any) => {
      d.calendarTasks = (d.calendarTasks ?? []).filter((t: CalendarTask) => t.id !== id);
    });
  },
};
