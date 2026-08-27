import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Plus, Loader2, GripVertical,
  Target, Zap, Layers, Map,
} from "lucide-react";
import { useProject } from "../hooks/useProjects";
import { useWorkItems } from "../hooks/useWorkItems";
import { useSprints } from "../hooks/useSprints";
import { useEpics } from "../hooks/useEpics";
import {
  updateItemStoryPoints, addItemToSprint,
} from "../services/sprintService";
import { createWorkItem, bulkReorderWorkItems } from "../services/workItemService";
import WorkItemDialog from "../components/universal/WorkItemDialog";
import SprintSelector from "../components/universal/SprintSelector";
import PriorityBadge from "../components/universal/PriorityBadge";
import EpicRoadmap from "../components/dev-mode/EpicRoadmap";

const BacklogGroup = ({ group, onAddToSprint, onUpdatePoints, activeSprintId, projectId }) => (
  <div className="mb-6">
    {group.epic ? (
      <div className="flex items-center gap-3 mb-3 px-1">
        <Layers size={14} className="text-purple-400" />
        <span className="text-sm font-bold text-purple-400">{group.epic.key}</span>
        <span className="text-xs text-white/40 truncate">{group.epic.title}</span>
        <span className="text-[10px] text-white/30 ml-auto">{group.items.length} items</span>
      </div>
    ) : (
      <div className="flex items-center gap-3 mb-3 px-1">
        <span className="text-sm font-bold text-white/40">Unassigned</span>
        <span className="text-[10px] text-white/30 ml-auto">{group.items.length} items</span>
      </div>
    )}
    <div className="space-y-1">
      {group.items.map((item, idx) => (
        <div
          key={item.id}
          onClick={() => navigate(`/work/${workspaceId}/${projectId}/item/${item.id}`)}
          className="flex items-center gap-3 p-3 rounded-lg bg-zinc-900/30 border border-zinc-800/50 hover:border-zinc-700 transition-colors group cursor-pointer"
        >
          <GripVertical size={12} className="text-white/10 group-hover:text-white/30 cursor-grab shrink-0" />
          <span className="text-[10px] font-mono text-white/20 w-16 shrink-0">{item.key}</span>
          <span className="flex-1 text-sm text-white truncate">{item.title}</span>
          <PriorityBadge priority={item.priority} compact />
          <span className="text-xs text-white/20 w-12 text-right">{item.issue_type}</span>

          {/* Quick points edit */}
          <input
            type="number"
            defaultValue={item.story_points || ""}
            onBlur={(e) => {
              const val = e.target.value ? parseInt(e.target.value) : null;
              if (val !== item.story_points) onUpdatePoints?.(item.id, val);
            }}
            placeholder="?"
            className="w-12 bg-zinc-800 border border-zinc-700 rounded text-[10px] text-center text-white outline-none focus:border-blue-500/50 [appearance:textfield]"
            min={0}
            max={100}
          />

          <select
            onChange={(e) => {
              if (e.target.value) onAddToSprint?.(item.id, e.target.value);
            }}
            value=""
            className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-[10px] text-white outline-none focus:border-blue-500/50 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <option value="">Sprint</option>
            {activeSprintId && <option value={activeSprintId}>Active Sprint</option>}
          </select>
        </div>
      ))}
    </div>
  </div>
);

const BacklogView = () => {
  const { workspaceId, projectId } = useParams();
  const navigate = useNavigate();
  const { project } = useProject(projectId);
  const { sprints } = useSprints({ project: projectId });
  const { items: backlogItems, loading, refetch } = useWorkItems({
    project: projectId,
    status__category__in: "backlog,todo",
    sprint__isnull: true,
  });
  const [showCreate, setShowCreate] = useState(false);

  const { epics: epicList, loading: epicsLoading } = useEpics(projectId);
  const [showEpics, setShowEpics] = useState(false);
  const activeSprint = sprints.find((s) => s.status === "ACTIVE");
  const totalPoints = backlogItems.reduce((sum, item) => sum + (item.story_points || 0), 0);

  // Group by epic
  const epics = {};
  const unassigned = [];
  backlogItems.forEach((item) => {
    if (item.epic_details) {
      const epicKey = item.epic_details.key;
      if (!epics[epicKey]) {
        epics[epicKey] = { epic: item.epic_details, items: [] };
      }
      epics[epicKey].items.push(item);
    } else {
      unassigned.push(item);
    }
  });

  const groups = [];
  Object.values(epics).forEach((g) => groups.push(g));
  if (unassigned.length > 0) {
    groups.push({ epic: null, items: unassigned });
  }

  const handleAddToSprint = async (itemId, sprintId) => {
    try {
      await addItemToSprint(itemId, sprintId);
      refetch();
    } catch (err) {
      console.error("Failed to add to sprint:", err);
    }
  };

  const handleUpdatePoints = async (itemId, points) => {
    try {
      await updateItemStoryPoints(itemId, points);
    } catch (err) {
      console.error("Failed to update points:", err);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <header className="px-10 py-6 border-b border-zinc-800 bg-black/50 backdrop-blur-xl shrink-0">
        <div className="flex items-center gap-3 mb-3">            <span className="text-xs font-mono text-white/30">{project?.key}</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Backlog</h1>
            <p className="text-sm text-white/40 mt-1">
              {backlogItems.length > 0
                ? `${backlogItems.length} items · ${totalPoints} story points`
                : "Prioritize and plan your work"}
            </p>
          </div>
          <button onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 text-xs font-semibold uppercase tracking-wider">
            <Plus size={14} /> Add Item
          </button>
        </div>
      </header>

      {/* Sprint selector and epic toggle */}
      <div className="px-10 py-3 border-b border-zinc-800 bg-zinc-900/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <SprintSelector
            sprints={sprints}
            activeSprintId={activeSprint?.id}
            loading={false}
            compact
          />
          {backlogItems.length > 0 && (
            <span className="text-xs text-white/30">
              {backlogItems.length} backlog items · {totalPoints} pts
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowEpics(!showEpics)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all bg-zinc-800 text-white/60 hover:text-white"
          >
            <Map size={12} />
            {showEpics ? "Hide Epics" : "Show Epics"}
          </button>
        </div>
      </div>

      <main className="flex-1 overflow-y-auto p-8">
        {/* Epic Roadmap (collapsible) */}
        {showEpics && (
          <div className="mb-6 p-4 rounded-xl bg-zinc-900/40 border border-white/5">
            <EpicRoadmap
              epics={epics}
              loading={epicsLoading}
              onEpicClick={(epic) => navigate(`/work/${workspaceId}/${projectId}/item/${epic.id}`)}
            />
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={24} className="animate-spin text-white/20" />
          </div>
        ) : backlogItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-4">
              <Target size={28} className="text-white/20" />
            </div>
            <h2 className="text-lg font-bold text-white mb-2">Backlog is empty</h2>
            <p className="text-sm text-white/40 mb-6 max-w-md">
              Add items to the backlog and drag them into sprints during sprint planning.
            </p>
            <button onClick={() => setShowCreate(true)}
              className="px-6 py-3 rounded-lg bg-blue-500/20 border border-blue-500/30 text-blue-400 hover:bg-blue-500/30 text-sm font-semibold">
              Add Item
            </button>
          </div>
        ) : (
          groups.map((group, i) => (
            <BacklogGroup
              key={i}
              group={group}
              onAddToSprint={handleAddToSprint}
              onUpdatePoints={handleUpdatePoints}
              activeSprintId={activeSprint?.id}
              projectId={projectId}
            />
          ))
        )}
      </main>

      <WorkItemDialog
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        projectId={projectId}
        onSaved={() => refetch()}
      />
    </div>
  );
};

export default BacklogView;
