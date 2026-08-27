import React, { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { Loader2, Check, Save, Bookmark, Trash2, Plus, X } from "lucide-react";
import axios from "axios";

const SavedFilterBar = ({ scope, workspaceId, projectId, currentFilters, onApply }) => {
  const [filters, setFilters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showSave, setShowSave] = useState(false);
  const [filterName, setFilterName] = useState("");
  const [activeId, setActiveId] = useState(null);
  const saveRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const params = { scope };
        if (projectId) params.project = projectId;
        else if (workspaceId) params.workspace = workspaceId;
        const res = await axios.get("/api/work/saved-filters/", { params });
        const list = res.data.results || res.data || [];
        setFilters(list);
        const def = list.find((f) => f.is_default);
        if (def) { setActiveId(def.id); onApply?.(def.filter_data); }
      } catch {} finally { setLoading(false); }
    };
    load();
  }, [scope, workspaceId, projectId]);

  useEffect(() => {
    const handleClick = (e) => { if (saveRef.current && !saveRef.current.contains(e.target)) setShowSave(false); };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSave = async () => {
    if (!filterName.trim()) return;
    setSaving(true);
    try {
      const payload = {
        name: filterName,
        scope,
        workspace: workspaceId || null,
        project: projectId || null,
        filter_data: currentFilters,
      };
      const res = await axios.post("/api/work/saved-filters/", payload);
      setFilters((prev) => [...prev, res.data]);
      setFilterName("");
      setShowSave(false);
    } catch {} finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/work/saved-filters/${id}/`);
      setFilters((prev) => prev.filter((f) => f.id !== id));
      if (activeId === id) setActiveId(null);
    } catch {}
  };

  const handleApply = (f) => {
    setActiveId(f.id);
    onApply?.(f.filter_data);
  };

  if (loading && filters.length === 0) return null;

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {filters.map((f) => (
        <div key={f.id} className="relative group">
          <button
            onClick={() => handleApply(f)}
            className={cn(
              "flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium border transition-all",
              activeId === f.id
                ? "bg-blue-500/15 border-blue-500/30 text-blue-400"
                : "bg-zinc-800/50 border-zinc-700/50 text-white/40 hover:text-white/70 hover:border-zinc-600"
            )}
          >
            <Bookmark size={10} />
            {f.name}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleDelete(f.id); }}
            className="absolute -top-1 -right-1 p-0.5 rounded-full bg-zinc-800 text-white/20 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X size={8} />
          </button>
        </div>
      ))}
      <div ref={saveRef} className="relative">
        <button
          onClick={() => setShowSave(!showSave)}
          className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium border border-dashed border-zinc-700 text-white/30 hover:text-white/60 hover:border-zinc-600 transition-all"
        >
          <Plus size={10} /> Save View
        </button>
        {showSave && (
          <div className="absolute top-full left-0 mt-1 bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl z-50 p-3 min-w-[220px]">
            <p className="text-[10px] font-semibold text-white/60 uppercase tracking-wider mb-2">Save Current View</p>
            <input
              type="text"
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
              placeholder="e.g. My Bugs, Q1 Priorities..."
              className="w-full bg-zinc-800 border border-zinc-700 rounded px-2.5 py-1.5 text-xs text-white outline-none focus:border-blue-500/50 mb-2"
              autoFocus
              onKeyDown={(e) => { if (e.key === "Enter") handleSave(); }}
            />
            <div className="flex items-center gap-2">
              <button
                onClick={handleSave}
                disabled={!filterName.trim() || saving}
                className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 rounded bg-blue-500/20 border border-blue-500/30 text-blue-400 hover:bg-blue-500/30 text-[10px] font-semibold transition-all disabled:opacity-50"
              >
                {saving ? <Loader2 size={10} className="animate-spin" /> : <Save size={10} />}
                Save
              </button>
              <button onClick={() => setShowSave(false)} className="px-3 py-1.5 rounded bg-zinc-800 text-white/40 hover:text-white text-[10px] transition-colors">
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedFilterBar;
