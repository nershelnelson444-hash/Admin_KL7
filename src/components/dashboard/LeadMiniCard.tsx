import { Phone, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn, initials } from "@/lib/utils";
import type { Lead } from "@/types";

const INTEREST_DOT: Record<Lead["interest"], string> = {
  Hot: "bg-ember",
  Warm: "bg-warn",
  Cold: "bg-muted",
};

export function LeadMiniCard({ lead, index = 0 }: { lead: Lead; index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
      className="flex w-[230px] shrink-0 flex-col gap-4 rounded-card bg-surface p-4 shadow-soft sm:w-auto"
    >
      <div className="flex items-start justify-between">
        <Avatar className="h-11 w-11">
          <AvatarFallback className="bg-canvas-dim text-ink">{initials(lead.name)}</AvatarFallback>
        </Avatar>
        <div className="flex gap-1">
          {["Hot", "Warm", "Cold"].map((level) => (
            <span
              key={level}
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                level === lead.interest ? INTEREST_DOT[lead.interest] : "bg-line"
              )}
            />
          ))}
        </div>
      </div>
      <div>
        <div className="font-display text-[15px] font-semibold leading-tight text-ink">{lead.name}</div>
        <div className="mt-0.5 truncate text-xs text-muted">Wants: {lead.interestedBikeName}</div>
      </div>
      <div className="flex gap-2">
        <button className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-canvas-dim px-3 py-1.5 text-xs font-medium text-ink hover:bg-line">
          <Phone className="h-3.5 w-3.5" /> Call
        </button>
        <button className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-canvas-dim px-3 py-1.5 text-xs font-medium text-ink hover:bg-line">
          <MessageCircle className="h-3.5 w-3.5" /> Chat
        </button>
      </div>
    </motion.div>
  );
}
