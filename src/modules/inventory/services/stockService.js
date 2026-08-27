import axios from "axios";

const BASE = "/api/inventory/stock";

// ============================================================================
// STOCK LEDGER
// ============================================================================

export const fetchLedgerEntries = (params = {}) =>
  axios.get(`${BASE}/ledger/`, { params });

export const createLedgerEntry = (data) =>
  axios.post(`${BASE}/ledger/entries/`, data);

// ============================================================================
// STOCK AVAILABILITY
// ============================================================================

export const fetchStockAvailability = (params = {}) =>
  axios.get(`${BASE}/availability/`, { params });

export const fetchItemAvailability = (itemId) =>
  axios.get(`${BASE}/availability/${itemId}/`);

export const fetchLocationAvailability = (locationId) =>
  axios.get(`${BASE}/availability/location/${locationId}/`);

export const fetchLowStock = (params = {}) =>
  axios.get(`${BASE}/availability/low-stock/`, { params });

export const fetchOutOfStock = (params = {}) =>
  axios.get(`${BASE}/availability/out-of-stock/`, { params });

export const fetchValuation = (params = {}) =>
  axios.get(`${BASE}/availability/valuation/`, { params });

export const fetchSnapshot = (params = {}) =>
  axios.get(`${BASE}/availability/snapshot/`, { params });

export const exportStock = (params = {}) =>
  axios.get(`${BASE}/availability/export/`, {
    params,
    responseType: "blob",
  });
