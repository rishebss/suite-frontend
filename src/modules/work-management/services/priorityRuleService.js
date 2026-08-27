import axios from "axios";
const BASE = "/api/work";

export const fetchPriorityRules = (params) =>
  axios.get(`${BASE}/priority-rules/`, { params });

export const createPriorityRule = (data) =>
  axios.post(`${BASE}/priority-rules/`, data);

export const updatePriorityRule = (id, data) =>
  axios.patch(`${BASE}/priority-rules/${id}/`, data);

export const deletePriorityRule = (id) =>
  axios.delete(`${BASE}/priority-rules/${id}/`);

export const suggestPriority = (title, description, projectId) =>
  axios.post(`${BASE}/priority-rules/suggest/`, { title, description, project_id: projectId });
