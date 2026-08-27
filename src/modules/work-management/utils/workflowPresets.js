export const WORKFLOW_PRESETS = {
  dev_scrum: {
    name: "Dev — Scrum",
    scope: "dev_scrum",
    description: "Full Scrum workflow: Backlog → Triage → To Do → In Progress → In Review → QA → Done",
    statuses: [
      { name: "Backlog", slug: "backlog", color: "gray", category: "backlog", is_start: true },
      { name: "Triage", slug: "triage", color: "gray", category: "todo" },
      { name: "To Do", slug: "todo", color: "blue", category: "todo" },
      { name: "In Progress", slug: "in_progress", color: "amber", category: "in_progress" },
      { name: "In Review", slug: "in_review", color: "purple", category: "review" },
      { name: "QA", slug: "qa", color: "cyan", category: "review" },
      { name: "Done", slug: "done", color: "green", category: "done", is_end: true },
    ],
    transitions: {
      BACKLOG: ["TRIAGE"],
      TRIAGE: ["TODO"],
      TODO: ["IN_PROGRESS"],
      IN_PROGRESS: ["IN_REVIEW", "BLOCKED"],
      IN_REVIEW: ["QA", "IN_PROGRESS"],
      QA: ["DONE", "IN_PROGRESS"],
      DONE: [],
    },
  },
  dev_kanban: {
    name: "Dev — Kanban",
    scope: "dev_kanban",
    description: "Lean Kanban: To Do → In Progress → Blocked → Done",
    statuses: [
      { name: "To Do", slug: "todo", color: "blue", category: "todo", is_start: true },
      { name: "In Progress", slug: "in_progress", color: "amber", category: "in_progress" },
      { name: "Blocked", slug: "blocked", color: "red", category: "in_progress" },
      { name: "Done", slug: "done", color: "green", category: "done", is_end: true },
    ],
    transitions: {
      TODO: ["IN_PROGRESS"],
      IN_PROGRESS: ["BLOCKED", "DONE"],
      BLOCKED: ["IN_PROGRESS"],
      DONE: [],
    },
  },
  support_ticket: {
    name: "Support — Ticket",
    scope: "support_ticket",
    description: "Support ticket lifecycle: New → Assigned → In Progress → Waiting → Resolved → Closed",
    statuses: [
      { name: "New", slug: "new", color: "blue", category: "todo", is_start: true },
      { name: "Assigned", slug: "assigned", color: "purple", category: "todo" },
      { name: "In Progress", slug: "in_progress", color: "amber", category: "in_progress" },
      { name: "Waiting on Customer", slug: "waiting_on_customer", color: "gray", category: "in_progress" },
      { name: "Resolved", slug: "resolved", color: "cyan", category: "review" },
      { name: "Closed", slug: "closed", color: "green", category: "done", is_end: true },
    ],
    transitions: {
      NEW: ["ASSIGNED"],
      ASSIGNED: ["IN_PROGRESS"],
      IN_PROGRESS: ["WAITING_ON_CUSTOMER", "RESOLVED"],
      WAITING_ON_CUSTOMER: ["IN_PROGRESS", "RESOLVED"],
      RESOLVED: ["CLOSED"],
      CLOSED: [],
    },
  },
  sales_deal: {
    name: "Sales — Deal Pipeline",
    scope: "sales_deal",
    description: "Sales pipeline: Lead → Qualified → Proposal → Negotiation → Won/Lost",
    statuses: [
      { name: "Lead", slug: "lead", color: "blue", category: "todo", is_start: true },
      { name: "Qualified", slug: "qualified", color: "purple", category: "todo" },
      { name: "Proposal Sent", slug: "proposal_sent", color: "amber", category: "in_progress" },
      { name: "Negotiation", slug: "negotiation", color: "orange", category: "in_progress" },
      { name: "Won", slug: "won", color: "green", category: "done", is_end: true },
      { name: "Lost", slug: "lost", color: "red", category: "cancelled", is_end: true },
    ],
    transitions: {
      LEAD: ["QUALIFIED"],
      QUALIFIED: ["PROPOSAL_SENT"],
      PROPOSAL_SENT: ["NEGOTIATION", "LOST"],
      NEGOTIATION: ["WON", "LOST"],
      WON: [],
      LOST: [],
    },
  },
  ops_approval: {
    name: "Ops — Approval",
    scope: "ops_approval",
    description: "Approval workflow: Requested → Review → Approved/Rejected → Completed",
    statuses: [
      { name: "Requested", slug: "requested", color: "blue", category: "todo", is_start: true },
      { name: "Under Review", slug: "under_review", color: "purple", category: "in_progress" },
      { name: "Approved", slug: "approved", color: "green", category: "done", is_end: true },
      { name: "Rejected", slug: "rejected", color: "red", category: "cancelled", is_end: true },
      { name: "Completed", slug: "completed", color: "emerald", category: "done", is_end: true },
    ],
    transitions: {
      REQUESTED: ["UNDER_REVIEW"],
      UNDER_REVIEW: ["APPROVED", "REJECTED"],
      APPROVED: ["COMPLETED"],
      REJECTED: [],
      COMPLETED: [],
    },
  },
};

export const getWorkflowPreset = (scope) => WORKFLOW_PRESETS[scope] || null;

export const getDefaultWorkflowForIssueType = (issueType) => {
  const typeMap = {
    EPIC: "dev_scrum",
    STORY: "dev_scrum",
    TASK: "dev_kanban",
    BUG: "dev_scrum",
    SUBTASK: "dev_kanban",
    DEAL: "sales_deal",
    TICKET: "support_ticket",
    REQUEST: "ops_approval",
    APPROVAL: "ops_approval",
  };
  const scope = typeMap[issueType] || "dev_kanban";
  return WORKFLOW_PRESETS[scope];
};
