import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import { DollarSign, Target, Calendar, TrendingUp } from "lucide-react";

const formatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const PipelineStageCard = ({ item, isOverlay, onView }) => {
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

  const dealValue = item.deal_value || 0;
  const probability = item.probability || 0;
  const weightedValue = item.weighted_value || 0;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "p-3 rounded-lg bg-zinc-900/40 border border-white/5 cursor-grab active:cursor-grabbing transition-all duration-200 touch-none group",
        !isOverlay && "hover:border-amber-500/30 hover:bg-zinc-900/60",
        isOverlay && "bg-zinc-900 border-amber-500/50 shadow-[0_20px_50px_rgba(0,0,0,0.5)] scale-[1.02] z-50 cursor-grabbing"
      )}
    >
      <div className="space-y-2.5">
        {/* Key + Type */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] font-mono text-white/30 font-medium">{item.key}</span>
          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-gradient-to-b from-amber-500/10 to-amber-500/5 border border-amber-500/20 text-amber-400">
            Deal
          </span>
        </div>

        {/* Title */}
        <h3 className="text-sm font-semibold text-white leading-snug line-clamp-2 group-hover:text-amber-400 transition-colors">
          {item.title}
        </h3>

        {/* Deal Value */}
        <div className="flex items-center justify-between gap-2 bg-white/5 rounded p-2">
          <div className="flex items-center gap-1.5">
            <DollarSign size={12} className="text-emerald-400" />
            <span className="text-sm font-bold text-emerald-400">{formatter.format(dealValue)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Target size={12} className="text-amber-400" />
            <span className="text-xs font-semibold text-amber-400">{probability}%</span>
          </div>
        </div>

        {/* Weighted Value */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <TrendingUp size={10} className="text-blue-400" />
            <span className="text-[10px] text-blue-400 font-medium">
              Weighted: {formatter.format(weightedValue)}
            </span>
          </div>
          {item.expected_close_date && (
            <div className="flex items-center gap-1">
              <Calendar size={10} className="text-white/30" />
              <span className="text-[10px] text-white/40">
                {new Date(item.expected_close_date).toLocaleDateString("en-IN", {
                  day: "numeric", month: "short",
                })}
              </span>
            </div>
          )}
        </div>

        {/* Assignee + Actions */}
        <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-white/5">
          <div className="flex items-center gap-1.5 min-w-0">
            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-[8px] font-bold text-white shrink-0">
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
  );
};

export default PipelineStageCard;
