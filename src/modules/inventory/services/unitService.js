/**
 * Unit API Service
 */
import axios from "axios";

const BASE = "/api/inventory";

export const fetchUnits = (params = {}) =>
  axios.get(`${BASE}/units/`, { params });

export const fetchUnit = (id) =>
  axios.get(`${BASE}/units/${id}/`);

export const createUnit = (data) =>
  axios.post(`${BASE}/units/`, data);

export const updateUnit = (id, data) =>
  axios.patch(`${BASE}/units/${id}/`, data);

export const archiveUnit = (id) =>
  axios.post(`${BASE}/units/${id}/archive/`);

export const restoreUnit = (id) =>
  axios.post(`${BASE}/units/${id}/restore/`);

export const fetchUnitConversions = (id) =>
  axios.get(`${BASE}/units/${id}/conversions/`);

export const createUnitConversion = (unitId, data) =>
  axios.post(`${BASE}/units/${unitId}/conversions/`, data);

export const deleteUnitConversion = (unitId, conversionId) =>
  axios.delete(`${BASE}/units/${unitId}/conversions/?conversion_id=${conversionId}`);

export const exportUnits = (params = {}) =>
  axios.get(`${BASE}/units/export/`, { params, responseType: "blob" });

export const importUnits = (formData) =>
  axios.post(`${BASE}/units/import/`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
