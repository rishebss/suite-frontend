import React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

const BurndownChart = ({ burndown, loading, className }) => {
  if (loading) {
    return (
      <div className={cn("flex items-center justify-center h-48", className)}>
        <Loader2 size={20} className="animate-spin text-white/20" />
      </div>
    );
  }

  if (!burndown?.burndown?.length) {
    return (
      <div className={cn("flex flex-col items-center justify-center h-48 text-center", className)}>
        <p className="text-sm text-white/30">No burndown data available yet</p>
        <p className="text-xs text-white/20 mt-1">Start the sprint to begin tracking</p>
      </div>
    );
  }

  const data = burndown.burndown;
  const width = 600;
  const height = 200;
  const padding = { top: 20, right: 20, bottom: 30, left: 50 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const maxPoints = Math.max(
    ...data.map((d) => Math.max(d.remaining_points, d.ideal_burndown)),
    1
  );

  const xScale = (i) => padding.left + (i / Math.max(data.length - 1, 1)) * chartW;
  const yScale = (v) => padding.top + (1 - v / maxPoints) * chartH;

  // Generate SVG path for actual burndown
  const actualPath = data
    .map((d, i) => `${i === 0 ? "M" : "L"} ${xScale(i)} ${yScale(d.remaining_points)}`)
    .join(" ");

  // Generate SVG path for ideal burndown
  const idealPath = data
    .map((d, i) => `${i === 0 ? "M" : "L"} ${xScale(i)} ${yScale(d.ideal_burndown)}`)
    .join(" ");

  // Y-axis ticks
  const yTicks = 5;
  const yStep = maxPoints / yTicks;

  return (
    <div className={cn("space-y-2", className)}>
      {/* Stats header */}
      <div className="flex items-center justify-between text-xs text-white/40">
        <span>
          <strong className="text-white">{burndown.total_committed}</strong> committed
          {" — "}
          <strong className="text-green-400">{burndown.total_completed}</strong> completed
          {" — "}
          <strong className={cn(
            burndown.completion_pct >= 100 ? "text-green-400" : "text-amber-400"
          )}>
            {burndown.completion_pct}%
          </strong>
        </span>
      </div>

      {/* SVG Chart */}
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto max-h-52">
        {/* Grid lines */}
        {Array.from({ length: yTicks + 1 }).map((_, i) => (
          <g key={i}>
            <line
              x1={padding.left}
              y1={yScale(i * yStep)}
              x2={width - padding.right}
              y2={yScale(i * yStep)}
              stroke="rgb(39 39 42)"
              strokeWidth="1"
            />
            <text
              x={padding.left - 8}
              y={yScale(i * yStep) + 3}
              textAnchor="end"
              className="fill-zinc-500 text-[9px]"
            >
              {Math.round(i * yStep)}
            </text>
          </g>
        ))}

        {/* X-axis labels (show every Nth date) */}
        {data
          .filter((_, i) => i % Math.max(1, Math.floor(data.length / 6)) === 0 || i === data.length - 1)
          .map((d, i) => {
            const date = new Date(d.date);
            const label = date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
            const idx = data.indexOf(d);
            return (
              <text
                key={i}
                x={xScale(idx)}
                y={height - 5}
                textAnchor="middle"
                className="fill-zinc-500 text-[8px]"
              >
                {label}
              </text>
            );
          })}

        {/* Ideal burndown (dashed line) */}
        <path
          d={idealPath}
          fill="none"
          stroke="rgb(113 113 122)"
          strokeWidth="1.5"
          strokeDasharray="4 4"
        />

        {/* Actual burndown (solid line) */}
        <path
          d={actualPath}
          fill="none"
          stroke="rgb(59 130 246)"
          strokeWidth="2"
        />

        {/* Data points */}
        {data.map((d, i) => (
          <circle
            key={i}
            cx={xScale(i)}
            cy={yScale(d.remaining_points)}
            r="3"
            className="fill-blue-500"
          />
        ))}
      </svg>

      {/* Legend */}
      <div className="flex items-center gap-4 text-[10px] text-white/30">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 bg-blue-500 rounded" /> Actual
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 bg-zinc-500 rounded border border-dashed" /> Ideal
        </span>
      </div>
    </div>
  );
};

export default BurndownChart;
