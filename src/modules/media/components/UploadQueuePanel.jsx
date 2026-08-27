import React, { useState, useRef, useEffect } from 'react';
import {
  Loader,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Upload,
  ChevronDown,
  ChevronUp,
  X,
} from 'lucide-react';

function formatSize(bytes) {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
}

export default function UploadQueuePanel({
  queue,
  onRetry,
  onClearCompleted,
  totalItems,
  completedItems,
  active,
}) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    const handleClick = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  if (queue.length === 0) return null;

  const uploadingItem = queue.find((i) => i.status === 'uploading');
  const canClear = queue.every((i) => i.status === 'done' || i.status === 'failed');
  const failed = queue.filter((i) => i.status === 'failed').length;

  return (
    <div className="relative" ref={panelRef}>
      {/* Compact badge */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-white/10 bg-zinc-900/80 text-[10px] font-bold text-white/60 hover:text-white hover:border-white/20 transition-all"
      >
        {active ? (
          <Loader size={12} className="text-blue-400 animate-spin" />
        ) : (
          <Upload size={12} className="text-green-400" />
        )}
        <span>{completedItems}/{totalItems}</span>
        {failed > 0 && (
          <span className="text-red-400">({failed} failed)</span>
        )}
        {open ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
      </button>

      {/* Dropdown list */}
      {open && (
        <div className="absolute right-0 top-full mt-1.5 w-80 max-h-72 overflow-y-auto rounded-xl border border-white/10 bg-zinc-900/95 backdrop-blur-md shadow-2xl z-30 animate-in slide-in-from-top-2 fade-in duration-150">
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-white/5">
            <span className="text-[10px] font-bold text-white/60">Uploads</span>
            {canClear && (
              <button
                onClick={() => { onClearCompleted(); setOpen(false); }}
                className="text-[9px] text-white/30 hover:text-white transition-colors"
              >
                Clear all
              </button>
            )}
          </div>

          {/* Items */}
          <div className="divide-y divide-white/5">
            {queue.map((item) => (
              <div key={item.id} className="px-3 py-2 flex items-center gap-2.5">
                {/* Status icon */}
                <div className="shrink-0 w-4 flex items-center justify-center">
                  {item.status === 'queued' && <Loader size={12} className="text-white/20 animate-spin" />}
                  {item.status === 'uploading' && <Loader size={12} className="text-blue-400 animate-spin" />}
                  {item.status === 'done' && <CheckCircle2 size={12} className="text-green-400" />}
                  {item.status === 'failed' && <XCircle size={12} className="text-red-400" />}
                </div>

                {/* Name + size */}
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-semibold text-white/80 truncate">{item.file.name}</p>
                  <p className="text-[9px] text-white/30">{formatSize(item.file.size)}</p>
                </div>

                {/* Uploading progress */}
                {item.status === 'uploading' && (
                  <div className="w-12">
                    <div className="h-1 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-blue-500 transition-all duration-200"
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                    <p className="text-[8px] text-blue-400 font-bold text-right">{item.progress}%</p>
                  </div>
                )}

                {item.status === 'queued' && <span className="text-[9px] text-white/20">Waiting</span>}
                {item.status === 'done' && <span className="text-[9px] text-green-400/60">Done</span>}

                {item.status === 'failed' && (
                  <button
                    onClick={() => onRetry(item.id)}
                    className="p-1 rounded bg-white/5 hover:bg-red-500/20 transition-colors"
                    title="Retry"
                  >
                    <RefreshCw size={10} className="text-red-400" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
