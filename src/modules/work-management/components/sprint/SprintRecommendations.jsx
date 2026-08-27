import React, { useState, useEffect } from "react";
import axios from "axios";
import { cn } from "@/lib/utils";
import { Lightbulb, Loader2, Plus, Sparkles, TrendingUp, Clock, Target } from "lucide-react";

const confidenceColors = {
  high: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  medium: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  low: "text-white/40 bg-zinc-800/50 border-zinc-700/30",
};

const SprintRecommendations = ({ projectId, sprintId, onAddItem }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        if (!projectId || cancelled) return;
        const params = { project: projectId };
        if (sprintId) params.sprint = sprintId;
        const res = await axios.get("/api/work/sprints/recommendations/", { params });
        if (!cancelled) setData(res.data);
      } catch { /* ignore */ } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [projectId, sprintId]);

  if (loading) return <div className="py-4 flex justify-center"><Loader2 size={16} className="animate-spin text-white/20" /></div>;
  if (!data) return null;

  return (
    <div className="rounded-xl bg-zinc-900/30 border border-zinc-800/30 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-800/30">
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="text-violet-400" />
          <span className="text-xs font-semibold text-white/70">AI Sprint Recommendations</span>
          <span className={cn("text-[9px] px-1.5 py-0.5 rounded font-medium", confidenceColors[data.confidence] || confidenceColors.low)}>
            {data.confidence} confidence
          </span>
        </div>
        <div className="flex items-center gap-3 text-[9px] text-white/30">
          <span>{data.sprints_analyzed} sprints analyzed</span>
          <span>Velocity: {data.velocity} pts</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-px bg-zinc-800/20">
        {[
          { icon: Target, label: "Recommended", value: `${data.recommended_count} items`, sub: `${data.recommended_points} pts` },
          { icon: TrendingUp, label: "Velocity", value: `${data.velocity} pts`, sub: `avg per sprint` },
          { icon: Clock, label: "Capacity", value: `${data.capacity_hours}h`, sub: `${data.recommended_hours}h used` },
          { icon: Lightbulb, label: "Backlog Left", value: `${data.backlog_remaining} items`, sub: `${data.backlog_points_remaining} pts` },
        ].map((stat) => (
          <div key={stat.label} className="px-3 py-2 bg-zinc-900/20">
            <div className="flex items-center gap-1 text-white/30 mb-0.5">
              <stat.icon size={10} />
              <span className="text-[8px] uppercase tracking-wider">{stat.label}</span>
            </div>
            <p className="text-sm font-bold text-white">{stat.value}</p>
            <p className="text-[9px] text-white/30">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Recommendations list */}
      {data.recommendations?.length > 0 && (
        <div className="divide-y divide-zinc-800/20">
          {data.recommendations.map((item) => (
            <div key={item.id} className="flex items-center gap-2 px-4 py-2 hover:bg-zinc-800/20 transition-colors group">
              <button
                onClick={() => onAddItem?.(item.id)}
                className="p-0.5 rounded hover:bg-blue-500/20 text-white/20 hover:text-blue-400 transition-all opacity-0 group-hover:opacity-100"
                title="Add to sprint"
              >
                <Plus size={12} />
              </button>
              <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: item.status_color || "gray" }} />
              <span className="text-[9px] font-mono text-white/20 w-14 shrink-0">{item.key}</span>
              <span className="text-xs text-white/70 truncate flex-1">{item.title}</span>
              <span className="text-[8px] text-white/20 uppercase">{item.issue_type}</span>
              {item.story_points && (
                <span className="text-[9px] text-white/30 font-mono w-8 text-right">{item.story_points}pt</span>
              )}
              {item.priority && (
                <span className={cn("text-[8px] font-semibold w-12 text-right", {
                  "text-red-400": item.priority === "CRITICAL" || item.priority === "HIGH",
                  "text-amber-400": item.priority === "MEDIUM",
                  "text-white/30": item.priority === "LOW",
                })}>
                  {item.priority}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {data.recommendations?.length === 0 && (
        <div className="px-4 py-6 text-center text-white/20 text-xs">
          <Lightbulb size={20} className="mx-auto mb-1 text-white/10" />
          No backlog items available for recommendation
        </div>
      )}
    </div>
  );
};

export default SprintRecommendations;
