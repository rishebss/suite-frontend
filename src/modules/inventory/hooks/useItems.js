import { useState, useCallback, useEffect } from "react";
import {
  fetchItems,
  fetchItem,
  createItem as apiCreateItem,
  updateItem as apiUpdateItem,
  deleteItem as apiDeleteItem,
  cloneItem as apiCloneItem,
  archiveItem as apiArchiveItem,
  restoreItem as apiRestoreItem,
  importItems as apiImportItems,
  exportItems as apiExportItems,
  fetchCategories,
  fetchUnits,
  fetchBrands,
} from "../services/itemService";

/**
 * useItems hook - Manages items list with filtering, search, and pagination
 */
export const useItems = (filters = {}) => {
  const [items, setItems] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchItems(filters);
      setItems(response.data.results || response.data.data || []);
      setCount(response.data.count || 0);
    } catch (err) {
      setError(
        err.response?.data?.detail || err.message || "Failed to fetch items",
      );
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { items, count, loading, error, refetch };
};

/**
 * useItem hook - Fetch single item by ID
 */
export const useItem = (id) => {
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(!!id);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetchItem(id);
      setItem(response.data.data || response.data);
    } catch (err) {
      setError(
        err.response?.data?.detail || err.message || "Failed to fetch item",
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { item, loading, error, refetch };
};

/**
 * useItemActions hook - CRUD operations for items
 */
export const useItemActions = (filters = {}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createItem = useCallback(async (data) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiCreateItem(data);
      return { success: true, data: response.data.data || response.data };
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.detail ||
        err.message ||
        "Failed to create item";
      setError(msg);
      return { success: false, error: msg, errors: err.response?.data };
    } finally {
      setLoading(false);
    }
  }, []);

  const updateItem = useCallback(async (id, data) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiUpdateItem(id, data);
      return { success: true, data: response.data.data || response.data };
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.detail ||
        err.message ||
        "Failed to update item";
      setError(msg);
      return { success: false, error: msg, errors: err.response?.data };
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteItem = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await apiDeleteItem(id);
      return { success: true };
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.detail ||
        err.message ||
        "Failed to delete item";
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  const cloneItem = useCallback(async (id, data) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiCloneItem(id, data);
      return { success: true, data: response.data.data || response.data };
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.detail ||
        err.message ||
        "Failed to clone item";
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  const archiveItem = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiArchiveItem(id);
      return { success: true, message: response.data?.message };
    } catch (err) {
      const msg =
        err.response?.data?.message || err.message || "Failed to archive item";
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  const restoreItem = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiRestoreItem(id);
      return { success: true, message: response.data?.message };
    } catch (err) {
      const msg =
        err.response?.data?.message || err.message || "Failed to restore item";
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  const importItems = useCallback(async (formData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiImportItems(formData);
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
        "Failed to import items";
      setError(msg);
      return { success: false, error: msg, errors: err.response?.data };
    } finally {
      setLoading(false);
    }
  }, []);

  const exportItemsCb = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiExportItems(params);
      // Trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      const disposition = response.headers["content-disposition"];
      let filename = "inventory_items.csv";
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
        "Failed to export items";
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    createItem,
    updateItem,
    deleteItem,
    cloneItem,
    archiveItem,
    restoreItem,
    importItems,
    exportItems: exportItemsCb,
  };
};

/**
 * useItemReferenceData hook - Fetch reference data (categories, units, brands)
 */
export const useItemReferenceData = () => {
  const [categories, setCategories] = useState([]);
  const [units, setUnits] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      const [catRes, unitRes, brandRes] = await Promise.all([
        fetchCategories(),
        fetchUnits(),
        fetchBrands(),
      ]);
      setCategories(catRes.data.results || catRes.data.data || []);
      setUnits(unitRes.data.results || unitRes.data.data || []);
      setBrands(brandRes.data.results || brandRes.data.data || []);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { categories, units, brands, loading, refetch };
};
