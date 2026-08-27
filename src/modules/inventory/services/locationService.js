import axios from "axios";

const BASE = "/api/inventory";

// ============================================================================
// LOCATION TYPES
// ============================================================================

export const fetchLocationTypes = (params = {}) =>
  axios.get(`${BASE}/location-types/`, { params });

export const fetchLocationType = (id) =>
  axios.get(`${BASE}/location-types/${id}/`);

export const createLocationType = (data) =>
  axios.post(`${BASE}/location-types/`, data);

export const updateLocationType = (id, data) =>
  axios.put(`${BASE}/location-types/${id}/`, data);

export const deleteLocationType = (id) =>
  axios.delete(`${BASE}/location-types/${id}/`);

// ============================================================================
// LOCATIONS
// ============================================================================

export const fetchLocations = (params = {}) =>
  axios.get(`${BASE}/locations/`, { params });

export const fetchLocation = (id) =>
  axios.get(`${BASE}/locations/${id}/`);

export const createLocation = (data) =>
  axios.post(`${BASE}/locations/`, data);

export const updateLocation = (id, data) =>
  axios.put(`${BASE}/locations/${id}/`, data);

export const archiveLocation = (id) =>
  axios.post(`${BASE}/locations/${id}/archive/`);

export const restoreLocation = (id) =>
  axios.post(`${BASE}/locations/${id}/restore/`);

export const fetchLocationTree = (params = {}) =>
  axios.get(`${BASE}/locations/tree/`, { params });

export const exportLocations = (params = {}) =>
  axios.get(`${BASE}/locations/export/`, {
    params,
    responseType: "blob",
  });

export const importLocations = (formData) =>
  axios.post(`${BASE}/locations/import/`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
