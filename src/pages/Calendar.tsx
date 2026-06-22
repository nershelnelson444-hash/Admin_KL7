import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, ChevronRight, Plus, X, Trash2,
  MessageSquare, Bike, CalendarDays, Tag, Pencil,
} from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useCalendarTasks, useCreateCalendarTask, useDeleteCalendarTask } from "@/hooks/useCalendar";
import { useCustomerEnquiries } from "@/hooks/useCustomerEnquiry";
import { useSellEnquiries } from "@/hooks/useSellEnquiry";
import type { CalendarTask, CustomerEnquiry, SellEnquiry } from "@/types";
import { cn } from "@/lib/utils";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

const TASK_COLORS = [
  { label: "Blue", value: "#3b82f6" }, { label: "Green", value: "#22c55e" },
  { label: "Red", value: "#ef4444" }, { label: "Purple", value: "#a855f7" },
  { label: "Orange", value: "#f97316" }, { label: "Pink", value: "#ec4899" },
];

function toDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function formatDate(dateKey: string): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

interface DayEvents {
  customerEnquiries: CustomerEnquiry[];
  sellEnquiries: SellEnquiry[];
  tasks: CalendarTask[];
}

export default function Calendar() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);
  const [addTaskOpen, setAddTaskOpen] = useState(false);
  const [newTask, setNewTask] = useState({ title: "", description: "", color: TASK_COLORS[0].value, date: "" });

  const { data: tasks = [] } = useCalendarTasks();
  const { data: customerEnquiries = [] } = useCustomerEnquiries();
  const { data: sellEnquiries = [] } = useSellEnquiries();
  const createTask = useCreateCalendarTask();
  const deleteTask = useDeleteCalendarTask();

  // Map events by date key
  const eventMap = useMemo(() => {
    const map = new Map<string, DayEvents>();
    const ensure = (key: string) => {
      if (!map.has(key)) map.set(key, { customerEnquiries: [], sellEnquiries: [], tasks: [] });
      return map.get(key)!;
    };
    customerEnquiries.forEach((e) => ensure(e.createdAt.slice(0, 10)).customerEnquiries.push(e));
    sellEnquiries.forEach((e) => ensure(e.createdAt.slice(0, 10)).sellEnquiries.push(e));
    tasks.forEach((t) => ensure(t.date).tasks.push(t));
    return map;
  }, [customerEnquiries, sellEnquiries, tasks]);

  // Calendar grid
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const calendarCells: (number | null)[] = [
    ...Array.from({ length: firstDay }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  // pad to complete last row
  while (calendarCells.length % 7 !== 0) calendarCells.push(null);

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  const handleDayClick = (day: number) => {
    const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    setSelectedDate(key);
  };

  const handleAddTask = () => {
    if (!newTask.title || !newTask.date) return;
    createTask.mutate({ title: newTask.title, description: newTask.description, color: newTask.color, date: newTask.date },
      { onSuccess: () => { setAddTaskOpen(false); setNewTask({ title: "", description: "", color: TASK_COLORS[0].value, date: "" }); } }
    );
  };

  const selectedEvents: DayEvents = selectedDate
    ? (eventMap.get(selectedDate) ?? { customerEnquiries: [], sellEnquiries: [], tasks: [] })
    : { customerEnquiries: [], sellEnquiries: [], tasks: [] };

  const totalSelected = selectedEvents.customerEnquiries.length + selectedEvents.sellEnquiries.length + selectedEvents.tasks.length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Calendar"
        description="Enquiries and sell requests mapped by date. Mark days with your own reminders."
        actions={
          <Button variant="accent" size="sm" onClick={() => { setNewTask(n => ({ ...n, date: toDateKey(today) })); setAddTaskOpen(true); }}>
            <Plus className="h-4 w-4" /> Add Reminder
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* ── Calendar ── */}
        <div className="lg:col-span-2">
          <Card className="overflow-hidden">
            {/* Month nav */}
            <div className="flex items-center justify-between border-b border-line px-6 py-4">
              <button onClick={prevMonth} className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-canvas-dim transition-colors">
                <ChevronLeft className="h-5 w-5 text-ink" />
              </button>
              <h2 className="font-display text-lg font-bold text-ink">{MONTHS[month]} {year}</h2>
              <button onClick={nextMonth} className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-canvas-dim transition-colors">
                <ChevronRight className="h-5 w-5 text-ink" />
              </button>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 border-b border-line">
              {DAYS.map((d) => (
                <div key={d} className="py-2.5 text-center text-xs font-semibold uppercase tracking-wide text-muted">{d}</div>
              ))}
            </div>

            {/* Date cells */}
            <div className="grid grid-cols-7">
              {calendarCells.map((day, idx) => {
                if (!day) return <div key={`empty-${idx}`} className="min-h-[80px] border-b border-r border-line last:border-r-0" />;

                const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                const events = eventMap.get(key);
                const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
                const isSelected = selectedDate === key;
                const hasEnquiries = (events?.customerEnquiries.length ?? 0) + (events?.sellEnquiries.length ?? 0) > 0;
                const hasTasks = (events?.tasks.length ?? 0) > 0;
                const isHovered = hoveredDate === key;

                return (
                  <div
                    key={key}
                    className={cn(
                      "relative min-h-[80px] cursor-pointer border-b border-r border-line p-1.5 transition-colors last:border-r-0",
                      "hover:bg-canvas-dim",
                      isSelected && "bg-ink/5 ring-2 ring-inset ring-ink",
                      idx % 7 === 6 && "border-r-0"
                    )}
                    onClick={() => handleDayClick(day)}
                    onMouseEnter={() => setHoveredDate(key)}
                    onMouseLeave={() => setHoveredDate(null)}
                  >
                    {/* Day number */}
                    <div className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold",
                      isToday ? "bg-lime text-lime-ink" : "text-ink",
                    )}>{day}</div>

                    {/* Event dots */}
                    <div className="mt-1 flex flex-wrap gap-1">
                      {hasEnquiries && (
                        <div className="flex items-center gap-0.5">
                          {(events?.customerEnquiries.length ?? 0) > 0 && (
                            <span className="inline-flex h-1.5 w-1.5 rounded-full bg-blue-500" />
                          )}
                          {(events?.sellEnquiries.length ?? 0) > 0 && (
                            <span className="inline-flex h-1.5 w-1.5 rounded-full bg-amber-500" />
                          )}
                        </div>
                      )}
                      {events?.tasks.map((t) => (
                        <span key={t.id} className="inline-flex h-1.5 w-1.5 rounded-full" style={{ backgroundColor: t.color }} />
                      ))}
                    </div>

                    {/* Mini event pills (show up to 2) */}
                    <div className="mt-1 space-y-0.5">
                      {(events?.customerEnquiries ?? []).slice(0, 1).map((e) => (
                        <div key={e.id} className="truncate rounded bg-blue-100 px-1 py-0.5 text-[10px] font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                          📩 {e.fullName}
                        </div>
                      ))}
                      {(events?.sellEnquiries ?? []).slice(0, 1).map((e) => (
                        <div key={e.id} className="truncate rounded bg-amber-100 px-1 py-0.5 text-[10px] font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                          🏍 {e.fullName}
                        </div>
                      ))}
                      {(events?.tasks ?? []).slice(0, 1).map((t) => (
                        <div key={t.id} className="truncate rounded px-1 py-0.5 text-[10px] font-medium text-white" style={{ backgroundColor: t.color }}>
                          {t.title}
                        </div>
                      ))}
                    </div>

                    {/* Hover tooltip */}
                    <AnimatePresence>
                      {isHovered && events && (events.customerEnquiries.length + events.sellEnquiries.length + events.tasks.length) > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: 4, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 4, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          className="absolute left-1/2 z-50 mt-1 w-52 -translate-x-1/2 rounded-xl border border-line bg-surface p-3 shadow-lg top-full"
                          style={{ top: "calc(100% + 4px)" }}
                        >
                          <div className="mb-2 text-xs font-semibold text-ink">{formatDate(key)}</div>
                          {events.customerEnquiries.length > 0 && (
                            <div className="mb-1">
                              <div className="text-[10px] font-semibold uppercase tracking-wide text-blue-500 mb-1">Customer Enquiries</div>
                              {events.customerEnquiries.slice(0, 3).map((e) => (
                                <div key={e.id} className="text-xs text-muted truncate">• {e.fullName} — {e.subject}</div>
                              ))}
                              {events.customerEnquiries.length > 3 && <div className="text-xs text-muted">+{events.customerEnquiries.length - 3} more</div>}
                            </div>
                          )}
                          {events.sellEnquiries.length > 0 && (
                            <div className="mb-1">
                              <div className="text-[10px] font-semibold uppercase tracking-wide text-amber-500 mb-1">Sell Enquiries</div>
                              {events.sellEnquiries.slice(0, 3).map((e) => (
                                <div key={e.id} className="text-xs text-muted truncate">• {e.fullName} — {e.brand} {e.model}</div>
                              ))}
                              {events.sellEnquiries.length > 3 && <div className="text-xs text-muted">+{events.sellEnquiries.length - 3} more</div>}
                            </div>
                          )}
                          {events.tasks.length > 0 && (
                            <div>
                              <div className="text-[10px] font-semibold uppercase tracking-wide text-muted mb-1">Reminders</div>
                              {events.tasks.slice(0, 3).map((t) => (
                                <div key={t.id} className="flex items-center gap-1 text-xs text-ink">
                                  <span className="inline-block h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: t.color }} />
                                  {t.title}
                                </div>
                              ))}
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-4 border-t border-line px-6 py-3">
              <div className="flex items-center gap-1.5 text-xs text-muted"><span className="inline-block h-2.5 w-2.5 rounded-full bg-blue-500" /> Customer Enquiry</div>
              <div className="flex items-center gap-1.5 text-xs text-muted"><span className="inline-block h-2.5 w-2.5 rounded-full bg-amber-500" /> Sell Enquiry</div>
              <div className="flex items-center gap-1.5 text-xs text-muted"><span className="inline-block h-2.5 w-2.5 rounded-full bg-lime" /> Admin Reminder</div>
            </div>
          </Card>
        </div>

        {/* ── Day Detail Panel ── */}
        <div className="space-y-4">
          {selectedDate ? (
            <AnimatePresence mode="wait">
              <motion.div key={selectedDate} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }}>
                <Card>
                  <div className="flex items-center justify-between border-b border-line px-5 py-4">
                    <div>
                      <div className="font-display text-base font-bold text-ink">{formatDate(selectedDate)}</div>
                      <div className="text-xs text-muted">{totalSelected} event{totalSelected !== 1 ? "s" : ""}</div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => { setNewTask(n => ({ ...n, date: selectedDate })); setAddTaskOpen(true); }}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-lime text-lime-ink hover:opacity-80 transition-opacity">
                        <Plus className="h-4 w-4" />
                      </button>
                      <button onClick={() => setSelectedDate(null)} className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-canvas-dim transition-colors">
                        <X className="h-4 w-4 text-muted" />
                      </button>
                    </div>
                  </div>

                  <CardContent className="space-y-4 pt-4">
                    {totalSelected === 0 && (
                      <div className="py-8 text-center text-sm text-muted">No events on this day.</div>
                    )}

                    {/* Customer Enquiries */}
                    {selectedEvents.customerEnquiries.length > 0 && (
                      <div>
                        <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-blue-500">
                          <MessageSquare className="h-3.5 w-3.5" /> Customer Enquiries
                        </div>
                        <div className="space-y-2">
                          {selectedEvents.customerEnquiries.map((e) => (
                            <div key={e.id} className="rounded-xl border border-line bg-canvas p-3">
                              <div className="flex items-start justify-between gap-2">
                                <div className="font-medium text-sm text-ink">{e.fullName}</div>
                                <Badge variant={e.status === "new" ? "accent" : e.status === "replied" ? "ok" : "outline"} className="text-[10px]">
                                  {e.status}
                                </Badge>
                              </div>
                              <div className="text-xs text-muted mt-0.5">{e.subject}</div>
                              <p className="mt-1.5 text-xs text-ink/70 line-clamp-2">{e.message}</p>
                              <div className="mt-2 flex gap-2">
                                <a href={`tel:${e.phone}`} className="text-xs text-blue-500 hover:underline">{e.phone}</a>
                                <span className="text-muted">·</span>
                                <a href={`mailto:${e.email}`} className="text-xs text-blue-500 hover:underline">{e.email}</a>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Sell Enquiries */}
                    {selectedEvents.sellEnquiries.length > 0 && (
                      <div>
                        <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-amber-500">
                          <Bike className="h-3.5 w-3.5" /> Sell Enquiries
                        </div>
                        <div className="space-y-2">
                          {selectedEvents.sellEnquiries.map((e) => (
                            <div key={e.id} className="rounded-xl border border-line bg-canvas p-3">
                              <div className="flex items-start justify-between gap-2">
                                <div className="font-medium text-sm text-ink">{e.fullName}</div>
                                <Badge variant={e.status === "new" ? "accent" : e.status === "deal_closed" ? "ok" : "outline"} className="text-[10px]">
                                  {e.status === "deal_closed" ? "Closed" : e.status}
                                </Badge>
                              </div>
                              <div className="text-xs font-semibold text-amber-600 mt-0.5">{e.brand} {e.model} ({e.year})</div>
                              <div className="text-xs text-muted mt-0.5">{e.bikeType} · {e.mileage.toLocaleString()} km · RM {e.askingPrice.toLocaleString()}</div>
                              <div className="mt-2 flex gap-2">
                                <a href={`tel:${e.phone}`} className="text-xs text-amber-600 hover:underline">{e.phone}</a>
                                <span className="text-muted">·</span>
                                <span className="text-xs text-muted">via {e.preferredContact}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Tasks / Reminders */}
                    {selectedEvents.tasks.length > 0 && (
                      <div>
                        <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted">
                          <Tag className="h-3.5 w-3.5" /> Reminders
                        </div>
                        <div className="space-y-2">
                          {selectedEvents.tasks.map((t) => (
                            <div key={t.id} className="group flex items-start gap-3 rounded-xl border border-line bg-canvas p-3">
                              <span className="mt-0.5 inline-block h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: t.color }} />
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-sm text-ink">{t.title}</div>
                                {t.description && <div className="text-xs text-muted mt-0.5 leading-relaxed">{t.description}</div>}
                              </div>
                              <button onClick={() => deleteTask.mutate(t.id)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity text-muted hover:text-danger">
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </AnimatePresence>
          ) : (
            <Card className="border-dashed">
              <CardContent className="py-16 text-center">
                <CalendarDays className="mx-auto h-10 w-10 text-muted/40 mb-3" />
                <p className="text-sm text-muted">Click any day to view its details</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Add Task Dialog */}
      <Dialog open={addTaskOpen} onOpenChange={setAddTaskOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Pencil className="h-4 w-4" /> Add Reminder</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <Label>Date</Label>
              <Input type="date" value={newTask.date} onChange={(e) => setNewTask(n => ({ ...n, date: e.target.value }))} />
            </div>
            <div>
              <Label>Title</Label>
              <Input value={newTask.title} onChange={(e) => setNewTask(n => ({ ...n, title: e.target.value }))} placeholder="e.g. Follow up with Arjun" />
            </div>
            <div>
              <Label>Description <span className="text-muted">(optional)</span></Label>
              <Textarea rows={2} value={newTask.description} onChange={(e) => setNewTask(n => ({ ...n, description: e.target.value }))} placeholder="Additional notes…" />
            </div>
            <div>
              <Label>Colour</Label>
              <div className="mt-2 flex gap-2">
                {TASK_COLORS.map((c) => (
                  <button key={c.value} type="button"
                    onClick={() => setNewTask(n => ({ ...n, color: c.value }))}
                    className={cn("h-7 w-7 rounded-full transition-transform hover:scale-110", newTask.color === c.value && "ring-2 ring-offset-2 ring-ink scale-110")}
                    style={{ backgroundColor: c.value }}
                    title={c.label}
                  />
                ))}
              </div>
            </div>
            <Button onClick={handleAddTask} variant="accent" className="w-full" disabled={!newTask.title || !newTask.date || createTask.isPending}>
              {createTask.isPending ? "Saving…" : "Add to Calendar"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
