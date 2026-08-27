import React from "react";
import { cn } from "@/lib/utils";
import { CircleCheck, Circle, TrendingUp, Loader2 } from "lucide-react";

const formatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const STATUS_STYLES = {
  ACHIEVED: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  EXCEEDED: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  IN_PROGRESS: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  NOT_STARTED: "text-zinc-400 bg-zinc-500/10 border-zinc-500/20",
  MISSED: "text-red-400 bg-red-500/10 border-red-500/20",
};

const AttainmentChart = ({ attainment = [], loading }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 size={20} className="animate-spin text-white/20" />
      </div>
    );
  }

  if (!attainment.length) {
    return (
      <div className="text-center py-12">
        <TrendingUp size={32} className="mx-auto text-white/20 mb-2" />
        <p className="text-sm text-white/40">No active sales cycles</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {attainment.map((cycle) => (
        <div key={cycle.cycle.id}>
          {/* Cycle Header */}
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-white">{cycle.cycle.name}</h3>
              <p className="text-[10px] text-white/40">
                {cycle.cycle.cycle_type} &middot; {new Date(cycle.cycle.start_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} - {new Date(cycle.cycle.end_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              </p>
            </div>
            <div className="text-right">
              <p className={cn(
                "text-lg font-bold",
                cycle.overall_attainment_pct >= 100 ? "text-emerald-400" : "text-amber-400"
              )}>
                {cycle.overall_attainment_pct}%
              </p>
              <p className="text-[10px] text-white/40">attainment</p>
            </div>
          </div>

          {/* Overall Progress Bar */}
          <div className="h-2 bg-zinc-800 rounded-full overflow-hidden mb-4">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-700",
                cycle.overall_attainment_pct >= 100
                  ? "bg-gradient-to-r from-emerald-500 to-emerald-400"
                  : "bg-gradient-to-r from-amber-500 to-orange-400"
              )}
              style={{ width: `${Math.min(cycle.overall_attainment_pct, 100)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs text-white/40 mb-3">
            <span>Target: {formatter.format(cycle.total_target)}</span>
            <span>Achieved: {formatter.format(cycle.total_achieved)}</span>
          </div>

          {/* Individual Targets */}
          <div className="space-y-2">
            {cycle.targets?.map((target) => (
              <div key={target.id} className="p-2.5 rounded-lg bg-zinc-900/60 border border-white/5">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white">
                      {target.assigned_user
                        ? `${target.assigned_user.first_name} ${target.assigned_user.last_name}`.trim() || target.assigned_user.email
                        : target.assigned_department || "Unassigned"}
                    </span>
                    <span className={cn(
                      "px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border",
                      STATUS_STYLES[target.status] || STATUS_STYLES.NOT_STARTED
                    )}>
                      {target.status?.replace(/_/g, " ")}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-white">{target.attainment_pct}%</span>
                </div>

                {/* Progress Bar */}
                <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-500",
                      target.attainment_pct >= 100 ? "bg-emerald-500"
                        : target.attainment_pct >= 50 ? "bg-amber-500"
                        : "bg-red-500"
                    )}
                    style={{ width: `${Math.min(target.attainment_pct, 100)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between mt-1.5">
                  <span className="text-[10px] text-white/40">
                    {formatter.format(target.achieved_amount)} / {formatter.format(target.target_amount)}
                  </span>
                  <span className="text-[10px] text-white/30">
                    Progress: {target.weighted_progress_pct}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AttainmentChart;
