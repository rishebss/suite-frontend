import React, { useState, useRef, useCallback } from 'react';
import { X, Upload, File, Image, Video, Music, FileText, Loader2, CheckCircle2, AlertCircle, Search, User, Users } from 'lucide-react';
import { mediaApi } from '../api/mediaApi';

const FILE_ICONS = {
  image: Image,
  video: Video,
  audio: Music,
  document: FileText,
  other: File,
};

const UploadAssetDialog = ({ isOpen, onClose, onUpload, collection }) => {
  const collectionName = collection?.name || '';
  const entityType = collection?.entity_type || 'generic';

  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState([]);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  // Entity search state
  const [entityQuery, setEntityQuery] = useState('');
  const [entityResults, setEntityResults] = useState([]);
  const [entitySearching, setEntitySearching] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState(null);
  const searchTimerRef = useRef(null);

  const handleEntitySearch = useCallback((query) => {
    setEntityQuery(query);
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);

    if (!query.trim()) {
      setEntityResults([]);
      return;
    }

    searchTimerRef.current = setTimeout(async () => {
      setEntitySearching(true);
      try {
        if (entityType === 'contact') {
          const res = await mediaApi.searchContacts(query);
          setEntityResults(res.data?.data || []);
        } else if (entityType === 'staff') {
          const res = await mediaApi.searchEmployees(query);
          setEntityResults(res.data?.data || []);
        }
      } catch {
        setEntityResults([]);
      } finally {
        setEntitySearching(false);
      }
    }, 300);
  }, [entityType]);

  const handleFileSelect = useCallback((e) => {
    const selected = Array.from(e.target.files || []);
    setFiles((prev) => [...prev, ...selected]);
    setError('');
    e.target.value = '';
  }, []);

  const removeFile = useCallback((index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleUpload = async () => {
    if (files.length === 0) {
      setError('Please select at least one file');
      return;
    }
    if (entityType !== 'generic' && !selectedEntity) {
      setError('Please select a ' + (entityType === 'contact' ? 'contact' : 'staff member') + ' first.');
      return;
    }
    try {
      setUploading(true);
      setError('');
      const results = [];
      for (const file of files) {
        await onUpload(file, selectedEntity?.id);
        results.push(file.name);
      }
      setUploaded(results);
      setFiles([]);
      // Auto-close after a brief moment
      setTimeout(() => {
        onClose();
        setUploaded([]);
        setSelectedEntity(null);
        setEntityQuery('');
        setEntityResults([]);
      }, 1200);
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (file) => {
    const type = file.type?.split('/')[0] || 'other';
    const Icon = FILE_ICONS[type] || FILE_ICONS.other;
    return Icon;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg mx-4 bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <div>
            <h2 className="text-base font-bold text-white">Upload Assets</h2>
            <p className="text-xs text-white/40">
              {collectionName ? `to "${collectionName}"` : 'Select files to upload'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Entity search — only shown when collection has an entity type */}
          {entityType !== 'generic' && (
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-white/40 mb-1.5">
                {entityType === 'contact' ? 'Link to Contact' : 'Link to Staff Member'}
              </label>
              {selectedEntity ? (
                <div className="flex items-center gap-2 px-3 py-2.5 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                  <div className="p-1 rounded-lg bg-blue-500/20">
                    {entityType === 'contact' ? <User size={14} className="text-blue-400" /> : <Users size={14} className="text-blue-400" />}
                  </div>
                  <span className="flex-1 text-sm font-semibold text-blue-200 truncate">
                    {selectedEntity.name || selectedEntity.full_name || selectedEntity.label}
                  </span>
                  <button
                    onClick={() => { setSelectedEntity(null); setEntityQuery(''); setEntityResults([]); }}
                    className="p-1 rounded-lg hover:bg-blue-500/20 text-blue-300/50 hover:text-blue-300 transition-colors"
                  >
                    <X size={13} />
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none" />
                  <input
                    type="text"
                    value={entityQuery}
                    onChange={(e) => handleEntitySearch(e.target.value)}
                    placeholder={entityType === 'contact' ? 'Search by name, email, or phone...' : 'Search by name, ID, or email...'}
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/20 focus:bg-white/[0.06] transition-all"
                  />
                  {entitySearching && (
                    <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 animate-spin" />
                  )}
                  {entityResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-zinc-800 border border-white/10 rounded-xl shadow-xl overflow-hidden z-30 max-h-44 overflow-y-auto custom-scrollbar">
                      {entityResults.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            setSelectedEntity(item);
                            setEntityQuery('');
                            setEntityResults([]);
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left text-xs text-white/70 hover:text-white hover:bg-white/5 transition-colors border-b border-white/5 last:border-b-0"
                        >
                          <div className="p-1 rounded-lg bg-white/5 shrink-0">
                            {entityType === 'contact' ? <User size={12} /> : <Users size={12} />}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold truncate">
                              {item.name || item.full_name || `${item.first_name} ${item.last_name}`}
                            </p>
                            <p className="text-[10px] text-white/30 truncate">
                              {item.contact_id || item.employee_id || item.email || item.personal_email}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Drop zone */}
          {files.length === 0 && !uploading && (
            <div
              onClick={() => inputRef.current?.click()}
              className="border-2 border-dashed border-white/10 rounded-2xl py-12 px-6 text-center cursor-pointer hover:border-white/20 hover:bg-white/[0.02] transition-all group"
            >
              <div className="p-3 rounded-full bg-white/5 inline-flex mb-3 group-hover:bg-white/10 transition-colors">
                <Upload size={24} className="text-white/30 group-hover:text-white/50" />
              </div>
              <p className="text-sm font-bold text-white/60 group-hover:text-white/80 transition-colors">
                Click to select files
              </p>
              <p className="text-[11px] text-white/20 mt-1">
                PNG, JPG, PDF, MP4, MP3 — up to 50 MB each
              </p>
            </div>
          )}

          {/* File list */}
          {files.length > 0 && !uploading && (
            <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-1">
              {files.map((file, idx) => {
                const Icon = getFileIcon(file);
                return (
                  <div
                    key={idx}
                    className="flex items-center gap-3 px-3 py-2.5 bg-white/5 rounded-xl border border-white/5"
                  >
                    <Icon size={16} className="shrink-0 text-white/40" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">
                        {file.name}
                      </p>
                      <p className="text-[10px] text-white/30">
                        {formatSize(file.size)}
                      </p>
                    </div>
                    <button
                      onClick={() => removeFile(idx)}
                      className="p-1 rounded-md hover:bg-red-500/20 text-white/30 hover:text-red-400 transition-colors"
                    >
                      <X size ={13} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Uploaded success */}
          {uploading && files.length > 0 && (
            <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-1">
              {files.map((file, idx) => {
                const isDone = uploaded.includes(file.name);
                const Icon = getFileIcon(file);
                return (
                  <div
                    key={idx}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all ${
                      isDone
                        ? 'bg-emerald-500/10 border-emerald-500/20'
                        : 'bg-white/5 border-white/5'
                    }`}
                  >
                    <Icon size={16} className="shrink-0 text-white/40" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">
                        {file.name}
                      </p>
                      <p className="text-[10px] text-white/30">
                        {formatSize(file.size)}
                      </p>
                    </div>
                    {isDone ? (
                      <CheckCircle2 size={14} className="shrink-0 text-emerald-400" />
                    ) : (
                      <Loader2 size={14} className="shrink-0 text-white/30 animate-spin" />
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Add more files button */}
          {files.length > 0 && !uploading && (
            <button
              onClick={() => inputRef.current?.click()}
              className="text-xs text-white/40 hover:text-white/60 transition-colors underline underline-offset-2"
            >
              + Add more files
            </button>
          )}

          {error && (
            <div className="flex items-center gap-2 px-4 py-2.5 bg-red-500/10 border border-red-500/20 rounded-xl">
              <AlertCircle size={14} className="shrink-0 text-red-400" />
              <p className="text-xs text-red-400 font-medium">{error}</p>
            </div>
          )}

          <input
            ref={inputRef}
            type="file"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv,.zip"
          />

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold text-white/60 bg-white/5 hover:bg-white/10 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={uploading || files.length === 0}
              className="flex-1 py-2.5 px-4 rounded-xl text-sm font-bold text-black bg-white hover:bg-gray-100 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload size={14} />
                  Upload {files.length > 0 ? `(${files.length} file${files.length !== 1 ? 's' : ''})` : ''}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadAssetDialog;
