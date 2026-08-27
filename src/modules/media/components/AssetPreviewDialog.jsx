import React from 'react';
import {
  X,
  Download,
  Trash2,
  Image,
  Video,
  Music,
  FileText,
  File,
  Calendar,
  HardDrive,
  Maximize2,
  User,
  ExternalLink,
} from 'lucide-react';

const TYPE_ICONS = {
  image: Image,
  video: Video,
  audio: Music,
  document: FileText,
  other: File,
};

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const AssetPreviewDialog = ({ isOpen, onClose, asset, onDelete }) => {
  if (!isOpen || !asset) return null;

  const Icon = TYPE_ICONS[asset.file_type] || File;
  const isImage = asset.file_type === 'image' && asset.file_url;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-4xl mx-4 max-h-[90vh] flex flex-col bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 rounded-xl bg-white/5">
              <Icon size={18} className="text-white/60" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-bold text-white truncate">
                {asset.file_name}
              </h2>
              <p className="text-xs text-white/40 capitalize">{asset.file_type}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {asset.file_url && (
              <a
                href={asset.file_url}
                download={asset.file_name}
                className="p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                title="Download"
              >
                <Download size={16} />
              </a>
            )}
            <button
              onClick={() => {
                onDelete?.(asset);
                onClose();
              }}
              className="p-2 rounded-lg hover:bg-red-500/20 text-white/40 hover:text-red-400 transition-colors"
              title="Delete"
            >
              <Trash2 size={16} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Preview */}
        <div className="flex-1 overflow-auto custom-scrollbar min-h-0">
          <div className="flex items-center justify-center p-8 bg-black/30 min-h-[300px]">
            {isImage ? (
              <img
                src={asset.file_url}
                alt={asset.file_name}
                className="max-w-full max-h-[50vh] object-contain rounded-xl"
              />
            ) : (
              <div className="text-center">
                <div className="p-6 rounded-full bg-white/5 inline-flex mb-4">
                  <Icon size={48} className="text-white/20" />
                </div>
                <p className="text-sm text-white/40">
                  Preview not available for this file type
                </p>
                {asset.file_url && (
                  <a
                    href={asset.file_url}
                    download={asset.file_name}
                    className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-semibold transition-all"
                  >
                    <Download size={14} />
                    Download to view
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Metadata */}
        <div className="border-t border-white/5 px-6 py-4 shrink-0">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-white/30">
                <HardDrive size={11} />
                Size
              </div>
              <p className="text-sm font-semibold text-white">
                {asset.file_size_display}
              </p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-white/30">
                <Maximize2 size={11} />
                Dimensions
              </div>
              <p className="text-sm font-semibold text-white">
                {asset.dimensions_display || '—'}
              </p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-white/30">
                <Calendar size={11} />
                Uploaded
              </div>
              <p className="text-sm font-semibold text-white">
                {formatDate(asset.created_at)}
              </p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-white/30">
                <User size={11} />
                Uploaded By
              </div>
              <p className="text-sm font-semibold text-white truncate">
                {asset.uploaded_by_name || '—'}
              </p>
            </div>
          </div>

          {/* Source info row */}
          {asset.source_display && (
            <div className="mt-4 pt-4 border-t border-white/5">
              <div className="flex items-start gap-3">
                <div className="p-1.5 rounded-lg bg-blue-500/10 shrink-0">
                  <ExternalLink size={13} className="text-blue-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-1">
                    Source
                  </p>
                  <p className="text-sm font-semibold text-blue-300 truncate">
                    {asset.source_display}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssetPreviewDialog;
