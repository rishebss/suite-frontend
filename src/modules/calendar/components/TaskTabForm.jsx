import React, { useRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const TaskTabForm = ({ data, onChange, isAdmin, onOpenDropdown }) => {
  const priorityRef = useRef(null);
  const userRef = useRef(null);

  return (
    <>
      <div className="space-y-2">
        <label className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/30">Task Name *</label>
        <input autoFocus value={data.title} onChange={e => onChange({ title: e.target.value })}
          placeholder="Enter task name"
          className="w-full bg-white/5 border border-zinc-800 rounded-md h-11 px-4 text-sm text-white placeholder:text-white/20 focus:border-blue-500/40 outline-none transition-all" />
      </div>
      <div className="space-y-2">
        <label className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/30">Description</label>
        <textarea value={data.description} onChange={e => onChange({ description: e.target.value })}
          placeholder="Add details about this task..."
          rows={3}
          className="w-full bg-white/5 border border-zinc-800 rounded-md px-4 py-3 text-sm text-white placeholder:text-white/20 focus:border-blue-500/40 outline-none transition-all resize-none" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2 relative">
          <label className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/30">Priority</label>
          <button ref={priorityRef} type="button" onClick={() => onOpenDropdown('priority', priorityRef)}
            className={cn("w-full bg-white/5 border border-zinc-800 rounded-md h-11 px-4 flex items-center justify-between text-sm transition-all hover:border-zinc-700", data.priority === 'high' ? 'text-red-400' : data.priority === 'medium' ? 'text-yellow-400' : 'text-blue-400')}>
            <span className="capitalize">{data.priority}</span>
            <ChevronDown size={14} className="text-white/20" />
          </button>
        </div>
        <div className="space-y-2 relative">
          <label className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/30">Assign To</label>
          {isAdmin ? (
            <button ref={userRef} type="button" onClick={() => onOpenDropdown('user', userRef)}
              className="w-full bg-white/5 border border-zinc-800 rounded-md h-11 px-4 flex items-center justify-between text-sm text-white/60 hover:border-zinc-700 transition-all">
              {data.assignedTo ? <span className="text-white">{data.assignedTo.first_name || data.assignedTo.email}</span> : <span className="text-white/20">Select a team member...</span>}
              <ChevronDown size={14} className="text-white/20" />
            </button>
          ) : (
            <div className="w-full bg-white/5 border border-zinc-800 rounded-md h-11 px-4 flex items-center text-sm text-white/40">{data.assignedTo?.first_name || 'Unassigned'}</div>
          )}
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/30">Deadline *</label>
        <input type="datetime-local" value={data.start} onChange={e => onChange({ start: e.target.value })}
          className="w-full bg-white/5 border border-zinc-800 rounded-md h-11 px-4 text-sm text-white focus:border-blue-500/40 outline-none transition-all [color-scheme:dark]" />
      </div>
    </>
  );
};

export default TaskTabForm;
