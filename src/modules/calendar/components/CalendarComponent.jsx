import React, { useState, useEffect, useMemo, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { FaBolt } from 'react-icons/fa6';
import RingLoader from '@/components/ui/RingLoader';
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, isSameMonth, isSameDay, isToday, addMonths, subMonths, parseISO,
} from 'date-fns';
import EventsPanel from './EventsPanel';
import UpdatesSidebar from './UpdatesSidebar';
import { BiTask } from "react-icons/bi";

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const CalendarComponent = ({ projectId, workspaceId }) => {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [initialLoading, setInitialLoading] = useState(true);
  const [isSwitchingMonth, setIsSwitchingMonth] = useState(false);
  const [error, setError] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showUpdates, setShowUpdates] = useState(false);
  const mounted = useRef(false);

  useEffect(() => {
    const fetchEvents = async () => {
      if (!user) return;
      try {
        if (!mounted.current) {
          setInitialLoading(true);
        } else {
          setIsSwitchingMonth(true);
        }
        const monthStart = startOfMonth(currentDate);
        const monthEnd = endOfMonth(currentDate);

        const [calendarRes, workRes] = await Promise.all([
          axios.get('/api/calendar/todos/', {
            params: { start: monthStart.toISOString(), end: monthEnd.toISOString() },
          }),
          projectId ? axios.get('/api/work/items/', {
            params: {
              project: projectId,
              due_date__gte: monthStart.toISOString().slice(0, 10),
              due_date__lte: monthEnd.toISOString().slice(0, 10),
            },
          }) : Promise.resolve({ data: { results: [] } }),
        ]);

        const calendarEvents = calendarRes.data.results || [];
        const workItems = (workRes.data.results || []).map((item) => ({
          ...item,
          todo_type: 'project_task',
          start: item.due_date ? new Date(item.due_date).toISOString() : null,
          end: null,
        }));

        setEvents([...calendarEvents, ...workItems]);
      } catch (err) {
        setError('Failed to load events');
      } finally {
        setInitialLoading(false);
        setIsSwitchingMonth(false);
        mounted.current = true;
      }
    };
    fetchEvents();
  }, [user, currentDate, refreshTrigger, projectId]);

  const days = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calStart = startOfWeek(monthStart);
    const calEnd = endOfWeek(monthEnd);
    return eachDayOfInterval({ start: calStart, end: calEnd });
  }, [currentDate]);

  const eventsByDate = useMemo(() => {
    const map = {};
    events.forEach((ev) => {
      const start = parseISO(ev.start);
      const dates = ev.end
        ? eachDayOfInterval({ start, end: parseISO(ev.end) })
        : [start];
      dates.forEach((d) => {
        const key = format(d, 'yyyy-MM-dd');
        if (!map[key]) map[key] = [];
        map[key].push(ev);
      });
    });
    return map;
  }, [events]);

  const selectedKey = useMemo(() => format(selectedDate, 'yyyy-MM-dd'), [selectedDate]);
  const selectedEvents = useMemo(() => eventsByDate[selectedKey] || [], [eventsByDate, selectedKey]);

  const goToMonth = (delta) => {
    const target = delta < 0 ? subMonths(currentDate, 1) : addMonths(currentDate, 1);
    setCurrentDate(target);
    const now = new Date();
    if (isSameMonth(target, now)) {
      setSelectedDate(now);
    } else {
      setSelectedDate(startOfMonth(target));
    }
  };

  const prevMonth = () => goToMonth(-1);
  const nextMonth = () => goToMonth(1);

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-white/20">
        <RingLoader />
      </div>
    );
  }

  return (
    <div className="h-full grid grid-cols-[minmax(220px,25%)_1fr] gap-6">
      {error && (
        <div className="col-span-full px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-xs text-red-400 font-medium">{error}</p>
        </div>
      )}
      <div className="h-full min-h-0">
        <EventsPanel selectedDate={selectedDate} projectId={projectId} workspaceId={workspaceId} onEventCreated={() => setRefreshTrigger(t => t + 1)} />
      </div>

      <UpdatesSidebar isOpen={showUpdates} onClose={() => setShowUpdates(false)} refreshTrigger={refreshTrigger} />

      <div className="space-y-6 pr-4 h-full min-h-0 overflow-y-auto custom-scrollbar">
        <div className="flex items-center justify-end gap-4">
          <button onClick={() => setShowUpdates(true)}
            className="flex items-center gap-1.5 px-3 h-8 rounded-sm bg-white/[0.06] border border-white/10 text-white/60 hover:text-white hover:bg-white/10 text-[10px] font-medium uppercase tracking-wider transition-all">
            <FaBolt size={12} />
            Updates
          </button>
          <div className="flex items-center h-8 bg-white/[0.06] border border-white/10 rounded-sm overflow-hidden">
            <span className="px-3 text-[10px] font-medium uppercase tracking-wider text-white/60 whitespace-nowrap select-none">{format(selectedDate, 'MMMM d, yyyy')}</span>
            <span className="w-px self-stretch bg-white/10" />
            <button onClick={prevMonth} className="px-1.5 h-full text-white/40 hover:text-white hover:bg-white/10 transition-all">
              <ChevronLeft size={12} />
            </button>
            <span className="w-px self-stretch bg-white/10" />
            <button onClick={nextMonth} className="px-1.5 h-full text-white/40 hover:text-white hover:bg-white/10 transition-all">
              <ChevronRight size={12} />
            </button>
          </div>
        </div>

        <div className="bg-white/[0.06] border border-white/10 rounded-2xl overflow-hidden flex flex-col relative">
          {isSwitchingMonth && (
            <div className="absolute inset-0 z-10 bg-zinc-950/60 backdrop-blur-sm flex items-center justify-center">
              <RingLoader />
            </div>
          )}
          <div className="grid grid-cols-7 border-b border-white/5">
            {WEEKDAYS.map((d) => (
              <div key={d} className="py-3 text-center text-[10px] font-bold uppercase tracking-widest text-white/30">
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {days.map((day) => {
              const key = format(day, 'yyyy-MM-dd');
              const dayEvents = eventsByDate[key] || [];
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isSelected = isSameDay(day, selectedDate);
              const isTodayDate = isToday(day);

              return (
                <button
                  key={key}
                  onClick={() => setSelectedDate(day)}
                  className={`relative flex flex-col items-center justify-start p-2 min-h-[72px] border-b border-r border-white/[0.03] transition-all hover:bg-white/[0.03] ${
                    isSelected ? 'bg-blue-500/10' : ''
                  } ${!isCurrentMonth ? 'opacity-20' : ''}`}
                >
                  <span
                    className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                      isTodayDate ? 'bg-blue-500 text-white shadow-[0_0_12px_rgba(59,130,246,0.4)]' : ''
                    } ${isSelected && !isTodayDate ? 'text-blue-400' : ''} ${!isSelected && !isTodayDate ? 'text-white/70' : ''}`}
                  >
                    {format(day, 'd')}
                  </span>
                  {dayEvents.length > 0 && (
                    <div className="flex flex-wrap gap-0.5 mt-1">
                      {dayEvents.slice(0, 3).map((ev) => {
                        const dotColor =
                          ev.todo_type === 'task' ? 'bg-blue-500' :
                          ev.todo_type === 'event' ? 'bg-emerald-500' :
                          ev.todo_type === 'followup' ? 'bg-amber-500' :
                          ev.todo_type === 'meeting' ? 'bg-purple-500' :
                          ev.todo_type === 'project_task' ? 'bg-cyan-500' :
                          'bg-white/30';
                        return <span key={ev.id} className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />;
                      })}
                      {dayEvents.length > 3 && (
                        <span className="text-[8px] text-white/30 font-bold">+{dayEvents.length - 3}</span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarComponent;
