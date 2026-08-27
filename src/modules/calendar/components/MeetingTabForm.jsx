import React, { useRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getMeetingStatusTextColor } from '../constants';

const MeetingTabForm = ({ data, onChange, onOpenDropdown }) => {
  const meetingStatusRef = useRef(null);
  const userRef = useRef(null);

  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/30">Meeting Title *</label>
          <input autoFocus value={data.title} onChange={e => onChange({ title: e.target.value })}
            placeholder="Enter meeting title"
            className="w-full bg-white/5 border border-zinc-800 rounded-md h-11 px-4 text-sm text-white placeholder:text-white/20 focus:border-blue-500/40 outline-none transition-all" />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/30">Status</label>
          <button ref={meetingStatusRef} type="button" onClick={() => onOpenDropdown('meetingStatus', meetingStatusRef)}
            className={cn("w-full bg-white/5 border border-zinc-800 rounded-md h-11 px-4 flex items-center justify-between text-sm transition-all hover:border-zinc-700 capitalize", getMeetingStatusTextColor(data.meetingStatus))}>
            <span>{data.meetingStatus}</span>
            <ChevronDown size={14} className="text-white/20" />
          </button>
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/30">Agenda</label>
        <textarea value={data.description} onChange={e => onChange({ description: e.target.value })}
          placeholder="Add meeting agenda..."
          rows={3}
          className="w-full bg-white/5 border border-zinc-800 rounded-md px-4 py-3 text-sm text-white placeholder:text-white/20 focus:border-blue-500/40 outline-none transition-all resize-none" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/30">Location / Link</label>
          <input value={data.location} onChange={e => onChange({ location: e.target.value })}
            placeholder="Add meeting location or link..."
            className="w-full bg-white/5 border border-zinc-800 rounded-md h-11 px-4 text-sm text-white placeholder:text-white/20 focus:border-blue-500/40 outline-none transition-all" />
        </div>
        <div className="space-y-2 relative">
          <label className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/30">Attendees (multi-select)</label>
          <button ref={userRef} type="button" onClick={() => onOpenDropdown('user', userRef)}
            className="w-full bg-white/5 border border-zinc-800 rounded-md h-11 px-4 flex items-center justify-between text-sm text-white/60 hover:border-zinc-700 transition-all">
            <span className={data.selectedAttendees.length > 0 ? 'text-white' : 'text-white/20'}>
              {data.selectedAttendees.length === 0 ? 'Select attendees...' :
                `${data.selectedAttendees[0].first_name || data.selectedAttendees[0].email}${data.selectedAttendees.length > 1 ? ` +${data.selectedAttendees.length - 1}` : ''}`}
            </span>
            <ChevronDown size={14} className="text-white/20 shrink-0" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <label className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/30">Date *</label>
          <input type="date" value={data.meetingDate} onChange={e => onChange({ meetingDate: e.target.value })}
            className="w-full bg-white/5 border border-zinc-800 rounded-md h-11 px-4 text-sm text-white focus:border-blue-500/40 outline-none transition-all [color-scheme:dark]" />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/30">Start Time *</label>
          <input type="time" value={data.meetingStartTime} onChange={e => onChange({ meetingStartTime: e.target.value })}
            className="w-full bg-white/5 border border-zinc-800 rounded-md h-11 px-4 text-sm text-white focus:border-blue-500/40 outline-none transition-all [color-scheme:dark]" />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/30">End Time *</label>
          <input type="time" value={data.meetingEndTime} onChange={e => onChange({ meetingEndTime: e.target.value })}
            className="w-full bg-white/5 border border-zinc-800 rounded-md h-11 px-4 text-sm text-white focus:border-blue-500/40 outline-none transition-all [color-scheme:dark]" />
        </div>
      </div>
    </>
  );
};

export default MeetingTabForm;
