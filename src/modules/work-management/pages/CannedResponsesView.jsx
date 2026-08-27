import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ArrowLeft, MessageSquare, Plus, Edit2, Trash2, Loader2 } from "lucide-react";
import { fetchCannedResponses, createCannedResponse, updateCannedResponse, deleteCannedResponse } from "../services/cannedResponseService";

const CannedResponsesView = () => {
  const { workspaceId, projectId } = useParams();
  const navigate = useNavigate();
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ project: projectId || "", title: "", body: "", category: "", shortcut: "", is_global: false });

  const fetchData = useCallback(() => {
    setLoading(true);
    const params = {};
    if (projectId) params.project = projectId;
    fetchCannedResponses(params)
      .then(({ data }) => setResponses(data.results || data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [projectId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = () => {
    setEditing(null);
    setForm({ project: projectId || "", title: "", body: "", category: "", shortcut: "", is_global: false });
    setShowDialog(true);
  };

  const handleSave = async () => {
    try {
      if (editing) await updateCannedResponse(editing.id, form);
      else await createCannedResponse(form);
      setShowDialog(false);
      fetchData();
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this canned response?")) return;
    try { await deleteCannedResponse(id); fetchData(); } catch (err) { console.error(err); }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <header className="px-6 py-4 border-b border-zinc-800 bg-black/50 backdrop-blur-xl shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1.5 rounded-lg hover:bg-zinc-800 text-white/40 hover:text-white"><ArrowLeft size={16} /></button>
          <h1 className="text-lg font-bold text-white">Canned Responses</h1>
        </div>
        <button onClick={openCreate} className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium">
          <Plus size={14} /> New Response
        </button>
      </header>
      <main className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 size={24} className="animate-spin text-white/20" /></div>
        ) : responses.length === 0 ? (
          <div className="text-center py-20"><MessageSquare size={40} className="mx-auto text-white/10 mb-3" /><p className="text-sm text-white/30">No canned responses yet.</p></div>
        ) : (
          <div className="space-y-2">
            {responses.map((r) => (
              <div key={r.id} className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-medium text-white">{r.title}</h3>
                      {r.category && <span className="px-1.5 py-0.5 rounded text-[9px] bg-zinc-800 text-white/40">{r.category}</span>}
                      {r.shortcut && <span className="text-[10px] font-mono text-blue-400/60">/{r.shortcut}</span>}
                    </div>
                    <p className="text-xs text-white/40 mt-1 line-clamp-2">{r.body}</p>
                  </div>
                  <div className="flex gap-1 ml-2">
                    <button onClick={() => { setEditing(r); setForm(r); setShowDialog(true); }} className="p-1.5 rounded hover:bg-zinc-800 text-white/30 hover:text-white"><Edit2 size={12} /></button>
                    <button onClick={() => handleDelete(r.id)} className="p-1.5 rounded hover:bg-red-900/30 text-white/30 hover:text-red-400"><Trash2 size={12} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      {showDialog && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 w-full max-w-lg mx-4">
            <h2 className="text-base font-semibold text-white mb-4">{editing ? "Edit Response" : "New Canned Response"}</h2>
            <div className="space-y-3">
              <div><label className="block text-xs text-white/40 mb-1">Title</label>
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white" /></div>
              <div><label className="block text-xs text-white/40 mb-1">Body</label>
                <textarea value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white resize-none h-24" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs text-white/40 mb-1">Category</label>
                  <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white" /></div>
                <div><label className="block text-xs text-white/40 mb-1">Shortcut</label>
                  <input value={form.shortcut} onChange={(e) => setForm({ ...form, shortcut: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white font-mono" placeholder="/thankyou" /></div>
              </div>
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

export default CannedResponsesView;
