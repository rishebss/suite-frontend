import axios from "axios";

const BASE = "/api/work";

export const fetchAutomationRules = (params = {}) =>
  axios.get(`${BASE}/automation-rules/`, { params });

export const fetchAutomationRule = (id) =>
  axios.get(`${BASE}/automation-rules/${id}/`);

export const createAutomationRule = (data) =>
  axios.post(`${BASE}/automation-rules/`, data);

export const updateAutomationRule = (id, data) =>
  axios.patch(`${BASE}/automation-rules/${id}/`, data);

export const deleteAutomationRule = (id) =>
  axios.delete(`${BASE}/automation-rules/${id}/`);

export const toggleAutomationRule = (id) =>
  axios.post(`${BASE}/automation-rules/${id}/toggle/`);

export const testAutomationRule = (id, workItemId) =>
  axios.post(`${BASE}/automation-rules/${id}/test/`, { work_item_id: workItemId });
