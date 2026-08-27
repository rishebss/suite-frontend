/**
 * Invoice module type definitions (JSDoc).
 * Used for IDE hints and documentation — no runtime effect.
 *
 * @typedef {'draft'|'pending'|'approved'|'rejected'|'completed'} InvoiceStatus
 * @typedef {'intra_state'|'inter_state'} SupplyType
 *
 * @typedef {Object} InvoiceSchema
 * @property {string} id
 * @property {string} domain         — e.g. 'travel_agency'
 * @property {string} label          — e.g. 'Travel Agency'
 * @property {string} prefix         — e.g. 'TRV'
 * @property {Array}  extra_fields   — dynamic field definitions
 * @property {string} pdf_template
 * @property {boolean} is_active
 *
 * @typedef {Object} ExtraFieldDef
 * @property {string}  name
 * @property {string}  label
 * @property {'text'|'date'|'number'|'email'} type
 * @property {boolean} required
 *
 * @typedef {Object} LineItem
 * @property {string} description
 * @property {string} hsn_sac_code
 * @property {number} quantity
 * @property {number} unit_price
 * @property {number} gst_rate        — 0 | 5 | 12 | 18 | 28
 * @property {number} [order]
 *
 * @typedef {Object} Invoice
 * @property {string} id
 * @property {string} invoice_number
 * @property {string} domain
 * @property {InvoiceStatus} status
 * @property {SupplyType} supply_type
 * @property {string} client_name
 * @property {string} client_email
 * @property {string} client_address
 * @property {string} client_gstin
 * @property {string} place_of_supply
 * @property {number} subtotal
 * @property {number} cgst_total
 * @property {number} sgst_total
 * @property {number} igst_total
 * @property {number} total_tax
 * @property {number} discount_amount
 * @property {number} grand_total
 * @property {string} currency
 * @property {Object} extra_data
 * @property {string} notes
 * @property {string} admin_remarks
 * @property {string|null} pdf_url
 * @property {string|null} due_date
 * @property {LineItem[]} line_items
 *
 * @typedef {Object} CompanyProfile
 * @property {string} id
 * @property {string} company_name
 * @property {string} company_address
 * @property {string} gstin
 * @property {string} state
 * @property {string} state_code
 * @property {string|null} logo_url
 * @property {string|null} signature_url
 * @property {string|null} seal_url
 */

export const GST_RATES = [0, 5, 12, 18, 28];

export const SUPPLY_TYPES = [
  { value: 'intra_state', label: 'Intra-State (CGST + SGST)' },
  { value: 'inter_state', label: 'Inter-State (IGST)' },
];

export const STATUS_LABELS = {
  draft: 'Draft',
  pending: 'Pending Approval',
  approved: 'Approved',
  rejected: 'Rejected',
  completed: 'Completed',
};
