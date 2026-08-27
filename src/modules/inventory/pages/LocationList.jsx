import React, { useState } from "react";
import {
  Search, Plus, Download, Upload, Filter,
  ChevronDown, ChevronRight, MapPin, RefreshCw,
  MoreHorizontal, Edit3, Archive, Eye, X, Building2,
} from "lucide-react";
import Button from "@/components/Button";
import { useLocations, useLocationActions, useLocationTree, useLocationTypes } from "../hooks/useLocations";

const STATUS_BADGES = {
  ACTIVE: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  INACTIVE: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  ARCHIVED: "bg-gray-500/10 text-gray-400 border-gray-500/20",
};

const LocationForm = ({ location, locationTypes, locations, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    location_code: location?.location_code || "",
    location_name: location?.location_name || "",
    location_type: location?.location_type || "",
    parent_location: location?.parent_location || "",
    address: location?.address || "",
    city: location?.city || "",
    state: location?.state || "",
    country: location?.country || "",
    postal_code: location?.postal_code || "",
    phone: location?.phone || "",
    email: location?.email || "",
    contact_person: location?.contact_person || "",
    mobile: location?.mobile || "",
    status: location?.status || "ACTIVE",
  });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const { createLocation, updateLocation } = useLocationActions();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError("");

    const data = {
      ...formData,
      location_type: formData.location_type || null,
      parent_location: formData.parent_location || null,
    };

    const result = location
      ? await updateLocation(location.id, data)
      : await createLocation(data);

    if (result.success) {
      onSuccess();
    } else {
      setFormError(result.error || "Operation failed");
    }
    setSaving(false);
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl mx-4 bg-neutral-950 border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <h2 className="text-lg font-bold text-white">{location ? "Edit Location" : "Create Location"}</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-white/70 transition-all">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {formError && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400">{formError}</div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-white/30">Location Code *</label>
              <input required value={formData.location_code}
                onChange={(e) => handleChange("location_code", e.target.value)}
                className="w-full px-3 py-2 bg-gray-800/50 border border-white/10 rounded-lg text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/20"
                placeholder="e.g. BLR-001" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-white/30">Location Name *</label>
              <input required value={formData.location_name}
                onChange={(e) => handleChange("location_name", e.target.value)}
                className="w-full px-3 py-2 bg-gray-800/50 border border-white/10 rounded-lg text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/20"
                placeholder="e.g. Bangalore Branch" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-white/30">Location Type *</label>
              <select required value={formData.location_type}
                onChange={(e) => handleChange("location_type", e.target.value)}
                className="w-full px-3 py-2 bg-gray-800/50 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-white/20 appearance-none">
                <option value="" style={{ backgroundColor: '#1f2937', color: '#fff' }}>Select type</option>
                {locationTypes.map((lt) => (
                  <option key={lt.id} value={lt.id} style={{ backgroundColor: '#1f2937', color: '#fff' }}>
                    {lt.type_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-white/30">Parent Location</label>
              <select value={formData.parent_location}
                onChange={(e) => handleChange("parent_location", e.target.value)}
                className="w-full px-3 py-2 bg-gray-800/50 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-white/20 appearance-none">
                <option value="" style={{ backgroundColor: '#1f2937', color: '#fff' }}>None (Top Level)</option>
                {locations.filter((l) => l.id !== location?.id).map((l) => (
                  <option key={l.id} value={l.id} style={{ backgroundColor: '#1f2937', color: '#fff' }}>
                    {l.location_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-white/30">Address</label>
            <textarea value={formData.address}
              onChange={(e) => handleChange("address", e.target.value)}
              className="w-full px-3 py-2 bg-gray-800/50 border border-white/10 rounded-lg text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 min-h-[60px] resize-none"
              placeholder="Street address..." />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-white/30">City</label>
              <input value={formData.city} onChange={(e) => handleChange("city", e.target.value)}
                className="w-full px-3 py-2 bg-gray-800/50 border border-white/10 rounded-lg text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/20" placeholder="Bangalore" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-white/30">State</label>
              <input value={formData.state} onChange={(e) => handleChange("state", e.target.value)}
                className="w-full px-3 py-2 bg-gray-800/50 border border-white/10 rounded-lg text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/20" placeholder="Karnataka" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-white/30">Country</label>
              <input value={formData.country} onChange={(e) => handleChange("country", e.target.value)}
                className="w-full px-3 py-2 bg-gray-800/50 border border-white/10 rounded-lg text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/20" placeholder="India" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-white/30">Contact Person</label>
              <input value={formData.contact_person} onChange={(e) => handleChange("contact_person", e.target.value)}
                className="w-full px-3 py-2 bg-gray-800/50 border border-white/10 rounded-lg text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/20" placeholder="John Doe" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-white/30">Mobile</label>
              <input value={formData.mobile} onChange={(e) => handleChange("mobile", e.target.value)}
                className="w-full px-3 py-2 bg-gray-800/50 border border-white/10 rounded-lg text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/20" placeholder="+91-9876543210" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-white/30">Postal Code</label>
              <input value={formData.postal_code} onChange={(e) => handleChange("postal_code", e.target.value)}
                className="w-full px-3 py-2 bg-gray-800/50 border border-white/10 rounded-lg text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/20" placeholder="560001" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-white/30">Phone</label>
              <input value={formData.phone} onChange={(e) => handleChange("phone", e.target.value)}
                className="w-full px-3 py-2 bg-gray-800/50 border border-white/10 rounded-lg text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/20" placeholder="+91-80-..." />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-white/30">Email</label>
              <input type="email" value={formData.email} onChange={(e) => handleChange("email", e.target.value)}
                className="w-full px-3 py-2 bg-gray-800/50 border border-white/10 rounded-lg text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/20" placeholder="branch@company.com" />
            </div>
          </div>

          {location && (
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-white/30">Status</label>
              <select value={formData.status} onChange={(e) => handleChange("status", e.target.value)}
                className="w-full px-3 py-2 bg-gray-800/50 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-white/20 appearance-none">
                <option value="ACTIVE" style={{ backgroundColor: '#1f2937', color: '#fff' }}>Active</option>
                <option value="INACTIVE" style={{ backgroundColor: '#1f2937', color: '#fff' }}>Inactive</option>
                <option value="ARCHIVED" style={{ backgroundColor: '#1f2937', color: '#fff' }}>Archived</option>
              </select>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/5">
            <Button variant="secondary" type="button" className="px-5 py-2.5 rounded-xl text-[10px] uppercase tracking-widest" onClick={onClose}>Cancel</Button>
            <Button variant="primary" type="submit" className="px-6 py-2.5 rounded-xl text-[10px] uppercase tracking-widest font-black" disabled={saving}>
              {saving ? "Saving..." : location ? "Update Location" : "Create Location"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

const LocationTree = ({ nodes, level = 0, onEdit, onArchive }) => {
  const [expanded, setExpanded] = useState({});

  const toggle = (id) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  if (!nodes || nodes.length === 0) return null;

  return nodes.map((node) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expanded[node.id];

    return (
      <React.Fragment key={node.id}>
        <tr className="group hover:bg-white/[0.02] transition-colors">
          <td className="px-5 py-3">
            <div className="flex items-center gap-2" style={{ paddingLeft: `${level * 24}px` }}>
              {hasChildren ? (
                <button onClick={() => toggle(node.id)}
                  className="p-0.5 rounded hover:bg-white/10 text-white/30 hover:text-white/60 transition-all">
                  {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </button>
              ) : <span className="w-4" />}
              <span className="text-xs font-mono font-bold text-white/50">{node.location_code}</span>
              <span className="text-sm font-semibold text-white">{node.location_name}</span>
            </div>
          </td>
          <td className="px-5 py-3">
            <span className="text-xs text-white/40">{node.location_type_name || "—"}</span>
          </td>
          <td className="px-5 py-3">
            <span className="text-xs text-white/40">{node.city || "—"}</span>
          </td>
          <td className="px-5 py-3">
            <span className="text-xs text-white/40">{node.parent_name || "—"}</span>
          </td>
          <td className="px-5 py-3">
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${STATUS_BADGES[node.status] || STATUS_BADGES.INACTIVE}`}>
              {node.status}
            </span>
          </td>
          <td className="px-5 py-3 text-right">
            <div className="flex items-center justify-end gap-1">
              <button onClick={() => onEdit(node)} className="p-1.5 rounded-lg hover:bg-white/10 text-white/30 hover:text-white/60 transition-all" title="Edit">
                <Edit3 size={14} />
              </button>
              {node.status !== "ARCHIVED" && (
                <button onClick={() => onArchive(node)} className="p-1.5 rounded-lg hover:bg-white/10 text-white/30 hover:text-white/60 transition-all" title="Archive">
                  <Archive size={14} />
                </button>
              )}
            </div>
          </td>
        </tr>
        {hasChildren && isExpanded && (
          <LocationTree nodes={node.children} level={level + 1} onEdit={onEdit} onArchive={onArchive} />
        )}
      </React.Fragment>
    );
  });
};

const LocationList = () => {
  const [filters, setFilters] = useState({ search: "", status: "", show_archived: "false" });
  const [page, setPage] = useState(1);
  const [pageSize] = useState(50);
  const [showForm, setShowForm] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState("list");

  const queryParams = { ...filters, page, page_size: pageSize };
  const { locations, count, loading, error, refetch } = useLocations(queryParams);
  const { tree, loading: treeLoading, refetch: refetchTree } = useLocationTree();
  const { locationTypes } = useLocationTypes();
  const actions = useLocationActions();

  const handleCreate = () => { setEditingLocation(null); setShowForm(true); };
  const handleEdit = (loc) => { setEditingLocation(loc); setShowForm(true); };
  const handleArchive = async (loc) => {
    await actions.archiveLocation(loc.id);
    refetch();
    refetchTree();
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingLocation(null);
    refetch();
    refetchTree();
  };

  const handleExport = async () => {
    await actions.exportLocations({ format: "csv", ...filters });
  };

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    const result = await actions.importLocations(formData);
    if (result.success) {
      refetch();
      refetchTree();
    }
    e.target.value = "";
  };

  const totalPages = Math.ceil(count / pageSize);

  return (
    <div className="flex flex-col min-h-full">
      <header className="px-10 py-8 flex justify-between items-end border-b border-white/5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-[0.2em] text-white/40">
            <MapPin size={10} /> Locations
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white">Locations</h1>
          <p className="text-sm text-white/40 font-medium">{count} locations</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" className="w-auto px-3 py-1.5 border-none bg-white/5 hover:bg-white/10 text-white/60 text-[10px] uppercase tracking-widest"
            onClick={() => setShowFilters(!showFilters)}>
            <Filter size={13} className="mr-1.5" /> Filters
          </Button>
          <Button variant="secondary" className={`w-auto px-3 py-1.5 border-none text-[10px] uppercase tracking-widest ${viewMode === "tree" ? "bg-white/10 text-white" : "bg-white/5 text-white/60 hover:bg-white/10"}`}
            onClick={() => setViewMode(viewMode === "tree" ? "list" : "tree")}>
            <Building2 size={13} className="mr-1.5" /> {viewMode === "tree" ? "List" : "Tree"}
          </Button>
          <input type="file" accept=".csv,.xlsx" onChange={handleImport} className="hidden" id="import-locations" />
          <Button variant="secondary" className="w-auto px-3 py-1.5 border-none bg-white/5 hover:bg-white/10 text-white/60 text-[10px] uppercase tracking-widest"
            onClick={() => document.getElementById("import-locations")?.click()}>
            <Upload size={13} className="mr-1.5" /> Import
          </Button>
          <Button variant="secondary" className="w-auto px-3 py-1.5 border-none bg-white/5 hover:bg-white/10 text-white/60 text-[10px] uppercase tracking-widest"
            onClick={handleExport}>
            <Download size={13} className="mr-1.5" /> Export
          </Button>
          <Button variant="primary" className="w-auto px-3.5 py-1.5 rounded-full text-[10px] uppercase tracking-widest font-black" onClick={handleCreate}>
            <Plus size={13} className="mr-1.5" /> Add Location
          </Button>
        </div>
      </header>

      <div className="px-10 py-4 border-b border-white/5">
        <div className="relative max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input type="text" placeholder="Search by code, name, city..." value={filters.search}
            onChange={(e) => { setFilters((prev) => ({ ...prev, search: e.target.value })); setPage(1); }}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-800/50 border border-white/10 rounded-xl text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 focus:bg-gray-800/70 transition-all" />
        </div>
      </div>

      {showFilters && (
        <div className="px-10 py-4 border-b border-white/5 bg-white/[0.01]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Filters</span>
            <button onClick={() => setShowFilters(false)} className="p-1 rounded hover:bg-white/10 text-white/40 hover:text-white/70 transition-all"><X size={14} /></button>
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-white/30">Status</label>
              <select value={filters.status} onChange={(e) => { setFilters((prev) => ({ ...prev, status: e.target.value })); setPage(1); }}
                className="px-3 py-1.5 bg-gray-800/50 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-white/20 appearance-none">
                <option value="" style={{ backgroundColor: '#1f2937', color: '#fff' }}>All Statuses</option>
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
        {loading || treeLoading ? (
          <div className="flex items-center justify-center py-20">
            <RefreshCw size={24} className="text-white/30 animate-spin" />
          </div>
        ) : viewMode === "tree" ? (
          <>
            {tree.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <MapPin size={48} className="text-white/10 mb-4" />
                <h3 className="text-lg font-semibold text-white/40 mb-1">No locations found</h3>
                <p className="text-sm text-white/20">Create your first location to get started.</p>
                <button onClick={handleCreate}
                  className="mt-4 px-3.5 py-1.5 rounded-full text-[10px] uppercase tracking-widest font-black bg-white text-black hover:bg-gray-100 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                  <Plus size={14} /> Add First Location
                </button>
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-white/5">
                <table className="w-full">
                  <thead>
                    <tr className="bg-white/[0.02] border-b border-white/5">
                      <th className="text-left px-5 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Location</th>
                      <th className="text-left px-5 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Type</th>
                      <th className="text-left px-5 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">City</th>
                      <th className="text-left px-5 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Parent</th>
                      <th className="text-left px-5 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Status</th>
                      <th className="text-right px-5 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    <LocationTree nodes={tree} onEdit={handleEdit} onArchive={handleArchive} />
                  </tbody>
                </table>
              </div>
            )}
          </>
        ) : (
          <>
            {locations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <MapPin size={48} className="text-white/10 mb-4" />
                <h3 className="text-lg font-semibold text-white/40 mb-1">No locations found</h3>
                <p className="text-sm text-white/20">
                  {filters.search ? "Try a different search term." : "Create your first location to get started."}
                </p>
                {!filters.search && (
                  <button onClick={handleCreate}
                    className="mt-4 px-3.5 py-1.5 rounded-full text-[10px] uppercase tracking-widest font-black bg-white text-black hover:bg-gray-100 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                    <Plus size={14} /> Add First Location
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
                      <th className="text-left px-5 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Type</th>
                      <th className="text-left px-5 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">City</th>
                      <th className="text-left px-5 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Parent</th>
                      <th className="text-left px-5 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Status</th>
                      <th className="text-right px-5 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {locations.map((loc) => (
                      <tr key={loc.id} className="group hover:bg-white/[0.02] transition-colors">
                        <td className="px-5 py-4">
                          <span className="text-xs font-mono font-bold text-white/50">{loc.location_code}</span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-sm font-semibold text-white">{loc.location_name}</span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-xs text-white/50">{loc.location_type_name || "—"}</span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-xs text-white/50">{loc.city || "—"}</span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-xs text-white/50">{loc.parent_name || "—"}</span>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${STATUS_BADGES[loc.status] || STATUS_BADGES.INACTIVE}`}>
                            {loc.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => handleEdit(loc)} className="p-1.5 rounded-lg hover:bg-white/10 text-white/30 hover:text-white/60 transition-all" title="Edit">
                              <Edit3 size={14} />
                            </button>
                            {loc.status !== "ARCHIVED" && (
                              <button onClick={() => handleArchive(loc)} className="p-1.5 rounded-lg hover:bg-white/10 text-white/30 hover:text-white/60 transition-all" title="Archive">
                                <Archive size={14} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <p className="text-xs text-white/30">Page {page} of {totalPages} ({count} locations)</p>
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
        <LocationForm
          location={editingLocation}
          locationTypes={locationTypes}
          locations={locations}
          onClose={() => { setShowForm(false); setEditingLocation(null); }}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  );
};

export default LocationList;
