export const ISSUE_TYPES = {
  EPIC: {
    label: "Epic",
    color: "purple",
    gradient: "from-purple-500/10 to-purple-500/5",
    border: "border-purple-500/20",
    text: "text-purple-400",
    modes: ["dev"],
    icon: "layout",
  },
  STORY: {
    label: "Story",
    color: "green",
    gradient: "from-green-500/10 to-green-500/5",
    border: "border-green-500/20",
    text: "text-green-400",
    modes: ["dev"],
    icon: "book-open",
  },
  TASK: {
    label: "Task",
    color: "blue",
    gradient: "from-blue-500/10 to-blue-500/5",
    border: "border-blue-500/20",
    text: "text-blue-400",
    modes: ["dev", "ops", "sales"],
    icon: "check-square",
  },
  BUG: {
    label: "Bug",
    color: "red",
    gradient: "from-red-500/10 to-red-500/5",
    border: "border-red-500/20",
    text: "text-red-400",
    modes: ["dev"],
    icon: "bug",
  },
  SUBTASK: {
    label: "Sub-task",
    color: "zinc",
    gradient: "from-zinc-500/10 to-zinc-500/5",
    border: "border-zinc-500/20",
    text: "text-zinc-400",
    modes: ["dev", "ops"],
    icon: "indent",
  },
  DEAL: {
    label: "Deal",
    color: "amber",
    gradient: "from-amber-500/10 to-amber-500/5",
    border: "border-amber-500/20",
    text: "text-amber-400",
    modes: ["sales"],
    icon: "target",
  },
  TICKET: {
    label: "Ticket",
    color: "cyan",
    gradient: "from-cyan-500/10 to-cyan-500/5",
    border: "border-cyan-500/20",
    text: "text-cyan-400",
    modes: ["ops", "support"],
    icon: "ticket",
  },
  REQUEST: {
    label: "Request",
    color: "pink",
    gradient: "from-pink-500/10 to-pink-500/5",
    border: "border-pink-500/20",
    text: "text-pink-400",
    modes: ["ops"],
    icon: "help-circle",
  },
  APPROVAL: {
    label: "Approval",
    color: "emerald",
    gradient: "from-emerald-500/10 to-emerald-500/5",
    border: "border-emerald-500/20",
    text: "text-emerald-400",
    modes: ["ops"],
    icon: "thumbs-up",
  },
  MILESTONE: {
    label: "Milestone",
    color: "yellow",
    gradient: "from-yellow-500/10 to-yellow-500/5",
    border: "border-yellow-500/20",
    text: "text-yellow-400",
    modes: ["dev", "ops", "sales"],
    icon: "flag",
  },
};

export const ISSUE_TYPE_OPTIONS = Object.entries(ISSUE_TYPES).map(([value, config]) => ({
  value,
  label: config.label,
  color: config.color,
}));

export const getIssueTypeConfig = (type) => ISSUE_TYPES[type] || ISSUE_TYPES.TASK;

export const ISSUE_TYPES_FOR_MODE = (mode) =>
  Object.entries(ISSUE_TYPES)
    .filter(([, config]) => config.modes.includes(mode))
    .map(([value, config]) => ({ value, label: config.label }));
