import axios from "axios";

const BASE = "/api/work";

export const fetchReleases = (params = {}) =>
  axios.get(`${BASE}/releases/`, { params });

export const fetchRelease = (id) =>
  axios.get(`${BASE}/releases/${id}/`);

export const createRelease = (data) =>
  axios.post(`${BASE}/releases/`, data);

export const updateRelease = (id, data) =>
  axios.patch(`${BASE}/releases/${id}/`, data);

export const deleteRelease = (id) =>
  axios.delete(`${BASE}/releases/${id}/`);

export const tagWorkItemVersion = (itemId, versionId) =>
  axios.post(`${BASE}/items/${itemId}/tag-version/`, { version_id: versionId });

export const removeWorkItemVersion = (itemId) =>
  axios.post(`${BASE}/items/${itemId}/remove-version/`);
