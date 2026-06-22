import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Phone, MessageCircle, ChevronDown, Bike, User } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useSellEnquiries, useUpdateSellEnquiryStatus, useDeleteSellEnquiry } from "@/hooks/useSellEnquiry";
import { useDebounce } from "@/hooks/useDebounce";
import { initials, formatRelativeTime } from "@/lib/utils";
import type { SellEnquiry, SellEnquiryStatus } from "@/types";
import { cn } from "@/lib/utils";

const STATUS_TABS: { value: SellEnquiryStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "appraised", label: "Appraised" },
  { value: "deal_closed", label: "Deal Closed" },
  { value: "declined", label: "Declined" },
];

const STATUS_BADGE: Record<SellEnquiryStatus, React.ComponentProps<typeof Badge>["variant"]> = {
  new: "accent", contacted: "default", appraised: "warn", deal_closed: "ok", declined: "outline",
};

const COND_COLOR: Record<string, string> = {
  New: "text-green-500", "Like New": "text-lime-500", Good: "text-yellow-500", Fair: "text-orange-400",
};

function statusLabel(s: SellEnquiryStatus) {
  return s === "deal_closed" ? "Deal Closed" : s.charAt(0).toUpperCase() + s.slice(1);
}

export default function SellEnquiryPage() {
  const [search, setSearch] = useState("");
  const [statusTab, setStatusTab] = useState<SellEnquiryStatus | "all">("all");
  const [selected, setSelected] = useState<SellEnquiry | null>(null);

  const debouncedSearch = useDebounce(search, 300);
  const { data: enquiries, isLoading } = useSellEnquiries();
  const updateStatus = useUpdateSellEnquiryStatus();
  const deleteEnq = useDeleteSellEnquiry();

  const filtered = (enquiries ?? [])
    .filter((e) => statusTab === "all" || e.status === statusTab)
    .filter((e) => {
      if (!debouncedSearch) return true;
      const q = debouncedSearch.toLowerCase();
      return [e.fullName, e.email, e.phone, e.brand, e.model].some((v) => v.toLowerCase().includes(q));
    });

  return (
    <div className="space-y-6">
      <PageHeader title="Sell Enquiries" description="Valuation requests from customers looking to sell their bikes" />

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
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, phone, brand…" className="rounded-full pl-10" />
      </div>

      {!isLoading && <p className="text-sm text-muted">{filtered.length} enquir{filtered.length !== 1 ? "ies" : "y"} found</p>}

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-line text-sm">
            <thead>
              <tr className="bg-canvas">
                {["Seller", "Bike", "Condition", "Asking Price", "Via", "Status", "Received", ""].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line bg-surface">
              {isLoading ? Array.from({ length: 6 }).map((_, i) => (
                <tr key={i}>{Array.from({ length: 8 }).map((_, j) => <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-full" /></td>)}</tr>
              )) : filtered.map((enq, i) => (
                <motion.tr key={enq.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                  className="group cursor-pointer hover:bg-canvas" onClick={() => setSelected(enq)}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 shrink-0"><AvatarFallback className="bg-canvas-dim text-xs">{initials(enq.fullName)}</AvatarFallback></Avatar>
                      <div><div className="font-medium text-ink">{enq.fullName}</div><div className="text-xs text-muted">{enq.phone}</div></div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-ink">{enq.brand} {enq.model}</div>
                    <div className="text-xs text-muted">{enq.year} · {enq.engineCC}cc · {enq.bikeType}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn("font-semibold", COND_COLOR[enq.condition])}>{enq.condition}</span>
                    <div className="text-xs text-muted">{enq.mileage.toLocaleString()} km</div>
                  </td>
                  <td className="px-4 py-3 font-display font-bold text-ink">RM {enq.askingPrice.toLocaleString()}</td>
                  <td className="px-4 py-3 text-xs text-muted">{enq.preferredContact}</td>
                  <td className="px-4 py-3"><Badge variant={STATUS_BADGE[enq.status]}>{statusLabel(enq.status)}</Badge></td>
                  <td className="px-4 py-3 text-muted">{formatRelativeTime(enq.createdAt)}</td>
                  <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <a href={`tel:${enq.phone}`} className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-canvas-dim"><Phone className="h-4 w-4 text-muted" /></a>
                      <a href={`https://wa.me/${enq.phone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-canvas-dim"><MessageCircle className="h-4 w-4 text-muted" /></a>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="flex h-8 items-center gap-1 rounded-full px-2 text-xs font-medium text-muted hover:bg-canvas-dim hover:text-ink">Move <ChevronDown className="h-3 w-3" /></button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {(["new","contacted","appraised","deal_closed","declined"] as SellEnquiryStatus[]).filter((s) => s !== enq.status).map((s) => (
                            <DropdownMenuItem key={s} onClick={() => updateStatus.mutate({ id: enq.id, status: s })}>{statusLabel(s)}</DropdownMenuItem>
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
              <div className="rounded-xl bg-canvas p-4">
                <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted"><Bike className="h-3.5 w-3.5" /> Bike Details</div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {[
                    ["Brand / Make", selected.brand], ["Model", selected.model],
                    ["Year", String(selected.year)], ["Mileage", `${selected.mileage.toLocaleString()} km`],
                    ["Engine", `${selected.engineCC}cc`], ["Bike Type", selected.bikeType],
                    ["Condition", selected.condition], ["Asking Price", `RM ${selected.askingPrice.toLocaleString()}`],
                  ].map(([label, value]) => (
                    <div key={label}><div className="text-xs uppercase tracking-wide text-muted">{label}</div><div className="mt-0.5 font-medium text-ink">{value}</div></div>
                  ))}
                </div>
              </div>
              <div className="rounded-xl bg-canvas p-4">
                <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted"><User className="h-3.5 w-3.5" /> Contact</div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {[
                    ["Phone", selected.phone], ["Email", selected.email],
                    ["Preferred Contact", selected.preferredContact], ["Status", statusLabel(selected.status)],
                  ].map(([label, value]) => (
                    <div key={label}><div className="text-xs uppercase tracking-wide text-muted">{label}</div><div className="mt-0.5 font-medium text-ink">{value}</div></div>
                  ))}
                </div>
              </div>
              {selected.notes && (
                <div>
                  <div className="text-xs uppercase tracking-wide text-muted">Additional Notes</div>
                  <div className="mt-1 rounded-xl bg-canvas p-3 text-sm text-ink">{selected.notes}</div>
                </div>
              )}
              <div className="flex gap-2">
                <Button asChild variant="outline" className="flex-1 gap-2"><a href={`tel:${selected.phone}`}><Phone className="h-4 w-4" /> Call</a></Button>
                <Button asChild variant="accent" className="flex-1 gap-2"><a href={`https://wa.me/${selected.phone.replace(/\D/g,"")}`} target="_blank" rel="noreferrer"><MessageCircle className="h-4 w-4" /> WhatsApp</a></Button>
              </div>
              <Button variant="ghost" size="sm" className="w-full text-xs text-danger hover:text-danger"
                onClick={() => { if (confirm(`Remove enquiry from ${selected.fullName}?`)) deleteEnq.mutate(selected.id, { onSuccess: () => setSelected(null) }); }}>
                Remove this enquiry
              </Button>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
