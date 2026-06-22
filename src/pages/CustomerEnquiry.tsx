import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Mail, Phone, ChevronDown, MessageSquare } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useCustomerEnquiries, useUpdateCustomerEnquiryStatus, useDeleteCustomerEnquiry } from "@/hooks/useCustomerEnquiry";
import { useDebounce } from "@/hooks/useDebounce";
import { initials, formatRelativeTime } from "@/lib/utils";
import type { CustomerEnquiry, CustomerEnquiryStatus } from "@/types";

const STATUS_TABS: { value: CustomerEnquiryStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "new", label: "New" },
  { value: "read", label: "Read" },
  { value: "replied", label: "Replied" },
  { value: "closed", label: "Closed" },
];

const STATUS_BADGE: Record<CustomerEnquiryStatus, React.ComponentProps<typeof Badge>["variant"]> = {
  new: "accent", read: "default", replied: "ok", closed: "outline",
};

const SUBJECT_COLORS: Record<string, string> = {
  "Bike Enquiry": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  "Financing Options": "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  "Sell / Trade-In": "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  "After-Sales Support": "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  "General Enquiry": "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
};

export default function CustomerEnquiryPage() {
  const [search, setSearch] = useState("");
  const [statusTab, setStatusTab] = useState<CustomerEnquiryStatus | "all">("all");
  const [selected, setSelected] = useState<CustomerEnquiry | null>(null);

  const debouncedSearch = useDebounce(search, 300);
  const { data: enquiries, isLoading } = useCustomerEnquiries();
  const updateStatus = useUpdateCustomerEnquiryStatus();
  const deleteEnq = useDeleteCustomerEnquiry();

  const filtered = (enquiries ?? [])
    .filter((e) => statusTab === "all" || e.status === statusTab)
    .filter((e) => {
      if (!debouncedSearch) return true;
      const q = debouncedSearch.toLowerCase();
      return [e.fullName, e.email, e.phone, e.subject, e.message].some((v) => v.toLowerCase().includes(q));
    });

  return (
    <div className="space-y-6">
      <PageHeader title="Customer Enquiries" description="Messages received from the website contact form" />

      <div className="flex flex-wrap gap-2">
        {STATUS_TABS.map((tab) => (
          <button key={tab.value} onClick={() => setStatusTab(tab.value)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${statusTab === tab.value ? "bg-ink text-white" : "bg-surface text-muted shadow-soft hover:bg-canvas-dim hover:text-ink"}`}>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, email, subject…" className="rounded-full pl-10" />
      </div>

      {!isLoading && <p className="text-sm text-muted">{filtered.length} message{filtered.length !== 1 ? "s" : ""} found</p>}

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-line text-sm">
            <thead>
              <tr className="bg-canvas">
                {["Customer", "Subject", "Message Preview", "Status", "Received", ""].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line bg-surface">
              {isLoading ? Array.from({ length: 6 }).map((_, i) => (
                <tr key={i}>{Array.from({ length: 6 }).map((_, j) => <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-full" /></td>)}</tr>
              )) : filtered.map((enq, i) => (
                <motion.tr key={enq.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                  className="group cursor-pointer hover:bg-canvas" onClick={() => setSelected(enq)}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 shrink-0"><AvatarFallback className="bg-canvas-dim text-xs">{initials(enq.fullName)}</AvatarFallback></Avatar>
                      <div>
                        <div className="font-medium text-ink">{enq.fullName}</div>
                        <div className="text-xs text-muted">{enq.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${SUBJECT_COLORS[enq.subject] ?? ""}`}>{enq.subject}</span>
                  </td>
                  <td className="px-4 py-3 max-w-xs">
                    <p className="truncate text-muted">{enq.message}</p>
                  </td>
                  <td className="px-4 py-3"><Badge variant={STATUS_BADGE[enq.status]}>{enq.status.charAt(0).toUpperCase() + enq.status.slice(1)}</Badge></td>
                  <td className="px-4 py-3 text-muted">{formatRelativeTime(enq.createdAt)}</td>
                  <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <a href={`tel:${enq.phone}`} className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-canvas-dim"><Phone className="h-4 w-4 text-muted" /></a>
                      <a href={`mailto:${enq.email}`} className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-canvas-dim"><Mail className="h-4 w-4 text-muted" /></a>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="flex h-8 items-center gap-1 rounded-full px-2 text-xs font-medium text-muted hover:bg-canvas-dim hover:text-ink">Move <ChevronDown className="h-3 w-3" /></button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {(["new","read","replied","closed"] as CustomerEnquiryStatus[]).filter((s) => s !== enq.status).map((s) => (
                            <DropdownMenuItem key={s} onClick={() => updateStatus.mutate({ id: enq.id, status: s })}>{s.charAt(0).toUpperCase() + s.slice(1)}</DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={Boolean(selected)} onOpenChange={() => setSelected(null)}>
        {selected && (
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <Avatar className="h-10 w-10"><AvatarFallback className="bg-canvas-dim">{initials(selected.fullName)}</AvatarFallback></Avatar>
                <div>{selected.fullName}<div className="text-sm font-normal text-muted">{selected.email}</div></div>
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  ["Phone", selected.phone], ["Email", selected.email],
                  ["Subject", selected.subject], ["Status", selected.status.charAt(0).toUpperCase() + selected.status.slice(1)],
                  ["Received", formatRelativeTime(selected.createdAt)],
                ].map(([label, value]) => (
                  <div key={label}><div className="text-xs uppercase tracking-wide text-muted">{label}</div><div className="mt-0.5 font-medium text-ink">{value}</div></div>
                ))}
              </div>
              <div>
                <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted"><MessageSquare className="h-3.5 w-3.5" /> Message</div>
                <div className="rounded-xl bg-canvas p-4 text-sm leading-relaxed text-ink">{selected.message}</div>
              </div>
              <div className="flex gap-2">
                <Button asChild variant="outline" className="flex-1 gap-2"><a href={`tel:${selected.phone}`}><Phone className="h-4 w-4" /> Call</a></Button>
                <Button asChild variant="accent" className="flex-1 gap-2"><a href={`mailto:${selected.email}`}><Mail className="h-4 w-4" /> Reply Email</a></Button>
              </div>
              <div className="flex gap-2 flex-wrap">
                {(["new","read","replied","closed"] as CustomerEnquiryStatus[]).filter((s) => s !== selected.status).map((s) => (
                  <Button key={s} variant="outline" size="sm" onClick={() => updateStatus.mutate({ id: selected.id, status: s })}>
                    Mark as {s.charAt(0).toUpperCase() + s.slice(1)}
                  </Button>
                ))}
              </div>
              <Button variant="ghost" size="sm" className="w-full text-xs text-danger hover:text-danger"
                onClick={() => { if (confirm(`Remove message from ${selected.fullName}?`)) deleteEnq.mutate(selected.id, { onSuccess: () => setSelected(null) }); }}>
                Remove this message
              </Button>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
