import axios from "axios";

const BASE = "/api/work";

export const fetchWorkItems = (params = {}) =>
  axios.get(`${BASE}/items/`, { params });

export const fetchWorkItem = (id) =>
  axios.get(`${BASE}/items/${id}/`);

export const createWorkItem = (data) =>
  axios.post(`${BASE}/items/`, data);

export const updateWorkItem = (id, data) =>
  axios.patch(`${BASE}/items/${id}/`, data);

export const deleteWorkItem = (id) =>
  axios.delete(`${BASE}/items/${id}/`);

export const transitionWorkItem = (id, statusId) =>
  axios.post(`${BASE}/items/${id}/transition/`, { status: statusId });

export const assignWorkItem = (id, userId) =>
  axios.post(`${BASE}/items/${id}/assign/`, { user_id: userId });

export const fetchMyWorkItems = (params = {}) =>
  axios.get(`${BASE}/items/my_items/`, { params });

export const bulkUpdateWorkItemStatus = (itemIds, statusId) =>
  axios.post(`${BASE}/items/bulk-status/`, { item_ids: itemIds, status: statusId });

export const bulkReorderWorkItems = (items) =>
  axios.post(`${BASE}/items/bulk-reorder/`, { items });

export const bulkAssignWorkItems = (itemIds, userId) =>
  axios.post(`${BASE}/items/bulk-assign/`, { item_ids: itemIds, user_id: userId });

export const bulkEditWorkItems = (itemIds, changes) =>
  axios.post(`${BASE}/items/bulk-edit/`, { item_ids: itemIds, changes });

export const bulkDeleteWorkItems = (itemIds) =>
  axios.post(`${BASE}/items/bulk-delete/`, { item_ids: itemIds });

// Comments
export const fetchComments = (params = {}) =>
  axios.get(`${BASE}/comments/`, { params });

export const createComment = (data) =>
  axios.post(`${BASE}/comments/`, data);

export const deleteComment = (id) =>
  axios.delete(`${BASE}/comments/${id}/`);

// Links
export const fetchLinks = (params = {}) =>
  axios.get(`${BASE}/links/`, { params });

export const createLink = (data) =>
  axios.post(`${BASE}/links/`, data);

export const deleteLink = (id) =>
  axios.delete(`${BASE}/links/${id}/`);

// Activity Logs
export const fetchActivityLogs = (params = {}) =>
  axios.get(`${BASE}/activity-logs/`, { params });

// Dashboards
export const fetchMyWorkDashboard = () =>
  axios.get(`${BASE}/dashboard/my_work/`);

export const fetchWorkspaceOverview = () =>
  axios.get(`${BASE}/dashboard/workspace_overview/`);
