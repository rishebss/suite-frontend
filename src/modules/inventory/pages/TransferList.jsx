import React, { useState, useMemo } from "react";
import {
  ArrowLeftRight, Search, Plus, X, ChevronDown, Download,
  CheckCircle, XCircle, Send, Truck, PackageCheck, Ban,
  ArrowUpDown, FileDown, Loader2,
} from "lucide-react";
import { useTransfers, useTransferActions } from "../hooks/useTransfers";
import { useItems } from "../hooks/useItems";
import { useLocations } from "../hooks/useLocations";

// ============================================================================
// STATUS CONFIG
// ============================================================================

const STATUS_CONFIG = {
  DRAFT: { label: "Draft", color: "text-gray-400 bg-gray-400/10 border-gray-400/20" },
  PENDING_APPROVAL: { label: "Pending", color: "text-amber-400 bg-amber-400/10 border-amber-400/20" },
  APPROVED: { label: "Approved", color: "text-blue-400 bg-blue-400/10 border-blue-400/20" },
  REJECTED: { label: "Rejected", color: "text-red-400 bg-red-400/10 border-red-400/20" },
  IN_TRANSIT: { label: "In Transit", color: "text-purple-400 bg-purple-400/10 border-purple-400/20" },
  RECEIVED: { label: "Received", color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" },
  PARTIALLY_RECEIVED: { label: "Partial", color: "text-orange-400 bg-orange-400/10 border-orange-400/20" },
  COMPLETED: { label: "Completed", color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" },
  CANCELLED: { label: "Cancelled", color: "text-red-400 bg-red-400/10 border-red-400/20" },
};

// ============================================================================
// TRANSFER FORM MODAL
// ============================================================================

const TransferForm = ({ isOpen, onClose, locations, items, onSubmit, loading }) => {
  const [form, setForm] = useState({
    source_location: "",
    destination_location: "",
    transfer_type: "STANDARD",
    transfer_date: new Date().toISOString().split("T")[0],
    remarks: "",
    items: [{ item_id: "", quantity: "", remarks: "" }],
  });
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleAddItem = () => {
    setForm((f) => ({ ...f, items: [...f.items, { item_id: "", quantity: "", remarks: "" }] }));
  };

  const handleRemoveItem = (idx) => {
    setForm((f) => ({ ...f, items: f.items.filter((_, i) => i !== idx) }));
  };

  const handleItemChange = (idx, field, value) => {
    setForm((f) => {
      const newItems = [...f.items];
      newItems[idx] = { ...newItems[idx], [field]: value };
      return { ...f, items: newItems };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.source_location || !form.destination_location) {
      setError("Please select source and destination locations.");
      return;
    }
    if (form.source_location === form.destination_location) {
      setError("Source and destination must be different.");
      return;
    }
    if (form.items.length === 0 || !form.items[0].item_id) {
      setError("Please add at least one item.");
      return;
    }

    const payload = {
      ...form,
      source_location: form.source_location,
      destination_location: form.destination_location,
      items: form.items
        .filter((i) => i.item_id && i.quantity)
        .map((i) => ({
          item_id: i.item_id,
          quantity: Number(i.quantity),
          remarks: i.remarks || "",
        })),
    };

    const result = await onSubmit(payload);
    if (!result.success) {
      setError(result.error || "Failed to create transfer.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-neutral-950 border border-white/10 rounded-2xl w-full max-w-3xl max-h-[85vh] overflow-y-auto custom-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/5">
          <div>
            <h3 className="text-lg font-bold text-white">New Transfer</h3>
            <p className="text-xs text-white/40 mt-0.5">Move stock between locations</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
            <X size={18} className="text-white/60" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Locations Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-1.5">Source</label>
              <select
                value={form.source_location}
                onChange={(e) => setForm((f) => ({ ...f, source_location: e.target.value }))}
                className="w-full px-3 py-2.5 bg-gray-800/50 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-white/20 appearance-none"
              >
                <option value="" style={{ backgroundColor: "#1f2937", color: "#fff" }}>Select source...</option>
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id} style={{ backgroundColor: "#1f2937", color: "#fff" }}>
                    {loc.location_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-1.5">Destination</label>
              <select
                value={form.destination_location}
                onChange={(e) => setForm((f) => ({ ...f, destination_location: e.target.value }))}
                className="w-full px-3 py-2.5 bg-gray-800/50 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-white/20 appearance-none"
              >
                <option value="" style={{ backgroundColor: "#1f2937", color: "#fff" }}>Select destination...</option>
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id} style={{ backgroundColor: "#1f2937", color: "#fff" }}>
                    {loc.location_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date + Type Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-1.5">Date</label>
              <input
                type="date"
                value={form.transfer_date}
                onChange={(e) => setForm((f) => ({ ...f, transfer_date: e.target.value }))}
                className="w-full px-3 py-2.5 bg-gray-800/50 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-white/20"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-1.5">Type</label>
              <select
                value={form.transfer_type}
                onChange={(e) => setForm((f) => ({ ...f, transfer_type: e.target.value }))}
                className="w-full px-3 py-2.5 bg-gray-800/50 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-white/20 appearance-none"
              >
                <option value="STANDARD" style={{ backgroundColor: "#1f2937", color: "#fff" }}>Standard</option>
                <option value="EMERGENCY" style={{ backgroundColor: "#1f2937", color: "#fff" }}>Emergency</option>
                <option value="RETURN" style={{ backgroundColor: "#1f2937", color: "#fff" }}>Return</option>
                <option value="DAMAGED" style={{ backgroundColor: "#1f2937", color: "#fff" }}>Damaged Stock</option>
              </select>
            </div>
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-1.5">Remarks</label>
            <textarea
              value={form.remarks}
              onChange={(e) => setForm((f) => ({ ...f, remarks: e.target.value }))}
              rows={2}
              className="w-full px-3 py-2.5 bg-gray-800/50 border border-white/10 rounded-xl text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 resize-none"
              placeholder="Optional notes..."
            />
          </div>

          {/* Line Items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-white/60 uppercase tracking-wider">Items</label>
              <button type="button" onClick={handleAddItem}
                className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors">
                <Plus size={12} /> Add Item
              </button>
            </div>
            <div className="space-y-2">
              {form.items.map((item, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-5">
                    <select
                      value={item.item_id}
                      onChange={(e) => handleItemChange(idx, "item_id", e.target.value)}
                      className="w-full px-2.5 py-2 bg-gray-800/50 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-white/20 appearance-none"
                    >
                      <option value="" style={{ backgroundColor: "#1f2937", color: "#fff" }}>Select item...</option>
                      {items.map((i) => (
                        <option key={i.id} value={i.id} style={{ backgroundColor: "#1f2937", color: "#fff" }}>
                          {i.item_code} — {i.item_name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <input type="number" min="0" step="0.01"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(idx, "quantity", e.target.value)}
                      placeholder="Qty"
                      className="w-full px-2.5 py-2 bg-gray-800/50 border border-white/10 rounded-lg text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-white/20"
                    />
                  </div>
                  <div className="col-span-4">
                    <input type="text"
                      value={item.remarks}
                      onChange={(e) => handleItemChange(idx, "remarks", e.target.value)}
                      placeholder="Remarks"
                      className="w-full px-2.5 py-2 bg-gray-800/50 border border-white/10 rounded-lg text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-white/20"
                    />
                  </div>
                  <div className="col-span-1 flex justify-end">
                    {form.items.length > 1 && (
                      <button type="button" onClick={() => handleRemoveItem(idx)}
                        className="p-2 hover:bg-red-500/10 rounded-lg transition-colors">
                        <X size={14} className="text-red-400" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white/50 hover:text-white hover:bg-white/5 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-white text-black hover:bg-gray-100 active:scale-[0.98] transition-all flex items-center gap-2 disabled:opacity-50">
              {loading ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
              Create Transfer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ============================================================================
// TRANSFER DETAIL MODAL
// ============================================================================

const TransferDetail = ({ transfer, onClose, onAction, actions }) => {
  const [notes, setNotes] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  if (!transfer) return null;

  const config = STATUS_CONFIG[transfer.status] || STATUS_CONFIG.DRAFT;
  const isDraft = transfer.status === "DRAFT";
  const isPending = transfer.status === "PENDING_APPROVAL";
  const isApproved = transfer.status === "APPROVED";
  const isInTransit = transfer.status === "IN_TRANSIT";

  const handleAction = async (actionFn) => {
    setActionLoading(true);
    try {
      const result = await actionFn(transfer.id, notes);
      if (result.success) {
        setNotes("");
        onClose();
      }
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-neutral-950 border border-white/10 rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto custom-scrollbar"
        onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <ArrowLeftRight size={18} className="text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">{transfer.transfer_number}</h3>
              <p className="text-xs text-white/40">{transfer.transfer_date}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
            <X size={18} className="text-white/60" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Status Badge */}
          <div className="flex items-center justify-between">
            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${config.color}`}>
              {config.label}
            </span>
            <span className="text-xs text-white/30">Type: {transfer.transfer_type || "Standard"}</span>
          </div>

          {/* Locations */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-white/5 rounded-xl">
              <p className="text-[9px] text-white/30 uppercase tracking-widest font-bold mb-1">Source</p>
              <p className="text-sm font-semibold text-white">{transfer.source_name || transfer.source_location?.location_name}</p>
            </div>
            <div className="p-4 bg-white/5 rounded-xl">
              <p className="text-[9px] text-white/30 uppercase tracking-widest font-bold mb-1">Destination</p>
              <p className="text-sm font-semibold text-white">{transfer.destination_name || transfer.destination_location?.location_name}</p>
            </div>
          </div>

          {/* Items Table */}
          <div>
            <p className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">Items ({transfer.items?.length || 0})</p>
            <div className="overflow-hidden rounded-xl border border-white/5">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-white/5">
                    <th className="text-left px-3 py-2 text-[10px] text-white/40 uppercase tracking-wider font-semibold">Item</th>
                    <th className="text-right px-3 py-2 text-[10px] text-white/40 uppercase tracking-wider font-semibold">Qty</th>
                    <th className="text-right px-3 py-2 text-[10px] text-white/40 uppercase tracking-wider font-semibold">Received</th>
                    <th className="text-right px-3 py-2 text-[10px] text-white/40 uppercase tracking-wider font-semibold">Damaged</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {(transfer.items || []).map((item, idx) => (
                    <tr key={item.id || idx} className="hover:bg-white/5">
                      <td className="px-3 py-2.5">
                        <p className="text-sm font-medium text-white">{item.item_name || item.item?.item_name}</p>
                        <p className="text-[10px] text-white/30">{item.item_code || item.item?.item_code}</p>
                      </td>
                      <td className="px-3 py-2.5 text-right text-sm text-white">{item.quantity}</td>
                      <td className="px-3 py-2.5 text-right text-sm text-emerald-400">{item.received_quantity || "-"}</td>
                      <td className="px-3 py-2.5 text-right text-sm text-red-400">{item.damaged_quantity || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Remarks */}
          {transfer.remarks && (
            <div className="p-3 bg-white/5 rounded-xl">
              <p className="text-[9px] text-white/30 uppercase tracking-widest font-bold mb-1">Remarks</p>
              <p className="text-sm text-white/70">{transfer.remarks}</p>
            </div>
          )}

          {/* Notes Input (for approve/reject) */}
          {(isPending || isInTransit) && (
            <div>
              <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-1.5">Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="w-full px-3 py-2.5 bg-gray-800/50 border border-white/10 rounded-xl text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 resize-none"
                placeholder="Optional notes..."
              />
            </div>
          )}

          {/* Workflow Actions */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-white/5">
            {isDraft && (
              <button onClick={() => handleAction(actions.submitTransfer)}
                disabled={actionLoading}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/20 active:scale-[0.98] transition-all flex items-center gap-1.5 disabled:opacity-50">
                <Send size={13} /> Submit for Approval
              </button>
            )}
            {isDraft && (
              <button onClick={() => handleAction(actions.cancelTransfer)}
                disabled={actionLoading}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 active:scale-[0.98] transition-all flex items-center gap-1.5 disabled:opacity-50">
                <Ban size={13} /> Cancel
              </button>
            )}
            {isPending && (
              <>
                <button onClick={() => handleAction(actions.approveTransfer)}
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 active:scale-[0.98] transition-all flex items-center gap-1.5 disabled:opacity-50">
                  <CheckCircle size={13} /> Approve
                </button>
                <button onClick={() => handleAction(actions.rejectTransfer)}
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 active:scale-[0.98] transition-all flex items-center gap-1.5 disabled:opacity-50">
                  <XCircle size={13} /> Reject
                </button>
              </>
            )}
            {isApproved && (
              <button onClick={() => handleAction(actions.dispatchTransfer)}
                disabled={actionLoading}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 border border-purple-500/20 active:scale-[0.98] transition-all flex items-center gap-1.5 disabled:opacity-50">
                <Truck size={13} /> Dispatch
              </button>
            )}
            {isInTransit && (
              <button onClick={() => handleAction(actions.receiveTransfer)}
                disabled={actionLoading}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 active:scale-[0.98] transition-all flex items-center gap-1.5 disabled:opacity-50">
                <PackageCheck size={13} /> Receive
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN TRANSFER LIST PAGE
// ============================================================================

const TransferList = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selectedTransfer, setSelectedTransfer] = useState(null);

  const filters = useMemo(() => ({
    page,
    page_size: 25,
    search,
    ...(statusFilter ? { status: statusFilter } : {}),
  }), [page, search, statusFilter]);

  const { transfers, count, loading, refetch } = useTransfers(filters);
  const { items } = useItems({ page_size: 200 });
  const { locations } = useLocations({ page_size: 200 });
  const actions = useTransferActions();

  const handleCreate = async (data) => {
    const result = await actions.createTransfer(data);
    if (result.success) {
      setShowForm(false);
      refetch();
    }
    return result;
  };

  const handleAction = async (actionFn, id) => {
    const result = await actionFn(id);
    if (result.success) refetch();
    return result;
  };

  const totalPages = Math.ceil(count / 25);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-6 pb-4 shrink-0">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <ArrowLeftRight size={20} className="text-blue-400" />
            Stock Transfers
          </h1>
          <p className="text-xs text-white/30 mt-0.5">Move inventory between locations with full audit trail</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => actions.exportTransfers({ format: "csv" })}
            className="px-3.5 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest text-white/50 hover:text-white hover:bg-white/5 transition-all flex items-center gap-2">
            <FileDown size={14} /> Export
          </button>
          <button onClick={() => setShowForm(true)}
            className="px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest bg-white text-black hover:bg-gray-100 active:scale-[0.98] transition-all flex items-center gap-2">
            <Plus size={14} /> New Transfer
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 px-6 pb-4 shrink-0">
        <div className="relative flex-1 max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by transfer number..."
            className="w-full pl-9 pr-3 py-2 bg-gray-800/50 border border-white/10 rounded-xl text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/20"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 bg-gray-800/50 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-white/20 appearance-none"
        >
          <option value="" style={{ backgroundColor: "#1f2937", color: "#fff" }}>All Status</option>
          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
            <option key={key} value={key} style={{ backgroundColor: "#1f2937", color: "#fff" }}>{cfg.label}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="flex-1 px-6 overflow-auto custom-scrollbar min-h-0">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 size={20} className="animate-spin text-white/30" />
          </div>
        ) : transfers.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-center">
            <ArrowLeftRight size={32} className="text-white/10 mb-3" />
            <p className="text-sm font-medium text-white/30">No transfers yet</p>
            <p className="text-xs text-white/20 mt-1">Create your first stock transfer to get started.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-white/5">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-white/5">
                  <th className="text-left px-4 py-3 text-[10px] text-white/40 uppercase tracking-wider font-semibold cursor-pointer hover:text-white/60">
                    <div className="flex items-center gap-1">Transfer # <ArrowUpDown size={10} /></div>
                  </th>
                  <th className="text-left px-4 py-3 text-[10px] text-white/40 uppercase tracking-wider font-semibold">Date</th>
                  <th className="text-left px-4 py-3 text-[10px] text-white/40 uppercase tracking-wider font-semibold">Source</th>
                  <th className="text-left px-4 py-3 text-[10px] text-white/40 uppercase tracking-wider font-semibold">Destination</th>
                  <th className="text-center px-4 py-3 text-[10px] text-white/40 uppercase tracking-wider font-semibold">Items</th>
                  <th className="text-center px-4 py-3 text-[10px] text-white/40 uppercase tracking-wider font-semibold">Status</th>
                  <th className="text-right px-4 py-3 text-[10px] text-white/40 uppercase tracking-wider font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {transfers.map((t) => {
                  const cfg = STATUS_CONFIG[t.status] || STATUS_CONFIG.DRAFT;
                  return (
                    <tr key={t.id} className="hover:bg-white/5 cursor-pointer transition-colors"
                      onClick={() => setSelectedTransfer(t)}>
                      <td className="px-4 py-3">
                        <p className="text-sm font-semibold text-white">{t.transfer_number}</p>
                      </td>
                      <td className="px-4 py-3 text-sm text-white/60">{t.transfer_date}</td>
                      <td className="px-4 py-3 text-sm text-white/80">{t.source_name || t.source_location?.location_name}</td>
                      <td className="px-4 py-3 text-sm text-white/80">{t.destination_name || t.destination_location?.location_name}</td>
                      <td className="px-4 py-3 text-center text-sm text-white/60">{t.item_count || "-"}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${cfg.color}`}>
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={(e) => { e.stopPropagation(); setSelectedTransfer(t); }}
                          className="px-3 py-1.5 rounded-lg text-[10px] font-bold text-white/40 hover:text-white hover:bg-white/5 transition-colors uppercase tracking-wider">
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/5 shrink-0">
          <p className="text-xs text-white/30">{count} transfers</p>
          <div className="flex items-center gap-2">
            <button disabled={page <= 1} onClick={() => setPage(page - 1)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white/40 hover:text-white hover:bg-white/5 disabled:opacity-30 transition-colors">
              Previous
            </button>
            <span className="text-xs text-white/50">Page {page} of {totalPages}</span>
            <button disabled={page >= totalPages} onClick={() => setPage(page + 1)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white/40 hover:text-white hover:bg-white/5 disabled:opacity-30 transition-colors">
              Next
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <TransferForm
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        locations={locations}
        items={items}
        onSubmit={handleCreate}
        loading={actions.loading}
      />

      <TransferDetail
        transfer={selectedTransfer}
        onClose={() => { setSelectedTransfer(null); refetch(); }}
        onAction={handleAction}
        actions={actions}
      />
    </div>
  );
};

export default TransferList;
