import React, { useRef, useState, useCallback } from 'react';
import RingLoader from '@/components/ui/RingLoader';

const ImageUploadField = ({ label, hint, currentUrl, onUpload, onRemove, showWarning }) => {
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [dragging, setDragging] = useState(false);

  const hasImage = !!(preview || currentUrl);

  const processFile = useCallback(async (file) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target.result);
    reader.readAsDataURL(file);

    setUploading(true);
    setMessage('');
    const result = await onUpload(file);
    setUploading(false);

    if (result.success) {
      setMessage(result.message || 'Uploaded successfully.');
      setMessageType('success');
      setPreview(null);
    } else {
      setMessage(result.message || 'Upload failed.');
      setMessageType('error');
      setPreview(null);
    }
    if (inputRef.current) inputRef.current.value = '';
  }, [onUpload]);

  const handleFileChange = (e) => processFile(e.target.files[0]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.type === 'image/png' || file.type === 'image/jpeg')) {
      processFile(file);
    } else if (file) {
      setMessage('Only PNG and JPG images are allowed.');
      setMessageType('error');
    }
  }, [processFile]);

  const handleDragOver = (e) => { e.preventDefault(); setDragging(true); };
  const handleDragLeave = () => setDragging(false);

  const handleRemove = async () => {
    setUploading(true);
    setMessage('');
    const result = await onRemove();
    setUploading(false);
    if (result.success) {
      setMessage('Removed.');
      setMessageType('success');
    } else {
      setMessage(result.message || 'Remove failed.');
      setMessageType('error');
    }
  };

  const displayUrl = preview || currentUrl;

  return (
    <div className="space-y-2">
      {/* Label row */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-medium text-white/70 uppercase tracking-wider">{label}</span>
          {showWarning && (
            <span className="ml-2 text-xs text-yellow-400/60">· appears on all invoices</span>
          )}
        </div>
        {hasImage && (
          <span className="text-xs text-green-400/70 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
            Uploaded
          </span>
        )}
      </div>

      {/* Drop zone / preview */}
      <div
        onClick={() => !uploading && inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`relative rounded-xl border transition-all cursor-pointer h-28 flex items-center justify-center overflow-hidden
          ${dragging
            ? 'border-white/40 bg-white/[0.08]'
            : hasImage
              ? 'border-white/10 bg-white/[0.03] hover:border-white/20'
              : 'border-dashed border-white/15 bg-white/[0.02] hover:border-white/30 hover:bg-white/[0.04]'
          }
          ${uploading ? 'opacity-60 pointer-events-none' : ''}
        `}
      >
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <RingLoader />
            <span className="text-xs text-white/40">Uploading…</span>
          </div>
        ) : displayUrl ? (
          <>
            <img
              src={displayUrl}
              alt={label}
              className="max-h-20 max-w-full object-contain px-4"
            />
            <div className="absolute inset-0 bg-black/0 hover:bg-black/30 transition-all flex items-center justify-center opacity-0 hover:opacity-100">
              <span className="text-xs text-white font-medium bg-black/60 px-3 py-1 rounded-lg">
                Click to change
              </span>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 text-white/25 select-none">
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            <span className="text-xs">Drop image here or click to browse</span>
          </div>
        )}
      </div>

      {/* Hint + actions row */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-white/25">{hint}</span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
            disabled={uploading}
            className="text-xs px-3 py-1.5 rounded-lg bg-white/[0.06] border border-white/10 text-white/70 hover:bg-white/[0.10] transition-all disabled:opacity-40"
          >
            {hasImage ? 'Change' : 'Upload'}
          </button>
          {currentUrl && !preview && (
            <button
              type="button"
              onClick={handleRemove}
              disabled={uploading}
              className="text-xs px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all disabled:opacity-40"
            >
              Remove
            </button>
          )}
        </div>
      </div>

      {message && (
        <p className={`text-xs ${messageType === 'success' ? 'text-green-400' : 'text-red-400'}`}>
          {message}
        </p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
};

export default ImageUploadField;
