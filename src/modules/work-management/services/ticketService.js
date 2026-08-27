import axios from "axios";

const BASE = "/api/work";

export const fetchTicketQueue = (projectId, params = {}) =>
  axios.get(`${BASE}/projects/${projectId}/ticket_queue/`, { params });

export const fetchItemSLA = (itemId) =>
  axios.get(`${BASE}/items/${itemId}/check_sla/`);

export const markItemResponded = (itemId) =>
  axios.post(`${BASE}/items/${itemId}/mark_responded/`);

export const startItemSLA = (itemId, slaPolicyId) =>
  axios.post(`${BASE}/items/${itemId}/start_sla/`, { sla_policy_id: slaPolicyId });

export const submitCSAT = (itemId, rating, comment = "", respondedBy = "") =>
  axios.post(`${BASE}/items/${itemId}/submit_csat/`, {
    rating, comment, responded_by: respondedBy,
  });

export const fetchSLAPolicies = (params = {}) =>
  axios.get(`${BASE}/sla-policies/`, { params });

export const createSLAPolicy = (data) =>
  axios.post(`${BASE}/sla-policies/`, data);

export const updateSLAPolicy = (id, data) =>
  axios.patch(`${BASE}/sla-policies/${id}/`, data);

export const deleteSLAPolicy = (id) =>
  axios.delete(`${BASE}/sla-policies/${id}/`);

export const fetchCSATResponses = (params = {}) =>
  axios.get(`${BASE}/csat/`, { params });
