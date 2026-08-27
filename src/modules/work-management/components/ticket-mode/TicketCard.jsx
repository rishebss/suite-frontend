import React from "react";
import { cn } from "@/lib/utils";
import { MessageSquare, User, Mail, Clock, ArrowRight } from "lucide-react";
import SLAIndicator from "./SLAIndicator";

const PRIORITY_STYLES = {
  CRITICAL: "text-red-400 bg-red-500/10 border-red-500/20",
  HIGH: "text-orange-400 bg-orange-500/10 border-orange-500/20",
  MEDIUM: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  LOW: "text-blue-400 bg-blue-500/10 border-blue-500/20",
};

const TicketCard = ({ ticket, onSelect }) => {
  const priorityStyle = PRIORITY_STYLES[ticket.priority] || PRIORITY_STYLES.MEDIUM;

  return (
    <div
      onClick={() => onSelect?.(ticket)}
      className={cn(
        "p-4 rounded-lg border bg-zinc-900/40 cursor-pointer transition-all duration-200",
        ticket.sla_breached
          ? "border-red-500/30 hover:border-red-500/50"
          : ticket.sla_status === "WARNING"
            ? "border-amber-500/30 hover:border-amber-500/50"
            : "border-white/5 hover:border-blue-500/30",
        "hover:bg-zinc-900/60"
      )}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-[10px] font-mono text-white/30 font-medium shrink-0">{ticket.key}</span>
          <span className={cn(
            "px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border",
            priorityStyle
          )}>
            {ticket.priority}
          </span>
        </div>
        <SLAIndicator
          slaStatus={ticket.sla_status || "NO_SLA"}
          remainingMinutes={ticket.response_remaining_minutes || ticket.resolution_remaining_minutes}
          compact
        />
      </div>

      <h3 className="text-sm font-semibold text-white mb-2 line-clamp-2">{ticket.title}</h3>

      <div className="flex items-center gap-3 text-[10px] text-white/40 mt-3">
        {ticket.assignee ? (
          <span className="flex items-center gap-1">
            <User size={10} />
            {ticket.assignee.first_name} {ticket.assignee.last_name}
          </span>
        ) : (
          <span className="flex items-center gap-1 text-amber-400/60">
            <User size={10} />
            Unassigned
          </span>
        )}
        {ticket.requester_email && (
          <span className="flex items-center gap-1">
            <Mail size={10} />
            {ticket.requester_email}
          </span>
        )}
        <span className="flex items-center gap-1">
          <Clock size={10} />
          {ticket.age_hours?.toFixed(1)}h
        </span>
        {ticket.comment_count > 0 && (
          <span className="flex items-center gap-1">
            <MessageSquare size={10} />
            {ticket.comment_count}
          </span>
        )}
      </div>
    </div>
  );
};

export default TicketCard;
