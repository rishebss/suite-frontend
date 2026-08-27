import React from 'react';
import { GST_RATES } from '../../types/invoice.types';
import { calculateLineItemGST, formatINR } from '../../utils/gstUtils';

const EMPTY_ITEM = () => ({
  description: '',
  hsn_sac_code: '',
  quantity: '',
  unit_price: '',
  gst_rate: 18,
});

/**
 * Table for adding / editing / removing invoice line items.
 * Computes and displays per-row GST breakdown live.
 *
 * @param {Array}    items       - current line items array
 * @param {Function} onChange    - (items) => void
 * @param {string}   supplyType  - 'intra_state' | 'inter_state'
 */
const LineItemsTable = ({ items = [], onChange, supplyType = 'intra_state' }) => {
  const update = (index, field, value) => {
    const updated = items.map((item, i) =>
      i === index ? { ...item, [field]: value } : item,
    );
    onChange(updated);
  };

  const addItem = () => onChange([...items, EMPTY_ITEM()]);

  const removeItem = (index) => {
    if (items.length === 1) return; // always keep at least one row
    onChange(items.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider">
          Line Items
        </h3>
        <button
          type="button"
          onClick={addItem}
          className="text-xs px-3 py-1.5 rounded-lg bg-white/[0.06] border border-white/10 text-white/70 hover:bg-white/[0.10] hover:text-white transition-all"
        >
          + Add Item
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-white/40 text-xs uppercase tracking-wider">
              <th className="text-left pb-3 pr-3 font-medium">Description</th>
              <th className="text-left pb-3 pr-3 font-medium w-28">HSN/SAC</th>
              <th className="text-right pb-3 pr-3 font-medium w-20">Qty</th>
              <th className="text-right pb-3 pr-3 font-medium w-28">Rate (₹)</th>
              <th className="text-right pb-3 pr-3 font-medium w-24">GST %</th>
              <th className="text-right pb-3 pr-3 font-medium w-28">Amt (₹)</th>
              <th className="text-right pb-3 font-medium w-28">Total (₹)</th>
              <th className="pb-3 w-8"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.05]">
            {items.map((item, idx) => {
              const qty = parseFloat(item.quantity) || 0;
              const price = parseFloat(item.unit_price) || 0;
              const amount = Math.round(qty * price * 100) / 100;
              const gst = calculateLineItemGST(amount, item.gst_rate, supplyType);

              return (
                <tr key={idx} className="group">
                  <td className="py-2 pr-3">
                    <input
                      type="text"
                      className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-white/20 focus:outline-none focus:border-white/30 focus:bg-white/[0.06] transition-all"
                      placeholder="Service description"
                      value={item.description}
                      onChange={(e) => update(idx, 'description', e.target.value)}
                      required
                    />
                  </td>
                  <td className="py-2 pr-3">
                    <input
                      type="text"
                      className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-white/20 focus:outline-none focus:border-white/30 transition-all"
                      placeholder="e.g. 9999"
                      value={item.hsn_sac_code}
                      onChange={(e) => update(idx, 'hsn_sac_code', e.target.value)}
                    />
                  </td>
                  <td className="py-2 pr-3">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-white text-sm text-right placeholder-white/20 focus:outline-none focus:border-white/30 transition-all"
                      placeholder="1"
                      value={item.quantity}
                      onChange={(e) => update(idx, 'quantity', e.target.value)}
                      required
                    />
                  </td>
                  <td className="py-2 pr-3">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-white text-sm text-right placeholder-white/20 focus:outline-none focus:border-white/30 transition-all"
                      placeholder="0.00"
                      value={item.unit_price}
                      onChange={(e) => update(idx, 'unit_price', e.target.value)}
                      required
                    />
                  </td>
                  <td className="py-2 pr-3">
                    <select
                      className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-white/30 transition-all"
                      value={item.gst_rate}
                      onChange={(e) => update(idx, 'gst_rate', parseInt(e.target.value))}
                    >
                      {GST_RATES.map((r) => (
                        <option key={r} value={r} className="bg-gray-900">
                          {r}%
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="py-2 pr-3 text-right text-white/70">
                    {formatINR(amount)}
                  </td>
                  <td className="py-2 pr-3 text-right">
                    <span className="text-white font-medium">{formatINR(gst.lineTotal)}</span>
                    {amount > 0 && (
                      <div className="text-xs text-white/30 mt-0.5">
                        {supplyType === 'intra_state'
                          ? `C+S: ${formatINR(gst.cgstAmount + gst.sgstAmount)}`
                          : `IGST: ${formatINR(gst.igstAmount)}`}
                      </div>
                    )}
                  </td>
                  <td className="py-2">
                    <button
                      type="button"
                      onClick={() => removeItem(idx)}
                      disabled={items.length === 1}
                      className="text-white/20 hover:text-red-400 transition-colors disabled:opacity-20 disabled:cursor-not-allowed text-lg leading-none"
                      title="Remove item"
                    >
                      ×
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export { EMPTY_ITEM };
export default LineItemsTable;
