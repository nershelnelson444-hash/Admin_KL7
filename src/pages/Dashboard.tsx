import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Package,
  Users,
  Flame,
  TrendingUp,
  ArrowRight,
  Bike,
  IndianRupee,
  Timer,
  BarChart2,
} from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { SalesTrendChart } from "@/components/dashboard/SalesTrendChart";
import { BrandChart } from "@/components/dashboard/BrandChart";
import { LeadMiniCard } from "@/components/dashboard/LeadMiniCard";
import { FollowUpCard } from "@/components/dashboard/FollowUpCard";
import { SpeedGauge } from "@/components/dashboard/SpeedGauge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDashboardStats, useSalesTrend, useBrandBreakdown } from "@/hooks/useDashboard";
import { useLeads } from "@/hooks/useLeads";
import { useAuth } from "@/context/AuthContext";
import { formatCurrencyINR } from "@/lib/utils";

const ACTION_TYPES = ["Call", "Test Ride", "Quote"] as const;

export default function Dashboard() {
  const { user } = useAuth();
  const [leadFilter, setLeadFilter] = useState<"All" | "Hot" | "Warm" | "Cold">("All");

  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: salesTrend, isLoading: trendLoading } = useSalesTrend();
  const { data: brands, isLoading: brandsLoading } = useBrandBreakdown();
  const { data: leads, isLoading: leadsLoading } = useLeads({ status: "new" });

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  })();

  const filteredLeads = (leads ?? []).filter(
    (l) => leadFilter === "All" || l.interest === leadFilter
  ).slice(0, 6);

  const followUpLeads = (leads ?? []).slice(0, 4);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        description={`${greeting}, ${user?.name?.split(" ")[0]}. Here's what's happening today.`}
        actions={
          <Button asChild size="sm" variant="accent">
            <Link to="/inventory/new">
              <Bike className="h-4 w-4" /> Add Bike
            </Link>
          </Button>
        }
        stats={
          statsLoading
            ? undefined
            : [
                { label: "Available", value: stats?.available ?? 0, tone: "ok" },
                { label: "Sold this month", value: stats?.sold ?? 0 },
                { label: "Reserved", value: stats?.reserved ?? 0 },
              ]
        }
      />

      {/* ── Instrument cluster ─────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="overflow-hidden rounded-card bg-ink text-white"
      >
        <div className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:gap-8">
          <div className="flex justify-center sm:w-52 sm:shrink-0">
            {statsLoading ? (
              <div className="h-52 w-52 rounded-full bg-white/5" />
            ) : (
              <SpeedGauge
                value={stats?.inventoryHealthPct ?? 0}
                label="Inventory Health"
                sublabel={`${stats?.available ?? 0} of ${stats?.totalInventory ?? 0} bikes available`}
              />
            )}
          </div>

          <div className="grid flex-1 grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: IndianRupee,
                label: "Total Stock Value",
                value: statsLoading ? "—" : formatCurrencyINR(
                  (stats?.totalInventory ?? 0) * 165000
                ),
              },
              {
                icon: IndianRupee,
                label: "Month Revenue",
                value: statsLoading ? "—" : formatCurrencyINR(stats?.monthRevenue ?? 0),
              },
              {
                icon: Timer,
                label: "Avg. Days to Sell",
                value: statsLoading ? "—" : `${stats?.avgDaysToSell ?? 0} days`,
              },
              {
                icon: BarChart2,
                label: "Conversion Rate",
                value: statsLoading ? "—" : `${stats?.conversionRate ?? 0}%`,
              },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="rounded-xl bg-white/5 p-4">
                <Icon className="mb-3 h-5 w-5 text-white/40" />
                <div className="font-display text-xl font-bold tracking-tight text-lime">{value}</div>
                <div className="mt-0.5 text-xs text-white/50">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ── Stat cards ─────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statsLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="p-5">
                <Skeleton className="h-10 w-10 rounded-xl" />
                <Skeleton className="mt-4 h-7 w-24" />
                <Skeleton className="mt-1 h-4 w-32" />
              </Card>
            ))
          : [
              {
                label: "Total Inventory",
                value: String(stats?.totalInventory ?? 0),
                icon: Package,
                accent: "ink" as const,
              },
              {
                label: "Active Leads",
                value: String(stats?.activeLeads ?? 0),
                icon: Users,
                accent: "ink" as const,
                delta: { value: "+4 this week", positive: true },
              },
              {
                label: "Hot Leads",
                value: String(stats?.hotLeads ?? 0),
                icon: Flame,
                accent: "ember" as const,
              },
              {
                label: "Month Revenue",
                value: formatCurrencyINR(stats?.monthRevenue ?? 0),
                icon: TrendingUp,
                accent: "lime" as const,
                delta: { value: `+${stats?.revenueDelta ?? 0}%`, positive: true },
              },
            ].map((card, i) => (
              <StatCard key={card.label} {...card} index={i} />
            ))}
      </div>

      {/* ── Charts ─────────────────────────────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold">Sales Trend</CardTitle>
            <span className="text-xs text-muted">Last 6 months</span>
          </CardHeader>
          <CardContent>
            {trendLoading ? (
              <Skeleton className="h-60 w-full rounded-xl" />
            ) : (
              <SalesTrendChart data={salesTrend ?? []} />
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold">Top Brands</CardTitle>
            <Button asChild variant="ghost" size="sm" className="h-7 px-2 text-xs">
              <Link to="/inventory">View all</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {brandsLoading ? (
              <Skeleton className="h-60 w-full rounded-xl" />
            ) : (
              <BrandChart data={brands ?? []} />
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── New Leads ──────────────────────────────────────────── */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-bold tracking-tight text-ink">New Leads</h2>
          <div className="flex items-center gap-3">
            <Tabs value={leadFilter} onValueChange={(v) => setLeadFilter(v as typeof leadFilter)}>
              <TabsList className="h-8">
                {(["All", "Hot", "Warm", "Cold"] as const).map((f) => (
                  <TabsTrigger key={f} value={f} className="h-6 px-2.5 text-xs">
                    {f}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
            <Button asChild variant="ghost" size="sm" className="h-8 gap-1 text-xs">
              <Link to="/leads">
                See all <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </div>

        {leadsLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-44 rounded-card" />
            ))}
          </div>
        ) : filteredLeads.length === 0 ? (
          <div className="rounded-card border border-dashed border-line p-10 text-center text-sm text-muted">
            No {leadFilter !== "All" ? leadFilter.toLowerCase() : ""} leads at the moment.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredLeads.map((lead, i) => (
              <LeadMiniCard key={lead.id} lead={lead} index={i} />
            ))}
          </div>
        )}
      </div>

      {/* ── Today's Follow-ups ─────────────────────────────────── */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-bold tracking-tight text-ink">Today's Follow-ups</h2>
          <Button asChild variant="ghost" size="sm" className="h-8 gap-1 text-xs">
            <Link to="/leads">
              See all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>

        {leadsLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-48 rounded-card" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {followUpLeads.map((lead, i) => (
              <FollowUpCard
                key={lead.id}
                lead={lead}
                actionType={ACTION_TYPES[i % ACTION_TYPES.length]}
                time={new Date(Date.now() + 1000 * 60 * 60 * (i + 1)).toISOString()}
                highlight={i === 0}
                index={i}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
