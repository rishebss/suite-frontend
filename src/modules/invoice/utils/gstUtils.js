/**
 * Client-side GST calculator — mirrors the backend gst_calculator.py logic exactly.
 * Used for live preview in InvoiceForm before submission.
 */

/**
 * Calculate GST breakdown for a single line item.
 * @param {number} amount      - base amount (quantity × unitPrice)
 * @param {number} gstRate     - 0 | 5 | 12 | 18 | 28
 * @param {string} supplyType  - 'intra_state' | 'inter_state'
 * @returns {{ cgstAmount, sgstAmount, igstAmount, lineTotal }}
 */
export function calculateLineItemGST(amount, gstRate, supplyType) {
  const base = parseFloat(amount) || 0;
  const rate = parseFloat(gstRate) || 0;

  let cgstAmount = 0;
  let sgstAmount = 0;
  let igstAmount = 0;

  if (supplyType === 'intra_state') {
    const halfRate = rate / 2 / 100;
    cgstAmount = round2(base * halfRate);
    sgstAmount = round2(base * halfRate);
  } else {
    igstAmount = round2(base * (rate / 100));
  }

  const lineTotal = round2(base + cgstAmount + sgstAmount + igstAmount);

  return { cgstAmount, sgstAmount, igstAmount, lineTotal };
}

/**
 * Aggregate invoice-level totals from line item form rows.
 * @param {Array}  lineItems     - array of { quantity, unitPrice, gstRate }
 * @param {string} supplyType    - 'intra_state' | 'inter_state'
 * @param {number} discountAmount
 * @returns {{ subtotal, cgstTotal, sgstTotal, igstTotal, totalTax, discountAmount, grandTotal }}
 */
export function calculateInvoiceTotals(lineItems, supplyType, discountAmount = 0) {
  let subtotal = 0;
  let cgstTotal = 0;
  let sgstTotal = 0;
  let igstTotal = 0;

  lineItems.forEach((item) => {
    const qty = parseFloat(item.quantity) || 0;
    const price = parseFloat(item.unitPrice || item.unit_price) || 0;
    const amount = round2(qty * price);
    const gst = calculateLineItemGST(amount, item.gstRate ?? item.gst_rate ?? 18, supplyType);

    subtotal += amount;
    cgstTotal += gst.cgstAmount;
    sgstTotal += gst.sgstAmount;
    igstTotal += gst.igstAmount;
  });

  const discount = parseFloat(discountAmount) || 0;
  const totalTax = round2(cgstTotal + sgstTotal + igstTotal);
  const grandTotal = round2(subtotal + totalTax - discount);

  return {
    subtotal: round2(subtotal),
    cgstTotal: round2(cgstTotal),
    sgstTotal: round2(sgstTotal),
    igstTotal: round2(igstTotal),
    totalTax,
    discountAmount: round2(discount),
    grandTotal,
  };
}

/** Format number as Indian currency string */
export function formatINR(value) {
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(parseFloat(value) || 0);
}

function round2(n) {
  return Math.round(n * 100) / 100;
}
