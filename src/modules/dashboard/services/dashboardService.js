import axios from "axios";
export const fetchOwnerDashboard = () => axios.get(`/api/dashboard/overview/`);
