import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ArrowLeft, GitBranch, Loader2, ChevronRight, ChevronDown, Link2 } from "lucide-react";
import { fetchWorkItems } from "../services/workItemService";

const DAY_WIDTH = 2;

const TimelineView = () => {
  const { workspaceId, projectId } = useParams();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState({});

  const fetchData = useCallback(() => {
    setLoading(true);
    Promise.all([
      fetchWorkItems({ project: projectId, issue_type: "EPIC" }),
      fetchWorkItems({ project: projectId, parent__isnull: true }),
    ])
      .then(([epicRes, itemRes]) => {
        const epics = epicRes.data.results || epicRes.data || [];
        const all = itemRes.data.results || itemRes.data || [];
        const grouped = epics.map((epic) => ({
          ...epic,
          children: all.filter((i) => i.epic === epic.id),
        }));
        setItems(grouped.length > 0 ? grouped : all);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [projectId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const today = new Date();
  const dates = [];
  for (let d = new Date(today); d < new Date(today.getTime() + 90 * 86400000); d.setDate(d.getDate() + 1)) {
    dates.push(new Date(d));
  }

  const daysSince = (dateStr) => {
    if (!dateStr) return 0;
    const d = new Date(dateStr);
    return Math.floor((d - dates[0]) / 86400000);
  };

  const duration = (start, end) => {
    const s = daysSince(start);
    const e = end ? daysSince(end) : 45;
    return Math.max(e - s, 1);
  };

  return (
    <div className="p-4 sm:p-6 max-w-full overflow-hidden">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-zinc-800 rounded-lg transition-colors">
          <ArrowLeft size={20} className="text-white/60" />
        </button>
        <GitBranch size={22} className="text-purple-400" />
        <h1 className="text-xl font-bold text-white">Timeline / Roadmap</h1>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 size={24} className="animate-spin text-white/40" /></div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 text-white/30">No epics or items to display. Create epics to see them on the timeline.</div>
      ) : (
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            {/* Month headers */}
            <div className="flex border-b border-zinc-800 mb-2">
              <div className="w-64 shrink-0 pr-4" />
              {dates.filter((d) => d.getDate() === 1).map((d) => (
                <div key={d.toISOString()} className="text-[10px] text-white/30 font-medium py-1" style={{ width: daysSince(new Date(d.getFullYear(), d.getMonth() + 1, 1)) * DAY_WIDTH - daysSince(d) * DAY_WIDTH }}>
                  {d.toLocaleString("default", { month: "short", year: d.getMonth() === 0 ? "numeric" : undefined })}
                </div>
              ))}
            </div>

            {/* Items */}
            <div className="space-y-1">
              {items.map((item) => {
                const isEpic = item.issue_type === "EPIC";
                const isCollapsed = collapsed[item.id];
                const startOffset = daysSince(item.start_date || item.created_at);
                const dur = duration(item.start_date || item.created_at, item.due_date);
                return (
                  <React.Fragment key={item.id}>
                    <div
                      className="flex items-center gap-2 py-2 px-2 rounded-lg hover:bg-zinc-900/40 cursor-pointer group transition-colors"
                      onClick={() => navigate(`/work/${workspaceId}/${projectId}/item/${item.id}`)}
                    >
                      <div className="w-64 shrink-0 flex items-center gap-2 pr-4">
                        {isEpic && (
                          <button onClick={(e) => { e.stopPropagation(); setCollapsed({ ...collapsed, [item.id]: !isCollapsed }); }} className="p-0.5 hover:bg-zinc-800 rounded">
                            {isCollapsed ? <ChevronRight size={12} className="text-white/30" /> : <ChevronDown size={12} className="text-white/30" />}
                          </button>
                        )}
                        <span className="text-[10px] font-mono text-white/20">{item.key}</span>
                        <span className="text-sm text-white truncate">{item.title}</span>
                      </div>
                      <div className="relative flex-1 h-8">
                        <div
                          className={cn(
                            "absolute top-1/2 -translate-y-1/2 h-6 rounded-md flex items-center px-2",
                            isEpic ? "bg-purple-500/20 border border-purple-500/30" : "bg-blue-500/20 border border-blue-500/30"
                          )}
                          style={{ left: startOffset * DAY_WIDTH, width: Math.max(dur * DAY_WIDTH, 20) }}
                        >
                          <span className="text-[9px] text-white/60 truncate">{item.title}</span>
                        </div>
                      </div>
                    </div>
                    {isEpic && !isCollapsed && item.children?.map((child) => {
                      const cStart = daysSince(child.start_date || child.created_at);
                      const cDur = duration(child.start_date || child.created_at, child.due_date);
                      return (
                        <div key={child.id} className="flex items-center gap-2 py-1.5 px-2 pl-10 rounded-lg hover:bg-zinc-900/20 cursor-pointer group transition-colors" onClick={() => navigate(`/work/${workspaceId}/${projectId}/item/${child.id}`)}>
                          <div className="w-56 shrink-0 flex items-center gap-2 pr-4">
                            <span className="text-[10px] font-mono text-white/20">{child.key}</span>
                            <span className="text-xs text-white/70 truncate">{child.title}</span>
                          </div>
                          <div className="relative flex-1 h-6">
                            <div className="absolute top-1/2 -translate-y-1/2 h-4 rounded border border-cyan-500/20 bg-cyan-500/10" style={{ left: cStart * DAY_WIDTH, width: Math.max(cDur * DAY_WIDTH, 10) }}>
                              <span className="text-[8px] text-white/40 px-1 truncate block">{child.title}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimelineView;
