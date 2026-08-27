import axios from "axios";

const BASE = "/api/work";

export const fetchProjects = (params = {}) =>
  axios.get(`${BASE}/projects/`, { params });

export const fetchProject = (id) =>
  axios.get(`${BASE}/projects/${id}/`);

export const createProject = (data) =>
  axios.post(`${BASE}/projects/`, data);

export const updateProject = (id, data) =>
  axios.patch(`${BASE}/projects/${id}/`, data);

export const deleteProject = (id) =>
  axios.delete(`${BASE}/projects/${id}/`);

export const fetchProjectBoard = (id, params = {}) =>
  axios.get(`${BASE}/projects/${id}/board/`, { params });

export const fetchProjectBacklog = (id, params = {}) =>
  axios.get(`${BASE}/projects/${id}/backlog/`, { params });

export const addProjectMember = (id, userId, role = "MEMBER") =>
  axios.post(`${BASE}/projects/${id}/add-member/`, { user_id: userId, role });

export const removeProjectMember = (id, userId) =>
  axios.post(`${BASE}/projects/${id}/remove-member/`, { user_id: userId });

// Phase 2: Sales Pipeline
export const fetchProjectPipeline = (id, params = {}) =>
  axios.get(`${BASE}/projects/${id}/pipeline/`, { params });
