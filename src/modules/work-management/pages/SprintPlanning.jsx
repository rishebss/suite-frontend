import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Plus, Loader2, Play, CheckCircle2,
  Users, Clock, BarChart3, Target, Zap,
} from "lucide-react";
import { useSprints, useSprintBurndown, useSprintStats, useProjectVelocity } from "../hooks/useSprints";
import { useProject } from "../hooks/useProjects";
import {
  createSprint, startSprint, closeSprint,
  addSprintMember, removeSprintMember,
} from "../services/sprintService";
import SprintSelector from "../components/universal/SprintSelector";
import VelocityChart from "../components/dev-mode/VelocityChart";
import BurndownChart from "../components/dev-mode/BurndownChart";

const SprintCard = ({ sprint, onStart, onClose, onView }) => {
  const isActive = sprint.status === "ACTIVE";
  const isPlanning = sprint.status === "PLANNING";
  const isCompleted = sprint.status === "COMPLETED";

  return (
    <div className={cn(
      "p-5 rounded-xl border transition-all",
      isActive && "bg-blue-500/5 border-blue-500/20",
      isPlanning && "bg-zinc-900/40 border-zinc-800 hover:border-zinc-700",
      isCompleted && "bg-green-500/5 border-green-500/20"
    )}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-bold text-white text-sm mb-1">{sprint.name}</h3>
          {sprint.goal && (
            <p className="text-xs text-white/40 line-clamp-1">{sprint.goal}</p>
          )}
        </div>
        <span className={cn(
          "px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border shrink-0",
          isActive && "bg-blue-500/10 text-blue-400 border-blue-500/20",
          isPlanning && "bg-amber-500/10 text-amber-400 border-amber-500/20",
          isCompleted && "bg-green-500/10 text-green-400 border-green-500/20",
        )}>
          {sprint.status}
        </span>
      </div>

      <div className="flex items-center gap-4 text-[10px] text-white/40 mb-4">
        <span className="flex items-center gap-1">
          <Clock size={10} />
          {new Date(sprint.start_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
          {" — "}
          {new Date(sprint.end_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
        </span>
        <span className="flex items-center gap-1">
          <Target size={10} />
          {sprint.total_points || 0} pts
        </span>
        <span className="flex items-center gap-1">
          <Users size={10} />
          {sprint.member_count || 0}
        </span>
      </div>

      {/* Progress bar for active/completed */}
      {isActive && (
        <div className="mb-4">
          <div className="flex justify-between text-[9px] text-white/30 mb-1">
            <span>Progress</span>
            <span>{sprint.item_count || 0} items</span>
          </div>
          <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: "0%" }} />
          </div>
        </div>
      )}

      <div className="flex items-center gap-2">
        <button
          onClick={() => onView?.(sprint)}
          className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs text-white/60 hover:text-white transition-all"
        >
          View Details
        </button>
        {isPlanning && (
          <button
            onClick={() => onStart?.(sprint.id)}
            className="px-3 py-1.5 rounded-lg bg-blue-500/20 border border-blue-500/30 text-blue-400 hover:bg-blue-500/30 text-xs font-semibold transition-all flex items-center gap-1"
          >
            <Play size={10} /> Start Sprint
          </button>
        )}
        {isActive && (
          <button
            onClick={() => onClose?.(sprint.id)}
            className="px-3 py-1.5 rounded-lg bg-green-500/20 border border-green-500/30 text-green-400 hover:bg-green-500/30 text-xs font-semibold transition-all flex items-center gap-1"
          >
            <CheckCircle2 size={10} /> Close Sprint
          </button>
        )}
      </div>
    </div>
  );
};

const CreateSprintDialog = ({ isOpen, onClose, projectId, onCreated }) => {
  const [name, setName] = useState("");
  const [goal, setGoal] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  // Default dates: start = next Monday, end = start + 14 days
  useEffect(() => {
    if (isOpen) {
      const nextMonday = new Date();
      nextMonday.setDate(nextMonday.getDate() + ((1 + 7 - nextMonday.getDay()) % 7 || 7));
      const end = new Date(nextMonday);
      end.setDate(end.getDate() + 13);
      setStartDate(nextMonday.toISOString().split("T")[0]);
      setEndDate(end.toISOString().split("T")[0]);
      setName(`Sprint ${new Date().toLocaleDateString("en-IN", { month: "short", year: "2-digit" })}`);
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !startDate || !endDate) return;
    setSaving(true);
    setError(null);
    try {
      await createSprint({
        project: projectId,
        name, goal,
        start_date: new Date(startDate).toISOString(),
        end_date: new Date(endDate).toISOString(),
      });
      onCreated?.();
      onClose();
      setName("");
      setGoal("");
    } catch (err) {
      setError(err.response?.data?.detail || err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-md p-6 shadow-2xl">
        <h2 className="text-lg font-bold text-white mb-4">Create Sprint</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">Name *</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500/50" autoFocus />
          </div>
          <div>
            <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">Goal</label>
            <textarea value={goal} onChange={(e) => setGoal(e.target.value)} rows={2}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500/50 resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">Start Date *</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500/50 [color-scheme:dark]" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">End Date *</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500/50 [color-scheme:dark]" />
            </div>
          </div>
          {error && <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">{error}</div>}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="px-4 py-2 rounded-lg border border-zinc-700 text-sm text-white/60 hover:text-white transition-all">Cancel</button>
            <button type="submit" disabled={saving}
              className="px-6 py-2 rounded-lg bg-blue-500/20 border border-blue-500/30 text-blue-400 hover:bg-blue-500/30 text-sm font-semibold transition-all disabled:opacity-50 flex items-center gap-2">
              {saving && <Loader2 size={14} className="animate-spin" />} Create Sprint
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const SprintPlanning = () => {
  const { workspaceId, projectId } = useParams();
  const navigate = useNavigate();
  const { project } = useProject(projectId);
  const { sprints, loading, refetch } = useSprints({ project: projectId });
  const { velocity } = useProjectVelocity(projectId);
  const [showCreate, setShowCreate] = useState(false);
  const [closingSprint, setClosingSprint] = useState(null);
  const [closeResult, setCloseResult] = useState(null);
  const [closing, setClosing] = useState(false);

  const handleStart = async (sprintId) => {
    try {
      await startSprint(sprintId);
      refetch();
    } catch (err) {
      console.error("Failed to start sprint:", err);
    }
  };

  const handleClose = async (sprintId) => {
    setClosingSprint(sprintId);
    setCloseResult(null);
  };

  const confirmClose = async () => {
    if (!closingSprint) return;
    setClosing(true);
    try {
      const { data } = await closeSprint(closingSprint);
      setCloseResult(data);
    } catch (err) {
      console.error("Failed to close sprint:", err);
      setCloseResult({ error: err.response?.data?.detail || err.message });
    } finally {
      setClosing(false);
    }
  };

  const activeSprint = sprints.find((s) => s.status === "ACTIVE");
  const plannedSprints = sprints.filter((s) => s.status === "PLANNING");
  const completedSprints = sprints.filter((s) => s.status === "COMPLETED");
  const { burndown, loading: burndownLoading } = useSprintBurndown(activeSprint?.id);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <header className="px-8 py-4 border-b border-zinc-800/50 bg-black/30 backdrop-blur-sm shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-emerald-500/20 to-green-600/20 border border-emerald-500/20 flex items-center justify-center shrink-0">
              <span className="text-[9px] font-bold text-emerald-400">{project?.key?.[0] || "S"}</span>
            </div>
            <div className="min-w-0">
              <h1 className="text-base font-bold text-white truncate">Sprint Planning</h1>
              <p className="text-[11px] text-white/40 truncate">
                {activeSprint
                  ? `Active: ${activeSprint.name}`
                  : "Plan and manage your sprints"}
              </p>
            </div>
          </div>
          <button onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 text-[10px] font-semibold uppercase tracking-wider">
            <Plus size={12} /> New Sprint
          </button>
        </div>
      </header>

      {/* Sprint Selector + Velocity display */}
      <div className="px-8 py-2.5 border-b border-zinc-800/50 bg-zinc-900/10 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <SprintSelector
            sprints={sprints}
            activeSprintId={activeSprint?.id}
            onSelect={(id) => {
              if (id) {
                const s = sprints.find((sp) => sp.id === id);
                if (s) navigate(`/work/${workspaceId}/${projectId}/sprints?sprint=${id}`);
              }
            }}
            loading={loading}
            compact
          />
          {activeSprint && (
            <span className="flex items-center gap-1.5 text-xs text-emerald-400">
              <Play size={10} />
              Active: {activeSprint.name}
            </span>
          )}
        </div>
        {velocity && (
          <div className="flex items-center gap-4 text-xs text-white/40">
            <span className="flex items-center gap-1.5">
              <Zap size={12} className="text-amber-400" />
              <strong className="text-white">{velocity.velocity}</strong> avg velocity
            </span>
            <span><strong className="text-white">{velocity.sprints_analyzed}</strong> sprints analyzed</span>
            <div className="w-32">
              <VelocityChart velocity={velocity} loading={false} compact />
            </div>
          </div>
        )}
      </div>

      <main className="flex-1 overflow-y-auto p-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={24} className="animate-spin text-white/20" />
          </div>
        ) : sprints.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-4">
              <Target size={28} className="text-white/20" />
            </div>
            <h2 className="text-lg font-bold text-white mb-2">No sprints yet</h2>
            <p className="text-sm text-white/40 mb-6 max-w-md">Create your first sprint to start tracking work in time-boxed iterations.</p>
            <button onClick={() => setShowCreate(true)}
              className="px-6 py-3 rounded-lg bg-blue-500/20 border border-blue-500/30 text-blue-400 hover:bg-blue-500/30 text-sm font-semibold">
              Create Sprint
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Active Sprint */}
            {activeSprint && (
              <div>
                <h2 className="text-sm font-bold text-blue-400 mb-4 flex items-center gap-2">
                  <Play size={14} /> Active Sprint
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <SprintCard sprint={activeSprint} onClose={handleClose} onView={(s) => navigate(`/work/${workspaceId}/${projectId}/sprints/${s.id}`)} />
                  <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/30">
                    <h3 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3">Burndown</h3>
                    <BurndownChart burndown={burndown} loading={burndownLoading} />
                  </div>
                </div>
              </div>
            )}

            {/* Planned Sprints */}
            {plannedSprints.length > 0 && (
              <div>
                <h2 className="text-sm font-bold text-amber-400 mb-4 flex items-center gap-2">
                  <Clock size={14} /> Planned ({plannedSprints.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {plannedSprints.map((s) => (
                    <SprintCard key={s.id} sprint={s} onStart={handleStart} onView={(s) => navigate(`/work/${workspaceId}/${projectId}/sprints/${s.id}`)} />
                  ))}
                </div>
              </div>
            )}

            {/* Completed Sprints */}
            {completedSprints.length > 0 && (
              <div>
                <h2 className="text-sm font-bold text-green-400 mb-4 flex items-center gap-2">
                  <CheckCircle2 size={14} /> Completed ({completedSprints.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {completedSprints.map((s) => (
                    <SprintCard key={s.id} sprint={s} onView={(s) => navigate(`/work/${workspaceId}/${projectId}/sprints/${s.id}`)} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <CreateSprintDialog
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        projectId={projectId}
        onCreated={() => refetch()}
      />

      {/* Sprint Close Confirmation Dialog */}
      {(closingSprint || closeResult) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-lg p-6 shadow-2xl">
            {closeResult?.error ? (
              <>
                <h2 className="text-lg font-bold text-red-400 mb-2">Close Failed</h2>
                <p className="text-sm text-white/60 mb-6">{closeResult.error}</p>
                <div className="flex justify-end">
                  <button onClick={() => { setClosingSprint(null); setCloseResult(null); }}
                    className="px-4 py-2 rounded-lg border border-zinc-700 text-sm text-white/60 hover:text-white transition-all">Dismiss</button>
                </div>
              </>
            ) : closeResult ? (
              <>
                <h2 className="text-lg font-bold text-green-400 mb-4">Sprint Closed</h2>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/50">
                    <span className="text-sm text-white/60">Committed</span>
                    <span className="text-lg font-bold text-white">{closeResult.stats?.total_committed || 0} pts</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/50">
                    <span className="text-sm text-white/60">Completed</span>
                    <span className="text-lg font-bold text-green-400">{closeResult.stats?.total_completed || 0} pts</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/50">
                    <span className="text-sm text-white/60">Completion</span>
                    <span className="text-lg font-bold text-amber-400">{closeResult.stats?.completion_pct || 0}%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <span className="text-sm text-amber-400">Incomplete items moved to backlog</span>
                    <span className="text-lg font-bold text-amber-400">{closeResult.items_moved_to_backlog || 0}</span>
                  </div>
                  {closeResult.stats?.velocity_context && (
                    <div className="p-3 rounded-lg bg-zinc-800/50 text-xs text-white/40">
                      Team velocity: <strong className="text-white">{closeResult.stats.velocity_context.velocity}</strong> avg over {closeResult.stats.velocity_context.sprints_analyzed} sprints
                    </div>
                  )}
                </div>
                <div className="flex justify-end gap-3">
                  <button onClick={() => { setClosingSprint(null); setCloseResult(null); refetch(); }}
                    className="px-4 py-2 rounded-lg bg-blue-500/20 border border-blue-500/30 text-blue-400 hover:bg-blue-500/30 text-sm font-semibold transition-all">Done</button>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-lg font-bold text-white mb-2">Close Sprint</h2>
                <p className="text-sm text-white/40 mb-6">
                  Finalize sprint metrics and move incomplete items back to the backlog. This cannot be undone.
                </p>
                <div className="flex justify-end gap-3">
                  <button onClick={() => setClosingSprint(null)}
                    className="px-4 py-2 rounded-lg border border-zinc-700 text-sm text-white/60 hover:text-white transition-all">Cancel</button>
                  <button onClick={confirmClose} disabled={closing}
                    className="px-6 py-2 rounded-lg bg-green-500/20 border border-green-500/30 text-green-400 hover:bg-green-500/30 text-sm font-semibold transition-all disabled:opacity-50 flex items-center gap-2">
                    {closing && <Loader2 size={14} className="animate-spin" />} Confirm Close
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SprintPlanning;
