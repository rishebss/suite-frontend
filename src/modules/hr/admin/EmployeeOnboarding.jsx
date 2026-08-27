import React, { useState, useEffect } from 'react';
import { UserPlus, Save, ChevronLeft, Building, Briefcase, FileText, CreditCard, Shield, MapPin, Phone, Edit } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

export default function EmployeeOnboarding() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [step, setStep] = useState(1);
  const [errorMsg, setErrorMsg] = useState(null);

  const [formData, setFormData] = useState({
    // Basic Info
    first_name: '',
    middle_name: '',
    last_name: '',
    date_of_birth: '',
    gender: 'MALE',
    nationality: 'Indian',
    marital_status: 'SINGLE',
    blood_group: 'O_POSITIVE',
    
    // Contact
    personal_email: '',
    personal_mobile: '',
    
    // Address (Current)
    current_address: '',
    current_city: '',
    current_state: '',
    current_country: 'India',
    current_pin_code: '',
    
    // Address (Permanent)
    permanent_address: '',
    permanent_city: '',
    permanent_state: '',
    permanent_country: 'India',
    permanent_pin_code: '',

    // Identity
    aadhaar_number: '',
    pan_number: '',
    
    // Bank
    bank_account_number: '',
    ifsc_code: '',
    bank_name: '',
    
    // Employment
    employee_id: '',
    employment_type: 'PERMANENT',
    date_of_joining: '',
    status: 'ONBOARDING',
    department: '',
    designation: '',
    work_location: '',
    work_shift: 'GENERAL',
    notice_period_days: 30
  });

  const [metadata, setMetadata] = useState({
    departments: [],
    designations: [],
    locations: []
  });

  useEffect(() => {
    if (!id) return;
    const fetchEmployee = async () => {
      try {
        const res = await axios.get(`/api/hr/employees/${id}/`);
        const emp = res.data;
        setFormData({
          first_name: emp.first_name || '',
          middle_name: emp.middle_name || '',
          last_name: emp.last_name || '',
          date_of_birth: emp.date_of_birth || '',
          gender: emp.gender || 'MALE',
          nationality: emp.nationality || 'Indian',
          marital_status: emp.marital_status || 'SINGLE',
          blood_group: ({'O+':'O_POSITIVE','O-':'O_NEGATIVE','A+':'A_POSITIVE','A-':'A_NEGATIVE','B+':'B_POSITIVE','B-':'B_NEGATIVE','AB+':'AB_POSITIVE','AB-':'AB_NEGATIVE'})[emp.blood_group] || emp.blood_group || 'O_POSITIVE',
          personal_email: emp.personal_email || '',
          personal_mobile: emp.personal_mobile || '',
          current_address: emp.current_address || '',
          current_city: emp.current_city || '',
          current_state: emp.current_state || '',
          current_country: emp.current_country || 'India',
          current_pin_code: emp.current_pin_code || '',
          permanent_address: emp.permanent_address || '',
          permanent_city: emp.permanent_city || '',
          permanent_state: emp.permanent_state || '',
          permanent_country: emp.permanent_country || 'India',
          permanent_pin_code: emp.permanent_pin_code || '',
          aadhaar_number: emp.aadhaar_number || '',
          pan_number: emp.pan_number || '',
          bank_account_number: emp.bank_account_number || '',
          ifsc_code: emp.ifsc_code || '',
          bank_name: emp.bank_name || '',
          employee_id: emp.employee_id || '',
          employment_type: emp.employment_type || 'PERMANENT',
          date_of_joining: emp.date_of_joining || '',
          status: emp.status || 'ONBOARDING',
          department: emp.department || '',
          designation: emp.designation || '',
          work_location: emp.work_location || '',
          work_shift: emp.work_shift || 'GENERAL',
          notice_period_days: emp.notice_period_days || 30,
        });
      } catch (err) {
        console.error(err);
        setErrorMsg('Failed to load employee data');
      } finally {
        setFetching(false);
      }
    };
    fetchEmployee();
  }, [id]);

  useEffect(() => {
    // Fetch departments, designations, locations
    const fetchMeta = async () => {
      try {
        const [depRes, desRes, locRes] = await Promise.all([
          axios.get('/api/auth/departments/').catch(() => ({data: []})),
          axios.get('/api/hr/designations/').catch(() => ({data: []})),
          axios.get('/api/hr/work-locations/').catch(() => ({data: []}))
        ]);
        setMetadata({
          departments: depRes.data.results || depRes.data || [],
          designations: desRes.data.results || desRes.data || [],
          locations: locRes.data.results || locRes.data || []
        });
      } catch (err) {
        console.error("Meta fetch error", err);
      }
    };
    fetchMeta();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (step < 4) {
      setStep(step + 1);
      return;
    }
    
    setLoading(true);
    setErrorMsg(null);
    try {
      // Clean up empty strings for nullable unique fields
      const payload = { ...formData };
      if (!payload.aadhaar_number) delete payload.aadhaar_number;
      if (!payload.pan_number) delete payload.pan_number;
      if (!payload.department) delete payload.department;
      if (!payload.designation) delete payload.designation;
      if (!payload.work_location) delete payload.work_location;

      if (isEdit) {
        await axios.patch(`/api/hr/employees/${id}/`, payload);
      } else {
        await axios.post('/api/hr/employees/', payload);
      }
      navigate(isEdit ? `/hr/admin/employees/${id}` : '/hr/admin/employees');
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data ? JSON.stringify(err.response.data) : 'Failed to onboard employee. Please check all fields.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-black">
      <header className="px-10 py-8 flex justify-between items-end border-b border-white/5 shrink-0 bg-black/50 backdrop-blur-xl z-10 sticky top-0">
        <div className="space-y-1">
          <button onClick={() => navigate('/hr/admin/employees')} className="flex items-center gap-2 text-white/40 hover:text-white mb-4 transition-colors text-sm">
            <ChevronLeft size={16} /> Back to Directory
          </button>
          <h1 className="text-4xl font-bold tracking-tight text-white flex items-center gap-3">
            {isEdit ? <Edit size={32} className="text-blue-500" /> : <UserPlus size={32} className="text-blue-500" />}
            {isEdit ? 'Edit Employee' : 'Comprehensive Onboarding'}
          </h1>
          <p className="text-sm text-white/40 font-medium">{isEdit ? `Editing ${formData.first_name} ${formData.last_name}` : `Step ${step} of 4: Create a full employee master record.`}</p>
        </div>
        
        {/* Progress Tracker */}
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4].map(num => (
            <div key={num} className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border ${step === num ? 'bg-blue-500 text-white border-blue-500' : step > num ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-white/5 text-white/40 border-white/10'}`}>
              {num}
            </div>
          ))}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-10 py-8 custom-scrollbar">
        {fetching ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent" />
          </div>
        ) : (
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-8">
          {errorMsg && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl">
              {errorMsg}
            </div>
          )}

          {/* STEP 1: Personal & Contact */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/5">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <FileText size={20} className="text-blue-400" /> Personal Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-white/60 mb-2">First Name *</label>
                    <input required name="first_name" value={formData.first_name} onChange={handleChange} className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/60 mb-2">Middle Name</label>
                    <input name="middle_name" value={formData.middle_name} onChange={handleChange} className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/60 mb-2">Last Name *</label>
                    <input required name="last_name" value={formData.last_name} onChange={handleChange} className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/60 mb-2">Date of Birth *</label>
                    <input required type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange} className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white [color-scheme:dark]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/60 mb-2">Gender *</label>
                    <select required name="gender" value={formData.gender} onChange={handleChange} className="w-full px-4 py-2 bg-[#1a1a1a] border border-white/10 rounded-lg text-white">
                      <option value="MALE">Male</option><option value="FEMALE">Female</option><option value="OTHER">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/60 mb-2">Blood Group</label>
                    <select name="blood_group" value={formData.blood_group} onChange={handleChange} className="w-full px-4 py-2 bg-[#1a1a1a] border border-white/10 rounded-lg text-white">
                      <option value="O_POSITIVE">O+</option><option value="O_NEGATIVE">O-</option><option value="A_POSITIVE">A+</option><option value="A_NEGATIVE">A-</option>
                      <option value="B_POSITIVE">B+</option><option value="B_NEGATIVE">B-</option><option value="AB_POSITIVE">AB+</option><option value="AB_NEGATIVE">AB-</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/5">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <Phone size={20} className="text-green-400" /> Contact Info
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-white/60 mb-2">Personal Email *</label>
                    <input required type="email" name="personal_email" value={formData.personal_email} onChange={handleChange} className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/60 mb-2">Mobile Number *</label>
                    <input required name="personal_mobile" value={formData.personal_mobile} onChange={handleChange} className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Address */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/5">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <MapPin size={20} className="text-yellow-400" /> Current Address
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-white/60 mb-2">Street Address *</label>
                    <input required name="current_address" value={formData.current_address} onChange={handleChange} className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/60 mb-2">City *</label>
                    <input required name="current_city" value={formData.current_city} onChange={handleChange} className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/60 mb-2">State *</label>
                    <input required name="current_state" value={formData.current_state} onChange={handleChange} className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/60 mb-2">PIN Code *</label>
                    <input required name="current_pin_code" value={formData.current_pin_code} onChange={handleChange} className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white" />
                  </div>
                </div>
              </div>
              <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/5">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <MapPin size={20} className="text-orange-400" /> Permanent Address
                  </h2>
                  <button type="button" onClick={() => setFormData({...formData, permanent_address: formData.current_address, permanent_city: formData.current_city, permanent_state: formData.current_state, permanent_pin_code: formData.current_pin_code})} className="text-xs bg-white/10 px-3 py-1 rounded text-white/70 hover:bg-white/20">Same as Current</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-white/60 mb-2">Street Address *</label>
                    <input required name="permanent_address" value={formData.permanent_address} onChange={handleChange} className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/60 mb-2">City *</label>
                    <input required name="permanent_city" value={formData.permanent_city} onChange={handleChange} className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/60 mb-2">State *</label>
                    <input required name="permanent_state" value={formData.permanent_state} onChange={handleChange} className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/60 mb-2">PIN Code *</label>
                    <input required name="permanent_pin_code" value={formData.permanent_pin_code} onChange={handleChange} className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Identity & Bank */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/5">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <Shield size={20} className="text-red-400" /> Identity Documents
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-white/60 mb-2">Aadhaar Number (12 digits)</label>
                    <input name="aadhaar_number" value={formData.aadhaar_number} onChange={handleChange} className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/60 mb-2">PAN Number</label>
                    <input name="pan_number" value={formData.pan_number} onChange={handleChange} className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white uppercase" />
                  </div>
                </div>
              </div>
              <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/5">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <CreditCard size={20} className="text-purple-400" /> Bank Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-white/60 mb-2">Account Number</label>
                    <input name="bank_account_number" value={formData.bank_account_number} onChange={handleChange} className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/60 mb-2">IFSC Code</label>
                    <input name="ifsc_code" value={formData.ifsc_code} onChange={handleChange} className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white uppercase" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-white/60 mb-2">Bank Name</label>
                    <input name="bank_name" value={formData.bank_name} onChange={handleChange} className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Employment */}
          {step === 4 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/5">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <Briefcase size={20} className="text-blue-400" /> Employment Data
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-white/60 mb-2">Employee ID *</label>
                    <input required name="employee_id" value={formData.employee_id} onChange={handleChange} className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white" placeholder="EMP-2026-001" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/60 mb-2">Date of Joining *</label>
                    <input required type="date" name="date_of_joining" value={formData.date_of_joining} onChange={handleChange} className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white [color-scheme:dark]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/60 mb-2">Employment Type *</label>
                    <select required name="employment_type" value={formData.employment_type} onChange={handleChange} className="w-full px-4 py-2 bg-[#1a1a1a] border border-white/10 rounded-lg text-white">
                      <option value="PERMANENT">Permanent</option><option value="CONTRACT">Contract</option><option value="TRAINEE">Trainee</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/60 mb-2">Department</label>
                    <select name="department" value={formData.department} onChange={handleChange} className="w-full px-4 py-2 bg-[#1a1a1a] border border-white/10 rounded-lg text-white">
                      <option value="">Select Department...</option>
                      {metadata.departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/60 mb-2">Designation</label>
                    <select name="designation" value={formData.designation} onChange={handleChange} className="w-full px-4 py-2 bg-[#1a1a1a] border border-white/10 rounded-lg text-white">
                      <option value="">Select Designation...</option>
                      {metadata.designations.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/60 mb-2">Work Location</label>
                    <select name="work_location" value={formData.work_location} onChange={handleChange} className="w-full px-4 py-2 bg-[#1a1a1a] border border-white/10 rounded-lg text-white">
                      <option value="">Select Location...</option>
                      {metadata.locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center pt-6 border-t border-white/5">
            {step > 1 ? (
              <button type="button" onClick={() => setStep(step - 1)} className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-white font-medium hover:bg-white/10 transition-colors">
                Back
              </button>
            ) : (
              <div></div> // Spacer
            )}
            
            <button type="submit" disabled={loading || fetching} className="px-8 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl text-white font-bold transition-colors shadow-lg shadow-blue-500/20 flex items-center gap-2">
              {loading ? 'Saving...' : fetching ? 'Loading...' : isEdit ? <><Save size={20} /> Save Changes</> : step === 4 ? <><Save size={20} /> Finish Onboarding</> : 'Next Step'}
            </button>
          </div>
        </form>
        )}
      </div>
    </div>
  );
}
