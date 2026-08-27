import axios from "axios";

const BASE = "/api/work";

export const fetchMilestones = (params = {}) =>
  axios.get(`${BASE}/milestones/`, { params });

export const fetchMilestone = (id) =>
  axios.get(`${BASE}/milestones/${id}/`);

export const createMilestone = (data) =>
  axios.post(`${BASE}/milestones/`, data);

export const updateMilestone = (id, data) =>
  axios.patch(`${BASE}/milestones/${id}/`, data);

export const deleteMilestone = (id) =>
  axios.delete(`${BASE}/milestones/${id}/`);

export const achieveMilestone = (id) =>
  axios.post(`${BASE}/milestones/${id}/achieve/`);

export const missMilestone = (id) =>
  axios.post(`${BASE}/milestones/${id}/miss/`);
