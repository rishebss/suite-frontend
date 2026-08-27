import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  ArrowLeft, Webhook, Plus, Edit2, Trash2, Play, Loader2
} from "lucide-react";
import {
  fetchWebhookConfigs, createWebhookConfig, updateWebhookConfig,
  deleteWebhookConfig, testWebhookConfig
} from "../services/webhookService";

const EVENT_CHOICES = [
  { value: "work_item.created", label: "Work Item Created" },
  { value: "work_item.updated", label: "Work Item Updated" },
  { value: "work_item.deleted", label: "Work Item Deleted" },
  { value: "work_item.status_change", label: "Status Changed" },
  { value: "milestone.achieved", label: "Milestone Achieved" },
];

const WebhookConfigView = () => {
  const { workspaceId, projectId } = useParams();
  const navigate = useNavigate();
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    name: "", url: "", events: "[]", is_active: true,
    secret: "", headers: "{}",
  });

  const fetchData = useCallback(() => {
    setLoading(true);
    const params = {};
    if (workspaceId) params.workspace = workspaceId;
    if (projectId) params.project = projectId;
    fetchWebhookConfigs(params)
      .then(({ data }) => setConfigs(data.results || data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [workspaceId, projectId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", url: "", events: "[]", is_active: true, secret: "", headers: "{}" });
    setShowDialog(true);
  };

  const openEdit = (c) => {
    setEditing(c);
    setForm({
      name: c.name, url: c.url,
      events: Array.isArray(c.events) ? JSON.stringify(c.events) : c.events || "[]",
      is_active: c.is_active, secret: c.secret || "",
      headers: typeof c.headers === "object" ? JSON.stringify(c.headers) : c.headers || "{}",
    });
    setShowDialog(true);
  };

  const handleSave = async () => {
    try {
      const payload = {
        ...form,
        events: typeof form.events === "string" ? JSON.parse(form.events) : form.events,
        headers: typeof form.headers === "string" ? JSON.parse(form.headers) : form.headers,
      };
      if (editing) {
        await updateWebhookConfig(editing.id, payload);
      } else {
        await createWebhookConfig(payload);
      }
      setShowDialog(false);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this webhook?")) return;
    try { await deleteWebhookConfig(id); fetchData(); } catch (err) { console.error(err); }
  };

  const handleTest = async (id) => {
    try {
      const { data } = await testWebhookConfig(id);
      alert(`Webhook test sent. Status: ${data.status || "check logs"}`);
    } catch (err) {
      console.error(err);
    }
  };

  const displayEvents = (events) => {
    if (!events || events.length === 0) return "No events";
    const arr = Array.isArray(events) ? events : JSON.parse(events);
    return arr.slice(0, 2).join(", ") + (arr.length > 2 ? ` +${arr.length - 2}` : "");
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <header className="px-6 py-4 border-b border-zinc-800 bg-black/50 backdrop-blur-xl shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1.5 rounded-lg hover:bg-zinc-800 text-white/40 hover:text-white transition-colors">
            <ArrowLeft size={16} />
          </button>
          <h1 className="text-lg font-bold text-white">Webhook Configurations</h1>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium transition-colors">
          <Plus size={14} /> New Webhook
        </button>
      </header>

      <main className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 size={24} className="animate-spin text-white/20" /></div>
        ) : configs.length === 0 ? (
          <div className="text-center py-20">
            <Webhook size={40} className="mx-auto text-white/10 mb-3" />
            <p className="text-sm text-white/30">No webhook configurations.</p>
            <button onClick={openCreate} className="mt-3 text-xs text-blue-400 hover:text-blue-300">Create one</button>
          </div>
        ) : (
          <div className="space-y-2">
            {configs.map((c) => (
              <div key={c.id} className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-medium text-white">{c.name}</h3>
                    <span className={cn(
                      "px-1.5 py-0.5 rounded text-[9px] font-medium border",
                      c.is_active
                        ? "bg-green-500/10 text-green-400 border-green-500/20"
                        : "bg-zinc-800 text-white/40 border-zinc-700"
                    )}>
                      {c.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <p className="text-xs text-blue-400/60 font-mono mt-0.5">{c.url}</p>
                  <p className="text-[10px] text-white/30 mt-0.5">{displayEvents(c.events)}</p>
                </div>
                <button onClick={() => handleTest(c.id)} className="p-1.5 rounded hover:bg-zinc-800 text-white/30 hover:text-cyan-400 transition-colors" title="Test Webhook">
                  <Play size={12} />
                </button>
                <button onClick={() => openEdit(c)} className="p-1.5 rounded hover:bg-zinc-800 text-white/30 hover:text-white transition-colors">
                  <Edit2 size={12} />
                </button>
                <button onClick={() => handleDelete(c.id)} className="p-1.5 rounded hover:bg-red-900/30 text-white/30 hover:text-red-400 transition-colors">
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      {showDialog && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 w-full max-w-lg mx-4">
            <h2 className="text-base font-semibold text-white mb-4">{editing ? "Edit Webhook" : "New Webhook"}</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-white/40 mb-1">Name</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white" />
              </div>
              <div>
                <label className="block text-xs text-white/40 mb-1">URL Endpoint</label>
                <input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white font-mono" />
              </div>
              <div>
                <label className="block text-xs text-white/40 mb-1">Events (JSON array)</label>
                <textarea value={form.events} onChange={(e) => setForm({ ...form, events: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white font-mono resize-none h-16" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-white/40 mb-1">Secret</label>
                  <input value={form.secret} onChange={(e) => setForm({ ...form, secret: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white" />
                </div>
                <div>
                  <label className="block text-xs text-white/40 mb-1">Headers (JSON)</label>
                  <input value={form.headers} onChange={(e) => setForm({ ...form, headers: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white font-mono" />
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                  className="rounded border-zinc-700 bg-zinc-800 text-blue-600" />
                <span className="text-xs text-white/60">Active</span>
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

export default WebhookConfigView;
