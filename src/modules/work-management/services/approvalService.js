import axios from "axios";
const BASE = "/api/work";

export const fetchApprovalWorkflows = (params) =>
  axios.get(`${BASE}/approval-workflows/`, { params });

export const createApprovalWorkflow = (data) =>
  axios.post(`${BASE}/approval-workflows/`, data);

export const updateApprovalWorkflow = (id, data) =>
  axios.patch(`${BASE}/approval-workflows/${id}/`, data);

export const deleteApprovalWorkflow = (id) =>
  axios.delete(`${BASE}/approval-workflows/${id}/`);

export const fetchApprovalRequests = (params) =>
  axios.get(`${BASE}/approval-requests/`, { params });

export const createApprovalRequest = (data) =>
  axios.post(`${BASE}/approval-requests/`, data);

export const approveRequest = (id, comment) =>
  axios.post(`${BASE}/approval-requests/${id}/approve/`, { comment });

export const rejectRequest = (id, comment) =>
  axios.post(`${BASE}/approval-requests/${id}/reject/`, { comment });
