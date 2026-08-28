import React, { useState, useRef, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';
import { LuSettings2 } from "react-icons/lu";
import { Trash2, UserPlus, ArrowRightLeft } from 'lucide-react';
import { BiSolidAddToQueue } from "react-icons/bi";
import { FaRupeeSign } from "react-icons/fa";

export const KanbanCardUI = ({ card, isOverlay, onView, onDelete, onAssign, onMoveToPipeline, onCopyToPipeline, showMenu: showMenuProp, setShowMenu: setShowMenuProp, isSelectMode, isSelected, onToggleSelect }) => {
  const [showMenuInternal, setShowMenuInternal] = useState(false);
  const showMenu = showMenuProp !== undefined ? showMenuProp : showMenuInternal;
  const setShowMenu = setShowMenuProp || setShowMenuInternal;
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  const getStatusColor = (status) => {
    const colors = {
      'Lead': 'from-blue-500/10 to-blue-500/5 border-blue-500/20 text-blue-400',
      'Prospect': 'from-purple-500/10 to-purple-500/5 border-purple-500/20 text-purple-400',
      'Customer': 'from-green-500/10 to-green-500/5 border-green-500/20 text-green-400',
      'Inactive': 'from-zinc-500/10 to-zinc-500/5 border-zinc-500/20 text-zinc-400',
      'Retarget': 'from-amber-500/10 to-amber-500/5 border-amber-500/20 text-amber-400',
      'Payment Pending': 'from-purple-500/15 to-purple-500/10 border-purple-500/30 text-purple-400',
      'Due': 'from-red-500/15 to-red-500/10 border-red-500/30 text-red-400',
      'Paid': 'from-emerald-500/15 to-emerald-500/10 border-emerald-500/30 text-emerald-400',
    };
    return colors[status] || colors['Lead'];
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'High': 'text-red-400 bg-red-400/10 border-red-500/20',
      'Medium': 'text-amber-400 bg-amber-400/10 border-amber-500/20',
      'Low': 'text-emerald-400 bg-emerald-400/10 border-emerald-500/20',
    };
    return colors[priority] || 'text-white/40 bg-white/5 border-white/10';
  };

  const menuItems = [
    { label: 'Assign', icon: UserPlus, onClick: () => { onAssign?.(card); setShowMenu(false); } },
    { label: 'Move to Pipeline', icon: ArrowRightLeft, onClick: () => { onMoveToPipeline?.(card); setShowMenu(false); } },
    { label: 'Add to Pipeline', icon: BiSolidAddToQueue, onClick: () => { onCopyToPipeline?.(card); setShowMenu(false); } },
    { label: 'Delete', icon: Trash2, onClick: () => { onDelete?.(card); setShowMenu(false); }, color: 'text-red-400' },
  ];

  return (
    <div
      className={cn(
        'p-4 rounded-lg border touch-none relative min-w-[260px] group transition-[opacity,border-color,background-color] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]',
        isSelectMode
          ? isSelected
            ? 'bg-blue-500/[0.06] border-blue-500/40 cursor-pointer'
            : 'bg-zinc-900/40 border-zinc-800/50 cursor-pointer hover:border-zinc-700'
          : 'bg-zinc-900/40 border-white/5 cursor-grab active:cursor-grabbing',
        !isSelectMode && !isOverlay && 'hover:border-blue-500/30 hover:bg-zinc-900/60',
        isOverlay && 'bg-zinc-900 border-white/5 z-50 cursor-grabbing'
      )}
      onClick={isSelectMode ? () => onToggleSelect?.(card) : undefined}
    >
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className={cn(
              "font-bold text-[13px] leading-tight mb-1.5 truncate transition-colors",
              isSelectMode
                ? isSelected ? "text-blue-400" : "text-white"
                : "text-white group-hover:text-blue-400"
            )}>
              {card.name}
            </h3>
            <div className="space-y-1 pointer-events-none">
              <div className="flex items-center gap-2 text-[10px] text-white/40 truncate">
                {card.email}
              </div>
              <div className="flex items-center gap-2 text-[10px] text-white/40 truncate">
                {card.phone}
              </div>
            </div>
          </div>
          {!isSelectMode && (
            <div className="relative" ref={menuRef}>
              <button
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(!showMenu);
                }}
                className={cn(
                  "p-1.5 rounded-sm bg-white/5 border border-zinc-800 text-white/40 hover:bg-white/10 hover:text-white/60 transition-all cursor-pointer relative -mt-1 -mr-1",
                  showMenu ? "z-[10000]" : "z-10"
                )}
              >
                <LuSettings2 size={14} />
              </button>

              {showMenu && (
                <>
                  <div className="fixed inset-0 z-[9998]" onClick={() => setShowMenu(false)} />
                  <div className="absolute top-full right-0 mt-1 w-44 bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl z-[9999] overflow-hidden py-1">
                    {menuItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.label}
                          onPointerDown={(e) => e.stopPropagation()}
                          onClick={(e) => {
                            e.stopPropagation();
                            item.onClick();
                          }}
                          className={cn(
                            "w-full flex items-center gap-2.5 px-3 py-2 text-[11px] font-medium transition-colors text-left",
                            item.color || "text-white/70",
                            "hover:bg-white/5"
                          )}
                        >
                          <Icon size={13} />
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 pt-3 border-t border-white/5">
          <div className="flex items-center gap-2 pointer-events-none">
            <span className={cn(
              'px-2 py-0.5 rounded-sm text-[9px] font-black uppercase tracking-wider border bg-gradient-to-b inline-flex items-center gap-1',
              getStatusColor(card.status)
            )}>
              {(card.status === 'Payment Pending' || card.status === 'Due' || card.status === 'Paid') && <FaRupeeSign size={9} />}
              {card.status === 'Payment Pending' ? 'Pending' : card.status}
            </span>
            <span className={cn(
              'px-2 py-0.5 rounded-sm text-[9px] font-bold uppercase tracking-wider border',
              getPriorityColor(card.priority)
            )}>
              {card.priority}
            </span>
          </div>
          {!isSelectMode && (
            <button
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                onView?.(card);
              }}
              style={{ pointerEvents: 'auto', cursor: 'pointer', zIndex: 100 }}
              className="px-3 py-1 rounded-sm bg-white/10 hover:bg-white/20 text-[10px] font-bold text-white transition-all border border-white/20 active:scale-95 cursor-pointer relative"
            >
              View
            </button>
          )}
        </div>
      </div>
    </div>
  );
};



const KanbanCard = ({ card, onView, onDelete, onAssign, onMoveToPipeline, onCopyToPipeline, isSelectMode, isSelected, onToggleSelect }) => {
  const [showMenu, setShowMenu] = useState(false);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id, disabled: isSelectMode });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...(!isSelectMode && { ...attributes, ...listeners })}
      onPointerDown={(e) => {
        if (!isSelectMode) listeners.onPointerDown?.(e);
        if (showMenu) setShowMenu(false);
      }}
    >
      <KanbanCardUI
        card={card}
        onView={onView}
        onDelete={onDelete}
        onAssign={onAssign}
        onMoveToPipeline={onMoveToPipeline}
        onCopyToPipeline={onCopyToPipeline}
        showMenu={showMenu}
        setShowMenu={setShowMenu}
        isSelectMode={isSelectMode}
        isSelected={isSelected}
        onToggleSelect={onToggleSelect}
      />
    </div>
  );
};

export default KanbanCard;
