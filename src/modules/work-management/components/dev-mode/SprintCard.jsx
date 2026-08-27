import React from "react";
import { cn } from "@/lib/utils";
import { Calendar, Target, Users, Clock, TrendingUp, Zap, Loader2 } from "lucide-react";

const STATUS_CONFIG = {
  PLANNING: { label: "Planning", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/30" },
  ACTIVE: { label: "Active", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/30" },
  COMPLETED: { label: "Completed", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/30" },
  CANCELLED: { label: "Cancelled", color: "text-red-400", bg: "bg-red-500/10 border-red-500/30" },
};

const SprintCard = ({ sprint, loading, compact = false, onClick }) => {
  if (loading) {
    return (
      <div className={cn(
        "rounded-xl bg-zinc-900/40 border border-white/5 flex items-center justify-center",
        compact ? "h-20" : "h-32",
      )}>
        <Loader2 size={20} className="animate-spin text-white/30" />
      </div>
    );
  }

  if (!sprint) {
    return (
      <div className={cn(
        "rounded-xl bg-zinc-900/40 border border-white/5 flex items-center justify-center",
        compact ? "h-20" : "h-32",
      )}>
        <p className="text-sm text-white/30">No sprint selected</p>
      </div>
    );
  }

  const statusCfg = STATUS_CONFIG[sprint.status] || STATUS_CONFIG.PLANNING;

  const startDate = new Date(sprint.start_date);
  const endDate = new Date(sprint.end_date);
  const now = new Date();
  const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
  const elapsedDays = Math.ceil((now - startDate) / (1000 * 60 * 60 * 24));
  const progressPct = sprint.status === "COMPLETED"
    ? 100
    : Math.min(100, Math.max(0, Math.round((elapsedDays / totalDays) * 100)));

  return (
    <div
      onClick={onClick}
      className={cn(
        "rounded-xl bg-zinc-900/40 border border-white/5 hover:border-blue-500/30 transition-all cursor-pointer group",
        compact ? "p-3" : "p-4",
      )}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="min-w-0">
          <h3 className={cn("font-semibold text-white group-hover:text-blue-400 transition-colors truncate", compact ? "text-sm" : "text-base")}>
            {sprint.name}
          </h3>
          {!compact && sprint.goal && (
            <p className="text-xs text-white/40 mt-0.5 line-clamp-1">{sprint.goal}</p>
          )}
        </div>
        <span className={cn(
          "px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border",
          statusCfg.bg, statusCfg.color,
        )}>
          {statusCfg.label}
        </span>
      </div>

      {!compact && (
        <div className="space-y-2 mt-3">
          <div className="flex items-center justify-between text-xs text-white/40">
            <div className="flex items-center gap-1">
              <Calendar size={11} />
              <span>{startDate.toLocaleDateString("en-IN", { day: "numeric", month: "short" })} - {endDate.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
            </div>
            <span className="font-mono">{totalDays}d</span>
          </div>

          <div className="flex items-center justify-between text-xs text-white/40">
            <div className="flex items-center gap-1">
              <Target size={11} />
              <span>{sprint.total_points || 0} pts</span>
            </div>
            <div className="flex items-center gap-1">
              <Users size={11} />
              <span>{sprint.member_count || 0} members</span>
            </div>
          </div>

          <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                progressPct >= 100 ? "bg-emerald-500" : "bg-blue-500",
              )}
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-white/30">
            <span>{progressPct}% complete</span>
            {sprint.total_completed_points > 0 && (
              <span>{sprint.total_completed_points}/{sprint.total_points} pts done</span>
            )}
          </div>
        </div>
      )}

      {compact && (
        <div className="flex items-center gap-3 mt-2 text-[10px] text-white/40">
          <span className="flex items-center gap-1">
            <Target size={10} />
            {sprint.total_points || 0} pts
          </span>
          <span className="flex items-center gap-1">
            <Clock size={10} />
            {totalDays}d
          </span>
        </div>
      )}
    </div>
  );
};

export default SprintCard;
