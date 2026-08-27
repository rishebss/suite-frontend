import React from "react";
import { cn } from "@/lib/utils";
import { TrendingUp, BarChart3, Loader2 } from "lucide-react";

const VelocityChart = ({ velocity, loading, compact = false }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <Loader2 size={20} className="animate-spin text-white/30" />
      </div>
    );
  }

  if (!velocity || !velocity.trend || velocity.trend.length === 0) {
    return (
      <div className="text-center py-6">
        <BarChart3 size={24} className="mx-auto mb-2 text-white/20" />
        <p className="text-sm text-white/30">No velocity data yet</p>
        <p className="text-xs text-white/20 mt-1">Complete a sprint to see velocity</p>
      </div>
    );
  }

  const maxPoints = Math.max(
    ...velocity.trend.map((s) => Math.max(s.committed_points || 0, s.completed_points || 0)),
    1,
  );

  const barMaxHeight = compact ? 40 : 80;
  const barWidth = compact ? 12 : 20;

  return (
    <div className={cn("space-y-3", compact && "space-y-2")}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp size={compact ? 14 : 16} className="text-emerald-400" />
          <span className={cn("font-semibold text-white/80", compact ? "text-xs" : "text-sm")}>
            Velocity
          </span>
        </div>
        <span className={cn("font-mono font-bold text-white", compact ? "text-sm" : "text-lg")}>
          {velocity.velocity}
          <span className="text-white/30 text-xs ml-1">pts/sprint</span>
        </span>
      </div>

      <div className="flex items-end gap-2" style={{ height: barMaxHeight }}>
        {velocity.trend.map((sprint) => {
          const committedHeight = (sprint.committed_points / maxPoints) * barMaxHeight;
          const completedHeight = (sprint.completed_points / maxPoints) * barMaxHeight;
          return (
            <div key={sprint.sprint_id} className="flex items-end gap-0.5 flex-1">
              <div
                className="rounded-t bg-zinc-700/50 border-t border-zinc-600 transition-all"
                style={{ height: Math.max(committedHeight, 2), width: barWidth }}
                title={`${sprint.sprint_name}: ${sprint.committed_points} committed`}
              />
              <div
                className="rounded-t bg-emerald-500/50 border-t border-emerald-400 transition-all"
                style={{ height: Math.max(completedHeight, 2), width: barWidth }}
                title={`${sprint.sprint_name}: ${sprint.completed_points} completed (${sprint.completion_pct}%)`}
              />
            </div>
          );
        })}
      </div>

      {!compact && (
        <div className="flex items-center gap-4 text-[10px] text-white/40">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-2 rounded bg-emerald-500/50 border border-emerald-400" />
            <span>Completed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-2 rounded bg-zinc-700/50 border border-zinc-600" />
            <span>Committed</span>
          </div>
          <span className="ml-auto">
            Last {velocity.sprints_analyzed} sprints
          </span>
        </div>
      )}
    </div>
  );
};

export default VelocityChart;
