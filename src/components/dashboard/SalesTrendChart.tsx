import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { SalesTrendPoint } from "@/types";
import { formatCurrencyINR } from "@/lib/utils";

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number; dataKey: string }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-line bg-ink px-3.5 py-2.5 text-white shadow-lift">
      <div className="text-xs uppercase tracking-wide text-white/50">{label}</div>
      <div className="mt-1 font-display text-lg font-bold">{payload[0].value} bikes sold</div>
      <div className="text-xs text-lime">{formatCurrencyINR(payload[1]?.value ?? 0)} revenue</div>
    </div>
  );
}

export function SalesTrendChart({ data }: { data: SalesTrendPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 10, right: 8, left: -16, bottom: 0 }}>
        <defs>
          <linearGradient id="soldFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#D7FF3F" stopOpacity={0.55} />
            <stop offset="100%" stopColor="#D7FF3F" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke="#E2E1DC" />
        <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: "#84837C", fontSize: 12 }} />
        <YAxis tickLine={false} axisLine={false} tick={{ fill: "#84837C", fontSize: 12 }} width={28} />
        <Tooltip content={<ChartTooltip />} cursor={{ stroke: "#111110", strokeWidth: 1, strokeDasharray: "4 4" }} />
        <Area
          type="monotone"
          dataKey="sold"
          stroke="#111110"
          strokeWidth={2.5}
          fill="url(#soldFill)"
          dot={{ r: 3, fill: "#111110", strokeWidth: 0 }}
          activeDot={{ r: 5, fill: "#D7FF3F", stroke: "#111110", strokeWidth: 2 }}
        />
        <Area dataKey="revenue" hide />
      </AreaChart>
    </ResponsiveContainer>
  );
}
