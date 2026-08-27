import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StatusBadge from '../../InvoiceList/StatusBadge';
import RingLoader from '@/components/ui/RingLoader';
import ApproveModal from './ApproveModal';
import RejectModal from './RejectModal';
import { useAdminInvoiceList } from '../../../hooks/useInvoice';
import { useInvoiceActions } from '../../../hooks/useInvoiceActions';
import { formatINR } from '../../../utils/gstUtils';

/**
 * Admin dashboard for reviewing pending invoices and managing all invoices.
 */
const ReviewDashboard = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({ status: 'pending', domain: '' });
  const { invoices, loading, error, refetch } = useAdminInvoiceList(
    Object.fromEntries(Object.entries(filters).filter(([, v]) => v)),
  );
  const { approveInvoice, rejectInvoice, downloadPDF, loading: actionLoading } = useInvoiceActions();

  const [approveTarget, setApproveTarget] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);

  const handleApprove = async (id, note) => {
    const result = await approveInvoice(id, note);
    if (result.success) {
      setApproveTarget(null);
      refetch();
    }
  };

  const handleReject = async (id, admin_remarks, note) => {
    const result = await rejectInvoice(id, admin_remarks, note);
    if (result.success) {
      setRejectTarget(null);
      refetch();
    }
  };

  const pendingCount = invoices.filter((inv) => inv.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Invoice Review Dashboard</h1>
        <p className="text-white/40 text-sm mt-1">
          {pendingCount > 0
            ? `${pendingCount} invoice${pendingCount !== 1 ? 's' : ''} awaiting review`
            : 'No invoices pending review'}
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <select
          className="bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-sm text-white/70 focus:outline-none focus:border-white/30 transition-all"
          value={filters.status}
          onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
        >
          <option value="" className="bg-gray-900">All Statuses</option>
          <option value="pending" className="bg-gray-900">Pending</option>
          <option value="approved" className="bg-gray-900">Approved</option>
          <option value="rejected" className="bg-gray-900">Rejected</option>
          <option value="completed" className="bg-gray-900">Completed</option>
          <option value="draft" className="bg-gray-900">Draft</option>
        </select>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && <RingLoader className="py-20" />}

      {/* Empty */}
      {!loading && invoices.length === 0 && (
        <div className="text-center py-20 text-white/30">
          <p>No invoices found for the selected filter.</p>
        </div>
      )}

      {/* Invoice cards */}
      {!loading && (
        <div className="space-y-4">
          {invoices.map((invoice) => {
            const creator = invoice.created_by;
            const creatorName = creator
              ? `${creator.first_name} ${creator.last_name}`.trim() || creator.email
              : '—';
            return (
              <div
                key={invoice.id}
                className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 hover:bg-white/[0.05] transition-all space-y-4"
              >
                {/* Top row: number + status + amount + actions */}
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <span
                        className="text-white font-semibold text-sm hover:underline cursor-pointer"
                        onClick={() => navigate(`/invoices/${invoice.id}`)}
                      >
                        {invoice.invoice_number}
                      </span>
                      <StatusBadge status={invoice.status} />
                    </div>
                    <p className="text-white/60 text-sm">{invoice.client_name}</p>
                    <p className="text-white/30 text-xs">
                      {invoice.domain} ·{' '}
                      {new Date(invoice.created_at).toLocaleDateString('en-IN', {
                        day: '2-digit', month: 'short', year: 'numeric',
                      })}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-white font-semibold">
                      {invoice.currency} {formatINR(invoice.grand_total)}
                    </span>
                    <button
                      onClick={() => navigate(`/invoices/${invoice.id}`)}
                      className="text-xs px-3 py-1.5 rounded-lg bg-white/[0.06] border border-white/10 text-white/70 hover:bg-white/[0.10] transition-all"
                    >
                      View
                    </button>
                    {(invoice.status === 'approved' || invoice.status === 'completed') && invoice.pdf_url && (
                      <button
                        onClick={() => downloadPDF(invoice.id, invoice.invoice_number)}
                        disabled={actionLoading}
                        className="text-xs px-3 py-1.5 rounded-lg bg-blue-500/15 border border-blue-500/30 text-blue-400 hover:bg-blue-500/25 transition-all disabled:opacity-50"
                      >
                        Download PDF
                      </button>
                    )}
                    {invoice.status === 'pending' && (
                      <>
                        <button
                          onClick={() => setApproveTarget(invoice)}
                          className="text-xs px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/20 transition-all"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => setRejectTarget(invoice)}
                          className="text-xs px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all"
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Creator info */}
                <div className="pt-3 border-t border-white/[0.06] flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/70 text-xs font-semibold shrink-0">
                    {creatorName.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-white/80 text-xs font-medium">{creatorName}</p>
                    <p className="text-white/40 text-xs truncate">{creator?.email}</p>
                  </div>
                  {creator?.role && (
                    <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-white/[0.06] border border-white/10 text-white/50 shrink-0">
                      {creator.role}
                    </span>
                  )}
                  {creator?.department?.name && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-white/[0.06] border border-white/10 text-white/50 shrink-0">
                      {creator.department.name}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      {approveTarget && (
        <ApproveModal
          invoice={approveTarget}
          onConfirm={handleApprove}
          onCancel={() => setApproveTarget(null)}
          loading={actionLoading}
        />
      )}
      {rejectTarget && (
        <RejectModal
          invoice={rejectTarget}
          onConfirm={handleReject}
          onCancel={() => setRejectTarget(null)}
          loading={actionLoading}
        />
      )}
    </div>
  );
};

export default ReviewDashboard;
