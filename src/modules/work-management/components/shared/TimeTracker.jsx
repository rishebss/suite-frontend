import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Clock, Play, Square, Plus, Loader2, Trash2 } from "lucide-react";

const TimeTracker = ({ workItemId, timeLogs = [], onLogTime, onDeleteTime, loading }) => {
  const [showForm, setShowForm] = useState(false);
  const [hours, setHours] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [saving, setSaving] = useState(false);

  const totalHours = timeLogs.reduce((sum, log) => sum + parseFloat(log.hours || 0), 0);

  const handleSubmit = async () => {
    if (!hours || parseFloat(hours) <= 0) return;
    setSaving(true);
    try {
      await onLogTime?.({ hours: parseFloat(hours), description, date, work_item: workItemId });
      setHours("");
      setDescription("");
      setShowForm(false);
    } catch (err) {
      console.error("Time log failed:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-white/80">
          <Clock size={16} />
          Time Tracking
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-white/40">
            Total: <span className="text-white font-mono font-bold">{totalHours.toFixed(1)}h</span>
          </span>
          <button
            onClick={() => setShowForm(!showForm)}
            className="p-1.5 rounded-lg hover:bg-zinc-800 text-white/40 hover:text-white transition-colors"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>

      {showForm && (
        <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800 space-y-2">
          <div className="flex gap-2">
            <input
              type="number"
              step="0.5"
              min="0.25"
              max="24"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              placeholder="Hours"
              className="w-24 px-2 py-1.5 rounded bg-zinc-800 border border-zinc-700 text-sm text-white placeholder-white/30 focus:outline-none focus:border-blue-500/50"
            />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="px-2 py-1.5 rounded bg-zinc-800 border border-zinc-700 text-sm text-white focus:outline-none focus:border-blue-500/50"
            />
            <button
              onClick={handleSubmit}
              disabled={saving || !hours}
              className="px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 disabled:opacity-50 transition-all text-xs font-semibold"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <><Play size={12} className="inline mr-1" />Log</>}
            </button>
          </div>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What did you work on?"
            className="w-full px-2 py-1.5 rounded bg-zinc-800 border border-zinc-700 text-sm text-white placeholder-white/30 focus:outline-none focus:border-blue-500/50"
          />
        </div>
      )}

      {loading ? (
        <div className="space-y-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-10 bg-zinc-900/40 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : timeLogs.length > 0 ? (
        <div className="space-y-1 max-h-40 overflow-y-auto">
          {timeLogs.map((log) => (
            <div key={log.id} className="flex items-center justify-between p-2 rounded-lg bg-zinc-900/20 border border-white/5">
              <div className="flex items-center gap-2 min-w-0">
                <Clock size={12} className="text-blue-400 shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-white/70 truncate">{log.description || "Time logged"}</p>
                  {log.date && (
                    <p className="text-[10px] text-white/30">{new Date(log.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-mono font-bold text-white/80">{parseFloat(log.hours).toFixed(1)}h</span>
                <button
                  onClick={() => onDeleteTime?.(log.id)}
                  className="p-1 rounded hover:bg-zinc-800 text-white/20 hover:text-red-400 transition-colors"
                >
                  <Trash2 size={10} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-white/30 text-center py-3">No time logged yet</p>
      )}
    </div>
  );
};

export default TimeTracker;
