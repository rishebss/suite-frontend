import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  ArrowLeft, Columns3, Plus, Edit2, Trash2, Loader2
} from "lucide-react";
import {
  fetchCustomFields, createCustomField, updateCustomField, deleteCustomField
} from "../services/customFieldService";

const FIELD_TYPE_CHOICES = [
  { value: "text", label: "Text" },
  { value: "number", label: "Number" },
  { value: "date", label: "Date" },
  { value: "select", label: "Select (Single)" },
  { value: "multi_select", label: "Multi Select" },
  { value: "boolean", label: "Boolean" },
  { value: "url", label: "URL" },
];

const CustomFieldsView = () => {
  const { workspaceId, projectId } = useParams();
  const navigate = useNavigate();
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    name: "", field_type: "text", description: "", is_required: false,
    default_value: "", options: "[]",
  });

  const fetchData = useCallback(() => {
    setLoading(true);
    const params = {};
    if (workspaceId) params.workspace__id = workspaceId;
    fetchCustomFields(params)
      .then(({ data }) => setFields(data.results || data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [workspaceId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", field_type: "text", description: "", is_required: false, default_value: "", options: "[]" });
    setShowDialog(true);
  };

  const openEdit = (f) => {
    setEditing(f);
    setForm({
      name: f.name, field_type: f.field_type, description: f.description || "",
      is_required: f.is_required, default_value: f.default_value || "",
      options: Array.isArray(f.options) ? JSON.stringify(f.options) : f.options || "[]",
    });
    setShowDialog(true);
  };

  const handleSave = async () => {
    try {
      const payload = {
        ...form,
        options: typeof form.options === "string" ? JSON.parse(form.options) : form.options,
      };
      if (editing) {
        await updateCustomField(editing.id, payload);
      } else {
        await createCustomField(payload);
      }
      setShowDialog(false);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this custom field?")) return;
    try { await deleteCustomField(id); fetchData(); } catch (err) { console.error(err); }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <header className="px-6 py-4 border-b border-zinc-800 bg-black/50 backdrop-blur-xl shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1.5 rounded-lg hover:bg-zinc-800 text-white/40 hover:text-white transition-colors">
            <ArrowLeft size={16} />
          </button>
          <h1 className="text-lg font-bold text-white">Custom Fields</h1>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium transition-colors">
          <Plus size={14} /> New Field
        </button>
      </header>

      <main className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 size={24} className="animate-spin text-white/20" /></div>
        ) : fields.length === 0 ? (
          <div className="text-center py-20">
            <Columns3 size={40} className="mx-auto text-white/10 mb-3" />
            <p className="text-sm text-white/30">No custom fields defined.</p>
            <button onClick={openCreate} className="mt-3 text-xs text-blue-400 hover:text-blue-300">Define one</button>
          </div>
        ) : (
          <div className="space-y-2">
            {fields.map((f) => (
              <div key={f.id} className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-medium text-white">{f.name}</h3>
                    <span className={cn(
                      "px-1.5 py-0.5 rounded text-[9px] font-medium border",
                      f.is_required
                        ? "bg-red-500/10 text-red-400 border-red-500/20"
                        : "bg-zinc-800 text-white/40 border-zinc-700"
                    )}>
                      {f.is_required ? "Required" : "Optional"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[10px] text-white/30 bg-zinc-800 px-1.5 py-0.5 rounded">{f.field_type}</span>
                    {f.description && <span className="text-xs text-white/40">{f.description}</span>}
                  </div>
                </div>
                <button onClick={() => openEdit(f)} className="p-1.5 rounded hover:bg-zinc-800 text-white/30 hover:text-white transition-colors">
                  <Edit2 size={12} />
                </button>
                <button onClick={() => handleDelete(f.id)} className="p-1.5 rounded hover:bg-red-900/30 text-white/30 hover:text-red-400 transition-colors">
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
            <h2 className="text-base font-semibold text-white mb-4">{editing ? "Edit Field" : "New Custom Field"}</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-white/40 mb-1">Name</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white" />
              </div>
              <div>
                <label className="block text-xs text-white/40 mb-1">Type</label>
                <select value={form.field_type} onChange={(e) => setForm({ ...form, field_type: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white">
                  {FIELD_TYPE_CHOICES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-white/40 mb-1">Description</label>
                <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-white/40 mb-1">Default Value</label>
                  <input value={form.default_value} onChange={(e) => setForm({ ...form, default_value: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white" />
                </div>
                <div>
                  <label className="block text-xs text-white/40 mb-1">Options (JSON array)</label>
                  <input value={form.options} onChange={(e) => setForm({ ...form, options: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white font-mono" />
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.is_required} onChange={(e) => setForm({ ...form, is_required: e.target.checked })}
                  className="rounded border-zinc-700 bg-zinc-800 text-blue-600" />
                <span className="text-xs text-white/60">Required</span>
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

export default CustomFieldsView;
