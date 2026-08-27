/**
 * Invoice Module — Public API
 * ===========================
 * Import pages and components from this index to keep import paths clean:
 *
 *   import { InvoiceList, InvoiceDetail, InvoiceForm } from '@/modules/invoice';
 *   import { ReviewDashboard, CompanyProfileAdmin } from '@/modules/invoice';
 */

// Pages / top-level views
export { default as InvoiceList }          from './components/InvoiceList';
export { default as InvoiceDetail }        from './components/InvoiceDetail';
export { default as InvoiceForm }          from './components/InvoiceForm';
export { default as InvoiceCreatePage }    from './pages/InvoiceCreatePage';
export { default as ReviewDashboard }      from './components/AdminPanel/ReviewDashboard';
export { default as CompanyProfileAdmin }  from './components/AdminPanel/CompanyProfile';

// Hooks (re-exported for convenience)
export { useInvoiceList, useInvoiceDetail, useAdminInvoiceList } from './hooks/useInvoice';
export { useInvoiceActions }  from './hooks/useInvoiceActions';
export { useInvoiceSchemas, useInvoiceSchema } from './hooks/useInvoiceSchema';
export { useGSTCalculator }   from './hooks/useGSTCalculator';
export { useCompanyProfile }  from './hooks/useCompanyProfile';

// Utilities
export { calculateLineItemGST, calculateInvoiceTotals, formatINR } from './utils/gstUtils';

// API
export { invoiceApi, schemaApi, companyProfileApi } from './api/invoiceApi';
