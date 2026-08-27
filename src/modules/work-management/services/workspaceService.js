import axios from "axios";

const BASE = "/api/work";

export const fetchWorkspaces = (params = {}) =>
  axios.get(`${BASE}/workspaces/`, { params });

export const fetchWorkspace = (id) =>
  axios.get(`${BASE}/workspaces/${id}/`);

export const createWorkspace = (data) =>
  axios.post(`${BASE}/workspaces/`, data);

export const updateWorkspace = (id, data) =>
  axios.patch(`${BASE}/workspaces/${id}/`, data);

export const deleteWorkspace = (id) =>
  axios.delete(`${BASE}/workspaces/${id}/`);

export const fetchWorkspaceSummary = (id) =>
  axios.get(`${BASE}/workspaces/${id}/summary/`);
