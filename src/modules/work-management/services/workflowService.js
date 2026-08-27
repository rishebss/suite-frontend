import axios from "axios";

const BASE = "/api/work";

export const fetchWorkflows = (params = {}) =>
  axios.get(`${BASE}/workflows/`, { params });

export const fetchWorkflow = (id) =>
  axios.get(`${BASE}/workflows/${id}/`);

export const createWorkflow = (data) =>
  axios.post(`${BASE}/workflows/`, data);

export const updateWorkflow = (id, data) =>
  axios.patch(`${BASE}/workflows/${id}/`, data);

export const deleteWorkflow = (id) =>
  axios.delete(`${BASE}/workflows/${id}/`);

export const addWorkflowStatus = (workflowId, data) =>
  axios.post(`${BASE}/workflows/${workflowId}/add-status/`, data);

export const reorderWorkflowStatuses = (workflowId, items) =>
  axios.post(`${BASE}/workflows/${workflowId}/reorder-statuses/`, items);
