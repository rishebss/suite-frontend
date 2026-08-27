import React, { useState, useCallback } from "react";
import {
  Search, Plus, Download, Upload, Filter,
  ChevronDown, ChevronRight, FolderTree, RefreshCw,
  MoreHorizontal, Edit3, Archive, Eye, X,
} from "lucide-react";
import Button from "@/components/Button";
import { useCategories, useCategoryActions, useCategoryTree } from "../hooks/useCategories";

const STATUS_BADGES = {
  ACTIVE: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  INACTIVE: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  ARCHIVED: "bg-gray-500/10 text-gray-400 border-gray-500/20",
};

const CategoryForm = ({ category, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    category_code: category?.category_code || "",
    category_name: category?.category_name || "",
    parent: category?.parent || "",
    description: category?.description || "",
    status: category?.status || "ACTIVE",
  });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const { createCategory, updateCategory } = useCategoryActions();
  const { categories } = useCategories({ show_archived: "true", page_size: 1000 });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError("");

    const data = {
      ...formData,
      parent: formData.parent || null,
    };

    const result = category
      ? await updateCategory(category.id, data)
      : await createCategory(data);

    if (result.success) {
      onSuccess();
    } else {
      setFormError(result.error || "Operation failed");
    }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg mx-4 bg-neutral-950 border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <h2 className="text-lg font-bold text-white">{category ? "Edit Category" : "Create Category"}</h2>
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
              <label className="text-[10px] font-bold uppercase tracking-wider text-white/30">Category Code *</label>
              <input
                required value={formData.category_code}
                onChange={(e) => setFormData({ ...formData, category_code: e.target.value })}
                className="w-full px-3 py-2 bg-gray-800/50 border border-white/10 rounded-lg text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/20"
                placeholder="e.g. CAT-001"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-white/30">Category Name *</label>
              <input
                required value={formData.category_name}
                onChange={(e) => setFormData({ ...formData, category_name: e.target.value })}
                className="w-full px-3 py-2 bg-gray-800/50 border border-white/10 rounded-lg text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/20"
                placeholder="e.g. Electronics"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-white/30">Parent Category</label>
            <select
              value={formData.parent || ""}
              onChange={(e) => setFormData({ ...formData, parent: e.target.value || "" })}
              className="w-full px-3 py-2 bg-gray-800/50 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-white/20"
            >
              <option value="" style={{ backgroundColor: '#1f2937', color: '#fff' }}>None (Top Level)</option>
              {categories.filter((c) => c.id !== category?.id).map((cat) => (
                <option key={cat.id} value={cat.id} style={{ backgroundColor: '#1f2937', color: '#fff' }}>{cat.category_name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-white/30">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 bg-gray-800/50 border border-white/10 rounded-lg text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 min-h-[80px] resize-none"
              placeholder="Optional description..."
            />
          </div>
          {category && (
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-white/30">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 bg-gray-800/50 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-white/20"
              >
                <option value="ACTIVE" style={{ backgroundColor: '#1f2937', color: '#fff' }}>Active</option>
                <option value="INACTIVE" style={{ backgroundColor: '#1f2937', color: '#fff' }}>Inactive</option>
                <option value="ARCHIVED" style={{ backgroundColor: '#1f2937', color: '#fff' }}>Archived</option>
              </select>
            </div>
          )}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" className="px-5 py-2.5 rounded-xl text-[10px] uppercase tracking-widest" onClick={onClose}>Cancel</Button>
            <Button variant="primary" type="submit" className="px-6 py-2.5 rounded-xl text-[10px] uppercase tracking-widest font-black" disabled={saving}>
              {saving ? "Saving..." : category ? "Update Category" : "Create Category"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

const CategoryTree = ({ nodes, level = 0, onEdit, onArchive }) => {
  const [expanded, setExpanded] = useState({});

  const toggle = (id) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  if (!nodes || nodes.length === 0) return null;

  return nodes.map((node) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expanded[node.id];

    return (
      <React.Fragment key={node.id}>
        <tr
          className="group hover:bg-white/[0.02] transition-colors"
          style={{ paddingLeft: `${level * 24}px` }}
        >
          <td className="px-5 py-3">
            <div className="flex items-center gap-2" style={{ paddingLeft: `${level * 24}px` }}>
              {hasChildren ? (
                <button
                  onClick={() => toggle(node.id)}
                  className="p-0.5 rounded hover:bg-white/10 text-white/30 hover:text-white/60 transition-all"
                >
                  {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </button>
              ) : (
                <span className="w-4" />
              )}
              <span className="text-xs font-mono font-bold text-white/50">{node.category_code}</span>
              <span className="text-sm font-semibold text-white">{node.category_name}</span>
            </div>
          </td>
          <td className="px-5 py-3">
            <span className="text-xs text-white/40">{node.parent_name || "—"}</span>
          </td>
          <td className="px-5 py-3">
            <span className="text-xs text-white/40">{node.description || "—"}</span>
          </td>
          <td className="px-5 py-3">
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${STATUS_BADGES[node.status] || STATUS_BADGES.INACTIVE}`}>
              {node.status}
            </span>
          </td>
          <td className="px-5 py-3">
            <span className="text-xs text-white/40">{node.item_count || 0}</span>
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
          <CategoryTree nodes={node.children} level={level + 1} onEdit={onEdit} onArchive={onArchive} />
        )}
      </React.Fragment>
    );
  });
};

const CategoryList = () => {
  const [filters, setFilters] = useState({ search: "", status: "", show_archived: "false" });
  const [page, setPage] = useState(1);
  const [pageSize] = useState(50);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState("list"); // "list" or "tree"

  const queryParams = { ...filters, page, page_size: pageSize };
  const { categories, count, loading, error, refetch } = useCategories(queryParams);
  const { tree, loading: treeLoading, refetch: refetchTree } = useCategoryTree();
  const actions = useCategoryActions();

  const handleCreate = () => { setEditingCategory(null); setShowForm(true); };
  const handleEdit = (cat) => { setEditingCategory(cat); setShowForm(true); };
  const handleArchive = async (cat) => {
    await actions.archiveCategory(cat.id);
    refetch();
    refetchTree();
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingCategory(null);
    refetch();
    refetchTree();
  };

  const handleExport = async () => {
    await actions.exportCategories({ format: "csv", ...filters });
  };

  const totalPages = Math.ceil(count / pageSize);

  return (
    <div className="flex flex-col min-h-full">
      <header className="px-10 py-8 flex justify-between items-end border-b border-white/5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-[0.2em] text-white/40">
            <FolderTree size={10} /> Categories
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white">Categories</h1>
          <p className="text-sm text-white/40 font-medium">{count} categories</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" className="w-auto px-3 py-1.5 border-none bg-white/5 hover:bg-white/10 text-white/60 text-[10px] uppercase tracking-widest" onClick={() => setShowFilters(!showFilters)}>
            <Filter size={13} className="mr-1.5" /> Filters
          </Button>
          <Button variant="secondary" className={`w-auto px-3 py-1.5 border-none text-[10px] uppercase tracking-widest ${viewMode === "tree" ? "bg-white/10 text-white" : "bg-white/5 text-white/60 hover:bg-white/10"}`} onClick={() => setViewMode(viewMode === "tree" ? "list" : "tree")}>
            <FolderTree size={13} className="mr-1.5" /> {viewMode === "tree" ? "List" : "Tree"}
          </Button>
          <Button variant="secondary" className="w-auto px-3 py-1.5 border-none bg-white/5 hover:bg-white/10 text-white/60 text-[10px] uppercase tracking-widest" onClick={handleExport}>
            <Download size={13} className="mr-1.5" /> Export
          </Button>
          <Button variant="primary" className="w-auto px-3.5 py-1.5 rounded-full text-[10px] uppercase tracking-widest font-black" onClick={handleCreate}>
            <Plus size={13} className="mr-1.5" /> Add Category
          </Button>
        </div>
      </header>

      <div className="px-10 py-4 border-b border-white/5">
        <div className="relative max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="text" placeholder="Search by code or name..."
            value={filters.search}
            onChange={(e) => { setFilters((prev) => ({ ...prev, search: e.target.value })); setPage(1); }}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-800/50 border border-white/10 rounded-xl text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 focus:bg-gray-800/70 transition-all"
          />
        </div>
      </div>

      {showFilters && (
        <div className="px-10 py-4 border-b border-white/5 bg-white/[0.01]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Filters</span>
            <button onClick={() => setShowFilters(false)} className="p-1 rounded hover:bg-white/10 text-white/40 hover:text-white/70 transition-all">
              <X size={14} />
            </button>
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
              <button
                onClick={() => setFilters((prev) => ({ ...prev, show_archived: prev.show_archived === "true" ? "false" : "true" }))}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filters.show_archived === "true" ? "bg-white/10 text-white" : "bg-white/5 text-white/40 hover:text-white/60"}`}
              >
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
                <FolderTree size={48} className="text-white/10 mb-4" />
                <h3 className="text-lg font-semibold text-white/40 mb-1">No categories found</h3>
                <p className="text-sm text-white/20">Create your first category to get started.</p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-white/5">
                <table className="w-full">
                  <thead>
                    <tr className="bg-white/[0.02] border-b border-white/5">
                      <th className="text-left px-5 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Category</th>
                      <th className="text-left px-5 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Parent</th>
                      <th className="text-left px-5 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Description</th>
                      <th className="text-left px-5 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Status</th>
                      <th className="text-left px-5 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Items</th>
                      <th className="text-right px-5 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    <CategoryTree nodes={tree} onEdit={handleEdit} onArchive={handleArchive} />
                  </tbody>
                </table>
              </div>
            )}
          </>
        ) : (
          <>
            {categories.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <FolderTree size={48} className="text-white/10 mb-4" />
                <h3 className="text-lg font-semibold text-white/40 mb-1">No categories found</h3>
                <p className="text-sm text-white/20">{filters.search ? "Try a different search term." : "Create your first category to get started."}</p>
                {!filters.search && (
                  <button onClick={handleCreate}
                    className="mt-4 px-3.5 py-1.5 rounded-full text-[10px] uppercase tracking-widest font-black bg-white text-black hover:bg-gray-100 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                    <Plus size={14} /> Add First Category
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
                      <th className="text-left px-5 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Parent</th>
                      <th className="text-left px-5 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Status</th>
                      <th className="text-right px-5 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {categories.map((cat) => (
                      <tr key={cat.id} className="group hover:bg-white/[0.02] transition-colors">
                        <td className="px-5 py-4">
                          <span className="text-xs font-mono font-bold text-white/50">{cat.category_code}</span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-sm font-semibold text-white">{cat.category_name}</span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-sm text-white/50">{cat.parent_name || "—"}</span>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${STATUS_BADGES[cat.status] || STATUS_BADGES.INACTIVE}`}>
                            {cat.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => handleEdit(cat)} className="p-1.5 rounded-lg hover:bg-white/10 text-white/30 hover:text-white/60 transition-all" title="Edit">
                              <Edit3 size={14} />
                            </button>
                            {cat.status !== "ARCHIVED" && (
                              <button onClick={() => handleArchive(cat)} className="p-1.5 rounded-lg hover:bg-white/10 text-white/30 hover:text-white/60 transition-all" title="Archive">
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
                <p className="text-xs text-white/30">Page {page} of {totalPages} ({count} categories)</p>
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
        <CategoryForm
          category={editingCategory}
          onClose={() => { setShowForm(false); setEditingCategory(null); }}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  );
};

export default CategoryList;
