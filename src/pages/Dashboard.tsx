import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Bike, MessageSquare, RefreshCw } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useCustomerEnquiries } from "@/hooks/useCustomerEnquiry";
import { useSellEnquiries } from "@/hooks/useSellEnquiry";
import { useAuth } from "@/context/AuthContext";
import { initials, formatRelativeTime } from "@/lib/utils";
import type { CustomerEnquiryStatus, SellEnquiryStatus } from "@/types";

const CUST_STATUS_BADGE: Record<CustomerEnquiryStatus, React.ComponentProps<typeof Badge>["variant"]> = {
  new: "accent", read: "default", replied: "ok", closed: "outline",
};
const SELL_STATUS_BADGE: Record<SellEnquiryStatus, React.ComponentProps<typeof Badge>["variant"]> = {
  new: "accent", contacted: "default", appraised: "warn", deal_closed: "ok", declined: "outline",
};

function statusLabel(s: SellEnquiryStatus) {
  return s === "deal_closed" ? "Closed" : s.charAt(0).toUpperCase() + s.slice(1);
}

export default function Dashboard() {
  const { user } = useAuth();
  const { data: customerEnquiries, isLoading: ceLoading } = useCustomerEnquiries();
  const { data: sellEnquiries, isLoading: seLoading } = useSellEnquiries();

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  })();

  // New Leads = unread/new customer enquiries (from contact form)
  const newLeads = (customerEnquiries ?? []).filter((e) => e.status === "new");
  // Follow-ups = sell enquiries that need follow-up (new or contacted)
  const followUps = (sellEnquiries ?? []).filter((e) => e.status === "new" || e.status === "contacted");

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        description={`${greeting}, ${user?.name?.split(" ")[0]}. Here's what's happening today.`}
        actions={
          <Button asChild size="sm" variant="accent">
            <Link to="/inventory/new"><Bike className="h-4 w-4" /> Add Bike</Link>
          </Button>
        }
      />

      {/* ── Summary Cards ─────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: "New Leads",
            value: ceLoading ? "—" : String(newLeads.length),
            sub: "Unread customer messages",
            icon: MessageSquare,
            color: "text-blue-500",
            bg: "bg-blue-50 dark:bg-blue-900/20",
            link: "/customer-enquiry",
          },
          {
            label: "Sell Follow-ups",
            value: seLoading ? "—" : String(followUps.length),
            sub: "Pending valuation requests",
            icon: RefreshCw,
            color: "text-amber-500",
            bg: "bg-amber-50 dark:bg-amber-900/20",
            link: "/sell-enquiry",
          },
          {
            label: "Total Enquiries",
            value: ceLoading ? "—" : String((customerEnquiries ?? []).length),
            sub: "All customer messages",
            icon: MessageSquare,
            color: "text-ink",
            bg: "bg-canvas-dim",
            link: "/customer-enquiry",
          },
          {
            label: "Sell Requests",
            value: seLoading ? "—" : String((sellEnquiries ?? []).length),
            sub: "All sell/valuation requests",
            icon: Bike,
            color: "text-ink",
            bg: "bg-canvas-dim",
            link: "/sell-enquiry",
          },
        ].map((card, i) => (
          <motion.div key={card.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <Link to={card.link}>
              <Card className="cursor-pointer transition-shadow hover:shadow-md">
                <CardContent className="pt-5">
                  <div className={`inline-flex rounded-xl p-2.5 ${card.bg}`}>
                    <card.icon className={`h-5 w-5 ${card.color}`} />
                  </div>
                  <div className="mt-3 font-display text-3xl font-bold text-ink">{card.value}</div>
                  <div className="mt-0.5 text-sm font-semibold text-ink">{card.label}</div>
                  <div className="mt-0.5 text-xs text-muted">{card.sub}</div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* ── New Leads (Customer Enquiries) ────────────────────────── */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-bold tracking-tight text-ink">New Leads</h2>
          <Button asChild variant="ghost" size="sm" className="h-8 gap-1 text-xs">
            <Link to="/customer-enquiry">See all <ArrowRight className="h-3.5 w-3.5" /></Link>
          </Button>
        </div>

        {ceLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-36 rounded-card" />)}
          </div>
        ) : newLeads.length === 0 ? (
          <div className="rounded-card border border-dashed border-line p-10 text-center text-sm text-muted">
            No new customer enquiries at the moment 🎉
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {newLeads.slice(0, 6).map((enq, i) => (
              <motion.div key={enq.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <Link to="/customer-enquiry">
                  <Card className="cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5">
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-9 w-9 shrink-0">
                          <AvatarFallback className="bg-blue-100 text-blue-700 text-xs font-bold">{initials(enq.fullName)}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <div className="truncate font-semibold text-sm text-ink">{enq.fullName}</div>
                            <Badge variant={CUST_STATUS_BADGE[enq.status]} className="shrink-0 text-[10px]">{enq.status}</Badge>
                          </div>
                          <div className="mt-0.5 text-xs font-medium text-blue-600">{enq.subject}</div>
                          <p className="mt-1 line-clamp-2 text-xs text-muted">{enq.message}</p>
                          <div className="mt-2 text-[10px] text-muted">{formatRelativeTime(enq.createdAt)}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* ── Follow-ups (Sell Enquiries) ────────────────────────────── */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-bold tracking-tight text-ink">Follow-ups</h2>
          <Button asChild variant="ghost" size="sm" className="h-8 gap-1 text-xs">
            <Link to="/sell-enquiry">See all <ArrowRight className="h-3.5 w-3.5" /></Link>
          </Button>
        </div>

        {seLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-card" />)}
          </div>
        ) : followUps.length === 0 ? (
          <div className="rounded-card border border-dashed border-line p-10 text-center text-sm text-muted">
            No pending sell enquiry follow-ups 🎉
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {followUps.slice(0, 8).map((enq, i) => (
              <motion.div key={enq.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <Link to="/sell-enquiry">
                  <Card className="cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5">
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <Avatar className="h-8 w-8 shrink-0">
                          <AvatarFallback className="bg-amber-100 text-amber-700 text-xs font-bold">{initials(enq.fullName)}</AvatarFallback>
                        </Avatar>
                        <Badge variant={SELL_STATUS_BADGE[enq.status]} className="text-[10px]">{statusLabel(enq.status)}</Badge>
                      </div>
                      <div className="font-semibold text-sm text-ink leading-tight">{enq.fullName}</div>
                      <div className="mt-0.5 text-xs font-medium text-amber-600">{enq.brand} {enq.model} {enq.year}</div>
                      <div className="mt-1 text-xs text-muted">{enq.condition} · RM {enq.askingPrice.toLocaleString()}</div>
                      <div className="mt-2 text-[10px] text-muted">{formatRelativeTime(enq.createdAt)}</div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
