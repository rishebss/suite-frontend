import axios from "axios";

const BASE = "/api/inventory";

// ============================================================================
// TRANSFERS
// ============================================================================

export const fetchTransfers = (params = {}) =>
  axios.get(`${BASE}/transfers/`, { params });

export const fetchTransfer = (id) =>
  axios.get(`${BASE}/transfers/${id}/`);

export const createTransfer = (data) =>
  axios.post(`${BASE}/transfers/`, data);

export const updateTransfer = (id, data) =>
  axios.put(`${BASE}/transfers/${id}/`, data);

export const deleteTransfer = (id) =>
  axios.delete(`${BASE}/transfers/${id}/`);

export const submitTransfer = (id) =>
  axios.post(`${BASE}/transfers/${id}/submit/`);

export const approveTransfer = (id, data = {}) =>
  axios.post(`${BASE}/transfers/${id}/approve/`, data);

export const rejectTransfer = (id, data = {}) =>
  axios.post(`${BASE}/transfers/${id}/reject/`, data);

export const dispatchTransfer = (id) =>
  axios.post(`${BASE}/transfers/${id}/dispatch/`);

export const receiveTransfer = (id, data = {}) =>
  axios.post(`${BASE}/transfers/${id}/receive/`, data);

export const cancelTransfer = (id) =>
  axios.post(`${BASE}/transfers/${id}/cancel/`);

export const exportTransfers = (params = {}) =>
  axios.get(`${BASE}/transfers/export/`, {
    params,
    responseType: "blob",
  });
