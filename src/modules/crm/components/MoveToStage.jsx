import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Loader2, Check, ArrowRightLeft } from 'lucide-react';
import axios from 'axios';
import { cn } from '@/lib/utils';

const MoveToStage = ({ isOpen, onClose, dealIds, currentPipelineId, currentStageIds = new Set(), onMoved }) => {
  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedStage, setSelectedStage] = useState(null);
  const [isMoving, setIsMoving] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  useEffect(() => {
    if (isOpen && currentPipelineId) {
      setLoading(true);
      setError('');
      setSelectedStage(null);
      setProgress({ current: 0, total: 0 });
      axios.get(`/api/crm/pipelines/${currentPipelineId}/stages/`)
        .then(res => {
          const data = res.data.results || res.data || [];
          setStages(data);
        })
        .catch(() => setStages([]))
        .finally(() => setLoading(false));
    }
  }, [isOpen, currentPipelineId]);

  const CHUNK_SIZE = 500;

  const handleMove = async () => {
    if (!selectedStage || !dealIds?.length) return;
    setIsMoving(true);
    setError('');
    setProgress({ current: 0, total: dealIds.length });

    try {
      const total = dealIds.length;
      const totalChunks = Math.ceil(total / CHUNK_SIZE);

      for (let i = 0; i < totalChunks; i++) {
        const chunk = dealIds.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
        await axios.post('/api/crm/pipeline/bulk-move-to-stage/', {
          deal_ids: chunk,
          stage_id: selectedStage.id,
        });
        setProgress({
          current: Math.min((i + 1) * CHUNK_SIZE, total),
          total,
        });
      }

      onMoved?.(selectedStage.id);
      onClose();
    } catch (err) {
      const data = err.response?.data;
      setError(data?.detail || data?.error || 'Failed to move deals to stage.');
    } finally {
      setIsMoving(false);
    }
  };

  if (!isOpen || !dealIds?.length) return null;

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
              <h2 className="text-sm font-medium text-white uppercase tracking-wider">Move to Stage</h2>
              <p className="text-[9px] text-white/40 uppercase tracking-widest font-medium">{dealIds.length} deal{dealIds.length > 1 ? 's' : ''} selected</p>
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
          ) : stages.length === 0 ? (
            <p className="text-[10px] text-white/30 text-center py-8 uppercase tracking-widest">No stages found in this pipeline</p>
          ) : (
            <div className="space-y-2">
              <p className="text-[10px] text-white/40 uppercase tracking-wider font-medium mb-3">Select a stage</p>
              {stages.map(stage => {
                const isCurrent = currentStageIds.has(stage.id);
                return (
                  <button
                    key={stage.id}
                    onClick={() => setSelectedStage(stage)}
                    disabled={isCurrent}
                    className={cn(
                      "w-full text-left px-4 py-3 rounded-lg border transition-all flex items-center justify-between",
                      isCurrent
                        ? "border-zinc-800 bg-white/[0.02] opacity-40 cursor-not-allowed"
                        : selectedStage?.id === stage.id
                          ? "border-blue-500/40 bg-blue-500/10"
                          : "border-zinc-800 bg-white/[0.02] hover:border-zinc-700 hover:bg-white/[0.04]"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-3 h-3 rounded-full border-2 transition-colors",
                        isCurrent
                          ? "border-zinc-700 bg-transparent"
                          : selectedStage?.id === stage.id
                            ? "border-blue-500 bg-blue-500"
                            : "border-zinc-600"
                      )} />
                      <div>
                        <p className="text-sm text-white font-medium">{stage.name}</p>
                        {isCurrent && (
                          <p className="text-[9px] text-white/30 mt-0.5">Current stage</p>
                        )}
                      </div>
                    </div>
                    {selectedStage?.id === stage.id && !isCurrent && <Check size={14} className="text-blue-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          )}

          {error && (
            <p className="mt-4 text-[10px] text-red-500 font-medium uppercase tracking-wider">{error}</p>
          )}
        </div>

        <div className="px-6 py-4 border-t border-zinc-800 bg-black/50 flex justify-end gap-3 shrink-0">
          {isMoving ? (
            dealIds.length >= 500 ? (
              <div className="w-full space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-white/40">Moving deals...</span>
                  <span className="text-[10px] font-mono text-white/20">{progress.current} / {progress.total}</span>
                </div>
                <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all duration-300"
                    style={{ width: `${progress.total > 0 ? Math.round((progress.current / progress.total) * 100) : 0}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="w-full flex items-center justify-center gap-2">
                <Loader2 size={14} className="animate-spin text-blue-400" />
                <span className="text-[10px] text-white/40">Moving deals...</span>
              </div>
            )
          ) : (
            <>
              <button onClick={onClose} disabled={isMoving}
                className="px-5 py-2 rounded-sm bg-zinc-900/50 border border-zinc-800 text-white/40 hover:text-white hover:bg-zinc-800 transition-all text-[10px] font-medium uppercase tracking-[0.2em]">
                Cancel
              </button>
              <button onClick={handleMove} disabled={isMoving || !selectedStage}
                className="px-5 py-2 rounded-sm bg-blue-500/20 border border-blue-500/30 text-blue-400 hover:bg-blue-500/30 hover:border-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed text-[10px] font-medium uppercase tracking-[0.2em] transition-all flex items-center gap-2">
                {isMoving ? <><Loader2 size={12} className="animate-spin" /> Moving...</> : 'Move'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default MoveToStage;
