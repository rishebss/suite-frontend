import axios from "axios";
const BASE = "/api/work";

export const fetchProjectTemplates = (params) =>
  axios.get(`${BASE}/project-templates/`, { params });

export const createProjectTemplate = (data) =>
  axios.post(`${BASE}/project-templates/`, data);

export const updateProjectTemplate = (id, data) =>
  axios.patch(`${BASE}/project-templates/${id}/`, data);

export const deleteProjectTemplate = (id) =>
  axios.delete(`${BASE}/project-templates/${id}/`);

export const createProjectFromTemplate = (templateId, data) =>
  axios.post(`${BASE}/project-templates/${templateId}/create_project/`, data);
