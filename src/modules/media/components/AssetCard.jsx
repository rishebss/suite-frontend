import React, { useState, useEffect, useRef } from 'react';
import {
  Image,
  Video,
  Music,
  FileText,
  File,
  Download,
  Trash2,
  MoreHorizontal,
  Eye,
  Loader2,
  ExternalLink,
} from 'lucide-react';

const TYPE_ICONS = {
  image: Image,
  video: Video,
  audio: Music,
  document: FileText,
  other: File,
};

const TYPE_COLORS = {
  image: 'text-blue-400 bg-blue-500/10',
  video: 'text-purple-400 bg-purple-500/10',
  audio: 'text-emerald-400 bg-emerald-500/10',
  document: 'text-amber-400 bg-amber-500/10',
  other: 'text-white/30 bg-white/5',
};

const AssetCard = ({ asset, onPreview, onDelete, selected, onToggleSelect }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const menuRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  const Icon = TYPE_ICONS[asset.file_type] || File;
  const colorClass = TYPE_COLORS[asset.file_type] || TYPE_COLORS.other;

  const isImage = asset.file_type === 'image' && asset.file_url && !imageError;

  return (
    <div
      className={`group bg-white/[0.02] border rounded-2xl overflow-hidden transition-all duration-300 ${
        selected
          ? 'border-blue-500/50 ring-1 ring-blue-500/30 bg-blue-500/5'
          : 'border-white/5 hover:border-white/10'
      }`}
    >
      {/* Thumbnail / Icon */}
      <div
        className="aspect-video relative flex items-center justify-center overflow-hidden cursor-pointer"
        onClick={() => onPreview?.(asset)}
      >
        {/* Selection checkbox */}
        <div
          className="absolute top-2 left-2 z-10"
          onClick={(e) => e.stopPropagation()}
        >
          <label className="flex items-center justify-center w-6 h-6 rounded-lg cursor-pointer transition-all hover:scale-110">
            <input
              type="checkbox"
              checked={!!selected}
              onChange={() => onToggleSelect?.(asset.id)}
              className="sr-only"
            />
            <div
              className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                selected
                  ? 'bg-blue-500 border-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.4)]'
                  : 'border-white/40 bg-black/40 backdrop-blur-sm group-hover:border-white/60'
              }`}
            >
              {selected && (
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M2 5L4 7L8 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
          </label>
        </div>
        {isImage ? (
          <>
            <img
              src={asset.file_url}
              alt={asset.file_name}
              className={`w-full h-full object-cover transition-all duration-500 ${
                imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
              }`}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
            />
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 size={20} className="text-white/20 animate-spin" />
              </div>
            )}
            {/* Gradient overlay for text visibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </>
        ) : (
          <div className={`p-4 rounded-2xl ${colorClass}`}>
            <Icon size={36} />
          </div>
        )}

        {/* Action buttons overlay */}
        <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPreview?.(asset);
            }}
            className="p-1.5 rounded-lg bg-black/60 hover:bg-black/80 text-white/70 hover:text-white transition-all"
            title="Preview"
          >
            <Eye size={13} />
          </button>
          <div className="relative" ref={menuRef}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen((prev) => !prev);
              }}
              className="p-1.5 rounded-lg bg-black/60 hover:bg-black/80 text-white/70 hover:text-white transition-all"
            >
              <MoreHorizontal size={13} />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full mt-1 w-36 bg-zinc-800 border border-white/10 rounded-xl shadow-xl overflow-hidden z-30">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen(false);
                    if (asset.file_url) {
                      const a = document.createElement('a');
                      a.href = asset.file_url;
                      a.download = asset.file_name;
                      a.click();
                    }
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <Download size={12} />
                  Download
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen(false);
                    onDelete?.(asset);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 size={12} />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-4 space-y-1.5">
        <p className="text-sm font-bold text-white truncate group-hover:text-white/90 transition-colors">
          {asset.file_name}
        </p>

        {/* Source badge — shows where this file came from */}
        {asset.source_display && (
          <div className="flex items-center gap-1">
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-[9px] font-semibold text-blue-300/80 truncate max-w-full">
              <ExternalLink size={9} className="shrink-0" />
              <span className="truncate">{asset.source_display}</span>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center">
          <p className="text-[10px] text-white/20 font-medium uppercase tracking-widest">
            {asset.dimensions_display || asset.file_type}
          </p>
          <p className="text-[10px] text-white/20 font-medium">
            {asset.file_size_display}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AssetCard;
