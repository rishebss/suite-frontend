import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import { MessageSquare, Paperclip, Clock, GripVertical } from "lucide-react";
import StatusBadge from "./StatusBadge";
import PriorityBadge from "./PriorityBadge";

const ISSUE_TYPE_LABELS = {
  EPIC: "Epic",
  STORY: "Story",
  TASK: "Task",
  BUG: "Bug",
  SUBTASK: "Sub-task",
  DEAL: "Deal",
  TICKET: "Ticket",
  REQUEST: "Request",
  APPROVAL: "Approval",
};

const ISSUE_TYPE_COLORS = {
  EPIC: "from-purple-500/10 to-purple-500/5 border-purple-500/20 text-purple-400",
  STORY: "from-green-500/10 to-green-500/5 border-green-500/20 text-green-400",
  TASK: "from-blue-500/10 to-blue-500/5 border-blue-500/20 text-blue-400",
  BUG: "from-red-500/10 to-red-500/5 border-red-500/20 text-red-400",
  DEAL: "from-amber-500/10 to-amber-500/5 border-amber-500/20 text-amber-400",
  TICKET: "from-cyan-500/10 to-cyan-500/5 border-cyan-500/20 text-cyan-400",
};

const WorkItemCard = ({ item, isOverlay, onView, onDragHandleProps }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  const issueTypeColor = ISSUE_TYPE_COLORS[item.issue_type] || ISSUE_TYPE_COLORS.TASK;
  const issueTypeLabel = ISSUE_TYPE_LABELS[item.issue_type] || item.issue_type;

  const isOverdue = item.due_date && new Date(item.due_date) < new Date() && item.status?.category !== "done";

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "p-3 rounded-lg bg-zinc-900/40 border border-white/5 cursor-grab active:cursor-grabbing transition-all duration-200 touch-none group",
        !isOverlay && "hover:border-blue-500/30 hover:bg-zinc-900/60",
        isOverlay && "bg-zinc-900 border-blue-500/50 shadow-[0_20px_50px_rgba(0,0,0,0.5)] scale-[1.02] z-50 cursor-grabbing"
      )}
    >
      <div className="space-y-2.5">
        {/* Top row: Key + Issue Type */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] font-mono text-white/30 font-medium">{item.key}</span>
          <span className={cn(
            "px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border bg-gradient-to-b",
            issueTypeColor
          )}>
            {issueTypeLabel}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-sm font-semibold text-white leading-snug line-clamp-2 group-hover:text-blue-400 transition-colors">
          {item.title}
        </h3>

        {/* Assignee + Priority */}
        <div className="flex items-center justify-between gap-2 pt-1">
          <div className="flex items-center gap-1.5 min-w-0">
            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-[8px] font-bold text-white shrink-0">
              {item.assignee_details
                ? (item.assignee_details.first_name?.[0] || item.assignee_details.email?.[0] || "?").toUpperCase()
                : "?"}
            </div>
            <span className="text-[10px] text-white/40 truncate">
              {item.assignee_details
                ? `${item.assignee_details.first_name} ${item.assignee_details.last_name}`.trim() || item.assignee_details.email
                : "Unassigned"}
            </span>
          </div>
          <PriorityBadge priority={item.priority} compact />
        </div>

        {/* Meta footer */}
        <div className="flex items-center justify-between gap-3 pt-1.5 border-t border-white/5">
          <div className="flex items-center gap-2 text-[10px] text-white/30">
            {item.comment_count > 0 && (
              <span className="flex items-center gap-1">
                <MessageSquare size={10} />
                {item.comment_count}
              </span>
            )}
            {item.subtask_count > 0 && (
              <span className="flex items-center gap-1 text-white/30">
                <Paperclip size={10} />
                {item.subtask_count}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {item.due_date && (
              <span className={cn(
                "flex items-center gap-1 text-[10px]",
                isOverdue ? "text-red-400" : "text-white/30"
              )}>
                <Clock size={10} />
                {new Date(item.due_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
              </span>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onView?.(item);
              }}
              className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-[9px] font-bold text-white transition-all border border-white/20 active:scale-95 opacity-0 group-hover:opacity-100"
            >
              View
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkItemCard;
