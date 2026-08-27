import React, { useState } from "react";
import { DndContext, PointerSensor, useSensor, useSensors, DragOverlay } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";
import { Plus, Loader2 } from "lucide-react";
import WorkItemCard from "./WorkItemCard";

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
  zinc: "from-zinc-500/15 to-transparent border-zinc-500/20",
};

const KanbanColumn = ({ column, items, onViewItem }) => {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  return (
    <div className="flex flex-col gap-3 min-w-72 max-w-80 flex-shrink-0 animate-in fade-in duration-500">
      {/* Column Header */}
      <div className={cn(
        "rounded-lg border p-3 bg-gradient-to-b",
        COLUMN_COLORS[column.color] || COLUMN_COLORS.gray
      )}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-bold text-white text-xs">{column.name}</h2>
            <p className="text-[9px] text-white/60 font-medium">{column.item_count} items</p>
          </div>
          <button className="p-1 rounded hover:bg-white/10 transition-colors">
            <Plus size={12} className="text-white/60 hover:text-white" />
          </button>
        </div>
      </div>

      {/* Droppable Area */}
      <div
        ref={setNodeRef}
        className={cn(
          "space-y-2 flex-1 rounded-lg p-3 min-h-[200px] max-h-[calc(100vh-280px)] transition-colors bg-white/5 overflow-y-auto custom-scrollbar flex flex-col",
          isOver && "bg-blue-500/5 border-2 border-dashed border-blue-500/30"
        )}
      >
        <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
          {items.length === 0 ? (
            <div className="flex-1 flex items-center justify-center border-2 border-dashed border-white/10 rounded-lg min-h-[100px] transition-colors">
              <p className="text-[9px] text-white/20 font-medium uppercase tracking-widest">Drop items here</p>
            </div>
          ) : (
            <div className="space-y-2 flex-1">
              {items.map((item) => (
                <WorkItemCard key={item.id} item={item} onView={onViewItem} />
              ))}
            </div>
          )}
        </SortableContext>
      </div>
    </div>
  );
};

const SwimlaneLabel = ({ label, count }) => (
  <div className="flex items-center gap-2 px-3 py-1.5 mb-2 rounded-lg bg-zinc-900/60 border border-zinc-800/50">
    <span className="text-xs font-semibold text-white/70">{label}</span>
    <span className="text-[10px] text-white/30">{count} items</span>
  </div>
);

const KanbanBoard = ({ columns, loading, onStatusChange, onViewItem, swimlaneBy, items }) => {
  const [activeItem, setActiveItem] = useState(null);
  const sensors = useSensors(useSensor(PointerSensor, { distance: 5 }));

  const allItems = columns?.flatMap((col) => col.items || []) || [];

  const handleDragStart = (event) => {
    const found = allItems.find((i) => i.id === event.active.id);
    if (found) setActiveItem(found);
  };

  const handleDragEnd = async (event) => {
    setActiveItem(null);
    const { active, over } = event;
    if (!over || !onStatusChange) return;

    // Determine which column the item was dropped on
    const targetColumn = columns?.find(
      (col) => col.id === over.id || col.items?.some((i) => i.id === over.id)
    );

    const draggedItem = allItems.find((i) => i.id === active.id);
    if (targetColumn && draggedItem && targetColumn.id !== draggedItem.status) {
      onStatusChange(draggedItem.id, targetColumn.id);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-white/20" />
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto custom-scrollbar">
      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex gap-4 min-w-max pb-4 h-full">
          {(columns || []).map((column) => (
            <div key={column.id} className="flex flex-col gap-2 min-w-72 max-w-80 flex-shrink-0">
              {swimlaneBy ? (
                <>
                  {(() => {
                    const groups = {};
                    const colItems = column.items || [];
                    colItems.forEach((item) => {
                      const key = swimlaneBy === "epic" ? (item.epic_title || item.epic_name || "No Epic") : (item.assignee_name || "Unassigned");
                      if (!groups[key]) groups[key] = [];
                      groups[key].push(item);
                    });
                    return Object.entries(groups).map(([groupName, groupItems]) => (
                      <div key={groupName}>
                        <SwimlaneLabel label={groupName} count={groupItems.length} />
                        <KanbanColumn
                          column={{ ...column, name: groupName }}
                          items={groupItems}
                          onViewItem={onViewItem}
                        />
                      </div>
                    ));
                  })()}
                </>
              ) : (
                <KanbanColumn
                  column={column}
                  items={column.items || []}
                  onViewItem={onViewItem}
                />
              )}
            </div>
          ))}
        </div>
        <DragOverlay dropAnimation={null}>
          {activeItem ? <div className="w-[288px]"><WorkItemCard item={activeItem} isOverlay /></div> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};

export default KanbanBoard;
