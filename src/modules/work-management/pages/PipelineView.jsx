import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ArrowLeft, Plus, Loader2, DollarSign, TrendingUp, Target, BarChart3 } from "lucide-react";
import { useProject } from "../hooks/useProjects";
import { DndContext, PointerSensor, useSensor, useSensors, DragOverlay } from "@dnd-kit/core";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { fetchProjectPipeline } from "../services/projectService";
import { transitionWorkItem } from "../services/workItemService";
import PipelineStageCard from "../components/sales-mode/PipelineStageCard";

const COLUMN_COLORS = {
  gray: "from-gray-500/15 to-transparent border-gray-500/20",
  blue: "from-blue-500/15 to-transparent border-blue-500/20",
  purple: "from-purple-500/15 to-transparent border-purple-500/20",
  amber: "from-amber-500/15 to-transparent border-amber-500/20",
  orange: "from-orange-500/15 to-transparent border-orange-500/20",
  green: "from-green-500/15 to-transparent border-green-500/20",
  red: "from-red-500/15 to-transparent border-red-500/20",
  pink: "from-pink-500/15 to-transparent border-pink-500/20",
  cyan: "from-cyan-500/15 to-transparent border-cyan-500/20",
  emerald: "from-emerald-500/15 to-transparent border-emerald-500/20",
};

const formatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const PipelineColumn = ({ column, items, onViewItem }) => {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  return (
    <div className="flex flex-col gap-3 min-w-72 max-w-80 flex-shrink-0 animate-in fade-in duration-500">
      <div className={cn(
        "rounded-lg border p-3 bg-gradient-to-b",
        COLUMN_COLORS[column.color] || COLUMN_COLORS.gray
      )}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-bold text-white text-xs">{column.name}</h2>
            <p className="text-[9px] text-white/60 font-medium">{column.item_count} deals</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold text-emerald-400">{formatter.format(column.stage_total || 0)}</p>
            <p className="text-[8px] text-white/40">weighted: {formatter.format(column.stage_weighted || 0)}</p>
          </div>
        </div>
      </div>

      <div
        ref={setNodeRef}
        className={cn(
          "space-y-2 flex-1 rounded-lg p-3 min-h-[200px] max-h-[calc(100vh-320px)] transition-colors bg-white/5 overflow-y-auto custom-scrollbar flex flex-col",
          isOver && "bg-amber-500/5 border-2 border-dashed border-amber-500/30"
        )}
      >
        <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
          {items.length === 0 ? (
            <div className="flex-1 flex items-center justify-center border-2 border-dashed border-white/10 rounded-lg min-h-[100px] transition-colors">
              <p className="text-[9px] text-white/20 font-medium uppercase tracking-widest">Drop deals here</p>
            </div>
          ) : (
            <div className="space-y-2 flex-1">
              {items.map((item) => (
                <PipelineStageCard key={item.id} item={item} onView={onViewItem} />
              ))}
            </div>
          )}
        </SortableContext>
      </div>
    </div>
  );
};

const PipelineView = () => {
  const { workspaceId, projectId } = useParams();
  const navigate = useNavigate();
  const { project } = useProject(projectId);
  const [pipeline, setPipeline] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeItem, setActiveItem] = useState(null);

  const sensors = useSensors(useSensor(PointerSensor, { distance: 5 }));

  useEffect(() => {
    if (!projectId) return;
    setLoading(true);
    fetchProjectPipeline(projectId)
      .then(({ data }) => setPipeline(data))
      .catch((err) => console.error("Pipeline load error:", err))
      .finally(() => setLoading(false));
  }, [projectId]);

  const allItems = pipeline?.columns?.flatMap((col) => col.items || []) || [];

  const handleDragStart = (event) => {
    const found = allItems.find((i) => i.id === event.active.id);
    if (found) setActiveItem(found);
  };

  const handleDragEnd = async (event) => {
    setActiveItem(null);
    const { active, over } = event;
    if (!over) return;

    const targetColumn = pipeline?.columns?.find(
      (col) => col.id === over.id || col.items?.some((i) => i.id === over.id)
    );
    const draggedItem = allItems.find((i) => i.id === active.id);
    if (targetColumn && draggedItem && targetColumn.id !== draggedItem.status) {
      try {
        await transitionWorkItem(draggedItem.id, targetColumn.id);
        const { data } = await fetchProjectPipeline(projectId);
        setPipeline(data);
      } catch (err) {
        console.error("Status update failed:", err);
      }
    }
  };

  const summary = pipeline?.summary || {};

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <header className="px-10 py-6 border-b border-zinc-800 bg-black/50 backdrop-blur-xl shrink-0">
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={() => navigate(`/work/${workspaceId}/${projectId}`)}
            className="p-1.5 rounded-lg hover:bg-zinc-800 text-white/40 hover:text-white transition-colors"
          >
            <ArrowLeft size={16} />
          </button>
          <span className="text-xs font-mono text-white/30 font-medium">
            {project?.key || "Loading..."}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">
              <span className="text-amber-400">Pipeline</span> &middot; {project?.name || "Sales Pipeline"}
            </h1>
            <p className="text-sm text-white/40 font-medium mt-1">
              {summary.total_deals > 0
                ? `${summary.total_deals} deals worth ${formatter.format(summary.total_pipeline_value)}`
                : "Drag deals between stages to update pipeline"}
            </p>
          </div>

          {/* Summary Stats */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
              <DollarSign size={14} className="text-emerald-400" />
              <div>
                <p className="text-[9px] text-white/40 font-medium uppercase tracking-wider">Pipeline</p>
                <p className="text-sm font-bold text-emerald-400">{formatter.format(summary.total_pipeline_value)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
              <TrendingUp size={14} className="text-blue-400" />
              <div>
                <p className="text-[9px] text-white/40 font-medium uppercase tracking-wider">Forecast</p>
                <p className="text-sm font-bold text-blue-400">{formatter.format(summary.total_weighted_forecast)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
              <Target size={14} className="text-amber-400" />
              <div>
                <p className="text-[9px] text-white/40 font-medium uppercase tracking-wider">Deals</p>
                <p className="text-sm font-bold text-white">{summary.total_deals}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Board */}
      <main className="flex-1 overflow-hidden p-10 pt-6">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <Loader2 size={24} className="animate-spin text-white/20" />
          </div>
        ) : !pipeline?.columns || pipeline.columns.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-4">
              <BarChart3 size={28} className="text-white/20" />
            </div>
            <h2 className="text-lg font-bold text-white mb-2">No pipeline configured</h2>
            <p className="text-sm text-white/40 mb-6 max-w-md">
              This project needs a sales workflow with DEAL-type work items to display a pipeline.
            </p>
          </div>
        ) : (
          <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div className="flex gap-4 min-w-max pb-4 h-full">
              {pipeline.columns.map((column) => (
                <PipelineColumn
                  key={column.id}
                  column={column}
                  items={column.items || []}
                  onViewItem={() => {}}
                />
              ))}
            </div>
            <DragOverlay dropAnimation={null}>
              {activeItem ? (
                <div className="w-[288px]">
                  <PipelineStageCard item={activeItem} isOverlay />
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        )}
      </main>
    </div>
  );
};

export default PipelineView;
