import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { cn } from '@/lib/utils';
import KanbanCard from './KanbanCard';
import { Plus } from 'lucide-react';
import Tooltip from '@/components/ui/tooltip';

const KanbanColumn = ({ column, cards, totalCount, hasMore, isLoadingMore, onLoadMore, onViewCard, onDeleteCard, onMoveToPipelineCard, onAddToPipelineCard, isSelectMode, selectedCards, onToggleCardSelect }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  const getColumnColor = (color) => {
    const colors = {
      'blue':   'from-blue-500/15 to-transparent border-blue-500/20',
      'purple': 'from-purple-500/15 to-transparent border-purple-500/20',
      'amber':  'from-amber-500/15 to-transparent border-amber-500/20',
      'orange': 'from-orange-500/15 to-transparent border-orange-500/20',
      'green':  'from-green-500/15 to-transparent border-green-500/20',
      'red':    'from-red-500/15 to-transparent border-red-500/20',
      'pink':   'from-pink-500/15 to-transparent border-pink-500/20',
      'cyan':   'from-cyan-500/15 to-transparent border-cyan-500/20',
    };
    return colors[color] || colors['blue'];
  };

  return (
    <div className="flex flex-col gap-3 min-w-72 flex-shrink-0 animate-in fade-in duration-500">
      {/* Column Header */}
      <Tooltip content={isSelectMode ? 'Use CRM Retarget from Actions to select deals by stage and field for bulk transfers' : null} wide>
        <div
          className={cn(
            'rounded-lg border p-3 bg-gradient-to-b',
            getColumnColor(column.color),
            isSelectMode && 'cursor-not-allowed'
          )}
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-white text-xs">{column.title}</h2>
              <p className="text-[9px] text-white/60 font-medium">{cards.length} deals</p>
            </div>
            <button className="p-1 rounded hover:bg-white/10 transition-colors">
              <Plus size={12} className="text-white/60 hover:text-white" />
            </button>
          </div>
        </div>
      </Tooltip>

      {/* Droppable Area */}
      <div
        ref={setNodeRef}
        className={cn(
          'space-y-2 flex-1 rounded-lg p-3 min-h-[400px] max-h-[calc(100vh-280px)] transition-colors bg-white/5 overflow-y-auto custom-scrollbar flex flex-col'
        )}
      >
        <SortableContext
          items={cards.map(card => card.id)}
          strategy={verticalListSortingStrategy}
        >
          {cards.length === 0 ? (
            <div className={cn(
              'flex-1 flex items-center justify-center border-2 border-dashed border-white/10 rounded-lg min-h-[100px]'
            )}>
              <p className="text-[9px] text-white/20 font-medium uppercase tracking-widest">
                Drop deals here
              </p>
            </div>
          ) : (
            <div className="space-y-2 flex-1">
              {cards.map((card) => (
                <KanbanCard
                  key={card.id}
                  card={card}
                  onView={onViewCard}
                  onDelete={onDeleteCard}
                  onMoveToPipeline={onMoveToPipelineCard}
                  onCopyToPipeline={onAddToPipelineCard}
                  isSelectMode={isSelectMode}
                  isSelected={selectedCards?.has(card.id)}
                  onToggleSelect={onToggleCardSelect}
                />
              ))}
              
              {hasMore && (
                <button
                  onClick={onLoadMore}
                  disabled={isLoadingMore}
                  className="w-full py-3 mt-2 rounded-lg border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/10 text-xs text-white/20 hover:text-white/40 transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  {isLoadingMore ? 'Loading...' : `Load More (${cards.length}/${totalCount})`}
                </button>
              )}
            </div>
          )}
        </SortableContext>
      </div>
    </div>
  );
};

export default KanbanColumn;
