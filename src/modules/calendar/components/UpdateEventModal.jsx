import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { format, parseISO } from 'date-fns';
import { Loader2, CalendarPlus, Trash2, Check, ChevronDown, Calendar, Clock, User } from 'lucide-react';
import ConfirmDeleteDialog from '@/components/ConfirmDeleteDialog';
import axios from 'axios';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { EVENT_STATUS_OPTIONS, EVENT_STATUS_STYLES, getEventStatusTextColor } from '../constants';

const UpdateEventModal = ({ event, isOpen, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [isFullDay, setIsFullDay] = useState(false);
  const [status, setStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [dropdownPos, setDropdownPos] = useState(null);
  const statusRef = useRef(null);

  const isCreator = event?.user === user?.id;
  const canEdit = isCreator;

  useEffect(() => {
    if (isOpen && event) {
      setTitle(event.title || '');
      setDescription(event.description || '');
      setStart(event.start ? event.start.slice(0, 16) : '');
      setEnd(event.end ? event.end.slice(0, 16) : '');
      setIsFullDay(!!(event.end && event.start && new Date(event.end).getTime() === new Date(new Date(event.start).setHours(23, 59, 59, 999)).getTime()));
      setStatus(event.status || 'upcoming');
      setError('');
    }
  }, [isOpen, event]);

  const openStatusDropdown = () => {
    if (statusRef.current) {
      const rect = statusRef.current.getBoundingClientRect();
      setDropdownPos({ top: rect.bottom + 4, left: rect.left, width: rect.width });
      setShowStatusDropdown(true);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canEdit) return;
    setIsSubmitting(true);
    setError('');

    try {
      await axios.patch(`/api/calendar/todos/${event.id}/`, {
        title,
        description: description || undefined,
        status,
        start: start ? new Date(start).toISOString() : null,
        end: isFullDay
          ? (start ? new Date(new Date(start).setHours(23, 59, 59, 999)).toISOString() : null)
          : (end ? new Date(end).toISOString() : null),
      });
      onSuccess?.();
      onClose();
    } catch (err) {
      const data = err.response?.data;
      let msg = 'Failed to update.';
      if (data) {
        if (typeof data === 'string') msg = data;
        else if (data.detail) msg = data.detail;
        else {
          const firstKey = Object.keys(data)[0];
          msg = Array.isArray(data[firstKey]) ? data[firstKey][0] : data[firstKey];
        }
      }
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !event) return null;

  return createPortal(
    <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {canEdit && (
          <div className="px-8 py-6 border-b border-zinc-800 bg-white/[0.02] flex items-center justify-between shrink-0">
            <div>
              <h2 className="text-sm font-medium text-white uppercase tracking-wider">Event Update</h2>
              <p className="text-[9px] text-white/40 uppercase tracking-widest font-medium">Edit event details</p>
            </div>
            <button type="button" onClick={() => setShowDeleteConfirm(true)}
              className="p-1.5 rounded bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all">
              <Trash2 size={14} />
            </button>
          </div>
        )}

        {canEdit ? (
          <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
            <form onSubmit={handleSubmit} id="update-event-form">
              <div className="px-8 py-6 space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/30">Event Name</label>
                    <input value={title} onChange={e => setTitle(e.target.value)}
                      className="w-full bg-white/5 border border-zinc-800 rounded-md h-11 px-4 text-sm text-white placeholder:text-white/20 focus:border-blue-500/40 outline-none transition-all" />
                  </div>
                  <div className="space-y-2 relative">
                    <label className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/30">Status</label>
                    <button ref={statusRef} type="button" onClick={openStatusDropdown}
                      className={cn("w-full bg-white/5 border border-zinc-800 rounded-md h-11 px-4 flex items-center justify-between text-sm transition-all hover:border-zinc-700 capitalize", getEventStatusTextColor(status))}>
                      <span>{status}</span>
                      <ChevronDown size={14} className="text-white/20" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-[15px] pt-5">
                  <label className="text-xs font-medium uppercase tracking-[0.2em] text-white leading-none">Single Day</label>
                  <button type="button" onClick={() => {
                      if (!isFullDay && start) {
                        const d = new Date(start);
                        setStart(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}T00:00`);
                      }
                      setIsFullDay(!isFullDay);
                    }}
                    className={cn("w-11 h-6 rounded-full transition-all relative shrink-0",
                      isFullDay ? "bg-blue-500" : "bg-zinc-700")}>
                    <div className={cn("w-4 h-4 rounded-full bg-white absolute top-1 transition-all", isFullDay ? "left-6" : "left-1")} />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/30">Event Date</label>
                    <input type="datetime-local" value={start} onChange={e => setStart(e.target.value)}
                      className="w-full bg-white/5 border border-zinc-800 rounded-md h-11 px-4 text-sm text-white focus:border-blue-500/40 outline-none transition-all [color-scheme:dark]" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/30">End Date</label>
                    <input type="datetime-local" value={end} onChange={e => setEnd(e.target.value)} disabled={isFullDay}
                      className="w-full bg-white/5 border border-zinc-800 rounded-md h-11 px-4 text-sm text-white focus:border-blue-500/40 outline-none transition-all [color-scheme:dark] disabled:opacity-40 disabled:cursor-not-allowed" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/30">Description</label>
                  <textarea value={description} onChange={e => setDescription(e.target.value)} rows={7}
                    className="w-full bg-white/5 border border-zinc-800 rounded-md px-4 py-3 text-sm text-white placeholder:text-white/20 focus:border-blue-500/40 outline-none transition-all resize-none" />
                </div>
                {error && <p className="text-[10px] text-red-500 font-medium uppercase tracking-wider">{error}</p>}
              </div>
            </form>

            {showStatusDropdown && dropdownPos && (
              <>
                <div className="fixed inset-0 z-[9998]" onClick={() => { setShowStatusDropdown(false); setDropdownPos(null); }} />
                <div style={{ position: 'fixed', top: dropdownPos.top, left: dropdownPos.left, width: dropdownPos.width, zIndex: 9999 }}
                  className="bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl overflow-hidden">
                  {EVENT_STATUS_OPTIONS.map(opt => {
                    const isDisabled = opt.value !== 'cancelled';
                    return (
                      <button key={opt.value} type="button" disabled={isDisabled}
                        onClick={() => { if (!isDisabled) { setStatus(opt.value); setShowStatusDropdown(false); setDropdownPos(null); } }}
                        className={cn("w-full px-4 py-2.5 flex items-center justify-between transition-all text-left capitalize",
                          isDisabled ? "opacity-30 cursor-not-allowed" : "hover:bg-white/[0.03]", status === opt.value && "bg-blue-500/5")}>
                        <span className={cn("text-xs font-medium capitalize", getEventStatusTextColor(opt.value))}>{opt.label}</span>
                        {status === opt.value && <Check size={12} className="text-blue-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="flex-1 flex flex-col min-h-0">
            <div className="shrink-0">
              <div className={cn("h-2 w-full",
                event.status === 'live' ? 'bg-emerald-500/20' :
                event.status === 'cancelled' ? 'bg-red-500/20' :
                event.status === 'ended' ? 'bg-white/5' :
                'bg-blue-500/20')} />
              <div className="px-8 py-4 border-b border-zinc-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[8px] text-white/30 uppercase tracking-[0.2em] font-medium mb-1">Event</p>
                    <h2 className="text-lg font-bold text-white pr-4">{event.title}</h2>
                  </div>
                  {event.status && (
                    <span className={cn("shrink-0 px-2 py-0.5 rounded-full border text-[8px] font-bold uppercase tracking-wider", EVENT_STATUS_STYLES[event.status] || EVENT_STATUS_STYLES.upcoming)}>
                      {EVENT_STATUS_OPTIONS.find(o => o.value === event.status)?.label || event.status}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="shrink-0 px-8 pt-4 pb-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2.5 p-3 rounded-lg bg-white/[0.03] border border-zinc-800/50">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                    <Calendar size={14} className="text-blue-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[8px] text-white/30 uppercase tracking-[0.2em] font-medium">Date</p>
                    <p className="text-xs text-white font-medium truncate">
                      {event.start && format(parseISO(event.start), 'MMM d, yyyy')}
                      {event.end && event.start && new Date(event.end).toDateString() !== new Date(event.start).toDateString() && (
                        <> — {format(parseISO(event.end), 'MMM d, yyyy')}</>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 p-3 rounded-lg bg-white/[0.03] border border-zinc-800/50">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                    <Clock size={14} className="text-emerald-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[8px] text-white/30 uppercase tracking-[0.2em] font-medium">Time</p>
                    <p className="text-xs text-white font-medium truncate">
                      {event.start && format(parseISO(event.start), 'h:mm a')}
                      {event.end && <> — {format(parseISO(event.end), 'h:mm a')}</>}
                      {isFullDay && <span>All Day</span>}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {event.description && (
              <div className="overflow-y-auto custom-scrollbar px-8 pb-4" style={{ maxHeight: '300px', minHeight: '150px' }}>
                <div className="space-y-2">
                  <p className="text-[9px] text-white/30 uppercase tracking-[0.2em] font-medium" style={{ marginTop: '20px' }}>Description</p>
                  <p className="text-sm text-white/70 leading-relaxed whitespace-pre-wrap">{event.description}</p>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="px-8 py-4 border-t border-zinc-800 bg-black/50 backdrop-blur-xl flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            {!canEdit && event.user_name && (
              <>
                <div className="w-7 h-7 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                  <User size={12} className="text-blue-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-[8px] text-white/30 uppercase tracking-[0.2em] font-medium">Created by</p>
                  <p className="text-xs text-white font-medium truncate">{event.user_name}</p>
                </div>
              </>
            )}
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button type="button" onClick={onClose}
              className="px-6 py-2 rounded-sm bg-zinc-900/50 border border-zinc-800 text-white/40 hover:text-white hover:bg-zinc-800 transition-all text-[10px] font-medium uppercase tracking-[0.2em]">
              {canEdit ? 'Cancel' : 'Close'}
            </button>
            {canEdit && (
              <button type="submit" form="update-event-form" disabled={isSubmitting || !title.trim() || !description.trim() || !start}
                className="px-6 py-2 rounded-sm bg-blue-500/20 border border-blue-500/30 text-blue-400 hover:bg-blue-500/30 hover:border-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed text-[10px] font-medium uppercase tracking-[0.2em] transition-all flex items-center gap-2">
                {isSubmitting ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : <><CalendarPlus size={14} />Save</>}
              </button>
            )}
          </div>
        </div>

        <ConfirmDeleteDialog
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          onConfirm={async () => {
            setIsDeleting(true);
            try {
              await axios.delete(`/api/calendar/todos/${event.id}/`);
              setShowDeleteConfirm(false);
              onSuccess?.();
              onClose();
            } catch {
              setShowDeleteConfirm(false);
              setError('Failed to delete event.');
            } finally {
              setIsDeleting(false);
            }
          }}
          isDeleting={isDeleting}
          title="Delete Event"
          description="This will permanently remove this event."
        />
      </div>
    </div>,
    document.body
  );
};

export default UpdateEventModal;
