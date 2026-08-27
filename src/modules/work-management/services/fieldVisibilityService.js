import axios from "axios";

const BASE = "/api/work";

export const fetchFieldVisibilityRules = (params = {}) =>
  axios.get(`${BASE}/field-visibility/`, { params });

export const fetchFieldVisibilityRule = (id) =>
  axios.get(`${BASE}/field-visibility/${id}/`);

export const createFieldVisibilityRule = (data) =>
  axios.post(`${BASE}/field-visibility/`, data);

export const updateFieldVisibilityRule = (id, data) =>
  axios.patch(`${BASE}/field-visibility/${id}/`, data);

export const deleteFieldVisibilityRule = (id) =>
  axios.delete(`${BASE}/field-visibility/${id}/`);
