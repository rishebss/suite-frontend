import React from 'react';
import { formatINR } from '../../utils/gstUtils';

/**
 * Displays the live CGST / SGST / IGST breakdown table.
 * Receives pre-computed totals from useGSTCalculator.
 */
const GSTSummary = ({ totals, supplyType, currency = 'INR' }) => {
  if (!totals) return null;

  const rows = [
    { label: 'Subtotal', value: totals.subtotal, bold: false },
    ...(supplyType === 'intra_state'
      ? [
          { label: 'CGST', value: totals.cgstTotal, bold: false },
          { label: 'SGST', value: totals.sgstTotal, bold: false },
        ]
      : [{ label: 'IGST', value: totals.igstTotal, bold: false }]),
    ...(totals.discountAmount > 0
      ? [{ label: 'Discount', value: -totals.discountAmount, bold: false, negative: true }]
      : []),
  ];

  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4 space-y-2">
      <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3">
        GST Summary
      </h3>

      {rows.map((row) => (
        <div key={row.label} className="flex justify-between text-sm">
          <span className="text-white/60">{row.label}</span>
          <span className={row.negative ? 'text-red-400' : 'text-white/80'}>
            {row.negative ? '−' : ''}{currency} {formatINR(Math.abs(row.value))}
          </span>
        </div>
      ))}

      <div className="border-t border-white/10 pt-2 flex justify-between text-sm font-bold">
        <span className="text-white">Grand Total</span>
        <span className="text-white text-base">{currency} {formatINR(totals.grandTotal)}</span>
      </div>
    </div>
  );
};

export default GSTSummary;
