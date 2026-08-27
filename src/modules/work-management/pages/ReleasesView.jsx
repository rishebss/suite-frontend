import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  ArrowLeft, Plus, Loader2, Package, Rocket, Archive,
} from "lucide-react";
import { useProject } from "../hooks/useProjects";
import {
  fetchReleases, createRelease, updateRelease, deleteRelease,
} from "../services/releaseService";

const STATUS_COLORS = {
  PLANNED: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  IN_PROGRESS: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  RELEASED: "text-green-400 bg-green-500/10 border-green-500/20",
  CANCELLED: "text-red-400 bg-red-500/10 border-red-500/20",
};

const CreateReleaseDialog = ({ isOpen, onClose, projectId, onCreated }) => {
  const [name, setName] = useState("");
  const [version, setVersion] = useState("");
  const [description, setDescription] = useState("");
  const [releaseDate, setReleaseDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await createRelease({
        project: projectId, name, version,
        description,
        release_date: releaseDate ? new Date(releaseDate).toISOString() : null,
      });
      onCreated?.();
      onClose();
      setName(""); setVersion(""); setDescription(""); setReleaseDate("");
    } catch (err) {
      setError(err.response?.data?.detail || err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-md p-6 shadow-2xl">
        <h2 className="text-lg font-bold text-white mb-4">Create Release</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">Name *</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500/50" autoFocus />
          </div>
          <div>
            <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">Version</label>
            <input type="text" value={version} onChange={(e) => setVersion(e.target.value)} placeholder="e.g. 1.2.3"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500/50" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500/50 resize-none" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">Release Date</label>
            <input type="date" value={releaseDate} onChange={(e) => setReleaseDate(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500/50 [color-scheme:dark]" />
          </div>
          {error && <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">{error}</div>}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="px-4 py-2 rounded-lg border border-zinc-700 text-sm text-white/60 hover:text-white transition-all">Cancel</button>
            <button type="submit" disabled={saving}
              className="px-6 py-2 rounded-lg bg-blue-500/20 border border-blue-500/30 text-blue-400 hover:bg-blue-500/30 text-sm font-semibold transition-all disabled:opacity-50 flex items-center gap-2">
              {saving && <Loader2 size={14} className="animate-spin" />} Create Release
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ReleasesView = () => {
  const { workspaceId, projectId } = useParams();
  const navigate = useNavigate();
  const { project } = useProject(projectId);
  const [releases, setReleases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  const loadReleases = async () => {
    setLoading(true);
    try {
      const { data } = await fetchReleases({ project: projectId });
      setReleases(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      console.error("Failed to load releases:", err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => { if (projectId) loadReleases(); }, [projectId]);

  const handleArchive = async (id) => {
    try {
      await updateRelease(id, { is_archived: true });
      loadReleases();
    } catch (err) {
      console.error("Failed to archive release:", err);
    }
  };

  const activeReleases = releases.filter((r) => !r.is_archived);
  const archivedReleases = releases.filter((r) => r.is_archived);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <header className="px-10 py-6 border-b border-zinc-800 bg-black/50 backdrop-blur-xl shrink-0">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={() => navigate(`/work/${workspaceId}/${projectId}`)}
            className="p-1.5 rounded-lg hover:bg-zinc-800 text-white/40 hover:text-white transition-colors">
            <ArrowLeft size={16} />
          </button>
          <span className="text-xs font-mono text-white/30">{project?.key}</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Releases</h1>
            <p className="text-sm text-white/40 mt-1">
              {releases.length > 0 ? `${releases.length} releases · ${activeReleases.length} active` : "Plan and track releases"}
            </p>
          </div>
          <button onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 text-xs font-semibold uppercase tracking-wider">
            <Plus size={14} /> New Release
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-10">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={24} className="animate-spin text-white/20" />
          </div>
        ) : activeReleases.length === 0 && archivedReleases.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-4">
              <Package size={28} className="text-white/20" />
            </div>
            <h2 className="text-lg font-bold text-white mb-2">No releases yet</h2>
            <p className="text-sm text-white/40 mb-6 max-w-md">Create releases to tag work items by shipped version.</p>
            <button onClick={() => setShowCreate(true)}
              className="px-6 py-3 rounded-lg bg-blue-500/20 border border-blue-500/30 text-blue-400 hover:bg-blue-500/30 text-sm font-semibold">
              Create Release
            </button>
          </div>
        ) : (
          <div className="max-w-3xl space-y-4">
            {activeReleases.map((release) => (
              <div key={release.id}
                className="p-5 rounded-xl border border-zinc-800 bg-zinc-900/30 hover:border-zinc-700 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-white text-sm">{release.name}</h3>
                      {release.version && (
                        <span className="text-[10px] font-mono text-white/30 bg-zinc-800 px-2 py-0.5 rounded">{release.version}</span>
                      )}
                    </div>
                    {release.description && (
                      <p className="text-xs text-white/40 line-clamp-1">{release.description}</p>
                    )}
                  </div>
                  <span className={cn("px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border shrink-0", STATUS_COLORS[release.status] || "text-white/40")}>
                    {release.status}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-[10px] text-white/40">
                  {release.release_date && (
                    <span className="flex items-center gap-1">
                      <Rocket size={10} />
                      {new Date(release.release_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Package size={10} />
                    {release.item_count || 0} items
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <button onClick={() => navigate(`/work/${workspaceId}/${projectId}/item?version=${release.id}`)}
                    className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs text-white/60 hover:text-white transition-all">
                    View Items
                  </button>
                  <button onClick={() => handleArchive(release.id)}
                    className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs text-white/40 hover:text-white transition-all flex items-center gap-1">
                    <Archive size={10} /> Archive
                  </button>
                </div>
              </div>
            ))}

            {archivedReleases.length > 0 && (
              <div className="pt-6">
                <h3 className="text-xs font-bold text-white/30 uppercase tracking-wider mb-3">Archived ({archivedReleases.length})</h3>
                <div className="space-y-2">
                  {archivedReleases.map((release) => (
                    <div key={release.id} className="p-3 rounded-lg border border-zinc-800/50 bg-zinc-900/20 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Archive size={12} className="text-white/20" />
                        <span className="text-sm text-white/40">{release.name}</span>
                        {release.version && <span className="text-[10px] font-mono text-white/20">{release.version}</span>}
                      </div>
                      <span className="text-[10px] text-white/20">{release.item_count || 0} items</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <CreateReleaseDialog
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        projectId={projectId}
        onCreated={() => loadReleases()}
      />
    </div>
  );
};

export default ReleasesView;
