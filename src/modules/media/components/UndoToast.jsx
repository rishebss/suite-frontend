import React, { useEffect, useState, useRef } from 'react';
import { RotateCcw, X } from 'lucide-react';

const UNDO_WINDOW_SECONDS = 15;

/**
 * Undo toast that appears after a soft-delete.
 * Auto-dismisses after UNDO_WINDOW_SECONDS or on manual close.
 *
 * Props:
 *   itemName  - name of the deleted item
 *   itemType  - 'asset' | 'collection'
 *   onUndo    - called when user clicks undo
 *   onDismiss - called when toast expires or is dismissed
 */
export default function UndoToast({ itemName, itemType, onUndo, onDismiss }) {
  const [countdown, setCountdown] = useState(UNDO_WINDOW_SECONDS);
  const timerRef = useRef(null);
  const hasActioned = useRef(false);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          if (!hasActioned.current) {
            hasActioned.current = true;
            onDismiss?.();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [onDismiss]);

  const handleUndo = () => {
    if (hasActioned.current) return;
    hasActioned.current = true;
    clearInterval(timerRef.current);
    onUndo?.();
  };

  const handleDismiss = () => {
    if (hasActioned.current) return;
    hasActioned.current = true;
    clearInterval(timerRef.current);
    onDismiss?.();
  };

  return (
    <div className="fixed top-6 right-6 z-[60] animate-in slide-in-from-right-5 fade-in duration-300">
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-zinc-900 border border-white/10 shadow-2xl backdrop-blur-md">
        {/* Text */}
        <div className="flex flex-col">
          <p className="text-xs font-bold text-white/80">
            <span className="capitalize">{itemType}</span> deleted
          </p>
          <p className="text-[10px] text-white/30 font-medium truncate max-w-[180px]">
            {itemName}
          </p>
        </div>

        {/* Undo button */}
        <button
          onClick={handleUndo}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/15 border border-blue-500/30 text-blue-400 text-[10px] font-bold hover:bg-blue-500/25 transition-all shrink-0"
        >
          <RotateCcw size={12} />
          Undo
        </button>

        {/* Countdown */}
        <span className="text-[10px] text-white/20 font-mono w-5 text-center shrink-0">
          {countdown}s
        </span>

        {/* Close */}
        <button
          onClick={handleDismiss}
          className="p-1 rounded-md text-white/20 hover:text-white/50 hover:bg-white/5 transition-all"
        >
          <X size={12} />
        </button>
      </div>
    </div>
  );
}
