import React, { useState, useEffect } from "react";
import axios from "axios";
import { masterDataAPI, leaveAPI } from "../services/hrAPI";
import { Settings, Shield, MapPin, Briefcase, DollarSign, Clock, Calendar, RefreshCw, Plus, X, Pencil, Trash2, Building } from "lucide-react";

export default function HRSettings() {
  const [activeSection, setActiveSection] = useState("departments");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);

  const sections = [
    { id: "departments", label: "Departments", icon: Building },
    { id: "designations", label: "Designations", icon: Briefcase },
    { id: "shifts", label: "Shifts & Rosters", icon: Clock },
    { id: "leaves", label: "Leave Configurations", icon: Calendar },
    { id: "locations", label: "Work Locations", icon: MapPin },
    { id: "centers", label: "Cost Centers", icon: DollarSign },
  ];

  useEffect(() => { loadSectionData(); }, [activeSection]);

  const loadSectionData = async () => {
    setLoading(true);
    try {
      if (activeSection === "departments") {
        const res = await axios.get("/api/auth/departments/");
        setData(res.data?.results || res.data || []);
      } else if (activeSection === "designations") {
        const res = await masterDataAPI.getDesignations();
        setData(res.data?.results || res.data || []);
      } else if (activeSection === "shifts") {
        const res = await masterDataAPI.getShifts();
        setData(res.data?.results || res.data || []);
      } else if (activeSection === "locations") {
        const res = await masterDataAPI.getWorkLocations();
        setData(res.data?.results || res.data || []);
      } else if (activeSection === "centers") {
        const res = await masterDataAPI.getCostCenters();
        setData(res.data?.results || res.data || []);
      } else if (activeSection === "leaves") {
        const res = await leaveAPI.getLeaveTypes();
        setData(res.data?.results || res.data || []);
      }
    } catch (err) {
      console.error("Error loading settings section:", err);
    } finally { setLoading(false); }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
          <Settings className="text-blue-500 animate-spin-slow" /> HR Master Configuration
        </h1>
        <p className="text-zinc-400 text-sm mt-1">Configure departments, designations, leave structures, shifts, and locations.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-zinc-950/60 border border-zinc-800 p-4 rounded-xl space-y-2 h-fit">
          {sections.map((sec) => {
            const Icon = sec.icon;
            return (
              <button key={sec.id} onClick={() => setActiveSection(sec.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition ${
                  activeSection === sec.id ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "text-zinc-400 hover:bg-zinc-900/60 hover:text-white"
                }`}>
                <Icon size={18} /> {sec.label}
              </button>
            );
          })}
        </div>

        <div className="md:col-span-3 bg-zinc-950/40 backdrop-blur-xl border border-zinc-800 rounded-xl p-6 shadow-2xl space-y-4">
          <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
            <h2 className="text-xl font-bold text-white capitalize">{activeSection} Master List</h2>
            <div className="flex items-center gap-2">
              {(activeSection === "departments" || activeSection === "designations") && (
                <AddButton section={activeSection} onCreated={loadSectionData} />
              )}
              <button onClick={loadSectionData} className="p-2 hover:bg-zinc-900 rounded-lg text-zinc-400 hover:text-white transition">
                <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <RefreshCw size={32} className="text-blue-500 animate-spin" />
              <p className="text-zinc-500 text-sm">Loading config parameters...</p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.length === 0 ? (
                <p className="text-zinc-500 text-sm text-center py-10">No items found in this category.</p>
              ) : (
                data.map((item) => (
                  activeSection === "departments" ? (
                    <DepartmentRow key={item.id} item={item} onUpdated={loadSectionData} />
                  ) : activeSection === "designations" ? (
                    <DesignationRow key={item.id} item={item} onUpdated={loadSectionData} />
                  ) : (
                    <DefaultRow key={item.id} item={item} section={activeSection} />
                  )
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AddButton({ section, onCreated }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium transition-colors">
        <Plus size={14} /> New {section === "departments" ? "Department" : "Designation"}
      </button>
      {open && section === "departments" && <DepartmentForm onClose={() => setOpen(false)} onCreated={onCreated} />}
      {open && section === "designations" && <DesignationForm onClose={() => setOpen(false)} onCreated={onCreated} />}
    </>
  );
}

/* ---------- Department ---------- */
function DepartmentRow({ item, onUpdated }) {
  const [editing, setEditing] = useState(false);
  const handleDelete = async () => {
    if (!confirm("Delete this department?")) return;
    try { await axios.delete(`/api/auth/departments/${item.id}/`); onUpdated(); } catch (e) { alert("Failed to delete"); }
  };
  if (editing) return <DepartmentForm edit={item} onClose={() => setEditing(false)} onCreated={onUpdated} />;

  return (
    <div className="p-4 bg-zinc-900/40 border border-zinc-800/80 rounded-lg hover:border-zinc-700 transition flex items-center justify-between">
      <div>
        <h3 className="font-semibold text-white">{item.name}</h3>
        {item.description && <p className="text-xs text-zinc-500 mt-0.5">{item.description}</p>}
        {item.manager_name && <p className="text-xs text-zinc-500">Manager: {item.manager_name}</p>}
      </div>
      <div className="flex items-center gap-2">
        <button onClick={() => setEditing(true)} className="p-1.5 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white transition-colors"><Pencil size={14} /></button>
        <button onClick={handleDelete} className="p-1.5 hover:bg-red-500/10 rounded text-zinc-400 hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
      </div>
    </div>
  );
}

function DepartmentForm({ edit, onClose, onCreated }) {
  const [form, setForm] = useState({ name: edit?.name || "", description: edit?.description || "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setLoading(true);
    setError(null);
    try {
      if (edit) await axios.patch(`/api/auth/departments/${edit.id}/`, form);
      else await axios.post("/api/auth/departments/", form);
      onCreated();
      onClose();
    } catch (err) {
      const d = err.response?.data;
      setError(d && typeof d === 'object' ? Object.values(d).flat().join(' | ') : "Failed to save");
    } finally { setLoading(false); }
  };

  return (
    <Modal title={edit ? "Edit Department" : "New Department"} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-sm text-red-400 bg-red-500/10 px-3 py-2 rounded-lg">{error}</p>}
        <Field label="Name *">
          <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. Human Resources" />
        </Field>
        <Field label="Description">
          <textarea rows={2} value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Optional description" />
        </Field>
        <div className="flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl font-medium transition-all text-sm">Cancel</button>
          <button type="submit" disabled={loading || !form.name.trim()} className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-all disabled:opacity-50 text-sm">
            {loading ? "Saving..." : edit ? "Update" : "Create"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

/* ---------- Designation ---------- */
function DesignationRow({ item, onUpdated }) {
  const [editing, setEditing] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Delete this designation?")) return;
    try { await masterDataAPI.deleteDesignation(item.id); onUpdated(); } catch (e) { alert("Failed to delete"); }
  };

  if (editing) return <DesignationForm edit={item} onClose={() => setEditing(false)} onCreated={onUpdated} />;

  return (
    <div className="p-4 bg-zinc-900/40 border border-zinc-800/80 rounded-lg hover:border-zinc-700 transition flex items-center justify-between">
      <div>
        <h3 className="font-semibold text-white">{item.name} <span className="text-zinc-500 font-normal">({item.code})</span></h3>
        <p className="text-xs text-zinc-500 mt-0.5">
          {item.description}{item.department_name ? ` | ${item.department_name}` : ""}{item.grade ? ` | Grade: ${item.grade}` : ""}{item.band ? ` | Band: ${item.band}` : ""}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={() => setEditing(true)} className="p-1.5 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white transition-colors"><Pencil size={14} /></button>
        <button onClick={handleDelete} className="p-1.5 hover:bg-red-500/10 rounded text-zinc-400 hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
      </div>
    </div>
  );
}

function DesignationForm({ edit, onClose, onCreated }) {
  const [form, setForm] = useState({
    code: edit?.code || "", name: edit?.name || "", description: edit?.description || "",
    department: edit?.department || "", grade: edit?.grade || "", band: edit?.band || "",
  });
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get("/api/auth/departments/").then(r => setDepartments(r.data?.results || r.data || [])).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.code.trim() || !form.name.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const payload = { ...form, department: form.department || null };
      if (edit) await masterDataAPI.updateDesignation(edit.id, payload);
      else await masterDataAPI.createDesignation(payload);
      onCreated();
      onClose();
    } catch (err) {
      const d = err.response?.data;
      setError(d && typeof d === 'object' ? Object.values(d).flat().join(' | ') : "Failed to save");
    } finally { setLoading(false); }
  };

  return (
    <Modal title={edit ? "Edit Designation" : "New Designation"} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-sm text-red-400 bg-red-500/10 px-3 py-2 rounded-lg">{error}</p>}
        <div className="grid grid-cols-2 gap-4">
          <Field label="Code *">
            <input required value={form.code} onChange={e => setForm({...form, code: e.target.value})} placeholder="e.g. SE1" />
          </Field>
          <Field label="Name *">
            <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. Software Engineer" />
          </Field>
        </div>
        <Field label="Description">
          <textarea rows={2} value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Optional description" />
        </Field>
        <div className="grid grid-cols-3 gap-4">
          <Field label="Department">
            <select value={form.department} onChange={e => setForm({...form, department: e.target.value})}>
              <option value="">None</option>
              {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </Field>
          <Field label="Grade">
            <input value={form.grade} onChange={e => setForm({...form, grade: e.target.value})} placeholder="e.g. E1" />
          </Field>
          <Field label="Band">
            <input value={form.band} onChange={e => setForm({...form, band: e.target.value})} placeholder="e.g. IC1" />
          </Field>
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl font-medium transition-all text-sm">Cancel</button>
          <button type="submit" disabled={loading || !form.code.trim() || !form.name.trim()} className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-all disabled:opacity-50 text-sm">
            {loading ? "Saving..." : edit ? "Update" : "Create"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

/* ---------- Default row for other sections ---------- */
function DefaultRow({ item, section }) {
  return (
    <div className="p-4 bg-zinc-900/40 border border-zinc-800/80 rounded-lg hover:border-zinc-700 transition flex items-center justify-between">
      <div>
        <h3 className="font-semibold text-white">{item.name || item.title || item.code || item.state}</h3>
        {section === "shifts" && <p className="text-xs text-zinc-500 mt-0.5">Timing: {item.start_time?.slice(0,5)} to {item.end_time?.slice(0,5)}</p>}
        {section === "leaves" && <p className="text-xs text-zinc-500 mt-0.5">Annual Allocation: {item.annual_allocation} days | Paid: {item.is_paid ? "Yes" : "No"}</p>}
        {section === "locations" && <p className="text-xs text-zinc-500 mt-0.5">Code: {item.code} | Address: {item.address || "N/A"}</p>}
      </div>
      <span className="text-xs px-2 py-1 bg-zinc-800 text-zinc-400 rounded border border-zinc-700 uppercase font-semibold">Active</span>
    </div>
  );
}

/* ---------- Shared ---------- */
function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-white/10 rounded-xl p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-white">{title}</h3>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors"><X size={20} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-white/60 mb-1.5">{label}</label>
      {React.cloneElement(children, { className: "w-full px-4 py-2.5 bg-[#1a1a1a] border border-white/10 rounded-lg text-white text-sm" })}
    </div>
  );
}
