import React from "react";
import { cn } from "@/lib/utils";

const STATUS_COLORS = {
  gray: "bg-gray-500/10 text-gray-400 border-gray-500/20",
  blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  purple: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  amber: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  orange: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  green: "bg-green-500/10 text-green-400 border-green-500/20",
  red: "bg-red-500/10 text-red-400 border-red-500/20",
  pink: "bg-pink-500/10 text-pink-400 border-pink-500/20",
  cyan: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  zinc: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
};

const StatusBadge = ({ name, color = "gray", className }) => {
  const colorClass = STATUS_COLORS[color] || STATUS_COLORS.gray;
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border",
        colorClass,
        className
      )}
    >
      {name}
    </span>
  );
};

export default StatusBadge;
