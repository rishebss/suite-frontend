import React from 'react';
import {
  Folder,
  FolderOpen,
  Plus,
  Trash2,
  Edit3,
  Pin,
  PinOff,
  Image as ImageIcon,
  Loader2,
} from 'lucide-react';

const CollectionList = ({
  collections,
  activeCollectionId,
  onSelect,
  onCreate,
  onRename,
  onDelete,
  onTogglePin,
  loading,
}) => {
  // Separate pinned and unpinned for display
  const pinned = collections.filter((c) => c.is_pinned);
  const unpinned = collections.filter((c) => !c.is_pinned);
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
        <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-white/40">
          Collections
        </h2>
        <button
          onClick={onCreate}
          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all"
          title="Create collection"
        >
          <Plus size={14} />
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar py-2 px-2 space-y-0.5">
        {loading && collections.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 size={16} className="text-white/20 animate-spin" />
          </div>
        ) : collections.length === 0 ? (
          <div className="text-center py-8 px-4">
            <Folder size={24} className="mx-auto text-white/10 mb-2" />
            <p className="text-[11px] text-white/20 font-medium">
              No collections yet
            </p>
            <button
              onClick={onCreate}
              className="mt-2 text-[11px] text-white/40 hover:text-white/60 transition-colors underline underline-offset-2"
            >
              Create one
            </button>
          </div>
        ) : (
          <>
            {/* Pinned section */}
            {pinned.length > 0 && (
              <div className="px-3 py-1.5">
                <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-white/20">
                  Pinned
                </p>
              </div>
            )}
            {pinned.map((col) => (
              <CollectionItem
                key={col.id}
                col={col}
                isActive={col.id === activeCollectionId}
                onSelect={onSelect}
                onRename={onRename}
                onDelete={onDelete}
                onTogglePin={onTogglePin}
              />
            ))}

            {/* Unpinned section */}
            {unpinned.length > 0 && (
              <div className="px-3 py-1.5 mt-1">
                <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-white/20">
                  All Collections
                </p>
              </div>
            )}
            {unpinned.map((col) => (
              <CollectionItem
                key={col.id}
                col={col}
                isActive={col.id === activeCollectionId}
                onSelect={onSelect}
                onRename={onRename}
                onDelete={onDelete}
                onTogglePin={onTogglePin}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// CollectionItem — single row in the list
// ---------------------------------------------------------------------------

const CollectionItem = ({ col, isActive, onSelect, onRename, onDelete, onTogglePin }) => (
  <button
    onClick={() => onSelect(col.id)}
    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200 group ${
      isActive
        ? 'bg-white/10 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]'
        : 'text-white/50 hover:text-white hover:bg-white/5'
    }`}
  >
    {isActive ? (
      <FolderOpen size={16} className="shrink-0 text-blue-400" />
    ) : (
      <Folder size={16} className="shrink-0 text-white/30 group-hover:text-white/50 transition-colors" />
    )}
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2">
        <p className="text-sm font-semibold truncate">{col.name}</p>                      {col.is_pinned && (
                          <Pin size={10} className="shrink-0 text-amber-400/60" />
                        )}
                      </div>
                      <p className="text-[10px] text-white/30 font-medium">
                        {col.asset_count || 0} asset{(col.asset_count || 0) !== 1 ? "s" : ""}
                      </p>
                    </div>

                    {/* Hover actions — delete is hidden for pinned collections */}
    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
      <span
        onClick={(e) => {
          e.stopPropagation();
          onTogglePin?.(col);
        }}
        className={`p-1 rounded-md transition-colors ${
          col.is_pinned
            ? 'text-amber-400 hover:bg-amber-500/20'
            : 'text-white/30 hover:text-amber-400 hover:bg-amber-500/20'
        }`}
        title={col.is_pinned ? 'Unpin collection' : 'Pin collection'}
      >
        {col.is_pinned ? <PinOff size={11} /> : <Pin size={11} />}
      </span>
      <span
        onClick={(e) => {
          e.stopPropagation();
          onRename(col);
        }}
        className="p-1 rounded-md hover:bg-white/10 text-white/30 hover:text-white transition-colors"
      >
        <Edit3 size={11} />
      </span>                      {!col.is_pinned && (
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(col);
                          }}
                          className="p-1 rounded-md hover:bg-red-500/20 text-white/30 hover:text-red-400 transition-colors"
                        >
                          <Trash2 size={11} />
                        </span>
                      )}
    </div>
  </button>
);

export default CollectionList;
