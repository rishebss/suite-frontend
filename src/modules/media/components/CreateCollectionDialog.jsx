import React, { useState, useEffect } from 'react';
import { X, FolderPlus, Loader2, Users, User, FileType } from 'lucide-react';

const ENTITY_TYPES = [
  { value: 'generic', label: 'Generic', icon: FileType, desc: 'General purpose assets with no entity mapping' },
  { value: 'contact', label: 'Contact', icon: User, desc: 'Assets linked to a contact (customer, lead, etc.)' },
  { value: 'staff', label: 'Staff', icon: Users, desc: 'Assets linked to an employee/staff member' },
];

const CreateCollectionDialog = ({ isOpen, onClose, onSave, collection }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [entityType, setEntityType] = useState('generic');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const isEditing = !!collection;

  useEffect(() => {
    if (isOpen) {
      setName(collection?.name || '');
      setDescription(collection?.description || '');
      setEntityType(collection?.entity_type || 'generic');
      setError('');
    }
  }, [isOpen, collection]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Collection name is required');
      return;
    }
    try {
      setSaving(true);
      await onSave({ name: name.trim(), description: description.trim(), entity_type: entityType });
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Dialog */}
      <div className="relative w-full max-w-md mx-4 bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-500/10">
              <FolderPlus size={18} className="text-blue-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {isEditing ? 'Rename Collection' : 'New Collection'}
              </h2>
              <p className="text-xs text-white/40">
                {isEditing
                  ? 'Update the name or description'
                  : 'Create a folder to organise your assets'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-widest text-white/40 mb-1.5">
              Collection Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Marketing Assets, Invoices, Brand Kit"
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/20 focus:ring-1 focus:ring-white/10 transition-all"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-widest text-white/40 mb-1.5">
              Entity Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {ENTITY_TYPES.map((type) => {
                const TypeIcon = type.icon;
                const isActive = entityType === type.value;
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setEntityType(type.value)}
                    className={`flex flex-col items-center gap-1.5 px-3 py-3 rounded-xl border text-left transition-all ${
                      isActive
                        ? 'bg-blue-500/15 border-blue-500/40 text-blue-300'
                        : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white/70'
                    }`}
                  >
                    <TypeIcon size={18} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">
                      {type.label}
                    </span>
                    <span className="text-[9px] text-center leading-tight opacity-60">
                      {type.desc.split(' ').slice(0, 4).join(' ')}...
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="mt-1.5 text-[10px] text-white/30">
              {ENTITY_TYPES.find((t) => t.value === entityType)?.desc}
            </p>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-widest text-white/40 mb-1.5">
              Description{' '}
              <span className="text-white/20 font-normal normal-case tracking-normal">
                (optional)
              </span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this collection for?"
              rows={2}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/20 focus:ring-1 focus:ring-white/10 transition-all resize-none"
            />
          </div>

          {error && (
            <p className="text-xs text-red-400 font-medium">{error}</p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold text-white/60 bg-white/5 hover:bg-white/10 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 px-4 rounded-xl text-sm font-bold text-black bg-white hover:bg-gray-100 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {saving && <Loader2 size={14} className="animate-spin" />}
              {saving
                ? 'Saving...'
                : isEditing
                  ? 'Save Changes'
                  : 'Create Collection'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCollectionDialog;
