import { useState, useCallback, useEffect } from "react";
import {
  fetchUnits,
  fetchUnit,
  createUnit as apiCreateUnit,
  updateUnit as apiUpdateUnit,
  archiveUnit as apiArchiveUnit,
  restoreUnit as apiRestoreUnit,
  fetchUnitConversions,
  createUnitConversion as apiCreateUnitConversion,
  deleteUnitConversion as apiDeleteUnitConversion,
  exportUnits as apiExportUnits,
} from "../services/unitService";

export const useUnits = (filters = {}) => {
  const [units, setUnits] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchUnits(filters);
      setUnits(response.data.results || response.data.data || []);
      setCount(response.data.count || 0);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || "Failed to fetch units");
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]);

  useEffect(() => { refetch(); }, [refetch]);

  return { units, count, loading, error, refetch };
};

export const useUnit = (id) => {
  const [unit, setUnit] = useState(null);
  const [loading, setLoading] = useState(!!id);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetchUnit(id);
      setUnit(response.data.data || response.data);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || "Failed to fetch unit");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { refetch(); }, [refetch]);

  return { unit, loading, error, refetch };
};

export const useUnitActions = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createUnit = useCallback(async (data) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiCreateUnit(data);
      return { success: true, data: response.data.data || response.data };
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.detail || err.message || "Failed to create unit";
      setError(msg);
      return { success: false, error: msg, errors: err.response?.data };
    } finally {
      setLoading(false);
    }
  }, []);

  const updateUnit = useCallback(async (id, data) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiUpdateUnit(id, data);
      return { success: true, data: response.data.data || response.data };
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.detail || err.message || "Failed to update unit";
      setError(msg);
      return { success: false, error: msg, errors: err.response?.data };
    } finally {
      setLoading(false);
    }
  }, []);

  const archiveUnit = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiArchiveUnit(id);
      return { success: true, message: response.data?.message };
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Failed to archive unit";
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  const restoreUnit = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiRestoreUnit(id);
      return { success: true, message: response.data?.message };
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Failed to restore unit";
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  const exportUnitsCb = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiExportUnits(params);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      const disposition = response.headers["content-disposition"];
      let filename = "units.csv";
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
      const msg = err.message || "Failed to export units";
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, createUnit, updateUnit, archiveUnit, restoreUnit, exportUnits: exportUnitsCb };
};

export const useUnitConversions = (unitId) => {
  const [conversions, setConversions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    if (!unitId) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetchUnitConversions(unitId);
      setConversions(response.data || []);
    } catch (err) {
      setError(err.message || "Failed to fetch conversions");
    } finally {
      setLoading(false);
    }
  }, [unitId]);

  useEffect(() => { refetch(); }, [refetch]);

  const addConversion = useCallback(async (data) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiCreateUnitConversion(unitId, data);
      await refetch();
      return { success: true, data: response.data };
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Failed to add conversion";
      setError(msg);
      return { success: false, error: msg, errors: err.response?.data };
    } finally {
      setLoading(false);
    }
  }, [unitId, refetch]);

  const removeConversion = useCallback(async (conversionId) => {
    setLoading(true);
    setError(null);
    try {
      await apiDeleteUnitConversion(unitId, conversionId);
      await refetch();
      return { success: true };
    } catch (err) {
      const msg = err.message || "Failed to remove conversion";
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, [unitId, refetch]);

  return { conversions, loading, error, refetch, addConversion, removeConversion };
};
