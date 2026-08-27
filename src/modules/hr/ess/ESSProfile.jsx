import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  User,
  Save,
  Loader,
  AlertCircle,
  CheckCircle,
  Camera,
  Shield,
  MapPin,
  Phone,
  Mail,
  CreditCard,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useHR } from "../context/HRContext";
import { employeeAPI, documentAPI } from "../services/hrAPI";
import {
  formatDate,
  calculateAge,
} from "../utils/helpers";

export const ESSProfile = () => {
  const navigate = useNavigate();
  const { loading, setLoadingState, error, setErrorState } = useHR();
  const [profile, setProfile] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [editing, setEditing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoadingState(true);
    try {
      // Get the current user's employee record
      const empRes = await employeeAPI.getEmployees();
      const employees = empRes.data?.results || empRes.data || [];
      if (employees.length > 0) {
        const detailRes = await employeeAPI.getEmployeeDetail(employees[0].id);
        setProfile(detailRes.data);
        setFormData(detailRes.data);

        // Get documents
        const docRes = await documentAPI.getDocuments(detailRes.data.id);
        setDocuments(docRes.data?.results || docRes.data || []);
      }
    } catch (err) {
      setErrorState(err.message);
    } finally {
      setLoadingState(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!profile) return;
    setLoadingState(true);
    setSaveSuccess(false);
    try {
      await employeeAPI.updateEmployee(profile.id, formData);
      setProfile(formData);
      setEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setErrorState(err.response?.data?.detail || err.message);
    } finally {
      setLoadingState(false);
    }
  };

  if (loading && !profile) {
    return (
      <div className="h-full flex items-center justify-center bg-black">
        <Loader className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  const SectionHeader = ({ icon: Icon, title }) => (
    <div className="flex items-center gap-2 mb-6">
      {Icon && <Icon size={20} className="text-blue-400" />}
      <h3 className="text-lg font-bold text-white">{title}</h3>
    </div>
  );

  const InfoRow = ({ label, value }) => (
    <div className="flex justify-between items-center py-3 border-b border-white/5 last:border-0">
      <span className="text-sm text-white/50">{label}</span>
      <span className="text-sm font-medium text-white">{value || "—"}</span>
    </div>
  );

  const InputField = ({ name, label, type = "text", required = false }) => (
    <div>
      <label className="block text-sm font-medium text-white/60 mb-1.5">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {type === "select" ? (
        <select
          name={name}
          value={formData[name] || ""}
          onChange={handleInputChange}
          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        >
          {name === "gender" && (
            <>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
            </>
          )}
          {name === "marital_status" && (
            <>
              <option value="SINGLE">Single</option>
              <option value="MARRIED">Married</option>
              <option value="DIVORCED">Divorced</option>
              <option value="WIDOWED">Widowed</option>
            </>
          )}
          {name === "blood_group" && (
            <>
              <option value="A_POSITIVE">A+</option>
              <option value="A_NEGATIVE">A-</option>
              <option value="B_POSITIVE">B+</option>
              <option value="B_NEGATIVE">B-</option>
              <option value="AB_POSITIVE">AB+</option>
              <option value="AB_NEGATIVE">AB-</option>
              <option value="O_POSITIVE">O+</option>
              <option value="O_NEGATIVE">O-</option>
            </>
          )}
        </select>
      ) : (
        <input
          type={type}
          name={name}
          value={formData[name] || ""}
          onChange={handleInputChange}
          readOnly={!editing}
          className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
            editing
              ? "bg-white/5 border-white/10 text-white"
              : "bg-transparent border-transparent text-white/70 cursor-default"
          }`}
        />
      )}
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-black">
      {/* Header */}
      <header className="px-10 py-8 flex justify-between items-end border-b border-white/5 shrink-0 bg-black/50 backdrop-blur-xl z-10 sticky top-0">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-white/40 hover:text-white mb-2 transition-colors text-sm">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2">
              <ArrowLeft size={16} /> Back to Dashboard
            </button>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <User size={28} className="text-blue-500" />
            My Profile
          </h1>
          <p className="text-sm text-white/40 font-medium">
            View and manage your personal & employment information
          </p>
        </div>
        <div className="flex gap-3">
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="px-5 py-2.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl hover:bg-blue-500/20 transition-all font-medium text-sm"
            >
              Edit Profile
            </button>
          ) : (
            <>
              <button
                onClick={() => {
                  setFormData(profile);
                  setEditing(false);
                }}
                className="px-5 py-2.5 bg-white/5 border border-white/10 text-white/60 rounded-xl hover:bg-white/10 transition-all font-medium text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all font-medium text-sm flex items-center gap-2 shadow-lg shadow-blue-500/20"
              >
                {loading ? <Loader size={16} className="animate-spin" /> : <Save size={16} />}
                Save Changes
              </button>
            </>
          )}
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-10 py-8 custom-scrollbar">
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {saveSuccess && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <p className="text-green-400 text-sm">Profile updated successfully!</p>
          </div>
        )}

        {profile && (
          <div className="max-w-5xl mx-auto space-y-8">
            {/* Profile Header */}
            <div className="p-8 rounded-2xl bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-500/20">
              <div className="flex items-start gap-8">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center text-white text-3xl font-bold">
                    {profile.first_name?.[0]}{profile.last_name?.[0]}
                  </div>
                  {editing && (
                    <button className="absolute -bottom-1 -right-1 bg-blue-600 p-2 rounded-full text-white hover:bg-blue-500 transition-colors">
                      <Camera size={14} />
                    </button>
                  )}
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-white mb-1">{profile.full_name}</h2>
                  <p className="text-sm text-white/50 mb-2">
                    {profile.designation_name} • {profile.department_name}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-white/40">
                    <span className="font-mono">{profile.employee_id}</span>
                    <span>•</span>
                    <span>Joined {formatDate(profile.date_of_joining)}</span>
                    <span>•</span>
                    <span>{calculateAge(profile.date_of_birth)} years</span>
                  </div>
                </div>
                <div>
                  <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${profile.status === 'ACTIVE' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-orange-500/10 text-orange-400 border-orange-500/20'}`}>
                    {profile.status?.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>
            </div>

            {/* Personal Information */}
            <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/5">
              <SectionHeader icon={User} title="Personal Information" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <InputField name="first_name" label="First Name" required />
                <InputField name="middle_name" label="Middle Name" />
                <InputField name="last_name" label="Last Name" required />
                <InputField name="date_of_birth" label="Date of Birth" type="date" />
                <InputField name="gender" label="Gender" type="select" />
                <InputField name="blood_group" label="Blood Group" type="select" />
                <InputField name="marital_status" label="Marital Status" type="select" />
                <InputField name="nationality" label="Nationality" />
              </div>
            </div>

            {/* Contact Details */}
            <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/5">
              <SectionHeader icon={Phone} title="Contact Details" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-1.5">Personal Email</label>
                  <div className="flex items-center gap-2 text-white font-medium">
                    <Mail size={16} className="text-blue-400" />
                    {profile.personal_email}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-1.5">Mobile Number</label>
                  <div className="flex items-center gap-2 text-white font-medium">
                    <Phone size={16} className="text-green-400" />
                    {profile.personal_mobile}
                  </div>
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/5">
              <SectionHeader icon={MapPin} title="Addresses" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-sm font-bold text-white/70 mb-3 uppercase tracking-wider">Current Address</h4>
                  <p className="text-sm text-white/60 leading-relaxed">
                    {profile.current_address}<br />
                    {profile.current_city}, {profile.current_state}<br />
                    {profile.current_country} - {profile.current_pin_code}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white/70 mb-3 uppercase tracking-wider">Permanent Address</h4>
                  <p className="text-sm text-white/60 leading-relaxed">
                    {profile.permanent_address}<br />
                    {profile.permanent_city}, {profile.permanent_state}<br />
                    {profile.permanent_country} - {profile.permanent_pin_code}
                  </p>
                </div>
              </div>
            </div>

            {/* Identity Documents */}
            <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/5">
              <SectionHeader icon={Shield} title="Identity Documents" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <InfoRow label="Aadhaar" value={profile.aadhaar_number ? `****${profile.aadhaar_number.slice(-4)}` : "—"} />
                <InfoRow label="PAN" value={profile.pan_number || "—"} />
                <InfoRow label="Passport" value={profile.passport_number || "—"} />
              </div>
            </div>

            {/* Bank Details */}
            <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/5">
              <SectionHeader icon={CreditCard} title="Bank Details" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <InfoRow label="Account Number" value={profile.bank_account_number ? `XXXX${profile.bank_account_number.slice(-4)}` : "—"} />
                <InfoRow label="Bank Name" value={profile.bank_name || "—"} />
                <InfoRow label="IFSC Code" value={profile.ifsc_code || "—"} />
              </div>
            </div>

            {/* Employment Info */}
            <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/5">
              <SectionHeader icon={Users} title="Employment Information" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <InfoRow label="Department" value={profile.department_name || "—"} />
                <InfoRow label="Designation" value={profile.designation_name || "—"} />
                <InfoRow label="Employment Type" value={profile.employment_type || "—"} />
                <InfoRow label="Date of Joining" value={formatDate(profile.date_of_joining)} />
                <InfoRow label="Work Location" value={profile.location_name || "—"} />
                <InfoRow label="Reporting Manager" value={profile.reporting_manager_name || "—"} />
              </div>
            </div>

            {/* Documents */}
            {documents.length > 0 && (
              <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/5">
                <SectionHeader icon={Shield} title="Uploaded Documents" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {documents.map((doc) => (
                    <div key={doc.id} className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-white">{doc.document_type?.replace(/_/g, ' ')}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${doc.is_verified ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                          {doc.is_verified ? 'Verified' : 'Pending'}
                        </span>
                      </div>
                      {doc.document_number && (
                        <p className="text-xs text-white/40">{doc.document_number}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ESSProfile;
