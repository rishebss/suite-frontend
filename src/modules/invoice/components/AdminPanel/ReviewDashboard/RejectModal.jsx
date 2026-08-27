import React, { useState } from 'react';
import Button from '@/components/Button';

/**
 * Modal for rejecting a pending invoice — admin remarks are required.
 */
const RejectModal = ({ invoice, onConfirm, onCancel, loading }) => {
  const [remarks, setRemarks] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  const handleConfirm = () => {
    if (!remarks || remarks.trim().length < 5) {
      setError('Admin remarks must be at least 5 characters.');
      return;
    }
    setError('');
    onConfirm(invoice.id, remarks.trim(), note);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md mx-4 bg-black border border-red-500/20 rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
        <h2 className="text-lg font-bold text-white mb-2">Reject Invoice</h2>
        <p className="text-white/50 text-sm mb-4">
          Rejecting{' '}
          <span className="text-white font-semibold">{invoice?.invoice_number}</span>.
          The creator will be notified with your remarks and can revise and resubmit.
        </p>

        <div className="space-y-4 mb-6">
          <div className="space-y-2">
            <label className="text-xs font-medium text-white/60 uppercase tracking-wider">
              Admin Remarks * (shown to creator)
            </label>
            <textarea
              className="w-full bg-red-500/[0.05] border border-red-500/20 rounded-lg px-4 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-red-500/40 transition-all resize-none"
              rows={3}
              placeholder="Explain what needs to be changed…"
              value={remarks}
              onChange={(e) => { setRemarks(e.target.value); setError(''); }}
            />
            {error && <p className="text-xs text-red-400">{error}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-white/60 uppercase tracking-wider">
              Internal Note (optional, not shown to creator)
            </label>
            <textarea
              className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-white/30 transition-all resize-none"
              rows={2}
              placeholder="Optional internal remark…"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            variant="secondary"
            className="flex-1 py-2.5 border-red-500/30 text-red-400 hover:bg-red-500/10"
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? 'Rejecting…' : 'Reject Invoice'}
          </Button>
          <Button variant="secondary" className="flex-1 py-2.5" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RejectModal;
