import React, { useState } from 'react';
import Button from '@/components/Button';

/**
 * Confirmation modal for approving a pending invoice.
 */
const ApproveModal = ({ invoice, onConfirm, onCancel, loading }) => {
  const [note, setNote] = useState('');

  const handleConfirm = () => onConfirm(invoice.id, note);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md mx-4 bg-black border border-white/10 rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
        <h2 className="text-lg font-bold text-white mb-2">Approve Invoice</h2>
        <p className="text-white/50 text-sm mb-4">
          You are about to approve{' '}
          <span className="text-white font-semibold">{invoice?.invoice_number}</span>.
          A PDF will be generated and the creator will be notified.
        </p>

        <div className="space-y-2 mb-6">
          <label className="text-xs font-medium text-white/60 uppercase tracking-wider">
            Note (optional)
          </label>
          <textarea
            className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-white/30 transition-all resize-none"
            rows={3}
            placeholder="Optional remark to attach to the log…"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        <div className="flex gap-3">
          <Button
            variant="primary"
            className="flex-1 py-2.5"
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? 'Approving…' : 'Approve Invoice'}
          </Button>
          <Button variant="secondary" className="flex-1 py-2.5" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ApproveModal;
