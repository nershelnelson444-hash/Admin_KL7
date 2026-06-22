import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Plus, ChevronDown, Phone, MessageCircle } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLeads, useUpdateLeadStatus, useDeleteLead } from "@/hooks/useLeads";
import { useDebounce } from "@/hooks/useDebounce";
import { initials, formatRelativeTime, formatCurrencyINR } from "@/lib/utils";
import type { Lead, LeadStatus, Showroom } from "@/types";
import { cn } from "@/lib/utils";

const STATUS_TABS: { value: LeadStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "qualified", label: "Qualified" },
  { value: "negotiating", label: "Negotiating" },
  { value: "converted", label: "Converted" },
  { value: "lost", label: "Lost" },
];

const STATUS_BADGE: Record<LeadStatus, React.ComponentProps<typeof Badge>["variant"]> = {
  new: "accent",
  contacted: "default",
  qualified: "warn",
  negotiating: "ember",
  converted: "ok",
  lost: "outline",
};

const INTEREST_COLOR: Record<Lead["interest"], string> = {
  Hot: "text-ember",
  Warm: "text-warn",
  Cold: "text-muted",
};

export default function Leads() {
  const [search, setSearch] = useState("");
  const [statusTab, setStatusTab] = useState<LeadStatus | "all">("all");
  const [interest, setInterest] = useState<Lead["interest"] | "all">("all");
  const [showroom, setShowroom] = useState<Showroom | "all">("all");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const debouncedSearch = useDebounce(search, 300);
  const { data: leads, isLoading } = useLeads({
    search: debouncedSearch || undefined,
    status: statusTab,
    interest,
    showroom,
  });
  const updateStatus = useUpdateLeadStatus();
  const deleteLead = useDeleteLead();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leads"
        description="Track prospects across both showrooms"
        actions={
          <Button variant="accent" size="sm">
            <Plus className="h-4 w-4" /> Add Lead
          </Button>
        }
      />

      {/* Status tabs */}
      <div className="flex flex-wrap gap-2">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatusTab(tab.value)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              statusTab === tab.value
                ? "bg-ink text-white"
                : "bg-surface text-muted shadow-soft hover:bg-canvas-dim hover:text-ink"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, phone, email…"
            className="rounded-full pl-10"
          />
        </div>
        <Select value={interest} onValueChange={(v) => setInterest(v as Lead["interest"] | "all")}>
          <SelectTrigger className="w-[140px] rounded-full">
            <SelectValue placeholder="Interest" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Interest</SelectItem>
            <SelectItem value="Hot">Hot 🔥</SelectItem>
            <SelectItem value="Warm">Warm</SelectItem>
            <SelectItem value="Cold">Cold</SelectItem>
          </SelectContent>
        </Select>
        <Select value={showroom} onValueChange={(v) => setShowroom(v as Showroom | "all")}>
          <SelectTrigger className="w-[150px] rounded-full">
            <SelectValue placeholder="Showroom" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Showrooms</SelectItem>
            <SelectItem value="Ernakulam">Ernakulam</SelectItem>
            <SelectItem value="Aluva">Aluva</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {!isLoading && (
        <p className="text-sm text-muted">{leads?.length ?? 0} leads found</p>
      )}

      {/* Leads table */}
      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-line text-sm">
            <thead>
              <tr className="bg-canvas">
                {["Lead", "Interested In", "Budget", "Source", "Interest", "Status", "Last Contact", ""].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line bg-surface">
              {isLoading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 8 }).map((_, j) => (
                        <td key={j} className="px-4 py-3">
                          <Skeleton className="h-4 w-full" />
                        </td>
                      ))}
                    </tr>
                  ))
                : (leads ?? []).map((lead, i) => (
                    <motion.tr
                      key={lead.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.02 }}
                      className="group cursor-pointer hover:bg-canvas"
                      onClick={() => setSelectedLead(lead)}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9 shrink-0">
                            <AvatarFallback className="bg-canvas-dim text-xs">
                              {initials(lead.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-ink">{lead.name}</div>
                            <div className="text-xs text-muted">{lead.phone}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-ink">
                        {lead.interestedBikeName ?? "—"}
                        <div className="text-xs text-muted">{lead.showroom}</div>
                      </td>
                      <td className="px-4 py-3 font-display font-bold text-ink">
                        {lead.budget ? formatCurrencyINR(lead.budget) : "—"}
                      </td>
                      <td className="px-4 py-3 text-muted">{lead.source}</td>
                      <td className="px-4 py-3">
                        <span className={cn("font-semibold", INTEREST_COLOR[lead.interest])}>
                          {lead.interest}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={STATUS_BADGE[lead.status]}>
                          {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-muted">{formatRelativeTime(lead.lastContact)}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                          <a href={`tel:${lead.phone}`} className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-canvas-dim">
                            <Phone className="h-4 w-4 text-muted" />
                          </a>
                          <a href={`https://wa.me/${lead.phone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-canvas-dim">
                            <MessageCircle className="h-4 w-4 text-muted" />
                          </a>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="flex h-8 items-center gap-1 rounded-full px-2 text-xs font-medium text-muted hover:bg-canvas-dim hover:text-ink">
                                Move <ChevronDown className="h-3 w-3" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {(["new", "contacted", "qualified", "negotiating", "converted", "lost"] as LeadStatus[])
                                .filter((s) => s !== lead.status)
                                .map((s) => (
                                  <DropdownMenuItem
                                    key={s}
                                    onClick={() => updateStatus.mutate({ id: lead.id, status: s })}
                                  >
                                    {s.charAt(0).toUpperCase() + s.slice(1)}
                                  </DropdownMenuItem>
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

      {/* Lead detail dialog */}
      <Dialog open={Boolean(selectedLead)} onOpenChange={() => setSelectedLead(null)}>
        {selectedLead && (
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-canvas-dim">{initials(selectedLead.name)}</AvatarFallback>
                </Avatar>
                <div>
                  {selectedLead.name}
                  <div className="text-sm font-normal text-muted">{selectedLead.email}</div>
                </div>
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  { label: "Phone", value: selectedLead.phone },
                  { label: "Showroom", value: selectedLead.showroom },
                  { label: "Source", value: selectedLead.source },
                  { label: "Interest", value: selectedLead.interest },
                  { label: "Budget", value: selectedLead.budget ? formatCurrencyINR(selectedLead.budget) : "—" },
                  { label: "Assigned to", value: selectedLead.assignedTo ?? "—" },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <div className="text-xs uppercase tracking-wide text-muted">{label}</div>
                    <div className="mt-0.5 font-medium text-ink">{value}</div>
                  </div>
                ))}
              </div>
              {selectedLead.interestedBikeName && (
                <div>
                  <div className="text-xs uppercase tracking-wide text-muted">Interested In</div>
                  <div className="mt-0.5 font-medium text-ink">{selectedLead.interestedBikeName}</div>
                </div>
              )}
              {selectedLead.notes && (
                <div>
                  <div className="text-xs uppercase tracking-wide text-muted">Notes</div>
                  <div className="mt-0.5 text-sm text-ink">{selectedLead.notes}</div>
                </div>
              )}
              <div className="flex gap-2 pt-2">
                <Button asChild variant="outline" className="flex-1 gap-2">
                  <a href={`tel:${selectedLead.phone}`}>
                    <Phone className="h-4 w-4" /> Call
                  </a>
                </Button>
                <Button asChild variant="accent" className="flex-1 gap-2">
                  <a href={`https://wa.me/${selectedLead.phone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer">
                    <MessageCircle className="h-4 w-4" /> WhatsApp
                  </a>
                </Button>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs text-danger hover:text-danger"
                onClick={() => {
                  if (confirm(`Remove ${selectedLead.name}?`)) {
                    deleteLead.mutate(selectedLead.id, { onSuccess: () => setSelectedLead(null) });
                  }
                }}
              >
                Remove this lead
              </Button>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
