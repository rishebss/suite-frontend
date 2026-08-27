import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import StatusBadge from '../InvoiceList/StatusBadge';
import RingLoader from '@/components/ui/RingLoader';
import Button from '@/components/Button';
import { useAuth } from '@/context/AuthContext';
import { useInvoiceDetail } from '../../hooks/useInvoice';
import { useInvoiceActions } from '../../hooks/useInvoiceActions';
import { useCompanyProfile } from '../../hooks/useCompanyProfile';

const InvoiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = ['Superadmin', 'Admin'].includes(user?.role) || user?.is_superuser;

  const { invoice, loading, error, refetch } = useInvoiceDetail(id);
  const { submitInvoice, downloadPDF, loading: actionLoading } = useInvoiceActions();
  const { profile } = useCompanyProfile();

  if (loading) {
    return <RingLoader className="py-20" />;
  }

  if (error || !invoice) {
    return (
      <div className="text-center py-20 text-white/40">
        <p>{error || 'Invoice not found.'}</p>
        <button onClick={() => navigate('/invoices')} className="mt-4 text-sm text-white/60 hover:text-white underline">
          Back to list
        </button>
      </div>
    );
  }

  const handleSubmit = async () => {
    const result = await submitInvoice(invoice.id);
    if (result.success) refetch();
  };

  const ex = invoice.extra_data || {};

  const packageCost = (invoice.line_items || []).find(
    (li) => li.description === 'Tour Package Cost per Adult',
  );
  const additionalItems = (invoice.line_items || []).filter(
    (li) => li.description !== 'Tour Package Cost per Adult',
  );

  const fmtDate = (d) =>
    d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) : '—';

  const fmtNum = (n) =>
    n != null && n !== '' && !isNaN(n)
      ? Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : '—';

  const signatureUrl = profile?.signature_url;
  const sealUrl = profile?.seal_url;

  return (
    <div className="max-w-4xl mx-auto space-y-4">

      {/* ---- Action bar ---- */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/invoices')} className="text-white/40 hover:text-white text-sm">
            ← Back
          </button>
          <StatusBadge status={invoice.status} />
        </div>
        <div className="flex gap-3 items-center">
          {invoice.status === 'draft' && (
            <>
              <Button variant="secondary" className="!w-auto" onClick={() => navigate(`/invoices/${invoice.id}/edit`)}>
                Edit
              </Button>
              <Button variant="primary" className="!w-auto" disabled={actionLoading} onClick={handleSubmit}>
                Submit for Review
              </Button>
            </>
          )}
          {invoice.pdf_url && (
            <Button variant="primary" className="!w-auto" disabled={actionLoading}
              onClick={() => downloadPDF(invoice.id, invoice.invoice_number)}>
              Download PDF
            </Button>
          )}
        </div>
      </div>

      {invoice.status === 'rejected' && invoice.admin_remarks && (
        <div className="p-4 bg-red-500/[0.08] border border-red-500/20 rounded-xl text-sm text-red-400">
          <span className="font-semibold">Rejection Reason: </span>{invoice.admin_remarks}
        </div>
      )}

      {/* ---- Invoice paper ---- */}
      <div className="bg-white rounded-xl overflow-hidden text-gray-800 text-sm shadow-2xl">

        {/* Header */}
        <div className="bg-[#1B2B6B] text-white text-center py-6 px-4">
          <div className="text-2xl font-bold">{invoice.supplier_name || 'Company Name'}</div>
        </div>

        {/* Address bar */}
        {invoice.supplier_address && (
          <div className="px-6 py-3 text-xs text-gray-600 border-b border-gray-200">
            Registered Address: {invoice.supplier_address}
          </div>
        )}

        <div className="px-6 pb-6 space-y-0">

          {/* Invoice Details */}
          <SectionHeader title="Invoice Details" />
          <table className="w-full border-collapse">
            <tbody>
              <InfoRow label="Invoice No." value={invoice.invoice_number} />
              <InfoRow label="Invoice Date" value={fmtDate(invoice.created_at)} />
              <InfoRow label="Payment Status" value={ex.payment_status || '—'} />
              <InfoRow label="Payment Date" value={ex.payment_date ? fmtDate(ex.payment_date) : '—'} />
              <InfoRow label="Mode of Payment" value={ex.payment_method || '—'} />
            </tbody>
          </table>

          {/* Client Details */}
          <SectionHeader title="Client Details" />
          <table className="w-full border-collapse">
            <tbody>
              <InfoRow label="Client Name" value={invoice.client_name} />
              <InfoRow label="Email" value={invoice.client_email || '—'} />
              <InfoRow label="Contact No." value={ex.client_contact || '—'} />
              <InfoRow label="Booking Reference" value={ex.booking_reference || '—'} />
            </tbody>
          </table>

          {/* Booking Summary */}
          <SectionHeader title="Booking Summary" />
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-white">
                {['Destination', 'Duration', 'Travel Dates', 'Guests', 'Package Type', 'Meal Plan'].map((h) => (
                  <th key={h} className="border border-gray-300 px-3 py-2 text-center text-xs font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-300 px-3 py-2 text-center text-xs">
                  {ex.from_location ? `${ex.from_location} → ` : ''}{ex.destination || '—'}
                </td>
                <td className="border border-gray-300 px-3 py-2 text-center text-xs">
                  {ex.nights ? `${ex.nights} Nights / ${ex.days} Days` : '—'}
                </td>
                <td className="border border-gray-300 px-3 py-2 text-center text-xs">
                  {ex.travel_from ? `${ex.travel_from}${ex.travel_to ? ` – ${ex.travel_to}` : ''}` : '—'}
                </td>
                <td className="border border-gray-300 px-3 py-2 text-center text-xs">
                  {ex.adults ? `${ex.adults} Adult${ex.children ? `, ${ex.children} Child` : ''}` : '—'}
                </td>
                <td className="border border-gray-300 px-3 py-2 text-center text-xs">{ex.package_type || '—'}</td>
                <td className="border border-gray-300 px-3 py-2 text-center text-xs">{ex.meal_plan || '—'}</td>
              </tr>
            </tbody>
          </table>

          {/* Cost Breakdown */}
          <SectionHeader title="Cost Breakdown" />
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-white">
                <th className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold">Particulars</th>
                <th className="border border-gray-300 px-3 py-2 text-center text-xs font-semibold w-16">Qty</th>
                <th className="border border-gray-300 px-3 py-2 text-right text-xs font-semibold w-28">Rate (INR)</th>
                <th className="border border-gray-300 px-3 py-2 text-right text-xs font-semibold w-28">Amount (INR)</th>
              </tr>
            </thead>
            <tbody>
              {packageCost && (
                <tr>
                  <td className="border border-gray-300 px-3 py-2 text-xs">Tour Package Cost per Adult</td>
                  <td className="border border-gray-300 px-3 py-2 text-center text-xs">{packageCost.quantity}</td>
                  <td className="border border-gray-300 px-3 py-2 text-right text-xs">{fmtNum(packageCost.unit_price)}</td>
                  <td className="border border-gray-300 px-3 py-2 text-right text-xs">{fmtNum(packageCost.amount)}</td>
                </tr>
              )}
              {additionalItems.map((item, idx) => (
                <tr key={idx}>
                  <td className="border border-gray-300 px-3 py-2 text-xs">{item.description}</td>
                  <td className="border border-gray-300 px-3 py-2 text-center text-xs">—</td>
                  <td className="border border-gray-300 px-3 py-2 text-right text-xs">—</td>
                  <td className="border border-gray-300 px-3 py-2 text-right text-xs">{fmtNum(item.amount)}</td>
                </tr>
              ))}
              {!packageCost && additionalItems.length === 0 && (
                <tr>
                  <td className="border border-gray-300 px-3 py-2 text-xs">Additional Services (if any)</td>
                  <td className="border border-gray-300 px-3 py-2 text-center text-xs">—</td>
                  <td className="border border-gray-300 px-3 py-2 text-center text-xs">—</td>
                  <td className="border border-gray-300 px-3 py-2 text-right text-xs">—</td>
                </tr>
              )}
              <SummaryRow label="Total Package Value" value={fmtNum(invoice.grand_total)} />
              <SummaryRow label="Advance Amount Received" value={fmtNum(ex.advance_amount)} />
              <SummaryRow label="Balance Payable (Due 10 Days Before Check-in)" value={fmtNum(ex.balance_payable)} />
            </tbody>
          </table>

          {/* Terms & Notes */}
          <SectionHeader title="Terms & Notes" />
          <div className="border border-gray-300 text-xs text-gray-700 divide-y divide-gray-200">
            <div className="px-3 py-2">- Advance payment confirms the booking.</div>
            {ex.balance_payable && (
              <div className="px-3 py-2">
                - Balance payment of Rs.{ex.balance_payable} is due 10 days before check-in.
              </div>
            )}
            <div className="px-3 py-2">- Package once confirmed is non-refundable as per the company cancellation policy.</div>
            <div className="px-3 py-2">- Any change in travel dates or number of guests is subject to availability and price revision.</div>
            <div className="px-3 py-2">- All communication and receipts are issued under {invoice.supplier_name || 'the company'}.</div>
          </div>

          {/* Signatory block */}
          <div className="mt-8 flex justify-end">
            <div className="text-center w-52">
              <p className="text-xs text-gray-500 mb-3">Authorised Signatory</p>

              {/* Signature image */}
              {signatureUrl && (
                <div className="h-14 flex items-end justify-center mb-2">
                  <img
                    src={signatureUrl}
                    alt="Digital Signature"
                    className="max-h-14 max-w-[200px] object-contain"
                  />
                </div>
              )}

              {/* Seal */}
              {sealUrl && (
                <div className="flex justify-center mb-2">
                  <img
                    src={sealUrl}
                    alt="Company Seal"
                    className="h-16 w-16 object-contain"
                  />
                </div>
              )}

              <p className="text-xs text-gray-500 mt-1">(Seal &amp; Signature)</p>
              <p className="text-xs font-semibold text-gray-700 mt-1">
                For {invoice.supplier_name || 'the company'}
              </p>

            </div>
          </div>

        </div>
      </div>

      {/* Status history */}
      {invoice.status_logs?.length > 0 && (
        <div className="bg-white/[0.03] border border-white/10 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white/70 mb-4">Status History</h3>
          <div className="space-y-3">
            {invoice.status_logs.map((log) => (
              <div key={log.id} className="flex items-start gap-3 text-sm">
                <div className="w-2 h-2 rounded-full bg-white/30 mt-1.5 shrink-0" />
                <div>
                  <span className="text-white/70">
                    {log.from_status ? `${log.from_status} → ` : ''}{log.to_status}
                  </span>
                  {log.note && <span className="text-white/40"> — {log.note}</span>}
                  <p className="text-white/30 text-xs mt-0.5">
                    {log.actor?.email} · {new Date(log.created_at).toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

const SectionHeader = ({ title }) => (
  <div className="bg-[#F0A500] text-gray-900 font-bold text-xs text-center py-2 px-3 uppercase tracking-wider mt-4 mb-0">
    {title}
  </div>
);

const InfoRow = ({ label, value }) => (
  <tr>
    <td className="border border-gray-300 px-3 py-2 text-xs text-gray-500 w-2/5">{label}</td>
    <td className="border border-gray-300 px-3 py-2 text-xs text-gray-800">{value}</td>
  </tr>
);

const SummaryRow = ({ label, value }) => (
  <tr>
    <td colSpan={3} className="border border-gray-300 px-3 py-2 text-xs font-semibold">{label}</td>
    <td className="border border-gray-300 px-3 py-2 text-right text-xs font-semibold">{value}</td>
  </tr>
);

export default InvoiceDetail;
