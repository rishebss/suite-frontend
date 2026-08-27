import { useState, useEffect, useCallback } from "react";
import { fetchWorkspaces, fetchWorkspace, fetchWorkspaceSummary } from "../services/workspaceService";

export const useWorkspaces = (params = {}) => {
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await fetchWorkspaces(params);
      setWorkspaces(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => { load(); }, [load]);

  return { workspaces, loading, error, refetch: load };
};

export const useWorkspace = (id) => {
  const [workspace, setWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) { setLoading(false); return; }
    setLoading(true);
    fetchWorkspace(id)
      .then(({ data }) => setWorkspace(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  return { workspace, loading };
};

export const useWorkspaceSummary = (id) => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) { setLoading(false); return; }
    setLoading(true);
    fetchWorkspaceSummary(id)
      .then(({ data }) => setSummary(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  return { summary, loading };
};
