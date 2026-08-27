import React from "react";
import { cn } from "@/lib/utils";
import { Loader2, ArrowRight } from "lucide-react";

const EpicBar = ({ epic, startDate, endDate, totalDays, index, onClick }) => {
  const epicStart = epic.due_date ? new Date(epic.due_date) : startDate;
  const epicEnd = epic.due_date ? new Date(epic.due_date.getTime() + 14 * 86400000) : endDate;
  const left = ((epicStart - startDate) / (endDate - startDate)) * 100;
  const width = ((epicEnd - epicStart) / (endDate - startDate)) * 100;

  const priorityColors = {
    CRITICAL: "bg-red-500",
    HIGH: "bg-orange-500",
    MEDIUM: "bg-blue-500",
    LOW: "bg-zinc-500",
    NONE: "bg-purple-500",
  };

  const barColor = priorityColors[epic.priority] || "bg-purple-500";

  return (
    <div
      onClick={() => onClick?.(epic)}
      className="flex items-center gap-3 group cursor-pointer hover:bg-zinc-800/50 rounded-lg px-2 -mx-2 transition-colors"
      style={{ minHeight: 36 }}
    >
      <span className="text-[10px] font-mono text-white/20 w-16 shrink-0">{epic.key}</span>
      <span className="text-xs text-white/70 truncate flex-1">{epic.title}</span>
      <div className="relative flex-1 h-5 bg-zinc-800 rounded overflow-hidden" style={{ minWidth: 100 }}>
        <div
          className={cn("absolute inset-y-0 rounded", barColor)}
          style={{
            left: `${Math.max(0, left)}%`,
            width: `${Math.min(100 - Math.max(0, left), Math.max(width, 2))}%`,
            opacity: 0.7,
          }}
        />
        {epic.completion_pct > 0 && (
          <div
            className="absolute inset-y-0 rounded bg-blue-400"
            style={{
              left: `${Math.max(0, left)}%`,
              width: `${Math.min(100 - Math.max(0, left), Math.max(width * (epic.completion_pct / 100), 2))}%`,
              opacity: 0.4,
            }}
          />
        )}
      </div>
      <span className="text-[10px] text-white/40 w-12 text-right">{epic.completion_pct || 0}%</span>
      <span className="text-[10px] font-mono text-white/20 w-20 text-right">
        {epic.due_date ? new Date(epic.due_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "—"}
      </span>
    </div>
  );
};

const EpicTimeline = ({ epics, loading, onEpicClick, className }) => {
  if (loading) {
    return (
      <div className={cn("flex items-center justify-center h-48", className)}>
        <Loader2 size={20} className="animate-spin text-white/20" />
      </div>
    );
  }

  if (!epics?.length) {
    return (
      <div className={cn("flex flex-col items-center justify-center h-48 text-center", className)}>
        <ArrowRight size={24} className="text-white/20 mb-2" />
        <p className="text-sm text-white/30">No epics with timeline data</p>
        <p className="text-xs text-white/20 mt-1">Create epics with due dates to see them on a timeline</p>
      </div>
    );
  }

  const now = new Date();
  const dates = epics
    .filter((e) => e.due_date)
    .map((e) => new Date(e.due_date));
  const startDate = dates.length > 0
    ? new Date(Math.min(...dates.map((d) => d.getTime()), now.getTime() - 30 * 86400000))
    : new Date(now.getTime() - 30 * 86400000);
  const endDate = dates.length > 0
    ? new Date(Math.max(...dates.map((d) => d.getTime()), now.getTime() + 60 * 86400000))
    : new Date(now.getTime() + 60 * 86400000);
  const totalDays = Math.max(1, (endDate - startDate) / 86400000);

  // Generate month markers
  const months = [];
  const cursor = new Date(startDate);
  while (cursor <= endDate) {
    months.push(new Date(cursor));
    cursor.setMonth(cursor.getMonth() + 1);
  }

  return (
    <div className={cn("space-y-1", className)}>
      {/* Header */}
      <div className="flex items-center gap-3 px-2 pb-2 text-[9px] font-bold uppercase tracking-wider text-white/20 border-b border-zinc-800">
        <span className="w-16">Key</span>
        <span className="flex-1">Epic</span>
        <span className="flex-1">Timeline</span>
        <span className="w-12 text-right">Done</span>
        <span className="w-20 text-right">Due</span>
      </div>

      {/* Month markers */}
      <div className="flex items-center px-2 pb-2" style={{ marginLeft: "calc(16px + 1rem + 8rem + 0.75rem)" }}>
        {months.map((m, i) => {
          const left = ((m - startDate) / (endDate - startDate)) * 100;
          const nextMonth = new Date(m);
          nextMonth.setMonth(nextMonth.getMonth() + 1);
          const monthWidth = ((nextMonth - m) / (endDate - startDate)) * 100;
          return (
            <div key={i} className="relative text-[8px] text-white/20" style={{ left: `${left}%`, width: `${monthWidth}%` }}>
              {m.toLocaleDateString("en-IN", { month: "short", year: "2-digit" })}
            </div>
          );
        })}
      </div>

      {/* Today marker line */}
      <div className="relative">
        <div
          className="absolute top-0 bottom-0 w-px bg-red-500/30 z-10"
          style={{ left: `${((now - startDate) / (endDate - startDate)) * 100}%` }}
        />
        <div className="space-y-0.5">
          {epics.map((epic, i) => (
            <EpicBar
              key={epic.id || i}
              epic={epic}
              startDate={startDate}
              endDate={endDate}
              totalDays={totalDays}
              index={i}
              onClick={onEpicClick}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default EpicTimeline;
