import React, { useRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getFollowUpStatusTextColor } from '../constants';

const FollowUpTabForm = ({ data, onChange, isAdmin, onOpenDropdown }) => {
  const followUpStatusRef = useRef(null);
  const pipelineRef = useRef(null);
  const userRef = useRef(null);
  const contactRef = useRef(null);

  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/30">Follow-Up Title *</label>
          <input autoFocus value={data.title} onChange={e => onChange({ title: e.target.value })}
            placeholder="Enter follow-up title"
            className="w-full bg-white/5 border border-zinc-800 rounded-md h-11 px-4 text-sm text-white placeholder:text-white/20 focus:border-blue-500/40 outline-none transition-all" />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/30">Status</label>
          <button ref={followUpStatusRef} type="button" onClick={() => onOpenDropdown('followUpStatus', followUpStatusRef)}
            className={cn("w-full bg-white/5 border border-zinc-800 rounded-md h-11 px-4 flex items-center justify-between text-sm transition-all hover:border-zinc-700 capitalize",
              getFollowUpStatusTextColor(data.followUpStatus))}>
            <span>{data.followUpStatus.replace('_', ' ')}</span>
            <ChevronDown size={14} className="text-white/20" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2 relative">
          <label className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/30">Pipeline</label>
          <button ref={pipelineRef} type="button" onClick={() => onOpenDropdown('pipeline', pipelineRef)}
            className={cn("w-full bg-white/5 border border-zinc-800 rounded-md h-11 px-4 flex items-center justify-between text-sm transition-all hover:border-zinc-700", data.selectedPipeline ? "text-white" : "text-white/20")}>
            <span>{data.selectedPipeline?.name || 'Select pipeline...'}</span>
            <ChevronDown size={14} className="text-white/20" />
          </button>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/30">Follow-Up Date *</label>
          <input type="datetime-local" value={data.start} onChange={e => onChange({ start: e.target.value })}
            className="w-full bg-white/5 border border-zinc-800 rounded-md h-11 px-4 text-sm text-white focus:border-blue-500/40 outline-none transition-all [color-scheme:dark]" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2 relative">
          <label className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/30">Assign To</label>
          {isAdmin ? (
            <button ref={userRef} type="button" onClick={() => onOpenDropdown('user', userRef)} disabled={!data.selectedPipeline}
              className={cn("w-full bg-white/5 border border-zinc-800 rounded-md h-11 px-4 flex items-center justify-between text-sm transition-all", data.selectedPipeline ? "text-white/60 hover:border-zinc-700 cursor-pointer" : "text-white/20 cursor-not-allowed opacity-40")}>
              {data.assignedTo ? <span className="text-white">{data.assignedTo.first_name || data.assignedTo.email}</span> : <span className="text-white/20">Select a team member...</span>}
              <ChevronDown size={14} className="text-white/20" />
            </button>
          ) : (
            <div className="w-full bg-white/5 border border-zinc-800 rounded-md h-11 px-4 flex items-center text-sm text-white/40">{data.assignedTo?.first_name || 'Unassigned'}</div>
          )}
        </div>
        <div className="space-y-2 relative">
          <label className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/30">Contact</label>
          <button ref={contactRef} type="button" onClick={() => onOpenDropdown('contact', contactRef)} disabled={!data.assignedTo || !data.selectedPipeline}
            className={cn("w-full bg-white/5 border border-zinc-800 rounded-md h-11 px-4 flex items-center justify-between text-sm transition-all", data.assignedTo && data.selectedPipeline ? "text-white/60 hover:border-zinc-700 cursor-pointer" : "text-white/20 cursor-not-allowed opacity-40")}>
            {data.selectedContact ? <span className="text-white">{data.selectedContact.name || data.selectedContact.email}</span> : <span className="text-white/20">Select a contact...</span>}
            <ChevronDown size={14} className="text-white/20" />
          </button>
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/30">Notes</label>
        <textarea value={data.description} onChange={e => onChange({ description: e.target.value })}
          placeholder="Add follow-up notes..."
          rows={3}
          className="w-full bg-white/5 border border-zinc-800 rounded-md px-4 py-3 text-sm text-white placeholder:text-white/20 focus:border-blue-500/40 outline-none transition-all resize-none" />
      </div>
    </>
  );
};

export default FollowUpTabForm;
