import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, Target, Check, Loader2 } from "lucide-react";

const SprintSelector = ({ sprints, activeSprintId, selectedSprintId, onSelect, loading, compact = false, showAllOption, allLabel = "All Sprints" }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const activeSprint = sprints?.find((s) => s.id === (selectedSprintId || activeSprintId));
  const planningSprints = sprints?.filter((s) => s.status === "PLANNING") || [];
  const activeSprintsList = sprints?.filter((s) => s.status === "ACTIVE") || [];
  const completedSprints = sprints?.filter((s) => s.status === "COMPLETED") || [];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const renderOption = (sprint) => (
    <button
      key={sprint.id}
      onClick={() => { onSelect?.(sprint.id); setOpen(false); }}
      className={cn(
        "w-full flex items-center gap-2 px-3 py-2 text-left text-sm transition-colors",
        sprint.id === activeSprintId
          ? "bg-blue-500/10 text-blue-400"
          : "text-white/70 hover:bg-zinc-800",
      )}
    >
      <Target size={12} className={cn(
        sprint.status === "ACTIVE" ? "text-emerald-400" :
        sprint.status === "COMPLETED" ? "text-blue-400" : "text-white/30",
      )} />
      <span className="flex-1 truncate">{sprint.name}</span>
      {sprint.id === activeSprintId && <Check size={12} className="shrink-0" />}
    </button>
  );

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "flex items-center gap-2 rounded-lg border transition-all",
          open ? "border-blue-500/50 bg-zinc-800" : "border-zinc-800 bg-zinc-900/60 hover:border-zinc-700",
          compact ? "px-2 py-1.5 text-xs" : "px-3 py-2 text-sm",
        )}
      >
        {loading ? (
            <Loader2 size={14} className="animate-spin text-white/40" />
        ) : activeSprint ? (
          <>
            <Target size={14} className="text-emerald-400" />
            <span className="text-white font-medium">{activeSprint.name}</span>
          </>
        ) : (
          <span className="text-white/40">Select sprint</span>
        )}
        <ChevronDown size={14} className={cn("text-white/30 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 w-64 z-50 rounded-xl bg-zinc-900 border border-zinc-800 shadow-2xl overflow-hidden">
          <div className="max-h-64 overflow-y-auto py-1">
            {loading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 size={16} className="animate-spin text-white/30" />
              </div>
            ) : sprints?.length > 0 ? (
              <>
                {activeSprintsList.length > 0 && (
                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white/30">
                    Active
                  </div>
                )}
                {activeSprintsList.map(renderOption)}

                {planningSprints.length > 0 && (
                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white/30 mt-1">
                    Planning
                  </div>
                )}
                {planningSprints.map(renderOption)}

                {completedSprints.length > 0 && (
                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white/30 mt-1">
                    Completed
                  </div>
                )}
                {completedSprints.map(renderOption)}

                {showAllOption && (
                  <button
                    onClick={() => { onSelect?.(null); setOpen(false); }}
                    className={cn(
                      "w-full flex items-center gap-2 px-3 py-2 text-left text-sm transition-colors",
                      !selectedSprintId ? "bg-blue-500/10 text-blue-400" : "text-white/50 hover:bg-zinc-800"
                    )}
                  >
                    <Target size={12} className="text-white/30" />
                    <span className="flex-1">{allLabel}</span>
                    {!selectedSprintId && <Check size={12} />}
                  </button>
                )}
                {!showAllOption && !activeSprintId && (
                  <button
                    onClick={() => { onSelect?.(null); setOpen(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm text-white/50 hover:bg-zinc-800"
                  >
                    <span className="flex-1">Backlog (no sprint)</span>
                    {!activeSprintId && <Check size={12} />}
                  </button>
                )}
              </>
            ) : (
              <p className="text-sm text-white/30 text-center py-4">No sprints</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SprintSelector;
