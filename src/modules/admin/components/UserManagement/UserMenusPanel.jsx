/**
 * UserMenusPanel
 *
 * Compact "Menu Access" section for the UserDetail modal.
 * Displays a read-only summary of effective menus split into
 * role-based (violet) and directly assigned (emerald) categories.
 * Includes a button to open the full UserMenuAssignModal.
 */

import React, { useState, useEffect } from "react";
import { RiMenuAddLine } from "react-icons/ri";
import { Shield, Plus, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import MenuService from "../../services/menuService";

/* ─── Sub-components ────────────────────────────────────────── */

const MenuChip = ({ menu, variant }) => {
  const styles = {
    role: "bg-violet-500/8 border-violet-500/15 text-violet-300/80",
    direct: "bg-emerald-500/8 border-emerald-500/15 text-emerald-300/80",
  };
  return (
    <div
      className={cn(
        "flex items-center gap-1.5 px-2 py-1 rounded-md border text-[9px] font-medium uppercase tracking-wider truncate max-w-full",
        styles[variant]
      )}
      title={menu.href}
    >
      {variant === "role" ? (
        <Shield size={8} className="shrink-0 opacity-60" />
      ) : (
        <Plus size={8} className="shrink-0 opacity-60" />
      )}
      <span className="truncate">{menu.name}</span>
    </div>
  );
};

/* ─── Main Component ────────────────────────────────────────── */

const UserMenusPanel = ({ user, onOpenAssignModal }) => {
  const [data, setData] = useState(null); // response from user-effective-menus
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);
    try {
      const result = await MenuService.getUserEffectiveMenus(user.id);
      setData(result);
    } catch (err) {
      setError(err.message || "Failed to load menu access data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user?.id]);

  /* ── Derived ─────────────────────────────────────────────── */
  const roleMenus =
    data?.menus?.filter((m) => m.role_based && m.effective) || [];
  const directMenus =
    data?.menus?.filter((m) => m.direct_assigned && !m.role_based) || [];
  const stats = data?.stats;

  /* ── Render ──────────────────────────────────────────────── */
  return (
    <div className="px-8 py-5 border-t border-white/5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-[10px] font-bold text-white/20 uppercase tracking-widest">
            Menu Access
          </h3>
          {stats && !loading && (
            <p className="text-[9px] text-white/20 mt-0.5">
              {stats.effective} of {stats.total} menus effective
            </p>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          {!loading && (
            <button
              onClick={fetchData}
              className="p-1.5 rounded-md text-white/20 hover:text-white/50 hover:bg-white/5 transition-colors"
              title="Refresh"
            >
              <RefreshCw size={11} />
            </button>
          )}
          <button
            onClick={onOpenAssignModal}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-emerald-500/20 bg-emerald-500/8 text-emerald-400 hover:bg-emerald-500/15 transition-colors text-[9px] font-semibold uppercase tracking-widest"
            title="Manage Menu Assignments"
          >
            <RiMenuAddLine size={11} />
            Manage
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center gap-2 py-4">
          <Loader2 size={13} className="animate-spin text-white/30" />
          <span className="text-[10px] text-white/30">Loading…</span>
        </div>
      ) : error ? (
        <div className="flex items-center gap-2 py-3">
          <AlertCircle size={13} className="text-red-400/60 shrink-0" />
          <span className="text-[10px] text-red-400/60">{error}</span>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Role-based section */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Shield size={9} className="text-violet-400/60" />
              <span className="text-[8px] font-bold text-violet-400/60 uppercase tracking-[0.2em]">
                Via Role ({roleMenus.length})
              </span>
            </div>
            {roleMenus.length === 0 ? (
              <p className="text-[10px] text-white/15 pl-4">None</p>
            ) : (
              <div className="flex flex-wrap gap-1.5 pl-0">
                {roleMenus.map((m) => (
                  <MenuChip key={m.id} menu={m} variant="role" />
                ))}
              </div>
            )}
          </div>

          {/* Direct section */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Plus size={9} className="text-emerald-400/60" />
              <span className="text-[8px] font-bold text-emerald-400/60 uppercase tracking-[0.2em]">
                Direct Assigned ({directMenus.length})
              </span>
            </div>
            {directMenus.length === 0 ? (
              <p className="text-[10px] text-white/15 pl-4">
                No direct assignments
              </p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {directMenus.map((m) => (
                  <MenuChip key={m.id} menu={m} variant="direct" />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMenusPanel;
