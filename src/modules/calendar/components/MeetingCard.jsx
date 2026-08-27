import React from 'react';
import { format, parseISO } from 'date-fns';
import { Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MEETING_STATUS_STYLES } from '../constants';

const MeetingCard = ({ event, onClick }) => {
  const statusStyle = MEETING_STATUS_STYLES[event.status] || MEETING_STATUS_STYLES.upcoming;
  return (
    <div className="p-3 rounded-xl space-y-1.5 cursor-pointer transition-all bg-white/[0.06] border border-white/10 hover:bg-white/[0.09]" onClick={onClick}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="shrink-0 w-6 h-6 rounded flex items-center justify-center border text-purple-400 bg-purple-500/10 border-purple-500/20">
            <Users size={10} />
          </span>
          <p className="text-sm font-bold text-white leading-tight truncate">{event.title}</p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className={cn("shrink-0 px-1.5 py-0.5 rounded-full border text-[8px] font-bold uppercase tracking-wider", statusStyle)}>
            {event.status === 'upcoming' ? 'Meeting' :
             event.status === 'live' ? 'Live' :
             event.status === 'ended' ? 'Ended' :
             event.status === 'cancelled' ? 'Cancelled' : 'Meeting'}
          </span>
        </div>
      </div>
      <div className="text-[10px] text-white/30 font-medium space-y-0.5">
        {event.start && <p>Date: {format(parseISO(event.start), 'MMM d, yyyy h:mm a')}</p>}
        {event.contact_name && <p>Contact: {event.contact_name}</p>}
        {event.assigned_to_name && <p>Assigned to: {event.assigned_to_name}</p>}
        {event.user_name && <p>Created by: {event.user_name}</p>}
      </div>
    </div>
  );
};

export default MeetingCard;
