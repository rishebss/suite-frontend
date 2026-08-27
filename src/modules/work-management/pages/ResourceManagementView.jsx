import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ArrowLeft, Loader2, Users, Search, Filter, AlertTriangle, BarChart3 } from "lucide-react";
import axios from "axios";

const ResourceManagementView = () => {
  const { workspaceId, projectId } = useParams();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const params = workspaceId ? { workspace: workspaceId } : {};
        const res = await axios.get("/api/work/dashboard/workload/", { params });
        setUsers(res.data || []);
      } catch { setUsers([]); } finally { setLoading(false); }
    };
    load();
  }, [workspaceId]);

  const filtered = search
    ? users.filter((u) => u.full_name?.toLowerCase().includes(search.toLowerCase()))
    : users;

  const getBarColor = (pct) => {
    if (pct > 100) return "bg-red-500";
    if (pct > 80) return "bg-amber-500";
    if (pct > 50) return "bg-blue-500";
    return "bg-green-500";
  };

  const getLabel = (pct) => {
    if (pct > 100) return "Overloaded";
    if (pct > 80) return "Near Capacity";
    if (pct > 50) return "Active";
    return "Available";
  };

  const getLabelColor = (pct) => {
    if (pct > 100) return "text-red-400 bg-red-500/10 border-red-500/20";
    if (pct > 80) return "text-amber-400 bg-amber-500/10 border-amber-500/20";
    if (pct > 50) return "text-blue-400 bg-blue-500/10 border-blue-500/20";
    return "text-green-400 bg-green-500/10 border-green-500/20";
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <header className="px-10 py-6 border-b border-zinc-800 bg-black/50 backdrop-blur-xl shrink-0">
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={() => navigate(projectId ? `/work/${workspaceId}/${projectId}` : `/work/${workspaceId}`)}
            className="p-1.5 rounded-lg hover:bg-zinc-800 text-white/40 hover:text-white transition-colors"
          >
            <ArrowLeft size={16} />
          </button>
          <Users size={16} className="text-blue-400" />
          <h1 className="text-xl font-bold text-white">Resource Management</h1>
          <span className="text-xs text-white/30">({users.length} members)</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search team members..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-sm text-white outline-none focus:border-blue-500/50"
            />
          </div>
          <div className="flex items-center gap-3 text-[10px] text-white/30 ml-auto">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500" /> Available (&lt;50%)</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" /> Active (50-80%)</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" /> Near Cap (80-100%)</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" /> Overloaded (&gt;100%)</span>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-10">
        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 size={24} className="animate-spin text-white/30" /></div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-white/30">
            <Users size={40} className="mb-4 opacity-50" />
            <p className="text-sm">No team members found</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((u) => (
              <div key={u.user_id} className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800 hover:border-zinc-700 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
                    {(u.full_name?.[0] || "?").toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-semibold text-white truncate">{u.full_name}</p>
                      <span className={cn("px-1.5 py-0.5 rounded text-[9px] font-semibold border", getLabelColor(u.utilization_pct))}>
                        {getLabel(u.utilization_pct)}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-[10px] text-white/30">
                      <span><strong className="text-white/60">{u.total_assigned}</strong> assigned</span>
                      <span><strong className="text-white/60">{u.logged_hours}h</strong> logged</span>
                      <span><strong className="text-white/60">{u.capacity_hours}h</strong> capacity</span>
                      <span>{u.projects?.length} project{u.projects?.length !== 1 ? "s" : ""}</span>
                    </div>
                    <div className="mt-2 flex items-center gap-3">
                      <div className="flex-1 h-2 rounded-full bg-zinc-800 overflow-hidden">
                        <div
                          className={cn("h-full rounded-full transition-all", getBarColor(u.utilization_pct))}
                          style={{ width: `${Math.min(u.utilization_pct, 100)}%` }}
                        />
                      </div>
                      <span className={cn(
                        "text-[10px] font-bold w-10 text-right",
                        u.utilization_pct > 100 ? "text-red-400" : "text-white/50"
                      )}>
                        {u.utilization_pct}%
                      </span>
                    </div>
                    {u.utilization_pct > 100 && (
                      <div className="mt-1.5 flex items-center gap-1.5 text-[10px] text-red-400">
                        <AlertTriangle size={10} />
                        Overallocated by {(u.utilization_pct - 100).toFixed(0)}%
                      </div>
                    )}
                  </div>
                  <div className="hidden lg:flex flex-col gap-1.5 min-w-[200px]">
                    <p className="text-[9px] text-white/30 uppercase tracking-wider mb-0.5">Projects</p>
                    {u.projects?.slice(0, 3).map((p) => (
                      <button
                        key={p.project_id}
                        onClick={() => navigate(`/work/${workspaceId || ""}/${p.project_id}`)}
                        className="text-[10px] text-blue-400 hover:text-blue-300 text-left truncate"
                      >
                        {p.project_name}
                      </button>
                    ))}
                    {(u.projects?.length || 0) > 3 && (
                      <p className="text-[9px] text-white/20">+{u.projects.length - 3} more</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default ResourceManagementView;
