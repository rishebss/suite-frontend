import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  ArrowLeft, Flag, Plus, CheckCircle, XCircle, Edit2,
  Trash2, Calendar, Loader2, AlertCircle
} from "lucide-react";
import {
  fetchMilestones, createMilestone, updateMilestone,
  deleteMilestone, achieveMilestone, missMilestone
} from "../services/milestoneService";

const STATUS_STYLES = {
  PENDING: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  ACHIEVED: "bg-green-500/10 text-green-400 border-green-500/20",
  MISSED: "bg-red-500/10 text-red-400 border-red-500/20",
};

const MilestonesView = () => {
  const { workspaceId, projectId } = useParams();
  const navigate = useNavigate();
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: "", description: "", target_date: "", project: projectId || "" });

  const fetchData = useCallback(() => {
    setLoading(true);
    const params = {};
    if (projectId) params.project = projectId;
    if (workspaceId) params.workspace = workspaceId;
    fetchMilestones(params)
      .then(({ data }) => setMilestones(data.results || data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [projectId, workspaceId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = () => {
    setEditing(null);
    setForm({ title: "", description: "", target_date: "", project: projectId || "" });
    setShowDialog(true);
  };

  const openEdit = (m) => {
    setEditing(m);
    setForm({ title: m.title, description: m.description || "", target_date: m.target_date || "", project: m.project || projectId || "" });
    setShowDialog(true);
  };

  const handleSave = async () => {
    try {
      if (editing) {
        await updateMilestone(editing.id, form);
      } else {
        await createMilestone(form);
      }
      setShowDialog(false);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this milestone?")) return;
    try {
      await deleteMilestone(id);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAchieve = async (id) => {
    try {
      await achieveMilestone(id);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMiss = async (id) => {
    try {
      await missMilestone(id);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <header className="px-6 py-4 border-b border-zinc-800 bg-black/50 backdrop-blur-xl shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1.5 rounded-lg hover:bg-zinc-800 text-white/40 hover:text-white transition-colors">
            <ArrowLeft size={16} />
          </button>
          <h1 className="text-lg font-bold text-white">Milestones</h1>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium transition-colors">
          <Plus size={14} /> New Milestone
        </button>
      </header>

      <main className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={24} className="animate-spin text-white/20" />
          </div>
        ) : milestones.length === 0 ? (
          <div className="text-center py-20">
            <Flag size={40} className="mx-auto text-white/10 mb-3" />
            <p className="text-sm text-white/30">No milestones yet.</p>
            <button onClick={openCreate} className="mt-3 text-xs text-blue-400 hover:text-blue-300">Create one</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {milestones.map((m) => {
              const isPast = m.target_date && new Date(m.target_date) < new Date();
              const dueLabel = m.target_date
                ? (() => {
                    const d = new Date(m.target_date);
                    const now = new Date();
                    const diff = Math.ceil((d - now) / (1000 * 60 * 60 * 24));
                    if (diff < 0) return `${Math.abs(diff)}d overdue`;
                    if (diff === 0) return "Due today";
                    return `${diff}d remaining`;
                  })()
                : "No due date";
              return (
                <div key={m.id} className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 hover:border-zinc-700 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-white truncate">{m.title}</h3>
                      {m.description && <p className="text-xs text-white/40 mt-1 line-clamp-2">{m.description}</p>}
                    </div>
                    <span className={cn("px-2 py-0.5 rounded text-[9px] font-medium border ml-2 shrink-0", STATUS_STYLES[m.status] || STATUS_STYLES.PENDING)}>
                      {m.status || "PENDING"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-white/30 mb-3">
                    <Calendar size={11} />
                    <span>{m.target_date ? new Date(m.target_date).toLocaleDateString() : "No date"}</span>
                    <span className={cn("ml-1", isPast && m.status === "PENDING" ? "text-red-400" : "text-white/30")}>({dueLabel})</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {m.status === "PENDING" && (
                      <>
                        <button onClick={() => handleAchieve(m.id)} className="flex items-center gap-1 px-2 py-1 bg-green-600/20 hover:bg-green-600/30 text-green-400 rounded text-[10px] font-medium transition-colors">
                          <CheckCircle size={10} /> Achieve
                        </button>
                        <button onClick={() => handleMiss(m.id)} className="flex items-center gap-1 px-2 py-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded text-[10px] font-medium transition-colors">
                          <XCircle size={10} /> Miss
                        </button>
                      </>
                    )}
                    <button onClick={() => openEdit(m)} className="p-1.5 rounded hover:bg-zinc-800 text-white/30 hover:text-white transition-colors">
                      <Edit2 size={12} />
                    </button>
                    <button onClick={() => handleDelete(m.id)} className="p-1.5 rounded hover:bg-red-900/30 text-white/30 hover:text-red-400 transition-colors">
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {showDialog && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 w-full max-w-md mx-4">
            <h2 className="text-base font-semibold text-white mb-4">{editing ? "Edit Milestone" : "New Milestone"}</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-white/40 mb-1">Title</label>
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white" />
              </div>
              <div>
                <label className="block text-xs text-white/40 mb-1">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white resize-none h-20" />
              </div>
              <div>
                <label className="block text-xs text-white/40 mb-1">Target Date</label>
                <input type="date" value={form.target_date} onChange={(e) => setForm({ ...form, target_date: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white" />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => setShowDialog(false)} className="px-4 py-2 text-xs text-white/40 hover:text-white transition-colors">Cancel</button>
              <button onClick={handleSave} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium transition-colors">
                {editing ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MilestonesView;
