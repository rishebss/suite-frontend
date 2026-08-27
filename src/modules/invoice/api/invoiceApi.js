/**
 * Invoice API layer — all HTTP calls go through axios (pre-configured in AuthContext).
 * Base URL and credentials (withCredentials, CSRF) are set globally by AuthContext.
 */
import axios from 'axios';

const BASE = '/api/invoices';
const SCHEMA_BASE = '/api/invoice-schemas';
const PROFILE_BASE = '/api/company-profile';

// ---------------------------------------------------------------------------
// Invoice CRUD
// ---------------------------------------------------------------------------

export const invoiceApi = {
  /** List current user's invoices — supports ?domain= and ?status= */
  list: (params = {}) => axios.get(`${BASE}/`, { params }),

  /** Count per status for current user (or all for admins) */
  statusCounts: () => axios.get(`${BASE}/status-counts/`),

  /** Get full invoice detail */
  get: (id) => axios.get(`${BASE}/${id}/`),

  /** Create a new draft invoice */
  create: (data) => axios.post(`${BASE}/`, data),

  /** Update a draft invoice (full or partial) */
  update: (id, data, partial = false) =>
    partial
      ? axios.patch(`${BASE}/${id}/`, data)
      : axios.put(`${BASE}/${id}/`, data),

  /** Delete a draft invoice */
  remove: (id) => axios.delete(`${BASE}/${id}/`),

  /** DRAFT → PENDING */
  submit: (id, data = {}) => axios.post(`${BASE}/${id}/submit/`, data),

  /** PENDING → APPROVED (admin) */
  approve: (id, data = {}) => axios.post(`${BASE}/${id}/approve/`, data),

  /** PENDING → REJECTED (admin) */
  reject: (id, data) => axios.post(`${BASE}/${id}/reject/`, data),

  /** Download PDF (returns blob) */
  download: (id) =>
    axios.get(`${BASE}/${id}/download/`, { responseType: 'blob' }),

  /** Admin — list all invoices */
  adminList: (params = {}) => axios.get(`${BASE}/admin/`, { params }),
};

// ---------------------------------------------------------------------------
// Invoice Schemas
// ---------------------------------------------------------------------------

export const schemaApi = {
  list: () => axios.get(`${SCHEMA_BASE}/`),
  get: (domain) => axios.get(`${SCHEMA_BASE}/${domain}/`),
};

// ---------------------------------------------------------------------------
// Company Profile
// ---------------------------------------------------------------------------

export const companyProfileApi = {
  get: () => axios.get(`${PROFILE_BASE}/`),

  update: (data, partial = true) =>
    partial
      ? axios.patch(`${PROFILE_BASE}/`, data)
      : axios.put(`${PROFILE_BASE}/`, data),

  uploadLogo: (formData) =>
    axios.post(`${PROFILE_BASE}/upload-logo/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  uploadSignature: (formData) =>
    axios.post(`${PROFILE_BASE}/upload-signature/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  uploadSeal: (formData) =>
    axios.post(`${PROFILE_BASE}/upload-seal/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  removeLogo: () => axios.delete(`${PROFILE_BASE}/remove-logo/`),
  removeSignature: () => axios.delete(`${PROFILE_BASE}/remove-signature/`),
  removeSeal: () => axios.delete(`${PROFILE_BASE}/remove-seal/`),
};
