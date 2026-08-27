import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { cn } from "@/lib/utils";
import {
  Loader2, ArrowLeft, FileText, Plus, Search, Edit3,
  Trash2, Copy, CheckSquare, X,
} from "lucide-react";

const ISSUE_TYPES = [
  { value: "TASK", label: "Task", color: "bg-blue-500" },
  { value: "BUG", label: "Bug", color: "bg-red-500" },
  { value: "STORY", label: "Story", color: "bg-emerald-500" },
  { value: "EPIC", label: "Epic", color: "bg-purple-500" },
  { value: "SUBTASK", label: "Sub-task", color: "bg-cyan-500" },
  { value: "TICKET", label: "Ticket", color: "bg-amber-500" },
];

const WorkItemTemplatesView = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", description: "", issue_type: "TASK", template_fields: "{}", checklist_items: "[]" });

  const fetchTemplates = () => {
    setLoading(true);
    const params = {};
    if (projectId) params.project = projectId;
    axios.get("/api/work/item-templates/", { params })
      .then((res) => setTemplates(res.data.results || res.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        if (cancelled) return;
        const params = {};
        if (projectId) params.project = projectId;
        const res = await axios.get("/api/work/item-templates/", { params });
        if (!cancelled) setTemplates(res.data.results || res.data || []);
      } catch {} finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [projectId]);

  const openNew = () => {
    setEditing(null);
    setForm({ name: "", description: "", issue_type: "TASK", template_fields: "{}", checklist_items: "[]" });
    setShowForm(true);
  };

  const openEdit = (t) => {
    setEditing(t.id);
    setForm({
      name: t.name,
      description: t.description || "",
      issue_type: t.issue_type,
      template_fields: JSON.stringify(t.template_fields || {}, null, 2),
      checklist_items: JSON.stringify(t.checklist_items || [], null, 2),
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    let template_fields, checklist_items;
    try { template_fields = JSON.parse(form.template_fields); } catch { return alert("Invalid JSON in template_fields"); }
    try { checklist_items = JSON.parse(form.checklist_items); } catch { return alert("Invalid JSON in checklist_items"); }

    const payload = {
      ...form,
      template_fields,
      checklist_items,
      project: projectId || null,
    };
    try {
      if (editing) {
        await axios.patch(`/api/work/item-templates/${editing}/`, payload);
      } else {
        await axios.post("/api/work/item-templates/", payload);
      }
      setShowForm(false);
      fetchTemplates();
    } catch (e) { console.error(e); alert("Save failed"); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this template?")) return;
    try {
      await axios.delete(`/api/work/item-templates/${id}/`);
      fetchTemplates();
    } catch {}
  };

  const filtered = templates.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.issue_type?.toLowerCase().includes(search.toLowerCase())
  );

  const issueTypeMeta = (type) => ISSUE_TYPES.find((i) => i.value === type) || { color: "bg-zinc-500", label: type };

  return (
    <div className="p-4 sm:p-6 max-w-full">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="p-1.5 hover:bg-zinc-800/60 rounded-lg transition-colors">
          <ArrowLeft size={18} className="text-white/50" />
        </button>
        <FileText size={20} className="text-blue-400" />
        <h1 className="text-xl font-bold text-white">Work Item Templates</h1>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
          <input
            value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search templates..." className="w-full bg-zinc-800/50 border border-zinc-700/50 rounded-lg pl-8 pr-3 py-2 text-xs text-white outline-none focus:border-blue-500/50"
          />
        </div>
        <button onClick={openNew} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 text-xs font-semibold transition-all">
          <Plus size={14} /> New Template
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div className="py-20 flex justify-center"><Loader2 size={24} className="animate-spin text-white/20" /></div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center text-white/20 text-sm">
          <FileText size={32} className="mx-auto mb-2 text-white/10" />
          {search ? "No matching templates" : "No templates yet. Create your first one!"}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((t) => {
            const meta = issueTypeMeta(t.issue_type);
            return (
              <div key={t.id} className="rounded-xl bg-zinc-900/30 border border-zinc-800/30 p-4 hover:border-zinc-700/50 transition-colors group">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={cn("w-2.5 h-2.5 rounded-full shrink-0", meta.color)} />
                    <span className="text-xs font-semibold text-white">{t.name}</span>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEdit(t)} className="p-1 rounded hover:bg-zinc-800 text-white/30 hover:text-white transition-colors">
                      <Edit3 size={11} />
                    </button>
                    <button onClick={() => handleDelete(t.id)} className="p-1 rounded hover:bg-zinc-800 text-white/30 hover:text-red-400 transition-colors">
                      <Trash2 size={11} />
                    </button>
                  </div>
                </div>
                {t.description && (
                  <p className="text-[10px] text-white/40 mb-2 line-clamp-2">{t.description}</p>
                )}
                <div className="flex items-center gap-2 text-[9px] text-white/30">
                  <span className="uppercase">{t.issue_type}</span>
                  {t.category && <><span>·</span><span>{t.category}</span></>}
                  {t.checklist_items?.length > 0 && (
                    <><span>·</span><CheckSquare size={9} /> {t.checklist_items.length} items</>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800">
              <h2 className="text-sm font-semibold text-white">{editing ? "Edit Template" : "New Template"}</h2>
              <button onClick={() => setShowForm(false)} className="p-1 hover:bg-zinc-800 rounded"><X size={14} className="text-white/40" /></button>
            </div>
            <div className="p-5 space-y-3">
              <div>
                <label className="block text-[10px] text-white/50 uppercase tracking-wider mb-1">Name *</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-xs text-white outline-none focus:border-blue-500/50" />
              </div>
              <div>
                <label className="block text-[10px] text-white/50 uppercase tracking-wider mb-1">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={2} className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-xs text-white outline-none focus:border-blue-500/50 resize-none" />
              </div>
              <div>
                <label className="block text-[10px] text-white/50 uppercase tracking-wider mb-1">Issue Type</label>
                <select value={form.issue_type} onChange={(e) => setForm({ ...form, issue_type: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-xs text-white outline-none focus:border-blue-500/50">
                  {ISSUE_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] text-white/50 uppercase tracking-wider mb-1">Template Fields (JSON)</label>
                <textarea value={form.template_fields} onChange={(e) => setForm({ ...form, template_fields: e.target.value })}
                  rows={4} className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-[10px] font-mono text-white outline-none focus:border-blue-500/50 resize-none" />
              </div>
              <div>
                <label className="block text-[10px] text-white/50 uppercase tracking-wider mb-1">Checklist Items (JSON array)</label>
                <textarea value={form.checklist_items} onChange={(e) => setForm({ ...form, checklist_items: e.target.value })}
                  rows={3} className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-[10px] font-mono text-white outline-none focus:border-blue-500/50 resize-none" />
              </div>
              <button onClick={handleSave} disabled={!form.name.trim()}
                className="w-full py-2 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 text-xs font-semibold transition-all disabled:opacity-50">
                {editing ? "Update Template" : "Create Template"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkItemTemplatesView;
