import React from "react";
import { cn } from "@/lib/utils";

const accents = {
  blue: {
    hoverGlow: "group-hover:shadow-[0_0_40px_-8px_rgba(59,130,246,0.2)]",
    iconBg: "bg-blue-500/10 border-blue-500/20 text-blue-400",
  },
  emerald: {
    hoverGlow: "group-hover:shadow-[0_0_40px_-8px_rgba(16,185,129,0.2)]",
    iconBg: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
  },
  violet: {
    hoverGlow: "group-hover:shadow-[0_0_40px_-8px_rgba(139,92,246,0.2)]",
    iconBg: "bg-violet-500/10 border-violet-500/20 text-violet-400",
  },
  amber: {
    hoverGlow: "group-hover:shadow-[0_0_40px_-8px_rgba(245,158,11,0.2)]",
    iconBg: "bg-amber-500/10 border-amber-500/20 text-amber-400",
  },
  rose: {
    hoverGlow: "group-hover:shadow-[0_0_40px_-8px_rgba(244,63,94,0.2)]",
    iconBg: "bg-rose-500/10 border-rose-500/20 text-rose-400",
  },
  cyan: {
    hoverGlow: "group-hover:shadow-[0_0_40px_-8px_rgba(6,182,212,0.2)]",
    iconBg: "bg-cyan-500/10 border-cyan-500/20 text-cyan-400",
  },
};

const KpiCard = ({
  label,
  value,
  icon,
  suffix,
  accent = "blue",
}) => {
  const a = accents[accent] || accents.blue;
  return (
    <div
      className={cn(
        "group relative rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6 transition-shadow duration-300 shadow-none hover:bg-zinc-900/50 hover:border-zinc-700",
        a.hoverGlow,
      )}
    >
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
      <div className="relative flex items-start justify-between">
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl border", a.iconBg)}>
          {icon && React.createElement(icon, { size: 18 })}
        </div>
        {suffix && (
          <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[8px] font-medium uppercase tracking-wider text-white/40">
            {suffix}
          </span>
        )}
      </div>
      <div className="relative mt-4 space-y-1">
        <p className="text-[10px] text-white/40 uppercase">
          {label}
        </p>
        <p className="truncate text-2xl font-semibold tracking-tight text-white">
          {value}
        </p>
      </div>
    </div>
  );
};

export default KpiCard;
