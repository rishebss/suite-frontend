import React from "react";
import { cn } from "@/lib/utils";
import { Clock, AlertTriangle, AlertCircle, CheckCircle, PauseCircle } from "lucide-react";

const SLA_CONFIG = {
  BREACHED: {
    color: "text-red-400 bg-red-500/10 border-red-500/20",
    icon: AlertCircle,
    label: "SLA Breached",
  },
  WARNING: {
    color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    icon: AlertTriangle,
    label: "At Risk",
  },
  WITHIN_SLA: {
    color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    icon: Clock,
    label: "Within SLA",
  },
  PAUSED: {
    color: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    icon: PauseCircle,
    label: "Paused",
  },
  NO_SLA: {
    color: "text-zinc-400 bg-zinc-500/10 border-zinc-500/20",
    icon: CheckCircle,
    label: "No SLA",
  },
};

const formatMinutes = (minutes) => {
  if (minutes == null) return null;
  if (minutes < 60) return `${Math.round(minutes)}m`;
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return `${hours}h ${mins}m`;
};

const SLAIndicator = ({ slaStatus, remainingMinutes, compact = false }) => {
  const config = SLA_CONFIG[slaStatus] || SLA_CONFIG.NO_SLA;
  const Icon = config.icon;

  const remainingStr = formatMinutes(remainingMinutes);

  if (compact) {
    return (
      <span className={cn(
        "inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold border",
        config.color
      )}>
        <Icon size={10} />
        {remainingStr ? remainingStr : config.label}
      </span>
    );
  }

  return (
    <div className={cn(
      "flex items-center gap-2 px-3 py-2 rounded-lg border",
      config.color
    )}>
      <Icon size={16} />
      <div>
        <p className="text-xs font-bold">{config.label}</p>
        {remainingStr && (
          <p className="text-[10px] opacity-70">{remainingStr} remaining</p>
        )}
      </div>
    </div>
  );
};

export default SLAIndicator;
