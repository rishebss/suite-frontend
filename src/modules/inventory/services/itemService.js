/**
 * Inventory API Service
 * All API calls for items, categories, units, brands
 */
import axios from "axios";

const INVENTORY_BASE = "/api/inventory";

// ============================================================================
// ITEMS
// ============================================================================
export const fetchItems = (params = {}) =>
  axios.get(`${INVENTORY_BASE}/items/`, { params });

export const fetchItem = (id) =>
  axios.get(`${INVENTORY_BASE}/items/${id}/`);

export const createItem = (data) =>
  axios.post(`${INVENTORY_BASE}/items/`, data);

export const updateItem = (id, data) =>
  axios.patch(`${INVENTORY_BASE}/items/${id}/`, data);

export const deleteItem = (id) =>
  axios.delete(`${INVENTORY_BASE}/items/${id}/`);

export const cloneItem = (id, data) =>
  axios.post(`${INVENTORY_BASE}/items/${id}/clone/`, data);

export const archiveItem = (id) =>
  axios.post(`${INVENTORY_BASE}/items/${id}/archive/`);

export const restoreItem = (id) =>
  axios.post(`${INVENTORY_BASE}/items/${id}/restore/`);

export const importItems = (formData) =>
  axios.post(`${INVENTORY_BASE}/items/import/`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const exportItems = (params = {}) =>
  axios.get(`${INVENTORY_BASE}/items/export/`, {
    params,
    responseType: "blob",
  });

// ============================================================================
// CATEGORIES
// ============================================================================
export const fetchCategories = (params = {}) =>
  axios.get(`${INVENTORY_BASE}/categories/`, { params });

export const createCategory = (data) =>
  axios.post(`${INVENTORY_BASE}/categories/`, data);

// ============================================================================
// UNITS
// ============================================================================
export const fetchUnits = (params = {}) =>
  axios.get(`${INVENTORY_BASE}/units/`, { params });

// ============================================================================
// BRANDS
// ============================================================================
export const fetchBrands = (params = {}) =>
  axios.get(`${INVENTORY_BASE}/brands/`, { params });

export const createBrand = (data) =>
  axios.post(`${INVENTORY_BASE}/brands/`, data);
