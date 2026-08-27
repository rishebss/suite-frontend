import React, { useState, useEffect } from "react";
import axios from "axios";
import { cn } from "@/lib/utils";
import { Loader2, Users, Clock, Plus, Zap } from "lucide-react";

const CapacityPlanning = ({ projectId, sprintId }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        if (!projectId || cancelled) return;
        const params = { project: projectId };
        if (sprintId) params.sprint = sprintId;
        const res = await axios.get("/api/work/dashboard/capacity_plan/", { params });
        if (!cancelled) setData(res.data);
      } catch { /* ignore */ } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [projectId, sprintId]);

  if (loading) return <div className="py-4 flex justify-center"><Loader2 size={16} className="animate-spin text-white/20" /></div>;
  if (!data || data.error) return null;

  const utilization = data.total_capacity > 0 ? Math.round((data.total_assigned / data.total_capacity) * 100) : 0;

  return (
    <div className="rounded-xl bg-zinc-900/30 border border-zinc-800/30 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-800/30">
        <div className="flex items-center gap-2">
          <Zap size={14} className="text-amber-400" />
          <span className="text-xs font-semibold text-white/70">Capacity Planning</span>
        </div>
        <span className={cn("text-[9px] px-1.5 py-0.5 rounded font-medium", utilization > 90 ? "bg-red-500/10 text-red-400" : utilization > 70 ? "bg-amber-500/10 text-amber-400" : "bg-emerald-500/10 text-emerald-400")}>
          {utilization}% utilized
        </span>
      </div>

      {/* Team overview */}
      <div className="divide-y divide-zinc-800/20">
        {data.team?.map((member) => {
          const used = member.assigned_hours || 0;
          const cap = member.capacity_hours || 1;
          const pct = Math.round((used / cap) * 100);
          return (
            <div key={member.id} className="px-4 py-2.5">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Users size={12} className="text-white/30" />
                  <span className="text-xs text-white/70">{member.display_name}</span>
                </div>
                <span className="text-[9px] font-mono text-white/40">{used}h / {cap}h</span>
              </div>
              <div className="w-full bg-zinc-800 rounded-full h-1.5">
                <div
                  className={cn("h-1.5 rounded-full transition-all", pct > 90 ? "bg-red-500" : pct > 70 ? "bg-amber-500" : "bg-blue-500")}
                  style={{ width: `${Math.min(pct, 100)}%` }}
                />
              </div>
              {member.item_count > 0 && (
                <p className="text-[8px] text-white/30 mt-0.5">{member.item_count} items · {member.points || 0} pts</p>
              )}
            </div>
          );
        })}
      </div>

      {/* Suggestions */}
      {data.suggestions?.length > 0 && (
        <div className="border-t border-zinc-800/30">
          <div className="px-4 py-2 bg-zinc-900/20">
            <div className="flex items-center gap-1.5">
              <Plus size={10} className="text-emerald-400" />
              <span className="text-[9px] font-semibold text-white/50 uppercase tracking-wider">Suggested Backlog Items</span>
            </div>
          </div>
          <div className="divide-y divide-zinc-800/20">
            {data.suggestions.slice(0, 10).map((s) => (
              <div key={`${s.user_id}-${s.item_id}`} className="flex items-center gap-2 px-4 py-1.5 hover:bg-zinc-800/20 transition-colors">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400/50 shrink-0" />
                <span className="text-[9px] font-mono text-white/20 w-12 shrink-0">{s.item_key}</span>
                <span className="text-[10px] text-white/60 truncate flex-1">{s.item_title}</span>
                <span className="text-[8px] text-white/30">{s.estimated_hours}h</span>
                <span className="text-[8px] text-white/20 bg-zinc-800 px-1 py-0.5 rounded">{s.user_name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CapacityPlanning;
