import React from "react";
import { cn } from "@/lib/utils";
import {
  Activity, UserPlus, ArrowRight, AlertTriangle,
  MessageSquare, Paperclip, Calendar, Target,
} from "lucide-react";

const ACTIVITY_ICONS = {
  ITEM_CREATED: { icon: Activity, color: "text-green-400" },
  STATUS_CHANGED: { icon: ArrowRight, color: "text-blue-400" },
  ASSIGNEE_CHANGED: { icon: UserPlus, color: "text-purple-400" },
  PRIORITY_CHANGED: { icon: AlertTriangle, color: "text-amber-400" },
  COMMENT_ADDED: { icon: MessageSquare, color: "text-cyan-400" },
  ATTACHMENT_ADDED: { icon: Paperclip, color: "text-pink-400" },
  SPRINT_STARTED: { icon: Target, color: "text-emerald-400" },
  SPRINT_CLOSED: { icon: Target, color: "text-red-400" },
  SPRINT_CHANGED: { icon: Calendar, color: "text-orange-400" },
  TITLE_CHANGED: { icon: Activity, color: "text-white/50" },
  DESCRIPTION_CHANGED: { icon: Activity, color: "text-white/50" },
  DUE_DATE_CHANGED: { icon: Calendar, color: "text-yellow-400" },
  STORY_POINTS_CHANGED: { icon: Target, color: "text-indigo-400" },
  SLA_BREACHED: { icon: AlertTriangle, color: "text-red-500" },
  SLA_WARNING: { icon: AlertTriangle, color: "text-amber-500" },
  MILESTONE_ACHIEVED: { icon: Target, color: "text-green-500" },
  MILESTONE_MISSED: { icon: AlertTriangle, color: "text-red-500" },
  CSAT_SUBMITTED: { icon: MessageSquare, color: "text-yellow-400" },
};

const ActivityLog = ({ logs, loading }) => {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3 animate-pulse">
            <div className="w-8 h-8 rounded-full bg-zinc-800" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 bg-zinc-800 rounded w-3/4" />
              <div className="h-2 bg-zinc-800/50 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!logs || logs.length === 0) {
    return (
      <div className="text-center py-6">
        <Activity size={24} className="mx-auto mb-2 text-white/20" />
        <p className="text-sm text-white/30">No activity recorded yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2 text-sm font-semibold text-white/80 mb-3">
        <Activity size={16} />
        Activity Log
      </div>
      <div className="relative">
        <div className="absolute left-4 top-0 bottom-0 w-px bg-zinc-800" />
        <div className="space-y-0">
          {logs.map((log) => {
            const config = ACTIVITY_ICONS[log.activity_type] || { icon: Activity, color: "text-white/30" };
            const Icon = config.icon;
            return (
              <div key={log.id} className="relative flex items-start gap-3 py-2 pl-0">
                <div className={cn(
                  "relative z-10 w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0",
                )}>
                  <Icon size={14} className={config.color} />
                </div>
                <div className="flex-1 min-w-0 pt-1">
                  <p className="text-sm text-white/70">{log.description}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-white/30 font-mono">{log.activity_type}</span>
                    <span className="text-[10px] text-white/20">·</span>
                    <span className="text-[10px] text-white/30">
                      {new Date(log.created_at).toLocaleString("en-IN", {
                        day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
                      })}
                    </span>
                    {log.user_details && (
                      <>
                        <span className="text-[10px] text-white/20">·</span>
                        <span className="text-[10px] text-white/40">
                          {log.user_details.first_name} {log.user_details.last_name}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ActivityLog;
