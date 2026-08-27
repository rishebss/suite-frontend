import React, { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Paperclip, Upload, X, FileText, Link as LinkIcon, Loader2, Trash2 } from "lucide-react";

const AttachmentUpload = ({ workItemId, attachments = [], onUpload, onDelete, loading }) => {
  const fileInputRef = useRef(null);
  const [urlInput, setUrlInput] = useState("");
  const [showUrlForm, setShowUrlForm] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("file_name", file.name);
      formData.append("file_size", file.size);
      formData.append("work_item", workItemId);
      await onUpload?.(formData);
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleUrlSubmit = async () => {
    if (!urlInput.trim()) return;
    setUploading(true);
    try {
      await onUpload?.({
        work_item: workItemId,
        url: urlInput,
        file_name: urlInput.split("/").pop() || "Link",
      });
      setUrlInput("");
      setShowUrlForm(false);
    } catch (err) {
      console.error("Link save failed:", err);
    } finally {
      setUploading(false);
    }
  };

  const formatSize = (bytes) => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-white/80">
          <Paperclip size={16} />
          Attachments ({attachments?.length || 0})
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="p-1.5 rounded-lg hover:bg-zinc-800 text-white/40 hover:text-white transition-colors disabled:opacity-50"
            title="Upload file"
          >
            <Upload size={14} />
          </button>
          <button
            onClick={() => setShowUrlForm(!showUrlForm)}
            className="p-1.5 rounded-lg hover:bg-zinc-800 text-white/40 hover:text-white transition-colors"
            title="Add link"
          >
            <LinkIcon size={14} />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      </div>

      {showUrlForm && (
        <div className="flex gap-2">
          <input
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="Paste URL..."
            className="flex-1 px-2 py-1.5 rounded bg-zinc-800 border border-zinc-700 text-sm text-white placeholder-white/30 focus:outline-none focus:border-blue-500/50"
            onKeyDown={(e) => { if (e.key === "Enter") handleUrlSubmit(); }}
          />
          <button
            onClick={handleUrlSubmit}
            disabled={uploading || !urlInput.trim()}
            className="px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 disabled:opacity-50 transition-all text-xs font-semibold"
          >
            {uploading ? <Loader2 size={14} className="animate-spin" /> : "Add"}
          </button>
        </div>
      )}

      {uploading && (
        <div className="flex items-center gap-2 p-2 rounded-lg bg-zinc-900/60 border border-zinc-800">
          <Loader2 size={14} className="animate-spin text-blue-400" />
          <span className="text-xs text-white/50">Uploading...</span>
        </div>
      )}

      {loading ? (
        <div className="space-y-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-10 bg-zinc-900/40 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : attachments.length > 0 ? (
        <div className="space-y-1 max-h-40 overflow-y-auto">
          {attachments.map((att) => (
            <div key={att.id} className="flex items-center justify-between p-2 rounded-lg bg-zinc-900/20 border border-white/5 group">
              <div className="flex items-center gap-2 min-w-0">
                {att.url ? (
                  <LinkIcon size={12} className="text-cyan-400 shrink-0" />
                ) : (
                  <FileText size={12} className="text-pink-400 shrink-0" />
                )}
                <div className="min-w-0">
                  <a
                    href={att.file || att.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-white/70 hover:text-blue-400 truncate block transition-colors"
                  >
                    {att.file_name}
                  </a>
                  {att.file_size > 0 && (
                    <p className="text-[10px] text-white/30">{formatSize(att.file_size)}</p>
                  )}
                </div>
              </div>
              <button
                onClick={() => onDelete?.(att.id)}
                className="p-1 rounded hover:bg-zinc-800 text-white/20 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
              >
                <Trash2 size={10} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-white/30 text-center py-3">No attachments yet</p>
      )}
    </div>
  );
};

export default AttachmentUpload;
