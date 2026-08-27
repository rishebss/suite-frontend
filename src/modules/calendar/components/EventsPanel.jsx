import React, { useState, useEffect, useRef, memo } from 'react';
import axios from 'axios';
import { format, startOfDay, endOfDay } from 'date-fns';
import { Plus, Loader2, RefreshCw, ChevronDown } from 'lucide-react';
import RingLoader from '@/components/ui/RingLoader';
import AddEventModal from './AddEventModal';
import UpdateTaskModal from './UpdateTaskModal';
import UpdateEventModal from './UpdateEventModal';
import UpdateFollowUpModal from './UpdateFollowUpModal';
import UpdateMeetingModal from './UpdateMeetingModal';
import TaskCard from './TaskCard';
import EventCard from './EventCard';
import FollowUpCard from './FollowUpCard';
import MeetingCard from './MeetingCard';

const PAGE_SIZE = 10;

const EventsPanel = memo(({ selectedDate, onEventCreated }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [updateTask, setUpdateTask] = useState(null);
  const [updateEvent, setUpdateEvent] = useState(null);
  const [updateFollowUp, setUpdateFollowUp] = useState(null);
  const [updateMeeting, setUpdateMeeting] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [fetchKey, setFetchKey] = useState(0);
  const nextPageRef = useRef(2);
  const dateRef = useRef(selectedDate);

  useEffect(() => {
    dateRef.current = selectedDate;
    const fetchFirstPage = async () => {
      setLoading(true);
      setEvents([]);
      nextPageRef.current = 2;
      try {
        const dayStart = startOfDay(selectedDate);
        const dayEnd = endOfDay(selectedDate);
        const res = await axios.get('/api/calendar/todos/', {
          params: { start: dayStart.toISOString(), end: dayEnd.toISOString(), page_size: PAGE_SIZE, page: 1 },
        });
        setEvents(res.data.results || []);
        setHasMore(!!res.data.next);
      } catch {
        setEvents([]);
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    };
    fetchFirstPage();
  }, [selectedDate, fetchKey]);

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const dayStart = startOfDay(dateRef.current);
      const dayEnd = endOfDay(dateRef.current);
      const page = nextPageRef.current;
      const res = await axios.get('/api/calendar/todos/', {
        params: { start: dayStart.toISOString(), end: dayEnd.toISOString(), page_size: PAGE_SIZE, page },
      });
      setEvents(prev => [...prev, ...(res.data.results || [])]);
      setHasMore(!!res.data.next);
      nextPageRef.current = page + 1;
    } catch {
      // silent
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <div className="h-full flex flex-col gap-4 min-h-0">
      <div className="flex items-center justify-between shrink-0">
        <div className="space-y-0.5">
          <h3 className="text-sm font-bold text-white tracking-tight">Schedule</h3>
          <p className="text-[10px] text-white/30 font-medium">{format(selectedDate, 'MMMM d, yyyy')}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setFetchKey(k => k + 1)} disabled={loading}
            className="p-1.5 rounded-sm bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 hover:border-blue-500/50 disabled:opacity-30 transition-all">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
          <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-1.5 px-3 h-7 rounded-sm bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 hover:border-blue-500/50 text-[10px] font-medium transition-all">
            <Plus size={12} />
            Add Event
          </button>
        </div>
      </div>
      {loading ? (
        <div className="flex flex-col items-center justify-center flex-1 text-white/20 min-h-0">
          <RingLoader />
        </div>
      ) : events.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 text-white/20 border border-dashed border-white/20 rounded-xl min-h-0">
          <p className="text-xs font-medium">Nothing scheduled</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0 space-y-2 pr-1">
          {events.map((ev) => {
            switch (ev.todo_type) {
              case 'task': return <TaskCard key={ev.id} task={ev} onClick={() => setUpdateTask(ev)} />;
              case 'event': return <EventCard key={ev.id} event={ev} onClick={() => setUpdateEvent(ev)} />;
              case 'followup': return <FollowUpCard key={ev.id} event={ev} onClick={() => setUpdateFollowUp(ev)} />;
              case 'meeting': return <MeetingCard key={ev.id} event={ev} onClick={() => setUpdateMeeting(ev)} />;
              default: return null;
            }
          })}
          {hasMore && (
            <button onClick={loadMore} disabled={loadingMore}
              className="py-2 px-4 rounded-lg bg-zinc-950 border border-zinc-800 text-white/40 hover:text-white/70 hover:border-zinc-700 disabled:opacity-40 text-[9px] font-bold uppercase tracking-[0.15em] transition-all flex items-center justify-center gap-1.5 mx-auto">
              {loadingMore ? <Loader2 size={14} className="animate-spin" /> : <ChevronDown size={14} />}
              Load More
            </button>
          )}
        </div>
      )}

      <AddEventModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={() => { setIsModalOpen(false); setFetchKey(k => k + 1); onEventCreated?.(); }} />
      <UpdateTaskModal task={updateTask} isOpen={!!updateTask} onClose={() => setUpdateTask(null)} onSuccess={() => { setUpdateTask(null); setFetchKey(k => k + 1); onEventCreated?.(); }} />
      <UpdateEventModal event={updateEvent} isOpen={!!updateEvent} onClose={() => setUpdateEvent(null)} onSuccess={() => { setUpdateEvent(null); setFetchKey(k => k + 1); onEventCreated?.(); }} />
      <UpdateFollowUpModal event={updateFollowUp} isOpen={!!updateFollowUp} onClose={() => setUpdateFollowUp(null)} onSuccess={() => { setUpdateFollowUp(null); setFetchKey(k => k + 1); onEventCreated?.(); }} />
      <UpdateMeetingModal event={updateMeeting} isOpen={!!updateMeeting} onClose={() => setUpdateMeeting(null)} onSuccess={() => { setUpdateMeeting(null); setFetchKey(k => k + 1); onEventCreated?.(); }} />
    </div>
  );
});

export default EventsPanel;
