import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { CalendarPlus, Loader2, ListChecks, Calendar, Bell, Users } from 'lucide-react';
import axios from 'axios';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import TaskTabForm from './TaskTabForm';
import EventTabForm from './EventTabForm';
import FollowUpTabForm from './FollowUpTabForm';
import MeetingTabForm from './MeetingTabForm';
import FormDropdowns from './FormDropdowns';

const TABS = [
  { id: 'tasks', label: 'Tasks', icon: ListChecks },
  { id: 'event', label: 'Event', icon: Calendar },
  { id: 'followup', label: 'Follow Up', icon: Bell },
  { id: 'meetings', label: 'Meetings', icon: Users },
];

const AddEventModal = ({ isOpen, onClose, onSuccess }) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'Superadmin' || user?.role === 'Admin';

  const [activeTab, setActiveTab] = useState('tasks');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [priority, setPriority] = useState('medium');
  const [assignedTo, setAssignedTo] = useState(null);
  const [selectedAttendees, setSelectedAttendees] = useState([]);
  const [location, setLocation] = useState('');
  const [meetingDate, setMeetingDate] = useState('');
  const [meetingStartTime, setMeetingStartTime] = useState('');
  const [meetingEndTime, setMeetingEndTime] = useState('');
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [eventStatus, setEventStatus] = useState('upcoming');
  const [isFullDay, setIsFullDay] = useState(false);
  const [followUpStatus, setFollowUpStatus] = useState('follow_up');
  const [meetingStatus, setMeetingStatus] = useState('upcoming');
  const [contacts, setContacts] = useState([]);
  const [contactsLoading, setContactsLoading] = useState(false);
  const [contactSearch, setContactSearch] = useState('');
  const [selectedContact, setSelectedContact] = useState(null);
  const [pipelines, setPipelines] = useState([]);
  const [pipelinesLoading, setPipelinesLoading] = useState(false);
  const [selectedPipeline, setSelectedPipeline] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Dropdown visibility
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);
  const [showEventStatusDropdown, setShowEventStatusDropdown] = useState(false);
  const [showFollowUpStatusDropdown, setShowFollowUpStatusDropdown] = useState(false);
  const [showMeetingStatusDropdown, setShowMeetingStatusDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showPipelineDropdown, setShowPipelineDropdown] = useState(false);
  const [showContactDropdown, setShowContactDropdown] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({});

  useEffect(() => {
    if (isOpen) {
      reset();
      const now = new Date();
      const startStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}T00:00`;
      const endStr = new Date(now.getTime() + 60 * 60 * 1000).toISOString().slice(0, 16);
      setStart(startStr);
      setEnd(endStr);
      setMeetingDate(now.toISOString().slice(0, 10));
      setMeetingStartTime(now.toISOString().slice(11, 16));
      setMeetingEndTime(new Date(now.getTime() + 60 * 60 * 1000).toISOString().slice(11, 16));

      setUsersLoading(true);
      axios.get('/api/auth/users/assignable/')
        .then(res => {
          const usersData = res.data || [];
          setUsers(usersData);
          if (!isAdmin && user) {
            setAssignedTo({ id: user.id, first_name: user.first_name || user.email, email: user.email, role: user.role });
          }
        })
        .catch(() => setUsers([]))
        .finally(() => setUsersLoading(false));

      setPipelinesLoading(true);
      axios.get('/api/crm/pipelines/')
        .then(res => setPipelines(res.data.results || res.data || []))
        .catch(() => setPipelines([]))
        .finally(() => setPipelinesLoading(false));
    }
  }, [isOpen]);

  const loadContacts = useCallback((pipeline, userObj, search) => {
    if (pipeline?.id && userObj?.id) {
      setContactsLoading(true);
      const params = new URLSearchParams();
      params.set('pipeline', pipeline.id);
      params.set('assigned_user', userObj.id);
      if (search) params.set('search', search);
      axios.get(`/api/crm/pipeline/?${params}`)
        .then(res => {
          const items = res.data.results || res.data || [];
          setContacts(items.map(c => ({ id: c.contact_details?.id, crm: c.id, name: c.contact_details?.name, email: c.contact_details?.email, phone: c.contact_details?.phone })));
        })
        .catch(() => setContacts([]))
        .finally(() => setContactsLoading(false));
    } else {
      setContacts([]);
    }
  }, []);

  useEffect(() => {
    if (selectedPipeline?.id && assignedTo?.id) {
      setSelectedContact(null);
      setContactSearch('');
      loadContacts(selectedPipeline, assignedTo, '');
    } else {
      setContacts([]);
    }
  }, [selectedPipeline?.id, assignedTo?.id, loadContacts]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (selectedPipeline?.id && assignedTo?.id) {
        loadContacts(selectedPipeline, assignedTo, contactSearch);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [contactSearch, selectedPipeline?.id, assignedTo?.id, loadContacts]);

  const reset = () => {
    setTitle(''); setDescription(''); setStart(''); setEnd('');
    setPriority('medium'); setEventStatus('upcoming'); setFollowUpStatus('follow_up'); setIsFullDay(false); setAssignedTo(null); setSelectedAttendees([]); setSelectedContact(null); setSelectedPipeline(null); setLocation(''); setMeetingDate(''); setMeetingStartTime(''); setMeetingEndTime(''); setUserSearch(''); setContactSearch(''); setError('');
    setShowPriorityDropdown(false); setShowEventStatusDropdown(false); setShowFollowUpStatusDropdown(false); setShowMeetingStatusDropdown(false); setShowUserDropdown(false); setShowContactDropdown(false); setShowPipelineDropdown(false);
  };

  const handleClose = () => { reset(); onClose(); };

  const openDropdown = (key, ref) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const pos = { top: rect.bottom + 4, left: rect.left, width: rect.width };

    // Close all other dropdowns
    setShowPriorityDropdown(false);
    setShowEventStatusDropdown(false);
    setShowFollowUpStatusDropdown(false);
    setShowMeetingStatusDropdown(false);
    setShowUserDropdown(false);
    setShowPipelineDropdown(false);
    setShowContactDropdown(false);

    setDropdownPos(prev => ({ ...prev, [key]: pos }));

    switch (key) {
      case 'priority': setShowPriorityDropdown(true); break;
      case 'eventStatus': setShowEventStatusDropdown(true); break;
      case 'followUpStatus': setShowFollowUpStatusDropdown(true); break;
      case 'meetingStatus': setShowMeetingStatusDropdown(true); break;
      case 'user': setShowUserDropdown(true); break;
      case 'pipeline': setShowPipelineDropdown(true); break;
      case 'contact': setShowContactDropdown(true); break;
    }
  };

  const closeDropdown = (key) => {
    switch (key) {
      case 'priority': setShowPriorityDropdown(false); break;
      case 'eventStatus': setShowEventStatusDropdown(false); break;
      case 'followUpStatus': setShowFollowUpStatusDropdown(false); break;
      case 'meetingStatus': setShowMeetingStatusDropdown(false); break;
      case 'user': setShowUserDropdown(false); setUserSearch(''); break;
      case 'pipeline': setShowPipelineDropdown(false); break;
      case 'contact': setShowContactDropdown(false); setContactSearch(''); break;
    }
    setDropdownPos(prev => ({ ...prev, [key]: null }));
  };

  const filteredUsers = users.filter(u =>
    !userSearch || u.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.first_name?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.last_name?.toLowerCase().includes(userSearch.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const typeMap = { tasks: 'task', event: 'event', followup: 'followup', meetings: 'meeting' };
    const basePayload = {
      todo_type: typeMap[activeTab],
      title,
      description: description || undefined,
    };

    let payload;
    switch (activeTab) {
      case 'tasks':
        payload = { ...basePayload, priority, assigned_to: assignedTo?.id || null, start: start ? new Date(start).toISOString() : null };
        break;
      case 'event':
        payload = {
          ...basePayload,
          status: eventStatus,
          start: start ? new Date(start).toISOString() : null,
          end: isFullDay
            ? (start ? new Date(new Date(start).setHours(23, 59, 59, 999)).toISOString() : null)
            : (end ? new Date(end).toISOString() : null),
        };
        break;
      case 'followup':
        payload = { ...basePayload, status: followUpStatus, pipeline: selectedPipeline?.id || null, contact: selectedContact?.id || null, crm: contacts.find(c => c.id === selectedContact?.id)?.crm || null, assigned_to: assignedTo?.id || null, start: start ? new Date(start).toISOString() : null };
        break;
      case 'meetings':
        payload = {
          ...basePayload,
          status: meetingStatus,
          location: location || undefined,
          attendee_ids: selectedAttendees.map(a => a.id),
          start: meetingDate && meetingStartTime ? new Date(`${meetingDate}T${meetingStartTime}`).toISOString() : null,
          end: meetingDate && meetingEndTime ? new Date(`${meetingDate}T${meetingEndTime}`).toISOString() : null,
        };
        break;
      default:
        payload = basePayload;
    }

    try {
      await axios.post('/api/calendar/todos/', payload);
      reset();
      onSuccess?.();
      onClose();
    } catch (err) {
      const data = err.response?.data;
      let msg = 'Failed to save. Please check all required fields.';
      if (data) {
        if (typeof data === 'string') {
          msg = data;
        } else if (data.detail) {
          msg = data.detail;
        } else {
          const firstKey = Object.keys(data)[0];
          const firstError = data[firstKey];
          msg = Array.isArray(firstError) ? firstError[0] : firstError;
        }
      }
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const formData = {
    title, description, start, end, priority, assignedTo, selectedAttendees, location,
    meetingDate, meetingStartTime, meetingEndTime, eventStatus, isFullDay, followUpStatus,
    meetingStatus, selectedContact, selectedPipeline, contacts, contactsLoading,
  };

  const updateForm = (updates) => {
    if ('title' in updates) setTitle(updates.title);
    if ('description' in updates) setDescription(updates.description);
    if ('start' in updates) setStart(updates.start);
    if ('end' in updates) setEnd(updates.end);
    if ('priority' in updates) setPriority(updates.priority);
    if ('assignedTo' in updates) setAssignedTo(updates.assignedTo);
    if ('selectedAttendees' in updates) setSelectedAttendees(updates.selectedAttendees);
    if ('location' in updates) setLocation(updates.location);
    if ('meetingDate' in updates) setMeetingDate(updates.meetingDate);
    if ('meetingStartTime' in updates) setMeetingStartTime(updates.meetingStartTime);
    if ('meetingEndTime' in updates) setMeetingEndTime(updates.meetingEndTime);
    if ('eventStatus' in updates) setEventStatus(updates.eventStatus);
    if ('isFullDay' in updates) setIsFullDay(updates.isFullDay);
    if ('followUpStatus' in updates) setFollowUpStatus(updates.followUpStatus);
    if ('meetingStatus' in updates) setMeetingStatus(updates.meetingStatus);
    if ('selectedContact' in updates) setSelectedContact(updates.selectedContact);
    if ('selectedPipeline' in updates) setSelectedPipeline(updates.selectedPipeline);
  };

  return createPortal(
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={handleClose} />

      <div className="relative w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

        <div className="px-8 py-6 border-b border-zinc-800 bg-white/[0.02] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <CalendarPlus size={14} />
            </div>
            <div>
              <h2 className="text-sm font-medium text-white uppercase tracking-wider">Add Event</h2>
              <p className="text-[9px] text-white/40 uppercase tracking-widest font-medium">New Calendar Entry</p>
            </div>
          </div>
          <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-lg border border-zinc-800/80 shrink-0">
            {TABS.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded text-[9px] font-semibold uppercase tracking-[0.1em] transition-all cursor-pointer",
                    isActive
                      ? "bg-white/10 text-white border border-white/5"
                      : "text-white/40 hover:text-white hover:bg-white/[0.02] border border-transparent"
                  )}
                >
                  <Icon size={10} className={isActive ? "text-blue-400" : "text-white/30"} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <form onSubmit={handleSubmit} id="add-event-form">
            <div className="px-8 py-6 space-y-5 min-h-[360px]">
              {activeTab === 'tasks' && <TaskTabForm data={formData} onChange={updateForm} isAdmin={isAdmin} onOpenDropdown={openDropdown} />}
              {activeTab === 'event' && <EventTabForm data={formData} onChange={updateForm} onOpenDropdown={openDropdown} />}
              {activeTab === 'followup' && <FollowUpTabForm data={formData} onChange={updateForm} isAdmin={isAdmin} onOpenDropdown={openDropdown} />}
              {activeTab === 'meetings' && <MeetingTabForm data={formData} onChange={updateForm} onOpenDropdown={openDropdown} />}
              {error && <p className="text-[10px] text-red-500 font-medium uppercase tracking-wider">{error}</p>}
            </div>
          </form>
        </div>

        <FormDropdowns
          activeTab={activeTab}
          dropdownPos={dropdownPos}
          showPriorityDropdown={showPriorityDropdown}
          showEventStatusDropdown={showEventStatusDropdown}
          showFollowUpStatusDropdown={showFollowUpStatusDropdown}
          showMeetingStatusDropdown={showMeetingStatusDropdown}
          showUserDropdown={showUserDropdown}
          showPipelineDropdown={showPipelineDropdown}
          showContactDropdown={showContactDropdown}
          onCloseDropdown={closeDropdown}
          priority={priority} setPriority={setPriority}
          eventStatus={eventStatus} setEventStatus={setEventStatus}
          followUpStatus={followUpStatus} setFollowUpStatus={setFollowUpStatus}
          meetingStatus={meetingStatus} setMeetingStatus={setMeetingStatus}
          assignedTo={assignedTo} setAssignedTo={setAssignedTo}
          selectedAttendees={selectedAttendees} setSelectedAttendees={setSelectedAttendees}
          selectedPipeline={selectedPipeline} setSelectedPipeline={setSelectedPipeline}
          setSelectedContact={setSelectedContact}
          userSearch={userSearch} setUserSearch={setUserSearch}
          users={users} usersLoading={usersLoading} filteredUsers={filteredUsers}
          pipelines={pipelines} pipelinesLoading={pipelinesLoading}
          contacts={contacts} contactsLoading={contactsLoading}
          contactSearch={contactSearch} setContactSearch={setContactSearch}
        />

        <div className="px-8 py-4 border-t border-zinc-800 bg-black/50 backdrop-blur-xl flex justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="px-6 py-2 rounded-sm bg-zinc-900/50 border border-zinc-800 text-white/40 hover:text-white hover:bg-zinc-800 transition-all text-[10px] font-medium uppercase tracking-[0.2em]"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="add-event-form"
            disabled={isSubmitting || !title.trim() || (activeTab === 'meetings' ? (!meetingDate || !meetingStartTime || !meetingEndTime) : !start) || (activeTab === 'event' && !description.trim()) || (activeTab === 'followup' && (!selectedPipeline || !assignedTo || !selectedContact))}
            className="px-6 py-2 rounded-sm bg-blue-500/20 border border-blue-500/30 text-blue-400 hover:bg-blue-500/30 hover:border-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed text-[10px] font-medium uppercase tracking-[0.2em] transition-all flex items-center gap-2"
          >
            {isSubmitting
              ? <><Loader2 size={14} className="animate-spin" /> Saving...</>
              : <><CalendarPlus size={14} />Save Event</>
            }
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default AddEventModal;
