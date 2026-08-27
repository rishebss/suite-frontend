import React from "react";
import { cn } from "@/lib/utils";
import { ArrowUp, ArrowDown, Minus, AlertTriangle } from "lucide-react";

const PRIORITY_CONFIG = {
  CRITICAL: {
    color: "text-red-400 bg-red-400/10 border-red-500/20",
    icon: AlertTriangle,
    label: "Critical",
  },
  HIGH: {
    color: "text-orange-400 bg-orange-400/10 border-orange-500/20",
    icon: ArrowUp,
    label: "High",
  },
  MEDIUM: {
    color: "text-amber-400 bg-amber-400/10 border-amber-500/20",
    icon: Minus,
    label: "Medium",
  },
  LOW: {
    color: "text-emerald-400 bg-emerald-400/10 border-emerald-500/20",
    icon: ArrowDown,
    label: "Low",
  },
};

const PriorityBadge = ({ priority = "MEDIUM", className, showIcon = true, compact = false }) => {
  const config = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.MEDIUM;
  const Icon = config.icon;

  if (compact) {
    return (
      <span className={cn("inline-flex items-center gap-1", config.color, className)}>
        <Icon size={10} />
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border",
        config.color,
        className
      )}
    >
      {showIcon && <Icon size={10} />}
      {config.label}
    </span>
  );
};

export default PriorityBadge;
