import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import { format, parseISO } from 'date-fns';
import { Loader2, RefreshCw, ChevronDown, X, Zap } from 'lucide-react';
import RingLoader from '@/components/ui/RingLoader';
import UpdateTaskModal from './UpdateTaskModal';
import UpdateEventModal from './UpdateEventModal';
import UpdateFollowUpModal from './UpdateFollowUpModal';
import UpdateMeetingModal from './UpdateMeetingModal';
import TaskCard from './TaskCard';
import EventCard from './EventCard';
import FollowUpCard from './FollowUpCard';
import MeetingCard from './MeetingCard';

const PAGE_SIZE = 15;

const sortByActivity = (list) =>
  [...list].sort((a, b) => {
    const aUpdated = a.updated_at ? parseISO(a.updated_at).getTime() : 0;
    const bUpdated = b.updated_at ? parseISO(b.updated_at).getTime() : 0;
    if (aUpdated !== bUpdated) return bUpdated - aUpdated;
    const aCreated = a.created_at ? parseISO(a.created_at).getTime() : 0;
    const bCreated = b.created_at ? parseISO(b.created_at).getTime() : 0;
    return bCreated - aCreated;
  });

const UpdatesSidebar = ({ isOpen, onClose, refreshTrigger }) => {
  const [updateTask, setUpdateTask] = useState(null);
  const [updateEvent, setUpdateEvent] = useState(null);
  const [updateFollowUp, setUpdateFollowUp] = useState(null);
  const [updateMeeting, setUpdateMeeting] = useState(null);
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const nextPageRef = useRef(2);

  const hasFetchedOnce = useRef(false);

  const fetchFirstPage = useCallback(async () => {
    setLoading(true);
    setTodos([]);
    nextPageRef.current = 2;
    try {
      const res = await axios.get('/api/calendar/todos/', {
        params: { page_size: PAGE_SIZE, page: 1 },
      });
      setTodos(sortByActivity(res.data.results || []));
      setHasMore(!!res.data.next);
      hasFetchedOnce.current = true;
    } catch {
      setTodos([]);
      setHasMore(false);
      hasFetchedOnce.current = true;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen && !hasFetchedOnce.current) fetchFirstPage();
  }, [isOpen, fetchFirstPage]);

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const page = nextPageRef.current;
      const res = await axios.get('/api/calendar/todos/', {
        params: { page_size: PAGE_SIZE, page },
      });
      setTodos(prev => sortByActivity([...prev, ...(res.data.results || [])]));
      setHasMore(!!res.data.next);
      nextPageRef.current = page + 1;
    } catch {
      // silent
    } finally {
      setLoadingMore(false);
    }
  };

  const renderCard = (ev) => {
    switch (ev.todo_type) {
      case 'task': return <TaskCard key={ev.id} task={ev} onClick={() => setUpdateTask(ev)} />;
      case 'event': return <EventCard key={ev.id} event={ev} onClick={() => setUpdateEvent(ev)} />;
      case 'followup': return <FollowUpCard key={ev.id} event={ev} onClick={() => setUpdateFollowUp(ev)} />;
      case 'meeting': return <MeetingCard key={ev.id} event={ev} onClick={() => setUpdateMeeting(ev)} />;
      default: return null;
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <>
      <div className="fixed inset-0 z-[1040] bg-black/50 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]" onClick={onClose} />
      <div className="fixed top-0 right-0 bottom-0 z-[1050] w-[min(420px,90vw)] bg-zinc-950 border-l border-zinc-800 shadow-2xl flex flex-col animate-[slideInRight_0.25s_ease-out]">
        <div className="shrink-0 px-5 py-4 border-b border-zinc-800 bg-white/[0.02] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
              <Zap size={14} className="text-amber-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight uppercase">Current Updates</h3>
              <p className="text-[9px] text-white/30 uppercase tracking-widest font-medium mt-0.5">Your assigned tasks and events</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={fetchFirstPage} disabled={loading}
              className="p-1.5 rounded-sm bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 hover:border-blue-500/50 disabled:opacity-30 transition-all">
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>
            <button onClick={onClose} className="p-1.5 rounded-sm bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-all">
              <X size={14} />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center flex-1 text-white/20 min-h-0">
            <RingLoader />
          </div>
        ) : todos.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 text-white/20 border border-dashed border-white/20 rounded-xl mx-5 my-4 min-h-0">
            <p className="text-xs font-medium">No updates yet</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0 space-y-2 p-5">
            {todos.map(ev => renderCard(ev))}
            {hasMore && (
              <button onClick={loadMore} disabled={loadingMore}
                className="py-2 px-4 rounded-lg bg-zinc-950 border border-zinc-800 text-white/40 hover:text-white/70 hover:border-zinc-700 disabled:opacity-40 text-[9px] font-bold uppercase tracking-[0.15em] transition-all flex items-center justify-center gap-1.5 mx-auto">
                {loadingMore ? <Loader2 size={14} className="animate-spin" /> : <ChevronDown size={14} />}
                Load More
              </button>
            )}
          </div>
        )}

        <div className="shrink-0 px-5 py-3 border-t border-zinc-800 bg-black/30">
          <p className="text-[9px] text-white/25 uppercase tracking-widest font-medium truncate">
            {todos.length > 0 && `Showing ${todos.length} ${todos.length === 1 ? 'item' : 'items'} · sorted by most recent activity`}
          </p>
        </div>
      </div>

      <UpdateTaskModal task={updateTask} isOpen={!!updateTask} onClose={() => setUpdateTask(null)} onSuccess={() => { setUpdateTask(null); fetchFirstPage(); }} />
      <UpdateEventModal event={updateEvent} isOpen={!!updateEvent} onClose={() => setUpdateEvent(null)} onSuccess={() => { setUpdateEvent(null); fetchFirstPage(); }} />
      <UpdateFollowUpModal event={updateFollowUp} isOpen={!!updateFollowUp} onClose={() => setUpdateFollowUp(null)} onSuccess={() => { setUpdateFollowUp(null); fetchFirstPage(); }} />
      <UpdateMeetingModal event={updateMeeting} isOpen={!!updateMeeting} onClose={() => setUpdateMeeting(null)} onSuccess={() => { setUpdateMeeting(null); fetchFirstPage(); }} />
    </>,
    document.body
  );
};

export default UpdatesSidebar;
