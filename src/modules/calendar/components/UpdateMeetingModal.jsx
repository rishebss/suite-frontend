import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { format, parseISO } from 'date-fns';
import { Loader2, CalendarPlus, Trash2, ChevronDown, Search, Check, MapPin, Users, Clock, Calendar, User } from 'lucide-react';
import ConfirmDeleteDialog from '@/components/ConfirmDeleteDialog';
import axios from 'axios';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import {
  MEETING_STATUS_OPTIONS, MEETING_STATUS_STYLES, getMeetingStatusTextColor,
  getMeetingStatusDropdownItemStyle, getMeetingStatusDotColor
} from '../constants';

const CopyButton = ({ text }) => {
  const [copied, setCopied] = useState(false);
  return (
    <button type="button" onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
      className={cn("shrink-0 p-1.5 rounded border transition-all", copied ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-400" : "bg-white/5 border-zinc-800 text-white/40 hover:text-white hover:bg-white/10")}>
      {copied ? (
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
      )}
    </button>
  );
};

const UpdateMeetingModal = ({ event, isOpen, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [status, setStatus] = useState('upcoming');
  const [meetingDate, setMeetingDate] = useState('');
  const [meetingStartTime, setMeetingStartTime] = useState('');
  const [meetingEndTime, setMeetingEndTime] = useState('');
  const [selectedAttendees, setSelectedAttendees] = useState([]);
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showAttendeesPopover, setShowAttendeesPopover] = useState(false);
  const attendeesRef = useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');
  const [dropdownPos, setDropdownPos] = useState({ status: null, user: null });
  const statusRef = useRef(null);
  const userRef = useRef(null);
  const modalRef = useRef(null);

  const isCreator = event?.user === user?.id;
  const canEdit = isCreator;

  useEffect(() => {
    if (isOpen && event) {
      setTitle(event.title || '');
      setDescription(event.description || '');
      setLocation(event.location || '');
      setStatus(event.status || 'upcoming');
      const s = event.start || '';
      setMeetingDate(s ? s.slice(0, 10) : '');
      setMeetingStartTime(s ? s.slice(11, 16) : '');
      setMeetingEndTime(event.end ? event.end.slice(11, 16) : '');
      setSelectedAttendees((event.attendees || []).map(a => ({ id: a.user, first_name: a.user_name })));
      setError('');

      setUsersLoading(true);
      axios.get('/api/auth/users/assignable/')
        .then(res => setUsers(res.data || []))
        .catch(() => setUsers([]))
        .finally(() => setUsersLoading(false));
    }
  }, [isOpen, event]);

  const openStatusDropdown = () => {
    if (statusRef.current) {
      const rect = statusRef.current.getBoundingClientRect();
      setDropdownPos({ status: { top: rect.bottom + 4, left: rect.left, width: rect.width }, user: null });
      setShowUserDropdown(false);
      setShowStatusDropdown(true);
    }
  };

  const openUserDropdown = () => {
    if (userRef.current) {
      const rect = userRef.current.getBoundingClientRect();
      setDropdownPos({ user: { top: rect.bottom + 4, left: rect.left, width: rect.width }, status: null });
      setShowStatusDropdown(false);
      setShowUserDropdown(true);
    }
  };

  const filteredUsers = users.filter(u =>
    !userSearch || u.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.first_name?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.last_name?.toLowerCase().includes(userSearch.toLowerCase())
  );

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
        location: location || undefined,
        attendee_ids: selectedAttendees.map(a => a.id),
        start: meetingDate && meetingStartTime ? new Date(`${meetingDate}T${meetingStartTime}`).toISOString() : null,
        end: meetingDate && meetingEndTime ? new Date(`${meetingDate}T${meetingEndTime}`).toISOString() : undefined,
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

      <div ref={modalRef} className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {canEdit ? (
          <>
            <div className="px-8 py-6 border-b border-zinc-800 bg-white/[0.02] flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-sm font-medium text-white uppercase tracking-wider">Update Meeting</h2>
                <p className="text-[9px] text-white/40 uppercase tracking-widest font-medium">Edit meeting details</p>
              </div>
              <button type="button" onClick={() => setShowDeleteConfirm(true)}
                className="p-1.5 rounded bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all">
                <Trash2 size={14} />
              </button>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
              <form onSubmit={handleSubmit} id="update-meeting-form">
                <div className="px-8 py-6 space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/30">Meeting Title</label>
                      <input value={title} onChange={e => setTitle(e.target.value)}
                        className="w-full bg-white/5 border border-zinc-800 rounded-md h-11 px-4 text-sm text-white placeholder:text-white/20 focus:border-blue-500/40 outline-none transition-all" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/30">Status</label>
                      <button ref={statusRef} type="button" onClick={openStatusDropdown}
                        className={cn("w-full bg-white/5 border border-zinc-800 rounded-md h-11 px-4 flex items-center justify-between text-sm transition-all hover:border-zinc-700 capitalize", getMeetingStatusTextColor(status))}>
                        <span>{status}</span>
                        <ChevronDown size={14} className="text-white/20" />
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/30">Agenda</label>
                    <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3}
                      className="w-full bg-white/5 border border-zinc-800 rounded-md px-4 py-3 text-sm text-white placeholder:text-white/20 focus:border-blue-500/40 outline-none transition-all resize-none" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/30">Location / Link</label>
                      <input value={location} onChange={e => setLocation(e.target.value)}
                        placeholder="Add meeting location or link..."
                        className="w-full bg-white/5 border border-zinc-800 rounded-md h-11 px-4 text-sm text-white placeholder:text-white/20 focus:border-blue-500/40 outline-none transition-all" />
                    </div>
                    <div className="space-y-2 relative">
                      <label className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/30">Attendees (multi-select)</label>
                      <button ref={userRef} type="button" onClick={openUserDropdown}
                        className="w-full bg-white/5 border border-zinc-800 rounded-md h-11 px-4 flex items-center justify-between text-sm text-white/60 hover:border-zinc-700 transition-all">
                        <span className={selectedAttendees.length > 0 ? 'text-white' : 'text-white/20'}>
                          {selectedAttendees.length === 0 ? 'Select attendees...' :
                            `${selectedAttendees[0].first_name || selectedAttendees[0].id}${selectedAttendees.length > 1 ? ` +${selectedAttendees.length - 1}` : ''}`}
                        </span>
                        <ChevronDown size={14} className="text-white/20 shrink-0" />
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/30">Date</label>
                      <input type="date" value={meetingDate} onChange={e => setMeetingDate(e.target.value)}
                        className="w-full bg-white/5 border border-zinc-800 rounded-md h-11 px-4 text-sm text-white focus:border-blue-500/40 outline-none transition-all [color-scheme:dark]" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/30">Start Time</label>
                      <input type="time" value={meetingStartTime} onChange={e => setMeetingStartTime(e.target.value)}
                        className="w-full bg-white/5 border border-zinc-800 rounded-md h-11 px-4 text-sm text-white focus:border-blue-500/40 outline-none transition-all [color-scheme:dark]" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/30">End Time</label>
                      <input type="time" value={meetingEndTime} onChange={e => setMeetingEndTime(e.target.value)}
                        className="w-full bg-white/5 border border-zinc-800 rounded-md h-11 px-4 text-sm text-white focus:border-blue-500/40 outline-none transition-all [color-scheme:dark]" />
                    </div>
                  </div>
                  {error && <p className="text-[10px] text-red-500 font-medium uppercase tracking-wider">{error}</p>}
                </div>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col min-h-0">
            <div className="shrink-0">
              <div className={cn("h-2 w-full",
                event.status === 'live' ? 'bg-emerald-500/20' :
                event.status === 'cancelled' ? 'bg-red-500/20' :
                event.status === 'ended' ? 'bg-white/5' :
                'bg-purple-500/20')} />
              <div className="px-8 py-4 border-b border-zinc-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[8px] text-white/30 uppercase tracking-[0.2em] font-medium mb-1">Meeting</p>
                    <h2 className="text-lg font-bold text-white pr-4">{event.title}</h2>
                  </div>
                  {event.status && (
                    <span className={cn("shrink-0 px-2 py-0.5 rounded-full border text-[8px] font-bold uppercase tracking-wider", MEETING_STATUS_STYLES[event.status] || MEETING_STATUS_STYLES.upcoming)}>
                      {event.status === 'upcoming' ? 'Meeting' :
                       event.status === 'live' ? 'Live' :
                       event.status === 'ended' ? 'Ended' :
                       event.status === 'cancelled' ? 'Cancelled' : 'Meeting'}
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
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {event.description && (
              <div className="overflow-y-auto custom-scrollbar px-8 pb-4" style={{ maxHeight: '300px', minHeight: '150px' }}>
                <div className="space-y-2">
                  <p className="text-[9px] text-white/30 uppercase tracking-[0.2em] font-medium" style={{ marginTop: '20px' }}>Agenda</p>
                  <p className="text-sm text-white/70 leading-relaxed whitespace-pre-wrap">{event.description}</p>
                </div>
              </div>
            )}

            {(event.location || (event.attendees && event.attendees.length > 0)) && (
              <div className="shrink-0 px-8 pb-4 flex gap-3" style={{ marginTop: '15px' }}>
                {event.location && (
                  <div className="flex-[0.65] flex items-center gap-2.5 p-3 rounded-lg bg-white/[0.03] border border-zinc-800/50 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                      <MapPin size={14} className="text-amber-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[8px] text-white/30 uppercase tracking-[0.2em] font-medium">Location / Link</p>
                      <p className="text-xs text-white font-medium truncate">{event.location}</p>
                    </div>
                    <CopyButton text={event.location} />
                  </div>
                )}
                {event.attendees && event.attendees.length > 0 && (
                  <button ref={attendeesRef} type="button" onClick={() => setShowAttendeesPopover(prev => !prev)}
                    className={cn("flex items-center gap-2.5 p-3 rounded-lg bg-white/[0.03] border border-zinc-800/50 min-w-0 text-left", event.location ? 'flex-[0.35]' : 'flex-1', 'hover:bg-white/[0.06] transition-all')}>
                    <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
                      <Users size={14} className="text-purple-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[8px] text-white/30 uppercase tracking-[0.2em] font-medium">Attendees</p>
                      <p className="text-xs text-white font-medium truncate">
                        {event.attendees[0]?.user_name}{event.attendees.length > 1 ? ` +${event.attendees.length - 1}` : ''}
                      </p>
                    </div>
                  </button>
                )}
                {showAttendeesPopover && event.attendees && (
                  <>
                    <div className="fixed inset-0 z-[9998]" onClick={() => setShowAttendeesPopover(false)} />
                    <div style={{ position: 'fixed', bottom: '80px', left: 'calc(50% + 300px - 40px)', zIndex: 9999 }}
                      className="bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl overflow-hidden py-2 min-w-[180px]">
                      <div className="px-4 pb-2 border-b border-zinc-800 flex items-center justify-between">
                        <p className="text-[8px] text-white/30 uppercase tracking-[0.2em] font-medium">Attendees</p>
                        <button type="button" onClick={() => setShowAttendeesPopover(false)}
                          className="p-0.5 rounded bg-white/5 border border-zinc-800 text-white/30 hover:text-white hover:bg-white/10 transition-all">
                          <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        </button>
                      </div>
                      <div className="max-h-48 overflow-y-auto custom-scrollbar">
                        {event.attendees.map((a, i) => (
                          <div key={i} className="px-4 py-2 flex items-center gap-2.5 hover:bg-white/[0.02]">
                            <div className="w-6 h-6 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-[8px] font-bold text-purple-400 uppercase shrink-0">
                              {(a.user_name?.[0] || '?')}
                            </div>
                            <span className="text-xs text-white font-medium">{a.user_name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        <div className="px-8 py-4 border-t border-zinc-800 bg-black/50 backdrop-blur-xl flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            {!canEdit && event.user_name && (
              <>
                <div className="w-7 h-7 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
                  <User size={12} className="text-purple-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-[8px] text-white/30 uppercase tracking-[0.2em] font-medium">Created by</p>
                  <p className="text-xs text-white font-medium truncate">{event.user_name}</p>
                </div>
              </>
            )}
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button type="button" onClick={onClose} disabled={isSubmitting}
              className="px-6 py-2 rounded-sm bg-zinc-900/50 border border-zinc-800 text-white/40 hover:text-white hover:bg-zinc-800 transition-all text-[10px] font-medium uppercase tracking-[0.2em]">
              {canEdit ? 'Cancel' : 'Close'}
            </button>
            {canEdit && (
              <button type="submit" form="update-meeting-form" disabled={isSubmitting || !title.trim() || !meetingDate || !meetingStartTime}
                className="px-6 py-2 rounded-sm bg-blue-500/20 border border-blue-500/30 text-blue-400 hover:bg-blue-500/30 hover:border-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed text-[10px] font-medium uppercase tracking-[0.2em] transition-all flex items-center gap-2">
                {isSubmitting ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : <><CalendarPlus size={14} />Save</>}
              </button>
            )}
          </div>
        </div>

        {showStatusDropdown && dropdownPos.status && canEdit && (
          <>
            <div className="fixed inset-0 z-[9998]" onClick={() => { setShowStatusDropdown(false); setDropdownPos(prev => ({ ...prev, status: null })); }} />
            <div style={{ position: 'fixed', top: dropdownPos.status.top, left: dropdownPos.status.left, width: dropdownPos.status.width, zIndex: 9999 }}
              className="bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl overflow-hidden p-1">
              {MEETING_STATUS_OPTIONS.map(opt => (
                <button key={opt.value} type="button" onClick={() => { setStatus(opt.value); setShowStatusDropdown(false); setDropdownPos(prev => ({ ...prev, status: null })); }}
                  className={cn("w-full px-4 py-2.5 text-left text-xs font-medium rounded-lg transition-all capitalize flex items-center gap-2", getMeetingStatusDropdownItemStyle(opt.value, status === opt.value))}>
                  <div className={cn("w-1.5 h-1.5 rounded-full", getMeetingStatusDotColor(opt.value))} />
                  {opt.label}
                  {status === opt.value && <Check size={12} className="ml-auto shrink-0" />}
                </button>
              ))}
            </div>
          </>
        )}

        {showUserDropdown && dropdownPos.user && canEdit && (
          <>
            <div className="fixed inset-0 z-[9998]" onClick={() => { setShowUserDropdown(false); setDropdownPos(prev => ({ ...prev, user: null })); }} />
            <div style={{ position: 'fixed', top: dropdownPos.user.top, left: dropdownPos.user.left, width: dropdownPos.user.width, zIndex: 9999 }}
              className="bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl overflow-hidden">
              <div className="p-2 border-b border-zinc-800">
                <div className="relative">
                  <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
                  <input autoFocus value={userSearch} onChange={e => setUserSearch(e.target.value)}
                    placeholder="Search users..."
                    className="w-full bg-white/5 border border-zinc-800 rounded-md h-8 pl-8 pr-3 text-xs text-white placeholder:text-white/20 outline-none focus:border-blue-500/40 transition-all" />
                </div>
              </div>
              <div className="max-h-48 overflow-y-auto custom-scrollbar">
                {usersLoading ? (
                  <div className="flex items-center justify-center py-6"><Loader2 size={16} className="animate-spin text-blue-500/50" /></div>
                ) : filteredUsers.length === 0 ? (
                  <p className="text-[10px] text-white/20 text-center py-6 uppercase tracking-widest">No users found</p>
                ) : (
                  filteredUsers.map(u => {
                    const isSelected = selectedAttendees.some(a => a.id === u.id);
                    return (
                      <button key={u.id} type="button" onClick={() => {
                        setSelectedAttendees(prev =>
                          prev.some(a => a.id === u.id) ? prev.filter(a => a.id !== u.id) : [...prev, u]
                        );
                      }}
                        className={cn("w-full px-4 py-2.5 flex items-center justify-between hover:bg-white/[0.03] transition-all text-left", isSelected && "bg-blue-500/5")}>
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-[9px] font-bold text-blue-400 uppercase">
                            {(u.first_name?.[0] || u.email?.[0] || '?')}
                          </div>
                          <div>
                            <p className="text-xs font-medium text-white">{u.first_name || u.email}</p>
                            {u.email && u.first_name && <p className="text-[9px] text-white/20">{u.email}</p>}
                          </div>
                        </div>
                        {isSelected && <Check size={12} className="text-blue-400 shrink-0" />}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </>
        )}

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
              setError('Failed to delete meeting.');
            } finally {
              setIsDeleting(false);
            }
          }}
          isDeleting={isDeleting}
          title="Delete Meeting"
          description="This will permanently remove this meeting."
        />
      </div>
    </div>,
    document.body
  );
};

export default UpdateMeetingModal;
