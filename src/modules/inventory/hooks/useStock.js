import { useState, useCallback, useEffect } from "react";
import {
  fetchStockAvailability,
  fetchItemAvailability,
  fetchLowStock,
  fetchOutOfStock,
  fetchValuation,
  fetchSnapshot,
  exportStock as apiExportStock,
} from "../services/stockService";

/**
 * useStockAvailability hook - Fetch paginated stock availability
 */
export const useStockAvailability = (filters = {}) => {
  const [data, setData] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchStockAvailability(filters);
      setData(response.data.results || response.data.data || []);
      setCount(response.data.count || 0);
    } catch (err) {
      setError(
        err.response?.data?.detail || err.message || "Failed to fetch stock",
      );
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, count, loading, error, refetch };
};

/**
 * useLowStock hook - Fetch low stock items
 */
export const useLowStock = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetchLowStock();
      setData(response.data.results || []);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, loading, refetch };
};

/**
 * useOutOfStock hook - Fetch out of stock items
 */
export const useOutOfStock = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetchOutOfStock();
      setData(response.data.results || []);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, loading, refetch };
};

/**
 * useStockExport hook - Export stock data
 */
export const useStockExport = () => {
  const [loading, setLoading] = useState(false);

  const exportStock = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const response = await apiExportStock(params);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      const disposition = response.headers["content-disposition"];
      let filename = "stock_availability.csv";
      if (disposition) {
        const match = disposition.match(/filename="?(.+)"?/);
        if (match) filename = match[1];
      }
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, exportStock };
};
