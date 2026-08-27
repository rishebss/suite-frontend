import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Layout, Plus, ChevronRight, Pencil, Trash2, Search, CheckSquare, Square } from 'lucide-react';
import { Input } from '@/components/ui/input';
import RingLoader from '@/components/ui/RingLoader';
import axios from 'axios';
import { cn } from '@/lib/utils';

const CreatePipelineModal = ({ isOpen, onClose, onSuccess, onDelete, onUpdate, pipelines = [] }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingPipeline, setEditingPipeline] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [deleteProgress, setDeleteProgress] = useState(null);
  const [error, setError] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [localPipelines, setLocalPipelines] = useState(pipelines);
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);

  const fetchPipelines = async () => {
    setIsLoadingList(true);
    try {
      const response = await axios.get('/api/crm/pipelines/');
      const data = response.data.results || response.data || [];
      setLocalPipelines(data);
    } catch (err) {
      console.error('Failed to fetch pipelines in modal:', err);
      setLocalPipelines(pipelines);
    } finally {
      setIsLoadingList(false);
    }
  };

  useEffect(() => {
    if (isOpen && !searchQuery) {
      fetchPipelines();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    if (!searchQuery.trim()) {
      setLocalPipelines(pipelines);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const response = await axios.get('/api/crm/pipelines/', {
          params: { search: searchQuery }
        });
        const data = response.data.results || response.data;
        setLocalPipelines(data);
      } catch (err) {
        console.error('Search failed:', err);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, isOpen, pipelines]);

  const toggleSelect = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
    setBulkDeleteConfirm(false);
  };

  const deleteSelected = async () => {
    setIsDeleting('bulk');
    try {
      for (const id of selectedIds) {
        await axios.delete(`/api/crm/pipelines/${id}/`);
      }
      setSelectedIds(new Set());
      setBulkDeleteConfirm(false);
      if (onDelete) onDelete([...selectedIds]);
      fetchPipelines();
    } catch (err) {
      setError('Failed to delete some pipelines.');
    } finally {
      setIsDeleting(null);
      setBulkDeleteConfirm(false);
    }
  };

  useEffect(() => {
    if (!showForm) {
      setName('');
      setDescription('');
      setEditingPipeline(null);
      setError('');
    }
  }, [showForm, isOpen]);

  useEffect(() => {
    setSelectedIds(new Set());
    setBulkDeleteConfirm(false);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsSubmitting(true);
    setError('');
    try {
      if (editingPipeline) {
        const response = await axios.patch(`/api/crm/pipelines/${editingPipeline.id}/`, { name, description });
        if (onUpdate) onUpdate(response.data);
      } else {
        const response = await axios.post('/api/crm/pipelines/', { name, description });
        onSuccess(response.data);
      }
      setShowForm(false);
    } catch (err) {
      setError(`Failed to ${editingPipeline ? 'update' : 'create'} pipeline.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (id) => {
    setConfirmDeleteId(confirmDeleteId === id ? null : id);
  };

  const confirmDelete = async (id) => {
    setIsDeleting(id);
    let total = localPipelines.find(p => p.id === id)?.deals_count || 0;
    let deleted = 0;
    setDeleteProgress({ phase: 'Deleting deals...', current: 0, total });
    try {
      while (true) {
        const res = await axios.post(`/api/crm/pipelines/${id}/delete-chunk/`, { limit: 500 });
        if (total === 0 && res.data.total) total = res.data.total;
        deleted += res.data.deleted;
        setDeleteProgress({ phase: 'Deleting deals...', current: deleted, total });
        if (res.data.remaining === 0) break;
      }
      if (onDelete) onDelete(id);
      fetchPipelines();
    } catch (err) {
      setError('Failed to delete pipeline.');
    } finally {
      setIsDeleting(null);
      setConfirmDeleteId(null);
      setDeleteProgress(null);
    }
  };

  const startEdit = (pipeline) => {
    setEditingPipeline(pipeline);
    setName(pipeline.name);
    setDescription(pipeline.description || '');
    setShowForm(true);
  };

  return createPortal(
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-8 py-6 border-b border-zinc-800 bg-white/[0.02] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Layout size={20} />
            </div>
            <div>
              <h2 className="text-base font-medium text-white uppercase tracking-wider">Pipeline Manager</h2>
              <p className="text-[10px] text-white/40 uppercase tracking-widest font-medium">Registry & Configuration</p>
            </div>
          </div>
        </div>

        {/* Sub-Header (Search & Add & Bulk Delete) */}
        {!showForm && (
          <div className="px-8 py-4 border-b border-zinc-800 flex items-center gap-4 bg-zinc-900/10 shrink-0">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-full bg-white/5 border border-zinc-800 rounded-md py-2 pl-9 pr-4 text-[10px] text-white placeholder:text-white/10 focus:border-blue-500/40 outline-none transition-all uppercase tracking-widest font-medium"
              />
            </div>
            <button 
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 hover:border-blue-500/50 rounded-md text-[10px] font-medium uppercase tracking-widest transition-all cursor-pointer whitespace-nowrap"
            >
              <Plus size={14} />
              Add
            </button>
            {selectedIds.size > 0 && (
              <button
                onClick={() => setBulkDeleteConfirm(true)}
                disabled={isDeleting === 'bulk'}
                className="flex items-center py-2 bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 hover:border-red-500/50 rounded-md transition-all cursor-pointer disabled:opacity-50"
                title="Delete selected"
              >
                <span className="text-xs font-medium leading-none px-3">{selectedIds.size}</span>
                <div className="w-px self-stretch bg-red-400/30 -my-2" />
                <div className="flex-1 flex items-center justify-center px-3">
                  <Trash2 size={14} />
                </div>
              </button>
            )}
          </div>
        )}

        {/* Form specific header (Cancel button) */}
        {showForm && (
          <div className="px-8 py-4 border-b border-zinc-800 flex justify-end bg-zinc-900/10 shrink-0">
            <button 
              onClick={() => setShowForm(false)}
              className="flex items-center gap-2 px-4 py-2 bg-zinc-800 border border-zinc-700 text-white/60 hover:text-white rounded-md text-[10px] font-medium uppercase tracking-widest transition-all cursor-pointer"
            >
              <X size={14} />
              Cancel
            </button>
          </div>
        )}

        {/* Single Delete Confirmation Banner */}
        {confirmDeleteId && !bulkDeleteConfirm && !showForm && (
          <div className="px-8 py-3 border-b border-red-500/20 bg-red-500/[0.03] flex items-center justify-between shrink-0">
            {isDeleting === confirmDeleteId ? (
              <div className="w-full space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-red-400 font-medium uppercase tracking-wider">{deleteProgress?.phase || 'Deleting pipeline...'}</span>
                  <span className="text-[10px] font-mono text-red-400/60">{deleteProgress?.total > 0 ? `${deleteProgress?.current} / ${deleteProgress?.total}` : ''}</span>
                </div>
                <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-500 rounded-full transition-all duration-300 ease-out"
                    style={{ width: deleteProgress?.total > 0 ? `${Math.round((deleteProgress?.current / deleteProgress?.total) * 100)}%` : '0%' }}
                  />
                </div>
              </div>
            ) : (
              <>
                <p className="text-[10px] text-red-400 font-medium uppercase tracking-wider max-w-[60%]">
                  Delete &apos;{localPipelines.find(p => p.id === confirmDeleteId)?.name || ''}&apos;? Associated contacts will be removed.
                </p>
                <div className="flex items-center gap-2">
                  <button onClick={() => setConfirmDeleteId(null)} className="px-3 py-1.5 bg-zinc-800 border border-zinc-700 text-white/60 hover:text-white text-[9px] font-medium uppercase tracking-wider rounded-sm transition-all cursor-pointer">
                    Cancel
                  </button>
                  <button onClick={() => confirmDelete(confirmDeleteId)} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 text-[9px] font-medium uppercase tracking-wider rounded-sm transition-all cursor-pointer">
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Bulk Delete Confirmation Banner */}
        {bulkDeleteConfirm && !confirmDeleteId && !showForm && (
          <div className="px-8 py-3 border-b border-red-500/20 bg-red-500/[0.03] flex items-center justify-between shrink-0">
            <p className="text-[10px] text-red-400 font-medium uppercase tracking-wider">
              Delete {selectedIds.size} selected pipeline{selectedIds.size !== 1 ? 's' : ''}?
            </p>
            <div className="flex items-center gap-2">
              <button onClick={() => setBulkDeleteConfirm(false)} disabled={isDeleting === 'bulk'} className="px-3 py-1.5 bg-zinc-800 border border-zinc-700 text-white/60 hover:text-white text-[9px] font-medium uppercase tracking-wider rounded-sm transition-all cursor-pointer disabled:opacity-50">
                Cancel
              </button>
              <button onClick={deleteSelected} disabled={isDeleting === 'bulk'} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 text-[9px] font-medium uppercase tracking-wider rounded-sm transition-all cursor-pointer disabled:opacity-50">
                {isDeleting === 'bulk' ? <span className="inline-block animate-pulse">Deleting</span> : 'Delete'}
              </button>
            </div>
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-0">
          {showForm ? (
            <form onSubmit={handleSubmit} className="p-8 space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="space-y-2">
                <label className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/30">
                  {editingPipeline ? 'Edit Name' : 'Pipeline Name'}
                </label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Enterprise Sales"
                  className="bg-white/5 border-zinc-800 h-12 text-sm text-white placeholder:text-white/10 focus:border-blue-500/40 focus:ring-0 focus-visible:ring-0 outline-none transition-all font-medium rounded-md"
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/30">Details (Optional)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Define workflow objectives..."
                  className="w-full bg-white/5 border border-zinc-800 rounded-md p-4 text-sm text-white placeholder:text-white/10 focus:border-blue-500/40 focus:ring-0 outline-none min-h-[100px] resize-none font-medium transition-all"
                />
              </div>
              {error && <p className="text-[10px] text-red-500 font-medium uppercase tracking-wider">{error}</p>}
              <div className="pt-4 pb-4">
                <button
                  type="submit"
                  disabled={isSubmitting || !name.trim()}
                  className="w-full h-12 bg-blue-500/10 hover:bg-blue-500/20 disabled:bg-zinc-900/50 disabled:text-white/10 disabled:border-zinc-800/50 border border-blue-500/30 hover:border-blue-500/50 text-blue-400 disabled:text-white/20 font-medium text-[10px] uppercase tracking-[0.3em] rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
                >
                  <Layout size={14} />
                  {editingPipeline ? 'Update Pipeline' : 'Save Pipeline'}
                </button>
              </div>
            </form>
          ) : (
            <div className={cn("max-h-[320px] overflow-y-auto custom-scrollbar divide-y divide-zinc-800/50 relative", isDeleting && "opacity-40 pointer-events-none")}>
              {isLoadingList ? (
                <div className="py-12 flex flex-col items-center justify-center gap-2">
                  <RingLoader className="scale-75" />
                  <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-medium">Loading Pipelines...</p>
                </div>
              ) : localPipelines.length === 0 ? (
                <div className="p-12 text-center">
                  <p className="text-[10px] text-white/20 uppercase tracking-[0.2em] font-medium">
                    {searchQuery ? 'No matching pipelines' : 'No pipelines configured'}
                  </p>
                </div>
              ) : (
                localPipelines.map((pipeline) => (
                  <div key={pipeline.id}>
                    <div className="group px-8 py-5 flex items-center justify-between hover:bg-white/[0.02] transition-colors cursor-default">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <button
                          onClick={() => toggleSelect(pipeline.id)}
                          className="shrink-0 text-white/20 hover:text-white/60 transition-colors cursor-pointer"
                        >
                          {selectedIds.has(pipeline.id) ? <CheckSquare size={16} className="text-blue-400" /> : <Square size={16} />}
                        </button>
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-medium text-white uppercase tracking-wider truncate">{pipeline.name}</h3>
                            {(pipeline.deals_count === 0 || Number(pipeline.deals_count) === 0) && (
                              <span className="px-2 py-0.5 rounded bg-zinc-800/80 border border-zinc-700/60 text-[8px] font-mono text-zinc-400 font-medium uppercase tracking-wider">
                                Empty (No Deals)
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-white/40 uppercase tracking-widest font-medium line-clamp-1">
                            {pipeline.description || "No description provided"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 shrink-0">
                        <div className={cn("flex items-center gap-2 transition-opacity", isDeleting === pipeline.id ? "opacity-100" : "opacity-0 group-hover:opacity-100")}>
                          <button 
                            onClick={() => startEdit(pipeline)}
                            className="p-2 rounded-md hover:bg-blue-500/10 text-zinc-600 hover:text-blue-400 transition-colors cursor-pointer"
                            title="Edit"
                          >
                            <Pencil size={18} />
                          </button>
                          <button 
                            onClick={() => handleDeleteClick(pipeline.id)}
                            disabled={isDeleting === pipeline.id}
                            className="p-2 rounded-md hover:bg-red-500/10 text-zinc-600 hover:text-red-400 transition-colors cursor-pointer disabled:opacity-50"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-4 border-t border-zinc-800 bg-white/[0.01] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <span className="text-[9px] font-medium text-white/30 uppercase tracking-widest">
              {pipelines.length} Active {pipelines.length === 1 ? 'Pipeline' : 'Pipelines'}
            </span>
          </div>
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-zinc-900 border border-zinc-800 text-[9px] font-medium text-white/40 hover:text-white hover:bg-zinc-800 hover:border-zinc-700 uppercase tracking-widest transition-all rounded-md cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  , document.body);
};

export default CreatePipelineModal;
