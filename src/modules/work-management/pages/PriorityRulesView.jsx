import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ArrowLeft, ArrowUpDown, Plus, Edit2, Trash2, Loader2 } from "lucide-react";
import { fetchPriorityRules, createPriorityRule, updatePriorityRule, deletePriorityRule } from "../services/priorityRuleService";

const PRIORITY_OPTIONS = [
  { value: "LOWEST", label: "Lowest", color: "text-zinc-400" },
  { value: "LOW", label: "Low", color: "text-blue-400" },
  { value: "MEDIUM", label: "Medium", color: "text-amber-400" },
  { value: "HIGH", label: "High", color: "text-orange-400" },
  { value: "HIGHEST", label: "Highest", color: "text-red-400" },
  { value: "CRITICAL", label: "Critical", color: "text-red-500" },
];

const PriorityRulesView = () => {
  const { workspaceId, projectId } = useParams();
  const navigate = useNavigate();
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ project: projectId || "", keywords: "urgent, critical, down, broken", suggested_priority: "HIGH", is_active: true });

  const fetchData = useCallback(() => {
    setLoading(true);
    const params = {};
    if (projectId) params.project = projectId;
    fetchPriorityRules(params)
      .then(({ data }) => setRules(data.results || data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [projectId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSave = async () => {
    try {
      const payload = { ...form, keywords: form.keywords.split(",").map((k) => k.trim()).filter(Boolean) };
      if (editing) await updatePriorityRule(editing.id, payload);
      else await createPriorityRule(payload);
      setShowDialog(false);
      fetchData();
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this rule?")) return;
    try { await deletePriorityRule(id); fetchData(); } catch (err) { console.error(err); }
  };

  const priorityLabel = (v) => PRIORITY_OPTIONS.find((o) => o.value === v)?.label || v;
  const priorityColor = (v) => PRIORITY_OPTIONS.find((o) => o.value === v)?.color || "text-white/40";

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <header className="px-6 py-4 border-b border-zinc-800 bg-black/50 backdrop-blur-xl shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1.5 rounded-lg hover:bg-zinc-800 text-white/40 hover:text-white"><ArrowLeft size={16} /></button>
          <h1 className="text-lg font-bold text-white">Priority Rules</h1>
        </div>
        <button onClick={() => { setEditing(null); setForm({ project: projectId || "", keywords: "", suggested_priority: "MEDIUM", is_active: true }); setShowDialog(true); }}
          className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium"><Plus size={14} /> New Rule</button>
      </header>
      <main className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        {loading ? <div className="flex items-center justify-center py-20"><Loader2 size={24} className="animate-spin text-white/20" /></div>
        : rules.length === 0 ? (
          <div className="text-center py-20"><ArrowUpDown size={40} className="mx-auto text-white/10 mb-3" /><p className="text-sm text-white/30">No priority rules defined.</p></div>
        ) : (
          <div className="space-y-2">
            {rules.map((r) => (
              <div key={r.id} className={cn("bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 flex items-center gap-4", !r.is_active && "opacity-50")}>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    {r.keywords?.map((kw, i) => (
                      <span key={i} className="px-1.5 py-0.5 rounded text-[9px] bg-zinc-800 text-white/50 font-mono">{kw}</span>
                    ))}
                  </div>
                </div>
                <span className={cn("px-2 py-1 rounded text-[10px] font-bold", priorityColor(r.suggested_priority))}>
                  {priorityLabel(r.suggested_priority)}
                </span>
                <button onClick={() => { setEditing(r); setForm({ ...r, keywords: Array.isArray(r.keywords) ? r.keywords.join(", ") : "" }); setShowDialog(true); }}
                  className="p-1.5 rounded hover:bg-zinc-800 text-white/30 hover:text-white"><Edit2 size={12} /></button>
                <button onClick={() => handleDelete(r.id)} className="p-1.5 rounded hover:bg-red-900/30 text-white/30 hover:text-red-400"><Trash2 size={12} /></button>
              </div>
            ))}
          </div>
        )}
      </main>

      {showDialog && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 w-full max-w-md mx-4">
            <h2 className="text-base font-semibold text-white mb-4">{editing ? "Edit Rule" : "New Priority Rule"}</h2>
            <div className="space-y-3">
              <div><label className="block text-xs text-white/40 mb-1">Keywords (comma-separated)</label>
                <textarea value={form.keywords} onChange={(e) => setForm({ ...form, keywords: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white resize-none h-16" placeholder="urgent, critical, down, broken" /></div>
              <div><label className="block text-xs text-white/40 mb-1">Suggested Priority</label>
                <select value={form.suggested_priority} onChange={(e) => setForm({ ...form, suggested_priority: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white">
                  {PRIORITY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select></div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                  className="rounded border-zinc-700 bg-zinc-800 text-blue-600" />
                <span className="text-xs text-white/60">Active</span>
              </label>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => setShowDialog(false)} className="px-4 py-2 text-xs text-white/40 hover:text-white">Cancel</button>
              <button onClick={handleSave} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium">{editing ? "Update" : "Create"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PriorityRulesView;
