import React from 'react';
import { format, parseISO } from 'date-fns';
import { Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { EVENT_STATUS_OPTIONS, EVENT_STATUS_STYLES } from '../constants';

const EventCard = ({ event, onClick }) => {
  const statusStyle = EVENT_STATUS_STYLES[event.status] || EVENT_STATUS_STYLES.upcoming;
  return (
    <div className={cn("p-3 rounded-xl space-y-1.5 cursor-pointer transition-all",
      event.status === 'cancelled' ? "bg-red-500/10 border border-red-500/30 hover:bg-red-500/15" :
      "bg-white/[0.06] border border-white/10 hover:bg-white/[0.08]")}
      onClick={onClick}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="shrink-0 w-6 h-6 rounded flex items-center justify-center border text-emerald-400 bg-emerald-500/10 border-emerald-500/20">
            <Calendar size={10} />
          </span>
          <p className="text-sm font-bold text-white leading-tight truncate">{event.title}</p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className={cn("px-1.5 py-0.5 rounded-full border text-[8px] font-black uppercase tracking-wider", statusStyle)}>
            {EVENT_STATUS_OPTIONS.find(o => o.value === event.status)?.label || event.status}
          </span>
        </div>
      </div>
      <div className="text-[10px] text-white/30 font-medium space-y-0.5">
        {event.start && <p>{format(parseISO(event.start), 'MMM d, h:mm a')}</p>}
        {event.contact_name && <p>Contact: {event.contact_name}</p>}
        {event.user_name && <p>Created by: {event.user_name}</p>}
      </div>
    </div>
  );
};

export default EventCard;
