import axios from "axios";
const BASE = "/api/work";

export const fetchCannedResponses = (params) =>
  axios.get(`${BASE}/canned-responses/`, { params });

export const createCannedResponse = (data) =>
  axios.post(`${BASE}/canned-responses/`, data);

export const updateCannedResponse = (id, data) =>
  axios.patch(`${BASE}/canned-responses/${id}/`, data);

export const deleteCannedResponse = (id) =>
  axios.delete(`${BASE}/canned-responses/${id}/`);
