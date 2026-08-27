/**
 * Re-exports calculateInvoiceTotals for use in hooks.
 * Keeps the hooks import path clean: import { recalculate } from '../utils/calculateTotals'
 */
export { calculateInvoiceTotals as recalculate, calculateLineItemGST, formatINR } from './gstUtils';
