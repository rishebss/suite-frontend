import React from "react";
import { cn } from "@/lib/utils";
import { Map, Loader2, AlertCircle, CheckCircle2, Clock } from "lucide-react";

const PRIORITY_COLORS = {
  CRITICAL: "text-red-400",
  HIGH: "text-orange-400",
  MEDIUM: "text-blue-400",
  LOW: "text-zinc-500",
};

const STATUS_COLORS = {
  backlog: "bg-zinc-700",
  todo: "bg-blue-500",
  in_progress: "bg-amber-500",
  review: "bg-purple-500",
  done: "bg-emerald-500",
  cancelled: "bg-red-500",
};

const EpicRoadmap = ({ epics, loading, onEpicClick }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 size={24} className="animate-spin text-white/30" />
      </div>
    );
  }

  if (!epics || epics.length === 0) {
    return (
      <div className="text-center py-10">
        <Map size={32} className="mx-auto mb-3 text-white/20" />
        <p className="text-sm text-white/40">No epics yet</p>
        <p className="text-xs text-white/20 mt-1">Create an Epic to see the roadmap</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-white/80 mb-4">
        <Map size={16} />
        Epic Roadmap
      </div>

      <div className="space-y-2">
        {epics.map((epic) => {
          const pct = epic.completion_pct || 0;
          const daysUntilDue = epic.due_date
            ? Math.ceil((new Date(epic.due_date) - new Date()) / (1000 * 60 * 60 * 24))
            : null;
          const isOverdue = daysUntilDue !== null && daysUntilDue < 0;

          return (
            <div
              key={epic.id}
              onClick={() => onEpicClick?.(epic)}
              className="p-3 rounded-xl bg-zinc-900/40 border border-white/5 hover:border-blue-500/30 transition-all cursor-pointer group space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-[10px] font-mono text-white/30 font-medium">{epic.key}</span>
                  <h4 className="text-sm font-semibold text-white group-hover:text-blue-400 transition-colors truncate">
                    {epic.title}
                  </h4>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {epic.priority && (
                    <span className={cn("text-[10px] font-bold uppercase", PRIORITY_COLORS[epic.priority])}>
                      {epic.priority}
                    </span>
                  )}
                  <span className={cn(
                    "px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border",
                    epic.status?.category === "done" ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" :
                    epic.status?.category === "in_progress" ? "bg-amber-500/10 border-amber-500/30 text-amber-400" :
                    "bg-zinc-800 border-zinc-700 text-zinc-400",
                  )}>
                    {epic.status?.name || "N/A"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4 text-[10px] text-white/40">
                <span className="flex items-center gap-1">
                  <CheckCircle2 size={10} className="text-emerald-400" />
                  {epic.completed_points || 0}/{epic.total_points || 0} pts
                </span>
                <span className="flex items-center gap-1">
                  <AlertCircle size={10} className="text-blue-400" />
                  {epic.child_count || 0} items
                </span>
                {daysUntilDue !== null && (
                  <span className={cn(
                    "flex items-center gap-1",
                    isOverdue ? "text-red-400" : daysUntilDue <= 7 ? "text-amber-400" : "text-white/40",
                  )}>
                    <Clock size={10} />
                    {isOverdue ? `${Math.abs(daysUntilDue)}d overdue` : `${daysUntilDue}d left`}
                  </span>
                )}
              </div>

              <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    pct >= 100 ? "bg-emerald-500" : "bg-blue-500",
                  )}
                  style={{ width: `${Math.min(pct, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-white/30">
                <span>{pct}% complete</span>
                {epic.assignee && (
                  <span>{epic.assignee.first_name} {epic.assignee.last_name}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EpicRoadmap;
