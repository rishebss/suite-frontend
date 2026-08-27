import React, { useState, useCallback } from "react";
import {
  Search,
  Plus,
  Download,
  Upload,
  Filter,
  ChevronDown,
  Box,
  RefreshCw,
  MoreHorizontal,
  Edit3,
  Copy,
  Archive,
  Trash2,
  Eye,
  FileSpreadsheet,
} from "lucide-react";
import Button from "@/components/Button";
import { useItems, useItemActions, useItemReferenceData } from "../hooks/useItems";
import ItemForm from "./ItemForm";
import ItemImportModal from "../components/ItemImportModal";
import ItemFilters from "../components/ItemFilters";
import ConfirmDeleteDialog from "@/components/ConfirmDeleteDialog";

const STATUS_BADGES = {
  ACTIVE: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  INACTIVE: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  ARCHIVED: "bg-gray-500/10 text-gray-400 border-gray-500/20",
};

const ItemList = () => {
  const [filters, setFilters] = useState({ search: "", status: "", category: "", show_archived: "false" });
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [showFilters, setShowFilters] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [showImport, setShowImport] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [exportLoading, setExportLoading] = useState(false);

  const queryParams = { ...filters, page, page_size: pageSize };
  const { items, count, loading, error, refetch } = useItems(queryParams);
  const { categories, units, brands, loading: refLoading } = useItemReferenceData();
  const actions = useItemActions(queryParams);

  const handleSearch = useCallback(
    (e) => {
      setFilters((prev) => ({ ...prev, search: e.target.value }));
      setPage(1);
    },
    [],
  );

  const handleFilterChange = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  }, []);

  const handleCreate = () => {
    setEditingItem(null);
    setShowForm(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleClone = async (item) => {
    const result = await actions.cloneItem(item.id, {
      item_code: `${item.item_code}-CLONE`,
      item_name: `${item.item_name} - New Variant`,
    });
    if (result.success) {
      refetch();
    }
    setActiveDropdown(null);
  };

  const handleArchive = async (item) => {
    await actions.archiveItem(item.id);
    refetch();
    setActiveDropdown(null);
  };

  const handleRestore = async (item) => {
    await actions.restoreItem(item.id);
    refetch();
    setActiveDropdown(null);
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    await actions.deleteItem(deleteConfirm.id);
    refetch();
    setDeleteConfirm(null);
  };

  const handleExport = async () => {
    setExportLoading(true);
    await actions.exportItems({ format: "csv", ...filters });
    setExportLoading(false);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingItem(null);
    refetch();
  };

  const totalPages = Math.ceil(count / pageSize);

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <header className="px-10 py-8 flex justify-between items-end border-b border-white/5 relative z-20">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-[0.2em] text-white/40">
            <Box size={10} />
            Item Master
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white">Inventory</h1>
          <p className="text-sm text-white/40 font-medium">
            {count} item{count !== 1 ? "s" : ""} in your catalog
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            className="w-auto px-3 py-1.5 border-none bg-white/5 hover:bg-white/10 text-white/60 text-[10px] uppercase tracking-widest"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={13} className="mr-1.5" />
            Filters
          </Button>

          <Button
            variant="secondary"
            className="w-auto px-3 py-1.5 border-none bg-white/5 hover:bg-white/10 text-white/60 text-[10px] uppercase tracking-widest"
            onClick={() => setShowImport(true)}
          >
            <Upload size={13} className="mr-1.5" />
            Import
          </Button>

          <Button
            variant="secondary"
            className="w-auto px-3 py-1.5 border-none bg-white/5 hover:bg-white/10 text-white/60 text-[10px] uppercase tracking-widest"
            onClick={handleExport}
            disabled={exportLoading}
          >
            <Download size={13} className="mr-1.5" />
            {exportLoading ? "Exporting..." : "Export"}
          </Button>

          <Button
            variant="primary"
            className="w-auto px-3.5 py-1.5 rounded-full text-[10px] uppercase tracking-widest font-black"
            onClick={handleCreate}
          >
            <Plus size={13} className="mr-1.5" />
            Add Item
          </Button>
        </div>
      </header>

      {/* Search Bar */}
      <div className="px-10 py-4 border-b border-white/5">
        <div className="relative max-w-md">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"
          />
          <input
            type="text"
            placeholder="Search by code, name, or description..."
            value={filters.search}
            onChange={handleSearch}
            className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 focus:bg-white/[0.07] transition-all"
          />
        </div>
      </div>

      {/* Active Filters */}
      {showFilters && (
        <ItemFilters
          filters={filters}
          categories={categories}
          onChange={handleFilterChange}
          onClose={() => setShowFilters(false)}
        />
      )}

      {/* Error State */}
      {error && (
        <div className="mx-10 mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Table */}
      <main className="flex-1 p-10 pt-6 relative z-10">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <RefreshCw size={24} className="text-white/30 animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Box size={48} className="text-white/10 mb-4" />
            <h3 className="text-lg font-semibold text-white/40 mb-1">
              No items found
            </h3>
            <p className="text-sm text-white/20 max-w-md">
              {filters.search
                ? "Try a different search term or clear your filters."
                : "Get started by adding your first item or importing from a spreadsheet."}
            </p>
            {!filters.search && (
              <button
                onClick={handleCreate}
                className="mt-4 px-3.5 py-1.5 rounded-full text-[10px] uppercase tracking-widest font-black bg-white text-black hover:bg-gray-100 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <Plus size={14} />
                Add First Item
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Table */}
            <div className="overflow-hidden rounded-2xl border border-white/5">
              <table className="w-full">
                <thead>
                  <tr className="bg-white/[0.02] border-b border-white/5">
                    <th className="text-left px-5 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">
                      Item Code
                    </th>
                    <th className="text-left px-5 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">
                      Item Name
                    </th>
                    <th className="text-left px-5 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">
                      Category
                    </th>
                    <th className="text-left px-5 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">
                      Brand
                    </th>
                    <th className="text-left px-5 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">
                      Unit
                    </th>
                    <th className="text-left px-5 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">
                      Status
                    </th>
                    <th className="text-right px-5 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {items.map((item) => (
                    <tr
                      key={item.id}
                      className="group hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-5 py-4">
                        <span className="text-xs font-mono font-bold text-white/50 group-hover:text-white/70 transition-colors">
                          {item.item_code}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div>
                          <p className="text-sm font-semibold text-white group-hover:text-white/90 transition-colors">
                            {item.item_name}
                          </p>
                          {item.description && (
                            <p className="text-[11px] text-white/30 mt-0.5 line-clamp-1">
                              {item.description}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-sm text-white/50">
                          {item.category_name || "—"}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-sm text-white/50">
                          {item.brand_name || "—"}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-sm text-white/50">
                          {item.unit_name || "—"}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                            STATUS_BADGES[item.status] ||
                            STATUS_BADGES.INACTIVE
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right relative">
                        <div className="relative">
                          <button
                            onClick={() =>
                              setActiveDropdown(
                                activeDropdown === item.id ? null : item.id,
                              )
                            }
                            className="p-1.5 rounded-lg hover:bg-white/10 text-white/30 hover:text-white/60 transition-all"
                          >
                            <MoreHorizontal size={16} />
                          </button>

                          {activeDropdown === item.id && (
                            <>
                              <div
                                className="fixed inset-0 z-10"
                                onClick={() => setActiveDropdown(null)}
                              />
                              <div className="absolute right-0 top-full mt-1 z-20 w-44 bg-gray-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden">
                                <button
                                  onClick={() => {
                                    handleEdit(item);
                                    setActiveDropdown(null);
                                  }}
                                  className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-white/70 hover:text-white hover:bg-white/5 transition-all"
                                >
                                  <Edit3 size={14} className="text-white/40" />
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleClone(item)}
                                  className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-white/70 hover:text-white hover:bg-white/5 transition-all"
                                >
                                  <Copy size={14} className="text-white/40" />
                                  Clone
                                </button>
                                {item.status === "ARCHIVED" ? (
                                  <button
                                    onClick={() => handleRestore(item)}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-white/70 hover:text-white hover:bg-white/5 transition-all"
                                  >
                                    <Eye size={14} className="text-white/40" />
                                    Restore
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleArchive(item)}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-white/70 hover:text-white hover:bg-white/5 transition-all"
                                  >
                                    <Archive
                                      size={14}
                                      className="text-white/40"
                                    />
                                    Archive
                                  </button>
                                )}
                                <div className="border-t border-white/5" />
                                <button
                                  onClick={() => {
                                    setDeleteConfirm(item);
                                    setActiveDropdown(null);
                                  }}
                                  className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/5 transition-all"
                                >
                                  <Archive size={14} />
                                  Archive
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <p className="text-xs text-white/30">
                  Page {page} of {totalPages} ({count} items)
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="px-4 py-2 text-xs text-white/50 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="px-4 py-2 text-xs text-white/50 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Item Create/Edit Modal */}
      {showForm && (
        <ItemForm
          item={editingItem}
          categories={categories}
          units={units}
          brands={brands}
          onClose={() => {
            setShowForm(false);
            setEditingItem(null);
          }}
          onSuccess={handleFormSuccess}
        />
      )}

      {/* Import Modal */}
      {showImport && (
        <ItemImportModal
          onClose={() => setShowImport(false)}
          onSuccess={() => {
            setShowImport(false);
            refetch();
          }}
        />
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <ConfirmDeleteDialog
          title="Archive Item"
          message={`Are you sure you want to archive "${deleteConfirm.item_name}"? Archived items will not appear in dropdowns but will remain in historical records.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}
    </div>
  );
};

export default ItemList;
