import { useState, useCallback, useEffect } from "react";
import {
  fetchCategories,
  fetchCategory,
  createCategory as apiCreateCategory,
  updateCategory as apiUpdateCategory,
  archiveCategory as apiArchiveCategory,
  restoreCategory as apiRestoreCategory,
  fetchCategoryTree,
  exportCategories as apiExportCategories,
} from "../services/categoryService";

export const useCategories = (filters = {}) => {
  const [categories, setCategories] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchCategories(filters);
      setCategories(response.data.results || response.data.data || []);
      setCount(response.data.count || 0);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || "Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]);

  useEffect(() => { refetch(); }, [refetch]);

  return { categories, count, loading, error, refetch };
};

export const useCategory = (id) => {
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(!!id);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetchCategory(id);
      setCategory(response.data.data || response.data);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || "Failed to fetch category");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { refetch(); }, [refetch]);

  return { category, loading, error, refetch };
};

export const useCategoryActions = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createCategory = useCallback(async (data) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiCreateCategory(data);
      return { success: true, data: response.data.data || response.data };
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.detail || err.message || "Failed to create category";
      setError(msg);
      return { success: false, error: msg, errors: err.response?.data };
    } finally {
      setLoading(false);
    }
  }, []);

  const updateCategory = useCallback(async (id, data) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiUpdateCategory(id, data);
      return { success: true, data: response.data.data || response.data };
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.detail || err.message || "Failed to update category";
      setError(msg);
      return { success: false, error: msg, errors: err.response?.data };
    } finally {
      setLoading(false);
    }
  }, []);

  const archiveCategory = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiArchiveCategory(id);
      return { success: true, message: response.data?.message };
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Failed to archive category";
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  const restoreCategory = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiRestoreCategory(id);
      return { success: true, message: response.data?.message };
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Failed to restore category";
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  const exportCategoriesCb = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiExportCategories(params);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      const disposition = response.headers["content-disposition"];
      let filename = "categories.csv";
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
      const msg = err.message || "Failed to export categories";
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, createCategory, updateCategory, archiveCategory, restoreCategory, exportCategories: exportCategoriesCb };
};

export const useCategoryTree = () => {
  const [tree, setTree] = useState([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetchCategoryTree();
      setTree(response.data || []);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refetch(); }, [refetch]);

  return { tree, loading, refetch };
};
