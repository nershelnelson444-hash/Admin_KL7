import { cn } from "@/lib/utils";

interface GaugeProps {
  value: number; // 0-100
  label: string;
  sublabel: string;
  className?: string;
}

/**
 * Signature element: an instrument-cluster speedometer gauge.
 * Ties the admin UI back to the showroom floor — every bike KL7 sells
 * has one of these on its dash. Used sparingly (hero dashboard stat only).
 */
export function SpeedGauge({ value, label, sublabel, className }: GaugeProps) {
  const clamped = Math.max(0, Math.min(100, value));
  // sweep from -120deg to 120deg (240deg total), needle math
  const angle = -120 + (clamped / 100) * 240;
  const radius = 78;
  const cx = 100;
  const cy = 100;

  const arcPoint = (deg: number) => {
    const rad = (deg - 90) * (Math.PI / 180);
    return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
  };

  const start = arcPoint(-120);
  const end = arcPoint(120);
  const valueEnd = arcPoint(angle);

  const ticks = Array.from({ length: 13 }, (_, i) => {
    const deg = -120 + (i / 12) * 240;
    const outer = arcPoint(deg);
    const innerRad = (deg - 90) * (Math.PI / 180);
    const inner = {
      x: cx + (radius - 8) * Math.cos(innerRad),
      y: cy + (radius - 8) * Math.sin(innerRad),
    };
    return { outer, inner, major: i % 3 === 0 };
  });

  const needleRad = (angle - 90) * (Math.PI / 180);
  const needleTip = {
    x: cx + (radius - 16) * Math.cos(needleRad),
    y: cy + (radius - 16) * Math.sin(needleRad),
  };

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <svg viewBox="0 0 200 130" className="w-full max-w-[220px]">
        <defs>
          <linearGradient id="gaugeArc" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ff7a33" />
            <stop offset="55%" stopColor="#d7ff3f" />
            <stop offset="100%" stopColor="#d7ff3f" />
          </linearGradient>
        </defs>
        {/* base track */}
        <path
          d={`M ${start.x} ${start.y} A ${radius} ${radius} 0 1 1 ${end.x} ${end.y}`}
          fill="none"
          stroke="#2c2c28"
          strokeWidth="10"
          strokeLinecap="round"
        />
        {/* value arc */}
        <path
          d={`M ${start.x} ${start.y} A ${radius} ${radius} 0 ${clamped > 58 ? 1 : 0} 1 ${valueEnd.x} ${valueEnd.y}`}
          fill="none"
          stroke="url(#gaugeArc)"
          strokeWidth="10"
          strokeLinecap="round"
        />
        {/* ticks */}
        {ticks.map((t, i) => (
          <line
            key={i}
            x1={t.inner.x}
            y1={t.inner.y}
            x2={t.outer.x}
            y2={t.outer.y}
            stroke="#54534c"
            strokeWidth={t.major ? 2 : 1}
          />
        ))}
        {/* needle */}
        <line x1={cx} y1={cy} x2={needleTip.x} y2={needleTip.y} stroke="#d7ff3f" strokeWidth="3" strokeLinecap="round" />
        <circle cx={cx} cy={cy} r="6" fill="#d7ff3f" />
        <circle cx={cx} cy={cy} r="2.5" fill="#111110" />
      </svg>
      <div className="-mt-2 text-center">
        <div className="font-display text-3xl font-bold tracking-tight text-white">{label}</div>
        <div className="text-xs uppercase tracking-wide text-white/50 mt-0.5">{sublabel}</div>
      </div>
    </div>
  );
}
