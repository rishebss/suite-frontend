import axios from "axios";
const BASE = "/api/work";

export const fetchGitHubIntegrations = (params) =>
  axios.get(`${BASE}/github-integrations/`, { params });

export const createGitHubIntegration = (data) =>
  axios.post(`${BASE}/github-integrations/`, data);

export const updateGitHubIntegration = (id, data) =>
  axios.patch(`${BASE}/github-integrations/${id}/`, data);

export const deleteGitHubIntegration = (id) =>
  axios.delete(`${BASE}/github-integrations/${id}/`);

export const syncWebhook = (id) =>
  axios.post(`${BASE}/github-integrations/${id}/sync_webhook/`);

export const fetchGitHubLinks = (params) =>
  axios.get(`${BASE}/github-links/`, { params });
