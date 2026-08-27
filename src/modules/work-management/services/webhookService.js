import axios from "axios";

const BASE = "/api/work";

export const fetchWebhookConfigs = (params = {}) =>
  axios.get(`${BASE}/webhook-configs/`, { params });

export const fetchWebhookConfig = (id) =>
  axios.get(`${BASE}/webhook-configs/${id}/`);

export const createWebhookConfig = (data) =>
  axios.post(`${BASE}/webhook-configs/`, data);

export const updateWebhookConfig = (id, data) =>
  axios.patch(`${BASE}/webhook-configs/${id}/`, data);

export const deleteWebhookConfig = (id) =>
  axios.delete(`${BASE}/webhook-configs/${id}/`);

export const testWebhookConfig = (id) =>
  axios.post(`${BASE}/webhook-configs/${id}/test/`);
