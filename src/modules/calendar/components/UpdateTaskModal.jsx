import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Loader2, Check, ChevronDown, Search, CalendarPlus, Trash2, Clock, User } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import ConfirmDeleteDialog from '@/components/ConfirmDeleteDialog';

import axios from 'axios';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { TASK_STATUS_OPTIONS, TASK_STATUS_STYLES, getTaskStatusTextColor } from '../constants';

const UpdateTaskModal = ({ task, isOpen, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [priority, setPriority] = useState('');
  const [status, setStatus] = useState('');
  const [assignedTo, setAssignedTo] = useState(null);
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [holdSubmitting, setHoldSubmitting] = useState(false);
  const [holdSaved, setHoldSaved] = useState(false);
  const [holdReason, setHoldReason] = useState('');
  const [extensionRequest, setExtensionRequest] = useState('');
  const [extSubmitting, setExtSubmitting] = useState(false);
  const [extSaved, setExtSaved] = useState(false);
  const [completionRemarks, setCompletionRemarks] = useState('');
  const [compSubmitting, setCompSubmitting] = useState(false);
  const [compSaved, setCompSaved] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');
  const [dropdownPos, setDropdownPos] = useState({ priority: null, status: null, user: null });
  const priorityRef = useRef(null);
  const statusRef = useRef(null);
  const userRef = useRef(null);

  const isAdmin = user?.role === 'Superadmin' || user?.role === 'Admin';
  const isCreator = task?.user === user?.id;
  const isAssignee = task?.assigned_to === user?.id;
  const isOverdue = task?.status === 'overdue';
  const canEdit = isCreator;
  const canEditAssignee = isAdmin && isCreator;
  const canEditDeadline = isCreator;
  const canEditStatus = isCreator || isAssignee;
  const canSave = isCreator || isAssignee;

  useEffect(() => {
    if (isOpen && task) {
      setTitle(task.title || '');
      setDescription(task.description || '');
      setDeadline(task.start ? task.start.slice(0, 16) : '');
      setPriority(task.priority || 'medium');
      setStatus(task.status || 'assigned');
      if (!isAdmin && isCreator) {
        setAssignedTo({ id: user.id, first_name: user.first_name || user.email });
      } else {
        setAssignedTo(task.assigned_to ? { id: task.assigned_to, first_name: task.assigned_to_name } : null);
      }
      setHoldReason(task.hold_reason || '');
      setHoldSaved(!!task.hold_reason);
      setExtensionRequest(task.extension_request || '');
      setExtSaved(!!task.extension_request);
      setCompletionRemarks(task.completion_remarks || '');
      setCompSaved(!!task.completion_remarks);

      setUsersLoading(true);
      axios.get('/api/auth/users/assignable/')
        .then(res => setUsers(res.data || []))
        .catch(() => setUsers([]))
        .finally(() => setUsersLoading(false));
    }
  }, [isOpen, task]);

  const openPriorityDropdown = () => {
    if (priorityRef.current) {
      const rect = priorityRef.current.getBoundingClientRect();
      setDropdownPos({ priority: { top: rect.bottom + 4, left: rect.left, width: rect.width }, status: null, user: null });
      setShowStatusDropdown(false);
      setShowUserDropdown(false);
      setShowPriorityDropdown(true);
    }
  };

  const openStatusDropdown = () => {
    if (statusRef.current) {
      const rect = statusRef.current.getBoundingClientRect();
      setDropdownPos({ status: { top: rect.bottom + 4, left: rect.left, width: rect.width }, priority: null, user: null });
      setShowPriorityDropdown(false);
      setShowUserDropdown(false);
      setShowStatusDropdown(true);
    }
  };

  const openUserDropdown = () => {
    if (userRef.current) {
      const rect = userRef.current.getBoundingClientRect();
      setDropdownPos({ user: { top: rect.bottom + 4, left: rect.left, width: rect.width }, priority: null, status: null });
      setShowPriorityDropdown(false);
      setShowStatusDropdown(false);
      setShowUserDropdown(true);
    }
  };

  const filteredUsers = users.filter(u =>
    !userSearch || u.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.first_name?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.last_name?.toLowerCase().includes(userSearch.toLowerCase())
  );

  const handleHoldSubmit = async () => {
    if (!holdReason.trim()) return;
    setHoldSubmitting(true);
    setError('');
    try {
      await axios.patch(`/api/calendar/todos/${task.id}/`, { status: 'on_hold', hold_reason: holdReason });
      setHoldSaved(true);
    } catch (err) {
      const data = err.response?.data;
      setError(data?.detail || 'Failed to update.');
    } finally {
      setHoldSubmitting(false);
    }
  };

  const handleCompSubmit = async () => {
    if (!completionRemarks.trim()) return;
    setCompSubmitting(true);
    setError('');
    try {
      await axios.patch(`/api/calendar/todos/${task.id}/`, { status: 'completed', completion_remarks: completionRemarks });
      setCompSaved(true);
    } catch (err) {
      const data = err.response?.data;
      setError(data?.detail || 'Failed to update.');
    } finally {
      setCompSubmitting(false);
    }
  };

  const handleExtSubmit = async () => {
    if (!extensionRequest.trim()) return;
    setExtSubmitting(true);
    setError('');
    try {
      await axios.patch(`/api/calendar/todos/${task.id}/`, { extension_request: extensionRequest });
      setExtSaved(true);
    } catch (err) {
      const data = err.response?.data;
      setError(data?.detail || 'Failed to update.');
    } finally {
      setExtSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canEdit && !canSave) return;
    setIsSubmitting(true);
    setError('');

    if (status === 'on_hold' && !isCreator && !holdReason.trim()) {
      setError('Hold reason is required.');
      setIsSubmitting(false);
      return;
    }

    const base = { status, hold_reason: holdReason || undefined, extension_request: extensionRequest || undefined, completion_remarks: completionRemarks || undefined };
    if (canEdit) {
      Object.assign(base, { title, description, priority, assigned_to: assignedTo?.id || null, start: deadline ? new Date(deadline).toISOString() : null });
    } else if (canEditDeadline) {
      Object.assign(base, { start: deadline ? new Date(deadline).toISOString() : null });
    }

    try {
      await axios.patch(`/api/calendar/todos/${task.id}/`, base);
      onSuccess?.();
      onClose();
    } catch (err) {
      const data = err.response?.data;
      let msg = 'Failed to update. Please check all fields.';
      if (data) {
        if (typeof data === 'string') msg = data;
        else if (data.detail) msg = data.detail;
        else {
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

  if (!isOpen || !task) return null;

  return createPortal(
    <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {canEdit && (
          <div className="px-8 py-6 border-b border-zinc-800 bg-white/[0.02] flex items-center justify-between shrink-0">
            <div>
              <h2 className="text-sm font-medium text-white uppercase tracking-wider">Update Task</h2>
              <p className="text-[9px] text-white/40 uppercase tracking-widest font-medium">Edit task details</p>
            </div>
            {isCreator && (
              <button type="button" onClick={() => setShowDeleteConfirm(true)}
                className="p-1.5 rounded bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all">
                <Trash2 size={14} />
              </button>
            )}
          </div>
        )}

        {canEdit ? (
          <>
            <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
              <form onSubmit={handleSubmit} id="update-task-form">
                <div className="px-8 py-6 space-y-5">
                  <div className="space-y-2">
                    <label className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/30">Task Name</label>
                    <input value={title} onChange={e => setTitle(e.target.value)}
                      className="w-full bg-white/5 border border-zinc-800 rounded-md h-11 px-4 text-sm text-white placeholder:text-white/20 focus:border-blue-500/40 outline-none transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/30">Description</label>
                    <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3}
                      className="w-full bg-white/5 border border-zinc-800 rounded-md px-4 py-3 text-sm text-white placeholder:text-white/20 focus:border-blue-500/40 outline-none transition-all resize-none" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2 relative">
                      <label className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/30">Priority</label>
                      <button ref={priorityRef} type="button" onClick={openPriorityDropdown}
                        className={cn("w-full bg-white/5 border border-zinc-800 rounded-md h-11 px-4 flex items-center justify-between text-sm transition-all hover:border-zinc-700", priority === 'high' ? 'text-red-400' : priority === 'medium' ? 'text-yellow-400' : 'text-blue-400')}>
                        <span className="capitalize">{priority}</span>
                        <ChevronDown size={14} className="text-white/20" />
                      </button>
                    </div>
                    <div className="space-y-2 relative">
                      <label className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/30">Status</label>
                      <button ref={statusRef} type="button" onClick={openStatusDropdown}
                        className={cn("w-full bg-white/5 border border-zinc-800 rounded-md h-11 px-4 flex items-center justify-between text-sm transition-all hover:border-zinc-700 capitalize", getTaskStatusTextColor(status))}>
                        <span>{status || 'assigned'}</span>
                        <ChevronDown size={14} className="text-white/20" />
                      </button>
                    </div>
                  </div>
                  {status === 'on_hold' && (!isCreator || holdReason) && (
                    <div className="space-y-2">
                      <label className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/30">Hold Reason</label>
                      <div className="flex gap-2">
                        <textarea value={holdReason} onChange={e => setHoldReason(e.target.value)} disabled={isCreator || !canEditStatus || holdSaved}
                          placeholder="Why is this task on hold?"
                          rows={2}
                          className="flex-1 bg-white/5 border border-zinc-800 rounded-md px-4 py-3 text-sm text-white placeholder:text-white/20 focus:border-blue-500/40 outline-none transition-all resize-none disabled:opacity-40" />
                        {!isCreator && canEditStatus && (
                          <div className="flex flex-col gap-1.5 shrink-0">
                            {holdSaved ? (
                              <button type="button" onClick={() => setHoldSaved(false)}
                                className="p-2 rounded bg-blue-500/20 border border-blue-500/30 text-blue-400 hover:bg-blue-500/30 transition-all">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                              </button>
                            ) : (
                              <>
                                <button type="button" onClick={handleHoldSubmit} disabled={!holdReason.trim() || holdSubmitting}
                                  className={cn("p-2 rounded border transition-all", "bg-blue-500/20 border border-blue-500/30 text-blue-400 hover:bg-blue-500/30 disabled:opacity-30 disabled:cursor-not-allowed")}>
                                  {holdSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                                </button>
                                <button type="button" onClick={() => { setStatus('assigned'); setHoldReason(''); }}
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
                  {status === 'completed' && (!isCreator || completionRemarks) && (
                    <div className="space-y-2">
                      <label className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/30">Completion Remarks</label>
                      <div className="flex gap-2">
                        <textarea value={completionRemarks} onChange={e => setCompletionRemarks(e.target.value)} disabled={isCreator || !canEditStatus || compSaved}
                          placeholder="Describe what was accomplished..."
                          rows={2}
                          className="flex-1 bg-white/5 border border-zinc-800 rounded-md px-4 py-3 text-sm text-white placeholder:text-white/20 focus:border-blue-500/40 outline-none transition-all resize-none disabled:opacity-40" />
                        {!isCreator && canEditStatus && (
                          <div className="flex flex-col gap-1.5 shrink-0">
                            {compSaved ? (
                              <button type="button" onClick={() => setCompSaved(false)}
                                className="p-2 rounded bg-blue-500/20 border border-blue-500/30 text-blue-400 hover:bg-blue-500/30 transition-all">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                              </button>
                            ) : (
                              <>
                                <button type="button" onClick={handleCompSubmit} disabled={!completionRemarks.trim() || compSubmitting}
                                  className={cn("p-2 rounded border transition-all", "bg-blue-500/20 border border-blue-500/30 text-blue-400 hover:bg-blue-500/30 disabled:opacity-30 disabled:cursor-not-allowed")}>
                                  {compSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                                </button>
                                <button type="button" onClick={() => { setStatus('assigned'); setCompletionRemarks(''); }}
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
                    <div className="space-y-2">
                      <label className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/30">Deadline</label>
                      <input type="datetime-local" value={deadline} onChange={e => setDeadline(e.target.value)} disabled={!canEditDeadline}
                        className="w-full bg-white/5 border border-zinc-800 rounded-md h-11 px-4 text-sm text-white focus:border-blue-500/40 outline-none transition-all [color-scheme:dark] disabled:opacity-40 disabled:cursor-not-allowed" />
                    </div>
                    <div className="space-y-2 relative">
                      <label className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/30">Assign To</label>
                      {canEditAssignee ? (
                        <button ref={userRef} type="button" onClick={openUserDropdown}
                          className="w-full bg-white/5 border border-zinc-800 rounded-md h-11 px-4 flex items-center justify-between text-sm text-white/60 hover:border-zinc-700 transition-all">
                          {assignedTo ? <span className="text-white">{assignedTo.first_name || assignedTo.id}</span> : <span className="text-white/20">Unassigned</span>}
                          <ChevronDown size={14} className="text-white/20" />
                        </button>
                      ) : (
                        <div className="w-full bg-white/5 border border-zinc-800 rounded-md h-11 px-4 flex items-center text-sm text-white/40">{assignedTo?.first_name || 'Unassigned'}</div>
                      )}
                    </div>
                  </div>

                  {status === 'overdue' && (isCreator ? extensionRequest : true) && (
                    <div className="space-y-2">
                      <label className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/30">Request Extension</label>
                      {!isCreator && canEditStatus && !extSaved ? (
                        <div className="flex gap-2">
                          <textarea value={extensionRequest} onChange={e => setExtensionRequest(e.target.value)}
                            placeholder="Why do you need more time?"
                            rows={2}
                            className="flex-1 bg-white/5 border border-zinc-800 rounded-md px-4 py-3 text-sm text-white placeholder:text-white/20 focus:border-blue-500/40 outline-none transition-all resize-none" />
                          <div className="flex flex-col gap-1.5 shrink-0">
                            <button type="button" onClick={handleExtSubmit} disabled={!extensionRequest.trim() || extSubmitting}
                              className="p-2 rounded bg-blue-500/20 border border-blue-500/30 text-blue-400 hover:bg-blue-500/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                              {extSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                            </button>
                            <button type="button" onClick={() => setExtensionRequest('')}
                              className="p-2 rounded bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all">
                              <X size={16} />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <textarea value={extensionRequest} disabled rows={2}
                            className="flex-1 bg-white/5 border border-zinc-800 rounded-md px-4 py-3 text-sm text-white/60 resize-none disabled:opacity-40" />
                          {!isCreator && canEditStatus && extSaved && (
                            <button type="button" onClick={() => setExtSaved(false)}
                              className="shrink-0 mt-0.5 p-2 rounded bg-blue-500/20 border border-blue-500/30 text-blue-400 hover:bg-blue-500/30 transition-all self-start">
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                  {error && <p className="text-[10px] text-red-500 font-medium uppercase tracking-wider">{error}</p>}
                </div>
              </form>
            </div>

            <div className="px-8 py-4 border-t border-zinc-800 bg-black/50 backdrop-blur-xl flex justify-end gap-3 shrink-0">
              <button type="button" onClick={onClose} disabled={isSubmitting}
                className="px-6 py-2 rounded-sm bg-zinc-900/50 border border-zinc-800 text-white/40 hover:text-white hover:bg-zinc-800 transition-all text-[10px] font-medium uppercase tracking-[0.2em]">
                Cancel
              </button>
              {canSave && (
                <button type="submit" form="update-task-form" disabled={isSubmitting || (!canEdit && !status) || (canEdit && !title.trim()) || (status === 'on_hold' && !isCreator && !holdReason.trim()) || (status === 'completed' && !completionRemarks.trim())}
                  className="px-6 py-2 rounded-sm bg-blue-500/20 border border-blue-500/30 text-blue-400 hover:bg-blue-500/30 hover:border-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed text-[10px] font-medium uppercase tracking-[0.2em] transition-all flex items-center gap-2">
                  {isSubmitting ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : <><CalendarPlus size={14} />Save</>}
                </button>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="flex-1 flex flex-col min-h-0">
              <div className="shrink-0">
                <div className="px-8 py-4 border-b border-zinc-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[8px] text-white/30 uppercase tracking-[0.2em] font-medium mb-1">Update Task</p>
                      <h2 className="text-lg font-bold text-white pr-4">{task.title}</h2>
                    </div>
                    {status && (
                      <span className={cn("shrink-0 px-2 py-0.5 rounded-full border text-[8px] font-bold uppercase tracking-wider", TASK_STATUS_STYLES[status] || 'text-white/40 bg-white/5 border-white/10')}>
                        {TASK_STATUS_OPTIONS.find(o => o.value === status)?.label || status}
                      </span>
                    )}
                  </div>
                </div>

                {!canEdit && !canEditStatus && (
                  <div className="px-8 py-3 bg-red-500/10 border-b border-red-500/20">
                    <p className="text-[10px] text-red-400 font-medium uppercase tracking-wider">{isOverdue ? 'This task is overdue' : 'Read-only — only the creator can edit this task.'}</p>
                  </div>
                )}
                {canEditStatus && !canEdit && (
                  <div className="px-8 py-3 bg-blue-500/10 border-b border-blue-500/20">
                    <p className="text-[10px] text-blue-400 font-medium uppercase tracking-wider">You can update the status of this task.</p>
                  </div>
                )}
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0">
              <div className="px-8 pt-4" style={{ minHeight: '150px' }}>
                <div className="space-y-2">
                  <p className="text-[9px] text-white/30 uppercase tracking-[0.2em] font-medium">Description</p>
                  {description ? (
                    <p className="text-sm text-white/70 leading-relaxed whitespace-pre-wrap">{description}</p>
                  ) : (
                    <p className="text-sm text-white/30 italic">No description</p>
                  )}
                </div>
              </div>

              <form id="update-task-poster-form" onSubmit={handleSubmit}>
              <div className="px-8 pt-3 pb-2">
                <div className="grid grid-cols-2 gap-3">
                  {deadline && (
                    <div className="space-y-2 relative">
                      <label className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/30">Deadline</label>
                      <div className="w-full bg-white/5 border border-zinc-800 rounded-md h-11 px-4 flex items-center justify-between text-sm">
                        <span className="text-white">{format(parseISO(deadline), 'MMM d, yyyy h:mm a')}</span>
                        <Clock size={14} className="text-white/20" />
                      </div>
                    </div>
                  )}
                  {canEditStatus && (
                    <div className="space-y-2 relative">
                      <label className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/30">Status</label>
                      <button ref={statusRef} type="button" onClick={openStatusDropdown}
                        className={cn("w-full bg-white/5 border border-zinc-800 rounded-md h-11 px-4 flex items-center justify-between text-sm transition-all hover:border-zinc-700 capitalize", getTaskStatusTextColor(status))}>
                        <span>{status || 'assigned'}</span>
                        <ChevronDown size={14} className="text-white/20" />
                      </button>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3 mt-3">
                  {assignedTo?.first_name ? (
                    <div className="flex items-center gap-2.5 p-3 rounded-lg bg-white/[0.03] border border-zinc-800/50">
                      <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
                        <User size={14} className="text-purple-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[8px] text-white/30 uppercase tracking-[0.2em] font-medium">Assigned To</p>
                        <p className="text-xs text-white font-medium truncate">{assignedTo.first_name}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2.5 p-3 rounded-lg bg-white/[0.03] border border-zinc-800/50">
                      <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
                        <User size={14} className="text-purple-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[8px] text-white/30 uppercase tracking-[0.2em] font-medium">Assigned To</p>
                        <p className="text-xs text-white/40 font-medium truncate">Unassigned</p>
                      </div>
                    </div>
                  )}
                  {priority && (
                    <div className="flex items-center gap-2.5 p-3 rounded-lg bg-white/[0.03] border border-zinc-800/50">
                      <div className={cn("w-8 h-8 rounded-lg border flex items-center justify-center shrink-0",
                        priority === 'high' ? 'bg-red-500/10 border-red-500/20' :
                        priority === 'medium' ? 'bg-yellow-500/10 border-yellow-500/20' :
                        'bg-blue-500/10 border-blue-500/20')}>
                        <Clock size={14} className={cn(
                          priority === 'high' ? 'text-red-400' :
                          priority === 'medium' ? 'text-yellow-400' :
                          'text-blue-400')} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[8px] text-white/30 uppercase tracking-[0.2em] font-medium">Priority</p>
                        <p className={cn("text-xs font-medium truncate capitalize",
                          priority === 'high' ? 'text-red-400' :
                          priority === 'medium' ? 'text-yellow-400' :
                          'text-blue-400')}>{priority}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {canEditStatus && (status === 'on_hold' || status === 'completed' || status === 'overdue') && (
                <div className="px-8 pb-6 space-y-4">

                    {status === 'on_hold' && (
                      <div className="space-y-2">
                        <label className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/30">Hold Reason</label>
                        <div className="flex gap-2">
                          <textarea value={holdReason} onChange={e => setHoldReason(e.target.value)} disabled={holdSaved}
                            placeholder="Why is this task on hold?"
                            rows={2}
                            className="flex-1 bg-white/5 border border-zinc-800 rounded-md px-4 py-3 text-sm text-white placeholder:text-white/20 focus:border-blue-500/40 outline-none transition-all resize-none disabled:opacity-40" />
                          <div className="flex flex-col gap-1.5 shrink-0">
                            {holdSaved ? (
                              <button type="button" onClick={() => setHoldSaved(false)}
                                className="p-2 rounded bg-blue-500/20 border border-blue-500/30 text-blue-400 hover:bg-blue-500/30 transition-all">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                              </button>
                            ) : (
                              <>
                                <button type="button" onClick={handleHoldSubmit} disabled={!holdReason.trim() || holdSubmitting}
                                  className={cn("p-2 rounded border transition-all", "bg-blue-500/20 border border-blue-500/30 text-blue-400 hover:bg-blue-500/30 disabled:opacity-30 disabled:cursor-not-allowed")}>
                                  {holdSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                                </button>
                                <button type="button" onClick={() => { setStatus('assigned'); setHoldReason(''); }}
                                  className="p-2 rounded bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all">
                                  <X size={16} />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {status === 'completed' && (
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
                                  className={cn("p-2 rounded border transition-all", "bg-blue-500/20 border border-blue-500/30 text-blue-400 hover:bg-blue-500/30 disabled:opacity-30 disabled:cursor-not-allowed")}>
                                  {compSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                                </button>
                                <button type="button" onClick={() => { setStatus('assigned'); setCompletionRemarks(''); }}
                                  className="p-2 rounded bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all">
                                  <X size={16} />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {status === 'overdue' && (
                      <div className="space-y-2">
                        <label className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/30">Request Extension</label>
                        {!extSaved ? (
                          <div className="flex gap-2">
                            <textarea value={extensionRequest} onChange={e => setExtensionRequest(e.target.value)}
                              placeholder="Why do you need more time?"
                              rows={2}
                              className="flex-1 bg-white/5 border border-zinc-800 rounded-md px-4 py-3 text-sm text-white placeholder:text-white/20 focus:border-blue-500/40 outline-none transition-all resize-none" />
                            <div className="flex flex-col gap-1.5 shrink-0">
                              <button type="button" onClick={handleExtSubmit} disabled={!extensionRequest.trim() || extSubmitting}
                                className="p-2 rounded bg-blue-500/20 border border-blue-500/30 text-blue-400 hover:bg-blue-500/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                                {extSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                              </button>
                              <button type="button" onClick={() => setExtensionRequest('')}
                                className="p-2 rounded bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all">
                                <X size={16} />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <textarea value={extensionRequest} disabled rows={2}
                              className="flex-1 bg-white/5 border border-zinc-800 rounded-md px-4 py-3 text-sm text-white/60 resize-none" />
                            <button type="button" onClick={() => setExtSaved(false)}
                              className="shrink-0 mt-0.5 p-2 rounded bg-blue-500/20 border border-blue-500/30 text-blue-400 hover:bg-blue-500/30 transition-all self-start">
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  {error && <p className="text-[10px] text-red-500 font-medium uppercase tracking-wider">{error}</p>}
                </div>
              )}
              </form>
            </div>

          <div className="px-8 py-4 border-t border-zinc-800 bg-black/50 backdrop-blur-xl flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              {task?.user_name && (
                <>
                  <div className="w-7 h-7 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                    <User size={12} className="text-blue-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[8px] text-white/30 uppercase tracking-[0.2em] font-medium">Created by</p>
                    <p className="text-xs text-white font-medium truncate">{task.user_name}</p>
                  </div>
                </>
              )}
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <button type="button" onClick={onClose}
                className="px-6 py-2 rounded-sm bg-zinc-900/50 border border-zinc-800 text-white/40 hover:text-white hover:bg-zinc-800 transition-all text-[10px] font-medium uppercase tracking-[0.2em]">
                Close
              </button>
              <button type="submit" form="update-task-poster-form" disabled={isSubmitting || (status === 'on_hold' && !holdReason.trim()) || (status === 'completed' && !completionRemarks.trim())}
                className="px-6 py-2 rounded-sm bg-blue-500/20 border border-blue-500/30 text-blue-400 hover:bg-blue-500/30 hover:border-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed text-[10px] font-medium uppercase tracking-[0.2em] transition-all flex items-center gap-2">
                {isSubmitting ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : <><CalendarPlus size={14} />Save</>}
              </button>
            </div>
          </div>
            </div>
        </>
      )}

        {showPriorityDropdown && dropdownPos.priority && canEdit && (
          <>
            <div className="fixed inset-0 z-[9998]" onClick={() => { setShowPriorityDropdown(false); setDropdownPos(prev => ({ ...prev, priority: null })); }} />
            <div style={{ position: 'fixed', top: dropdownPos.priority.top, left: dropdownPos.priority.left, width: dropdownPos.priority.width, zIndex: 9999 }}
              className="bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl overflow-hidden">
              {['low', 'medium', 'high'].map(p => (
                <button key={p} type="button" onClick={() => { setPriority(p); setShowPriorityDropdown(false); setDropdownPos(prev => ({ ...prev, priority: null })); }}
                  className={cn("w-full px-4 py-2.5 flex items-center justify-between hover:bg-white/[0.03] transition-all text-left", priority === p && "bg-blue-500/5")}>
                  <span className={cn("text-xs font-medium capitalize", p === 'high' ? 'text-red-400' : p === 'medium' ? 'text-yellow-400' : 'text-blue-400')}>{p}</span>
                  {priority === p && <Check size={12} className="text-blue-400 shrink-0" />}
                </button>
              ))}
            </div>
          </>
        )}

        {showStatusDropdown && dropdownPos.status && canEditStatus && (
          <>
            <div className="fixed inset-0 z-[9998]" onClick={() => { setShowStatusDropdown(false); setDropdownPos(prev => ({ ...prev, status: null })); }} />
            <div style={{ position: 'fixed', top: dropdownPos.status.top, left: dropdownPos.status.left, width: dropdownPos.status.width, zIndex: 9999 }}
              className="bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl overflow-hidden">
              {TASK_STATUS_OPTIONS.filter(opt => isCreator || (opt.value !== 'approved' && opt.value !== 'canceled')).map(opt => (
                <button key={opt.value} type="button" onClick={() => { setStatus(opt.value); if (opt.value !== 'on_hold') setHoldReason(''); setShowStatusDropdown(false); setDropdownPos(prev => ({ ...prev, status: null })); }}
                  className={cn("w-full px-4 py-2.5 flex items-center justify-between hover:bg-white/[0.03] transition-all text-left capitalize", status === opt.value && "bg-blue-500/5")}>
                  <span className="text-xs font-medium text-white">{opt.label}</span>
                  {status === opt.value && <Check size={12} className="text-blue-400 shrink-0" />}
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

        <ConfirmDeleteDialog
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          onConfirm={async () => {
            setIsDeleting(true);
            try {
              await axios.delete(`/api/calendar/todos/${task.id}/`);
              setShowDeleteConfirm(false);
              onSuccess?.();
              onClose();
            } catch {
              setShowDeleteConfirm(false);
              setError('Failed to delete task.');
            } finally {
              setIsDeleting(false);
            }
          }}
          isDeleting={isDeleting}
          title="Delete Task"
          description="This will permanently remove this task."
        />
      </div>
    </div>,
    document.body
  );
};

export default UpdateTaskModal;
