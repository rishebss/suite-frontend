import React, { useState } from "react";
import { cn } from "@/lib/utils";
import {
  CheckSquare, UserPlus, Edit3, Trash2, X,
  Loader2, ChevronDown,
} from "lucide-react";
import axios from "axios";

const BASE = "/api/work/items";

const BulkActionBar = ({
  selectedIds, onClear, onComplete, statuses, employees,
}) => {
  const [busy, setBusy] = useState(false);
  const [showStatusPicker, setShowStatusPicker] = useState(false);
  const [showAssignPicker, setShowAssignPicker] = useState(false);
  const [message, setMessage] = useState(null);
  const count = selectedIds.length;

  const doAction = async (action, payload) => {
    setBusy(true);
    setMessage(null);
    try {
      const url = `${BASE}/${action}/`;
      const res = await axios.post(url, { item_ids: selectedIds, ...payload });
      setMessage({ type: "success", text: `${res.data.updated || res.data.deleted || 0} items updated` });
      onComplete?.();
    } catch {
      setMessage({ type: "error", text: "Operation failed" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700/50 shadow-2xl shadow-black/50">
        <CheckSquare size={14} className="text-blue-400" />
        <span className="text-xs text-white/70 font-medium mr-1">{count} selected</span>

        {/* Status */}
        <div className="relative">
          <button
            onClick={() => { setShowStatusPicker(!showStatusPicker); setShowAssignPicker(false); }}
            disabled={busy}
            className="flex items-center gap-1 px-2 py-1 rounded bg-zinc-800 text-white/60 hover:text-white text-[10px] font-medium transition-colors disabled:opacity-50"
          >
            <Edit3 size={10} /> Status <ChevronDown size={8} />
          </button>
          {showStatusPicker && statuses && (
            <div className="absolute bottom-full left-0 mb-1 bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl p-1.5 min-w-[140px] max-h-[200px] overflow-y-auto z-50">
              {statuses.map((s) => (
                <button
                  key={s.id}
                  onClick={() => { setShowStatusPicker(false); doAction("bulk-status", { status: s.id }); }}
                  className="flex items-center gap-2 w-full px-2 py-1.5 rounded text-[10px] text-white/70 hover:bg-zinc-800 hover:text-white transition-colors"
                >
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color || "gray" }} />
                  {s.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Assign */}
        <div className="relative">
          <button
            onClick={() => { setShowAssignPicker(!showAssignPicker); setShowStatusPicker(false); }}
            disabled={busy}
            className="flex items-center gap-1 px-2 py-1 rounded bg-zinc-800 text-white/60 hover:text-white text-[10px] font-medium transition-colors disabled:opacity-50"
          >
            <UserPlus size={10} /> Assign <ChevronDown size={8} />
          </button>
          {showAssignPicker && (
            <div className="absolute bottom-full left-0 mb-1 bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl p-1.5 min-w-[160px] max-h-[200px] overflow-y-auto z-50">
              {employees?.map((emp) => (
                <button
                  key={emp.user?.id || emp.id}
                  onClick={() => { setShowAssignPicker(false); doAction("bulk-assign", { user_id: emp.user?.id || emp.id }); }}
                  className="flex items-center gap-2 w-full px-2 py-1.5 rounded text-[10px] text-white/70 hover:bg-zinc-800 hover:text-white transition-colors"
                >
                  {emp.avatar_url ? (
                    <img src={emp.avatar_url} className="w-4 h-4 rounded-full" alt="" />
                  ) : (
                    <div className="w-4 h-4 rounded-full bg-zinc-700 flex items-center justify-center text-[7px] text-white/40">
                      {(emp.user?.display_name || emp.full_name || "?").charAt(0)}
                    </div>
                  )}
                  {emp.user?.display_name || emp.full_name || emp.user?.username || "User"}
                </button>
              ))}
              <button
                onClick={() => { setShowAssignPicker(false); doAction("bulk-assign", { user_id: null }); }}
                className="flex items-center gap-2 w-full px-2 py-1.5 rounded text-[10px] text-white/40 hover:bg-zinc-800 hover:text-white transition-colors mt-1"
              >
                <X size={10} /> Unassign
              </button>
            </div>
          )}
        </div>

        {/* Delete */}
        <button
          onClick={() => { if (confirm(`Delete ${count} items?`)) doAction("bulk-delete"); }}
          disabled={busy}
          className="flex items-center gap-1 px-2 py-1 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20 text-[10px] font-medium transition-colors disabled:opacity-50"
        >
          <Trash2 size={10} /> Delete
        </button>

        {busy && <Loader2 size={12} className="animate-spin text-white/40" />}

        {message && (
          <span className={cn("text-[10px]", message.type === "error" ? "text-red-400" : "text-emerald-400")}>
            {message.text}
          </span>
        )}

        <button
          onClick={onClear}
          className="p-1 hover:bg-zinc-800 rounded transition-colors"
        >
          <X size={12} className="text-white/40" />
        </button>
      </div>
    </div>
  );
};

export default BulkActionBar;
