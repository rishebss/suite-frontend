import React, { useState, useEffect, useMemo, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { cn } from "@/lib/utils";
import {
  GitBranch, Loader2, ArrowLeft, ChevronRight, ChevronDown,
  CheckSquare, Target, Link2, Filter, Calendar,
} from "lucide-react";
import SavedFilterBar from "../components/shared/SavedFilterBar";

const BAR_HEIGHT = 22;
const ROW_GAP = 4;
const DAY_WIDTH = 2.5;
const HEADER_HEIGHT = 50;
const SIDEBAR_WIDTH = 280;

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const statusBarColor = (cat) => {
  switch (cat) {
    case "done": return "bg-emerald-500/60 border-emerald-500/40";
    case "in_progress": return "bg-amber-500/60 border-amber-500/40";
    case "review": return "bg-purple-500/60 border-purple-500/40";
    case "cancelled": return "bg-zinc-500/30 border-zinc-500/20";
    default: return "bg-blue-500/50 border-blue-500/30";
  }
};

const milestoneColor = (status) => {
  switch (status) {
    case "ACHIEVED": return "fill-emerald-400 stroke-emerald-400";
    case "MISSED": return "fill-red-400 stroke-red-400";
    case "CANCELLED": return "fill-zinc-500 stroke-zinc-500";
    default: return "fill-amber-400/70 stroke-amber-400";
  }
};

const FALLBACK_END = new Date();
FALLBACK_END.setDate(FALLBACK_END.getDate() + 120);

const RoadmapView = () => {
  const { workspaceId, projectId } = useParams();
  const navigate = useNavigate();
  const scrollRef = useRef(null);

  const [projects, setProjects] = useState([]);
  const [selectedProjects, setSelectedProjects] = useState(new Set());
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedProjects, setExpandedProjects] = useState({});
  const [expandedEpics, setExpandedEpics] = useState({});
  const [showProjectFilter, setShowProjectFilter] = useState(false);
  const [tooltip, setTooltip] = useState(null);

  useEffect(() => {
    axios.get("/api/work/projects/", { params: { workspace: workspaceId } })
      .then((res) => {
        const list = res.data.results || res.data || [];
        setProjects(list);
        if (projectId) setSelectedProjects(new Set([projectId]));
        else if (list.length) setSelectedProjects(new Set(list.slice(0, 5).map((p) => p.id)));
      })
      .catch(() => {});
  }, [workspaceId, projectId]);

  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      try {
        if (cancelled) return;
        const params = { workspace: workspaceId };
        params.project = Array.from(selectedProjects);
        const res = await axios.get("/api/work/dashboard/roadmap/", { params });
        if (cancelled) return;
        const data = res.data;
        setRoadmap(data);
        const ep = {};
        (data.projects || []).forEach((p) => { ep[p.id] = true; });
        setExpandedProjects(ep);
        const ee = {};
        (data.projects || []).forEach((p) =>
          (p.epics || []).forEach((e) => { ee[e.id] = false; })
        );
        setExpandedEpics(ee);
      } catch (e) { if (!cancelled) console.error(e); } finally {
        if (!cancelled) setLoading(false);
      }
    };
    if (selectedProjects.size > 0) fetchData();
    return () => { cancelled = true; };
  }, [workspaceId, selectedProjects]);

  const timelineStart = useMemo(() => {
    if (!roadmap) return new Date();
    const dates = [];
    for (const p of roadmap.projects || []) {
      for (const e of p.epics || []) {
        if (e.start_date) dates.push(new Date(e.start_date));
        if (e.due_date) dates.push(new Date(e.due_date));
        for (const c of e.children || []) {
          if (c.start_date) dates.push(new Date(c.start_date));
          if (c.due_date) dates.push(new Date(c.due_date));
        }
      }
    }
    for (const m of roadmap.milestones || []) {
      if (m.target_date) dates.push(new Date(m.target_date));
    }
    if (dates.length === 0) return new Date();
    const min = new Date(Math.min(...dates));
    min.setDate(min.getDate() - 14);
    min.setHours(0, 0, 0, 0);
    return min;
  }, [roadmap]);

  const timelineEnd = useMemo(() => {
    if (!roadmap) return new Date(FALLBACK_END);
    const dates = [];
    for (const p of roadmap.projects || []) {
      for (const e of p.epics || []) {
        if (e.due_date) dates.push(new Date(e.due_date));
        if (e.start_date) dates.push(new Date(e.start_date));
        for (const c of e.children || []) {
          if (c.due_date) dates.push(new Date(c.due_date));
          if (c.start_date) dates.push(new Date(c.start_date));
        }
      }
    }
    for (const m of roadmap.milestones || []) {
      if (m.target_date) dates.push(new Date(m.target_date));
    }
    const max = dates.length ? new Date(Math.max(...dates)) : new Date(FALLBACK_END);
    max.setDate(max.getDate() + 30);
    return max;
  }, [roadmap]);

  const totalDays = useMemo(() => Math.max(1, Math.ceil((timelineEnd - timelineStart) / 86400000)), [timelineStart, timelineEnd]);
  const totalWidth = totalDays * DAY_WIDTH + 40;

  const dayOffset = (dateStr) => {
    if (!dateStr) return 0;
    const d = new Date(dateStr);
    return Math.max(0, Math.floor((d - timelineStart) / 86400000));
  };

  const barDuration = (startStr, endStr) => {
    const s = dayOffset(startStr);
    const e = endStr ? dayOffset(endStr) : totalDays;
    return Math.max(1, e - s);
  };

  const weeks = useMemo(() => {
    const w = [];
    let cursor = new Date(timelineStart);
    while (cursor < timelineEnd) {
      w.push(new Date(cursor));
      cursor.setDate(cursor.getDate() + 7);
    }
    return w;
  }, [timelineStart, timelineEnd]);

  const months = useMemo(() => {
    const m = [];
    let cursor = new Date(timelineStart.getFullYear(), timelineStart.getMonth(), 1);
    while (cursor < timelineEnd) {
      m.push(new Date(cursor));
      cursor.setMonth(cursor.getMonth() + 1);
    }
    return m;
  }, [timelineStart, timelineEnd]);

  const todayOffset = dayOffset(new Date().toISOString());

  const toggleProject = (id) => setExpandedProjects((prev) => ({ ...prev, [id]: !prev[id] }));
  const toggleEpic = (id) => setExpandedEpics((prev) => ({ ...prev, [id]: !prev[id] }));

  const filteredProjects = useMemo(() =>
    (roadmap?.projects || []).filter((p) => selectedProjects.has(p.id)),
    [roadmap, selectedProjects]
  );

  const visibleRows = useMemo(() => {
    const rows = [];
    for (const p of filteredProjects) {
      rows.push({ type: "project", data: p });
      if (expandedProjects[p.id]) {
        for (const e of p.epics || []) {
          rows.push({ type: "epic", data: e, project: p });
          if (expandedEpics[e.id]) {
            for (const c of e.children || []) {
              rows.push({ type: "child", data: c, project: p, epic: e });
            }
          }
        }
      }
    }
    return rows;
  }, [filteredProjects, expandedProjects, expandedEpics]);

  const handleFilterApply = (filterData) => {
    if (filterData?.project_ids) {
      setSelectedProjects(new Set(filterData.project_ids));
    }
  }

  const currentFilters = useMemo(() => ({
    project_ids: Array.from(selectedProjects),
  }), [selectedProjects]);

  return (
    <div className="h-full flex flex-col bg-zinc-950/50">
      {/* Header */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-zinc-800/50 shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1.5 hover:bg-zinc-800/60 rounded-lg transition-colors">
            <ArrowLeft size={18} className="text-white/50" />
          </button>
          <GitBranch size={20} className="text-violet-400" />
          <h1 className="text-lg font-bold text-white">Roadmap</h1>
          <span className="text-[10px] text-white/30 font-mono px-2 py-0.5 rounded bg-zinc-800/50">
            {totalDays} days
          </span>
        </div>
        <div className="flex items-center gap-2">
          <SavedFilterBar
            scope="roadmap"
            workspaceId={workspaceId}
            projectId={projectId}
            currentFilters={currentFilters}
            onApply={handleFilterApply}
          />
          <div className="relative">
            <button
              onClick={() => setShowProjectFilter(!showProjectFilter)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-800/50 border border-zinc-700/50 text-white/60 hover:text-white/90 text-xs transition-colors"
            >
              <Filter size={12} />
              Projects ({selectedProjects.size})
            </button>
            {showProjectFilter && (
              <div className="absolute top-full right-0 mt-1 bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl z-50 p-3 min-w-[200px] max-h-[300px] overflow-y-auto">
                <p className="text-[10px] font-semibold text-white/50 uppercase tracking-wider mb-2">Select Projects</p>
                {projects.map((p) => (
                  <label key={p.id} className="flex items-center gap-2 py-1 px-1 rounded hover:bg-zinc-800/50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedProjects.has(p.id)}
                      onChange={() => {
                        const next = new Set(selectedProjects);
                        next.has(p.id) ? next.delete(p.id) : next.add(p.id);
                        setSelectedProjects(next);
                      }}
                      className="rounded border-zinc-600"
                    />
                    <span className="text-xs text-white/70 truncate">{p.name}</span>
                  </label>
                ))}
                <button
                  onClick={() => setShowProjectFilter(false)}
                  className="w-full mt-2 py-1 rounded bg-blue-500/20 text-blue-400 text-[10px] font-semibold hover:bg-blue-500/30 transition-colors"
                >
                  Apply
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-hidden relative">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 size={28} className="animate-spin text-white/20" />
          </div>
        ) : !roadmap || filteredProjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-white/20 gap-2">
            <Target size={40} />
            <p className="text-sm">Select projects to see the roadmap</p>
          </div>
        ) : (
          <div className="h-full flex" ref={scrollRef}>
            {/* Sidebar */}
            <div className="shrink-0 border-r border-zinc-800/50 overflow-hidden" style={{ width: SIDEBAR_WIDTH }}>
              <div className="overflow-y-auto h-full custom-scrollbar">
                {visibleRows.map((row) => (
                  <div
                    key={`${row.type}-${row.data.id}`}
                    className={cn(
                      "flex items-center gap-2 px-3 border-b border-zinc-800/20 cursor-pointer hover:bg-zinc-800/20 transition-colors",
                      row.type === "project" && "bg-zinc-900/60",
                      row.type === "epic" && "pl-6",
                      row.type === "child" && "pl-10",
                    )}
                    style={{ height: row.type === "project" ? 32 : 26 }}
                    onClick={() => {
                      if (row.type === "project") toggleProject(row.data.id);
                      else if (row.type === "epic") toggleEpic(row.data.id);
                      else navigate(`/work/${workspaceId}/${row.project?.id || row.data.project || projectId}/item/${row.data.id}`);
                    }}
                  >
                    {row.type === "project" && (
                      <div className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: row.data.color }} />
                    )}
                    {(row.type === "epic" || row.type === "project") && (
                      <span className="text-white/20">
                        {expandedProjects[row.data.id] || expandedEpics[row.data.id]
                          ? <ChevronDown size={10} />
                          : <ChevronRight size={10} />}
                      </span>
                    )}
                    {row.type === "child" && (
                      <div className="w-1 h-1 rounded-full bg-white/20 shrink-0" />
                    )}
                    <div className="flex items-center gap-1.5 min-w-0 flex-1">
                      <span className={cn(
                        "truncate",
                        row.type === "project" && "text-xs font-semibold text-white/80",
                        row.type === "epic" && "text-[11px] text-white/60",
                        row.type === "child" && "text-[10px] text-white/40",
                      )}>
                        {row.type === "project" ? row.data.name : row.data.title}
                      </span>
                      {row.data.story_points && (
                        <span className="text-[8px] text-white/20 font-mono shrink-0">{row.data.story_points}pt</span>
                      )}
                      {row.type === "child" && row.data.key && (
                        <span className="text-[8px] text-white/15 font-mono shrink-0">{row.data.key}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Timeline area */}
            <div className="flex-1 overflow-auto custom-scrollbar">
              <div style={{ minWidth: totalWidth + 40, position: "relative" }}>
                {/* Month headers */}
                <div className="sticky top-0 z-20 bg-zinc-950 border-b border-zinc-800/50" style={{ height: 24 }}>
                  <div className="flex" style={{ marginLeft: 20 }}>
                    {months.map((m, i) => {
                      const left = dayOffset(m.toISOString());
                      const monthEnd = new Date(m.getFullYear(), m.getMonth() + 1, 1);
                      const width = Math.max(20, (dayOffset(monthEnd.toISOString()) - left) * DAY_WIDTH);
                      return (
                        <div
                          key={i}
                          className="text-[9px] text-white/25 font-medium py-1 shrink-0"
                          style={{ width, marginLeft: i === 0 ? left * DAY_WIDTH : 0 }}
                        >
                          {MONTHS[m.getMonth()]} {m.getMonth() === 0 ? m.getFullYear() : ""}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Week grid */}
                <div className="absolute inset-0 pointer-events-none" style={{ top: 24 }}>
                  {weeks.map((w, i) => {
                    const left = dayOffset(w.toISOString()) * DAY_WIDTH + 20;
                    return (
                      <div
                        key={i}
                        className="absolute top-0 bottom-0 border-l border-zinc-800/20"
                        style={{ left }}
                      />
                    );
                  })}
                  {/* Today line */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-red-500/40 z-10"
                    style={{ left: todayOffset * DAY_WIDTH + 20 }}
                  />
                </div>

                {/* Bars */}
                <div style={{ marginLeft: 20, position: "relative", zIndex: 1 }}>
                  {visibleRows.map((row) => {
                    const item = row.data;
                    const sOffset = dayOffset(item.start_date);
                    const dur = barDuration(item.start_date, item.due_date);

                    if (row.type === "project") {
                      return (
                        <div key={`bar-${row.type}-${item.id}`} style={{ height: 32, display: "flex", alignItems: "center" }}>
                          <div className="text-[9px] text-white/15 font-mono ml-2">
                            {item.epic_count} epics
                          </div>
                        </div>
                      );
                    }

                    if (row.type === "epic" || row.type === "child") {
                      return (
                        <div key={`bar-${row.type}-${item.id}`} style={{ height: 26, display: "flex", alignItems: "center", position: "relative" }}>
                          {item.start_date || item.due_date ? (
                            <div
                              className={cn(
                                "h-4 rounded-sm border cursor-pointer hover:brightness-125 transition-all relative group",
                                statusBarColor(item.status_category),
                                row.type === "child" && "h-3 border-0"
                              )}
                              style={{
                                marginLeft: sOffset * DAY_WIDTH,
                                width: Math.max(dur * DAY_WIDTH, row.type === "epic" ? 16 : 8),
                              }}
                              onMouseEnter={(e) => setTooltip({ item, x: e.clientX, y: e.clientY })}
                              onMouseLeave={() => setTooltip(null)}
                              onClick={() => navigate(`/work/${workspaceId}/${row.project?.id || item.project || projectId}/item/${item.id}`)}
                            >
                              {dur * DAY_WIDTH > 30 && (
                                <span className="text-[7px] text-white/60 px-1 truncate block leading-4">
                                  {item.title}
                                </span>
                              )}
                              {/* Progress fill */}
                              {item.is_done && (
                                <div className="absolute inset-0 bg-emerald-400/20 rounded-sm" />
                              )}
                            </div>
                          ) : (
                            <div className="text-[8px] text-white/15 ml-2">No dates</div>
                          )}
                          {row.type === "epic" && item.children?.length > 0 && !item.start_date && !item.due_date && (
                            <div className="text-[8px] text-white/15 ml-2">{item.children.length} items</div>
                          )}
                        </div>
                      );
                    }

                    return null;
                  })}
                </div>

                {/* Milestones */}
                {roadmap.milestones?.length > 0 && (
                  <div className="relative mt-4 border-t border-zinc-800/30 pt-2" style={{ marginLeft: 20 }}>
                    <div className="text-[9px] text-purple-400/60 uppercase tracking-wider font-semibold mb-2 ml-2">Milestones</div>
                    <div style={{ height: 30, position: "relative" }}>
                      {roadmap.milestones.map((m) => {
                        const pos = dayOffset(m.target_date) * DAY_WIDTH;
                        return (
                          <div
                            key={m.id}
                            className="absolute top-0 flex flex-col items-center"
                            style={{ left: pos, transform: "translateX(-50%)" }}
                          >
                            <svg width="14" height="14" viewBox="0 0 14 14" className={milestoneColor(m.status)}>
                              <polygon points="7,0 14,7 7,14 0,7" />
                            </svg>
                            <span className="text-[6px] text-white/30 mt-0.5 whitespace-nowrap">{m.name}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 bg-zinc-900 border border-zinc-700/50 rounded-lg shadow-2xl p-3 pointer-events-none"
          style={{ left: tooltip.x + 12, top: tooltip.y - 10 }}
        >
          <p className="text-xs font-semibold text-white">{tooltip.item.title}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[9px] font-mono text-white/30">{tooltip.item.key}</span>
            <span className="text-[9px] text-white/30">·</span>
            <span className="text-[9px] text-white/40">{tooltip.item.status}</span>
          </div>
          {tooltip.item.assignee && (
            <p className="text-[9px] text-white/30 mt-0.5">{tooltip.item.assignee.display_name}</p>
          )}
          {(tooltip.item.start_date || tooltip.item.due_date) && (
            <p className="text-[9px] text-white/25 mt-0.5 font-mono">
              {tooltip.item.start_date ? new Date(tooltip.item.start_date).toLocaleDateString() : "?"} → {tooltip.item.due_date ? new Date(tooltip.item.due_date).toLocaleDateString() : "?"}
            </p>
          )}
          {tooltip.item.story_points && (
            <p className="text-[9px] text-white/25 mt-0.5">{tooltip.item.story_points} story points</p>
          )}
        </div>
      )}
    </div>
  );
};

export default RoadmapView;
