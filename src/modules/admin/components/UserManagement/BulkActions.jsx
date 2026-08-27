/**
 * Bulk Actions Component
 * Toolbar for bulk operations on selected users
 */

import React, { useState } from "react";
import { Check, X, Shield, Activity } from "lucide-react";

const BulkActions = ({ count, onClear, onBulkUpdate }) => {
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [loading, setLoading] = useState(false);

  const roles = ["User", "Staff", "Manager", "Admin", "Vendor", "Superadmin"];

  const handleActivate = async () => {
    setLoading(true);
    try {
      await onBulkUpdate({ is_active: true });
      setShowActionMenu(false);
    } catch (err) {
      console.error("Error activating users:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async () => {
    setLoading(true);
    try {
      await onBulkUpdate({ is_active: false });
      setShowActionMenu(false);
    } catch (err) {
      console.error("Error deactivating users:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (role) => {
    setLoading(true);
    try {
      await onBulkUpdate({ role });
      setShowActionMenu(false);
    } catch (err) {
      console.error("Error changing role:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Check className="w-5 h-5 text-blue-400" />
        <span className="text-white font-semibold">
          {count} user{count !== 1 ? "s" : ""} selected
        </span>
      </div>

      <div className="flex items-center gap-3">
        {/* Action Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowActionMenu(!showActionMenu)}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white rounded-lg font-semibold text-sm transition-colors duration-200 flex items-center gap-2"
          >
            <Activity className="w-4 h-4" />
            Bulk Actions
          </button>

          {showActionMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl overflow-hidden z-10">
              <div className="p-2 space-y-1">
                {/* Activate */}
                <button
                  onClick={handleActivate}
                  disabled={loading}
                  className="w-full px-3 py-2 text-left text-white hover:bg-zinc-800 rounded transition-colors duration-200 disabled:opacity-50"
                >
                  <Check className="w-4 h-4 inline mr-2 text-green-400" />
                  Activate All
                </button>

                {/* Deactivate */}
                <button
                  onClick={handleDeactivate}
                  disabled={loading}
                  className="w-full px-3 py-2 text-left text-white hover:bg-zinc-800 rounded transition-colors duration-200 disabled:opacity-50"
                >
                  <X className="w-4 h-4 inline mr-2 text-red-400" />
                  Deactivate All
                </button>

                {/* Divider */}
                <div className="my-1 h-px bg-zinc-700" />

                {/* Role Change */}
                <div className="px-3 py-2">
                  <p className="text-white/60 text-xs font-semibold mb-2 flex items-center gap-2">
                    <Shield className="w-3 h-3" />
                    Change Role
                  </p>
                  <div className="space-y-1">
                    {roles.map((role) => (
                      <button
                        key={role}
                        onClick={() => handleRoleChange(role)}
                        disabled={loading}
                        className="block w-full text-left px-2 py-1.5 text-white hover:bg-zinc-700 rounded text-sm transition-colors duration-200 disabled:opacity-50"
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Clear Selection */}
        <button
          onClick={onClear}
          className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg font-semibold text-sm transition-colors duration-200"
        >
          Clear Selection
        </button>
      </div>
    </div>
  );
};

export default BulkActions;
