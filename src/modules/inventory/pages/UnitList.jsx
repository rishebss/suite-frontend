import React, { useState } from "react";
import {
  Search, Plus, Download, Upload, Filter,
  Ruler, RefreshCw, MoreHorizontal, Edit3, Archive,
  Eye, X, Trash2,
} from "lucide-react";
import Button from "@/components/Button";
import { useUnits, useUnitActions, useUnitConversions } from "../hooks/useUnits";

const STATUS_BADGES = {
  ACTIVE: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  INACTIVE: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  ARCHIVED: "bg-gray-500/10 text-gray-400 border-gray-500/20",
};

const UnitForm = ({ unit, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    unit_code: unit?.unit_code || "",
    unit_name: unit?.unit_name || "",
    symbol: unit?.symbol || "",
    description: unit?.description || "",
    status: unit?.status || "ACTIVE",
  });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const { createUnit, updateUnit } = useUnitActions();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError("");
    const result = unit ? await updateUnit(unit.id, formData) : await createUnit(formData);
    if (result.success) onSuccess();
    else setFormError(result.error || "Operation failed");
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg mx-4 bg-neutral-950 border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <h2 className="text-lg font-bold text-white">{unit ? "Edit Unit" : "Create Unit"}</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-white/70 transition-all"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {formError && <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400">{formError}</div>}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-white/30">Unit Code *</label>
              <input required value={formData.unit_code} onChange={(e) => setFormData({ ...formData, unit_code: e.target.value })}
                className="w-full px-3 py-2 bg-gray-800/50 border border-white/10 rounded-lg text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/20" placeholder="e.g. PCS" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-white/30">Unit Name *</label>
              <input required value={formData.unit_name} onChange={(e) => setFormData({ ...formData, unit_name: e.target.value })}
                className="w-full px-3 py-2 bg-gray-800/50 border border-white/10 rounded-lg text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/20" placeholder="e.g. Pieces" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-white/30">Symbol</label>
              <input value={formData.symbol} onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
                className="w-full px-3 py-2 bg-gray-800/50 border border-white/10 rounded-lg text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/20" placeholder="e.g. pcs" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-white/30">Description</label>
            <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 min-h-[60px] resize-none" placeholder="Optional..." />
          </div>
          {unit && (
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-white/30">Status</label>
              <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 bg-gray-800/50 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-white/20">
                <option value="ACTIVE" style={{ backgroundColor: '#1f2937', color: '#fff' }}>Active</option>
                <option value="INACTIVE" style={{ backgroundColor: '#1f2937', color: '#fff' }}>Inactive</option>
                <option value="ARCHIVED" style={{ backgroundColor: '#1f2937', color: '#fff' }}>Archived</option>
              </select>
            </div>
          )}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" className="px-5 py-2.5 rounded-xl text-[10px] uppercase tracking-widest" onClick={onClose}>Cancel</Button>
            <Button variant="primary" type="submit" className="px-6 py-2.5 rounded-xl text-[10px] uppercase tracking-widest font-black" disabled={saving}>
              {saving ? "Saving..." : unit ? "Update Unit" : "Create Unit"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ConversionsPanel = ({ unitId, onClose }) => {
  const { conversions, loading, addConversion, removeConversion, refetch } = useUnitConversions(unitId);
  const [newConv, setNewConv] = useState({ to_unit: "", conversion_factor: "" });
  const [adding, setAdding] = useState(false);
  const [convError, setConvError] = useState("");

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newConv.to_unit || !newConv.conversion_factor) return;
    setAdding(true);
    setConvError("");
    const result = await addConversion({
      to_unit: newConv.to_unit,
      conversion_factor: parseFloat(newConv.conversion_factor),
    });
    if (result.success) {
      setNewConv({ to_unit: "", conversion_factor: "" });
    } else {
      setConvError(result.error || "Failed to add conversion");
    }
    setAdding(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg mx-4 bg-neutral-950 border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <h2 className="text-lg font-bold text-white">Unit Conversions</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-white/70 transition-all"><X size={18} /></button>
        </div>
        <div className="px-6 py-5 space-y-5">
          {convError && <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400">{convError}</div>}

          <form onSubmit={handleAdd} className="flex items-end gap-3">
            <div className="flex-1 space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-white/30">To Unit</label>
              <input value={newConv.to_unit} onChange={(e) => setNewConv({ ...newConv, to_unit: e.target.value })}
                className="w-full px-3 py-2 bg-gray-800/50 border border-white/10 rounded-lg text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/20" placeholder="Unit code" />
            </div>
            <div className="flex-1 space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-white/30">Factor</label>
              <input type="number" step="0.000001" min="0.000001" value={newConv.conversion_factor}
                onChange={(e) => setNewConv({ ...newConv, conversion_factor: e.target.value })}
                className="w-full px-3 py-2 bg-gray-800/50 border border-white/10 rounded-lg text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/20" placeholder="12" />
            </div>
            <Button variant="primary" type="submit" disabled={adding || !newConv.to_unit || !newConv.conversion_factor}
              className="px-4 py-2 rounded-lg text-[10px] uppercase tracking-widest font-black">
              {adding ? "..." : "Add"}
            </Button>
          </form>

          <div className="space-y-2">
            {loading ? (
              <div className="flex justify-center py-4"><RefreshCw size={16} className="text-white/30 animate-spin" /></div>
            ) : conversions.length === 0 ? (
              <p className="text-xs text-white/30 text-center py-4">No conversions defined.</p>
            ) : (
              conversions.map((conv) => (
                <div key={conv.id} className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-white/70 font-mono">1 {conv.from_unit_name}</span>
                    <span className="text-xs text-white/30">=</span>
                    <span className="text-xs text-white font-bold font-mono">{conv.conversion_factor}</span>
                    <span className="text-xs text-white/70 font-mono">{conv.to_unit_name}</span>
                  </div>
                  <button onClick={() => removeConversion(conv.id)} className="p-1 rounded hover:bg-red-500/10 text-white/30 hover:text-red-400 transition-all">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const UnitList = () => {
  const [filters, setFilters] = useState({ search: "", status: "", show_archived: "false" });
  const [page, setPage] = useState(1);
  const [pageSize] = useState(50);
  const [showForm, setShowForm] = useState(false);
  const [editingUnit, setEditingUnit] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [conversionsUnitId, setConversionsUnitId] = useState(null);

  const queryParams = { ...filters, page, page_size: pageSize };
  const { units, count, loading, error, refetch } = useUnits(queryParams);
  const actions = useUnitActions();

  const handleCreate = () => { setEditingUnit(null); setShowForm(true); };
  const handleEdit = (u) => { setEditingUnit(u); setShowForm(true); };
  const handleArchive = async (u) => {
    await actions.archiveUnit(u.id);
    refetch();
  };

  const handleFormSuccess = () => { setShowForm(false); setEditingUnit(null); refetch(); };
  const handleExport = async () => { await actions.exportUnits({ format: "csv", ...filters }); };

  const totalPages = Math.ceil(count / pageSize);

  return (
    <div className="flex flex-col min-h-full">
      <header className="px-10 py-8 flex justify-between items-end border-b border-white/5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-[0.2em] text-white/40">
            <Ruler size={10} /> Units
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white">Units of Measurement</h1>
          <p className="text-sm text-white/40 font-medium">{count} units</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" className="w-auto px-3 py-1.5 border-none bg-white/5 hover:bg-white/10 text-white/60 text-[10px] uppercase tracking-widest" onClick={() => setShowFilters(!showFilters)}>
            <Filter size={13} className="mr-1.5" /> Filters
          </Button>
          <Button variant="secondary" className="w-auto px-3 py-1.5 border-none bg-white/5 hover:bg-white/10 text-white/60 text-[10px] uppercase tracking-widest" onClick={handleExport}>
            <Download size={13} className="mr-1.5" /> Export
          </Button>
          <Button variant="primary" className="w-auto px-3.5 py-1.5 rounded-full text-[10px] uppercase tracking-widest font-black" onClick={handleCreate}>
            <Plus size={13} className="mr-1.5" /> Add Unit
          </Button>
        </div>
      </header>

      <div className="px-10 py-4 border-b border-white/5">
        <div className="relative max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input type="text" placeholder="Search by code, name, or symbol..." value={filters.search}
            onChange={(e) => { setFilters((prev) => ({ ...prev, search: e.target.value })); setPage(1); }}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-800/50 border border-white/10 rounded-xl text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 focus:bg-gray-800/70 transition-all" />
        </div>
      </div>

      {showFilters && (
        <div className="px-10 py-4 border-b border-white/5 bg-white/[0.01]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Filters</span>
            <button onClick={() => setShowFilters(false)} className="p-1 rounded hover:bg-white/10 text-white/40 hover:text-white/70"><X size={14} /></button>
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-white/30">Status</label>
              <select value={filters.status} onChange={(e) => { setFilters((prev) => ({ ...prev, status: e.target.value })); setPage(1); }}
                className="px-3 py-1.5 bg-gray-800/50 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-white/20 appearance-none">
                <option value="">All Statuses</option>
                <option value="ACTIVE" style={{ backgroundColor: '#1f2937', color: '#fff' }}>Active</option>
                <option value="INACTIVE" style={{ backgroundColor: '#1f2937', color: '#fff' }}>Inactive</option>
                <option value="ARCHIVED" style={{ backgroundColor: '#1f2937', color: '#fff' }}>Archived</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-white/30">Show Archived</label>
              <button onClick={() => setFilters((prev) => ({ ...prev, show_archived: prev.show_archived === "true" ? "false" : "true" }))}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filters.show_archived === "true" ? "bg-white/10 text-white" : "bg-white/5 text-white/40 hover:text-white/60"}`}>
                {filters.show_archived === "true" ? "ON" : "OFF"}
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="mx-10 mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      <main className="flex-1 p-10 pt-6">
        {loading ? (
          <div className="flex items-center justify-center py-20"><RefreshCw size={24} className="text-white/30 animate-spin" /></div>
        ) : units.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Ruler size={48} className="text-white/10 mb-4" />
            <h3 className="text-lg font-semibold text-white/40 mb-1">No units found</h3>
            <p className="text-sm text-white/20">{filters.search ? "Try a different search term." : "Create your first unit of measurement."}</p>
            {!filters.search && (
              <button onClick={handleCreate}
                className="mt-4 px-3.5 py-1.5 rounded-full text-[10px] uppercase tracking-widest font-black bg-white text-black hover:bg-gray-100 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                <Plus size={14} /> Add First Unit
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-hidden rounded-2xl border border-white/5">
              <table className="w-full">
                <thead>
                  <tr className="bg-white/[0.02] border-b border-white/5">
                    <th className="text-left px-5 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Code</th>
                    <th className="text-left px-5 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Name</th>
                    <th className="text-left px-5 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Symbol</th>
                    <th className="text-left px-5 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Status</th>
                    <th className="text-right px-5 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {units.map((u) => (
                    <tr key={u.id} className="group hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-4">
                        <span className="text-xs font-mono font-bold text-white/50">{u.unit_code}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-sm font-semibold text-white">{u.unit_name}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-xs font-mono text-white/50">{u.symbol || "—"}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${STATUS_BADGES[u.status] || STATUS_BADGES.INACTIVE}`}>{u.status}</span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => setConversionsUnitId(u.id)} className="p-1.5 rounded-lg hover:bg-white/10 text-white/30 hover:text-white/60 transition-all" title="Conversions">📐</button>
                          <button onClick={() => handleEdit(u)} className="p-1.5 rounded-lg hover:bg-white/10 text-white/30 hover:text-white/60 transition-all" title="Edit"><Edit3 size={14} /></button>
                          {u.status !== "ARCHIVED" && (
                            <button onClick={() => handleArchive(u)} className="p-1.5 rounded-lg hover:bg-white/10 text-white/30 hover:text-white/60 transition-all" title="Archive"><Archive size={14} /></button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <p className="text-xs text-white/30">Page {page} of {totalPages} ({count} units)</p>
                <div className="flex items-center gap-2">
                  <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}
                    className="px-4 py-2 text-xs text-white/50 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed">Previous</button>
                  <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
                    className="px-4 py-2 text-xs text-white/50 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed">Next</button>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {showForm && (
        <UnitForm unit={editingUnit} onClose={() => { setShowForm(false); setEditingUnit(null); }} onSuccess={handleFormSuccess} />
      )}

      {conversionsUnitId && (
        <ConversionsPanel unitId={conversionsUnitId} onClose={() => setConversionsUnitId(null)} />
      )}
    </div>
  );
};

export default UnitList;
