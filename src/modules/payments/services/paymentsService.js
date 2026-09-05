import axios from "axios";
export const fetchPayments = (params={}) => axios.get("/api/payments/", { params });
export const fetchSchedules = (params={}) => axios.get("/api/payments/schedules/", { params });
export const fetchPipelines = (params={}) => axios.get("/api/crm/pipelines/", { params });
export const fetchDashboard = () => axios.get("/api/dashboard/overview/");
export const fetchAssignableUsers = (params = {}) =>
  axios.get("/api/auth/users/assignable/", { params });
