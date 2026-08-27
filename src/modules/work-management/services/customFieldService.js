import axios from "axios";

const BASE = "/api/work";

export const fetchCustomFields = (params = {}) =>
  axios.get(`${BASE}/custom-fields/`, { params });

export const fetchCustomField = (id) =>
  axios.get(`${BASE}/custom-fields/${id}/`);

export const createCustomField = (data) =>
  axios.post(`${BASE}/custom-fields/`, data);

export const updateCustomField = (id, data) =>
  axios.patch(`${BASE}/custom-fields/${id}/`, data);

export const deleteCustomField = (id) =>
  axios.delete(`${BASE}/custom-fields/${id}/`);
