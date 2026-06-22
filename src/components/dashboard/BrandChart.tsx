import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { InventoryByBrand } from "@/types";

const COLORS = ["#111110", "#2c2c28", "#54534c", "#84837c", "#a6a59d", "#cccbc4"];

function ChartTooltip({ active, payload }: { active?: boolean; payload?: { payload: InventoryByBrand }[] }) {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload;
  return (
    <div className="rounded-xl border border-line bg-ink px-3.5 py-2 text-white shadow-lift">
      <div className="font-display text-sm font-bold">{item.brand}</div>
      <div className="text-xs text-white/60">{item.count} bikes in stock</div>
    </div>
  );
}

export function BrandChart({ data }: { data: InventoryByBrand[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
        <XAxis type="number" hide />
        <YAxis
          type="category"
          dataKey="brand"
          tickLine={false}
          axisLine={false}
          width={110}
          tick={{ fill: "#111110", fontSize: 12, fontWeight: 500 }}
        />
        <Tooltip content={<ChartTooltip />} cursor={{ fill: "#EDECE8" }} />
        <Bar dataKey="count" radius={[0, 8, 8, 0]} barSize={16}>
          {data.map((_, i) => (
            <Cell key={i} fill={i === 0 ? "#D7FF3F" : COLORS[i % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
