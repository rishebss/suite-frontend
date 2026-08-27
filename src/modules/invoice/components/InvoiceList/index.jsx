import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import StatusBadge from './StatusBadge';
import RingLoader from '@/components/ui/RingLoader';
import { useInvoiceList, useInvoiceStatusCounts } from '../../hooks/useInvoice';
import { useInvoiceActions } from '../../hooks/useInvoiceActions';
import { formatINR } from '../../utils/gstUtils';
import { useAuth } from '@/context/AuthContext';
import ApproveModal from '../AdminPanel/ReviewDashboard/ApproveModal';
import RejectModal from '../AdminPanel/ReviewDashboard/RejectModal';
import { cn } from '@/lib/utils';

const ADMIN_TABS = [
  { label: 'Completed', value: 'completed' },
  { label: 'Approved',  value: 'approved' },
  { label: 'Pending',   value: 'pending' },
  { label: 'Rejected',  value: 'rejected' },
];

const SALES_TABS = [
  { label: 'Completed', value: 'completed' },
  { label: 'Approved',  value: 'approved' },
  { label: 'Pending',   value: 'pending' },
  { label: 'Rejected',  value: 'rejected' },
  { label: 'Draft',     value: 'draft' },
];

const InvoiceList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = ['Superadmin', 'Admin'].includes(user?.role) || user?.is_superuser;
  const TABS = isAdmin ? ADMIN_TABS : SALES_TABS;
  const { counts } = useInvoiceStatusCounts();

  const [activeTab, setActiveTab] = useState('completed');
  const { invoices, count, loading, error, refetch } = useInvoiceList(
    activeTab ? { status: activeTab } : {},
  );
  const { submitInvoice, approveInvoice, rejectInvoice, downloadPDF, loading: actionLoading } = useInvoiceActions();

  const [approveTarget, setApproveTarget] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);

  const handleSubmit = async (invoice) => {
    const result = await submitInvoice(invoice.id);
    if (result.success) refetch();
  };

  const handleApprove = async (id, note) => {
    const result = await approveInvoice(id, note);
    if (result.success) { setApproveTarget(null); refetch(); }
  };

  const handleReject = async (id, admin_remarks, note) => {
    const result = await rejectInvoice(id, admin_remarks, note);
    if (result.success) { setRejectTarget(null); refetch(); }
  };

  const handleDownload = (invoice) => {
    downloadPDF(invoice.id, invoice.invoice_number);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Invoices</h1>
          <p className="text-white/40 text-sm mt-1">{count} invoice{count !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Tabs and Action Button */}
      <div className="flex items-center justify-between">
        <div className="relative flex items-center p-1 bg-white/[0.02] border border-white/20 rounded-md w-fit">
          <div 
            className={cn(
              "absolute inset-y-0 shadow-[0_0_15px_rgba(59,130,246,0.1)] transition-all duration-300 ease-out z-0",
              // Calculate width and position based on TABS length
              TABS.length === 4 
                ? activeTab === TABS[0].value 
                  ? "left-0 w-1/4 rounded-l rounded-r-none bg-blue-500/20" 
                  : activeTab === TABS[1].value
                  ? "left-1/4 w-1/4 bg-blue-500/20"
                  : activeTab === TABS[2].value
                  ? "left-2/4 w-1/4 bg-blue-500/20"
                  : "left-3/4 w-1/4 rounded-r rounded-l-none bg-blue-500/20"
                : TABS.length === 5 
                ? activeTab === TABS[0].value 
                  ? "left-0 w-1/5 rounded-l rounded-r-none bg-blue-500/20" 
                  : activeTab === TABS[1].value
                  ? "left-1/5 w-1/5 bg-blue-500/20"
                  : activeTab === TABS[2].value
                  ? "left-2/5 w-1/5 bg-blue-500/20"
                  : activeTab === TABS[3].value
                  ? "left-3/5 w-1/5 bg-blue-500/20"
                  : "left-4/5 w-1/5 rounded-r rounded-l-none bg-blue-500/20"
                : ""
            )}
          />
          {TABS.map((tab, index) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={cn(
                "relative z-10 px-6 py-1.5 rounded text-[10px] font-medium uppercase tracking-[0.2em] transition-all duration-300 flex items-center gap-2",
                activeTab === tab.value ? "text-blue-400" : "text-white/50 hover:text-white/80"
              )}
            >
              {tab.label}
            {counts[tab.value] !== undefined && (
              <span className={cn(
                "text-xs px-1.5 py-0.5 rounded-full font-semibold transition-colors",
                activeTab === tab.value
                  ? 'bg-white text-black'
                  : 'bg-white/10 text-white/50'
              )}>
                {counts[tab.value]}
              </span>
            )}
            </button>
          ))}
        </div>
        
        <button
          onClick={() => navigate('/invoices/new')}
          className="h-9 w-9 rounded-md bg-zinc-900/50 border border-zinc-800 text-white/40 hover:text-white hover:bg-zinc-800 transition-all flex items-center justify-center group"
          title="Create Invoice"
        >
          <Plus size={16} />
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && <RingLoader className="py-20" />}

      {/* Empty state */}
      {!loading && invoices.length === 0 && (
        <div className="text-center py-20 text-white/30">
          <p className="text-lg">No invoices found.</p>
          <p className="text-sm mt-2">Create your first invoice to get started.</p>
        </div>
      )}

      {/* Card Grid */}
      {!loading && invoices.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {invoices.map((invoice) => (
            <div
              key={invoice.id}
              className="group relative bg-zinc-900/30 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 hover:bg-zinc-900/50 transition-all duration-300 flex flex-col gap-4 overflow-hidden"
            >
              {/* Ambient glow */}
              <div className="absolute -right-8 -top-8 w-24 h-24 bg-blue-500 blur-3xl opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none" />

              {/* Top row */}
              <div className="flex items-start justify-between gap-2">
                <div
                  className="text-white font-semibold text-sm hover:underline cursor-pointer"
                  onClick={() => navigate(`/invoices/${invoice.id}`)}
                >
                  {invoice.invoice_number}
                </div>
                <StatusBadge status={invoice.status} />
              </div>

              {/* Client & domain */}
              <div className="space-y-1">
                <p className="text-white/80 text-sm font-medium truncate">{invoice.client_name}</p>
                <p className="text-white/30 text-xs">{invoice.domain}</p>
              </div>

              {/* Amount */}
              <div className="text-white text-lg font-bold">
                {invoice.currency} {formatINR(invoice.grand_total)}
              </div>

              {/* Date */}
              <p className="text-white/30 text-xs -mt-2">
                {new Date(invoice.created_at).toLocaleDateString('en-IN', {
                  day: '2-digit', month: 'short', year: 'numeric',
                })}
              </p>

              {/* Rejection reason */}
              {invoice.status === 'rejected' && invoice.admin_remarks && (
                <div className="p-2.5 bg-red-500/[0.06] border border-red-500/10 rounded-lg text-xs text-red-400">
                  <span className="font-semibold">Rejected: </span>{invoice.admin_remarks}
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-2 mt-auto pt-2 border-t border-white/[0.06]">
                {invoice.status === 'draft' && (
                  <>
                    <button
                      onClick={() => navigate(`/invoices/${invoice.id}/edit`)}
                      className="text-xs px-3 py-1.5 rounded-lg bg-white/[0.06] border border-white/10 text-white/70 hover:bg-white/[0.10] transition-all"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleSubmit(invoice)}
                      disabled={actionLoading}
                      className="text-xs px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 transition-all disabled:opacity-50"
                    >
                      Submit
                    </button>
                  </>
                )}

                {invoice.status === 'pending' && isAdmin && (
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

                {invoice.status === 'rejected' && (
                  <button
                    onClick={() => navigate(`/invoices/${invoice.id}/edit`)}
                    className="text-xs px-3 py-1.5 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 hover:bg-yellow-500/20 transition-all"
                  >
                    Revise
                  </button>
                )}

                {['approved', 'completed'].includes(invoice.status) && (
                  <button
                    onClick={() => handleDownload(invoice)}
                    disabled={actionLoading}
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 transition-all disabled:opacity-50"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    PDF
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

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

export default InvoiceList;
