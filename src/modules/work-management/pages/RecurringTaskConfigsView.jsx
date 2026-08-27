import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ArrowLeft, Repeat, Plus, Edit2, Trash2, Loader2 } from "lucide-react";
import { fetchRecurringTaskConfigs, createRecurringTaskConfig, updateRecurringTaskConfig, deleteRecurringTaskConfig } from "../services/recurringTaskService";

const FREQ_OPTIONS = [
  { value: "DAILY", label: "Daily" },
  { value: "WEEKLY", label: "Weekly" },
  { value: "BIWEEKLY", label: "Bi-Weekly" },
  { value: "MONTHLY", label: "Monthly" },
  { value: "QUARTERLY", label: "Quarterly" },
  { value: "YEARLY", label: "Yearly" },
];

const RecurringTaskConfigsView = () => {
  const { workspaceId, projectId } = useParams();
  const navigate = useNavigate();
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    work_item: "", frequency: "WEEKLY", interval: 1, days_of_week: "[]",
    day_of_month: "", month_of_year: "", start_date: "", end_date: "",
    max_occurrences: "", auto_create: true,
  });

  const fetchData = useCallback(() => {
    setLoading(true);
    fetchRecurringTaskConfigs({})
      .then(({ data }) => setConfigs(data.results || data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = () => {
    setEditing(null);
    setForm({
      work_item: "", frequency: "WEEKLY", interval: 1, days_of_week: "[]",
      day_of_month: "", month_of_year: "", start_date: "", end_date: "",
      max_occurrences: "", auto_create: true,
    });
    setShowDialog(true);
  };

  const openEdit = (cfg) => {
    setEditing(cfg);
    setForm({
      work_item: cfg.work_item || "",
      frequency: cfg.frequency || "WEEKLY",
      interval: cfg.interval || 1,
      days_of_week: JSON.stringify(cfg.days_of_week || []),
      day_of_month: cfg.day_of_month || "",
      month_of_year: cfg.month_of_year || "",
      start_date: cfg.start_date || "",
      end_date: cfg.end_date || "",
      max_occurrences: cfg.max_occurrences || "",
      auto_create: cfg.auto_create !== false,
    });
    setShowDialog(true);
  };

  const handleSave = async () => {
    try {
      const payload = { ...form, days_of_week: JSON.parse(form.days_of_week || "[]") };
      if (payload.day_of_month === "") payload.day_of_month = null;
      if (payload.month_of_year === "") payload.month_of_year = null;
      if (payload.end_date === "") payload.end_date = null;
      if (payload.max_occurrences === "") payload.max_occurrences = null;
      if (editing) {
        await updateRecurringTaskConfig(editing.id, payload);
      } else {
        await createRecurringTaskConfig(payload);
      }
      setShowDialog(false);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this recurring task config?")) return;
    try {
      await deleteRecurringTaskConfig(id);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-4 mb-6 flex-wrap">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-zinc-800 rounded-lg transition-colors">
          <ArrowLeft size={20} className="text-white/60" />
        </button>
        <Repeat size={22} className="text-purple-400 shrink-0" />
        <h1 className="text-xl font-bold text-white">Recurring Task Configs</h1>
        <button onClick={openCreate} className="ml-auto flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm rounded-lg transition-colors whitespace-nowrap">
          <Plus size={16} /> New Config
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 size={24} className="animate-spin text-white/40" /></div>
      ) : configs.length === 0 ? (
        <div className="text-center py-20 text-white/30">No recurring task configs yet.</div>
      ) : (
        <div className="space-y-2">
          {configs.map((cfg) => (
            <div key={cfg.id} className="flex items-center gap-4 p-4 rounded-lg bg-zinc-900/30 border border-zinc-800/50">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-white truncate">
                    {cfg.work_item_title || cfg.work_item || `Config #${cfg.id}`}
                  </span>
                  <span className={cn("px-2 py-0.5 rounded text-[10px] font-medium", cfg.is_active !== false ? "bg-green-500/10 text-green-400" : "bg-zinc-700 text-zinc-400")}>
                    {cfg.frequency || "—"}
                  </span>
                  {cfg.next_occurrence && (
                    <span className="text-[10px] text-white/30">Next: {cfg.next_occurrence}</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => openEdit(cfg)} className="p-1.5 hover:bg-zinc-800 rounded transition-colors"><Edit2 size={14} className="text-white/40" /></button>
                <button onClick={() => handleDelete(cfg.id)} className="p-1.5 hover:bg-red-500/20 rounded transition-colors"><Trash2 size={14} className="text-red-400" /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-4 sm:p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto mx-4 sm:mx-0">
            <h2 className="text-lg font-bold text-white mb-4">{editing ? "Edit" : "New"} Recurring Config</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-white/40 mb-1">Work Item ID</label>
                <input value={form.work_item} onChange={(e) => setForm({...form, work_item: e.target.value})} className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-white outline-none focus:border-purple-500/50" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-white/40 mb-1">Frequency</label>
                  <select value={form.frequency} onChange={(e) => setForm({...form, frequency: e.target.value})} className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-white outline-none focus:border-purple-500/50">
                    {FREQ_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-white/40 mb-1">Interval</label>
                  <input type="number" min={1} value={form.interval} onChange={(e) => setForm({...form, interval: parseInt(e.target.value) || 1})} className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-white outline-none focus:border-purple-500/50" />
                </div>
              </div>
              <div>
                <label className="block text-xs text-white/40 mb-1">Days of Week (JSON array, 0=Mon..6=Sun)</label>
                <input value={form.days_of_week} onChange={(e) => setForm({...form, days_of_week: e.target.value})} className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-white outline-none focus:border-purple-500/50" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-white/40 mb-1">Day of Month</label>
                  <input type="number" min={1} max={31} value={form.day_of_month} onChange={(e) => setForm({...form, day_of_month: e.target.value})} className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-white outline-none focus:border-purple-500/50" />
                </div>
                <div>
                  <label className="block text-xs text-white/40 mb-1">Month of Year</label>
                  <input type="number" min={1} max={12} value={form.month_of_year} onChange={(e) => setForm({...form, month_of_year: e.target.value})} className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-white outline-none focus:border-purple-500/50" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-white/40 mb-1">Start Date</label>
                  <input type="date" value={form.start_date} onChange={(e) => setForm({...form, start_date: e.target.value})} className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-white outline-none focus:border-purple-500/50" />
                </div>
                <div>
                  <label className="block text-xs text-white/40 mb-1">End Date</label>
                  <input type="date" value={form.end_date} onChange={(e) => setForm({...form, end_date: e.target.value})} className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-white outline-none focus:border-purple-500/50" />
                </div>
              </div>
              <div>
                <label className="block text-xs text-white/40 mb-1">Max Occurrences</label>
                <input type="number" min={1} value={form.max_occurrences} onChange={(e) => setForm({...form, max_occurrences: e.target.value})} className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-white outline-none focus:border-purple-500/50" />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="auto_create" checked={form.auto_create} onChange={(e) => setForm({...form, auto_create: e.target.checked})} className="rounded bg-zinc-800 border-zinc-700" />
                <label htmlFor="auto_create" className="text-sm text-white/60">Auto-create next occurrence</label>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowDialog(false)} className="px-4 py-2 text-sm text-white/60 hover:text-white transition-colors">Cancel</button>
              <button onClick={handleSave} className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm rounded-lg transition-colors">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecurringTaskConfigsView;
