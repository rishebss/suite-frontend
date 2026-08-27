import React, { useState, useEffect } from 'react';
import { Briefcase, Search, Plus, Filter, Loader, Users, ChevronLeft, X, Building, BadgeInfo } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { masterDataAPI } from "../services/hrAPI";

export default function RecruitmentDashboard() {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState([]);
  const [applications, setApplications] = useState([]);
  const [requisitions, setRequisitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCandidateForm, setShowCandidateForm] = useState(false);
  const [showRequisitionForm, setShowRequisitionForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const [candidateForm, setCandidateForm] = useState({
    first_name: '', last_name: '', email: '', phone: '',
    source: '', skills: '', experience_years: '',
    requisition: '', stage: 'Applied'
  });

  const [requisitionForm, setRequisitionForm] = useState({
    department: '', designation: '', vacancies: 2, priority: 'Medium', justification: ''
  });
  const [metadata, setMetadata] = useState({ departments: [], designations: [] });
  const [quickDept, setQuickDept] = useState(false);
  const [quickDesig, setQuickDesig] = useState(false);
  const [quickForm, setQuickForm] = useState({ name: '', code: '', description: '' });
  const [quickLoading, setQuickLoading] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkForm, setLinkForm] = useState({ candidates: [], requisition: '', stage: 'Applied', search: '' });
  const [showStageModal, setShowStageModal] = useState(false);
  const [stageForm, setStageForm] = useState({ applicationId: '', stage: '' });

  useEffect(() => {
    fetchData();
    fetchMetadata();
  }, []);

  const fetchMetadata = async () => {
    try {
      const [depRes, desRes] = await Promise.all([
        axios.get('/api/auth/departments/').catch(() => ({data: []})),
        axios.get('/api/hr/designations/').catch(() => ({data: []}))
      ]);
      setMetadata({
        departments: depRes.data.results || depRes.data || [],
        designations: desRes.data.results || desRes.data || []
      });
    } catch (err) {
      console.error("Meta fetch error", err);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [candRes, appRes, reqRes] = await Promise.all([
        axios.get('/api/hr/candidates/'),
        axios.get('/api/hr/job-applications/'),
        axios.get('/api/hr/job-requisitions/')
      ]);
      setCandidates(candRes.data.results || candRes.data || []);
      setApplications(appRes.data.results || appRes.data || []);
      setRequisitions(reqRes.data.results || reqRes.data || []);
    } catch (err) {
      console.error("Failed to fetch recruitment data", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCandidateSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setErrorMsg(null);
    try {
      const payload = { ...candidateForm };
      if (payload.skills) payload.skills = payload.skills.split(',').map(s => s.trim());
      if (payload.experience_years) payload.experience_years = parseFloat(payload.experience_years);
      const candRes = await axios.post('/api/hr/candidates/', payload);
      if (candidateForm.requisition) {
        await axios.post('/api/hr/job-applications/', {
          candidate: candRes.data.id,
          requisition: candidateForm.requisition,
          stage: candidateForm.stage
        });
      }
      setShowCandidateForm(false);
      setCandidateForm({ first_name: '', last_name: '', email: '', phone: '', source: '', skills: '', experience_years: '', requisition: '', stage: 'Applied' });
      fetchData();
    } catch (err) {
      setErrorMsg(err.response?.data ? JSON.stringify(err.response.data) : 'Failed to create candidate');
    } finally {
      setFormLoading(false);
    }
  };

  const handleRequisitionSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setErrorMsg(null);
    try {
      await axios.post('/api/hr/job-requisitions/', requisitionForm);          setShowRequisitionForm(false);
          setRequisitionForm({ department: '', designation: '', vacancies: 2, priority: 'Medium', justification: '' });
      fetchData();
    } catch (err) {
      setErrorMsg(err.response?.data ? JSON.stringify(err.response.data) : 'Failed to create requisition');
    } finally {
      setFormLoading(false);
    }
  };

  const stages = ['Applied', 'Screening', 'L1_Interview', 'L2_Interview', 'HR_Round', 'Offered', 'Accepted'];

  return (
    <div className="h-full flex flex-col bg-black">
      <header className="px-10 py-8 flex justify-between items-end border-b border-white/5 shrink-0 bg-black/50 backdrop-blur-xl z-10 sticky top-0">
        <div className="space-y-1">
          <button onClick={() => navigate('/hr/admin')} className="flex items-center gap-2 text-white/40 hover:text-white mb-4 transition-colors text-sm">
            <ChevronLeft size={16} /> Back to HR Admin
          </button>
          <h1 className="text-4xl font-bold tracking-tight text-white flex items-center gap-3">
            <Briefcase size={32} className="text-purple-500" />
            Recruitment & ATS
          </h1>
          <p className="text-sm text-white/40 font-medium">Manage job requisitions and track candidate pipelines.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setShowCandidateForm(true)} className="px-4 py-2 bg-white/5 border border-white/10 text-white rounded-lg hover:bg-white/10 transition-colors font-medium text-sm">
            Add Candidate
          </button>
          <button onClick={() => setShowLinkModal(true)} className="px-4 py-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/20 transition-colors font-medium text-sm">
            Link Candidate
          </button>
          <button onClick={() => setShowRequisitionForm(true)} className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/20 transition-colors font-medium text-sm">
            <Plus size={18} /> New Requisition
          </button>
        </div>
      </header>

      {/* Add Candidate Modal */}
      {showCandidateForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg mx-4 p-8 rounded-2xl bg-zinc-900/95 border border-white/10 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Add Candidate</h2>
              <button onClick={() => setShowCandidateForm(false)} className="text-white/40 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            {errorMsg && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">{errorMsg}</div>}
            <form onSubmit={handleCandidateSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-1.5">First Name *</label>
                  <input required value={candidateForm.first_name} onChange={e => setCandidateForm({...candidateForm, first_name: e.target.value})} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-1.5">Last Name *</label>
                  <input required value={candidateForm.last_name} onChange={e => setCandidateForm({...candidateForm, last_name: e.target.value})} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/60 mb-1.5">Email *</label>
                <input required type="email" value={candidateForm.email} onChange={e => setCandidateForm({...candidateForm, email: e.target.value})} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/60 mb-1.5">Phone *</label>
                <input required value={candidateForm.phone} onChange={e => setCandidateForm({...candidateForm, phone: e.target.value})} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-1.5">Source</label>
                  <input value={candidateForm.source} onChange={e => setCandidateForm({...candidateForm, source: e.target.value})} placeholder="LinkedIn, Referral..." className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 placeholder:text-white/30" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-1.5">Experience (years)</label>
                  <input type="number" step="0.5" value={candidateForm.experience_years} onChange={e => setCandidateForm({...candidateForm, experience_years: e.target.value})} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/60 mb-1.5">Skills (comma separated)</label>
                <input value={candidateForm.skills} onChange={e => setCandidateForm({...candidateForm, skills: e.target.value})} placeholder="React, Python, SQL..." className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 placeholder:text-white/30" />
              </div>
              <div className="border-t border-white/10 pt-4 mt-2">
                <p className="text-xs font-medium text-white/40 uppercase tracking-wider mb-3">Link to Requisition (optional)</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white/60 mb-1.5">Requisition</label>
                    <select value={candidateForm.requisition} onChange={e => setCandidateForm({...candidateForm, requisition: e.target.value})} className="w-full px-3 py-2 bg-[#1a1a1a] border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50">
                      <option value="">None</option>
                      {requisitions.map(r => (
                        <option key={r.id} value={r.id}>
                          {r.designation_name || r.designation?.name || 'Unknown'} - {r.department_name || r.department?.name || 'General'}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/60 mb-1.5">Stage</label>
                    <select value={candidateForm.stage} onChange={e => setCandidateForm({...candidateForm, stage: e.target.value})} className="w-full px-3 py-2 bg-[#1a1a1a] border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50">
                      {stages.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                    </select>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={formLoading} className="flex-1 px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-medium transition-colors shadow-lg shadow-purple-500/20 disabled:opacity-50 text-sm">
                  {formLoading ? 'Creating...' : 'Add Candidate'}
                </button>
                <button type="button" onClick={() => setShowCandidateForm(false)} className="px-4 py-2.5 bg-white/5 border border-white/10 text-white/60 rounded-xl hover:bg-white/10 transition-colors font-medium text-sm">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* New Requisition Modal */}
      {showRequisitionForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-2xl mx-4 p-8 rounded-2xl bg-zinc-900/95 border border-white/10 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">New Requisition</h2>
              <button onClick={() => setShowRequisitionForm(false)} className="text-white/40 hover:text-white transition-colors"><X size={20} /></button>
            </div>
            {errorMsg && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">{errorMsg}</div>}
            <form onSubmit={handleRequisitionSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-1.5">Department *</label>
                  <select required value={requisitionForm.department} onChange={e => setRequisitionForm({...requisitionForm, department: e.target.value})} className="w-full px-3 py-2 bg-[#1a1a1a] border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50">
                    <option value="">Select...</option>
                    {metadata.departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                  <button type="button" onClick={() => { setQuickDept(true); setQuickForm({ name: '', code: '', description: '' }); }} className="mt-1.5 text-xs text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1">
                    <Plus size={12} /> New Department
                  </button>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-1.5">Designation *</label>
                  <select required value={requisitionForm.designation} onChange={e => setRequisitionForm({...requisitionForm, designation: e.target.value})} className="w-full px-3 py-2 bg-[#1a1a1a] border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50">
                    <option value="">Select...</option>
                    {metadata.designations.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                  <button type="button" onClick={() => setQuickDesig(!quickDesig)} className="mt-1.5 text-xs text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1">
                    {quickDesig ? <X size={12} /> : <Plus size={12} />} {quickDesig ? "Cancel" : "New Designation"}
                  </button>

                  {quickDesig && (
                    <div className="mt-3 p-3 rounded-lg bg-white/[0.03] border border-white/10 space-y-2">
                      <div>
                        <label className="block text-xs text-white/50 mb-1">Name *</label>
                        <input value={quickForm.name} onChange={e => setQuickForm({...quickForm, name: e.target.value})} placeholder="e.g. Software Engineer" className="w-full px-2.5 py-1.5 bg-[#1a1a1a] border border-white/10 rounded text-white text-xs" />
                      </div>
                      <div>
                        <label className="block text-xs text-white/50 mb-1">Code *</label>
                        <input value={quickForm.code} onChange={e => setQuickForm({...quickForm, code: e.target.value})} placeholder="e.g. SE" className="w-full px-2.5 py-1.5 bg-[#1a1a1a] border border-white/10 rounded text-white text-xs" />
                      </div>
                      <div>
                        <label className="block text-xs text-white/50 mb-1">Description</label>
                        <input value={quickForm.description} onChange={e => setQuickForm({...quickForm, description: e.target.value})} placeholder="Optional" className="w-full px-2.5 py-1.5 bg-[#1a1a1a] border border-white/10 rounded text-white text-xs" />
                      </div>
                      <button disabled={quickLoading || !quickForm.name.trim() || !quickForm.code.trim()} onClick={async () => {
                        setQuickLoading(true);
                        try {
                          await masterDataAPI.createDesignation({ name: quickForm.name, code: quickForm.code, description: quickForm.description });
                          setQuickDesig(false);
                          setQuickForm({ name: '', code: '', description: '' });
                          await fetchMetadata();
                        } catch (e) { alert("Failed to create"); }
                        finally { setQuickLoading(false); }
                      }} className="w-full py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded text-xs font-medium transition-all disabled:opacity-50">
                        {quickLoading ? "Creating..." : "Create"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/60 mb-1.5">Vacancies *</label>
                <input required type="number" min="1" value={requisitionForm.vacancies} onChange={e => setRequisitionForm({...requisitionForm, vacancies: parseInt(e.target.value)})} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/60 mb-1.5">Priority</label>
                <select value={requisitionForm.priority} onChange={e => setRequisitionForm({...requisitionForm, priority: e.target.value})} className="w-full px-3 py-2 bg-[#1a1a1a] border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50">
                  <option value="Low">Low</option><option value="Medium">Medium</option><option value="High">High</option><option value="Critical">Critical</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/60 mb-1.5">Justification *</label>
                <textarea required rows={3} value={requisitionForm.justification} onChange={e => setRequisitionForm({...requisitionForm, justification: e.target.value})} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 placeholder:text-white/30" placeholder="Why is this position needed?" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={formLoading} className="flex-1 px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-medium transition-colors shadow-lg shadow-purple-500/20 disabled:opacity-50 text-sm">
                  {formLoading ? 'Creating...' : 'Create Requisition'}
                </button>
                <button type="button" onClick={() => setShowRequisitionForm(false)} className="px-4 py-2.5 bg-white/5 border border-white/10 text-white/60 rounded-xl hover:bg-white/10 transition-colors font-medium text-sm">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Create Department (separate modal) */}
      {quickDept && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md mx-4 p-6 rounded-2xl bg-zinc-900/95 border border-white/10 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2"><Building size={18} className="text-purple-400" /> Quick Create Department</h3>
              <button onClick={() => setQuickDept(false)} className="text-white/40 hover:text-white"><X size={20} /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-white/60 mb-1.5">Name *</label>
                <input value={quickForm.name} onChange={e => setQuickForm({...quickForm, name: e.target.value})} placeholder="e.g. Engineering" className="w-full px-3 py-2 bg-[#1a1a1a] border border-white/10 rounded-lg text-white text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/60 mb-1.5">Description</label>
                <input value={quickForm.description} onChange={e => setQuickForm({...quickForm, description: e.target.value})} placeholder="Optional" className="w-full px-3 py-2 bg-[#1a1a1a] border border-white/10 rounded-lg text-white text-sm" />
              </div>
              <button disabled={quickLoading || !quickForm.name.trim()} onClick={async () => {
                setQuickLoading(true);
                try {
                  await axios.post('/api/auth/departments/', { name: quickForm.name, description: quickForm.description });
                  setQuickDept(false);
                  await fetchMetadata();
                } catch (e) { alert("Failed to create department"); }
                finally { setQuickLoading(false); }
              }} className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-medium transition-all disabled:opacity-50 text-sm">
                {quickLoading ? "Creating..." : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Link Existing Candidate Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-2xl mx-4 p-0 rounded-2xl bg-zinc-900/95 border border-white/10 shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-white/10">
              <div>
                <h2 className="text-xl font-bold text-white">Link Candidates</h2>
                <p className="text-sm text-white/40 mt-1">Select candidates to add them to a requisition pipeline</p>
              </div>
              <button onClick={() => setShowLinkModal(false)} className="text-white/40 hover:text-white transition-colors"><X size={20} /></button>
            </div>
            {errorMsg && <div className="mx-6 mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">{errorMsg}</div>}
            <div className="p-6 space-y-5">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                <input type="text" placeholder="Search candidates..." className="w-full pl-9 pr-4 py-2 bg-[#1a1a1a] border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50" onChange={e => setLinkForm({...linkForm, search: e.target.value})} />
              </div>

              <div className="max-h-52 overflow-y-auto space-y-1">
                {candidates.filter(c => !linkForm.search || `${c.first_name} ${c.last_name} ${c.email}`.toLowerCase().includes(linkForm.search.toLowerCase())).length === 0 ? (
                  <p className="text-white/30 text-sm text-center py-8">No candidates match your search</p>
                ) : candidates.filter(c => !linkForm.search || `${c.first_name} ${c.last_name} ${c.email}`.toLowerCase().includes(linkForm.search.toLowerCase())).map(c => {
                  const checked = linkForm.candidates.includes(c.id);
                  return (
                    <div key={c.id} onClick={() => {
                      if (checked) setLinkForm({...linkForm, candidates: linkForm.candidates.filter(id => id !== c.id)});
                      else setLinkForm({...linkForm, candidates: [...linkForm.candidates, c.id]});
                    }} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all ${checked ? 'bg-blue-500/10 border border-blue-500/30' : 'bg-black/40 border border-transparent hover:border-white/10'}`}>
                      <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 text-xs font-bold shrink-0">
                        {c.first_name?.[0]}{c.last_name?.[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">{c.first_name} {c.last_name}</p>
                        <p className="text-white/40 text-xs truncate">{c.email}</p>
                      </div>
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all ${checked ? 'bg-blue-500 border-blue-500' : 'border-white/20'}`}>
                        {checked && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-white/40">{linkForm.candidates.length} candidate(s) selected</span>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/10">
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-1.5">Requisition *</label>
                  <select required value={linkForm.requisition} onChange={e => setLinkForm({...linkForm, requisition: e.target.value})} className="w-full px-3 py-2 bg-[#1a1a1a] border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50">
                    <option value="">Select...</option>
                    {requisitions.map(r => <option key={r.id} value={r.id}>{r.designation_name || r.designation?.name || 'Unknown'} - {r.department_name || r.department?.name || 'General'}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-1.5">Stage</label>
                  <select value={linkForm.stage} onChange={e => setLinkForm({...linkForm, stage: e.target.value})} className="w-full px-3 py-2 bg-[#1a1a1a] border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50">
                    {stages.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button disabled={formLoading || linkForm.candidates.length === 0 || !linkForm.requisition} onClick={async () => {
                  setFormLoading(true); setErrorMsg(null);
                  try {
                    await Promise.all(linkForm.candidates.map(candidateId =>
                      axios.post('/api/hr/job-applications/', { candidate: candidateId, requisition: linkForm.requisition, stage: linkForm.stage })
                    ));
                    setShowLinkModal(false);
                    setLinkForm({ candidates: [], requisition: '', stage: 'Applied', search: '' });
                    fetchData();
                  } catch (err) { setErrorMsg(err.response?.data ? JSON.stringify(err.response.data) : 'Failed'); }
                  finally { setFormLoading(false); }
                }} className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 text-sm">
                  {formLoading ? `Linking ${linkForm.candidates.length} candidate(s)...` : `Link ${linkForm.candidates.length} Candidate(s)`}
                </button>
                <button type="button" onClick={() => setShowLinkModal(false)} className="px-4 py-2.5 bg-white/5 border border-white/10 text-white/60 rounded-xl hover:bg-white/10 transition-colors font-medium text-sm">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Update Stage Modal */}
      {showStageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm mx-4 p-6 rounded-2xl bg-zinc-900/95 border border-white/10 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-white">Move Candidate</h2>
              <button onClick={() => setShowStageModal(false)} className="text-white/40 hover:text-white"><X size={20} /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-white/60 mb-1.5">Move to Stage *</label>
                <select value={stageForm.stage} onChange={e => setStageForm({...stageForm, stage: e.target.value})} className="w-full px-3 py-2 bg-[#1a1a1a] border border-white/10 rounded-lg text-white text-sm">
                  {stages.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                </select>
              </div>
              <button disabled={formLoading} onClick={async () => {
                setFormLoading(true); setErrorMsg(null);
                try {
                  await axios.patch(`/api/hr/job-applications/${stageForm.applicationId}/`, { stage: stageForm.stage });
                  setShowStageModal(false);
                  setStageForm({ applicationId: '', stage: '' });
                  fetchData();
                } catch (err) { setErrorMsg(err.response?.data ? JSON.stringify(err.response.data) : 'Failed'); }
                finally { setFormLoading(false); }
              }} className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-medium transition-all disabled:opacity-50 text-sm">
                {formLoading ? 'Updating...' : 'Update Stage'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-10 py-8 custom-scrollbar">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader size={24} className="text-purple-500 animate-spin mr-2" />
            <span className="text-white/40">Loading recruitment data...</span>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Active Requisitions */}
            <div>
              <h2 className="text-xl font-bold text-white mb-4">Active Job Requisitions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {requisitions.length === 0 ? (
                  <p className="text-white/40 col-span-full">No active job requisitions. Click "New Requisition" to create one.</p>
                ) : requisitions.map((req) => (
                  <div key={req.id} className="p-6 rounded-xl bg-white/[0.02] border border-white/10 hover:border-white/20 transition-colors">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold text-white text-lg">{req.designation_name || req.designation?.name || 'Unknown Designation'}</h3>
                        <p className="text-sm text-white/40">{req.department_name || req.department?.name || 'General'}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-bold ${req.priority === 'High' || req.priority === 'Critical' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}`}>
                        {req.priority}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-white/60">
                      <div className="flex items-center gap-1"><Users size={14} /> {req.vacancies} Vacancies</div>
                      <div>Status: <span className="text-white">{req.status}</span></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Candidate Pipeline */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">Candidate Pipeline</h2>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                    <input type="text" placeholder="Search candidates..." className="pl-9 pr-4 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500/50" />
                  </div>
                  <button className="p-1.5 bg-white/5 border border-white/10 rounded-lg text-white/60 hover:text-white"><Filter size={16} /></button>
                </div>
              </div>
              
              <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
                {stages.map(stage => (
                  <div key={stage} className="min-w-[300px] flex-shrink-0 bg-white/[0.02] border border-white/5 rounded-xl p-4 flex flex-col h-[600px]">
                    <div className="flex justify-between items-center mb-4 pb-2 border-b border-white/10">
                      <h3 className="font-bold text-white text-sm">{stage.replace('_', ' ')}</h3>
                      <span className="text-xs font-medium text-white/40 bg-white/10 px-2 py-0.5 rounded-full">{applications.filter(a => a.stage === stage).length}</span>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3">
                      {applications.filter(a => a.stage === stage).length === 0 ? (
                        <div className="p-4 rounded-lg bg-black/40 border border-white/5">
                          <div className="text-sm text-white/40 italic text-center py-4">No candidates in this stage</div>
                        </div>
                      ) : (
                        <>
                          {applications.filter(a => a.stage === stage).slice(0, 10).map(app => (
                            <div key={app.id} onClick={() => { setStageForm({ applicationId: app.id, stage: app.stage }); setShowStageModal(true); }} className="p-4 bg-black/40 border border-white/10 hover:border-white/30 cursor-pointer transition-colors border-b border-white/40 last:border-b-0 rounded-lg">
                              <p className="font-medium text-white text-sm">{app.candidate_first_name} {app.candidate_last_name}</p>
                              <p className="text-xs text-white/40 mt-1">{app.candidate_email}</p>
                            </div>
                          ))}
                          {applications.filter(a => a.stage === stage).length > 10 && (
                            <p className="text-xs text-white/30 text-center pt-2">+{applications.filter(a => a.stage === stage).length - 10} more</p>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Candidates Table */}
            <div>
              <h2 className="text-xl font-bold text-white mb-4">All Candidates ({candidates.length})</h2>
              {candidates.length === 0 ? (
                <div className="p-8 rounded-xl border border-dashed border-white/10 text-center">
                  <Users size={32} className="text-white/20 mx-auto mb-3" />
                  <p className="text-white/40 text-sm">No candidates yet. Click "Add Candidate" to start building your pipeline.</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-white/10">
                  <table className="w-full bg-[#0a0a0a]">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-white/40">Name</th>
                        <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-white/40">Email</th>
                        <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-white/40">Phone</th>
                        <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-white/40">Source</th>
                        <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-white/40">Exp.</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {candidates.map(cand => (
                        <tr key={cand.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="px-6 py-4 text-white font-medium text-sm">{cand.first_name} {cand.last_name}</td>
                          <td className="px-6 py-4 text-white/60 text-sm">{cand.email}</td>
                          <td className="px-6 py-4 text-white/60 text-sm">{cand.phone}</td>
                          <td className="px-6 py-4 text-white/60 text-sm">{cand.source || '—'}</td>
                          <td className="px-6 py-4 text-center text-white/60 text-sm">{cand.experience_years || 0}y</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
