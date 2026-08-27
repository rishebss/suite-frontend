import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { cn } from "@/lib/utils";
import {
  Loader2, ArrowLeft, BarChart3, CheckCircle2, AlertTriangle,
  XCircle, Clock, Target, TrendingUp, Users, Layers,
} from "lucide-react";

const healthColor = (status) => {
  switch (status) {
    case "on_track": return "text-emerald-400";
    case "at_risk": return "text-amber-400";
    case "critical": return "text-red-400";
    default: return "text-white/40";
  }
};

const healthBg = (status) => {
  switch (status) {
    case "on_track": return "bg-emerald-500/10 border-emerald-500/20";
    case "at_risk": return "bg-amber-500/10 border-amber-500/20";
    case "critical": return "bg-red-500/10 border-red-500/20";
    default: return "bg-zinc-800/30 border-zinc-700/30";
  }
};

const healthLabel = (score) => {
  if (score >= 70) return { label: "On Track", status: "on_track" };
  if (score >= 40) return { label: "At Risk", status: "at_risk" };
  return { label: "Critical", status: "critical" };
};

const PortfolioView = () => {
  const { workspaceId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!workspaceId) return;
    axios.get("/api/work/dashboard/portfolio/", { params: { workspace: workspaceId } })
      .then((res) => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [workspaceId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 size={28} className="animate-spin text-white/20" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6 text-center text-white/30">
        <BarChart3 size={40} className="mx-auto mb-2 text-white/10" />
        <p>Could not load portfolio data</p>
      </div>
    );
  }

  const sortedProjects = [...(data.projects || [])].sort((a, b) => a.health_score - b.health_score);

  return (
    <div className="p-4 sm:p-6 max-w-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="p-1.5 hover:bg-zinc-800/60 rounded-lg transition-colors">
          <ArrowLeft size={18} className="text-white/50" />
        </button>
        <BarChart3 size={22} className="text-emerald-400" />
        <h1 className="text-xl font-bold text-white">Portfolio Overview</h1>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="rounded-xl bg-zinc-900/50 border border-zinc-800/50 p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-white/40 uppercase tracking-wider">Projects</span>
            <Layers size={14} className="text-white/30" />
          </div>
          <p className="text-2xl font-bold text-white">{data.project_count}</p>
          <div className="flex items-center gap-2 mt-1 text-[9px]">
            <span className="text-emerald-400">{data.summary?.on_track || 0} on track</span>
            <span className="text-amber-400">{data.summary?.at_risk || 0} at risk</span>
          </div>
        </div>
        <div className="rounded-xl bg-zinc-900/50 border border-zinc-800/50 p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-white/40 uppercase tracking-wider">Items</span>
            <Target size={14} className="text-white/30" />
          </div>
          <p className="text-2xl font-bold text-white">{data.total_items}</p>
          <div className="flex items-center gap-2 mt-1 text-[9px]">
            <CheckCircle2 size={10} className="text-emerald-400" />
            <span className="text-emerald-400">{data.total_completed} done</span>
            <span className="text-white/30">({data.completion_pct}%)</span>
          </div>
        </div>
        <div className="rounded-xl bg-zinc-900/50 border border-zinc-800/50 p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-white/40 uppercase tracking-wider">Overdue</span>
            <Clock size={14} className="text-white/30" />
          </div>
          <p className={cn("text-2xl font-bold", data.total_overdue > 0 ? "text-red-400" : "text-emerald-400")}>
            {data.total_overdue}
          </p>
          <p className="text-[9px] text-white/30 mt-1">
            {data.total_overdue > 0 ? "Items past due date" : "No overdue items"}
          </p>
        </div>
        <div className="rounded-xl bg-zinc-900/50 border border-zinc-800/50 p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-white/40 uppercase tracking-wider">Story Points</span>
            <TrendingUp size={14} className="text-white/30" />
          </div>
          <p className="text-2xl font-bold text-white">
            {data.total_points_delivered}
            <span className="text-sm text-white/30 font-normal"> / {data.total_points_delivered + data.total_points_remaining}</span>
          </p>
          <div className="w-full bg-zinc-800 rounded-full h-1.5 mt-2">
            <div
              className="bg-blue-500 h-1.5 rounded-full transition-all"
              style={{ width: `${data.total_points_delivered + data.total_points_remaining > 0
                ? (data.total_points_delivered / (data.total_points_delivered + data.total_points_remaining)) * 100 : 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* Health heatmap */}
      <div className="rounded-xl bg-zinc-900/30 border border-zinc-800/30 p-4 mb-6">
        <h2 className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-3">Project Health</h2>
        <div className="flex items-center gap-1.5 flex-wrap">
          {sortedProjects.map((p) => {
            const { label, status } = healthLabel(p.health_score);
            return (
              <div
                key={p.id}
                onClick={() => navigate(`/work/${workspaceId}/${p.id}`)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer hover:brightness-125 transition-all",
                  healthBg(status),
                )}
              >
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                <div>
                  <p className="text-xs font-medium text-white/80">{p.name}</p>
                  <div className="flex items-center gap-1.5">
                    <span className={cn("text-[9px] font-semibold", healthColor(status))}>{label}</span>
                    <span className="text-[9px] text-white/30">· {p.health_score}%</span>
                    <span className="text-[9px] text-white/20">{p.completion_pct}% done</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detailed project table */}
      <div className="rounded-xl bg-zinc-900/30 border border-zinc-800/30 overflow-hidden">
        <div className="px-4 py-3 border-b border-zinc-800/50">
          <h2 className="text-xs font-semibold text-white/60 uppercase tracking-wider">Project Details</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[9px] text-white/30 uppercase tracking-wider border-b border-zinc-800/30">
                <th className="py-2.5 px-4 font-medium">Project</th>
                <th className="py-2.5 px-3 font-medium">Health</th>
                <th className="py-2.5 px-3 font-medium">Progress</th>
                <th className="py-2.5 px-3 font-medium">Items</th>
                <th className="py-2.5 px-3 font-medium">Overdue</th>
                <th className="py-2.5 px-3 font-medium">Points</th>
                <th className="py-2.5 px-3 font-medium">Days Left</th>
              </tr>
            </thead>
            <tbody>
              {sortedProjects.map((p) => {
                const { label, status } = healthLabel(p.health_score);
                return (
                  <tr
                    key={p.id}
                    onClick={() => navigate(`/work/${workspaceId}/${p.id}`)}
                    className="border-b border-zinc-800/20 hover:bg-zinc-800/20 cursor-pointer transition-colors"
                  >
                    <td className="py-2.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
                        <span className="text-xs text-white/80 font-medium">{p.name}</span>
                        <span className="text-[9px] text-white/20 font-mono">{p.key}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-1.5">
                        <div className={cn("w-1.5 h-1.5 rounded-full", {
                          "bg-emerald-400": status === "on_track",
                          "bg-amber-400": status === "at_risk",
                          "bg-red-400": status === "critical",
                        })} />
                        <span className={cn("text-[10px] font-medium", healthColor(status))}>{label}</span>
                        <span className="text-[9px] text-white/30">{p.health_score}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-zinc-800 rounded-full h-1.5">
                          <div
                            className={cn("h-1.5 rounded-full transition-all", {
                              "bg-emerald-500": p.completion_pct >= 80,
                              "bg-blue-500": p.completion_pct >= 50 && p.completion_pct < 80,
                              "bg-amber-500": p.completion_pct >= 25 && p.completion_pct < 50,
                              "bg-red-500": p.completion_pct < 25,
                            })}
                            style={{ width: `${p.completion_pct}%` }}
                          />
                        </div>
                        <span className="text-[9px] text-white/40 font-mono">{p.completion_pct}%</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="text-xs text-white/70">{p.total_items}</span>
                      <span className="text-[9px] text-white/30 ml-1">({p.completed_items})</span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={cn("text-xs", p.overdue_items > 0 ? "text-red-400" : "text-white/40")}>
                        {p.overdue_items}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="text-xs text-white/70">{p.points_delivered}</span>
                      <span className="text-[9px] text-white/30 ml-1">/ {p.points_delivered + p.points_remaining}</span>
                    </td>
                    <td className="py-2.5 px-3">
                      {p.days_remaining !== null && p.days_remaining !== undefined ? (
                        <span className={cn("text-xs", p.days_remaining < 0 ? "text-red-400" : p.days_remaining < 30 ? "text-amber-400" : "text-white/40")}>
                          {p.days_remaining < 0 ? `${Math.abs(p.days_remaining)}d overdue` : `${p.days_remaining}d`}
                        </span>
                      ) : (
                        <span className="text-[9px] text-white/20">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PortfolioView;
