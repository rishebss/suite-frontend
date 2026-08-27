import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ArrowLeft, GitBranch, Plus, Edit2, Trash2, Loader2, Link2, RefreshCw } from "lucide-react";
import { fetchGitHubIntegrations, createGitHubIntegration, updateGitHubIntegration, deleteGitHubIntegration, syncWebhook, fetchGitHubLinks } from "../services/githubService";

const GitHubIntegrationView = () => {
  const { workspaceId, projectId } = useParams();
  const navigate = useNavigate();
  const [integrations, setIntegrations] = useState([]);
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ project: projectId || "", repo_owner: "", repo_name: "", is_active: true, auto_transition: true, branch_prefix: "" });

  const fetchData = useCallback(() => {
    setLoading(true);
    const params = {};
    if (projectId) params.project = projectId;
    Promise.all([
      fetchGitHubIntegrations(params),
      fetchGitHubLinks({})
    ]).then(([intRes, linkRes]) => {
      setIntegrations(intRes.data.results || intRes.data || []);
      setLinks(linkRes.data.results || linkRes.data || []);
    }).catch(console.error).finally(() => setLoading(false));
  }, [projectId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSave = async () => {
    try {
      if (editing) await updateGitHubIntegration(editing.id, form);
      else await createGitHubIntegration(form);
      setShowDialog(false);
      fetchData();
    } catch (err) { console.error(err); }
  };

  const handleWebhook = async (id) => {
    try { const { data } = await syncWebhook(id); alert(`Webhook URL: ${data.webhook_url}\nSecret: ${data.webhook_secret}`); } catch (err) { console.error(err); }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <header className="px-6 py-4 border-b border-zinc-800 bg-black/50 backdrop-blur-xl shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1.5 rounded-lg hover:bg-zinc-800 text-white/40 hover:text-white"><ArrowLeft size={16} /></button>
          <h1 className="text-lg font-bold text-white">GitHub Integration</h1>
        </div>
        <button onClick={() => { setEditing(null); setForm({ project: projectId || "", repo_owner: "", repo_name: "", is_active: true, auto_transition: true, branch_prefix: "" }); setShowDialog(true); }}
          className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium"><Plus size={14} /> Add Repo</button>
      </header>
      <main className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        {loading ? <div className="flex items-center justify-center py-20"><Loader2 size={24} className="animate-spin text-white/20" /></div>
        : (
          <div className="space-y-6">
            {integrations.length === 0 ? (
              <div className="text-center py-12"><GitBranch size={40} className="mx-auto text-white/10 mb-3" /><p className="text-sm text-white/30">No repositories linked.</p></div>
            ) : (
              <div className="space-y-2">
                <h2 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">Linked Repositories</h2>
                {integrations.map((i) => (
                  <div key={i.id} className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <GitBranch size={20} className="text-white/40" />
                        <div>
                          <h3 className="text-sm font-medium text-white">{i.repo_full_name || `${i.repo_owner}/${i.repo_name}`}</h3>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className={cn("w-2 h-2 rounded-full", i.is_active ? "bg-green-400" : "bg-zinc-600")} />
                            <span className="text-[10px] text-white/30">{i.is_active ? "Active" : "Inactive"}</span>
                            {i.auto_transition && <span className="text-[10px] text-blue-400/60">Auto-transition</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => handleWebhook(i.id)} className="p-1.5 rounded hover:bg-zinc-800 text-white/30 hover:text-cyan-400" title="Webhook"><RefreshCw size={12} /></button>
                        <button onClick={() => { setEditing(i); setForm(i); setShowDialog(true); }} className="p-1.5 rounded hover:bg-zinc-800 text-white/30 hover:text-white"><Edit2 size={12} /></button>
                        <button onClick={async () => { if (!window.confirm("Delete integration?")) return; await deleteGitHubIntegration(i.id); fetchData(); }}
                          className="p-1.5 rounded hover:bg-red-900/30 text-white/30 hover:text-red-400"><Trash2 size={12} /></button>
                      </div>
                    </div>
                    {i.branch_prefix && <p className="text-[10px] text-white/20 mt-2">Branch prefix: {i.branch_prefix}</p>}
                  </div>
                ))}
              </div>
            )}

            {links.length > 0 && (
              <div>
                <h2 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">Linked PRs / Commits</h2>
                <div className="space-y-1">
                  {links.map((l) => (
                    <div key={l.id} className="bg-zinc-900/40 border border-zinc-800 rounded-lg p-3 flex items-center gap-3">
                      <Link2 size={12} className="text-white/20" />
                      <span className={cn("px-1.5 py-0.5 rounded text-[9px] font-medium",
                        l.link_type === "PR" ? "bg-green-500/10 text-green-400" : "bg-blue-500/10 text-blue-400")}>{l.link_type}</span>
                      <span className="text-xs text-white/60 truncate flex-1">{l.title || l.url}</span>
                      <span className="text-[10px] text-white/30">{l.state}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {showDialog && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 w-full max-w-md mx-4">
            <h2 className="text-base font-semibold text-white mb-4">{editing ? "Edit Repo" : "Link GitHub Repository"}</h2>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs text-white/40 mb-1">Owner</label>
                  <input value={form.repo_owner} onChange={(e) => setForm({ ...form, repo_owner: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white" placeholder="org-name" /></div>
                <div><label className="block text-xs text-white/40 mb-1">Repository</label>
                  <input value={form.repo_name} onChange={(e) => setForm({ ...form, repo_name: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white" placeholder="repo-name" /></div>
              </div>
              <div><label className="block text-xs text-white/40 mb-1">Branch Prefix (optional)</label>
                <input value={form.branch_prefix} onChange={(e) => setForm({ ...form, branch_prefix: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white" placeholder="feature/" /></div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.auto_transition} onChange={(e) => setForm({ ...form, auto_transition: e.target.checked })}
                  className="rounded border-zinc-700 bg-zinc-800 text-blue-600" />
                <span className="text-xs text-white/60">Auto-transition items on PR merge</span>
              </label>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => setShowDialog(false)} className="px-4 py-2 text-xs text-white/40 hover:text-white">Cancel</button>
              <button onClick={handleSave} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium">{editing ? "Update" : "Link Repo"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GitHubIntegrationView;
