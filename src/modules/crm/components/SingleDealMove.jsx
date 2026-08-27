import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Loader2, Check, ArrowRightLeft, Plus, Layout } from 'lucide-react';
import axios from 'axios';
import { cn } from '@/lib/utils';

const SingleDealMove = ({ isOpen, onClose, deal, onMoved }) => {
  const [pipelines, setPipelines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPipeline, setSelectedPipeline] = useState(null);
  const [isMoving, setIsMoving] = useState(false);
  const [error, setError] = useState('');

  // Create pipeline states
  const [isCreatingPipeline, setIsCreatingPipeline] = useState(false);
  const [newPipelineName, setNewPipelineName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      setError('');
      setSelectedPipeline(null);
      setIsCreatingPipeline(false);
      setNewPipelineName('');
      setCreateError('');
      axios.get('/api/crm/pipelines/')
        .then(res => setPipelines(res.data.results || res.data || []))
        .catch(() => setPipelines([]))
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

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

  const handleMove = async () => {
    if (!selectedPipeline || !deal) return;
    setIsMoving(true);
    setError('');
    try {
      // Get first stage of the target pipeline
      const stagesRes = await axios.get(`/api/crm/pipelines/${selectedPipeline.id}/stages/`);
      const stages = stagesRes.data.results || stagesRes.data || [];
      const firstStage = stages.length > 0 ? stages[0] : null;

      await axios.patch(`/api/crm/pipeline/${deal.id}/`, {
        pipeline: selectedPipeline.id,
        stage: firstStage?.id || null,
      });

      onMoved?.(selectedPipeline.id);
      onClose();
    } catch (err) {
      const data = err.response?.data;
      setError(data?.detail || data?.pipeline?.[0] || 'Failed to move deal.');
    } finally {
      setIsMoving(false);
    }
  };

  if (!isOpen || !deal) return null;

  return createPortal(
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[70vh]">
        <div className="px-6 py-5 border-b border-zinc-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <ArrowRightLeft size={14} />
            </div>
            <div>
              <h2 className="text-sm font-medium text-white uppercase tracking-wider">Move to Pipeline</h2>
              <p className="text-[9px] text-white/40 uppercase tracking-widest font-medium">{deal.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded bg-zinc-900/50 border border-zinc-800 text-white/40 hover:text-white hover:bg-zinc-800 transition-all">
            <X size={14} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={20} className="animate-spin text-blue-500/50" />
            </div>
          ) : isCreatingPipeline || pipelines.length === 0 ? (
            <form onSubmit={handleCreatePipeline} className="space-y-4 py-2">
              <div>
                <label className="text-[10px] text-white/40 mb-2 block">New Pipeline Name</label>
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
            <div className="space-y-2">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] text-white/40 uppercase tracking-wider font-medium">Select a pipeline</p>
                <button
                  onClick={() => setIsCreatingPipeline(true)}
                  className="text-[12px] text-blue-400 hover:text-blue-300 flex items-center gap-1"
                >
                  <Plus size={10} /> New
                </button>
              </div>
              {pipelines.map(pipeline => (
                <button
                  key={pipeline.id}
                  onClick={() => setSelectedPipeline(pipeline)}
                  disabled={pipeline.id === deal.raw?.pipeline}
                  className={cn(
                    "w-full text-left px-4 py-3 rounded-lg border transition-all flex items-center justify-between",
                    pipeline.id === deal.raw?.pipeline
                      ? "border-zinc-800 bg-white/[0.02] opacity-40 cursor-not-allowed"
                      : selectedPipeline?.id === pipeline.id
                        ? "border-blue-500/40 bg-blue-500/10"
                        : "border-zinc-800 bg-white/[0.02] hover:border-zinc-700 hover:bg-white/[0.04]"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-8 h-8 rounded-md border flex items-center justify-center transition-colors",
                      selectedPipeline?.id === pipeline.id ? "bg-blue-500/20 border-blue-500/30 text-blue-400" : "bg-zinc-800 border-zinc-700 text-white/20"
                    )}>
                      <Layout size={14} />
                    </div>
                    <div>
                      <p className="text-sm text-white font-medium">{pipeline.name}</p>
                      {pipeline.id === deal.raw?.pipeline && (
                        <p className="text-[9px] text-white/30 mt-0.5">Current pipeline</p>
                      )}
                    </div>
                  </div>
                  {selectedPipeline?.id === pipeline.id && <Check size={14} className="text-blue-400 shrink-0" />}
                </button>
              ))}
              {pipelines.length === 0 && (
                <p className="text-[10px] text-white/30 text-center py-8 uppercase tracking-widest">No pipelines found</p>
              )}
            </div>
          )}

          {error && (
            <p className="mt-4 text-[10px] text-red-500 font-medium uppercase tracking-wider">{error}</p>
          )}
        </div>

        <div className="px-6 py-4 border-t border-zinc-800 bg-black/50 flex justify-end gap-3 shrink-0">
          <button onClick={onClose} disabled={isMoving}
            className="px-5 py-2 rounded-sm bg-zinc-900/50 border border-zinc-800 text-white/40 hover:text-white hover:bg-zinc-800 transition-all text-[10px] font-medium uppercase tracking-[0.2em]">
            Cancel
          </button>
          <button onClick={handleMove} disabled={isMoving || !selectedPipeline || isCreatingPipeline}
            className="px-5 py-2 rounded-sm bg-blue-500/20 border border-blue-500/30 text-blue-400 hover:bg-blue-500/30 hover:border-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed text-[10px] font-medium uppercase tracking-[0.2em] transition-all flex items-center gap-2">
            {isMoving ? <><Loader2 size={12} className="animate-spin" /> Moving...</> : 'Move'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default SingleDealMove;
