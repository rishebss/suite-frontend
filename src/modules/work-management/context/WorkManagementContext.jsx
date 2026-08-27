import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from "react";
import GlobalSearch from "../components/shared/GlobalSearch";

const WorkManagementContext = createContext(null);

export const WorkManagementProvider = ({ children }) => {
  // ── Active Selection State ───────────────────────────────────────────────
  const [activeWorkspaceId, setActiveWorkspaceId] = useState(null);
  const [activeProjectId, setActiveProjectId] = useState(null);
  const [activeWorkItemId, setActiveWorkItemId] = useState(null);

  // ── Filter State ─────────────────────────────────────────────────────────
  const [filters, setFilters] = useState({
    issue_type: null,
    assignee: null,
    status: null,
    priority: null,
    search: null,
  });

  // ── UI State ─────────────────────────────────────────────────────────────
  const [viewMode, setViewMode] = useState("kanban"); // kanban | list | backlog
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [globalSearchOpen, setGlobalSearchOpen] = useState(false);

  // ── Global Search Keyboard Shortcut ──────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setGlobalSearchOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // ── Actions ──────────────────────────────────────────────────────────────
  const clearSelection = useCallback(() => {
    setActiveWorkspaceId(null);
    setActiveProjectId(null);
    setActiveWorkItemId(null);
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      issue_type: null,
      assignee: null,
      status: null,
      priority: null,
      search: null,
    });
  }, []);

  const setFilter = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value || null }));
  }, []);

  const toggleGlobalSearch = useCallback(() => {
    setGlobalSearchOpen((v) => !v);
  }, []);

  const contextValue = useMemo(
    () => ({
      activeWorkspaceId,
      activeProjectId,
      activeWorkItemId,
      filters,
      viewMode,
      sidebarCollapsed,
      globalSearchOpen,
      setActiveWorkspaceId,
      setActiveProjectId,
      setActiveWorkItemId,
      setFilters,
      setViewMode,
      setSidebarCollapsed,
      clearSelection,
      clearFilters,
      setFilter,
      toggleGlobalSearch,
    }),
    [
      activeWorkspaceId,
      activeProjectId,
      activeWorkItemId,
      filters,
      viewMode,
      sidebarCollapsed,
      globalSearchOpen,
      clearSelection,
      clearFilters,
      setFilter,
      toggleGlobalSearch,
    ]
  );

  return (
    <WorkManagementContext.Provider value={contextValue}>
      {children}
      <GlobalSearch isOpen={globalSearchOpen} onClose={() => setGlobalSearchOpen(false)} />
    </WorkManagementContext.Provider>
  );
};

export const useWorkManagement = () => {
  const context = useContext(WorkManagementContext);
  if (!context) {
    throw new Error("useWorkManagement must be used within a WorkManagementProvider");
  }
  return context;
};

export default WorkManagementContext;
