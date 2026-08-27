import { useMemo } from 'react';
import { calculateInvoiceTotals, calculateLineItemGST } from '../utils/gstUtils';

/**
 * Live GST calculator hook — re-runs on every line item or supply type change.
 * Returns pre-computed totals for display in GSTSummary without extra state.
 *
 * @param {Array}  lineItems     - current line item form rows
 * @param {string} supplyType    - 'intra_state' | 'inter_state'
 * @param {number} discountAmount
 */
export function useGSTCalculator(lineItems, supplyType, discountAmount = 0) {
  const totals = useMemo(
    () => calculateInvoiceTotals(lineItems || [], supplyType || 'intra_state', discountAmount),
    [lineItems, supplyType, discountAmount],
  );

  /**
   * Get GST breakdown for a single line item (for inline table display).
   */
  const getLineGST = (amount, gstRate) =>
    calculateLineItemGST(amount, gstRate, supplyType || 'intra_state');

  return { totals, getLineGST };
}
