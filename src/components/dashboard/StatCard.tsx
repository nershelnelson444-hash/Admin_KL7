import type { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

interface StatCardProps {
  label: string;
  value: string;
  delta?: { value: string; positive: boolean };
  icon: LucideIcon;
  accent?: "lime" | "ember" | "ink";
  index?: number;
}

export function StatCard({ label, value, delta, icon: Icon, accent = "ink", index = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05, ease: "easeOut" }}
    >
      <Card className="p-5">
        <div className="flex items-start justify-between">
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-xl",
              accent === "lime" && "bg-lime text-lime-ink",
              accent === "ember" && "bg-ember-soft text-ember",
              accent === "ink" && "bg-ink text-white"
            )}
          >
            <Icon className="h-[18px] w-[18px]" />
          </div>
          {delta && (
            <div
              className={cn(
                "flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold",
                delta.positive ? "bg-ok-soft text-ok" : "bg-danger-soft text-danger"
              )}
            >
              {delta.positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
              {delta.value}
            </div>
          )}
        </div>
        <div className="mt-4 font-display text-2xl font-bold tracking-tight text-ink">{value}</div>
        <div className="mt-0.5 text-sm text-muted">{label}</div>
      </Card>
    </motion.div>
  );
}
