import React, { useState, useEffect } from "react";
import { X, Plus, Loader } from "lucide-react";
import { trainingAPI, employeeAPI } from "../services/hrAPI";

export default function TrainingDashboard() {
  const [activeTab, setActiveTab] = useState("programs");
  const [programs, setPrograms] = useState([]);
  const [nominations, setNominations] = useState([]);
  const [needs, setNeeds] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState([]);
  const [skills, setSkills] = useState([]);
  const [showProgramModal, setShowProgramModal] = useState(false);
  const [showNeedModal, setShowNeedModal] = useState(false);
  const [showNominationModal, setShowNominationModal] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    try {
      setLoading(true);
      const [progRes, nomRes, needRes, assRes, empRes] = await Promise.all([
        trainingAPI.getPrograms().catch(() => ({ data: [] })),
        trainingAPI.getNominations().catch(() => ({ data: [] })),
        trainingAPI.getTrainingNeeds().catch(() => ({ data: [] })),
        trainingAPI.getTrainingAssessments().catch(() => ({ data: [] })),
        employeeAPI.getEmployees().catch(() => ({ data: [] })),
      ]);
      setPrograms(progRes.data.results || progRes.data || []);
      setNominations(nomRes.data.results || nomRes.data || []);
      setNeeds(needRes.data.results || needRes.data || []);
      setAssessments(assRes.data.results || assRes.data || []);
      setEmployees(empRes.data?.results || empRes.data || []);
      trainingAPI.getSkills().then(r => setSkills(r.data?.results || r.data || [])).catch(() => {});
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "programs", label: `Programs (${programs.length})` },
    { id: "needs", label: `TNI (${needs.length})` },
    { id: "nominations", label: `Nominations (${nominations.length})` },
  ];

  return (
    <div className="h-full flex flex-col bg-black">
      <header className="px-10 py-8 border-b border-white/5 shrink-0">
        <h1 className="text-3xl font-bold text-white">Training & Development</h1>
        <p className="text-sm text-white/40 font-medium mt-1">Training programs, TNI, skill assessments, and nominations</p>
      </header>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap items-center gap-2 mb-6">
            {tabs.map((t) => (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${activeTab === t.id ? "bg-blue-600 text-white" : "bg-white/5 text-white/60 border border-white/10 hover:bg-white/10"}`}>
                {t.label}
              </button>
            ))}
            <div className="ml-auto flex gap-2">
              {activeTab === "programs" && (
                <button onClick={() => setShowProgramModal(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors">
                  <Plus size={14} /> New Program
                </button>
              )}
              {activeTab === "needs" && (
                <button onClick={() => setShowNeedModal(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors">
                  <Plus size={14} /> New Need
                </button>
              )}
              {activeTab === "nominations" && (
                <button onClick={() => setShowNominationModal(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors">
                  <Plus size={14} /> New Nomination
                </button>
              )}
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12 text-white/40">Loading...</div>
          ) : (
            <>
              {activeTab === "overview" && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white/[0.03] rounded-xl border border-white/10 p-4">
                    <p className="text-2xl font-bold text-blue-400">{programs.length}</p>
                    <p className="text-xs text-white/50">Programs</p>
                  </div>
                  <div className="bg-white/[0.03] rounded-xl border border-white/10 p-4">
                    <p className="text-2xl font-bold text-yellow-400">{needs.filter(n => n.status === "IDENTIFIED").length}</p>
                    <p className="text-xs text-white/50">Identified Needs</p>
                  </div>
                  <div className="bg-white/[0.03] rounded-xl border border-white/10 p-4">
                    <p className="text-2xl font-bold text-green-400">{nominations.filter(n => n.status === "Completed").length}</p>
                    <p className="text-xs text-white/50">Completed</p>
                  </div>
                  <div className="bg-white/[0.03] rounded-xl border border-white/10 p-4">
                    <p className="text-2xl font-bold text-purple-400">{assessments.length}</p>
                    <p className="text-xs text-white/50">Assessments</p>
                  </div>
                </div>
              )}

              {activeTab === "programs" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {programs.length === 0 ? (
                    <div className="col-span-2 bg-white/[0.03] rounded-xl border border-white/10 p-8 text-center text-white/40">No programs</div>
                  ) : programs.map((p) => (
                    <div key={p.id} className="bg-white/[0.03] rounded-xl border border-white/10 p-4 hover:border-blue-500/30 transition-all">
                      <h3 className="font-semibold text-white">{p.name}</h3>
                      <p className="text-sm text-white/60 mt-1 line-clamp-2">{p.description}</p>
                      <div className="flex items-center justify-between mt-3 text-xs text-white/50">
                        <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded-full">{p.training_type}</span>
                        <span>{new Date(p.start_date).toLocaleDateString()} - {new Date(p.end_date).toLocaleDateString()}</span>
                      </div>
                      {p.trainer_name && <p className="text-xs text-white/40 mt-1">Trainer: {p.trainer_name}</p>}
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "needs" && (
                <div className="bg-white/[0.03] rounded-xl border border-white/10">
                  {needs.length === 0 ? (
                    <div className="p-8 text-center text-white/40">No training needs identified</div>
                  ) : (
                    <div className="divide-y divide-white/5">
                      {needs.map((n) => (
                        <div key={n.id} className="p-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium text-white">{n.employee_name || n.employee?.first_name} - {n.skill_name || n.skill?.name || "General"}</p>
                              <p className="text-sm text-white/50">{n.need_type} | Current: {n.current_proficiency}/5 → Target: {n.target_proficiency}/5 | Gap: {n.gap}</p>
                              {n.suggested_program && <p className="text-xs text-white/40 mt-1">Suggested: {n.suggested_program}</p>}
                            </div>
                            <div className="text-right">
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                n.priority === "CRITICAL" ? "bg-red-500/10 text-red-400" :
                                n.priority === "HIGH" ? "bg-orange-500/10 text-orange-400" :
                                "bg-yellow-500/10 text-yellow-400"
                              }`}>{n.priority}</span>
                              <p className="text-xs text-white/40 mt-1">Status: {n.status}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "nominations" && (
                <div className="bg-white/[0.03] rounded-xl border border-white/10">
                  {nominations.length === 0 ? (
                    <div className="p-8 text-center text-white/40">No nominations</div>
                  ) : (
                    <div className="divide-y divide-white/5">
                      {nominations.map((n) => (
                        <div key={n.id} className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-white">{n.employee_name || n.employee?.first_name} → {n.program_name || n.program?.name}</p>
                              {n.completion_score && <p className="text-sm text-white/50">Score: {n.completion_score}%</p>}
                            </div>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              n.status === "Completed" ? "bg-green-500/10 text-green-400" :
                              n.status === "Approved" ? "bg-blue-500/10 text-blue-400" :
                              "bg-yellow-500/10 text-yellow-400"
                            }`}>{n.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* New Program Modal */}
      {showProgramModal && <ProgramModal
        onClose={() => setShowProgramModal(false)}
        onCreated={loadAll}
      />}

      {/* New Training Need Modal */}
      {showNeedModal && <TrainingNeedModal
        employees={employees}
        skills={skills}
        onClose={() => setShowNeedModal(false)}
        onCreated={loadAll}
      />}

      {/* New Nomination Modal */}
      {showNominationModal && <NominationModal
        employees={employees}
        programs={programs}
        onClose={() => setShowNominationModal(false)}
        onCreated={loadAll}
      />}
    </div>
  );
}

function ModalOverlay({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-white/10 rounded-xl p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-white">{title}</h3>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function ProgramModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ name: "", description: "", training_type: "Internal", start_date: "", end_date: "", trainer_name: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await trainingAPI.createProgram(form);
      onCreated();
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to create program");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalOverlay title="New Program" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-sm text-red-400 bg-red-500/10 px-3 py-2 rounded-lg">{error}</p>}
        <div>
          <label className="block text-sm font-medium text-white/60 mb-1.5">Program Name *</label>
          <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})}
            className="w-full px-4 py-2.5 bg-[#1a1a1a] border border-white/10 rounded-lg text-white text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-white/60 mb-1.5">Description *</label>
          <textarea required value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={3}
            className="w-full px-4 py-2.5 bg-[#1a1a1a] border border-white/10 rounded-lg text-white text-sm" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-white/60 mb-1.5">Type *</label>
            <select value={form.training_type} onChange={e => setForm({...form, training_type: e.target.value})}
              className="w-full px-4 py-2.5 bg-[#1a1a1a] border border-white/10 rounded-lg text-white text-sm">
              <option value="Internal">Internal</option>
              <option value="External">External</option>
              <option value="Online">Online</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-white/60 mb-1.5">Trainer</label>
            <input value={form.trainer_name} onChange={e => setForm({...form, trainer_name: e.target.value})}
              className="w-full px-4 py-2.5 bg-[#1a1a1a] border border-white/10 rounded-lg text-white text-sm" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-white/60 mb-1.5">Start Date *</label>
            <input required type="date" value={form.start_date} onChange={e => setForm({...form, start_date: e.target.value})}
              className="w-full px-4 py-2.5 bg-[#1a1a1a] border border-white/10 rounded-lg text-white text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/60 mb-1.5">End Date *</label>
            <input required type="date" value={form.end_date} onChange={e => setForm({...form, end_date: e.target.value})}
              className="w-full px-4 py-2.5 bg-[#1a1a1a] border border-white/10 rounded-lg text-white text-sm" />
          </div>
        </div>
        <button type="submit" disabled={loading}
          className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-all disabled:opacity-50 text-sm">
          {loading ? "Creating..." : "Create Program"}
        </button>
      </form>
    </ModalOverlay>
  );
}

function TrainingNeedModal({ employees, skills, onClose, onCreated }) {
  const [form, setForm] = useState({
    employee: "", skill: "", need_type: "SKILL_GAP",
    current_proficiency: 3, target_proficiency: 4,
    priority: "MEDIUM", suggested_program: "", target_completion_date: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await trainingAPI.createTrainingNeed({ ...form, skill: form.skill || null, target_completion_date: form.target_completion_date || null });
      onCreated();
      onClose();
    } catch (err) {
      const d = err.response?.data;
      setError(d && typeof d === 'object' ? Object.values(d).flat().join(' | ') : "Failed to create need");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalOverlay title="New Training Need" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-sm text-red-400 bg-red-500/10 px-3 py-2 rounded-lg">{error}</p>}
        <div>
          <label className="block text-sm font-medium text-white/60 mb-1.5">Employee *</label>
          <select required value={form.employee} onChange={e => setForm({...form, employee: e.target.value})}
            className="w-full px-4 py-2.5 bg-[#1a1a1a] border border-white/10 rounded-lg text-white text-sm">
            <option value="">Select Employee...</option>
            {employees.map(emp => (
              <option key={emp.id} value={emp.id}>{emp.first_name} {emp.last_name} ({emp.employee_id})</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-white/60 mb-1.5">Need Type *</label>
            <select value={form.need_type} onChange={e => setForm({...form, need_type: e.target.value})}
              className="w-full px-4 py-2.5 bg-[#1a1a1a] border border-white/10 rounded-lg text-white text-sm">
              <option value="SKILL_GAP">Skill Gap</option>
              <option value="SELF_NOMINATION">Self Nomination</option>
              <option value="MANAGER_RECOMMENDED">Manager Recommended</option>
              <option value="MANDATORY">Mandatory (Compliance)</option>
              <option value="INDUCTION">Induction/Training</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-white/60 mb-1.5">Skill</label>
            <select value={form.skill} onChange={e => setForm({...form, skill: e.target.value})}
              className="w-full px-4 py-2.5 bg-[#1a1a1a] border border-white/10 rounded-lg text-white text-sm">
              <option value="">Select Skill...</option>
              {skills.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-white/60 mb-1.5">Current Proficiency (1-5)</label>
            <input required type="number" min="1" max="5" value={form.current_proficiency}
              onChange={e => {
                const c = parseInt(e.target.value) || 1;
                const gap = Math.max(0, parseInt(form.target_proficiency) - c);
                setForm({...form, current_proficiency: c, gap});
              }}
              className="w-full px-4 py-2.5 bg-[#1a1a1a] border border-white/10 rounded-lg text-white text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/60 mb-1.5">Target Proficiency (1-5)</label>
            <input required type="number" min="1" max="5" value={form.target_proficiency}
              onChange={e => setForm({...form, target_proficiency: parseInt(e.target.value) || 1})}
              className="w-full px-4 py-2.5 bg-[#1a1a1a] border border-white/10 rounded-lg text-white text-sm" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-white/60 mb-1.5">Priority</label>
            <select value={form.priority} onChange={e => setForm({...form, priority: e.target.value})}
              className="w-full px-4 py-2.5 bg-[#1a1a1a] border border-white/10 rounded-lg text-white text-sm">
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-white/60 mb-1.5">Target Completion</label>
            <input type="date" value={form.target_completion_date}
              onChange={e => setForm({...form, target_completion_date: e.target.value})}
              className="w-full px-4 py-2.5 bg-[#1a1a1a] border border-white/10 rounded-lg text-white text-sm" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-white/60 mb-1.5">Suggested Program</label>
          <input value={form.suggested_program} onChange={e => setForm({...form, suggested_program: e.target.value})}
            className="w-full px-4 py-2.5 bg-[#1a1a1a] border border-white/10 rounded-lg text-white text-sm" />
        </div>
        <button type="submit" disabled={loading}
          className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-all disabled:opacity-50 text-sm">
          {loading ? "Creating..." : "Create Training Need"}
        </button>
      </form>
    </ModalOverlay>
  );
}

function NominationModal({ employees, programs, onClose, onCreated }) {
  const [form, setForm] = useState({ employee: "", program: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await trainingAPI.createNomination({ ...form, status: "Nominated" });
      onCreated();
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to create nomination");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalOverlay title="New Nomination" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-sm text-red-400 bg-red-500/10 px-3 py-2 rounded-lg">{error}</p>}
        <div>
          <label className="block text-sm font-medium text-white/60 mb-1.5">Employee *</label>
          <select required value={form.employee} onChange={e => setForm({...form, employee: e.target.value})}
            className="w-full px-4 py-2.5 bg-[#1a1a1a] border border-white/10 rounded-lg text-white text-sm">
            <option value="">Select Employee...</option>
            {employees.map(emp => (
              <option key={emp.id} value={emp.id}>{emp.first_name} {emp.last_name} ({emp.employee_id})</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-white/60 mb-1.5">Program *</label>
          <select required value={form.program} onChange={e => setForm({...form, program: e.target.value})}
            className="w-full px-4 py-2.5 bg-[#1a1a1a] border border-white/10 rounded-lg text-white text-sm">
            <option value="">Select Program...</option>
            {programs.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
        <button type="submit" disabled={loading}
          className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-all disabled:opacity-50 text-sm">
          {loading ? "Creating..." : "Create Nomination"}
        </button>
      </form>
    </ModalOverlay>
  );
}
