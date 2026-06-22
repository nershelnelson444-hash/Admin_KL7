import { Phone, Video, Mail, Bell, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn, initials, formatDate } from "@/lib/utils";
import type { Lead } from "@/types";

const ACTION_ICON = { Call: Phone, "Test Ride": Video, Quote: Mail } as const;

interface FollowUpCardProps {
  lead: Lead;
  actionType: "Call" | "Test Ride" | "Quote";
  time: string;
  highlight?: boolean;
  index?: number;
}

export function FollowUpCard({ lead, actionType, time, highlight = false, index = 0 }: FollowUpCardProps) {
  const ActionIcon = ACTION_ICON[actionType];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className={cn(
        "flex flex-col gap-5 rounded-card p-5",
        highlight ? "bg-lime text-lime-ink shadow-lift" : "bg-surface text-ink shadow-soft"
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className={cn(highlight ? "bg-lime-ink text-lime" : "bg-canvas-dim text-ink")}>
              {initials(lead.name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="text-sm font-semibold leading-tight">{lead.name}</div>
            <div className={cn("text-xs", highlight ? "text-lime-ink/60" : "text-muted")}>{lead.interestedBikeName}</div>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <Bell className={cn("h-4 w-4", highlight ? "text-lime-ink/50" : "text-muted")} />
          <ArrowUpRight className={cn("h-4 w-4", highlight ? "text-lime-ink/50" : "text-muted")} />
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2">
          <ActionIcon className="h-[18px] w-[18px]" />
          <span className="font-display text-lg font-bold tracking-tight">{actionType}</span>
        </div>
        <div className={cn("mt-1 text-xs", highlight ? "text-lime-ink/60" : "text-muted")}>
          {formatDate(time)} at {new Date(time).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span
          className={cn(
            "rounded-full px-3 py-1 text-xs font-medium",
            highlight ? "bg-lime-ink/10" : "bg-canvas-dim"
          )}
        >
          {lead.status === "negotiating" ? "Follow-up due" : "Scheduled"}
        </span>
        <button
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-full",
            highlight ? "bg-lime-ink text-lime" : "bg-ink text-white"
          )}
        >
          <ActionIcon className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  );
}
