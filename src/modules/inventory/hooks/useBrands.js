import { useState, useCallback, useEffect } from "react";
import {
  fetchBrands,
  fetchBrand,
  createBrand as apiCreateBrand,
  updateBrand as apiUpdateBrand,
  archiveBrand as apiArchiveBrand,
  restoreBrand as apiRestoreBrand,
  exportBrands as apiExportBrands,
} from "../services/brandService";

export const useBrands = (filters = {}) => {
  const [brands, setBrands] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchBrands(filters);
      setBrands(response.data.results || response.data.data || []);
      setCount(response.data.count || 0);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || "Failed to fetch brands");
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]);

  useEffect(() => { refetch(); }, [refetch]);

  return { brands, count, loading, error, refetch };
};

export const useBrand = (id) => {
  const [brand, setBrand] = useState(null);
  const [loading, setLoading] = useState(!!id);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetchBrand(id);
      setBrand(response.data.data || response.data);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || "Failed to fetch brand");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { refetch(); }, [refetch]);

  return { brand, loading, error, refetch };
};

export const useBrandActions = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createBrand = useCallback(async (data) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiCreateBrand(data);
      return { success: true, data: response.data.data || response.data };
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.detail || err.message || "Failed to create brand";
      setError(msg);
      return { success: false, error: msg, errors: err.response?.data };
    } finally {
      setLoading(false);
    }
  }, []);

  const updateBrand = useCallback(async (id, data) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiUpdateBrand(id, data);
      return { success: true, data: response.data.data || response.data };
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.detail || err.message || "Failed to update brand";
      setError(msg);
      return { success: false, error: msg, errors: err.response?.data };
    } finally {
      setLoading(false);
    }
  }, []);

  const archiveBrand = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiArchiveBrand(id);
      return { success: true, message: response.data?.message };
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Failed to archive brand";
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  const restoreBrand = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiRestoreBrand(id);
      return { success: true, message: response.data?.message };
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Failed to restore brand";
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  const exportBrandsCb = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiExportBrands(params);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      const disposition = response.headers["content-disposition"];
      let filename = "brands.csv";
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
      const msg = err.message || "Failed to export brands";
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, createBrand, updateBrand, archiveBrand, restoreBrand, exportBrands: exportBrandsCb };
};
