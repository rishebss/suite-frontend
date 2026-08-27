import React, { useRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getEventStatusTextColor } from '../constants';

const EventTabForm = ({ data, onChange, onOpenDropdown }) => {
  const eventStatusRef = useRef(null);

  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/30">Event Name *</label>
          <input autoFocus value={data.title} onChange={e => onChange({ title: e.target.value })}
            placeholder="Enter event name"
            className="w-full bg-white/5 border border-zinc-800 rounded-md h-11 px-4 text-sm text-white placeholder:text-white/20 focus:border-blue-500/40 outline-none transition-all" />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/30">Status</label>
          <button ref={eventStatusRef} type="button" onClick={() => onOpenDropdown('eventStatus', eventStatusRef)}
            className={cn("w-full bg-white/5 border border-zinc-800 rounded-md h-11 px-4 flex items-center justify-between text-sm transition-all hover:border-zinc-700 capitalize", getEventStatusTextColor(data.eventStatus))}>
            <span>{data.eventStatus}</span>
            <ChevronDown size={14} className="text-white/20" />
          </button>
        </div>
      </div>
      <div className="flex items-center gap-[15px] pt-5">
        <label className="text-xs font-medium uppercase tracking-[0.2em] text-white leading-none">Single Day</label>
        <button type="button" onClick={() => {
            if (!data.isFullDay && data.start) {
              const d = new Date(data.start);
              onChange({
                isFullDay: true,
                start: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}T00:00`,
              });
            } else {
              onChange({ isFullDay: false });
            }
          }}
          className={cn("w-11 h-6 rounded-full transition-all relative shrink-0",
            data.isFullDay ? "bg-blue-500" : "bg-zinc-700")}>
          <div className={cn("w-4 h-4 rounded-full bg-white absolute top-1 transition-all", data.isFullDay ? "left-6" : "left-1")} />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/30">Event Date *</label>
          <input type="datetime-local" value={data.start} onChange={e => onChange({ start: e.target.value })}
            className="w-full bg-white/5 border border-zinc-800 rounded-md h-11 px-4 text-sm text-white focus:border-blue-500/40 outline-none transition-all [color-scheme:dark]" />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/30">End Date</label>
          <input type="datetime-local" value={data.end} onChange={e => onChange({ end: e.target.value })} disabled={data.isFullDay}
            className="w-full bg-white/5 border border-zinc-800 rounded-md h-11 px-4 text-sm text-white focus:border-blue-500/40 outline-none transition-all [color-scheme:dark] disabled:opacity-40 disabled:cursor-not-allowed" />
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/30">Description</label>
        <textarea value={data.description} onChange={e => onChange({ description: e.target.value })}
          placeholder="Add details about this event..."
          rows={7}
          className="w-full bg-white/5 border border-zinc-800 rounded-md px-4 py-3 text-sm text-white placeholder:text-white/20 focus:border-blue-500/40 outline-none transition-all resize-none" />
      </div>
    </>
  );
};

export default EventTabForm;
