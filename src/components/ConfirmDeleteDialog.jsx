import React from 'react';
import { createPortal } from 'react-dom';
import { Trash2, Loader2 } from 'lucide-react';

/**
 * Reusable delete confirmation dialog.
 *
 * Props:
 *   isOpen      - boolean
 *   onClose     - () => void
 *   onConfirm   - () => void  (should handle async + loading externally or pass isLoading)
 *   isLoading   - boolean
 *   title       - string  (e.g. "Delete Contact")
 *   description - string  (e.g. "This will permanently remove John Doe.")
 *   progress    - { current, total, phase } | null  — replaces buttons with red progress bar when set
 */
const ConfirmDeleteDialog = ({ isOpen, onClose, onCancel, onConfirm, isLoading = false, isDeleting = false, title = 'Confirm Delete', description = 'This action cannot be undone.', progress = null }) => {
    if (!isOpen) return null;

    const handleCancel = onCancel || onClose;
    const showProgress = progress !== null;

    return createPortal(
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={!(isLoading || isDeleting || showProgress) ? handleCancel : undefined} />
            <div className="relative w-full max-w-sm bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl p-6 flex flex-col gap-5">

                {/* Icon + Text */}
                <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 shrink-0">
                        <Trash2 size={18} />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-white">{title}</h3>
                        <p className="text-xs text-white/40 mt-1 leading-relaxed">{description}</p>
                    </div>
                </div>

                {/* Progress bar */}
                {showProgress ? (
                    <div className="w-full space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] text-white/40">{progress.phase}</span>
                            <span className="text-[10px] font-mono text-white/20">
                                {progress.total > 0 ? `${progress.current} / ${progress.total}` : ''}
                            </span>
                        </div>
                        <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-red-500 rounded-full transition-all duration-300 ease-out"
                                style={{ width: progress.total > 0 ? `${Math.round((progress.current / progress.total) * 100)}%` : '0%' }}
                            />
                        </div>
                    </div>
                ) : (
                    /* Actions */
                    <div className="flex items-center justify-end gap-2">
                        <button
                            onClick={handleCancel}
                            disabled={isLoading || isDeleting}
                            className="px-4 py-2 rounded-lg text-xs text-white/40 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-40"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={isLoading || isDeleting}
                            className="px-4 py-2 rounded-lg text-xs bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors flex items-center gap-2 disabled:opacity-50"
                        >
                            {(isLoading || isDeleting) && <Loader2 size={11} className="animate-spin" />}
                            Delete
                        </button>
                    </div>
                )}
            </div>
        </div>
        , document.body);
};

export default ConfirmDeleteDialog;
