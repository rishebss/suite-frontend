/**
 * Brand API Service
 */
import axios from "axios";

const BASE = "/api/inventory";

export const fetchBrands = (params = {}) =>
  axios.get(`${BASE}/brands/`, { params });

export const fetchBrand = (id) =>
  axios.get(`${BASE}/brands/${id}/`);

export const createBrand = (data) =>
  axios.post(`${BASE}/brands/`, data);

export const updateBrand = (id, data) =>
  axios.patch(`${BASE}/brands/${id}/`, data);

export const archiveBrand = (id) =>
  axios.post(`${BASE}/brands/${id}/archive/`);

export const restoreBrand = (id) =>
  axios.post(`${BASE}/brands/${id}/restore/`);

export const exportBrands = (params = {}) =>
  axios.get(`${BASE}/brands/export/`, { params, responseType: "blob" });

export const importBrands = (formData) =>
  axios.post(`${BASE}/brands/import/`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
