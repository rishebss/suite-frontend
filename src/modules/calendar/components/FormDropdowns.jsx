import React from 'react';
import { Loader2, Check, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  MEETING_STATUS_OPTIONS, getMeetingStatusDropdownItemStyle, getMeetingStatusDotColor,
  EVENT_STATUS_OPTIONS, getEventStatusDropdownItemStyle, getEventStatusDotColor,
  getFollowUpStatusTextColor
} from '../constants';

const DropdownBackdrop = ({ onClick }) => (
  <div className="fixed inset-0 z-[9998]" onClick={onClick} />
);

const FormDropdowns = ({
  activeTab,
  dropdownPos,
  showPriorityDropdown, showEventStatusDropdown, showFollowUpStatusDropdown,
  showMeetingStatusDropdown, showUserDropdown, showPipelineDropdown, showContactDropdown,
  onCloseDropdown,
  priority, setPriority,
  eventStatus, setEventStatus,
  followUpStatus, setFollowUpStatus,
  meetingStatus, setMeetingStatus,
  assignedTo, setAssignedTo,
  selectedAttendees, setSelectedAttendees,
  selectedPipeline, setSelectedPipeline,
  setSelectedContact,
  userSearch, setUserSearch,
  users, usersLoading, filteredUsers,
  pipelines, pipelinesLoading,
  contacts, contactsLoading, contactSearch, setContactSearch,
  setContactSearchDebounced,
}) => {
  const close = (key) => () => {
    onCloseDropdown(key);
  };

  // Priority dropdown
  if (showPriorityDropdown && dropdownPos.priority) {
    // eslint-disable-next-line no-lone-blocks
    return (
      <>
        <DropdownBackdrop onClick={close('priority')} />
        <div
          style={{ position: 'fixed', top: dropdownPos.priority.top, left: dropdownPos.priority.left, width: dropdownPos.priority.width, zIndex: 9999 }}
          className="bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl overflow-hidden"
        >
          {['low', 'medium', 'high'].map(p => (
            <button key={p} type="button" onClick={() => { setPriority(p); close('priority')(); }}
              className={cn("w-full px-4 py-2.5 flex items-center justify-between hover:bg-white/[0.03] transition-all text-left", priority === p && "bg-blue-500/5")}>
              <span className={cn("text-xs font-medium capitalize", p === 'high' ? 'text-red-400' : p === 'medium' ? 'text-yellow-400' : 'text-blue-400')}>{p}</span>
              {priority === p && <Check size={12} className="text-blue-400 shrink-0" />}
            </button>
          ))}
        </div>
      </>
    );
  }

  // Event status dropdown
  if (showEventStatusDropdown && dropdownPos.eventStatus) {
    return (
      <>
        <DropdownBackdrop onClick={close('eventStatus')} />
        <div
          style={{ position: 'fixed', top: dropdownPos.eventStatus.top, left: dropdownPos.eventStatus.left, width: dropdownPos.eventStatus.width, zIndex: 9999 }}
          className="bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl overflow-hidden p-1"
        >
          {EVENT_STATUS_OPTIONS.map(opt => {
            const isDisabled = opt.value !== 'upcoming';
            return (
              <button key={opt.value} type="button" disabled={isDisabled}
                onClick={() => { if (!isDisabled) { setEventStatus(opt.value); close('eventStatus')(); } }}
                className={cn("w-full px-4 py-2.5 text-left text-xs font-medium rounded-lg transition-all capitalize flex items-center gap-2",
                  isDisabled ? "opacity-30 cursor-not-allowed" : "",
                  getEventStatusDropdownItemStyle(opt.value, eventStatus === opt.value))}>
                <div className={cn("w-1.5 h-1.5 rounded-full", getEventStatusDotColor(opt.value))} />
                {opt.label}
                {eventStatus === opt.value && <Check size={12} className="ml-auto shrink-0" />}
              </button>
            );
          })}
        </div>
      </>
    );
  }

  // Follow-up status dropdown
  if (showFollowUpStatusDropdown && dropdownPos.followUpStatus) {
    return (
      <>
        <DropdownBackdrop onClick={close('followUpStatus')} />
        <div
          style={{ position: 'fixed', top: dropdownPos.followUpStatus.top, left: dropdownPos.followUpStatus.left, width: dropdownPos.followUpStatus.width, zIndex: 9999 }}
          className="bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl overflow-hidden"
        >
          {['follow_up', 'complete', 'cancelled'].map(s => (
            <button key={s} type="button" onClick={() => { setFollowUpStatus(s); close('followUpStatus')(); }}
              className={cn("w-full px-4 py-2.5 flex items-center justify-between hover:bg-white/[0.03] transition-all text-left capitalize", followUpStatus === s && "bg-blue-500/5")}>
              <span className={cn("text-xs font-medium capitalize", getFollowUpStatusTextColor(s))}>{s.replace('_', ' ')}</span>
              {followUpStatus === s && <Check size={12} className="text-blue-400 shrink-0" />}
            </button>
          ))}
        </div>
      </>
    );
  }

  // Meeting status dropdown
  if (showMeetingStatusDropdown && dropdownPos.meetingStatus) {
    return (
      <>
        <DropdownBackdrop onClick={close('meetingStatus')} />
        <div style={{ position: 'fixed', top: dropdownPos.meetingStatus.top, left: dropdownPos.meetingStatus.left, width: dropdownPos.meetingStatus.width, zIndex: 9999 }}
          className="bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl overflow-hidden p-1">
          {MEETING_STATUS_OPTIONS.map(opt => (
            <button key={opt.value} type="button" onClick={() => { setMeetingStatus(opt.value); close('meetingStatus')(); }}
              className={cn("w-full px-4 py-2.5 text-left text-xs font-medium rounded-lg transition-all capitalize flex items-center gap-2", getMeetingStatusDropdownItemStyle(opt.value, meetingStatus === opt.value))}>
              <div className={cn("w-1.5 h-1.5 rounded-full", getMeetingStatusDotColor(opt.value))} />
              {opt.label}
              {meetingStatus === opt.value && <Check size={12} className="ml-auto shrink-0" />}
            </button>
          ))}
        </div>
      </>
    );
  }

  // User dropdown (assignee or attendees)
  if (showUserDropdown && dropdownPos.user) {
    return (
      <>
        <DropdownBackdrop onClick={close('user')} />
        <div
          style={{ position: 'fixed', top: dropdownPos.user.top, left: dropdownPos.user.left, width: dropdownPos.user.width, zIndex: 9999 }}
          className="bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl overflow-hidden"
        >
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
              <div className="flex items-center justify-center py-6">
                <Loader2 size={16} className="animate-spin text-blue-500/50" />
              </div>
            ) : filteredUsers.length === 0 ? (
              <p className="text-[10px] text-white/20 text-center py-6 uppercase tracking-widest">No users found</p>
            ) : (
              filteredUsers.map(u => {
                const isSelected = activeTab === 'meetings'
                  ? selectedAttendees.some(a => a.id === u.id)
                  : assignedTo?.id === u.id;
                return (
                  <button key={u.id} type="button" onClick={() => {
                    if (activeTab === 'meetings') {
                      setSelectedAttendees(prev =>
                        prev.some(a => a.id === u.id) ? prev.filter(a => a.id !== u.id) : [...prev, u]
                      );
                    } else {
                      setAssignedTo(u);
                      close('user')();
                      setUserSearch('');
                    }
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
    );
  }

  // Pipeline dropdown
  if (showPipelineDropdown && dropdownPos.pipeline) {
    return (
      <>
        <DropdownBackdrop onClick={close('pipeline')} />
        <div style={{ position: 'fixed', top: dropdownPos.pipeline.top, left: dropdownPos.pipeline.left, width: dropdownPos.pipeline.width, zIndex: 9999 }}
          className="bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl overflow-hidden">
          <div className="max-h-48 overflow-y-auto custom-scrollbar">
            {pipelinesLoading ? (
              <div className="flex items-center justify-center py-6"><Loader2 size={16} className="animate-spin text-blue-500/50" /></div>
            ) : pipelines.length === 0 ? (
              <p className="text-[10px] text-white/20 text-center py-6 uppercase tracking-widest">No pipelines found</p>
            ) : (
              pipelines.map(p => (
                <button key={p.id} type="button" onClick={() => { setSelectedPipeline(p); setAssignedTo(null); setSelectedContact(null); close('pipeline')(); }}
                  className={cn("w-full px-4 py-2.5 flex items-center justify-between hover:bg-white/[0.03] transition-all text-left", selectedPipeline?.id === p.id && "bg-blue-500/5")}>
                  <span className="text-xs font-medium text-white">{p.name}</span>
                  {selectedPipeline?.id === p.id && <Check size={12} className="text-blue-400 shrink-0" />}
                </button>
              ))
            )}
          </div>
        </div>
      </>
    );
  }

  // Contact dropdown
  if (showContactDropdown && dropdownPos.contact) {
    return (
      <>
        <DropdownBackdrop onClick={close('contact')} />
        <div
          style={{ position: 'fixed', top: dropdownPos.contact.top, left: dropdownPos.contact.left, width: dropdownPos.contact.width, zIndex: 9999 }}
          className="bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl overflow-hidden"
        >
          <div className="p-2 border-b border-zinc-800">
            <div className="relative">
              <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
              <input autoFocus value={contactSearch} onChange={e => setContactSearch(e.target.value)}
                placeholder="Search contacts..."
                className="w-full bg-white/5 border border-zinc-800 rounded-md h-8 pl-8 pr-3 text-xs text-white placeholder:text-white/20 outline-none focus:border-blue-500/40 transition-all" />
            </div>
          </div>
          <div className="max-h-48 overflow-y-auto custom-scrollbar">
            {contactsLoading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 size={16} className="animate-spin text-blue-500/50" />
              </div>
            ) : contacts.length === 0 ? (
              <p className="text-[10px] text-white/20 text-center py-6 uppercase tracking-widest">No contacts found</p>
            ) : (
              contacts.map(c => (
                <button key={c.id} type="button" onClick={() => { setSelectedContact(c); close('contact')(); setContactSearch(''); }}
                  className={cn("w-full px-4 py-2.5 flex items-center justify-between hover:bg-white/[0.03] transition-all text-left")}>
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-[9px] font-bold text-blue-400 uppercase">
                      {(c.name?.[0] || c.email?.[0] || '?')}
                    </div>
                    <div>
                      <p className="text-xs font-medium text-white">{c.name || c.email}</p>
                      {c.email && c.name && <p className="text-[9px] text-white/20">{c.email}</p>}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </>
    );
  }

  return null;
};

export default FormDropdowns;
