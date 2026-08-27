/**
 * UserMenuAssignModal
 *
 * Allows admins to manage per-user menu assignments.
 * Shows role-based menus as locked (auto-granted by role) and directly
 * assigned menus as toggleable checkboxes.
 *
 * Uses GET /api/menus/user-effective-menus/?user_id= for full context.
 * Saves via POST /api/menus/user-assignments/ (bulk replace direct assignments).
 */

import React, { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { LayoutList, Loader2, Check, Shield, Lock, Plus, X, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import MenuService from "../../services/menuService";
import RingLoader from "@/components/ui/RingLoader";

/* ─── Tiny helpers ──────────────────────────────────────────── */

const Badge = ({ children, variant = "default" }) => {
  const styles = {
    role: "bg-violet-500/10 border-violet-500/20 text-violet-400",
    direct: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
    default: "bg-zinc-800 border-zinc-700 text-zinc-400",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-semibold uppercase tracking-[0.15em] border",
        styles[variant]
      )}
    >
      {children}
    </span>
  );
};

/* ─── Main Component ────────────────────────────────────────── */

const UserMenuAssignModal = ({ user, onClose, onSuccess }) => {
  const [menus, setMenus] = useState([]); // all active menus with flags
  const [roleMenuIds, setRoleMenuIds] = useState(new Set()); // locked (role-based)
  const [pendingDirect, setPendingDirect] = useState(new Set()); // editable copy
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [originalDirect, setOriginalDirect] = useState(new Set());

  /* ── Fetch effective menus for this user ─────────────────── */
  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const data = await MenuService.getUserEffectiveMenus(user.id);
        if (!mounted) return;

        const allMenus = data?.menus || [];
        const roleBased = new Set(
          allMenus.filter((m) => m.role_based).map((m) => m.id)
        );
        const direct = new Set(
          allMenus.filter((m) => m.direct_assigned).map((m) => m.id)
        );

        setOriginalDirect(new Set(direct));
        setMenus(allMenus);
        setRoleMenuIds(roleBased);
        setPendingDirect(new Set(direct));
      } catch (err) {
        if (mounted) setError(err.message || "Failed to load menu data");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [user.id]);

  /* ── Toggle a direct assignment ─────────────────────────── */
  const toggleDirect = (menuId) => {
    if (roleMenuIds.has(menuId)) return; // locked — role grants this
    setPendingDirect((prev) => {
      const next = new Set(prev);
      if (next.has(menuId)) next.delete(menuId);
      else next.add(menuId);
      return next;
    });
  };

  /* ── Save changes ────────────────────────────────────────── */
  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await MenuService.bulkAssignMenusToUser(user.id, Array.from(pendingDirect));
      onSuccess?.();
      onClose?.();
    } catch (err) {
      setError(err.message || "Failed to save menu assignments");
    } finally {
      setSaving(false);
    }
  };

  /* ── Derived state ───────────────────────────────────────── */
  const hasChanges = useMemo(() => {
    if (pendingDirect.size !== originalDirect.size) return true;
    for (const id of pendingDirect) {
      if (!originalDirect.has(id)) return true;
    }
    return false;
  }, [pendingDirect, originalDirect]);

  const stats = useMemo(() => {
    const effective = new Set([...roleMenuIds, ...pendingDirect]);
    return {
      total: menus.length,
      effective: effective.size,
    };
  }, [menus, roleMenuIds, pendingDirect]);

  /* ── Sort all menus by order ─────────────────────────────── */
  const sortedMenus = useMemo(() => {
    return [...menus].sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [menus]);

  /* ── Render ──────────────────────────────────────────────── */
  return createPortal(
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-200">

        {/* ── Header ─────────────────────────────────────────── */}
        <div className="px-8 py-6 border-b border-zinc-800 bg-white/[0.02] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <LayoutList size={20} />
            </div>
            <div>
              <h2 className="text-base font-medium text-white uppercase tracking-wider">
                {user.first_name} {user.last_name}
              </h2>
              <p className="text-[10px] text-white/40 uppercase tracking-widest font-medium">
                {user.email} · {user.role}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="h-9 w-9 rounded-md bg-zinc-900/50 border border-zinc-800 text-white/40 hover:text-white hover:bg-zinc-800 transition-all flex items-center justify-center"
            title="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* ── Menu List ──────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
          {loading ? (
            <div className="py-14 flex items-center justify-center">
              <RingLoader />
            </div>
          ) : error && menus.length === 0 ? (
            <div className="py-14 text-center px-8">
              <p className="text-[10px] text-red-400 uppercase tracking-[0.2em] font-medium">
                {error}
              </p>
            </div>
          ) : menus.length === 0 ? (
            <div className="py-14 text-center px-8">
              <p className="text-[10px] text-white/20 uppercase tracking-[0.2em] font-medium">
                No menus found
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedMenus.map((menu) => {
                const isRoleLocked = roleMenuIds.has(menu.id);
                const isDirectChecked = pendingDirect.has(menu.id);
                const isChecked = isRoleLocked || isDirectChecked;

                return (
                  <button
                    key={menu.id}
                    onClick={() => !isRoleLocked && toggleDirect(menu.id)}
                    disabled={isRoleLocked}
                    className={cn(
                      "w-full rounded-lg border transition-all overflow-hidden text-left",
                      isRoleLocked
                        ? "cursor-default opacity-70 bg-zinc-900/30 border-zinc-800"
                        : "cursor-pointer bg-zinc-900/30 border-zinc-800 hover:bg-zinc-900/50"
                    )}
                  >
                    {/* Row body */}
                    <div className="flex items-center gap-3 p-4">
                      {/* Checkbox / Lock indicator */}
                      <div
                        className={cn(
                          "w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-all",
                          isRoleLocked
                            ? "bg-violet-500/15 border-violet-500/30"
                            : isDirectChecked
                            ? "bg-emerald-500/80 border-emerald-500"
                            : "border-zinc-600 bg-transparent"
                        )}
                      >
                        {isRoleLocked ? (
                          <Lock size={8} className="text-violet-400" />
                        ) : isDirectChecked ? (
                          <Check
                            size={9}
                            className="text-white"
                            strokeWidth={3}
                          />
                        ) : null}
                      </div>

                      {/* Menu info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "text-sm font-medium uppercase tracking-wider truncate transition-colors",
                              isChecked
                                ? "text-white"
                                : "text-white/40 hover:text-white/60"
                            )}
                          >
                            {menu.name || menu.code}
                          </span>
                          {isRoleLocked && (
                            <Badge variant="role">
                              <Shield size={7} />
                              Role
                            </Badge>
                          )}
                          {isDirectChecked && !isRoleLocked && (
                            <Badge variant="direct">
                              <Plus size={7} />
                              Direct
                            </Badge>
                          )}
                        </div>
                        <p className="text-[10px] text-white/20 font-mono mt-0.5 truncate">
                          {menu.href}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Error banner ───────────────────────────────────── */}
        {error && !loading && menus.length > 0 && (
          <div className="px-8 py-2 bg-red-900/20 border-t border-red-500/20 shrink-0">
            <p className="text-[9px] text-red-400 uppercase tracking-widest font-medium">
              {error}
            </p>
          </div>
        )}

        {/* ── Role-based info banner ──────────────────────────── */}
        {!loading && roleMenuIds.size > 0 && (
          <div className="px-8 py-2 bg-violet-900/10 border-t border-violet-500/10 flex items-center gap-2 shrink-0">
            <Info size={11} className="text-violet-400/60 shrink-0" />
            <p className="text-[9px] text-violet-400/60 font-medium">
              <span className="font-bold text-violet-400">{roleMenuIds.size}</span>{" "}
              menu{roleMenuIds.size !== 1 ? "s" : ""} auto-granted via the{" "}
              <span className="font-bold text-violet-400">{user.role}</span> role
              and cannot be removed here.
            </p>
          </div>
        )}

        {/* ── Footer ─────────────────────────────────────────── */}
        <div className="px-8 py-4 border-t border-zinc-800 bg-white/[0.01] flex items-center justify-between shrink-0">
          <span className="text-[9px] font-medium text-white/30 uppercase tracking-widest">
            {stats.effective} of {stats.total} effective
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 bg-zinc-900 border border-zinc-800 text-[9px] font-medium text-white/40 hover:text-white hover:bg-zinc-800 hover:border-zinc-700 uppercase tracking-widest transition-all rounded-md cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading || saving || !hasChanges}
              className={cn(
                "px-4 py-2 text-[9px] font-medium uppercase tracking-widest transition-all rounded-md flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed",
                hasChanges
                  ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-500/30 cursor-pointer"
                  : "bg-zinc-900 border border-zinc-800 text-white/30 cursor-not-allowed"
              )}
            >
              {saving ? (
                <>
                  <Loader2 size={12} className="animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  <Check size={12} />
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

export default UserMenuAssignModal;
