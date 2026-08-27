import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  addMonths,
  subMonths,
  parseISO,
} from "date-fns";

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

const MiniCalendar = () => {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let active = true;
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    axios
      .get("/api/calendar/todos/", {
        params: { start: monthStart.toISOString(), end: monthEnd.toISOString() },
      })
      .then((res) => {
        if (active) setEvents(res.data?.results || []);
      })
      .catch(() => {
        if (active) setEvents([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [user, currentDate]);

  const days = useMemo(() => {
    const ms = startOfMonth(currentDate);
    const me = endOfMonth(currentDate);
    return eachDayOfInterval({
      start: startOfWeek(ms, { weekStartsOn: 0 }),
      end: endOfWeek(me, { weekStartsOn: 0 }),
    });
  }, [currentDate]);

  const eventsByDate = useMemo(() => {
    const map = {};
    events.forEach((ev) => {
      if (!ev.start) return;
      const start = parseISO(ev.start);
      const dates = ev.end
        ? eachDayOfInterval({ start, end: parseISO(ev.end) })
        : [start];
      dates.forEach((d) => {
        const key = format(d, "yyyy-MM-dd");
        if (!map[key]) map[key] = [];
        map[key].push(ev);
      });
    });
    return map;
  }, [events]);

  return (
    <div className="w-full">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-bold text-white/70">
          {format(currentDate, "MMMM yyyy")}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setCurrentDate((d) => subMonths(d, 1))}
            className="flex h-6 w-6 items-center justify-center rounded-md border border-white/10 bg-white/5 text-white/60 transition-colors hover:bg-white/10"
          >
            <ChevronLeft size={13} />
          </button>
          <button
            type="button"
            onClick={() => setCurrentDate((d) => addMonths(d, 1))}
            className="flex h-6 w-6 items-center justify-center rounded-md border border-white/10 bg-white/5 text-white/60 transition-colors hover:bg-white/10"
          >
            <ChevronRight size={13} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {WEEKDAYS.map((d, i) => (
          <div
            key={i}
            className="pb-1 text-[9px] font-bold uppercase tracking-wider text-white/25"
          >
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day, idx) => {
          const key = format(day, "yyyy-MM-dd");
          const dayEvents = eventsByDate[key] || [];
          const inMonth = isSameMonth(day, currentDate);
          const row = Math.floor(idx / 7);
          const tooltip = dayEvents.length ? (
            <div
              className={`pointer-events-none absolute left-1/2 z-20 w-max max-w-[220px] -translate-x-1/2 rounded-lg border border-white/10 bg-black/95 p-2 shadow-xl opacity-0 transition-opacity group-hover:opacity-100 ${
                row === 0 ? "top-full mt-1" : "bottom-full mb-1"
              }`}
            >
              <p className="mb-1 text-[9px] font-bold uppercase tracking-widest text-white/40">
                {format(day, "MMM d")}
              </p>
              <div className="space-y-1">
                {dayEvents.slice(0, 4).map((ev, i) => (
                  <div key={i} className="flex items-center gap-2 text-[11px]">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-blue-400" />
                    <span className="truncate text-white/80">{ev.title}</span>
                    {ev.start && (
                      <span className="shrink-0 text-[9px] text-white/35">
                        {format(parseISO(ev.start), "h:mm a")}
                      </span>
                    )}
                  </div>
                ))}
                {dayEvents.length > 4 && (
                  <p className="text-[10px] text-white/40">
                    +{dayEvents.length - 4} more
                  </p>
                )}
              </div>
            </div>
          ) : null;

          return (
            <div key={key} className="group relative flex justify-center">
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-md text-[11px] transition-colors ${
                  !inMonth
                    ? "text-white/15"
                    : isToday(day)
                      ? "bg-blue-500/20 font-bold text-blue-300 ring-1 ring-blue-500/40"
                      : dayEvents.length
                        ? "text-white hover:bg-white/10"
                        : "text-white/50 hover:bg-white/5"
                }`}
              >
                {format(day, "d")}
              </div>
              {dayEvents.length > 0 && (
                <span className="absolute bottom-0.5 h-1 w-1 rounded-full bg-blue-400" />
              )}
              {tooltip}
            </div>
          );
        })}
      </div>

      {loading && (
        <div className="mt-2 flex items-center gap-1.5 text-[10px] text-white/30">
          <CalendarDays size={11} /> Loading events…
        </div>
      )}
    </div>
  );
};

export default MiniCalendar;
