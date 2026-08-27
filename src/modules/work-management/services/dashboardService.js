import axios from "axios";

const BASE = "/api/work";

export const fetchCumulativeFlow = (params) =>
  axios.get(`${BASE}/dashboard/cumulative_flow/`, { params });

export const fetchMyWorkDashboard = () =>
  axios.get(`${BASE}/dashboard/my_work/`);

export const fetchMyDashboardDetail = () =>
  axios.get(`${BASE}/dashboard/my_dashboard_detail/`);

export const fetchCommissionExport = (params) =>
  axios.get(`${BASE}/dashboard/commission_export/`, { params });

export const fetchWorkspaceOverview = () =>
  axios.get(`${BASE}/dashboard/workspace_overview/`);

export const fetchSalesAttainment = (params = {}) =>
  axios.get(`${BASE}/dashboard/sales_attainment/`, { params });

export const fetchSalesLeaderboard = (params = {}) =>
  axios.get(`${BASE}/dashboard/sales_leaderboard/`, { params });

export const fetchSalesForecast = (params = {}) =>
  axios.get(`${BASE}/dashboard/sales_forecast/`, { params });

export const fetchSalesPipelineSummary = (params = {}) =>
  axios.get(`${BASE}/dashboard/sales_pipeline_summary/`, { params });

export const fetchExecutiveDashboard = (params = {}) =>
  axios.get(`${BASE}/dashboard/executive/`, { params });
