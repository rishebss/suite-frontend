import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '@/components/Input';
import RingLoader from '@/components/ui/RingLoader';
import { useAuth } from '@/context/AuthContext';
import { useInvoiceSchemas } from '../../hooks/useInvoiceSchema';
import { useInvoiceActions } from '../../hooks/useInvoiceActions';

const GST_RATES = [0, 5, 12, 18, 28];
const PAYMENT_METHODS = ['Cash', 'UPI', 'Card', 'Bank Transfer', 'Cheque', 'Other'];

const DEFAULT_FORM = {
  domain: 'travel_agency',
  schema: '',
  client_name: '',
  client_email: '',
  client_address: '',
  client_gstin: '',
  supply_type: 'intra_state',
  place_of_supply: '',
  discount_amount: '0',
  currency: 'INR',
  notes: '',
  due_date: '',
  extra_data: {
    cost_per_adult: '',
    gst_rate: '0',
    payment_method: '',
    advance_amount: '',
    additional_services: [],
  },
  line_items: [],
};

const fmt = (n) =>
  n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const InvoiceForm = ({ invoice = null, onSuccess, onLoadingChange }) => {
  const navigate = useNavigate();
  const isEdit = !!invoice;
  const { user } = useAuth();
  const isAdmin = user?.role === 'Admin' || user?.role === 'Superadmin';

  const { schemas, loading: schemasLoading } = useInvoiceSchemas();
  const { createInvoice, updateInvoice, loading } = useInvoiceActions();

  // Notify parent of loading state changes
  useEffect(() => { onLoadingChange?.(loading); }, [loading]);

  const [form, setForm] = useState(() => {
    if (invoice) {
      return {
        ...DEFAULT_FORM,
        ...invoice,
        schema: invoice.schema?.id || invoice.schema,
        extra_data: {
          ...DEFAULT_FORM.extra_data,
          ...invoice.extra_data,
          additional_services: invoice.extra_data?.additional_services || [],
        },
      };
    }
    return DEFAULT_FORM;
  });

  const [submitError, setSubmitError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (schemas.length > 0 && !form.schema) {
      const ta = schemas.find((s) => s.domain === 'travel_agency') || schemas[0];
      setForm((f) => ({ ...f, domain: ta.domain, schema: ta.id }));
    }
  }, [schemas]);

  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const setExtra = (name, value) =>
    setForm((f) => ({ ...f, extra_data: { ...f.extra_data, [name]: value } }));

  // ---- Additional services helpers ----
  const addService = () =>
    setExtra('additional_services', [
      ...(form.extra_data.additional_services || []),
      { description: '', amount: '' },
    ]);

  const updateService = (idx, field, value) => {
    const updated = [...(form.extra_data.additional_services || [])];
    updated[idx] = { ...updated[idx], [field]: value };
    setExtra('additional_services', updated);
  };

  const removeService = (idx) => {
    const updated = (form.extra_data.additional_services || []).filter((_, i) => i !== idx);
    setExtra('additional_services', updated);
  };

  // ---- Live computed values ----
  const adults       = parseInt(form.extra_data.adults) || 0;
  const children     = parseInt(form.extra_data.children) || 0;
  const totalGuests  = adults + children;
  const costPerAdult = parseFloat(form.extra_data.cost_per_adult) || 0;
  const packageCost  = totalGuests * costPerAdult;

  const additionalTotal = (form.extra_data.additional_services || []).reduce(
    (sum, s) => sum + (parseFloat(s.amount) || 0),
    0,
  );

  const subtotal    = packageCost + additionalTotal;
  const gstRate     = parseFloat(form.extra_data.gst_rate) || 0;
  const gstAmount   = parseFloat(((subtotal * gstRate) / 100).toFixed(2));
  const grandTotal  = subtotal + gstAmount;
  const advance     = parseFloat(form.extra_data.advance_amount) || 0;
  const balance     = grandTotal - advance;

  // ---- Submit ----
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setFieldErrors({});

    // Build line items automatically
    const lineItems = [];
    if (costPerAdult > 0) {
      lineItems.push({
        description: 'Tour Package Cost',
        hsn_sac_code: '',
        quantity: totalGuests || 1,
        unit_price: costPerAdult,
        gst_rate: gstRate,
        order: 0,
      });
    }
    (form.extra_data.additional_services || []).forEach((s, idx) => {
      if (parseFloat(s.amount) > 0) {
        lineItems.push({
          description: s.description || 'Additional Services',
          hsn_sac_code: '',
          quantity: 1,
          unit_price: parseFloat(s.amount),
          gst_rate: 0,
          order: idx + 1,
        });
      }
    });

    if (lineItems.length === 0) {
      setSubmitError('Please enter at least a cost per person.');
      return;
    }

    const payload = {
      ...form,
      due_date: form.due_date || null,
      line_items: lineItems,
      extra_data: {
        ...form.extra_data,
        balance_payable: balance.toFixed(2),
      },
    };

    const result = isEdit
      ? await updateInvoice(invoice.id, payload)
      : await createInvoice(payload);

    if (result.success) {
      if (onSuccess) {
        onSuccess(result.data);
      } else {
        navigate(isAdmin ? `/invoices/${result.data.id}` : '/invoices');
      }
    } else {
      setSubmitError(result.message);
      if (result.errors) setFieldErrors(result.errors);
    }
  };

  if (schemasLoading) {
    return <RingLoader className="py-20" />;
  }

  return (
    <form id="invoice-form" onSubmit={handleSubmit} className="space-y-8">

      {submitError && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
          {submitError}
        </div>
      )}

      {/* ---- Client Details ---- */}
      <div className="bg-white/[0.03] border border-white/10 rounded-xl p-6 space-y-4">
        <h2 className="text-sm font-semibold text-white/80">Client Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Client Name *"
            type="text"
            placeholder="Full name or company"
            value={form.client_name}
            onChange={(e) => set('client_name', e.target.value)}
            required
          />
          <Input
            label="Client Email"
            type="email"
            placeholder="client@email.com"
            value={form.client_email}
            onChange={(e) => set('client_email', e.target.value)}
          />
          <Input
            label="Mobile Number"
            type="tel"
            placeholder="+91 98765 43210"
            value={form.extra_data.client_contact || ''}
            onChange={(e) => setExtra('client_contact', e.target.value)}
          />
          <Input
            label="Booking Reference"
            type="text"
            placeholder="e.g. LKD/2026/15MAY"
            value={form.extra_data.booking_reference || ''}
            onChange={(e) => setExtra('booking_reference', e.target.value)}
          />
          <div className="md:col-span-2">
            <label className="text-xs font-medium text-white/60 block mb-1.5 uppercase tracking-wider">
              Client Address
            </label>
            <textarea
              className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-white/30 focus:bg-white/[0.05] transition-all resize-none"
              rows={2}
              placeholder="Street, City, State, PIN"
              value={form.client_address}
              onChange={(e) => set('client_address', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* ---- Package Details ---- */}
      <div className="bg-white/[0.03] border border-white/10 rounded-xl p-6 space-y-4">
        <h2 className="text-sm font-semibold text-white/80">Package Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="From"
            type="text"
            placeholder="Departure city / airport"
            value={form.extra_data.from_location || ''}
            onChange={(e) => setExtra('from_location', e.target.value)}
          />
          <Input
            label="To (Destination)"
            type="text"
            placeholder="e.g. Lakshadweep"
            value={form.extra_data.destination || ''}
            onChange={(e) => setExtra('destination', e.target.value)}
          />
          <Input
            label="Nights"
            type="number"
            min="0"
            placeholder="3"
            value={form.extra_data.nights || ''}
            onChange={(e) => setExtra('nights', e.target.value)}
          />
          <Input
            label="Days"
            type="number"
            min="0"
            placeholder="4"
            value={form.extra_data.days || ''}
            onChange={(e) => setExtra('days', e.target.value)}
          />
          <Input
            label="Travel Date (From)"
            type="date"
            value={form.extra_data.travel_from || ''}
            onChange={(e) => setExtra('travel_from', e.target.value)}
          />
          <Input
            label="Travel Date (To)"
            type="date"
            value={form.extra_data.travel_to || ''}
            onChange={(e) => setExtra('travel_to', e.target.value)}
          />
          <Input
            label="Adults"
            type="number"
            min="0"
            placeholder="2"
            value={form.extra_data.adults || ''}
            onChange={(e) => setExtra('adults', e.target.value)}
          />
          <Input
            label="Children"
            type="number"
            min="0"
            placeholder="0"
            value={form.extra_data.children || ''}
            onChange={(e) => setExtra('children', e.target.value)}
          />
          <Input
            label="Package Type"
            type="text"
            placeholder="e.g. Deluxe"
            value={form.extra_data.package_type || ''}
            onChange={(e) => setExtra('package_type', e.target.value)}
          />
          <Input
            label="Meal Plan"
            type="text"
            placeholder="e.g. MAPAI (Breakfast & Dinner)"
            value={form.extra_data.meal_plan || ''}
            onChange={(e) => setExtra('meal_plan', e.target.value)}
          />
        </div>
      </div>

      {/* ---- Cost Breakdown ---- */}
      <div className="bg-white/[0.03] border border-white/10 rounded-xl p-6 space-y-4">
        <h2 className="text-sm font-semibold text-white/80">Cost Breakdown</h2>

        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs text-white/40 uppercase tracking-wider">
                <th className="text-left pb-3 pr-4">Particulars</th>
                <th className="text-center pb-3 px-3 w-16">Qty</th>
                <th className="text-right pb-3 px-3 w-36">Rate (₹)</th>
                <th className="text-right pb-3 pl-3 w-36">Amount (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-white/80">

              {/* Tour Package Cost per Adult */}
              <tr>
                <td className="py-3 pr-4">Tour Package Cost</td>
                <td className="py-3 px-3 text-center text-white/50">
                  {totalGuests || <span className="text-white/20">—</span>}
                </td>
                <td className="py-3 px-3">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    className="w-full bg-white/[0.05] border border-white/10 rounded-lg px-3 py-1.5 text-white text-sm text-right focus:outline-none focus:border-white/30"
                    value={form.extra_data.cost_per_adult || ''}
                    onChange={(e) => setExtra('cost_per_adult', e.target.value)}
                  />
                </td>
                <td className="py-3 pl-3 text-right font-medium">
                  {packageCost > 0 ? fmt(packageCost) : <span className="text-white/20">—</span>}
                </td>
              </tr>

              {/* Additional services */}
              {(form.extra_data.additional_services || []).map((svc, idx) => (
                <tr key={idx}>
                  <td className="py-3 pr-4">
                    <input
                      type="text"
                      placeholder="Service description"
                      className="w-full bg-white/[0.05] border border-white/10 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-white/30"
                      value={svc.description}
                      onChange={(e) => updateService(idx, 'description', e.target.value)}
                    />
                  </td>
                  <td className="py-3 px-3 text-center text-white/30">—</td>
                  <td className="py-3 px-3 text-center text-white/30">—</td>
                  <td className="py-3 pl-3 flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      className="w-full bg-white/[0.05] border border-white/10 rounded-lg px-3 py-1.5 text-white text-sm text-right focus:outline-none focus:border-white/30"
                      value={svc.amount}
                      onChange={(e) => updateService(idx, 'amount', e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => removeService(idx)}
                      className="text-red-400/60 hover:text-red-400 text-lg leading-none shrink-0"
                    >
                      ×
                    </button>
                  </td>
                </tr>
              ))}

              {/* Subtotal */}
              <tr className="border-t border-white/10">
                <td colSpan={3} className="py-3 pr-4 font-semibold">Subtotal</td>
                <td className="py-3 pl-3 text-right font-semibold">
                  {subtotal > 0 ? fmt(subtotal) : <span className="text-white/20">—</span>}
                </td>
              </tr>

              {/* GST */}
              <tr>
                <td className="py-3 pr-4 text-white/60">
                  GST
                  <select
                    className="ml-2 bg-white/[0.05] border border-white/10 rounded px-2 py-1 text-white text-xs focus:outline-none focus:border-white/30"
                    value={form.extra_data.gst_rate || '0'}
                    onChange={(e) => setExtra('gst_rate', e.target.value)}
                  >
                    {GST_RATES.map((r) => (
                      <option key={r} value={r} className="bg-gray-900">{r}%</option>
                    ))}
                  </select>
                </td>
                <td colSpan={2} className="py-3 px-3 text-right text-white/40 text-xs">
                  {gstRate > 0 && subtotal > 0 ? `${gstRate}% of ${fmt(subtotal)}` : ''}
                </td>
                <td className="py-3 pl-3 text-right">
                  {gstAmount > 0 ? fmt(gstAmount) : <span className="text-white/20">—</span>}
                </td>
              </tr>

              {/* Grand Total */}
              <tr className="border-t border-white/20 text-white font-bold">
                <td colSpan={3} className="py-3 pr-4">Total Package Value</td>
                <td className="py-3 pl-3 text-right">
                  {grandTotal > 0 ? fmt(grandTotal) : <span className="text-white/20">—</span>}
                </td>
              </tr>

              {/* Advance Amount */}
              <tr>
                <td className="py-3 pr-4">Advance Amount Received</td>
                <td colSpan={2} className="py-3 px-3">
                  <select
                    className="w-full bg-white/[0.05] border border-white/10 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-white/30"
                    value={form.extra_data.payment_method || ''}
                    onChange={(e) => setExtra('payment_method', e.target.value)}
                  >
                    <option value="" className="bg-gray-900">Payment Method</option>
                    {PAYMENT_METHODS.map((m) => (
                      <option key={m} value={m} className="bg-gray-900">{m}</option>
                    ))}
                  </select>
                </td>
                <td className="py-3 pl-3">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    className="w-full bg-white/[0.05] border border-white/10 rounded-lg px-3 py-1.5 text-white text-sm text-right focus:outline-none focus:border-white/30"
                    value={form.extra_data.advance_amount || ''}
                    onChange={(e) => setExtra('advance_amount', e.target.value)}
                  />
                </td>
              </tr>

              {/* Payment Status & Date */}
              <tr>
                <td className="py-3 pr-4 text-white/60">Payment Status</td>
                <td colSpan={2} className="py-3 px-3">
                  <select
                    className="w-full bg-white/[0.05] border border-white/10 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-white/30"
                    value={form.extra_data.payment_status || ''}
                    onChange={(e) => setExtra('payment_status', e.target.value)}
                  >
                    <option value="" className="bg-gray-900">Select status</option>
                    <option value="Advance Paid" className="bg-gray-900">Advance Paid</option>
                    <option value="Fully Paid" className="bg-gray-900">Fully Paid</option>
                    <option value="Pending" className="bg-gray-900">Pending</option>
                  </select>
                </td>
                <td className="py-3 pl-3">
                  <input
                    type="date"
                    className="w-full bg-white/[0.05] border border-white/10 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-white/30"
                    value={form.extra_data.payment_date || ''}
                    onChange={(e) => setExtra('payment_date', e.target.value)}
                  />
                </td>
              </tr>

              {/* Balance Payable */}
              <tr className="border-t border-white/10">
                <td colSpan={3} className="py-3 pr-4 text-white/70">
                  Balance Payable
                  <span className="ml-2 text-white/30 text-xs">(Due 10 Days Before Check-in)</span>
                </td>
                <td className={`py-3 pl-3 text-right font-semibold ${balance > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {grandTotal > 0 ? fmt(balance) : <span className="text-white/20">—</span>}
                </td>
              </tr>

            </tbody>
          </table>
        </div>

        {/* Add additional service row */}
        <button
          type="button"
          onClick={addService}
          className="text-xs text-white/40 hover:text-white/70 border border-dashed border-white/10 hover:border-white/20 rounded-lg px-4 py-2 transition-all w-full"
        >
          + Add Additional Service
        </button>

        {fieldErrors.line_items && (
          <p className="text-xs text-red-400">{fieldErrors.line_items}</p>
        )}
      </div>

      {/* ---- Notes ---- */}
      <div className="bg-white/[0.03] border border-white/10 rounded-xl p-6 space-y-2">
        <label className="text-xs font-medium text-white/60 uppercase tracking-wider">
          Notes (optional)
        </label>
        <textarea
          className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-white/30 focus:bg-white/[0.05] transition-all resize-none"
          rows={3}
          placeholder="Any additional notes for the admin…"
          value={form.notes}
          onChange={(e) => set('notes', e.target.value)}
        />
      </div>

    </form>
  );
};

export default InvoiceForm;
