import { useState, useEffect, useCallback } from "react";
import { fetchWorkItems, fetchWorkItem, fetchMyWorkItems } from "../services/workItemService";

export const useWorkItems = (params = {}) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await fetchWorkItems(params);
      setItems(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => { load(); }, [load]);

  return { items, loading, error, refetch: load };
};

export const useWorkItem = (id) => {
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) { setLoading(false); return; }
    setLoading(true);
    fetchWorkItem(id)
      .then(({ data }) => setItem(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  return { item, loading };
};

export const useMyWorkItems = (params = {}) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await fetchMyWorkItems(params);
      setItems(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      console.error("My items loading error:", err);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => { load(); }, [load]);

  return { items, loading, refetch: load };
};
