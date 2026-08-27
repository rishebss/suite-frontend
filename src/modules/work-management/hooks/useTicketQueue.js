import { useState, useEffect, useCallback } from "react";
import { fetchTicketQueue, fetchSLAPolicies } from "../services/ticketService";

export const useTicketQueue = (projectId, params = {}) => {
  const [tickets, setTickets] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!projectId) { setLoading(false); return; }
    setLoading(true);
    try {
      const { data } = await fetchTicketQueue(projectId, params);
      setTickets(Array.isArray(data.tickets) ? data.tickets : []);
      setSummary(data.summary || null);
    } catch (err) {
      console.error("Ticket queue loading error:", err);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  }, [projectId, JSON.stringify(params)]);

  useEffect(() => { load(); }, [load]);

  return { tickets, summary, loading, refetch: load };
};

export const useSLAPolicies = (params = {}) => {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await fetchSLAPolicies(params);
      setPolicies(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      console.error("SLA policies loading error:", err);
      setPolicies([]);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => { load(); }, [load]);

  return { policies, loading, refetch: load };
};
