import axios from "axios";
const BASE = "/api/work";

export const submitEmailToTicket = (data) =>
  axios.post(`${BASE}/intake/email/`, data);

export const submitWebForm = (data) =>
  axios.post(`${BASE}/intake/web-form/`, data);
