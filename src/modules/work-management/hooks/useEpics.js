import { useState, useEffect, useCallback } from "react";
import {
  fetchWorkItems,
  fetchWorkItem,
  updateWorkItem,
} from "../services/workItemService";
import { fetchProjectEpics } from "../services/sprintService";

export const useEpics = (projectId) => {
  const [epics, setEpics] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!projectId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data } = await fetchProjectEpics(projectId);
      setEpics(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Epics loading error:", err);
      setEpics([]);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    load();
  }, [load]);

  return { epics, loading, refetch: load };
};

export const useEpicDetail = (epicId) => {
  const [epic, setEpic] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!epicId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    fetchWorkItem(epicId)
      .then(({ data }) => setEpic(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [epicId]);

  return { epic, loading };
};

export const useEpicChildren = (epicId) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!epicId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data } = await fetchWorkItems({ epic: epicId });
      setItems(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      console.error("Epic children loading error:", err);
    } finally {
      setLoading(false);
    }
  }, [epicId]);

  useEffect(() => {
    load();
  }, [load]);

  return { items, loading, refetch: load };
};

export const useEpicChildItems = useEpicChildren;
