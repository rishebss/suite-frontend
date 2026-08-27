import { useState, useCallback, useEffect } from "react";
import {
  fetchLocations,
  fetchLocation,
  createLocation as apiCreateLocation,
  updateLocation as apiUpdateLocation,
  archiveLocation as apiArchiveLocation,
  restoreLocation as apiRestoreLocation,
  fetchLocationTree as apiFetchLocationTree,
  exportLocations as apiExportLocations,
  importLocations as apiImportLocations,
  fetchLocationTypes,
  createLocationType as apiCreateLocationType,
  updateLocationType as apiUpdateLocationType,
  deleteLocationType as apiDeleteLocationType,
} from "../services/locationService";

/**
 * useLocationTypes hook - Fetch active location types for dropdowns
 */
export const useLocationTypes = () => {
  const [locationTypes, setLocationTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetchLocationTypes({ page_size: 200 });
      setLocationTypes(response.data.results || response.data.data || []);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { locationTypes, loading, refetch };
};

/**
 * useLocations hook - Fetch paginated location list
 */
export const useLocations = (filters = {}) => {
  const [locations, setLocations] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchLocations(filters);
      setLocations(response.data.results || response.data.data || []);
      setCount(response.data.count || 0);
    } catch (err) {
      setError(
        err.response?.data?.detail || err.message || "Failed to fetch locations",
      );
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { locations, count, loading, error, refetch };
};

/**
 * useLocationActions hook - CRUD operations for locations
 */
export const useLocationActions = () => {
  const [loading, setLoading] = useState(false);

  const createLocation = useCallback(async (data) => {
    setLoading(true);
    try {
      const response = await apiCreateLocation(data);
      return { success: true, data: response.data.data || response.data };
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.detail ||
        err.message ||
        "Failed to create location";
      return { success: false, error: msg, errors: err.response?.data };
    } finally {
      setLoading(false);
    }
  }, []);

  const updateLocation = useCallback(async (id, data) => {
    setLoading(true);
    try {
      const response = await apiUpdateLocation(id, data);
      return { success: true, data: response.data.data || response.data };
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.detail ||
        err.message ||
        "Failed to update location";
      return { success: false, error: msg, errors: err.response?.data };
    } finally {
      setLoading(false);
    }
  }, []);

  const archiveLocation = useCallback(async (id) => {
    setLoading(true);
    try {
      const response = await apiArchiveLocation(id);
      return { success: true, message: response.data?.message };
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Failed to archive location";
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  const restoreLocation = useCallback(async (id) => {
    setLoading(true);
    try {
      const response = await apiRestoreLocation(id);
      return { success: true, message: response.data?.message };
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Failed to restore location";
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  const exportLocations = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const response = await apiExportLocations(params);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      const disposition = response.headers["content-disposition"];
      let filename = "locations.csv";
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
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Failed to export locations";
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  const importLocations = useCallback(async (formData) => {
    setLoading(true);
    try {
      const response = await apiImportLocations(formData);
      return {
        success: true,
        data: response.data,
        message: response.data?.message,
      };
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Failed to import locations";
      return { success: false, error: msg, errors: err.response?.data };
    } finally {
      setLoading(false);
    }
  }, []);

  // Location Type actions
  const createLocationType = useCallback(async (data) => {
    setLoading(true);
    try {
      const response = await apiCreateLocationType(data);
      return { success: true, data: response.data.data || response.data };
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.detail ||
        err.message ||
        "Failed to create location type";
      return { success: false, error: msg, errors: err.response?.data };
    } finally {
      setLoading(false);
    }
  }, []);

  const updateLocationType = useCallback(async (id, data) => {
    setLoading(true);
    try {
      const response = await apiUpdateLocationType(id, data);
      return { success: true, data: response.data.data || response.data };
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.detail ||
        err.message ||
        "Failed to update location type";
      return { success: false, error: msg, errors: err.response?.data };
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteLocationType = useCallback(async (id) => {
    setLoading(true);
    try {
      await apiDeleteLocationType(id);
      return { success: true };
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Failed to delete location type";
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    createLocation,
    updateLocation,
    archiveLocation,
    restoreLocation,
    exportLocations,
    importLocations,
    createLocationType,
    updateLocationType,
    deleteLocationType,
  };
};

/**
 * useLocationTree hook - Fetch hierarchical location tree
 */
export const useLocationTree = () => {
  const [tree, setTree] = useState([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiFetchLocationTree();
      setTree(response.data);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { tree, loading, refetch };
};
