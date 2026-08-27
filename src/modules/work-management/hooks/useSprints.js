import { useState, useEffect, useCallback } from "react";
import {
  fetchSprints,
  fetchSprint,
  fetchSprintBurndown,
  fetchSprintStats,
  fetchProjectVelocity,
  fetchProjectEpics,
} from "../services/sprintService";

export const useSprints = (params = {}) => {
  const [sprints, setSprints] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await fetchSprints(params);
      setSprints(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      console.error("Sprints loading error:", err);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => { load(); }, [load]);

  return { sprints, loading, refetch: load };
};

export const useSprint = (id) => {
  const [sprint, setSprint] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) { setLoading(false); return; }
    setLoading(true);
    fetchSprint(id)
      .then(({ data }) => setSprint(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  return { sprint, loading };
};

export const useSprintBurndown = (id) => {
  const [burndown, setBurndown] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) { setLoading(false); return; }
    setLoading(true);
    fetchSprintBurndown(id)
      .then(({ data }) => setBurndown(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  return { burndown, loading };
};

export const useSprintStats = (id) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) { setLoading(false); return; }
    setLoading(true);
    fetchSprintStats(id)
      .then(({ data }) => setStats(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  return { stats, loading };
};

export const useProjectVelocity = (projectId, n = 5) => {
  const [velocity, setVelocity] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!projectId) { setLoading(false); return; }
    setLoading(true);
    fetchProjectVelocity(projectId, { sprints: n })
      .then(({ data }) => setVelocity(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [projectId, n]);

  return { velocity, loading };
};

export const useProjectEpics = (projectId) => {
  const [epics, setEpics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!projectId) { setLoading(false); return; }
    setLoading(true);
    fetchProjectEpics(projectId)
      .then(({ data }) => setEpics(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [projectId]);

  return { epics, loading };
};
