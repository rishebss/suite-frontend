import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { format, parseISO } from 'date-fns';
import { Loader2, CalendarPlus, Trash2, ChevronDown, Search, Check, X, Calendar, Clock, User, Building2, Contact, Phone, Mail } from 'lucide-react';
import ConfirmDeleteDialog from '@/components/ConfirmDeleteDialog';
import axios from 'axios';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { FOLLOWUP_STATUS_STYLES, getFollowUpStatusTextColor } from '../constants';

const UpdateFollowUpModal = ({ event, isOpen, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [start, setStart] = useState('');
  const [status, setStatus] = useState('follow_up');
  const [assignedTo, setAssignedTo] = useState(null);
  const [selectedContact, setSelectedContact] = useState(null);
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [contactsLoading, setContactsLoading] = useState(false);
  const [contactSearch, setContactSearch] = useState('');
  const [showContactDropdown, setShowContactDropdown] = useState(false);
  const [pipelines, setPipelines] = useState([]);
  const [pipelinesLoading, setPipelinesLoading] = useState(false);
  const [selectedPipeline, setSelectedPipeline] = useState(null);
  const [showPipelineDropdown, setShowPipelineDropdown] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');
  const [cancelSubmitting, setCancelSubmitting] = useState(false);
  const [cancelSaved, setCancelSaved] = useState(false);
  const [failedReason, setFailedReason] = useState('');
  const [failedSubmitting, setFailedSubmitting] = useState(false);
  const [failedSaved, setFailedSaved] = useState(false);
  const [completionRemarks, setCompletionRemarks] = useState('');
  const [compSubmitting, setCompSubmitting] = useState(false);
  const [compSaved, setCompSaved] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');
  const [dropdownPos, setDropdownPos] = useState({ status: null, user: null, contact: null, pipeline: null });
  const statusRef = useRef(null);
  const userRef = useRef(null);
  const contactRef = useRef(null);
  const pipelineRef = useRef(null);
  const prevAssignedToId = useRef(null);

  const isAdmin = user?.role === 'Superadmin' || user?.role === 'Admin';
  const isCreator = event?.user === user?.id;
  const isAssignee = event?.assigned_to === user?.id;
  const canEdit = isCreator;
  const canEditAssignee = isAdmin && isCreator;
  const canEditStatus = isCreator || isAssignee;

  useEffect(() => {
    if (isOpen && event) {
      setTitle(event.title || '');
      setDescription(event.description || '');
      setStart(event.start ? event.start.slice(0, 16) : '');
      setStatus(event.status || 'follow_up');
      setCancellationReason(event.followup_cancellation || '');
      setCancelSaved(!!event.followup_cancellation);
      setFailedReason(event.followup_failed || '');
      setFailedSaved(!!event.followup_failed);
      setCompletionRemarks(event.completion_remarks || '');
      setCompSaved(!!event.completion_remarks);
      if (!isAdmin && isCreator) {
        setAssignedTo({ id: user.id, first_name: user.first_name || user.email, role: user.role });
      } else {
        setAssignedTo(event.assigned_to ? { id: event.assigned_to, first_name: event.assigned_to_name } : null);
      }
      setSelectedContact(event.contact ? { id: event.contact, name: event.contact_name, phone: event.contact_phone, email: event.contact_email } : null);
      setSelectedPipeline(event.pipeline ? { id: event.pipeline, name: event.pipeline_name } : null);
      prevAssignedToId.current = (!isAdmin && isCreator) ? user.id : (event.assigned_to || null);
      setError('');

      setUsersLoading(true);
      axios.get('/api/auth/users/assignable/')
        .then(res => setUsers(res.data || []))
        .catch(() => setUsers([]))
        .finally(() => setUsersLoading(false));

      setPipelinesLoading(true);
      axios.get('/api/crm/pipelines/')
        .then(res => setPipelines(res.data.results || res.data || []))
        .catch(() => setPipelines([]))
        .finally(() => setPipelinesLoading(false));

    }
  }, [isOpen, event]);

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
      if (prevAssignedToId.current !== assignedTo.id) {
        setSelectedContact(null);
        setContactSearch('');
      }
      prevAssignedToId.current = assignedTo.id;
      loadContacts(selectedPipeline, assignedTo, '');
    } else {
      setContacts([]);
    }
  }, [selectedPipeline, assignedTo, loadContacts]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (selectedPipeline?.id && assignedTo?.id) {
        loadContacts(selectedPipeline, assignedTo, contactSearch);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [contactSearch, selectedPipeline, assignedTo, loadContacts]);

  // Enrich selectedContact with phone/email once contacts list loads
  useEffect(() => {
    if (selectedContact?.id && contacts.length > 0) {
      const fullContact = contacts.find(c => c.id === selectedContact.id);
      if (fullContact && (fullContact.phone !== selectedContact.phone || fullContact.email !== selectedContact.email)) {
        setSelectedContact(prev => ({ ...prev, phone: fullContact.phone, email: fullContact.email }));
      }
    }
  }, [contacts, selectedContact?.id]);

  const openStatusDropdown = () => {
    if (statusRef.current) {
      const rect = statusRef.current.getBoundingClientRect();
      setDropdownPos({ status: { top: rect.bottom + 4, left: rect.left, width: rect.width }, user: null, contact: null, pipeline: null });
      setShowUserDropdown(false);
      setShowContactDropdown(false);
      setShowPipelineDropdown(false);
      setShowStatusDropdown(true);
    }
  };

  const openUserDropdown = () => {
    if (userRef.current) {
      const rect = userRef.current.getBoundingClientRect();
      setDropdownPos({ user: { top: rect.bottom + 4, left: rect.left, width: rect.width }, contact: null, pipeline: null });
      setShowContactDropdown(false);
      setShowPipelineDropdown(false);
      setShowUserDropdown(true);
    }
  };

  const openContactDropdown = () => {
    if (contactRef.current) {
      const rect = contactRef.current.getBoundingClientRect();
      setDropdownPos({ contact: { top: rect.bottom + 4, left: rect.left, width: rect.width }, user: null, pipeline: null });
      setShowUserDropdown(false);
      setShowPipelineDropdown(false);
      setShowContactDropdown(true);
    }
  };

  const openPipelineDropdown = () => {
    if (pipelineRef.current) {
      const rect = pipelineRef.current.getBoundingClientRect();
      setDropdownPos({ pipeline: { top: rect.bottom + 4, left: rect.left, width: rect.width }, status: null, user: null, contact: null });
      setShowStatusDropdown(false);
      setShowUserDropdown(false);
      setShowContactDropdown(false);
      setShowPipelineDropdown(true);
    }
  };

  const filteredUsers = users.filter(u =>
    !userSearch || u.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.first_name?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.last_name?.toLowerCase().includes(userSearch.toLowerCase())
  );

  const handleCancelSubmit = async () => {
    if (!cancellationReason.trim()) return;
    setCancelSubmitting(true);
    setError('');
    try {
      await axios.patch(`/api/calendar/todos/${event.id}/`, { status: 'cancelled', followup_cancellation: cancellationReason });
      setCancelSaved(true);
    } catch (err) {
      const data = err.response?.data;
      setError(data?.detail || 'Failed to update.');
    } finally {
      setCancelSubmitting(false);
    }
  };

  const handleFailedSubmit = async () => {
    if (!failedReason.trim()) return;
    setFailedSubmitting(true);
    setError('');
    try {
      await axios.patch(`/api/calendar/todos/${event.id}/`, { status: 'failed', followup_failed: failedReason });
      setFailedSaved(true);
    } catch (err) {
      const data = err.response?.data;
      setError(data?.detail || 'Failed to update.');
    } finally {
      setFailedSubmitting(false);
    }
  };

  const handleCompSubmit = async () => {
    if (!completionRemarks.trim()) return;
    setCompSubmitting(true);
    setError('');
    try {
      await axios.patch(`/api/calendar/todos/${event.id}/`, { status: 'complete', completion_remarks: completionRemarks });
      setCompSaved(true);
    } catch (err) {
      const data = err.response?.data;
      setError(data?.detail || 'Failed to update.');
    } finally {
      setCompSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canEditStatus) return;
    setIsSubmitting(true);
    setError('');

    try {
      await axios.patch(`/api/calendar/todos/${event.id}/`, {
        title,
        description,
        status,
        pipeline: selectedPipeline?.id || null,
        followup_cancellation: cancellationReason || undefined,
        followup_failed: failedReason || undefined,
        completion_remarks: completionRemarks || undefined,
        assigned_to: assignedTo?.id || null,
        contact: selectedContact?.id || null,
        crm: selectedContact?.crm || contacts.find(c => c.id === selectedContact?.id)?.crm || event.crm || undefined,
        start: start ? new Date(start).toISOString() : null,
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
    <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      <div className={cn("relative w-full bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]", canEdit ? "max-w-lg" : "max-w-3xl")}>
        {canEdit ? (
          <>
            <div className="px-8 py-6 border-b border-zinc-800 bg-white/[0.02] flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-sm font-medium text-white uppercase tracking-wider">Update Follow Up</h2>
                <p className="text-[9px] text-white/40 uppercase tracking-widest font-medium">Edit follow-up details</p>
              </div>
              {isCreator && (
                <button type="button" onClick={() => setShowDeleteConfirm(true)}
                  className="p-1.5 rounded bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all">
                  <Trash2 size={14} />
                </button>
              )}
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
              <form onSubmit={handleSubmit} id="update-followup-form">
                <div className="px-8 py-6 space-y-5">
                  <div className="space-y-2">
                    <label className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/30">Follow-Up Title</label>
                    <input value={title} onChange={e => setTitle(e.target.value)} disabled={!canEdit}
                      className="w-full bg-white/5 border border-zinc-800 rounded-md h-11 px-4 text-sm text-white placeholder:text-white/20 focus:border-blue-500/40 outline-none transition-all disabled:opacity-40 disabled:cursor-not-allowed" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2 relative">
                      <label className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/30">Status</label>
                      {canEditStatus && !(status === 'failed' && !isCreator) ? (
                        <button ref={statusRef} type="button" onClick={openStatusDropdown}
                          className={cn("w-full bg-white/5 border border-zinc-800 rounded-md h-11 px-4 flex items-center justify-between text-sm transition-all hover:border-zinc-700 capitalize", getFollowUpStatusTextColor(status))}>
                          <span>{status.replace('_', ' ')}</span>
                          <ChevronDown size={14} className="text-white/20" />
                        </button>
                      ) : (
                        <div className={cn("w-full bg-white/5 border border-zinc-800 rounded-md h-11 px-4 flex items-center text-sm capitalize", getFollowUpStatusTextColor(status))}>{status.replace('_', ' ')}</div>
                      )}
                    </div>
                    <div className="space-y-2 relative">
                      <label className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/30">Pipeline</label>
                      {canEdit ? (
                        <button ref={pipelineRef} type="button" onClick={openPipelineDropdown}
                          className={cn("w-full bg-white/5 border border-zinc-800 rounded-md h-11 px-4 flex items-center justify-between text-sm transition-all hover:border-zinc-700", selectedPipeline ? "text-white" : "text-white/20")}>
                          <span>{selectedPipeline?.name || 'Select pipeline...'}</span>
                          <ChevronDown size={14} className="text-white/20" />
                        </button>
                      ) : (
                        <div className="w-full bg-white/5 border border-zinc-800 rounded-md h-11 px-4 flex items-center text-sm text-white/40">{selectedPipeline?.name || 'None'}</div>
                      )}
                    </div>
                  </div>
                  {status === 'cancelled' && (!isCreator || cancellationReason) && (
                    <div className="space-y-2">
                      <label className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/30">Cancellation Reason</label>
                      <div className="flex gap-2">
                        <textarea value={cancellationReason} onChange={e => setCancellationReason(e.target.value)} disabled={isCreator || !canEditStatus || cancelSaved}
                          placeholder="Why is this follow-up being cancelled?"
                          rows={2}
                          className="flex-1 bg-white/5 border border-zinc-800 rounded-md px-4 py-3 text-sm text-white placeholder:text-white/20 focus:border-blue-500/40 outline-none transition-all resize-none disabled:opacity-40" />
                        {!isCreator && (
                          <div className="flex flex-col gap-1.5 shrink-0">
                            {cancelSaved ? (
                              <button type="button" onClick={() => setCancelSaved(false)}
                                className="p-2 rounded bg-blue-500/20 border border-blue-500/30 text-blue-400 hover:bg-blue-500/30 transition-all">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                              </button>
                            ) : (
                              <>
                                <button type="button" onClick={handleCancelSubmit} disabled={!cancellationReason.trim() || cancelSubmitting}
                                  className={cn("p-2 rounded border transition-all", "bg-blue-500/20 border-blue-500/30 text-blue-400 hover:bg-blue-500/30 disabled:opacity-30 disabled:cursor-not-allowed")}>
                                  {cancelSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                                </button>
                                <button type="button" onClick={() => { setStatus('follow_up'); setCancellationReason(''); }}
                                  className="p-2 rounded bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all">
                                  <X size={16} />
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  {status === 'complete' && (!isCreator || completionRemarks) && (
                    <div className="space-y-2">
                      <label className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/30">Completion Remarks</label>
                      <div className="flex gap-2">
                        <textarea value={completionRemarks} onChange={e => setCompletionRemarks(e.target.value)} disabled={isCreator || !canEditStatus || compSaved}
                          placeholder="Describe what was accomplished..."
                          rows={2}
                          className="flex-1 bg-white/5 border border-zinc-800 rounded-md px-4 py-3 text-sm text-white placeholder:text-white/20 focus:border-blue-500/40 outline-none transition-all resize-none disabled:opacity-40" />
                        {!isCreator && (
                          <div className="flex flex-col gap-1.5 shrink-0">
                            {compSaved ? (
                              <button type="button" onClick={() => setCompSaved(false)}
                                className="p-2 rounded bg-blue-500/20 border border-blue-500/30 text-blue-400 hover:bg-blue-500/30 transition-all">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                              </button>
                            ) : (
                              <>
                                <button type="button" onClick={handleCompSubmit} disabled={!completionRemarks.trim() || compSubmitting}
                                  className={cn("p-2 rounded border transition-all", "bg-blue-500/20 border-blue-500/30 text-blue-400 hover:bg-blue-500/30 disabled:opacity-30 disabled:cursor-not-allowed")}>
                                  {compSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                                </button>
                                <button type="button" onClick={() => { setStatus('follow_up'); setCompletionRemarks(''); }}
                                  className="p-2 rounded bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all">
                                  <X size={16} />
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  {status === 'failed' && (!isCreator || failedReason) && (
                    <div className="space-y-2">
                      <label className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/30">Failed Reason</label>
                      <div className="flex gap-2">
                        <textarea value={failedReason} onChange={e => setFailedReason(e.target.value)} disabled={isCreator || !canEditStatus || failedSaved}
                          placeholder="Why did this follow-up fail?"
                          rows={2}
                          className="flex-1 bg-white/5 border border-zinc-800 rounded-md px-4 py-3 text-sm text-white placeholder:text-white/20 focus:border-blue-500/40 outline-none transition-all resize-none disabled:opacity-40" />
                        {!isCreator && (
                          <div className="flex flex-col gap-1.5 shrink-0">
                            {failedSaved ? (
                              <button type="button" onClick={() => setFailedSaved(false)}
                                className="p-2 rounded bg-blue-500/20 border border-blue-500/30 text-blue-400 hover:bg-blue-500/30 transition-all">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                              </button>
                            ) : (
                              <>
                                <button type="button" onClick={handleFailedSubmit} disabled={!failedReason.trim() || failedSubmitting}
                                  className={cn("p-2 rounded border transition-all", "bg-blue-500/20 border-blue-500/30 text-blue-400 hover:bg-blue-500/30 disabled:opacity-30 disabled:cursor-not-allowed")}>
                                  {failedSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                                </button>
                                <button type="button" onClick={() => { setStatus('follow_up'); setFailedReason(''); }}
                                  className="p-2 rounded bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all">
                                  <X size={16} />
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2 relative">
                      <label className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/30">Assign To</label>
                      {canEditAssignee ? (
                        <button ref={userRef} type="button" onClick={openUserDropdown} disabled={!selectedPipeline}
                          className={cn("w-full bg-white/5 border border-zinc-800 rounded-md h-11 px-4 flex items-center justify-between text-sm transition-all", selectedPipeline ? "text-white/60 hover:border-zinc-700 cursor-pointer" : "text-white/20 cursor-not-allowed opacity-40")}>
                          {assignedTo ? <span className="text-white">{assignedTo.first_name || assignedTo.id}</span> : <span className="text-white/20">Unassigned</span>}
                          <ChevronDown size={14} className="text-white/20" />
                        </button>
                      ) : (
                        <div className="w-full bg-white/5 border border-zinc-800 rounded-md h-11 px-4 flex items-center text-sm text-white/40">{assignedTo?.first_name || 'Unassigned'}</div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/30">Follow-Up Date</label>
                      <input type="datetime-local" value={start} onChange={e => setStart(e.target.value)} disabled={!canEdit}
                        className="w-full bg-white/5 border border-zinc-800 rounded-md h-11 px-4 text-sm text-white focus:border-blue-500/40 outline-none transition-all [color-scheme:dark] disabled:opacity-40 disabled:cursor-not-allowed" />
                    </div>
                  </div>
                  <div className="space-y-2 relative">
                    <label className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/30">Contact</label>
                    {canEdit ? (
                      <button ref={contactRef} type="button" onClick={openContactDropdown} disabled={!assignedTo || !selectedPipeline}
                        className={cn("w-full bg-white/5 border border-zinc-800 rounded-md h-11 px-4 flex items-center justify-between text-sm transition-all", assignedTo && selectedPipeline ? "text-white/60 hover:border-zinc-700 cursor-pointer" : "text-white/20 cursor-not-allowed opacity-40")}>
                        {selectedContact ? <span className="text-white">{selectedContact.name || selectedContact.id}</span> : <span className="text-white/20">Select contact...</span>}
                        <ChevronDown size={14} className="text-white/20" />
                      </button>
                    ) : (
                      <div className="w-full bg-white/5 border border-zinc-800 rounded-md h-11 px-4 flex items-center text-sm text-white/40">{selectedContact?.name || 'None'}</div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/30">Notes</label>
                    <textarea value={description} onChange={e => setDescription(e.target.value)} disabled={!canEdit} rows={3}
                      className="w-full bg-white/5 border border-zinc-800 rounded-md px-4 py-3 text-sm text-white placeholder:text-white/20 focus:border-blue-500/40 outline-none transition-all resize-none disabled:opacity-40 disabled:cursor-not-allowed" />
                  </div>
                  {error && <p className="text-[10px] text-red-500 font-medium uppercase tracking-wider">{error}</p>}
                </div>
              </form>
            </div>

            <div className="px-8 py-4 border-t border-zinc-800 bg-black/50 backdrop-blur-xl flex justify-end gap-3 shrink-0">
              <button type="button" onClick={onClose} disabled={isSubmitting}
                className="px-6 py-2 rounded-sm bg-zinc-900/50 border border-zinc-800 text-white/40 hover:text-white hover:bg-zinc-800 transition-all text-[10px] font-medium uppercase tracking-[0.2em]">
                Cancel
              </button>
              {canEditStatus && (
                <button type="submit" form="update-followup-form" disabled={isSubmitting || !title.trim() || !start || !selectedPipeline || !assignedTo || !selectedContact}
                  className="px-6 py-2 rounded-sm bg-blue-500/20 border border-blue-500/30 text-blue-400 hover:bg-blue-500/30 hover:border-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed text-[10px] font-medium uppercase tracking-[0.2em] transition-all flex items-center gap-2">
                  {isSubmitting ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : <><CalendarPlus size={14} />Save</>}
                </button>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col min-h-0">
            <div className="shrink-0">
              <div className={cn("h-2 w-full",
                status === 'failed' ? 'bg-red-500/20' :
                status === 'complete' ? 'bg-emerald-500/20' :
                status === 'cancelled' ? 'bg-white/5' :
                'bg-amber-500/20')} />
              <div className="px-8 py-4 border-b border-zinc-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[8px] text-white/30 uppercase tracking-[0.2em] font-medium mb-1">Follow Up</p>
                    <h2 className="text-lg font-bold text-white pr-4">{event.title}</h2>
                  </div>
                  {status && (
                    <span className={cn("shrink-0 px-2 py-0.5 rounded-full border text-[8px] font-bold uppercase tracking-wider",
                      FOLLOWUP_STATUS_STYLES[status] || FOLLOWUP_STATUS_STYLES.follow_up)}>
                      {status.replace('_', ' ')}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {!canEdit && !canEditStatus && (
              <div className="px-8 py-3 bg-red-500/10 border-b border-red-500/20">
                <p className="text-[10px] text-red-400 font-medium uppercase tracking-wider">Read-only — only the creator can edit this follow-up.</p>
              </div>
            )}
            {canEditStatus && !canEdit && (
              <div className="px-8 py-3 bg-blue-500/10 border-b border-blue-500/20">
                <p className="text-[10px] text-blue-400 font-medium uppercase tracking-wider">You can update the status of this follow-up.</p>
              </div>
            )}

            <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0">
              <div className="px-8 py-5">
                <form id="update-followup-poster-form" onSubmit={handleSubmit}>
                  <div className="grid grid-cols-2 gap-5">
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <label className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/30">Notes</label>
                        <div className="rounded-md border border-zinc-800/60 bg-gradient-to-br from-white/[0.03] to-transparent overflow-hidden">
                          <div className="px-5 py-4 h-[140px] overflow-y-auto custom-scrollbar">
                            {description ? (
                              <p className="text-sm text-white/70 leading-relaxed whitespace-pre-wrap">{description}</p>
                            ) : (
                              <p className="text-sm text-white/30 italic">No description</p>
                            )}
                          </div>
                        </div>
                      </div>

                      {(selectedContact || selectedPipeline) && (
                        <div className="rounded-md border border-zinc-800/60 bg-gradient-to-br from-white/[0.03] to-transparent overflow-hidden">
                          <div className="px-4 py-3 flex items-center gap-3 border-b border-zinc-800/40">
                            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                              <Contact size={13} className="text-emerald-400" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-white truncate">{selectedContact?.name || 'No contact'}</p>
                              {selectedPipeline && (
                                <p className="text-[10px] text-white/40 truncate mt-0.5">{selectedPipeline.name}</p>
                              )}
                            </div>
                          </div>
                          {(selectedContact?.phone || selectedContact?.email) && (
                            <div className="px-4 py-2.5 space-y-2">
                              {selectedContact?.phone && (
                                <div className="flex items-center gap-2.5">
                                  <div className="w-6 h-6 rounded-md bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                                    <Phone size={11} className="text-blue-400" />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-[8px] text-white/25 uppercase tracking-[0.15em] font-medium">Phone</p>
                                    <p className="text-[11px] text-white/70 truncate">{selectedContact.phone}</p>
                                  </div>
                                </div>
                              )}
                              {selectedContact?.email && (
                                <div className="flex items-center gap-2.5">
                                  <div className="w-6 h-6 rounded-md bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                                    <Mail size={11} className="text-amber-400" />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-[8px] text-white/25 uppercase tracking-[0.15em] font-medium">Email</p>
                                    <p className="text-[11px] text-white/70 truncate">{selectedContact.email}</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      {start && (
                        <div className="space-y-2">
                          <label className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/30">Follow-Up Date</label>
                          <div className="w-full bg-white/5 border border-zinc-800 rounded-md h-11 px-4 flex items-center gap-2.5">
                            <div className="w-6 h-6 rounded-md bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                              <Calendar size={11} className="text-blue-400" />
                            </div>
                            <span className="text-sm text-white truncate">{format(parseISO(event.start), 'MMM d, yyyy h:mm a')}</span>
                          </div>
                        </div>
                      )}

                      <div className="space-y-2">
                        <label className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/30">Assigned To</label>
                        <div className="w-full bg-white/5 border border-zinc-800 rounded-md h-11 px-4 flex items-center gap-2.5">
                          <div className="w-6 h-6 rounded-md bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
                            <User size={11} className="text-purple-400" />
                          </div>
                          <span className={cn("text-sm truncate", assignedTo?.first_name ? "text-white" : "text-white/40")}>{assignedTo?.first_name || 'Unassigned'}</span>
                        </div>
                      </div>

                      {canEditStatus && (
                        <div className="space-y-2 relative">
                          <label className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/30">Status</label>
                          <button ref={statusRef} type="button" onClick={openStatusDropdown}
                            className={cn("w-full bg-white/5 border border-zinc-800 rounded-md h-11 px-4 flex items-center justify-between text-sm transition-all hover:border-zinc-700 capitalize", getFollowUpStatusTextColor(status))}>
                            <span>{status.replace('_', ' ')}</span>
                            <ChevronDown size={14} className="text-white/20" />
                          </button>
                        </div>
                      )}

                      {canEditStatus && (status === 'cancelled' || status === 'complete' || status === 'failed') && (
                        <div className="space-y-3 pt-1 border-t border-zinc-800/40">

                          {status === 'cancelled' && (
                            <div className="space-y-2">
                              <label className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/30">Cancellation Reason</label>
                              <div className="flex gap-2">
                                <textarea value={cancellationReason} onChange={e => setCancellationReason(e.target.value)} disabled={cancelSaved}
                                  placeholder="Why is this follow-up being cancelled?"
                                  rows={2}
                                  className="flex-1 bg-white/5 border border-zinc-800 rounded-md px-4 py-3 text-sm text-white placeholder:text-white/20 focus:border-blue-500/40 outline-none transition-all resize-none disabled:opacity-40" />
                                <div className="flex flex-col gap-1.5 shrink-0">
                                  {cancelSaved ? (
                                    <button type="button" onClick={() => setCancelSaved(false)}
                                      className="p-2 rounded bg-blue-500/20 border border-blue-500/30 text-blue-400 hover:bg-blue-500/30 transition-all">
                                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                                    </button>
                                  ) : (
                                    <>
                                      <button type="button" onClick={handleCancelSubmit} disabled={!cancellationReason.trim() || cancelSubmitting}
                                        className={cn("p-2 rounded border transition-all", "bg-blue-500/20 border-blue-500/30 text-blue-400 hover:bg-blue-500/30 disabled:opacity-30 disabled:cursor-not-allowed")}>
                                        {cancelSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                                      </button>
                                      <button type="button" onClick={() => { setStatus('follow_up'); setCancellationReason(''); }}
                                        className="p-2 rounded bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all">
                                        <X size={16} />
                                      </button>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}

                          {status === 'complete' && (
                            <div className="space-y-2">
                              <label className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/30">Completion Remarks</label>
                              <div className="flex gap-2">
                                <textarea value={completionRemarks} onChange={e => setCompletionRemarks(e.target.value)} disabled={compSaved}
                                  placeholder="Describe what was accomplished..."
                                  rows={2}
                                  className="flex-1 bg-white/5 border border-zinc-800 rounded-md px-4 py-3 text-sm text-white placeholder:text-white/20 focus:border-blue-500/40 outline-none transition-all resize-none disabled:opacity-40" />
                                <div className="flex flex-col gap-1.5 shrink-0">
                                  {compSaved ? (
                                    <button type="button" onClick={() => setCompSaved(false)}
                                      className="p-2 rounded bg-blue-500/20 border border-blue-500/30 text-blue-400 hover:bg-blue-500/30 transition-all">
                                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                                    </button>
                                  ) : (
                                    <>
                                      <button type="button" onClick={handleCompSubmit} disabled={!completionRemarks.trim() || compSubmitting}
                                        className={cn("p-2 rounded border transition-all", "bg-blue-500/20 border-blue-500/30 text-blue-400 hover:bg-blue-500/30 disabled:opacity-30 disabled:cursor-not-allowed")}>
                                        {compSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                                      </button>
                                      <button type="button" onClick={() => { setStatus('follow_up'); setCompletionRemarks(''); }}
                                        className="p-2 rounded bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all">
                                        <X size={16} />
                                      </button>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}

                          {status === 'failed' && (
                            <div className="space-y-2">
                              <label className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/30">Failed Reason</label>
                              <div className="flex gap-2">
                                <textarea value={failedReason} onChange={e => setFailedReason(e.target.value)} disabled={failedSaved}
                                  placeholder="Why did this follow-up fail?"
                                  rows={2}
                                  className="flex-1 bg-white/5 border border-zinc-800 rounded-md px-4 py-3 text-sm text-white placeholder:text-white/20 focus:border-blue-500/40 outline-none transition-all resize-none disabled:opacity-40" />
                                <div className="flex flex-col gap-1.5 shrink-0">
                                  {failedSaved ? (
                                    <button type="button" onClick={() => setFailedSaved(false)}
                                      className="p-2 rounded bg-blue-500/20 border border-blue-500/30 text-blue-400 hover:bg-blue-500/30 transition-all">
                                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                                    </button>
                                  ) : (
                                    <>
                                      <button type="button" onClick={handleFailedSubmit} disabled={!failedReason.trim() || failedSubmitting}
                                        className={cn("p-2 rounded border transition-all", "bg-blue-500/20 border-blue-500/30 text-blue-400 hover:bg-blue-500/30 disabled:opacity-30 disabled:cursor-not-allowed")}>
                                        {failedSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                                      </button>
                                      <button type="button" onClick={() => { setStatus('follow_up'); setFailedReason(''); }}
                                        className="p-2 rounded bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all">
                                        <X size={16} />
                                      </button>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                {error && <p className="text-[10px] text-red-500 font-medium uppercase tracking-wider">{error}</p>}
                </form>
              </div>
            </div>

          <div className="px-8 py-4 border-t border-zinc-800 bg-black/50 backdrop-blur-xl flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              {event?.user_name && (
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
                Close
              </button>
              {canEditStatus && (
                <button type="submit" form="update-followup-poster-form" disabled={isSubmitting || (status === 'cancelled' && !cancellationReason.trim()) || (status === 'complete' && !completionRemarks.trim()) || (status === 'failed' && !failedReason.trim())}
                  className="px-6 py-2 rounded-sm bg-blue-500/20 border border-blue-500/30 text-blue-400 hover:bg-blue-500/30 hover:border-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed text-[10px] font-medium uppercase tracking-[0.2em] transition-all flex items-center gap-2">
                  {isSubmitting ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : <><CalendarPlus size={14} />Save</>}
                </button>
              )}
            </div>
          </div>
            </div>
        )}

        {showStatusDropdown && dropdownPos.status && canEditStatus && !(status === 'failed' && !isCreator) && (
          <>
            <div className="fixed inset-0 z-[9998]" onClick={() => { setShowStatusDropdown(false); setDropdownPos(prev => ({ ...prev, status: null })); }} />
            <div style={{ position: 'fixed', top: dropdownPos.status.top, left: dropdownPos.status.left, width: dropdownPos.status.width, zIndex: 9999 }}
              className="bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl overflow-hidden">
              {['follow_up', 'complete', 'cancelled'].map(s => (
                <button key={s} type="button" onClick={() => { setStatus(s); setShowStatusDropdown(false); setDropdownPos(prev => ({ ...prev, status: null })); }}
                  className={cn("w-full px-4 py-2.5 flex items-center justify-between hover:bg-white/[0.03] transition-all text-left capitalize", status === s && "bg-blue-500/5")}>
                  <span className={cn("text-xs font-medium capitalize", getFollowUpStatusTextColor(s))}>{s.replace('_', ' ')}</span>
                  {status === s && <Check size={12} className="text-blue-400 shrink-0" />}
                </button>
              ))}
            </div>
          </>
        )}

        {showUserDropdown && dropdownPos.user && canEditAssignee && (
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
                  filteredUsers.map(u => (
                    <button key={u.id} type="button" onClick={() => { setAssignedTo(u); setShowUserDropdown(false); setDropdownPos(prev => ({ ...prev, user: null })); setUserSearch(''); }}
                      className={cn("w-full px-4 py-2.5 flex items-center justify-between hover:bg-white/[0.03] transition-all text-left", assignedTo?.id === u.id && "bg-blue-500/5")}>
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-[9px] font-bold text-blue-400 uppercase">
                          {(u.first_name?.[0] || u.email?.[0] || '?')}
                        </div>
                        <div>
                          <p className="text-xs font-medium text-white">{u.first_name || u.email}</p>
                          {u.email && u.first_name && <p className="text-[9px] text-white/20">{u.email}</p>}
                        </div>
                      </div>
                      {assignedTo?.id === u.id && <Check size={12} className="text-blue-400 shrink-0" />}
                    </button>
                  ))
                )}
              </div>
            </div>
          </>
        )}

        {showPipelineDropdown && dropdownPos.pipeline && canEdit && (
          <>
            <div className="fixed inset-0 z-[9998]" onClick={() => { setShowPipelineDropdown(false); setDropdownPos(prev => ({ ...prev, pipeline: null })); }} />
            <div style={{ position: 'fixed', top: dropdownPos.pipeline.top, left: dropdownPos.pipeline.left, width: dropdownPos.pipeline.width, zIndex: 9999 }}
              className="bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl overflow-hidden">
              <div className="max-h-48 overflow-y-auto custom-scrollbar">
                {pipelinesLoading ? (
                  <div className="flex items-center justify-center py-6"><Loader2 size={16} className="animate-spin text-blue-500/50" /></div>
                ) : pipelines.length === 0 ? (
                  <p className="text-[10px] text-white/20 text-center py-6 uppercase tracking-widest">No pipelines found</p>
                ) : (
                  pipelines.map(p => (
                    <button key={p.id} type="button" onClick={() => { setSelectedPipeline(p); setAssignedTo(null); setSelectedContact(null); setShowPipelineDropdown(false); setDropdownPos(prev => ({ ...prev, pipeline: null })); }}
                      className={cn("w-full px-4 py-2.5 flex items-center justify-between hover:bg-white/[0.03] transition-all text-left", selectedPipeline?.id === p.id && "bg-blue-500/5")}>
                      <span className="text-xs font-medium text-white">{p.name}</span>
                      {selectedPipeline?.id === p.id && <Check size={12} className="text-blue-400 shrink-0" />}
                    </button>
                  ))
                )}
              </div>
            </div>
          </>
        )}

        {showContactDropdown && dropdownPos.contact && canEdit && (
          <>
            <div className="fixed inset-0 z-[9998]" onClick={() => { setShowContactDropdown(false); setDropdownPos(prev => ({ ...prev, contact: null })); }} />
            <div style={{ position: 'fixed', top: dropdownPos.contact.top, left: dropdownPos.contact.left, width: dropdownPos.contact.width, zIndex: 9999 }}
              className="bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl overflow-hidden">
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
                  <div className="flex items-center justify-center py-6"><Loader2 size={16} className="animate-spin text-blue-500/50" /></div>
                ) : contacts.length === 0 ? (
                  <p className="text-[10px] text-white/20 text-center py-6 uppercase tracking-widest">No contacts found</p>
                ) : (
                  contacts.map(c => (
                    <button key={c.id} type="button" onClick={() => { setSelectedContact(c); setShowContactDropdown(false); setDropdownPos(prev => ({ ...prev, contact: null })); setContactSearch(''); }}
                      className={cn("w-full px-4 py-2.5 flex items-center justify-between hover:bg-white/[0.03] transition-all text-left", selectedContact?.id === c.id && "bg-blue-500/5")}>
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-[9px] font-bold text-blue-400 uppercase">
                          {(c.name?.[0] || c.email?.[0] || '?')}
                        </div>
                        <div>
                          <p className="text-xs font-medium text-white">{c.name || c.email}</p>
                          {c.email && c.name && <p className="text-[9px] text-white/20">{c.email}</p>}
                        </div>
                      </div>
                      {selectedContact?.id === c.id && <Check size={12} className="text-blue-400 shrink-0" />}
                    </button>
                  ))
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
              setError('Failed to delete follow-up.');
            } finally {
              setIsDeleting(false);
            }
          }}
          isDeleting={isDeleting}
          title="Delete Follow Up"
          description="This will permanently remove this follow-up."
        />
      </div>
    </div>,
    document.body
  );
};

export default UpdateFollowUpModal;
