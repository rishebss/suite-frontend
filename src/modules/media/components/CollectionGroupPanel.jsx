/**
 * CollectionGroupPanel
 *
 * A slide-over panel (or inline section) for Superadmin/Admin users to manage
 * which departments/groups have access to a specific collection.
 *
 * Fetches available departments and shows a checkbox list where the admin can
 * toggle group assignments. Saves via the batch-set endpoint.
 *
 * Props:
 *   collection  — The MediaCollection object { id, name, ... }
 *   onClose     — Called when the panel is dismissed
 *   onSaved     — Called after successful save
 */

import React, { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import {
  Users,
  X,
  Loader2,
  Check,
  Shield,
  Search,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { mediaApi } from "../api/mediaApi";
import UserService from "../../admin/services/userService";
import RingLoader from "@/components/ui/RingLoader";

const CollectionGroupPanel = ({ collection, onClose, onSaved }) => {
  const [departments, setDepartments] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [initialIds, setInitialIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  /* ── Load departments & current assignments ─────────────────── */
  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        // Fetch all departments and current group permissions in parallel
        const [deptRes, permRes] = await Promise.all([
          UserService.getDepartments({ page_size: 200 }),
          mediaApi.listCollectionGroups(collection.id),
        ]);

        if (!mounted) return;

        const allDepts = deptRes?.data?.results || deptRes?.results || [];
        const currentPerms = permRes?.data?.data || [];

        setDepartments(allDepts);
        const assigned = new Set(
          currentPerms.map((p) => p.department_id || p.department?.id).filter(Boolean)
        );
        setSelectedIds(new Set(assigned));
        setInitialIds(new Set(assigned));
      } catch (err) {
        if (mounted)
          setError(err.message || "Failed to load data.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [collection.id]);

  /* ── Toggle a department ────────────────────────────────────── */
  const toggle = (deptId) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(deptId)) next.delete(deptId);
      else next.add(deptId);
      return next;
    });
  };

  /* ── Save changes ───────────────────────────────────────────── */
  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await mediaApi.setCollectionGroups(collection.id, Array.from(selectedIds));
      onSaved?.();
      onClose?.();
    } catch (err) {
      setError(err.message || "Failed to save group permissions.");
    } finally {
      setSaving(false);
    }
  };

  /* ── Derived ────────────────────────────────────────────────── */
  const hasChanges =
    selectedIds.size !== initialIds.size ||
    Array.from(selectedIds).some((id) => !initialIds.has(id));

  const filteredDepts = searchQuery
    ? departments.filter((d) =>
        d.name?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : departments;

  /* ── Render ─────────────────────────────────────────────────── */
  return createPortal(
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/85 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
        {/* ── Header ─────────────────────────────────────────────── */}
        <div className="px-6 py-4 border-b border-zinc-800 bg-white/[0.015] flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
            <Users size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-semibold text-white tracking-tight truncate">
              {collection.name}
            </h2>
            <p className="text-[10px] text-white/30 mt-0.5 uppercase tracking-widest font-medium">
              Manage group access
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/20 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        {/* ── Search ──────────────────────────────────────────────── */}
        <div className="px-6 py-3 border-b border-zinc-800 bg-zinc-900/5 shrink-0">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25"
              size={12}
            />
            <input
              type="text"
              placeholder="Search groups..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-950/50 border border-zinc-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-blue-500/40 focus:bg-zinc-950 transition-all"
            />
          </div>
        </div>

        {/* ── Department list ────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {loading ? (
            <div className="py-14 flex items-center justify-center">
              <RingLoader />
            </div>
          ) : error && departments.length === 0 ? (
            <div className="py-14 text-center px-6">
              <p className="text-[10px] text-red-400 uppercase tracking-[0.2em] font-medium">
                {error}
              </p>
            </div>
          ) : filteredDepts.length === 0 ? (
            <div className="py-14 text-center px-6">
              <p className="text-[10px] text-white/20 uppercase tracking-[0.2em] font-medium">
                {searchQuery
                  ? "No groups match your search"
                  : "No groups found. Create groups in the admin panel first."}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-800/15">
              {filteredDepts.map((dept) => {
                const isChecked = selectedIds.has(dept.id);
                return (
                  <button
                    key={dept.id}
                    onClick={() => toggle(dept.id)}
                    className="w-full px-6 py-3 flex items-center gap-3 text-left hover:bg-white/[0.025] transition-all"
                  >
                    {/* Checkbox */}
                    <div
                      className={cn(
                        "w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-all",
                        isChecked
                          ? "bg-blue-500/80 border-blue-500"
                          : "border-zinc-600 bg-transparent"
                      )}
                    >
                      {isChecked && (
                        <Check size={9} className="text-white" strokeWidth={3} />
                      )}
                    </div>

                    {/* Dept info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "text-xs font-medium truncate transition-colors",
                            isChecked ? "text-white" : "text-white/50"
                          )}
                        >
                          {dept.name}
                        </span>
                      </div>
                      {dept.user_count !== undefined && (
                        <p className="text-[9px] text-white/20 mt-0.5">
                          {dept.user_count} user{dept.user_count !== 1 ? "s" : ""}
                        </p>
                      )}
                    </div>

                    {/* Badge */}
                    {isChecked && (
                      <span className="px-1.5 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-[8px] font-semibold uppercase tracking-widest text-blue-400 shrink-0">
                        Access
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Info banner ────────────────────────────────────────── */}
        {!loading && (
          <div className="px-6 py-2 bg-blue-900/10 border-t border-blue-500/10 flex items-center gap-2 shrink-0">
            <Info size={11} className="text-blue-400/60 shrink-0" />
            <p className="text-[9px] text-blue-400/60 font-medium">
              <span className="font-bold text-blue-400">{selectedIds.size}</span>{" "}
              group{selectedIds.size !== 1 ? "s" : ""} assigned.
              Superadmin and Admin can always see all collections.
            </p>
          </div>
        )}

        {/* ── Error banner ───────────────────────────────────────── */}
        {error && departments.length > 0 && (
          <div className="px-6 py-2 bg-red-900/20 border-t border-red-500/20 shrink-0">
            <p className="text-[9px] text-red-400 uppercase tracking-widest font-medium">
              {error}
            </p>
          </div>
        )}

        {/* ── Footer ─────────────────────────────────────────────── */}
        <div className="px-6 py-3 border-t border-zinc-800 bg-white/[0.01] flex items-center justify-between shrink-0">
          <span className="text-[9px] font-medium text-white/25 uppercase tracking-widest">
            {departments.length} groups total
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              disabled={saving}
              className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 text-[9px] font-semibold text-white/40 hover:text-white hover:bg-zinc-800 hover:border-zinc-700 uppercase tracking-widest transition-all rounded-lg cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading || saving || !hasChanges}
              className={cn(
                "px-3 py-1.5 text-[9px] font-semibold uppercase tracking-widest transition-all rounded-lg flex items-center gap-1.5 disabled:opacity-40",
                hasChanges
                  ? "bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 hover:border-blue-500/30 cursor-pointer"
                  : "bg-zinc-900 border border-zinc-800 text-white/30 cursor-not-allowed"
              )}
            >
              {saving ? (
                <>
                  <Loader2 size={11} className="animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  <Check size={11} />
                  {hasChanges ? "Save Changes" : "No Changes"}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default CollectionGroupPanel;
