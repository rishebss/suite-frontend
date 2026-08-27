import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { cn } from "@/lib/utils";
import { Loader2, ArrowLeft, BarChart3, Clock, TrendingDown } from "lucide-react";

const AnalyticsView = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState("time-in-status");
  const [tis, setTis] = useState(null);
  const [cycle, setCycle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    if (!projectId) return;
    const load = async () => {
      try {
        if (cancelled) return;
        const params = { project: projectId, days: 90 };
        const [tisRes, cycleRes] = await Promise.all([
          axios.get("/api/work/dashboard/time_in_status/", { params }),
          axios.get("/api/work/dashboard/cycle_time/", { params }),
        ]);
        if (!cancelled) {
          setTis(tisRes.data);
          setCycle(cycleRes.data);
        }
      } catch { /* ignore */ } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [projectId]);

  if (loading) {
    return <div className="flex items-center justify-center h-[60vh]"><Loader2 size={28} className="animate-spin text-white/20" /></div>;
  }

  const maxHours = tis?.statuses ? Math.max(...tis.statuses.map((s) => s.avg_hours), 1) : 1;

  return (
    <div className="p-4 sm:p-6 max-w-full">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="p-1.5 hover:bg-zinc-800/60 rounded-lg transition-colors">
          <ArrowLeft size={18} className="text-white/50" />
        </button>
        <BarChart3 size={20} className="text-blue-400" />
        <h1 className="text-xl font-bold text-white">Analytics</h1>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-6 bg-zinc-900/50 rounded-lg p-1 w-fit">
        <button onClick={() => setTab("time-in-status")} className={cn("px-3 py-1.5 rounded text-xs font-medium transition-colors", tab === "time-in-status" ? "bg-zinc-800 text-white" : "text-white/40 hover:text-white/70")}>
          <Clock size={12} className="inline mr-1" /> Time in Status
        </button>
        <button onClick={() => setTab("cycle-time")} className={cn("px-3 py-1.5 rounded text-xs font-medium transition-colors", tab === "cycle-time" ? "bg-zinc-800 text-white" : "text-white/40 hover:text-white/70")}>
          <TrendingDown size={12} className="inline mr-1" /> Cycle Time
        </button>
      </div>

      {tab === "time-in-status" && tis && (
        <div>
          <p className="text-[10px] text-white/30 mb-4">Last 90 days · {tis.total_items_analyzed} items analyzed</p>
          <div className="space-y-2">
            {tis.statuses?.map((s) => (
              <div key={s.status_id} className="rounded-lg bg-zinc-900/30 border border-zinc-800/30 p-3">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.status_color }} />
                    <span className="text-xs font-medium text-white/80">{s.status_name}</span>
                    <span className={cn("text-[9px] px-1.5 py-0.5 rounded font-medium", {
                      "bg-emerald-500/10 text-emerald-400": s.status_category === "done",
                      "bg-amber-500/10 text-amber-400": s.status_category === "in_progress",
                      "bg-blue-500/10 text-blue-400": s.status_category === "todo",
                      "bg-zinc-500/10 text-white/40": s.status_category === "backlog",
                    })}>
                      {s.status_category}
                    </span>
                  </div>
                  <span className="text-[10px] text-white/30">{s.item_count} items</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-zinc-800 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-blue-500/60 transition-all"
                      style={{ width: `${(s.avg_hours / maxHours) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-mono text-white/70 w-20 text-right">{s.avg_hours}h avg</span>
                  <span className="text-[9px] text-white/30 w-16 text-right font-mono">
                    {s.total_hours.toFixed(0)}h tot
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "cycle-time" && cycle && (
        <div>
          {/* Summary cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <div className="rounded-xl bg-zinc-900/50 border border-zinc-800/50 p-4">
              <p className="text-[9px] text-white/30 uppercase tracking-wider mb-1">Avg Lead Time</p>
              <p className="text-2xl font-bold text-white">{cycle.avg_lead_time_days}<span className="text-sm text-white/30 font-normal">d</span></p>
              <p className="text-[9px] text-white/30 mt-0.5">{cycle.avg_lead_time_hours} hours</p>
            </div>
            <div className="rounded-xl bg-zinc-900/50 border border-zinc-800/50 p-4">
              <p className="text-[9px] text-white/30 uppercase tracking-wider mb-1">Avg Cycle Time</p>
              <p className="text-2xl font-bold text-white">{cycle.avg_cycle_time_days}<span className="text-sm text-white/30 font-normal">d</span></p>
              <p className="text-[9px] text-white/30 mt-0.5">{cycle.avg_cycle_time_hours} hours</p>
            </div>
            <div className="rounded-xl bg-zinc-900/50 border border-zinc-800/50 p-4">
              <p className="text-[9px] text-white/30 uppercase tracking-wider mb-1">Completed</p>
              <p className="text-2xl font-bold text-white">{cycle.total_completed}</p>
              <p className="text-[9px] text-white/30 mt-0.5">items in 90 days</p>
            </div>
            <div className="rounded-xl bg-zinc-900/50 border border-zinc-800/50 p-4">
              <p className="text-[9px] text-white/30 uppercase tracking-wider mb-1">Period</p>
              <p className="text-2xl font-bold text-white">{cycle.period_days}</p>
              <p className="text-[9px] text-white/30 mt-0.5">days analyzed</p>
            </div>
          </div>

          {/* Items table */}
          <div className="rounded-xl bg-zinc-900/30 border border-zinc-800/30 overflow-hidden">
            <div className="px-4 py-2.5 border-b border-zinc-800/50">
              <h3 className="text-[10px] font-semibold text-white/50 uppercase tracking-wider">Items by Cycle Time (longest first)</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[9px] text-white/30 uppercase tracking-wider border-b border-zinc-800/30">
                    <th className="py-2 px-4 font-medium">Item</th>
                    <th className="py-2 px-3 font-medium">Type</th>
                    <th className="py-2 px-3 font-medium">Lead Time</th>
                    <th className="py-2 px-3 font-medium">Cycle Time</th>
                    <th className="py-2 px-3 font-medium">Created</th>
                    <th className="py-2 px-3 font-medium">Completed</th>
                  </tr>
                </thead>
                <tbody>
                  {cycle.items?.map((item) => (
                    <tr key={item.id} className="border-b border-zinc-800/20 hover:bg-zinc-800/20 transition-colors">
                      <td className="py-2 px-4">
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-mono text-white/20">{item.key}</span>
                          <span className="text-xs text-white/70 truncate max-w-[200px]">{item.title}</span>
                        </div>
                      </td>
                      <td className="py-2 px-3"><span className="text-[9px] text-white/30 uppercase">{item.issue_type}</span></td>
                      <td className="py-2 px-3">
                        <span className={cn("text-xs font-mono", item.lead_time_hours && item.lead_time_hours > 168 ? "text-red-400" : "text-white/70")}>
                          {item.lead_time_hours ? `${(item.lead_time_hours / 24).toFixed(1)}d` : "—"}
                        </span>
                      </td>
                      <td className="py-2 px-3">
                        <span className={cn("text-xs font-mono", item.cycle_time_hours && item.cycle_time_hours > 168 ? "text-red-400" : "text-white/70")}>
                          {item.cycle_time_hours ? `${(item.cycle_time_hours / 24).toFixed(1)}d` : "—"}
                        </span>
                      </td>
                      <td className="py-2 px-3">
                        <span className="text-[9px] text-white/30">{item.created_at ? new Date(item.created_at).toLocaleDateString() : "—"}</span>
                      </td>
                      <td className="py-2 px-3">
                        <span className="text-[9px] text-white/30">{item.completed_at ? new Date(item.completed_at).toLocaleDateString() : "—"}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsView;
