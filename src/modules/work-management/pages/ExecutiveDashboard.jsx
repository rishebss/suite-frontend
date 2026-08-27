import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  ArrowLeft, Loader2, BarChart3, TrendingUp, Ticket,
  Target, Flag, AlertCircle, Users, CheckCircle,
  Clock, GitPullRequest, DollarSign
} from "lucide-react";
import { fetchWorkspaceOverview, fetchExecutiveDashboard } from "../services/dashboardService";

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

const ExecutiveDashboard = () => {
  const { workspaceId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchExecutiveDashboard({ workspace: workspaceId })
      .then(({ data: res }) => setData(res))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [workspaceId]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-white/20" />
      </div>
    );
  }

  const { dev, sales, tickets, overview, milestones } = data || {};

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <header className="px-10 py-6 border-b border-zinc-800 bg-black/50 backdrop-blur-xl shrink-0">
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={() => navigate(`/work/${workspaceId}`)}
            className="p-1.5 rounded-lg hover:bg-zinc-800 text-white/40 hover:text-white transition-colors"
          >
            <ArrowLeft size={16} />
          </button>
          <h1 className="text-xl font-bold text-white">
            <span className="text-purple-400">Executive</span> Dashboard
          </h1>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-10 custom-scrollbar space-y-8">
        {/* Overview Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={BarChart3} color="blue" label="Total Items" value={overview?.total_items || 0}
            sub={`${overview?.completion_pct || 0}% complete`} />
          <StatCard icon={CheckCircle} color="emerald" label="Done" value={overview?.done || 0} />
          <StatCard icon={Clock} color="amber" label="In Progress" value={overview?.in_progress || 0}
            sub={`${overview?.overdue || 0} overdue`} />
          <StatCard icon={Users} color="red" label="Unassigned" value={overview?.unassigned || 0} />
        </div>

        {/* Dev + Sales + Tickets */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Dev Velocity */}
          <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500/20 to-transparent border border-blue-500/20 flex items-center justify-center">
                <GitPullRequest size={14} className="text-blue-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Dev Velocity</h3>
                <p className="text-[10px] text-white/40">Last {dev?.sprints_analyzed || 0} sprints</p>
              </div>
            </div>
            <p className="text-3xl font-bold text-white mb-2">{dev?.avg_velocity || 0}<span className="text-sm font-normal text-white/40"> pts/sprint</span></p>
            <p className="text-xs text-white/40 mb-3">{dev?.active_sprints || 0} active sprints</p>
            {dev?.velocity_trend?.map((s, i) => (
              <div key={i} className="flex items-center justify-between text-[10px] py-1 border-b border-white/5 last:border-0">
                <span className="text-white/60">{s.project_key} / {s.sprint_name}</span>
                <span className={cn("font-semibold", s.completion_pct >= 80 ? "text-emerald-400" : "text-amber-400")}>
                  {s.completed}/{s.committed} ({s.completion_pct}%)
                </span>
              </div>
            ))}
          </div>

          {/* Sales Attainment */}
          <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500/20 to-transparent border border-emerald-500/20 flex items-center justify-center">
                <DollarSign size={14} className="text-emerald-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Sales Attainment</h3>
                <p className="text-[10px] text-white/40">{sales?.active_cycles || 0} active cycles</p>
              </div>
            </div>
            <p className={cn("text-3xl font-bold mb-2",
              (sales?.overall_attainment || 0) >= 100 ? "text-emerald-400" : "text-amber-400"
            )}>
              {sales?.overall_attainment || 0}%
            </p>
            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden mb-2">
              <div
                className={cn("h-full rounded-full transition-all",
                  (sales?.overall_attainment || 0) >= 100 ? "bg-emerald-500" : "bg-amber-500"
                )}
                style={{ width: `${Math.min(sales?.overall_attainment || 0, 100)}%` }}
              />
            </div>
            <p className="text-xs text-white/40">
              {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(sales?.total_achieved || 0)}
              {" / "}
              {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(sales?.total_target || 0)}
            </p>
          </div>

          {/* Ticket SLA Health */}
          <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500/20 to-transparent border border-cyan-500/20 flex items-center justify-center">
                <Ticket size={14} className="text-cyan-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Ticket SLA Health</h3>
                <p className="text-[10px] text-white/40">{tickets?.total_open || 0} open tickets</p>
              </div>
            </div>
            <p className={cn("text-3xl font-bold mb-2",
              (tickets?.sla_health_pct || 100) >= 90 ? "text-emerald-400"
                : (tickets?.sla_health_pct || 100) >= 70 ? "text-amber-400"
                : "text-red-400"
            )}>
              {tickets?.sla_health_pct || 100}%
            </p>
            <div className="flex gap-2 text-[10px]">
              <span className="flex items-center gap-1 text-emerald-400">
                <CheckCircle size={10} /> {tickets?.sla_within || 0}
              </span>
              <span className="flex items-center gap-1 text-amber-400">
                <AlertCircle size={10} /> {tickets?.sla_warning || 0}
              </span>
              <span className="flex items-center gap-1 text-red-400">
                <AlertCircle size={10} /> {tickets?.sla_breached || 0}
              </span>
            </div>
          </div>
        </div>

        {/* Milestones */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Flag size={16} className="text-purple-400" />
            <h3 className="text-sm font-bold text-white">Milestones</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800">
              <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1">Upcoming (30 days)</p>
              <p className="text-2xl font-bold text-amber-400">{milestones?.upcoming_30_days || 0}</p>
            </div>
            <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800">
              <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1">Achieved</p>
              <p className="text-2xl font-bold text-emerald-400">{milestones?.achieved_total || 0}</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ExecutiveDashboard;
