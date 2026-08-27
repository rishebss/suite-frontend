/**
 * Category API Service
 */
import axios from "axios";

const BASE = "/api/inventory";

export const fetchCategories = (params = {}) =>
  axios.get(`${BASE}/categories/`, { params });

export const fetchCategory = (id) =>
  axios.get(`${BASE}/categories/${id}/`);

export const createCategory = (data) =>
  axios.post(`${BASE}/categories/`, data);

export const updateCategory = (id, data) =>
  axios.patch(`${BASE}/categories/${id}/`, data);

export const archiveCategory = (id) =>
  axios.post(`${BASE}/categories/${id}/archive/`);

export const restoreCategory = (id) =>
  axios.post(`${BASE}/categories/${id}/restore/`);

export const fetchCategoryTree = (params = {}) =>
  axios.get(`${BASE}/categories/tree/`, { params });

export const exportCategories = (params = {}) =>
  axios.get(`${BASE}/categories/export/`, { params, responseType: "blob" });

export const importCategories = (formData) =>
  axios.post(`${BASE}/categories/import/`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
