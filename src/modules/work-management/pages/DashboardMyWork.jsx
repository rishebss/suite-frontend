import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  ArrowLeft, Loader2, Clock, CheckCircle, AlertTriangle,
  ListTodo, BarChart3, Flag, Calendar, Layers
} from "lucide-react";
import { fetchMyWorkItems } from "../services/workItemService";
import { fetchMyDashboardDetail } from "../services/dashboardService";

const StatCard = ({ icon: Icon, label, value, sub, color = "blue" }) => {
  const colors = {
    blue: "from-blue-500/10 to-transparent border-blue-500/20 text-blue-400",
    emerald: "from-emerald-500/10 to-transparent border-emerald-500/20 text-emerald-400",
    amber: "from-amber-500/10 to-transparent border-amber-500/20 text-amber-400",
    red: "from-red-500/10 to-transparent border-red-500/20 text-red-400",
    purple: "from-purple-500/10 to-transparent border-purple-500/20 text-purple-400",
    cyan: "from-cyan-500/10 to-transparent border-cyan-500/20 text-cyan-400",
  };
  return (
    <div className={cn("p-4 rounded-xl border bg-gradient-to-b", colors[color] || colors.blue)}>
      <div className="flex items-center gap-2 mb-2">
        <Icon size={14} />
        <span className="text-[10px] font-semibold uppercase tracking-wider opacity-70">{label}</span>
      </div>
      <p className="text-2xl font-bold text-white mb-0.5">{value}</p>
      {sub && <p className="text-[10px] text-white/40">{sub}</p>}
    </div>
  );
};

const DashboardMyWork = () => {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [myItems, setMyItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchMyDashboardDetail(),
      fetchMyWorkItems({ limit: 20 }),
    ])
      .then(([dashRes, itemsRes]) => {
        setDashboard(dashRes.data);
        setMyItems(itemsRes.data.results || itemsRes.data || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="p-6 max-w-5xl mx-auto"><Loader2 size={24} className="animate-spin text-white/40 mx-auto mt-20" /></div>;
  }

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <BarChart3 size={22} className="text-blue-400" />
          My Work
        </h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
        <StatCard icon={ListTodo} label="Assigned" value={dashboard?.total_assigned || 0} color="blue" />
        <StatCard icon={Clock} label="In Progress" value={dashboard?.in_progress || 0} color="amber" />
        <StatCard icon={CheckCircle} label="Done" value={dashboard?.done || 0} color="emerald" />
        <StatCard icon={AlertTriangle} label="Overdue" value={dashboard?.overdue_count || dashboard?.overdue || 0} color="red" />
        <StatCard icon={Calendar} label="Due Soon" value={dashboard?.due_soon_count || dashboard?.due_today || 0} color="purple" />
        <StatCard icon={Layers} label="In Sprint" value={dashboard?.active_sprint_items || dashboard?.in_active_sprint || 0} color="cyan" />
      </div>

      {/* Overdue items */}
      {dashboard?.overdue_items?.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-bold text-red-400 mb-3 flex items-center gap-2">
            <AlertTriangle size={14} /> Overdue ({dashboard.overdue_count})
          </h2>
          <div className="space-y-1">
            {dashboard.overdue_items.map((item) => (
              <div key={item.id} className="flex items-center gap-3 p-3 rounded-lg bg-red-500/5 border border-red-500/10 cursor-pointer hover:bg-red-500/10 transition-colors" onClick={() => navigate(`/work/${item.project_id || item.project__id}/board?item=${item.id}`)}>
                <span className="text-xs font-mono text-white/20">{item.key}</span>
                <span className="flex-1 text-sm text-white truncate">{item.title}</span>
                <span className="text-xs text-red-400">{item.project__name || item.project_name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Due soon items */}
      {dashboard?.due_soon_items?.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-bold text-amber-400 mb-3 flex items-center gap-2">
            <Clock size={14} /> Due Soon ({dashboard.due_soon_count})
          </h2>
          <div className="space-y-1">
            {dashboard.due_soon_items.map((item) => (
              <div key={item.id} className="flex items-center gap-3 p-3 rounded-lg bg-amber-500/5 border border-amber-500/10 cursor-pointer hover:bg-amber-500/10 transition-colors">
                <span className="text-xs font-mono text-white/20">{item.key}</span>
                <span className="flex-1 text-sm text-white truncate">{item.title}</span>
                <span className="text-xs text-amber-400">{item.project__name || item.project_name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Project distribution */}
      {dashboard?.project_distribution?.length > 0 && (
        <div>
          <h2 className="text-sm font-bold text-white mb-3">By Project</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {dashboard.project_distribution.map((p) => (
              <div key={p.project__name} className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/30 border border-zinc-800/50">
                <span className="text-sm text-white truncate">{p.project__name}</span>
                <span className="text-xs font-mono text-white/40">{p.count} items</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardMyWork;
