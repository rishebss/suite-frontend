import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

/**
 * A custom confirmation modal that replaces window.confirm().
 *
 * Props:
 *   open        - boolean, whether the modal is visible
 *   title       - modal heading (e.g. "Delete collection?")
 *   message     - body text explaining what will happen
 *   confirmLabel - text for the confirm button (default "Delete")
 *   cancelLabel  - text for the cancel button (default "Cancel")
 *   variant     - "danger" | "default" (danger uses red accents)
 *   loading     - show a loading state on the confirm button
 *   onConfirm   - called when the user confirms
 *   onCancel    - called when the user cancels / closes
 */
export default function ConfirmModal({
  open,
  title = 'Are you sure?',
  message = '',
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  variant = 'danger',
  loading = false,
  onConfirm,
  onCancel,
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center"
      onClick={onCancel}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150" />

      {/* Modal */}
      <div
        className="relative w-full max-w-sm mx-4 bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl animate-in zoom-in-95 fade-in duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-1 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/5 transition-colors"
        >
          <X size={16} />
        </button>

        <div className="p-6">
          {/* Icon */}
          <div
            className={`mx-auto mb-4 w-12 h-12 rounded-full flex items-center justify-center ${
              variant === 'danger'
                ? 'bg-red-500/15 text-red-400'
                : 'bg-blue-500/15 text-blue-400'
            }`}
          >
            <AlertTriangle size={24} />
          </div>

          {/* Title */}
          <h3 className="text-center text-base font-bold text-white mb-2">
            {title}
          </h3>

          {/* Message */}
          {message && (
            <p className="text-center text-sm text-white/50 leading-relaxed mb-6">
              {message}
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-2.5">
            <button
              onClick={onCancel}
              disabled={loading}
              className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-sm font-semibold text-white/60 hover:text-white hover:bg-white/5 disabled:opacity-40 transition-all"
            >
              {cancelLabel}
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-40 transition-all ${
                variant === 'danger'
                  ? 'bg-red-500 hover:bg-red-400'
                  : 'bg-blue-500 hover:bg-blue-400'
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {confirmLabel}
                </span>
              ) : (
                confirmLabel
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
