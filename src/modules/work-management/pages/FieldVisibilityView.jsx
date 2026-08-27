import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  ArrowLeft, EyeOff, Plus, Edit2, Trash2, Loader2
} from "lucide-react";
import {
  fetchFieldVisibilityRules, createFieldVisibilityRule,
  updateFieldVisibilityRule, deleteFieldVisibilityRule
} from "../services/fieldVisibilityService";

const ROLE_CHOICES = [
  { value: "admin", label: "Admin" },
  { value: "manager", label: "Manager" },
  { value: "developer", label: "Developer" },
  { value: "viewer", label: "Viewer" },
  { value: "customer", label: "Customer" },
];

const VISIBILITY_CHOICES = [
  { value: "visible", label: "Visible" },
  { value: "readonly", label: "Read Only" },
  { value: "hidden", label: "Hidden" },
];

const FieldVisibilityView = () => {
  const { workspaceId, projectId } = useParams();
  const navigate = useNavigate();
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    project: projectId || "", role: "developer", field_name: "", visibility: "visible",
  });

  const fetchData = useCallback(() => {
    setLoading(true);
    const params = {};
    if (projectId) params.project = projectId;
    if (workspaceId) params.project__workspace = workspaceId;
    fetchFieldVisibilityRules(params)
      .then(({ data }) => setRules(data.results || data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [projectId, workspaceId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = () => {
    setEditing(null);
    setForm({ project: projectId || "", role: "developer", field_name: "", visibility: "visible" });
    setShowDialog(true);
  };

  const openEdit = (r) => {
    setEditing(r);
    setForm({ project: r.project || projectId || "", role: r.role, field_name: r.field_name, visibility: r.visibility });
    setShowDialog(true);
  };

  const handleSave = async () => {
    try {
      if (editing) {
        await updateFieldVisibilityRule(editing.id, form);
      } else {
        await createFieldVisibilityRule(form);
      }
      setShowDialog(false);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this visibility rule?")) return;
    try { await deleteFieldVisibilityRule(id); fetchData(); } catch (err) { console.error(err); }
  };

  const visLabel = (v) => VISIBILITY_CHOICES.find((c) => c.value === v)?.label || v;
  const visColor = (v) => {
    if (v === "hidden") return "text-red-400";
    if (v === "readonly") return "text-amber-400";
    return "text-green-400";
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <header className="px-6 py-4 border-b border-zinc-800 bg-black/50 backdrop-blur-xl shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1.5 rounded-lg hover:bg-zinc-800 text-white/40 hover:text-white transition-colors">
            <ArrowLeft size={16} />
          </button>
          <h1 className="text-lg font-bold text-white">Field Visibility</h1>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium transition-colors">
          <Plus size={14} /> New Rule
        </button>
      </header>

      <main className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 size={24} className="animate-spin text-white/20" /></div>
        ) : rules.length === 0 ? (
          <div className="text-center py-20">
            <EyeOff size={40} className="mx-auto text-white/10 mb-3" />
            <p className="text-sm text-white/30">No field visibility rules configured.</p>
            <button onClick={openCreate} className="mt-3 text-xs text-blue-400 hover:text-blue-300">Add rule</button>
          </div>
        ) : (
          <div className="space-y-2">
            {rules.map((r) => (
              <div key={r.id} className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-medium text-white">{r.field_name}</h3>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-zinc-800 text-white/40 border border-zinc-700 capitalize">{r.role}</span>
                    <span className={cn("px-1.5 py-0.5 rounded text-[9px] font-medium border", visColor(r.visibility))}>
                      {visLabel(r.visibility)}
                    </span>
                  </div>
                </div>
                <button onClick={() => openEdit(r)} className="p-1.5 rounded hover:bg-zinc-800 text-white/30 hover:text-white transition-colors">
                  <Edit2 size={12} />
                </button>
                <button onClick={() => handleDelete(r.id)} className="p-1.5 rounded hover:bg-red-900/30 text-white/30 hover:text-red-400 transition-colors">
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      {showDialog && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 w-full max-w-md mx-4">
            <h2 className="text-base font-semibold text-white mb-4">{editing ? "Edit Rule" : "New Visibility Rule"}</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-white/40 mb-1">Field Name</label>
                <input value={form.field_name} onChange={(e) => setForm({ ...form, field_name: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-white/40 mb-1">Role</label>
                  <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white capitalize">
                    {ROLE_CHOICES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-white/40 mb-1">Visibility</label>
                  <select value={form.visibility} onChange={(e) => setForm({ ...form, visibility: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white">
                    {VISIBILITY_CHOICES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
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

export default FieldVisibilityView;
