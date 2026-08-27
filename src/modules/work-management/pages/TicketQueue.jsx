import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  ArrowLeft, Loader2, Ticket, AlertCircle, AlertTriangle,
  Users, RefreshCw, Clock, Filter, ArrowUpDown, Inbox, X
} from "lucide-react";
import { useProject } from "../hooks/useProjects";
import { useTicketQueue } from "../hooks/useTicketQueue";
import TicketCard from "../components/ticket-mode/TicketCard";

const SORT_OPTIONS = [
  { value: "sla", label: "SLA Risk" },
  { value: "priority", label: "Priority" },
  { value: "age", label: "Age" },
];

const STATUS_FILTERS = [
  { value: "", label: "All" },
  { value: "open", label: "Open" },
  { value: "breached", label: "Breached" },
  { value: "warning", label: "At Risk" },
  { value: "unassigned", label: "Unassigned" },
  { value: "done", label: "Resolved" },
];

const TicketQueue = () => {
  const { workspaceId, projectId } = useParams();
  const navigate = useNavigate();
  const { project } = useProject(projectId);
  const [sortBy, setSortBy] = useState("sla");
  const [statusFilter, setStatusFilter] = useState("");
  const [assigneeFilter, setAssigneeFilter] = useState("");
  const { tickets, summary, loading, refetch } = useTicketQueue(projectId, {
    sort: sortBy,
    ...(assigneeFilter ? { assignee: assigneeFilter } : {}),
  });

  const filteredTickets = statusFilter
    ? tickets.filter((t) => {
        if (statusFilter === "breached") return t.sla_breached;
        if (statusFilter === "warning") return t.sla_status === "WARNING";
        if (statusFilter === "unassigned") return !t.assignee;
        if (statusFilter === "open") return t.status?.category !== "done";
        if (statusFilter === "done") return t.status?.category === "done";
        return true;
      })
    : tickets;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <header className="px-10 py-6 border-b border-zinc-800 bg-black/50 backdrop-blur-xl shrink-0">
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={() => navigate(`/work/${workspaceId}/${projectId}`)}
            className="p-1.5 rounded-lg hover:bg-zinc-800 text-white/40 hover:text-white transition-colors"
          >
            <ArrowLeft size={16} />
          </button>
          <span className="text-xs font-mono text-white/30 font-medium">
            {project?.key || "Loading..."}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">
              <span className="text-cyan-400">Ticket Queue</span> &middot; {project?.name || ""}
            </h1>
            <p className="text-sm text-white/40 font-medium mt-1">
              {summary ? `${summary.open} open, ${summary.breached} breached, ${summary.unassigned} unassigned` : "Support ticket queue"}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20">
              <AlertCircle size={14} className="text-red-400" />
              <span className="text-sm font-bold text-red-400">{summary?.breached || 0}</span>
              <span className="text-[9px] text-red-400/60 uppercase">Breached</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <AlertTriangle size={14} className="text-amber-400" />
              <span className="text-sm font-bold text-amber-400">{summary?.warning || 0}</span>
              <span className="text-[9px] text-amber-400/60 uppercase">At Risk</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700">
              <Inbox size={14} className="text-white/60" />
              <span className="text-sm font-bold text-white">{summary?.total || 0}</span>
              <span className="text-[9px] text-white/40 uppercase">Total</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <Users size={14} className="text-blue-400" />
              <span className="text-sm font-bold text-blue-400">{summary?.unassigned || 0}</span>
              <span className="text-[9px] text-blue-400/60 uppercase">Unassigned</span>
            </div>
          </div>
        </div>
      </header>

      {/* Controls */}
      <div className="px-10 py-3 border-b border-zinc-800 bg-zinc-900/10 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Sort */}
          <div className="flex items-center gap-2">
            <ArrowUpDown size={12} className="text-white/40" />
            <span className="text-[10px] text-white/40 font-medium uppercase tracking-wider">Sort:</span>
            <div className="flex gap-1">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setSortBy(opt.value)}
                  className={cn(
                    "px-2.5 py-1 rounded text-[10px] font-semibold transition-all",
                    sortBy === opt.value
                      ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                      : "text-white/40 hover:text-white border border-transparent"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-2">
            <Filter size={12} className="text-white/40" />
            <span className="text-[10px] text-white/40 font-medium uppercase tracking-wider">Status:</span>
            <div className="flex gap-1">
              {STATUS_FILTERS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setStatusFilter(statusFilter === opt.value ? "" : opt.value)}
                  className={cn(
                    "px-2.5 py-1 rounded text-[10px] font-semibold transition-all",
                    statusFilter === opt.value
                      ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                      : "text-white/40 hover:text-white border border-transparent"
                  )}
                >
                  {opt.label}
                </button>
              ))}
              {statusFilter && (
                <button
                  onClick={() => setStatusFilter("")}
                  className="px-1.5 py-1 rounded text-white/30 hover:text-white transition-all"
                >
                  <X size={10} />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {assigneeFilter && (
            <button
              onClick={() => setAssigneeFilter("")}
              className="flex items-center gap-1 px-2 py-1 rounded text-[10px] text-white/40 hover:text-white"
            >
              <X size={10} /> Clear assignee
            </button>
          )}
          <button
            onClick={refetch}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-semibold text-white/40 hover:text-white transition-all"
          >
            <RefreshCw size={12} />
            Refresh
          </button>
        </div>
      </div>

      {/* Ticket List */}
      <main className="flex-1 overflow-y-auto p-10 custom-scrollbar">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <Loader2 size={24} className="animate-spin text-white/20" />
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-4">
              <Ticket size={28} className="text-white/20" />
            </div>
            <h2 className="text-lg font-bold text-white mb-2">
              {statusFilter ? "No tickets match this filter" : "No tickets in queue"}
            </h2>
            <p className="text-sm text-white/40 mb-6 max-w-md">
              {statusFilter ? "Try adjusting the filter criteria" : "Create a work item with issue_type=TICKET to add it to the support queue."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredTickets.map((ticket) => (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
                onSelect={() => navigate(`/work/${workspaceId}/${projectId}/item/${ticket.id}`)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default TicketQueue;
