import axios from "axios";

const BASE = "/api/work";

export const fetchSprints = (params = {}) =>
  axios.get(`${BASE}/sprints/`, { params });

export const fetchSprint = (id) =>
  axios.get(`${BASE}/sprints/${id}/`);

export const createSprint = (data) =>
  axios.post(`${BASE}/sprints/`, data);

export const updateSprint = (id, data) =>
  axios.patch(`${BASE}/sprints/${id}/`, data);

export const deleteSprint = (id) =>
  axios.delete(`${BASE}/sprints/${id}/`);

export const startSprint = (id) =>
  axios.post(`${BASE}/sprints/${id}/start/`);

export const closeSprint = (id) =>
  axios.post(`${BASE}/sprints/${id}/close/`);

export const fetchSprintBurndown = (id) =>
  axios.get(`${BASE}/sprints/${id}/burndown/`);

export const fetchSprintStats = (id) =>
  axios.get(`${BASE}/sprints/${id}/stats/`);

export const addSprintMember = (id, userId, capacityHours = 40) =>
  axios.post(`${BASE}/sprints/${id}/add-member/`, { user_id: userId, capacity_hours: capacityHours });

export const removeSprintMember = (id, userId) =>
  axios.post(`${BASE}/sprints/${id}/remove-member/`, { user_id: userId });

// WorkItem sprint operations
export const addItemToSprint = (itemId, sprintId) =>
  axios.post(`${BASE}/items/${itemId}/add-to-sprint/`, { sprint_id: sprintId });

export const removeItemFromSprint = (itemId) =>
  axios.post(`${BASE}/items/${itemId}/remove-from-sprint/`);

export const updateItemStoryPoints = (itemId, points) =>
  axios.post(`${BASE}/items/${itemId}/update-points/`, { story_points: points });

// Project-level Dev Mode endpoints
export const fetchProjectVelocity = (projectId, params = {}) =>
  axios.get(`${BASE}/projects/${projectId}/velocity/`, { params });

export const fetchProjectEpics = (projectId) =>
  axios.get(`${BASE}/projects/${projectId}/epics/`);
