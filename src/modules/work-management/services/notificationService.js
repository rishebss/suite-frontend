import axios from "axios";

const BASE = "/api/work";

export const fetchNotifications = (params = {}) =>
  axios.get(`${BASE}/notifications/`, { params });

export const fetchNotificationPreferences = (params = {}) =>
  axios.get(`${BASE}/notification-preferences/`, { params });

export const updateNotificationPreference = (id, data) =>
  axios.patch(`${BASE}/notification-preferences/${id}/`, data);

export const createNotificationPreference = (data) =>
  axios.post(`${BASE}/notification-preferences/`, data);

export const markNotificationRead = (id) =>
  axios.post(`${BASE}/notifications/${id}/mark_read/`);

export const markAllNotificationsRead = () =>
  axios.post(`${BASE}/notifications/mark_all_read/`);

export const fetchUnreadCount = () =>
  axios.get(`${BASE}/notifications/unread_count/`);
