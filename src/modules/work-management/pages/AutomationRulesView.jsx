import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  ArrowLeft, Zap, Plus, Edit2, Trash2, Play, ToggleLeft, ToggleRight, Loader2
} from "lucide-react";
import {
  fetchAutomationRules, createAutomationRule, updateAutomationRule,
  deleteAutomationRule, toggleAutomationRule, testAutomationRule
} from "../services/automationRuleService";

const TRIGGER_CHOICES = [
  { value: "status_change", label: "Status Change" },
  { value: "field_update", label: "Field Update" },
  { value: "time_based", label: "Time Based" },
];

const ACTION_CHOICES = [
  { value: "assign_user", label: "Assign User" },
  { value: "change_status", label: "Change Status" },
  { value: "send_notification", label: "Send Notification" },
  { value: "update_field", label: "Update Field" },
  { value: "webhook", label: "Webhook" },
];

const AutomationRulesView = () => {
  const { workspaceId, projectId } = useParams();
  const navigate = useNavigate();
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    name: "", description: "", trigger_type: "status_change",
    trigger_config: "{}", action_type: "change_status",
    action_config: "{}", is_active: true,
  });

  const fetchData = useCallback(() => {
    setLoading(true);
    const params = {};
    if (projectId) params.project = projectId;
    if (workspaceId) params.workspace = workspaceId;
    fetchAutomationRules(params)
      .then(({ data }) => setRules(data.results || data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [projectId, workspaceId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", description: "", trigger_type: "status_change", trigger_config: "{}", action_type: "change_status", action_config: "{}", is_active: true });
    setShowDialog(true);
  };

  const openEdit = (r) => {
    setEditing(r);
    setForm({
      name: r.name, description: r.description || "",
      trigger_type: r.trigger_type, trigger_config: typeof r.trigger_config === "string" ? r.trigger_config : JSON.stringify(r.trigger_config),
      action_type: r.action_type, action_config: typeof r.action_config === "string" ? r.action_config : JSON.stringify(r.action_config),
      is_active: r.is_active,
    });
    setShowDialog(true);
  };

  const handleSave = async () => {
    try {
      const payload = {
        ...form,
        trigger_config: typeof form.trigger_config === "string" ? JSON.parse(form.trigger_config) : form.trigger_config,
        action_config: typeof form.action_config === "string" ? JSON.parse(form.action_config) : form.action_config,
      };
      if (editing) {
        await updateAutomationRule(editing.id, payload);
      } else {
        await createAutomationRule(payload);
      }
      setShowDialog(false);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this automation rule?")) return;
    try { await deleteAutomationRule(id); fetchData(); } catch (err) { console.error(err); }
  };

  const handleToggle = async (id) => {
    try { await toggleAutomationRule(id); fetchData(); } catch (err) { console.error(err); }
  };

  const handleTest = async (id) => {
    try {
      await testAutomationRule(id);
      alert("Rule test completed. Check server logs.");
    } catch (err) {
      console.error(err);
    }
  };

  const triggerLabel = (t) => TRIGGER_CHOICES.find((c) => c.value === t)?.label || t;
  const actionLabel = (a) => ACTION_CHOICES.find((c) => c.value === a)?.label || a;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <header className="px-6 py-4 border-b border-zinc-800 bg-black/50 backdrop-blur-xl shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1.5 rounded-lg hover:bg-zinc-800 text-white/40 hover:text-white transition-colors">
            <ArrowLeft size={16} />
          </button>
          <h1 className="text-lg font-bold text-white">Automation Rules</h1>
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
            <Zap size={40} className="mx-auto text-white/10 mb-3" />
            <p className="text-sm text-white/30">No automation rules yet.</p>
            <button onClick={openCreate} className="mt-3 text-xs text-blue-400 hover:text-blue-300">Create one</button>
          </div>
        ) : (
          <div className="space-y-2">
            {rules.map((r) => (
              <div key={r.id} className={cn("bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 flex items-center gap-4", !r.is_active && "opacity-50")}>
                <button onClick={() => handleToggle(r.id)} className="text-white/30 hover:text-white transition-colors">
                  {r.is_active ? <ToggleRight size={20} className="text-green-400" /> : <ToggleLeft size={20} />}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-medium text-white">{r.name}</h3>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">{triggerLabel(r.trigger_type)}</span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">{actionLabel(r.action_type)}</span>
                  </div>
                  {r.description && <p className="text-xs text-white/40 mt-0.5">{r.description}</p>}
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => handleTest(r.id)} className="p-1.5 rounded hover:bg-zinc-800 text-white/30 hover:text-cyan-400 transition-colors" title="Test Rule">
                    <Play size={12} />
                  </button>
                  <button onClick={() => openEdit(r)} className="p-1.5 rounded hover:bg-zinc-800 text-white/30 hover:text-white transition-colors">
                    <Edit2 size={12} />
                  </button>
                  <button onClick={() => handleDelete(r.id)} className="p-1.5 rounded hover:bg-red-900/30 text-white/30 hover:text-red-400 transition-colors">
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {showDialog && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 w-full max-w-lg mx-4 max-h-[80vh] overflow-y-auto custom-scrollbar">
            <h2 className="text-base font-semibold text-white mb-4">{editing ? "Edit Rule" : "New Automation Rule"}</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-white/40 mb-1">Name</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white" />
              </div>
              <div>
                <label className="block text-xs text-white/40 mb-1">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white resize-none h-16" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-white/40 mb-1">Trigger Type</label>
                  <select value={form.trigger_type} onChange={(e) => setForm({ ...form, trigger_type: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white">
                    {TRIGGER_CHOICES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-white/40 mb-1">Action Type</label>
                  <select value={form.action_type} onChange={(e) => setForm({ ...form, action_type: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white">
                    {ACTION_CHOICES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs text-white/40 mb-1">Trigger Config (JSON)</label>
                <textarea value={form.trigger_config} onChange={(e) => setForm({ ...form, trigger_config: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white font-mono resize-none h-16" />
              </div>
              <div>
                <label className="block text-xs text-white/40 mb-1">Action Config (JSON)</label>
                <textarea value={form.action_config} onChange={(e) => setForm({ ...form, action_config: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white font-mono resize-none h-16" />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                  className="rounded border-zinc-700 bg-zinc-800 text-blue-600" />
                <span className="text-xs text-white/60">Active on creation</span>
              </label>
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

export default AutomationRulesView;
