import { useState, useEffect, useCallback } from "react";
import { fetchProjects, fetchProject, fetchProjectBoard, fetchProjectBacklog } from "../services/projectService";

export const useProjects = (params = {}) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await fetchProjects(params);
      setProjects(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => { load(); }, [load]);

  return { projects, loading, error, refetch: load };
};

export const useProject = (id) => {
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!id) { setLoading(false); return; }
    setLoading(true);
    try {
      const { data } = await fetchProject(id);
      setProject(data);
    } catch {
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  return { project, loading, refetch: load };
};

export const useProjectBoard = (id, params = {}) => {
  const [board, setBoard] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!id) { setLoading(false); return; }
    setLoading(true);
    try {
      const { data } = await fetchProjectBoard(id, params);
      setBoard(data);
    } catch (err) {
      console.error("Board loading error:", err);
    } finally {
      setLoading(false);
    }
  }, [id, JSON.stringify(params)]);

  useEffect(() => { load(); }, [load]);

  return { board, loading, refetch: load };
};

export const useProjectBacklog = (id, params = {}) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!id) { setLoading(false); return; }
    setLoading(true);
    try {
      const { data } = await fetchProjectBacklog(id, params);
      setItems(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      console.error("Backlog loading error:", err);
    } finally {
      setLoading(false);
    }
  }, [id, JSON.stringify(params)]);

  useEffect(() => { load(); }, [load]);

  return { items, loading, refetch: load };
};
