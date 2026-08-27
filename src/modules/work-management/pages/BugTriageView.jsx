import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ArrowLeft, Bug, Search, Filter, AlertTriangle, ArrowUpDown, Loader2, CheckCircle, XCircle, UserCheck } from "lucide-react";
import { fetchWorkItems, updateWorkItem } from "../services/workItemService";
import PriorityBadge from "../components/universal/PriorityBadge";
import EmployeeSelect from "../components/shared/EmployeeSelect";

const SEVERITY_MATRIX = [
  { priority: "CRITICAL", label: "S1 - Critical", color: "bg-red-500/10 text-red-400 border-red-500/20" },
  { priority: "HIGH", label: "S2 - High", color: "bg-orange-500/10 text-orange-400 border-orange-500/20" },
  { priority: "MEDIUM", label: "S3 - Medium", color: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  { priority: "LOW", label: "S4 - Low", color: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
];

const BugTriageView = () => {
  const { workspaceId, projectId } = useParams();
  const navigate = useNavigate();
  const [bugs, setBugs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterPriority, setFilterPriority] = useState("");

  const fetchData = useCallback(() => {
    setLoading(true);
    const params = { project: projectId, issue_type: "BUG" };
    fetchWorkItems(params)
      .then(({ data }) => setBugs(data.results || data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [projectId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const [assigningId, setAssigningId] = useState(null);

  const handleAssign = async (itemId, userId) => {
    if (!userId) return;
    try {
      await updateWorkItem(itemId, { assignee: userId });
      setAssigningId(null);
      fetchData();
    } catch (err) { console.error(err); }
  };

  const handlePriorityChange = async (itemId, priority) => {
    try {
      await updateWorkItem(itemId, { priority });
      fetchData();
    } catch (err) { console.error(err); }
  };

  const filtered = bugs.filter((b) => {
    if (search && !b.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterPriority && b.priority !== filterPriority) return false;
    return true;
  });

  const groupedByPriority = SEVERITY_MATRIX.map((sev) => ({
    ...sev,
    items: filtered.filter((b) => b.priority === sev.priority),
  }));

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-4 mb-6 flex-wrap">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-zinc-800 rounded-lg transition-colors">
          <ArrowLeft size={20} className="text-white/60" />
        </button>
        <Bug size={22} className="text-red-400 shrink-0" />
        <h1 className="text-xl font-bold text-white">Bug Triage Queue</h1>
        <span className="text-xs text-white/30 whitespace-nowrap">({bugs.length} bugs)</span>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search bugs..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-sm text-white outline-none focus:border-red-500/50"
          />
        </div>
        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-red-500/50"
        >
          <option value="">All Priorities</option>
          {SEVERITY_MATRIX.map((s) => (
            <option key={s.priority} value={s.priority}>{s.label}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 size={24} className="animate-spin text-white/40" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {groupedByPriority.map((group) => (
            <div key={group.priority} className={cn("rounded-xl border p-4", group.color)}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={14} />
                  <span className="text-sm font-bold">{group.label}</span>
                </div>
                <span className="text-xs opacity-60">{group.items.length} bugs</span>
              </div>
              <div className="space-y-2">
                {group.items.length === 0 ? (
                  <div className="text-xs opacity-40 py-4 text-center">No bugs in this severity</div>
                ) : (
                  group.items.map((bug) => (
                    <div
                      key={bug.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-black/20 border border-white/5 hover:border-white/10 transition-colors group cursor-pointer"
                      onClick={() => navigate(`/work/${workspaceId}/${projectId}/item/${bug.id}`)}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-white/20">{bug.key}</span>
                          <span className="text-sm text-white truncate">{bug.title}</span>
                          {bug.created_at && (
                            <span className={cn(
                              "text-[9px] px-1.5 py-0.5 rounded-full font-medium",
                              (() => {
                                const age = Math.floor((Date.now() - new Date(bug.created_at).getTime()) / 86400000);
                                if (age > 14) return "bg-red-500/10 text-red-400";
                                if (age > 7) return "bg-amber-500/10 text-amber-400";
                                return "bg-zinc-700 text-zinc-400";
                              })()
                            )}>
                              {Math.floor((Date.now() - new Date(bug.created_at).getTime()) / 86400000)}d
                            </span>
                          )}
                        </div>
                        {bug.assignee_name && (
                          <span className="text-[10px] text-white/30">Assigned to: {bug.assignee_name}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity relative">
                        <select
                          value={bug.priority}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => handlePriorityChange(bug.id, e.target.value)}
                          className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-[10px] text-white outline-none"
                        >
                          {SEVERITY_MATRIX.map((s) => (
                            <option key={s.priority} value={s.priority}>{s.label}</option>
                          ))}
                        </select>
                        <button
                          onClick={(e) => { e.stopPropagation(); setAssigningId(assigningId === bug.id ? null : bug.id); }}
                          className="px-2 py-1 text-[10px] bg-zinc-800 hover:bg-zinc-700 rounded text-white/60 transition-colors flex items-center gap-1"
                        >
                          <UserCheck size={10} /> Assign
                        </button>
                        {assigningId === bug.id && (
                          <div className="absolute top-full right-0 mt-1 z-50 w-56" onClick={(e) => e.stopPropagation()}>
                            <EmployeeSelect
                              value={bug.assignee}
                              onChange={(userId) => { handleAssign(bug.id, userId); }}
                              placeholder="Search employee..."
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BugTriageView;
