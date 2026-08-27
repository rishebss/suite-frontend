import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ArrowLeft, LayoutTemplate, Plus, Edit2, Trash2, Loader2, Copy } from "lucide-react";
import { fetchProjectTemplates, createProjectTemplate, updateProjectTemplate, deleteProjectTemplate, createProjectFromTemplate } from "../services/projectTemplateService";

const ProjectTemplatesView = () => {
  const { workspaceId } = useParams();
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [showUseDialog, setShowUseDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", description: "", workflow_preset: "scrum", default_issue_types: "[]", template_data: "{}", is_global: false, category: "" });
  const [useForm, setUseForm] = useState({ name: "", key: "" });
  const [creating, setCreating] = useState(false);

  const fetchData = useCallback(() => {
    setLoading(true);
    fetchProjectTemplates({})
      .then(({ data }) => setTemplates(data.results || data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSave = async () => {
    try {
      const payload = { ...form, default_issue_types: JSON.parse(form.default_issue_types), template_data: JSON.parse(form.template_data) };
      if (editing) await updateProjectTemplate(editing.id, payload);
      else await createProjectTemplate(payload);
      setShowDialog(false);
      fetchData();
    } catch (err) { console.error(err); }
  };

  const handleUse = async () => {
    if (!selectedTemplate || !useForm.name || !useForm.key) return;
    setCreating(true);
    try {
      await createProjectFromTemplate(selectedTemplate.id, { ...useForm, workspace_id: workspaceId });
      setShowUseDialog(false);
      alert("Project created from template!");
    } catch (err) { console.error(err); }
    finally { setCreating(false); }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <header className="px-6 py-4 border-b border-zinc-800 bg-black/50 backdrop-blur-xl shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1.5 rounded-lg hover:bg-zinc-800 text-white/40 hover:text-white"><ArrowLeft size={16} /></button>
          <h1 className="text-lg font-bold text-white">Project Templates</h1>
        </div>
        <button onClick={() => { setEditing(null); setForm({ name: "", description: "", workflow_preset: "scrum", default_issue_types: "[]", template_data: "{}", is_global: false, category: "" }); setShowDialog(true); }}
          className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium">
          <Plus size={14} /> New Template
        </button>
      </header>
      <main className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        {loading ? <div className="flex items-center justify-center py-20"><Loader2 size={24} className="animate-spin text-white/20" /></div>
        : templates.length === 0 ? (
          <div className="text-center py-20"><LayoutTemplate size={40} className="mx-auto text-white/10 mb-3" /><p className="text-sm text-white/30">No project templates yet.</p></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((t) => (
              <div key={t.id} className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 hover:border-zinc-700 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-sm font-medium text-white">{t.name}</h3>
                  <span className={cn("px-1.5 py-0.5 rounded text-[9px] font-medium border shrink-0",
                    t.is_global ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-zinc-800 text-white/40 border-zinc-700")}>
                    {t.is_global ? "Global" : "Local"}
                  </span>
                </div>
                {t.description && <p className="text-xs text-white/40 mb-3 line-clamp-2">{t.description}</p>}
                <div className="flex items-center gap-1 mb-3 flex-wrap">
                  {t.workflow_preset && <span className="px-1.5 py-0.5 rounded text-[9px] bg-blue-500/10 text-blue-400">{t.workflow_preset}</span>}
                  {t.category && <span className="px-1.5 py-0.5 rounded text-[9px] bg-zinc-800 text-white/40">{t.category}</span>}
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => { setSelectedTemplate(t); setUseForm({ name: t.name, key: (t.name || "PRJ").substring(0, 3).toUpperCase() }); setShowUseDialog(true); }}
                    className="flex items-center gap-1 px-2 py-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded text-[10px]"><Copy size={10} /> Use Template</button>
                  <button onClick={() => { setEditing(t); setForm({ name: t.name, description: t.description || "", workflow_preset: t.workflow_preset || "scrum", default_issue_types: JSON.stringify(t.default_issue_types || []), template_data: JSON.stringify(t.template_data || {}), is_global: t.is_global, category: t.category || "" }); setShowDialog(true); }}
                    className="p-1.5 rounded hover:bg-zinc-800 text-white/30 hover:text-white"><Edit2 size={12} /></button>
                  <button onClick={async () => { if (!window.confirm("Delete template?")) return; await deleteProjectTemplate(t.id); fetchData(); }}
                    className="p-1.5 rounded hover:bg-red-900/30 text-white/30 hover:text-red-400"><Trash2 size={12} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {showDialog && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 w-full max-w-md mx-4">
            <h2 className="text-base font-semibold text-white mb-4">{editing ? "Edit Template" : "New Template"}</h2>
            <div className="space-y-3">
              <div><label className="block text-xs text-white/40 mb-1">Name</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white" /></div>
              <div><label className="block text-xs text-white/40 mb-1">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white resize-none h-16" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs text-white/40 mb-1">Workflow Preset</label>
                  <select value={form.workflow_preset} onChange={(e) => setForm({ ...form, workflow_preset: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white">
                    <option value="scrum">Scrum</option>
                    <option value="kanban">Kanban</option>
                    <option value="sales">Sales Pipeline</option>
                    <option value="support">Support Ticket</option>
                  </select></div>
                <div><label className="block text-xs text-white/40 mb-1">Category</label>
                  <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white" /></div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => setShowDialog(false)} className="px-4 py-2 text-xs text-white/40 hover:text-white">Cancel</button>
              <button onClick={handleSave} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium">{editing ? "Update" : "Create"}</button>
            </div>
          </div>
        </div>
      )}

      {showUseDialog && selectedTemplate && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 w-full max-w-md mx-4">
            <h2 className="text-base font-semibold text-white mb-2">Create Project from Template</h2>
            <p className="text-xs text-white/40 mb-4">Template: {selectedTemplate.name}</p>
            <div className="space-y-3">
              <div><label className="block text-xs text-white/40 mb-1">Project Name</label>
                <input value={useForm.name} onChange={(e) => setUseForm({ ...useForm, name: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white" /></div>
              <div><label className="block text-xs text-white/40 mb-1">Project Key</label>
                <input value={useForm.key} onChange={(e) => setUseForm({ ...useForm, key: e.target.value.toUpperCase() })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white font-mono uppercase" /></div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => setShowUseDialog(false)} className="px-4 py-2 text-xs text-white/40 hover:text-white">Cancel</button>
              <button onClick={handleUse} disabled={creating} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium disabled:opacity-50">
                {creating ? "Creating..." : "Create Project"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectTemplatesView;
