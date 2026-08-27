import React, { useState } from "react";
import {
  Search, Plus, Tags, RefreshCw,
  Edit3, Trash2, X,
} from "lucide-react";
import Button from "@/components/Button";
import { useLocationTypes, useLocationActions } from "../hooks/useLocations";

const LocationTypeForm = ({ locationType, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    type_code: locationType?.type_code || "",
    type_name: locationType?.type_name || "",
    description: locationType?.description || "",
    status: locationType?.status || "ACTIVE",
  });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const { createLocationType, updateLocationType } = useLocationActions();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError("");
    const result = locationType
      ? await updateLocationType(locationType.id, formData)
      : await createLocationType(formData);
    if (result.success) onSuccess();
    else setFormError(result.error || "Operation failed");
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg mx-4 bg-neutral-950 border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <h2 className="text-lg font-bold text-white">
            {locationType ? "Edit Location Type" : "Create Location Type"}
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-white/70 transition-all">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {formError && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400">{formError}</div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-white/30">Type Code *</label>
              <input required value={formData.type_code}
                onChange={(e) => setFormData({ ...formData, type_code: e.target.value })}
                className="w-full px-3 py-2 bg-gray-800/50 border border-white/10 rounded-lg text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/20"
                placeholder="e.g. WH" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-white/30">Type Name *</label>
              <input required value={formData.type_name}
                onChange={(e) => setFormData({ ...formData, type_name: e.target.value })}
                className="w-full px-3 py-2 bg-gray-800/50 border border-white/10 rounded-lg text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/20"
                placeholder="e.g. Warehouse" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-white/30">Description</label>
            <textarea value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 bg-gray-800/50 border border-white/10 rounded-lg text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 min-h-[60px] resize-none"
              placeholder="Optional description..." />
          </div>
          {locationType && (
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-white/30">Status</label>
              <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 bg-gray-800/50 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-white/20 appearance-none">
                <option value="ACTIVE" style={{ backgroundColor: '#1f2937', color: '#fff' }}>Active</option>
                <option value="INACTIVE" style={{ backgroundColor: '#1f2937', color: '#fff' }}>Inactive</option>
              </select>
            </div>
          )}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/5">
            <Button variant="secondary" type="button" className="px-5 py-2.5 rounded-xl text-[10px] uppercase tracking-widest" onClick={onClose}>Cancel</Button>
            <Button variant="primary" type="submit" className="px-6 py-2.5 rounded-xl text-[10px] uppercase tracking-widest font-black" disabled={saving}>
              {saving ? "Saving..." : locationType ? "Update Type" : "Create Type"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ConfirmDelete = ({ locationType, onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center">
    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
    <div className="relative w-full max-w-sm mx-4 bg-neutral-950 border border-white/10 rounded-2xl shadow-2xl overflow-hidden p-6">
      <h3 className="text-lg font-bold text-white mb-2">Delete Location Type</h3>
      <p className="text-sm text-white/50 mb-6">
        Are you sure you want to delete <strong className="text-white/80">{locationType?.type_name}</strong>?
        This cannot be undone if the type is not in use.
      </p>
      <div className="flex items-center justify-end gap-3">
        <Button variant="secondary" className="px-5 py-2.5 rounded-xl text-[10px] uppercase tracking-widest" onClick={onCancel}>Cancel</Button>
        <button onClick={onConfirm}
          className="px-5 py-2.5 rounded-xl text-[10px] uppercase tracking-widest font-black bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all">
          Delete
        </button>
      </div>
    </div>
  </div>
);

const LocationTypeList = () => {
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingType, setEditingType] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const { locationTypes, loading, refetch } = useLocationTypes();
  const actions = useLocationActions();

  const filtered = locationTypes.filter(
    (t) =>
      t.type_code?.toLowerCase().includes(search.toLowerCase()) ||
      t.type_name?.toLowerCase().includes(search.toLowerCase()),
  );

  const handleCreate = () => { setEditingType(null); setShowForm(true); };
  const handleEdit = (t) => { setEditingType(t); setShowForm(true); };
  const handleDelete = async () => {
    if (!deleteConfirm) return;
    const result = await actions.deleteLocationType(deleteConfirm.id);
    if (result.success) {
      refetch();
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(null);
      alert(result.error || "Failed to delete — type may be in use by existing locations.");
    }
  };
  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingType(null);
    refetch();
  };

  return (
    <div className="flex flex-col min-h-full">
      <header className="px-10 py-8 flex justify-between items-end border-b border-white/5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-[0.2em] text-white/40">
            <Tags size={10} /> Configuration
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white">Location Types</h1>
          <p className="text-sm text-white/40 font-medium">{locationTypes.length} types configured</p>
        </div>
        <button onClick={handleCreate}
          className="px-3.5 py-1.5 rounded-full text-[10px] uppercase tracking-widest font-black bg-white text-black hover:bg-gray-100 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
          <Plus size={13} /> Add Type
        </button>
      </header>

      <div className="px-10 py-4 border-b border-white/5">
        <div className="relative max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input type="text" placeholder="Search by code or name..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-800/50 border border-white/10 rounded-xl text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 focus:bg-gray-800/70 transition-all" />
        </div>
      </div>

      <main className="flex-1 p-10 pt-6">
        {loading ? (
          <div className="flex items-center justify-center py-20"><RefreshCw size={24} className="text-white/30 animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Tags size={48} className="text-white/10 mb-4" />
            <h3 className="text-lg font-semibold text-white/40 mb-1">No location types</h3>
            <p className="text-sm text-white/20">
              {search ? "Try a different search term." : "Create your first location type like Warehouse, Branch, or Store."}
            </p>
            {!search && (
              <button onClick={handleCreate}
                className="mt-4 px-3.5 py-1.5 rounded-full text-[10px] uppercase tracking-widest font-black bg-white text-black hover:bg-gray-100 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                <Plus size={14} /> Add First Type
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-white/5">
            <table className="w-full">
              <thead>
                <tr className="bg-white/[0.02] border-b border-white/5">
                  <th className="text-left px-5 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Code</th>
                  <th className="text-left px-5 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Name</th>
                  <th className="text-left px-5 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Description</th>
                  <th className="text-left px-5 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Status</th>
                  <th className="text-right px-5 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((t) => (
                  <tr key={t.id} className="group hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-4">
                      <span className="text-xs font-mono font-bold text-white/50">{t.type_code}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm font-semibold text-white">{t.type_name}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs text-white/50 line-clamp-1">{t.description || "—"}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                        t.status === "ACTIVE"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                      }`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => handleEdit(t)} className="p-1.5 rounded-lg hover:bg-white/10 text-white/30 hover:text-white/60 transition-all" title="Edit">
                          <Edit3 size={14} />
                        </button>
                        <button onClick={() => setDeleteConfirm(t)} className="p-1.5 rounded-lg hover:bg-white/10 text-red-400/60 hover:text-red-400 transition-all" title="Delete">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {showForm && (
        <LocationTypeForm
          locationType={editingType}
          onClose={() => { setShowForm(false); setEditingType(null); }}
          onSuccess={handleFormSuccess}
        />
      )}

      {deleteConfirm && (
        <ConfirmDelete
          locationType={deleteConfirm}
          onConfirm={handleDelete}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}
    </div>
  );
};

export default LocationTypeList;
