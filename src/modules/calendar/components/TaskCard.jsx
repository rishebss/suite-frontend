import React from 'react';
import { format, parseISO } from 'date-fns';
import { ListChecks } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TASK_STATUS_OPTIONS, TASK_STATUS_STYLES } from '../constants';

const TaskCard = ({ task, onClick }) => {
  const isOverdue = task.status === 'overdue';
  const statusStyle = TASK_STATUS_STYLES[task.status];
  const showStatusBadge = !!statusStyle;
  return (
    <button type="button" onClick={onClick} className={cn("w-full text-left p-3 rounded-xl space-y-1.5 transition-all cursor-pointer", isOverdue ? "bg-red-500/10 border border-red-500/30 hover:bg-red-500/15" : "bg-white/[0.06] border border-white/10 hover:bg-white/[0.09]")}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="shrink-0 w-6 h-6 rounded flex items-center justify-center border text-blue-400 bg-blue-500/10 border-blue-500/20">
            <ListChecks size={10} />
          </span>
          <p className="text-sm font-bold text-white leading-tight truncate">{task.title}</p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {showStatusBadge ? (
            <span className={cn("px-1.5 py-0.5 rounded-full border text-[8px] font-black uppercase tracking-wider", statusStyle)}>
              {TASK_STATUS_OPTIONS.find(o => o.value === task.status)?.label || task.status}
            </span>
          ) : (
            <>
              {task.priority === 'high' && (
                <span className="px-1.5 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-[8px] font-black uppercase tracking-wider text-red-400">High</span>
              )}
              {task.priority === 'medium' && (
                <span className="px-1.5 py-0.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-[8px] font-black uppercase tracking-wider text-yellow-400">Med</span>
              )}
              <span className="px-1.5 py-0.5 rounded-full border text-[8px] font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 border-blue-500/20">Task</span>
            </>
          )}
        </div>
      </div>
      <div className="text-[10px] text-white/30 font-medium space-y-0.5">
        {task.start && <p>Deadline: {format(parseISO(task.start), 'MMM d, h:mm a')}</p>}
        {task.assigned_to_name && <p>Assigned to: {task.assigned_to_name}</p>}
        {task.user_name && <p>Created by: {task.user_name}</p>}
      </div>
    </button>
  );
};

export default TaskCard;
