import React, { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import {
  Target, Plus, ChevronDown, ChevronRight, BarChart3,
  CircleCheck, CircleDashed, CircleOff, User, Calendar,
  GripVertical, Trash2,
} from "lucide-react";
import axios from "axios";
import { useParams } from "react-router-dom";

const STATUS_CONFIG = {
  DRAFT: { icon: CircleDashed, color: "text-zinc-400", label: "Draft" },
  ACTIVE: { icon: Target, color: "text-blue-400", label: "Active" },
  ACHIEVED: { icon: CircleCheck, color: "text-green-400", label: "Achieved" },
  MISSED: { icon: CircleOff, color: "text-red-400", label: "Missed" },
};

const ALIGNMENT_COLORS = {
  COMPANY: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  DEPARTMENT: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  TEAM: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  INDIVIDUAL: "bg-green-500/10 text-green-400 border-green-500/20",
};

const ProgressRing = ({ pct }) => (
  <div className="relative w-10 h-10">
    <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
      <circle cx="18" cy="18" r="15.5" fill="none" stroke="currentColor" strokeWidth="3" className="text-zinc-700" />
      <circle
        cx="18" cy="18" r="15.5" fill="none" stroke="currentColor" strokeWidth="3"
        strokeDasharray={`${pct} ${100 - pct}`}
        strokeLinecap="round"
        className={pct >= 100 ? "text-green-400" : pct >= 50 ? "text-blue-400" : "text-amber-400"}
      />
    </svg>
    <span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-white">{pct}%</span>
  </div>
);

const KeyResultRow = ({ kr, onUpdate }) => {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(kr.current_value);

  const handleSave = async () => {
    try {
      await axios.patch(`/api/work/key-results/${kr.id}/`, { current_value: value });
      onUpdate();
      setEditing(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex items-center gap-3 px-4 py-2 hover:bg-zinc-800/40 rounded-lg group">
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white truncate">{kr.title}</p>
        <p className="text-[10px] text-white/30">{kr.kr_type}</p>
      </div>
      <div className="flex items-center gap-2">
        {editing ? (
          <>
            <input
              type="number"
              value={value}
              onChange={(e) => setValue(parseFloat(e.target.value) || 0)}
              className="w-20 bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs text-white text-center"
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
            />
            <button onClick={handleSave} className="text-xs text-blue-400 hover:text-blue-300">Save</button>
          </>
        ) : (
          <>
            <span className="text-xs text-white/60 tabular-nums">
              {kr.current_value} / {kr.target_value}
            </span>
            <ProgressRing pct={kr.progress_pct} />
            <button
              onClick={() => { setValue(kr.current_value); setEditing(true); }}
              className="opacity-0 group-hover:opacity-100 text-[10px] text-blue-400 hover:text-blue-300"
            >
              Update
            </button>
          </>
        )}
      </div>
    </div>
  );
};

const ObjectiveCard = ({ objective, onAction }) => {
  const [expanded, setExpanded] = useState(false);
  const [krs, setKrs] = useState([]);
  const StatusIcon = STATUS_CONFIG[objective.status]?.icon || CircleDashed;

  useEffect(() => {
    if (expanded) {
      axios.get(`/api/work/objectives/${objective.id}/`).then(({ data }) => {
        setKrs(data.key_results || []);
      }).catch(() => {});
    }
  }, [expanded, objective.id]);

  return (
    <div className="bg-zinc-850 border border-zinc-800 rounded-xl overflow-hidden">
      <div className="p-4">
        <div className="flex items-start gap-3">
          <button onClick={() => setExpanded(!expanded)} className="mt-0.5 text-white/30 hover:text-white">
            {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={cn("px-1.5 py-0.5 rounded text-[9px] font-medium border", ALIGNMENT_COLORS[objective.alignment])}>
                {objective.alignment}
              </span>
              <StatusIcon size={12} className={STATUS_CONFIG[objective.status]?.color} />
              <span className="text-[10px] text-white/40">{objective.status}</span>
            </div>
            <h3 className="text-sm font-medium text-white">{objective.title}</h3>
            {objective.owner_name && (
              <p className="text-xs text-white/40 flex items-center gap-1 mt-1">
                <User size={10} /> {objective.owner_name}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs text-white/60">{objective.key_results_count} KRs</p>
              <p className="text-lg font-bold text-white tabular-nums">{objective.avg_progress}%</p>
            </div>
            <ProgressRing pct={objective.avg_progress} />
          </div>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-zinc-800">
          {krs.length === 0 ? (
            <p className="px-4 py-3 text-xs text-white/30">No key results yet</p>
          ) : (
            krs.map((kr) => (
              <KeyResultRow key={kr.id} kr={kr} onUpdate={() => {
                axios.get(`/api/work/objectives/${objective.id}/`).then(({ data }) => {
                  setKrs(data.key_results || []);
                }).catch(() => {});
              }} />
            ))
          )}
          <div className="px-4 py-2 border-t border-zinc-800/50">
            <button
              onClick={() => onAction('add_kr', objective)}
              className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
            >
              <Plus size={12} /> Add Key Result
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const EMPTY_FORM = { title: "", description: "", alignment: "TEAM", start_date: "", end_date: "", owner: "" };
const EMPTY_KR = { title: "", kr_type: "percentage", target_value: 100, current_value: 0 };

const OKRView = () => {
  const { workspaceId } = useParams();
  const [objectives, setObjectives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ACTIVE');
  const [showObjectiveDialog, setShowObjectiveDialog] = useState(false);
  const [showKRDialog, setShowKRDialog] = useState(false);
  const [selectedObjective, setSelectedObjective] = useState(null);
  const [objForm, setObjForm] = useState({ ...EMPTY_FORM });
  const [krForm, setKrForm] = useState({ ...EMPTY_KR });
  const [saving, setSaving] = useState(false);

  const fetchObjectives = useCallback(async () => {
    setLoading(true);
    try {
      const params = { workspace: workspaceId };
      if (filter !== 'ALL') params.status = filter;
      const { data } = await axios.get('/api/work/objectives/', { params });
      setObjectives(data.results || data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [workspaceId, filter]);

  useEffect(() => { fetchObjectives(); }, [fetchObjectives]);

  const stats = {
    total: objectives.length,
    active: objectives.filter((o) => o.status === 'ACTIVE').length,
    achieved: objectives.filter((o) => o.status === 'ACHIEVED').length,
    avgProgress: objectives.length
      ? Math.round(objectives.reduce((s, o) => s + o.avg_progress, 0) / objectives.length)
      : 0,
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">OKRs & Goals</h1>
          <p className="text-sm text-white/40">Objectives and Key Results — Company to Individual</p>
        </div>
        <button onClick={() => { setObjForm({ ...EMPTY_FORM, workspace: workspaceId }); setShowObjectiveDialog(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors">
          <Plus size={16} /> New Objective
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total', value: stats.total, color: 'text-white' },
          { label: 'Active', value: stats.active, color: 'text-blue-400' },
          { label: 'Achieved', value: stats.achieved, color: 'text-green-400' },
          { label: 'Avg Progress', value: `${stats.avgProgress}%`, color: 'text-amber-400' },
        ].map((s) => (
          <div key={s.label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <p className="text-xs text-white/40">{s.label}</p>
            <p className={cn("text-2xl font-bold mt-1 tabular-nums", s.color)}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {['ACTIVE', 'ALL', 'DRAFT', 'ACHIEVED', 'MISSED'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
              filter === f
                ? "bg-blue-600 text-white"
                : "bg-zinc-800 text-white/50 hover:text-white hover:bg-zinc-700"
            )}
          >
            {f === 'ALL' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="text-center py-12 text-white/30 text-sm">Loading...</div>
      ) : objectives.length === 0 ? (
        <div className="text-center py-12">
          <Target size={40} className="mx-auto text-white/10 mb-3" />
          <p className="text-sm text-white/30">No objectives yet. Create your first one.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {objectives.map((obj) => (
            <ObjectiveCard key={obj.id} objective={obj} onAction={(action, obj) => {
              if (action === 'add_kr') {
                setSelectedObjective(obj);
                setKrForm({ ...EMPTY_KR });
                setShowKRDialog(true);
              }
            }} />
          ))}
        </div>
      )}

      {/* New Objective Dialog */}
      {showObjectiveDialog && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 w-full max-w-md mx-4">
            <h2 className="text-base font-semibold text-white mb-4">New Objective</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-white/40 mb-1">Title</label>
                <input value={objForm.title} onChange={(e) => setObjForm({ ...objForm, title: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white" />
              </div>
              <div>
                <label className="block text-xs text-white/40 mb-1">Description</label>
                <textarea value={objForm.description} onChange={(e) => setObjForm({ ...objForm, description: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white resize-none h-16" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-white/40 mb-1">Alignment</label>
                  <select value={objForm.alignment} onChange={(e) => setObjForm({ ...objForm, alignment: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white">
                    <option value="COMPANY">Company</option>
                    <option value="DEPARTMENT">Department</option>
                    <option value="TEAM">Team</option>
                    <option value="INDIVIDUAL">Individual</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-white/40 mb-1">Owner</label>
                  <input value={objForm.owner} onChange={(e) => setObjForm({ ...objForm, owner: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-white/40 mb-1">Start Date</label>
                  <input type="date" value={objForm.start_date} onChange={(e) => setObjForm({ ...objForm, start_date: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white" />
                </div>
                <div>
                  <label className="block text-xs text-white/40 mb-1">End Date</label>
                  <input type="date" value={objForm.end_date} onChange={(e) => setObjForm({ ...objForm, end_date: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white" />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => setShowObjectiveDialog(false)} className="px-4 py-2 text-xs text-white/40 hover:text-white transition-colors">Cancel</button>
              <button
                onClick={async () => {
                  setSaving(true);
                  try {
                    await axios.post("/api/work/objectives/", objForm);
                    setShowObjectiveDialog(false);
                    fetchObjectives();
                  } catch (err) { console.error(err); }
                  finally { setSaving(false); }
                }}
                disabled={saving}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
              >
                {saving ? "Creating..." : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Key Result Dialog */}
      {showKRDialog && selectedObjective && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 w-full max-w-md mx-4">
            <h2 className="text-base font-semibold text-white mb-4">Add Key Result</h2>
            <p className="text-xs text-white/40 mb-4">for: {selectedObjective.title}</p>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-white/40 mb-1">Title</label>
                <input value={krForm.title} onChange={(e) => setKrForm({ ...krForm, title: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white" />
              </div>
              <div>
                <label className="block text-xs text-white/40 mb-1">Type</label>
                <select value={krForm.kr_type} onChange={(e) => setKrForm({ ...krForm, kr_type: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white">
                  <option value="percentage">Percentage</option>
                  <option value="number">Number</option>
                  <option value="currency">Currency</option>
                  <option value="boolean">Yes/No</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-white/40 mb-1">Target Value</label>
                  <input type="number" value={krForm.target_value} onChange={(e) => setKrForm({ ...krForm, target_value: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white" />
                </div>
                <div>
                  <label className="block text-xs text-white/40 mb-1">Current Value</label>
                  <input type="number" value={krForm.current_value} onChange={(e) => setKrForm({ ...krForm, current_value: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white" />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => setShowKRDialog(false)} className="px-4 py-2 text-xs text-white/40 hover:text-white transition-colors">Cancel</button>
              <button
                onClick={async () => {
                  setSaving(true);
                  try {
                    await axios.post("/api/work/key-results/", { ...krForm, objective: selectedObjective.id });
                    setShowKRDialog(false);
                    fetchObjectives();
                  } catch (err) { console.error(err); }
                  finally { setSaving(false); }
                }}
                disabled={saving}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
              >
                {saving ? "Adding..." : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OKRView;
