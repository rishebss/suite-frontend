import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import InvoiceForm from '../components/InvoiceForm';
import { useInvoiceDetail } from '../hooks/useInvoice';
import RingLoader from '@/components/ui/RingLoader';

const InvoiceEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { invoice, loading, error } = useInvoiceDetail(id);
  const [isSaving, setIsSaving] = useState(false);

  if (loading) {
    return <RingLoader className="py-20" />;
  }

  if (error || !invoice) {
    return (
      <div className="text-center py-20 text-white/40">
        <p>{error || 'Invoice not found.'}</p>
        <button
          onClick={() => navigate('/invoices')}
          className="mt-4 text-sm text-white/60 hover:text-white underline"
        >
          Back to list
        </button>
      </div>
    );
  }

  if (invoice.status !== 'draft' && invoice.status !== 'rejected') {
    return (
      <div className="text-center py-20 text-white/40">
        <p>Only draft or rejected invoices can be edited.</p>
        <button
          onClick={() => navigate(`/invoices/${id}`)}
          className="mt-4 text-sm text-white/60 hover:text-white underline"
        >
          View invoice
        </button>
      </div>
    );
  }

  return (
    <div className="h-full overflow-hidden flex flex-col">
      {/* Header */}
      <div className="px-8 pt-8 pb-4 flex-shrink-0 border-b border-white/10">
        <h1 className="text-2xl font-bold text-white">
          {invoice.status === 'rejected' ? 'Revise Invoice' : 'Edit Invoice'}
        </h1>
        <p className="text-white/40 text-sm mt-1">
          {invoice.status === 'rejected'
            ? 'Update the invoice and resubmit for admin review'
            : `Editing draft — ${invoice.invoice_number}`}
        </p>
        {invoice.status === 'rejected' && invoice.admin_remarks && (
          <div className="mt-4 p-4 bg-red-500/[0.08] border border-red-500/20 rounded-xl text-sm text-red-400">
            <span className="font-semibold">Rejection reason: </span>
            {invoice.admin_remarks}
          </div>
        )}
      </div>

      {/* Scrollable form area */}
      <div className="flex-1 overflow-y-auto min-h-0 px-8 pt-6 pb-4 custom-scrollbar">
        <div className="max-w-4xl mx-auto">
          <InvoiceForm invoice={invoice} onLoadingChange={setIsSaving} />
        </div>
      </div>

      {/* Fixed footer */}
      <div className="shrink-0 border-t border-white/5 bg-black/60 backdrop-blur-xl px-8 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/invoices')}
            className="px-6 py-2.5 bg-zinc-800 border border-zinc-700 text-white/60 hover:text-white rounded-md text-sm font-medium transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="invoice-form"
            disabled={isSaving}
            className="px-8 py-2.5 bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 hover:border-blue-500/50 rounded-md text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Saving…' : invoice.status === 'rejected' ? 'Resubmit' : 'Update Invoice'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvoiceEditPage;
