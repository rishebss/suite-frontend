import React from 'react';
import { format, parseISO } from 'date-fns';
import { Bell } from 'lucide-react';
import { cn } from '@/lib/utils';

const STATUS_STYLES = {
  follow_up: 'text-pink-400 bg-pink-500/10 border-pink-500/20',
  failed: 'text-red-400 bg-red-500/10 border-red-500/20',
  complete: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  cancelled: 'text-white/40 bg-white/5 border-white/10',
};

const FollowUpCard = ({ event, onClick }) => {
  const isFailed = event.status === 'failed';
  const statusStyle = STATUS_STYLES[event.status] || STATUS_STYLES.follow_up;
  return (
    <div className={cn("p-3 rounded-xl space-y-1.5 cursor-pointer transition-all", isFailed ? "bg-red-500/10 border border-red-500/30 hover:bg-red-500/15" : "bg-white/[0.06] border border-white/10 hover:bg-white/[0.09]")} onClick={onClick}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="shrink-0 w-6 h-6 rounded flex items-center justify-center border text-pink-400 bg-pink-500/10 border-pink-500/20">
            <Bell size={10} />
          </span>
          <p className="text-sm font-bold text-white leading-tight truncate">{event.title}</p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className={cn("shrink-0 px-1.5 py-0.5 rounded-full border text-[8px] font-bold uppercase tracking-wider", statusStyle)}>
            {(event.status || 'follow_up').replace('_', ' ')}
          </span>
        </div>
      </div>
      <div className="text-[10px] text-white/30 font-medium space-y-0.5">
        {event.start && <p>Date: {format(parseISO(event.start), 'MMM d, yyyy h:mm a')}</p>}
        {event.assigned_to_name && <p>Assigned to: {event.assigned_to_name}</p>}
        {event.user_name && <p>Created by: {event.user_name}</p>}
      </div>
    </div>
  );
};

export default FollowUpCard;
