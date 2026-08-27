import { useState, useEffect, useCallback } from "react";
import {
  fetchSalesAttainment,
  fetchSalesLeaderboard,
  fetchSalesForecast,
  fetchSalesPipelineSummary,
} from "../services/dashboardService";

export const useSalesAttainment = (params = {}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data: res } = await fetchSalesAttainment(params);
      setData(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error("Attainment loading error:", err);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => { load(); }, [load]);

  return { attainment: data, loading, refetch: load };
};

export const useSalesLeaderboard = (params = {}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data: res } = await fetchSalesLeaderboard(params);
      setData(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error("Leaderboard loading error:", err);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => { load(); }, [load]);

  return { leaderboard: data, loading, refetch: load };
};

export const useSalesForecast = (params = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data: res } = await fetchSalesForecast(params);
      setData(res);
    } catch (err) {
      console.error("Forecast loading error:", err);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => { load(); }, [load]);

  return { forecast: data, loading, refetch: load };
};

export const useSalesPipelineSummary = (params = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data: res } = await fetchSalesPipelineSummary(params);
      setData(res);
    } catch (err) {
      console.error("Pipeline summary loading error:", err);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => { load(); }, [load]);

  return { summary: data, loading, refetch: load };
};
