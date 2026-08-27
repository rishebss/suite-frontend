import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Plus, Loader2, ArrowLeft, FolderKanban, BarChart3, Users,
  Layers, Timer, AlertCircle, CheckCircle2, ListChecks, Activity,
} from "lucide-react";
import { useWorkspace, useWorkspaceSummary } from "../hooks/useWorkspaces";
import { useProjects } from "../hooks/useProjects";
import { createProject } from "../services/projectService";

const MODES = [
  { value: "scrum", label: "Dev — Scrum", icon: "🔄", desc: "Sprints, backlog, story points, epics" },
  { value: "kanban", label: "Dev — Kanban", icon: "📋", desc: "Continuous flow board, no sprints" },
  { value: "sales_pipeline", label: "Sales Pipeline", icon: "💰", desc: "Deal stages, targets, forecasts" },
  { value: "support_ticket", label: "Support Tickets", icon: "🎫", desc: "SLA timers, queues, CSAT" },
  { value: "ops_approval", label: "Ops Approval", icon: "✅", desc: "Approval workflows, requests" },
];

const CreateProjectModal = ({ isOpen, onClose, workspaceId, onCreated }) => {
  const [name, setName] = useState("");
  const [key, setKey] = useState("");
  const [description, setDescription] = useState("");
  const [mode, setMode] = useState("scrum");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleNameChange = (value) => {
    setName(value);
    if (!key || key === name.substring(0, 3).toUpperCase()) {
      setKey(value.substring(0, 3).toUpperCase());
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !key.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await createProject({ workspace: workspaceId, name, key: key.toUpperCase(), description, workflow_preset: mode });
      onCreated?.();
      onClose();
      setName("");
      setKey("");
      setDescription("");
      setMode("scrum");
    } catch (err) {
      setError(err.response?.data?.detail || err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-md p-6 shadow-2xl">
        <h2 className="text-lg font-bold text-white mb-4">Create Project</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Smart Klub App"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500/50 placeholder:text-white/20"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">Key *</label>
            <input
              type="text"
              value={key}
              onChange={(e) => setKey(e.target.value.toUpperCase())}
              placeholder="SK"
              maxLength={10}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500/50 placeholder:text-white/20 font-mono uppercase"
            />
            <p className="text-[10px] text-white/30 mt-1">Short prefix for item keys (e.g., SK-001)</p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this project about?"
              rows={3}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500/50 placeholder:text-white/20 resize-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-3">Mode</label>
            <div className="grid grid-cols-1 gap-2">
              {MODES.map((m) => (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => setMode(m.value)}
                  className={cn(
                    "flex items-start gap-3 p-3 rounded-lg border text-left transition-all",
                    mode === m.value
                      ? "border-blue-500/50 bg-blue-500/10"
                      : "border-zinc-800 bg-zinc-900/50 hover:border-zinc-700"
                  )}
                >
                  <span className="text-lg">{m.icon}</span>
                  <div>
                    <p className="text-sm font-semibold text-white">{m.label}</p>
                    <p className="text-[10px] text-white/40">{m.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">{error}</div>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-zinc-700 text-sm text-white/60 hover:text-white transition-all">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="px-6 py-2 rounded-lg bg-blue-500/20 border border-blue-500/30 text-blue-400 hover:bg-blue-500/30 text-sm font-semibold transition-all disabled:opacity-50 flex items-center gap-2">
              {saving && <Loader2 size={14} className="animate-spin" />}
              Create Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const getStatusColor = (totals) => {
  const ratio = totals.total > 0 ? totals.done / totals.total : 0;
  if (ratio >= 0.7) return { bar: "bg-emerald-500", text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" };
  if (ratio >= 0.4) return { bar: "bg-amber-500", text: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" };
  return { bar: "bg-red-500", text: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20" };
};

const WorkspaceDetail = () => {
  const { workspaceId } = useParams();
  const navigate = useNavigate();
  const { workspace, loading: wsLoading } = useWorkspace(workspaceId);
  const { summary } = useWorkspaceSummary(workspaceId);
  const { projects, loading: projLoading, refetch: refetchProjects } = useProjects({ workspace: workspaceId });
  const [showCreate, setShowCreate] = useState(false);

  if (wsLoading || projLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-white/20" />
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-white/40">Workspace not found</p>
      </div>
    );
  }

  const completionPct = summary?.total_work_items > 0
    ? Math.round(((summary.total_work_items - summary.open_items) / summary.total_work_items) * 100)
    : 0;

  const totalWorkItems = summary?.total_work_items || 0;
  const doneItems = totalWorkItems - (summary?.open_items || 0);
  const inProgressItems = summary?.open_items || 0;
  const overdueItems = summary?.overdue_items || 0;

  return (
    <div className="flex flex-col h-full overflow-hidden bg-black">
      <div className="shrink-0 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-pink-600/5" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/3 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-500/3 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />

        <header className="relative px-10 pt-8 pb-6">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => navigate("/work")}
              className="p-1.5 rounded-lg hover:bg-white/5 text-white/40 hover:text-white transition-all"
            >
              <ArrowLeft size={16} />
            </button>
            <span className="text-[11px] font-mono font-medium text-white/20 bg-white/5 px-2 py-0.5 rounded">{workspace.slug}</span>
          </div>

          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-white tracking-tight">{workspace.name}</h1>
              {workspace.description && (
                <p className="text-sm text-white/40 max-w-xl">{workspace.description}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate(`/work/${workspaceId}/roadmap`)}
                className="flex items-center gap-2 px-3.5 h-9 rounded-lg bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/[0.08] hover:border-white/20 transition-all text-[11px] font-semibold uppercase tracking-wider"
              >
                <Layers size={14} /> Roadmap
              </button>
              <button
                onClick={() => navigate(`/work/${workspaceId}/portfolio`)}
                className="flex items-center gap-2 px-3.5 h-9 rounded-lg bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/[0.08] hover:border-white/20 transition-all text-[11px] font-semibold uppercase tracking-wider"
              >
                <BarChart3 size={14} /> Portfolio
              </button>
              <button
                onClick={() => navigate(`/work/${workspaceId}/resources`)}
                className="flex items-center gap-2 px-3.5 h-9 rounded-lg bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/[0.08] hover:border-white/20 transition-all text-[11px] font-semibold uppercase tracking-wider"
              >
                <Users size={14} /> Resources
              </button>
              <div className="w-px h-7 bg-white/10 mx-1" />
              <button
                onClick={() => setShowCreate(true)}
                className="flex items-center gap-2 px-4 h-9 rounded-lg bg-blue-500/15 border border-blue-500/30 text-blue-400 hover:bg-blue-500/25 transition-all text-[11px] font-semibold uppercase tracking-wider"
              >
                <Plus size={14} /> New Project
              </button>
            </div>
          </div>
        </header>
      </div>

      {summary && (
        <div className="px-10 py-6 shrink-0">
          <div className="grid grid-cols-6 gap-4">
            <div className="col-span-6 lg:col-span-2">
              <div className="h-full bg-gradient-to-br from-blue-500/5 to-purple-600/5 border border-blue-500/10 rounded-xl p-5 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white/30">Overall Progress</span>
                  <Activity size={16} className="text-blue-400/60" />
                </div>
                <div className="flex items-end gap-4">
                  <span className="text-4xl font-black text-white tracking-tight">{completionPct}%</span>
                  <div className="flex-1 mb-2">
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-700"
                        style={{ width: `${completionPct}%` }}
                      />
                    </div>
                    <div className="flex justify-between mt-1.5">
                      <span className="text-[10px] text-emerald-400">{doneItems} done</span>
                      <span className="text-[10px] text-white/30">{totalWorkItems} total</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-xl p-4 flex items-center gap-4">
              <div className="w-11 h-11 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                <FolderKanban size={20} className="text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-black text-white">{summary.project_count}</p>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-white/30">Total Projects</p>
              </div>
            </div>

            <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-xl p-4 flex items-center gap-4">
              <div className="w-11 h-11 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                <CheckCircle2 size={20} className="text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-black text-white">{summary.active_projects}</p>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-white/30">Active Projects</p>
              </div>
            </div>

            <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-xl p-4 flex items-center gap-4">
              <div className="w-11 h-11 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                <ListChecks size={20} className="text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-black text-white">{totalWorkItems}</p>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-white/30">Work Items</p>
              </div>
            </div>

            <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-xl p-4 flex items-center gap-4">
              <div className="w-11 h-11 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                <AlertCircle size={20} className="text-red-400" />
              </div>
              <div>
                <p className="text-2xl font-black text-white">{overdueItems}</p>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-white/30">Overdue</p>
              </div>
            </div>

            <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-xl p-4 flex items-center gap-4">
              <div className="w-11 h-11 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
                <Timer size={20} className="text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-black text-white">{summary.active_sprints || 0}</p>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-white/30">Active Sprints</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 overflow-y-auto custom-scrollbar px-10 pb-10">
        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-5">
              <FolderKanban size={36} className="text-white/15" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">No projects yet</h2>
            <p className="text-sm text-white/40 mb-8 max-w-md">
              Create your first project to start organizing work items, tasks, and tickets across your workspace.
            </p>
            <button
              onClick={() => setShowCreate(true)}
              className="px-6 py-3 rounded-lg bg-blue-500/15 border border-blue-500/30 text-blue-400 hover:bg-blue-500/25 transition-all text-sm font-semibold flex items-center gap-2"
            >
              <Plus size={16} /> Create Project
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white/80 flex items-center gap-2">
                <FolderKanban size={16} className="text-white/30" />
                Projects
                <span className="text-[10px] font-normal text-white/20 bg-white/5 px-1.5 py-0.5 rounded-full">{projects.length}</span>
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {projects.map((project) => {
                const summary = project.work_item_summary || {};
                const totals = { total: summary.total || 0, todo: summary.todo || 0, in_progress: summary.in_progress || 0, done: summary.done || 0 };
                const colors = getStatusColor(totals);
                const pct = totals.total > 0 ? Math.round((totals.done / totals.total) * 100) : 0;
                return (
                  <button
                    key={project.id}
                    onClick={() => navigate(`/work/${workspaceId}/${project.id}`)}
                    className="group relative w-full p-5 rounded-xl bg-zinc-900/30 border border-zinc-800/50 hover:border-blue-500/30 transition-all text-left hover:bg-zinc-900/50"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                          style={{ backgroundColor: `${project.color}15` }}
                        >
                          <span className="text-sm font-black" style={{ color: project.color || '#a78bfa' }}>{project.key}</span>
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-sm font-bold text-white truncate group-hover:text-blue-400 transition-colors">
                            {project.name}
                          </h3>
                          {project.member_count !== undefined && (
                            <p className="text-[10px] text-white/30 flex items-center gap-1 mt-0.5">
                              <Users size={10} /> {project.member_count} {project.member_count === 1 ? 'member' : 'members'}
                            </p>
                          )}
                        </div>
                      </div>
                      <span className={cn(
                        "shrink-0 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border",
                        project.is_active
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"
                      )}>
                        {project.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>

                    {project.description && (
                      <p className="text-[11px] text-white/40 line-clamp-2 mb-4 leading-relaxed">{project.description}</p>
                    )}

                    {totals.total > 0 && (
                      <div className="space-y-2.5">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${colors.bar} transition-all duration-500`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className={`text-[11px] font-bold ${colors.text} shrink-0`}>{pct}%</span>
                        </div>
                        <div className="flex items-center gap-3 text-[10px]">
                          <span className="text-white/30 flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-blue-500/70" />
                            {totals.todo} todo
                          </span>
                          <span className="text-amber-400/60 flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-amber-500/70" />
                            {totals.in_progress} in prog
                          </span>
                          <span className="text-emerald-400/60 flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-emerald-500/70" />
                            {totals.done} done
                          </span>
                        </div>
                      </div>
                    )}

                    {totals.total === 0 && (
                      <div className="py-2">
                        <span className="text-[10px] text-white/20 italic">No work items yet</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </main>

      <CreateProjectModal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        workspaceId={workspaceId}
        onCreated={() => refetchProjects()}
      />
    </div>
  );
};

export default WorkspaceDetail;
