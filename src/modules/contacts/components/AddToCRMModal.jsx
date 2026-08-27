import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Rocket, Layout, Loader2, Check, Plus, Database, GitMerge } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import axios from 'axios';

const AddToCRMModal = ({ isOpen, onClose, onConfirm, onSuccess, contactCount }) => {
  const [pipelines, setPipelines] = useState([]);
  const [selectedPipeline, setSelectedPipeline] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreatingPipeline, setIsCreatingPipeline] = useState(false);
  const [newPipelineName, setNewPipelineName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ phase: '', current: 0, total: 0 });
  const [processingError, setProcessingError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchPipelines();
    }
  }, [isOpen]);

  const fetchPipelines = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('/api/crm/pipelines/');
      const data = response.data.results || response.data;
      setPipelines(data);
      if (data.length > 0) {
        const firstAvailable = data.find(p => !p.custom_fields_enabled);
        setSelectedPipeline(firstAvailable || null);
      }
    } catch (err) {
      console.error('Failed to fetch pipelines:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!selectedPipeline) return;
    setIsProcessing(true);
    setProcessingError(null);
    try {
      const firstStage = selectedPipeline.stages?.sort((a, b) => a.order - b.order)[0];
      await onConfirm(selectedPipeline.id, firstStage?.id, setProgress);
      onSuccess?.(selectedPipeline.id);
      onClose();
    } catch (err) {
      console.error('Failed to add to CRM:', err);
      setProcessingError('Failed to add contacts. Please try again.');
    }
  };

  const handleCreatePipeline = async (e) => {
    e.preventDefault();
    if (!newPipelineName.trim()) return;
    setIsCreating(true);
    setCreateError('');
    try {
      const res = await axios.post('/api/crm/pipelines/', { name: newPipelineName });
      setPipelines([...pipelines, res.data]);
      setSelectedPipeline(res.data);
      setIsCreatingPipeline(false);
      setNewPipelineName('');
    } catch (err) {
      setCreateError('Failed to create pipeline.');
    } finally {
      setIsCreating(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-lg shadow-2xl flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-zinc-800 flex items-start justify-between shrink-0 bg-black/50 backdrop-blur-xl rounded-t-lg">
          <div className="flex items-start justify-between gap-4 w-full">
            <div className="flex items-center gap-5">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                <Rocket size={18} />
              </div>
              <div>
                <h2 className="text-lg text-white">Add to CRM</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-blue-400">
                    {contactCount} contacts selected
                  </span>
                </div>
              </div>
            </div>
            <button 
                onClick={onClose}
                className="p-2 rounded-md hover:bg-white/5 text-white/40 hover:text-white transition-colors"
            >
                <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className={cn("p-6 bg-zinc-900/30 flex-1 overflow-hidden flex flex-col", isProcessing && "pointer-events-none opacity-60 cursor-not-allowed")}>
          {isLoading ? (
            <div className="py-10 flex flex-col items-center gap-4">
              <Loader2 className="animate-spin text-blue-500/50" size={24} />
              <p className="text-[10px] text-white/20">Loading Pipelines...</p>
            </div>
          ) : isCreatingPipeline || pipelines.length === 0 ? (
            <form onSubmit={handleCreatePipeline} className="space-y-4 py-2">
              <div>
                <label className="text-[10px] text-white/40 mb-2 block">
                  New Pipeline Name
                </label>
                <input
                  type="text"
                  autoFocus
                  value={newPipelineName}
                  onChange={(e) => setNewPipelineName(e.target.value)}
                  placeholder="e.g. Inbound Leads"
                  className="w-full bg-black/40 border border-zinc-800 rounded-md px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-colors"
                />
              </div>
              {createError && (
                <p className="text-[10px] text-red-400 uppercase tracking-[0.2em]">{createError}</p>
              )}
              <div className="flex gap-2">
                {pipelines.length > 0 && (
                  <button
                    type="button"
                    onClick={() => { setIsCreatingPipeline(false); setNewPipelineName(''); setCreateError(''); }}
                    className="flex-1 py-2 rounded-md bg-zinc-900 border border-zinc-800 text-[10px] text-white/40 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  disabled={isCreating || !newPipelineName.trim()}
                  className="flex-1 py-2 rounded-md bg-blue-500/10 border border-blue-500/30 text-[10px] text-blue-400 hover:bg-blue-500/20 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isCreating ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
                  Create & Select
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4 flex-1 flex flex-col min-h-0">
              <div className="flex items-center justify-between">
                <label className="text-[10px] text-white/40">Select Target Pipeline</label>
                <button
                  onClick={() => setIsCreatingPipeline(true)}
                  className="text-[12px] text-blue-400 hover:text-blue-300 flex items-center gap-1"
                >
                  <Plus size={10} /> New
                </button>
              </div>
              <div className="overflow-y-auto pr-2 custom-scrollbar space-y-2 flex-1">
                {pipelines.map(p => (
                  <button
                    key={p.id}
                    onClick={() => !p.custom_fields_enabled && setSelectedPipeline(p)}
                    disabled={p.custom_fields_enabled}
                    className={cn(
                      "w-full px-4 py-4 rounded-lg flex items-center justify-between transition-all duration-300 border",
                      p.custom_fields_enabled
                        ? "opacity-35 bg-zinc-950/20 border-zinc-900/40 cursor-not-allowed"
                        : selectedPipeline?.id === p.id 
                          ? "bg-blue-500/10 border-blue-500/40 shadow-[0_0_15px_rgba(59,130,246,0.1)]" 
                          : "bg-zinc-950/30 border-zinc-800/50 hover:bg-zinc-900/50 hover:border-zinc-700"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-8 h-8 rounded-md border flex items-center justify-center transition-colors",
                        selectedPipeline?.id === p.id && !p.custom_fields_enabled ? "bg-blue-500/20 border-blue-500/30 text-blue-400" : "bg-zinc-800 border-zinc-700 text-white/20"
                      )}>
                        <Layout size={14} />
                      </div>
                      <span className={cn(
                        "text-[15px]",
                        selectedPipeline?.id === p.id && !p.custom_fields_enabled ? "text-blue-400" : "text-white/60"
                      )}>{p.name}</span>
                    </div>
                    {p.custom_fields_enabled ? (
                      <span className="text-[7px] px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-500 font-extrabold uppercase tracking-widest font-mono shrink-0">
                        Custom Fields Enabled
                      </span>
                    ) : selectedPipeline?.id === p.id && (
                      <div className="w-5 h-5 rounded-full bg-blue-500/20 border border-blue-500/50 flex items-center justify-center">
                        <Check size={12} strokeWidth={3} className="text-blue-400" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-zinc-800 bg-black/50 backdrop-blur-xl flex justify-end gap-3 shrink-0 rounded-b-lg">
            {(isProcessing || processingError) && contactCount >= 1500 ? (
                <div className="w-full space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] text-white/40">
                            {processingError ? `${progress.phase} — Failed` : progress.phase}
                        </span>
                        <span className="text-[10px] font-mono text-white/20">
                            {progress.total > 0 ? `${progress.current} / ${progress.total}` : ''}
                        </span>
                    </div>
                    <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                        <div
                            className={cn(
                                "h-full rounded-full transition-all duration-300 ease-out",
                                processingError ? "bg-red-500" : "bg-blue-500"
                            )}
                            style={{ width: progress.total > 0 ? `${Math.round((progress.current / progress.total) * 100)}%` : '0%' }}
                        />
                    </div>
                    {processingError && (
                        <p className="text-[10px] text-red-400 text-center">{processingError}</p>
                    )}
                </div>
            ) : isProcessing ? (
                <div className="w-full flex items-center justify-center gap-2">
                    <Loader2 size={14} className="animate-spin text-blue-400" />
                    <span className="text-[10px] text-white/40">Processing...</span>
                </div>
            ) : (
                <>
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2 rounded-sm bg-zinc-900/50 border border-zinc-800 text-white/40 hover:text-white hover:bg-zinc-800 transition-all text-[10px]"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={isSubmitting || !selectedPipeline}
                        className="px-6 py-2 rounded-sm bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 hover:border-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed text-[10px] transition-all flex items-center gap-2"
                    >
                        {isSubmitting ? (
                            <><Loader2 size={14} className="animate-spin" /> Exporting...</>
                        ) : (
                            'Confirm Export'
                        )}
                    </button>
                </>
            )}
        </div>

      </div>
    </div>,
    document.body
  );
};

export default AddToCRMModal;
