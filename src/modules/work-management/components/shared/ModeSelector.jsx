import React from "react";
import { cn } from "@/lib/utils";
import { Code2, DollarSign, TicketCheck, Layers } from "lucide-react";

const MODES = [
  {
    id: "dev",
    label: "Dev",
    icon: Code2,
    color: "text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/20",
    activeBg: "bg-blue-600",
    activeText: "text-white",
    issueTypes: ["TASK", "STORY", "BUG", "EPIC", "SUBTASK"],
    description: "Sprints, backlogs, epics, story points",
  },
  {
    id: "sales",
    label: "Sales",
    icon: DollarSign,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/20",
    activeBg: "bg-emerald-600",
    activeText: "text-white",
    issueTypes: ["DEAL"],
    description: "Pipeline, targets, forecasts",
  },
  {
    id: "ticketing",
    label: "Support",
    icon: TicketCheck,
    color: "text-cyan-400",
    bg: "bg-cyan-500/10 border-cyan-500/20",
    activeBg: "bg-cyan-600",
    activeText: "text-white",
    issueTypes: ["TICKET", "REQUEST"],
    description: "SLA tracking, ticket queues, CSAT",
  },
];

const ModeSelector = ({ enabledIssueTypes = [], onModeChange, className }) => {
  const activeMode = MODES.find((m) =>
    m.issueTypes.some((t) => enabledIssueTypes.includes(t))
  ) || MODES[0];

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      {MODES.map((mode) => {
        const Icon = mode.icon;
        const isActive = mode.id === activeMode.id;
        const isAvailable = mode.issueTypes.some((t) => enabledIssueTypes.includes(t));

        return (
          <button
            key={mode.id}
            onClick={() => onModeChange?.(mode)}
            disabled={!isAvailable}
            title={isAvailable ? mode.description : `${mode.label} mode not enabled`}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all",
              isActive && isAvailable
                ? `${mode.activeBg} ${mode.activeText} shadow-sm`
                : isAvailable
                  ? `${mode.bg} ${mode.color} hover:brightness-110`
                  : "bg-zinc-800/50 text-zinc-600 cursor-not-allowed",
            )}
          >
            <Icon size={14} />
            {mode.label}
          </button>
        );
      })}
    </div>
  );
};

export default ModeSelector;
