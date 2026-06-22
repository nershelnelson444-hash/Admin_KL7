import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Plus,
  Search,
  Grid3X3,
  List,
  Bike,
  MapPin,
  Gauge,
  MoreHorizontal,
  Pencil,
  Trash2,
  CheckCircle2,
} from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useBikes, useBikeBrands, useUpdateBikeStatus, useDeleteBike } from "@/hooks/useBikes";
import { useDebounce } from "@/hooks/useDebounce";
import { formatCurrencyINR } from "@/lib/utils";
import type { BikeStatus, Showroom } from "@/types";

const STATUS_TABS: { value: BikeStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "available", label: "Available" },
  { value: "reserved", label: "Reserved" },
  { value: "sold", label: "Sold" },
  { value: "draft", label: "Draft" },
];

const STATUS_BADGE: Record<BikeStatus, React.ComponentProps<typeof Badge>["variant"]> = {
  available: "ok",
  reserved: "warn",
  sold: "dark",
  draft: "outline",
};

export default function Inventory() {
  const [search, setSearch] = useState("");
  const [statusTab, setStatusTab] = useState<BikeStatus | "all">("all");
  const [showroom, setShowroom] = useState<Showroom | "all">("all");
  const [brand, setBrand] = useState("all");
  const [sort, setSort] = useState<"newest" | "price-asc" | "price-desc" | "year-desc">("newest");
  const [view, setView] = useState<"grid" | "table">("grid");

  const debouncedSearch = useDebounce(search, 300);
  const { data: bikes, isLoading } = useBikes({
    search: debouncedSearch || undefined,
    status: statusTab,
    showroom,
    brand,
    sort,
  });
  const { data: brands } = useBikeBrands();
  const updateStatus = useUpdateBikeStatus();
  const deleteBike = useDeleteBike();

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Remove ${name} from inventory?`)) deleteBike.mutate(id);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventory"
        description="Manage bikes across both showrooms"
        actions={
          <Button asChild size="sm" variant="accent">
            <Link to="/inventory/new">
              <Plus className="h-4 w-4" /> Add Bike
            </Link>
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

      {/* Filters bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search brand, model, colour…"
            className="rounded-full pl-10"
          />
        </div>

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

        <Select value={brand} onValueChange={setBrand}>
          <SelectTrigger className="w-[150px] rounded-full">
            <SelectValue placeholder="Brand" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Brands</SelectItem>
            {(brands ?? []).map((b) => (
              <SelectItem key={b} value={b}>{b}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sort} onValueChange={(v) => setSort(v as typeof sort)}>
          <SelectTrigger className="w-[150px] rounded-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest first</SelectItem>
            <SelectItem value="price-asc">Price: Low → High</SelectItem>
            <SelectItem value="price-desc">Price: High → Low</SelectItem>
            <SelectItem value="year-desc">Year: Newest</SelectItem>
          </SelectContent>
        </Select>

        <div className="ml-auto flex gap-1">
          <button
            onClick={() => setView("grid")}
            className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${view === "grid" ? "bg-ink text-white" : "bg-surface text-muted shadow-soft hover:text-ink"}`}
          >
            <Grid3X3 className="h-4 w-4" />
          </button>
          <button
            onClick={() => setView("table")}
            className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${view === "table" ? "bg-ink text-white" : "bg-surface text-muted shadow-soft hover:text-ink"}`}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Results count */}
      {!isLoading && (
        <p className="text-sm text-muted">
          {bikes?.length ?? 0} bike{bikes?.length !== 1 ? "s" : ""} found
        </p>
      )}

      {/* Grid view */}
      {view === "grid" && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-72 rounded-card" />
              ))
            : (bikes ?? []).map((bike, i) => (
                <motion.div
                  key={bike.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.025 }}
                >
                  <Card className="overflow-hidden p-0">
                    <div className="relative">
                      <img
                        src={bike.images[0]}
                        alt={`${bike.brand} ${bike.model}`}
                        className="h-44 w-full object-cover"
                        loading="lazy"
                      />
                      <div className="absolute right-3 top-3">
                        <Badge variant={STATUS_BADGE[bike.status]}>
                          {bike.status.charAt(0).toUpperCase() + bike.status.slice(1)}
                        </Badge>
                      </div>
                      {bike.featured && (
                        <div className="absolute left-3 top-3 rounded-full bg-lime px-2 py-0.5 text-xs font-bold text-lime-ink">
                          Featured
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-display text-sm font-bold leading-tight text-ink">
                            {bike.brand} {bike.model}
                          </div>
                          <div className="mt-0.5 text-xs text-muted">{bike.year} · {bike.color}</div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full hover:bg-canvas-dim">
                              <MoreHorizontal className="h-4 w-4" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link to={`/inventory/${bike.id}/edit`} className="flex items-center gap-2">
                                <Pencil className="h-4 w-4" /> Edit
                              </Link>
                            </DropdownMenuItem>
                            {bike.status === "available" && (
                              <DropdownMenuItem
                                onClick={() => updateStatus.mutate({ id: bike.id, status: "reserved" })}
                                className="flex items-center gap-2"
                              >
                                <CheckCircle2 className="h-4 w-4" /> Mark Reserved
                              </DropdownMenuItem>
                            )}
                            {bike.status === "reserved" && (
                              <DropdownMenuItem
                                onClick={() => updateStatus.mutate({ id: bike.id, status: "sold" })}
                                className="flex items-center gap-2"
                              >
                                <CheckCircle2 className="h-4 w-4" /> Mark Sold
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDelete(bike.id, `${bike.brand} ${bike.model}`)}
                              className="flex items-center gap-2 text-danger focus:text-danger"
                            >
                              <Trash2 className="h-4 w-4" /> Remove
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        <div className="font-display text-lg font-bold text-ink">
                          {formatCurrencyINR(bike.price)}
                        </div>
                      </div>

                      <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted">
                        <span className="flex items-center gap-1">
                          <Gauge className="h-3.5 w-3.5" />
                          {bike.odometer.toLocaleString("en-IN")} km
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {bike.showroom}
                        </span>
                        <span className="flex items-center gap-1">
                          <Bike className="h-3.5 w-3.5" />
                          {bike.owners} owner{bike.owners > 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
        </div>
      )}

      {/* Table view */}
      {view === "table" && (
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-line text-sm">
              <thead>
                <tr className="bg-canvas">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">Bike</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">Year</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">Showroom</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">Odometer</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">Price</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-line bg-surface">
                {isLoading
                  ? Array.from({ length: 6 }).map((_, i) => (
                      <tr key={i}>
                        {Array.from({ length: 7 }).map((_, j) => (
                          <td key={j} className="px-4 py-3">
                            <Skeleton className="h-4 w-full" />
                          </td>
                        ))}
                      </tr>
                    ))
                  : (bikes ?? []).map((bike) => (
                      <tr key={bike.id} className="group hover:bg-canvas">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={bike.images[0]}
                              alt=""
                              className="h-10 w-14 rounded-lg object-cover"
                            />
                            <div>
                              <div className="font-semibold text-ink">
                                {bike.brand} {bike.model}
                              </div>
                              <div className="text-xs text-muted">{bike.color}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-ink">{bike.year}</td>
                        <td className="px-4 py-3 text-ink">{bike.showroom}</td>
                        <td className="px-4 py-3 text-ink">{bike.odometer.toLocaleString("en-IN")} km</td>
                        <td className="px-4 py-3 font-display font-bold text-ink">{formatCurrencyINR(bike.price)}</td>
                        <td className="px-4 py-3">
                          <Badge variant={STATUS_BADGE[bike.status]}>
                            {bike.status.charAt(0).toUpperCase() + bike.status.slice(1)}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-canvas-dim opacity-0 group-hover:opacity-100 transition-opacity">
                                <MoreHorizontal className="h-4 w-4" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link to={`/inventory/${bike.id}/edit`} className="flex items-center gap-2">
                                  <Pencil className="h-4 w-4" /> Edit
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleDelete(bike.id, `${bike.brand} ${bike.model}`)}
                                className="flex items-center gap-2 text-danger focus:text-danger"
                              >
                                <Trash2 className="h-4 w-4" /> Remove
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
