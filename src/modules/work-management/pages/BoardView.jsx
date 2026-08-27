import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Plus, Loader2, LayoutGrid, List, Target, Play, Columns3 } from "lucide-react";
import { useProjectBoard } from "../hooks/useProjects";
import { useWorkManagement } from "../context/WorkManagementContext";
import { useSprints } from "../hooks/useSprints";
import { transitionWorkItem } from "../services/workItemService";
import KanbanBoard from "../components/universal/KanbanBoard";
import WorkItemDialog from "../components/universal/WorkItemDialog";
import SprintSelector from "../components/universal/SprintSelector";

const BoardView = () => {
  const { workspaceId, projectId } = useParams();
  const navigate = useNavigate();
  const { viewMode, setViewMode } = useWorkManagement();
  const { sprints } = useSprints({ project: projectId });
  const [selectedSprintId, setSelectedSprintId] = useState(null);
  const { board, loading, refetch } = useProjectBoard(projectId, selectedSprintId ? { sprint: selectedSprintId } : {});
  const [showCreate, setShowCreate] = useState(false);
  const [swimlaneBy, setSwimlaneBy] = useState(null);
  const activeSprint = sprints.find((s) => s.status === "ACTIVE");

  const handleStatusChange = async (itemId, newStatusId) => {
    try {
      await transitionWorkItem(itemId, newStatusId);
      refetch();
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const handleViewItem = (item) => {
    navigate(`/work/${workspaceId}/${projectId}/item/${item.id}`);
  };

  const totalItems = board?.columns?.reduce((sum, col) => sum + col.item_count, 0) || 0;
  const doneItems = board?.columns?.filter((c) => c.category === "done")
    .reduce((sum, col) => sum + col.item_count, 0) || 0;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <header className="px-8 py-4 border-b border-zinc-800/50 bg-black/30 backdrop-blur-sm shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-blue-500/20 to-purple-600/20 border border-blue-500/20 flex items-center justify-center shrink-0">
              <span className="text-[9px] font-bold text-blue-400">{board?.project?.key || "B"}</span>
            </div>
            <div className="min-w-0">
              <h1 className="text-base font-bold text-white truncate">{board?.project?.name || "Board"}</h1>
              <p className="text-[11px] text-white/40 truncate">
                {totalItems > 0 ? `${doneItems}/${totalItems} items completed` : "Drag to move items between columns"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex bg-zinc-900 rounded-lg border border-zinc-800 p-0.5">
              <button
                onClick={() => setViewMode("kanban")}
                className={cn(
                  "p-2 rounded-md transition-all",
                  viewMode === "kanban" ? "bg-zinc-800 text-white" : "text-white/40 hover:text-white"
                )}
              >
                <LayoutGrid size={14} />
              </button>
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "p-2 rounded-md transition-all",
                viewMode === "list" ? "bg-zinc-800 text-white" : "text-white/40 hover:text-white"
              )}
            >
              <List size={14} />
            </button>
            <div className="w-px h-4 bg-zinc-800 mx-1" />
            <button
              onClick={() => setSwimlaneBy(swimlaneBy === "epic" ? null : "epic")}
              className={cn(
                "p-2 rounded-md transition-all",
                swimlaneBy === "epic" ? "bg-zinc-800 text-purple-400" : "text-white/40 hover:text-white"
              )}
              title="Swimlanes by Epic"
            >
              <Columns3 size={14} />
            </button>
            <button
              onClick={() => setSwimlaneBy(swimlaneBy === "assignee" ? null : "assignee")}
              className={cn(
                "p-2 rounded-md transition-all",
                swimlaneBy === "assignee" ? "bg-zinc-800 text-cyan-400" : "text-white/40 hover:text-white"
              )}
              title="Swimlanes by Assignee"
            >
              <Target size={14} />
            </button>
            </div>
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 transition-all text-[10px] font-semibold uppercase tracking-wider"
            >
              <Plus size={12} /> Add
            </button>
          </div>
        </div>
      </header>

      {/* Sprint selector + active sprint info */}
      <div className="px-8 py-2.5 border-b border-zinc-800/50 bg-zinc-900/10 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <SprintSelector
            sprints={sprints}
            activeSprintId={activeSprint?.id}
            selectedSprintId={selectedSprintId}
            onSelect={(id) => setSelectedSprintId(id || null)}
            loading={false}
            compact
            showAllOption
            allLabel="All Sprints"
          />
          {activeSprint && (
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <Play size={10} />
                {activeSprint.name}
              </span>
              {activeSprint.goal && (
                <span className="text-white/30 flex items-center gap-1">
                  <Target size={10} />
                  <span className="max-w-48 truncate">{activeSprint.goal}</span>
                </span>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 text-[10px] text-white/20">
          {selectedSprintId ? "Sprint-scoped" : "Full board"}
        </div>
      </div>

      {/* Board Area */}
      <main className="flex-1 overflow-hidden p-8 pt-5">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <Loader2 size={24} className="animate-spin text-white/20" />
          </div>
        ) : !board?.columns || board.columns.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-4">
              <LayoutGrid size={28} className="text-white/20" />
            </div>
            <h2 className="text-lg font-bold text-white mb-2">No board columns configured</h2>
            <p className="text-sm text-white/40 mb-6 max-w-md">
              This project needs a workflow with statuses to display a board. Assign a workflow in project settings.
            </p>
          </div>
        ) : (
          <KanbanBoard
            columns={board.columns}
            loading={false}
            onStatusChange={handleStatusChange}
            onViewItem={handleViewItem}
            swimlaneBy={swimlaneBy}
            items={board.items}
          />
        )}
      </main>

      {/* Create Dialog */}
      <WorkItemDialog
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        projectId={projectId}
        onSaved={() => {
          refetch();
          setShowCreate(false);
        }}
      />

      {/* Detail Dialog (removed — replaced by WorkItemDetail page at /item/:itemId) */}
    </div>
  );
};

export default BoardView;
