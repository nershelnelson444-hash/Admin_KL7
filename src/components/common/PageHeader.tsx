import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  stats?: { label: string; value: string | number; tone?: "ok" | "danger" | "default" }[];
  className?: string;
}

export function PageHeader({ title, description, actions, stats, className }: PageHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className={cn("mb-6 flex flex-wrap items-start justify-between gap-4", className)}
    >
      <div>
        <h1 className="font-display text-[28px] font-bold tracking-tight text-ink sm:text-[32px]">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      </div>

      <div className="flex items-center gap-6">
        {stats && stats.length > 0 && (
          <div className="hidden items-center gap-6 sm:flex">
            {stats.map((s) => (
              <div key={s.label} className="text-right">
                <div
                  className={cn(
                    "font-display text-2xl font-bold tracking-tight",
                    s.tone === "ok" && "text-ok",
                    s.tone === "danger" && "text-danger"
                  )}
                >
                  {s.value}
                </div>
                <div className="text-xs uppercase tracking-wide text-muted">{s.label}</div>
              </div>
            ))}
          </div>
        )}
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </motion.div>
  );
}
