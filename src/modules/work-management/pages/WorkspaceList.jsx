import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Plus, FolderKanban, Users, Loader2, Briefcase, Layout, Layers,
  Code2, TrendingUp, TicketCheck, ArrowRight, Building2, Sparkles,
} from "lucide-react";
import { useWorkspaces } from "../hooks/useWorkspaces";
import { createWorkspace } from "../services/workspaceService";

const MODE_CARDS = [
  { icon: Code2, label: "Dev Mode", desc: "Sprints, epics, backlog, story points", color: "from-blue-500/20 to-cyan-500/20", border: "border-blue-500/20", text: "text-blue-400" },
  { icon: TrendingUp, label: "Sales Mode", desc: "Pipeline, targets, quotas, forecasts", color: "from-emerald-500/20 to-teal-500/20", border: "border-emerald-500/20", text: "text-emerald-400" },
  { icon: TicketCheck, label: "Support Mode", desc: "Tickets, SLA timers, queues, CSAT", color: "from-amber-500/20 to-orange-500/20", border: "border-amber-500/20", text: "text-amber-400" },
  { icon: Layout, label: "Ops Mode", desc: "Approvals, requests, milestones, tasks", color: "from-purple-500/20 to-pink-500/20", border: "border-purple-500/20", text: "text-purple-400" },
];

const CreateWorkspaceModal = ({ isOpen, onClose, onCreated }) => {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleNameChange = (value) => {
    setName(value);
    setSlug(value.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, ""));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const { data } = await createWorkspace({ name, slug, description });
      onCreated?.(data);
      onClose();
      setName("");
      setSlug("");
      setDescription("");
    } catch (err) {
      setError(err.response?.data?.detail || err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-md p-6 shadow-2xl">
        <h2 className="text-lg font-bold text-white mb-4">Create Workspace</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="My Workspace"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500/50 placeholder:text-white/20"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">Slug</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="my-workspace"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500/50 placeholder:text-white/20 font-mono"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this workspace for?"
              rows={3}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500/50 placeholder:text-white/20 resize-none"
            />
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
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const WorkspaceList = () => {
  const navigate = useNavigate();
  const { workspaces, loading, refetch } = useWorkspaces();
  const [showCreate, setShowCreate] = useState(false);
  const [summaries, setSummaries] = useState({});

  useEffect(() => {
    if (workspaces.length === 0) return;
    let cancelled = false;
    Promise.all(
      workspaces.map((ws) =>
        fetch(`/api/work/workspaces/${ws.id}/summary/`)
          .then((r) => r.json())
          .then((data) => ({ id: ws.id, data }))
          .catch(() => ({ id: ws.id, data: null }))
      )
    ).then((results) => {
      if (!cancelled) {
        const map = {};
        results.forEach(({ id, data }) => { map[id] = data; });
        setSummaries(map);
      }
    });
    return () => { cancelled = true; };
  }, [workspaces]);

  return (
    <div className="flex flex-col h-full overflow-hidden bg-black">
      <div className="shrink-0 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-indigo-600/3 to-purple-600/5" />
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-blue-500/4 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-purple-500/3 rounded-full blur-3xl" />

        <div className="relative px-10 pt-10 pb-8">
          <div className="flex items-center justify-between mb-8">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <Sparkles size={20} className="text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white tracking-tight">HertexFlow</h1>
                  <p className="text-[11px] text-white/30 font-medium tracking-wider uppercase">Unified Work Management</p>
                </div>
              </div>
              <p className="text-sm text-white/40 max-w-2xl pl-[3.25rem]">
                One platform for engineering sprints, sales targets, support tickets, and operational workflows — across every workspace.
              </p>
            </div>
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 px-5 h-10 rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 text-blue-300 hover:from-blue-500/30 hover:to-purple-500/30 transition-all text-xs font-bold uppercase tracking-wider shadow-lg shadow-blue-500/5"
            >
              <Plus size={14} /> New Workspace
            </button>
          </div>

          <div className="grid grid-cols-4 gap-3 mb-8">
            {MODE_CARDS.map((m) => {
              const Icon = m.icon;
              return (
                <div key={m.label} className={`rounded-xl bg-gradient-to-br ${m.color} ${m.border} p-4 space-y-2`}>
                  <div className="flex items-center gap-2">
                    <Icon size={16} className={m.text} />
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${m.text}`}>{m.label}</span>
                  </div>
                  <p className="text-[11px] text-white/40 leading-relaxed">{m.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <main className="flex-1 overflow-y-auto custom-scrollbar px-10 pb-10">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={24} className="animate-spin text-white/20" />
          </div>
        ) : workspaces.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-5">
              <Building2 size={36} className="text-white/15" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">No workspaces yet</h2>
            <p className="text-sm text-white/40 mb-8 max-w-md">
              Create your first workspace to organize projects, tasks, and workflows across your teams and departments.
            </p>
            <button
              onClick={() => setShowCreate(true)}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 text-blue-300 hover:from-blue-500/30 hover:to-purple-500/30 transition-all text-sm font-semibold flex items-center gap-2"
            >
              <Plus size={16} /> Create Workspace
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white/80 flex items-center gap-2">
                <Building2 size={16} className="text-white/30" />
                Workspaces
                <span className="text-[10px] font-normal text-white/20 bg-white/5 px-1.5 py-0.5 rounded-full">{workspaces.length}</span>
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {workspaces.map((ws) => {
                const s = summaries[ws.id];
                return (
                  <button
                    key={ws.id}
                    onClick={() => navigate(`/work/${ws.id}`)}
                    className="group relative w-full p-5 rounded-xl bg-zinc-900/30 border border-zinc-800/50 hover:border-blue-500/30 transition-all text-left hover:bg-zinc-900/50"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-500/3 to-transparent rounded-bl-full pointer-events-none" />
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-600/20 border border-blue-500/20 flex items-center justify-center shrink-0">
                        <Briefcase size={18} className="text-blue-400" />
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className={cn(
                          "px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border",
                          ws.is_active
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"
                        )}>
                          {ws.is_active ? "Active" : "Inactive"}
                        </span>
                        <ArrowRight size={14} className="text-white/10 group-hover:text-blue-400/50 group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </div>

                    <h3 className="text-base font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">
                      {ws.name}
                    </h3>
                    {ws.description && (
                      <p className="text-[11px] text-white/40 line-clamp-2 mb-4 leading-relaxed">{ws.description}</p>
                    )}

                    <div className="flex items-center gap-4 text-[10px]">
                      <span className="flex items-center gap-1 text-white/30">
                        <FolderKanban size={12} />
                        {ws.project_count || 0} projects
                      </span>
                      {s && (
                        <>
                          <span className="flex items-center gap-1 text-white/30">
                            <Layers size={12} />
                            {s.total_work_items || 0} items
                          </span>
                          {s.overdue_items > 0 && (
                            <span className="flex items-center gap-1 text-red-400/70">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                              {s.overdue_items} overdue
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </main>

      <CreateWorkspaceModal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={() => refetch()}
      />
    </div>
  );
};

export default WorkspaceList;
