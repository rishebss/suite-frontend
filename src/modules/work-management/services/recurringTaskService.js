import axios from "axios";
const BASE = "/api/work";

export const fetchRecurringTaskConfigs = (params) =>
  axios.get(`${BASE}/recurring-task-configs/`, { params });

export const createRecurringTaskConfig = (data) =>
  axios.post(`${BASE}/recurring-task-configs/`, data);

export const updateRecurringTaskConfig = (id, data) =>
  axios.patch(`${BASE}/recurring-task-configs/${id}/`, data);

export const deleteRecurringTaskConfig = (id) =>
  axios.delete(`${BASE}/recurring-task-configs/${id}/`);
