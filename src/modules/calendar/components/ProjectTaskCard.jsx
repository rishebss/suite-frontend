import React from 'react';
import { format, parseISO } from 'date-fns';
import { Kanban } from 'lucide-react';
import { cn } from '@/lib/utils';

const ProjectTaskCard = ({ task, onClick }) => {
  const isOverdue = task.status_details?.name === 'overdue' || (task.due_date && new Date(task.due_date) < new Date() && task.status_details?.category !== 'done');
  return (
    <button type="button" onClick={onClick} className={cn("w-full text-left p-3 rounded-xl space-y-1.5 transition-all cursor-pointer", isOverdue ? "bg-red-500/10 border border-red-500/30 hover:bg-red-500/15" : "bg-white/[0.06] border border-white/10 hover:bg-white/[0.09]")}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="shrink-0 w-6 h-6 rounded flex items-center justify-center border text-cyan-400 bg-cyan-500/10 border-cyan-500/20">
            <Kanban size={10} />
          </span>
          <p className="text-sm font-bold text-white leading-tight truncate">{task.title}</p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {task.issue_type && (
            <span className="px-1.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">{task.issue_type}</span>
          )}
          {task.priority === 'critical' && <span className="px-1.5 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-[8px] font-black uppercase tracking-wider text-red-400">Critical</span>}
          {task.priority === 'high' && <span className="px-1.5 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-[8px] font-black uppercase tracking-wider text-red-400">High</span>}
          {task.priority === 'medium' && <span className="px-1.5 py-0.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-[8px] font-black uppercase tracking-wider text-yellow-400">Med</span>}
        </div>
      </div>
      <div className="text-[10px] text-white/30 font-medium space-y-0.5">
        {task.due_date && <p>Due: {format(parseISO(task.due_date), 'MMM d, yyyy')}</p>}
        {task.key && <p>Key: {task.key}</p>}
        {task.assignee_details?.full_name && <p>Assignee: {task.assignee_details.full_name}</p>}
      </div>
    </button>
  );
};

export default ProjectTaskCard;
