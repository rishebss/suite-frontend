import React from "react";
import { cn } from "@/lib/utils";

export const ProgressBar = ({
  value,
  max,
  color = "linear-gradient(to right, #3b82f6, #22d3ee)",
  className,
}) => {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div
      className={cn(
        "h-1.5 w-full overflow-hidden rounded-full bg-white/5",
        className,
      )}
    >
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${pct}%`, background: color }}
      />
    </div>
  );
};

export const Stat = ({ label, value, color = "text-white" }) => (
  <div>
    <p className="text-[9px] font-bold uppercase tracking-widest text-white/25">
      {label}
    </p>
    <p className={cn("text-lg font-bold tracking-tight", color)}>{value}</p>
  </div>
);

export const Donut = ({ segments, size = 128, thickness = 16 }) => {
  const total = segments.reduce((s, x) => s + (x.value || 0), 0);
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;

  if (!total) {
    return (
      <div
        className="relative flex items-center justify-center rounded-full border border-white/5 bg-white/[0.02]"
        style={{ width: size, height: size }}
      >
        <span className="text-xs font-bold text-white/30">0</span>
      </div>
    );
  }

  const arcs = [];
  let running = 0;
  for (const seg of segments) {
    const len = (seg.value / total) * circumference;
    arcs.push({ seg, len, start: running });
    running += len;
  }

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth={thickness}
        />
        {arcs.map(({ seg, len, start }, i) => (
          <circle
            key={i}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={seg.color}
            strokeWidth={thickness}
            strokeLinecap="butt"
            strokeDasharray={`${len} ${circumference - len}`}
            strokeDashoffset={-start}
          />
        ))}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-white">{total}</span>
        <span className="text-[9px] font-bold uppercase tracking-widest text-white/30">
          Total
        </span>
      </div>
    </div>
  );
};

export const Legend = ({ items }) => (
  <div className="space-y-2.5">
    {items.map((it, i) => (
      <div key={i} className="flex items-center gap-2.5">
        <span
          className="h-2.5 w-2.5 shrink-0 rounded-sm"
          style={{ backgroundColor: it.color }}
        />
        <span className="flex-1 text-xs font-medium text-white/60">{it.label}</span>
        <span className="text-xs font-bold text-white">{it.value}</span>
      </div>
    ))}
  </div>
);