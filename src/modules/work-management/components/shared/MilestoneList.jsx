import React from "react";
import { cn } from "@/lib/utils";
import { Flag, CheckCircle, XCircle, Clock, Plus, Loader2 } from "lucide-react";

const STATUS_STYLES = {
  PENDING: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  ACHIEVED: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  MISSED: "text-red-400 bg-red-500/10 border-red-500/20",
  CANCELLED: "text-zinc-400 bg-zinc-500/10 border-zinc-500/20",
};

const MilestoneList = ({ milestones = [], loading, compact = false }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 size={16} className="animate-spin text-white/20" />
      </div>
    );
  }

  if (!milestones.length) {
    return (
      <div className="text-center py-8">
        <Flag size={24} className="mx-auto text-white/20 mb-2" />
        <p className="text-sm text-white/40">No milestones</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", compact && "space-y-1")}>
      {milestones.map((m) => (
        <div
          key={m.id}
          className={cn(
            "flex items-center gap-3 p-3 rounded-lg border transition-all",
            "bg-zinc-900/40 border-white/5",
            m.status === "ACHIEVED" && "border-emerald-500/20 bg-emerald-500/5",
            m.status === "MISSED" && "border-red-500/20 bg-red-500/5",
          )}
        >
          {/* Status Icon */}
          <div className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center shrink-0 border",
            STATUS_STYLES[m.status] || STATUS_STYLES.PENDING
          )}>
            {m.status === "ACHIEVED" ? <CheckCircle size={14} />
              : m.status === "MISSED" ? <XCircle size={14} />
              : m.status === "CANCELLED" ? <XCircle size={14} />
              : <Clock size={14} />}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className={cn(
              "text-sm font-semibold",
              m.status === "ACHIEVED" ? "text-emerald-300" : "text-white"
            )}>
              {m.name}
            </p>
            {m.description && (
              <p className="text-[10px] text-white/40 truncate">{m.description}</p>
            )}
          </div>

          {/* Date */}
          <div className="text-right">
            <p className={cn(
              "text-[10px] font-medium",
              m.status === "ACHIEVED" ? "text-emerald-400" : "text-white/40"
            )}>
              {new Date(m.target_date).toLocaleDateString("en-IN", {
                day: "numeric", month: "short"
              })}
            </p>
            {m.milestone_type !== "GENERIC" && (
              <p className="text-[8px] text-white/30 uppercase tracking-wider">{m.milestone_type}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MilestoneList;
