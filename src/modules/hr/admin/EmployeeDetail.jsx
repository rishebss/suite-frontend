import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  User,
  ChevronLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  Shield,
  CreditCard,
  FileText,
  Edit,
  CheckCircle,
  XCircle,
  Loader,
  AlertCircle,
  Download,
  Clock,
  Users,
  Upload,
  X,
} from "lucide-react";
import { employeeAPI, documentAPI } from "../services/hrAPI";
import { formatDate, calculateAge } from "../utils/helpers";

export default function EmployeeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("profile");
  const [confirmingProbation, setConfirmingProbation] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadDocType, setUploadDocType] = useState("OTHER");
  const [uploading, setUploading] = useState(false);

  const DOCUMENT_TYPE_OPTIONS = [
    { value: "OFFER_LETTER", label: "Offer Letter" },
    { value: "APPOINTMENT_LETTER", label: "Appointment Letter" },
    { value: "10TH_CERTIFICATE", label: "10th Certificate" },
    { value: "12TH_CERTIFICATE", label: "12th Certificate" },
    { value: "UG_CERTIFICATE", label: "UG Certificate" },
    { value: "PG_CERTIFICATE", label: "PG Certificate" },
    { value: "PROFESSIONAL_CERT", label: "Professional Certificate" },
    { value: "EXPERIENCE_CERT", label: "Experience Certificate" },
    { value: "BGV_DOCUMENT", label: "BGV Document" },
    { value: "AADHAAR", label: "Aadhaar" },
    { value: "PAN", label: "PAN" },
    { value: "PASSPORT", label: "Passport" },
    { value: "VOTER_ID", label: "Voter ID" },
    { value: "DRIVING_LICENSE", label: "Driving License" },
    { value: "BANK_DETAILS", label: "Bank Details" },
    { value: "OTHER", label: "Other" },
  ];

  useEffect(() => {
    if (id) fetchEmployee();
  }, [id]);

  const fetchEmployee = async () => {
    setLoading(true);
    try {
      const res = await employeeAPI.getEmployeeDetail(id);
      setEmployee(res.data);

      const docRes = await documentAPI.getDocuments(id);
      setDocuments(docRes.data?.results || docRes.data || []);
    } catch (err) {
      setErrorMsg("Failed to load employee details");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmProbation = async () => {
    setConfirmingProbation(true);
    try {
      await employeeAPI.confirmProbation(id);
      fetchEmployee();
    } catch (err) {
      setErrorMsg("Failed to confirm probation");
    } finally {
      setConfirmingProbation(false);
    }
  };

  const handleUploadDocument = async () => {
    if (!uploadFile) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("employee", id);
      formData.append("document_type", uploadDocType);
      formData.append("document_file", uploadFile);
      await documentAPI.uploadDocument(formData);
      setShowUploadModal(false);
      setUploadFile(null);
      setUploadDocType("OTHER");
      const docRes = await documentAPI.getDocuments(id);
      setDocuments(docRes.data?.results || docRes.data || []);
    } catch (err) {
      setErrorMsg(err.response?.data?.detail || Object.values(err.response?.data || {}).flat().join(", ") || "Failed to upload document");
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleVerifyDocument = async (docId) => {
    try {
      await documentAPI.verifyDocument(docId);
      setDocuments((prev) =>
        prev.map((d) => (d.id === docId ? { ...d, is_verified: true } : d))
      );
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-black">
        <Loader size={24} className="text-blue-500 animate-spin" />
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="h-full flex flex-col bg-black items-center justify-center">
        <AlertCircle size={48} className="text-red-400 mb-4" />
        <p className="text-white/60">Employee not found</p>
        <button onClick={() => navigate('/hr/admin/employees')} className="mt-4 text-blue-400 hover:text-blue-300">← Back to Directory</button>
      </div>
    );
  }

  const InfoSection = ({ title, children }) => (
    <div className="p-6 rounded-xl bg-white/[0.02] border border-white/5">
      <h3 className="text-sm font-bold text-white/70 uppercase tracking-wider mb-4">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {children}
      </div>
    </div>
  );

  const InfoItem = ({ label, value }) => (
    <div>
      <p className="text-xs text-white/40 mb-1">{label}</p>
      <p className="text-sm font-medium text-white">{value || "—"}</p>
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-black">
      {/* Header */}
      <header className="px-10 py-6 flex justify-between items-center border-b border-white/5 shrink-0 bg-black/50 backdrop-blur-xl z-10 sticky top-0">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/hr/admin/employees')} className="text-white/40 hover:text-white transition-colors">
            <ChevronLeft size={20} />
          </button>
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
            {employee.first_name?.[0]}{employee.last_name?.[0]}
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">{employee.full_name}</h1>
            <p className="text-sm text-white/40">{employee.designation_name} · {employee.employee_id}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
            employee.status === 'ACTIVE' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
            employee.status === 'ONBOARDING' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
            employee.status === 'NOTICE_PERIOD' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
            'bg-red-500/10 text-red-400 border-red-500/20'
          }`}>{employee.status?.replace(/_/g, ' ')}</span>
          <button onClick={() => navigate(`/hr/admin/employees/${id}/edit`)} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/40 hover:text-white">
            <Edit size={18} />
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-10 py-6 custom-scrollbar">
        {errorMsg && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">{errorMsg}</div>
        )}

        {/* Tab Navigation */}
        <div className="flex gap-1 mb-6 p-1 rounded-xl bg-white/[0.03] border border-white/5 w-fit">
          {[
            { id: "profile", label: "Profile", icon: User },
            { id: "documents", label: "Documents", icon: FileText },
            { id: "employment", label: "Employment", icon: Briefcase },
          ].map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                activeTab === tab.id ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" : "text-white/50 hover:text-white hover:bg-white/5"
              }`}>
              <tab.icon size={16} />{tab.label}
            </button>
          ))}
        </div>

        {activeTab === "profile" && (
          <div className="max-w-4xl space-y-6">
            {/* Quick Info */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-center">
                <Calendar size={18} className="text-blue-400 mx-auto mb-2" />
                <p className="text-lg font-bold text-white">{calculateAge(employee.date_of_birth)}</p>
                <p className="text-xs text-white/40">Years Old</p>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-center">
                <Clock size={18} className="text-green-400 mx-auto mb-2" />
                <p className="text-lg font-bold text-white">{employee.date_of_joining ? Math.floor((new Date() - new Date(employee.date_of_joining)) / (365.25 * 24 * 60 * 60 * 1000)) : 0}</p>
                <p className="text-xs text-white/40">Years Served</p>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-center">
                <Briefcase size={18} className="text-orange-400 mx-auto mb-2" />
                <p className="text-lg font-bold text-white">{employee.employment_type || "—"}</p>
                <p className="text-xs text-white/40">Employment Type</p>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-center">
                <Users size={18} className="text-purple-400 mx-auto mb-2" />
                <p className="text-sm font-bold text-white truncate">{employee.department_name || "—"}</p>
                <p className="text-xs text-white/40">Department</p>
              </div>
            </div>

            <InfoSection title="Personal Information">
              <InfoItem label="Full Name" value={employee.full_name} />
              <InfoItem label="Date of Birth" value={formatDate(employee.date_of_birth)} />
              <InfoItem label="Gender" value={employee.gender} />
              <InfoItem label="Blood Group" value={employee.blood_group?.replace(/_/g, ' ')} />
              <InfoItem label="Marital Status" value={employee.marital_status} />
              <InfoItem label="Nationality" value={employee.nationality} />
            </InfoSection>

            <InfoSection title="Contact">
              <InfoItem label="Email" value={employee.personal_email} />
              <InfoItem label="Mobile" value={employee.personal_mobile} />
            </InfoSection>

            <InfoSection title="Addresses">
              <div>
                <p className="text-xs text-white/40 mb-1">Current Address</p>
                <p className="text-sm text-white">{employee.current_address}, {employee.current_city}, {employee.current_state} - {employee.current_pin_code}</p>
              </div>
              <div>
                <p className="text-xs text-white/40 mb-1">Permanent Address</p>
                <p className="text-sm text-white">{employee.permanent_address}, {employee.permanent_city}, {employee.permanent_state} - {employee.permanent_pin_code}</p>
              </div>
            </InfoSection>

            <InfoSection title="Identity Documents">
              <InfoItem label="Aadhaar" value={employee.aadhaar_number ? `XXXX${employee.aadhaar_number.slice(-4)}` : "—"} />
              <InfoItem label="PAN" value={employee.pan_number || "—"} />
              <InfoItem label="Passport" value={employee.passport_number || "—"} />
              <InfoItem label="Driving License" value={employee.driving_license_number || "—"} />
            </InfoSection>

            <InfoSection title="Bank Details">
              <InfoItem label="Account Number" value={employee.bank_account_number ? `XXXX${employee.bank_account_number.slice(-4)}` : "—"} />
              <InfoItem label="Bank Name" value={employee.bank_name || "—"} />
              <InfoItem label="IFSC Code" value={employee.ifsc_code || "—"} />
              <InfoItem label="Account Holder" value={employee.account_holder_name || "—"} />
            </InfoSection>
          </div>
        )}

        {activeTab === "documents" && (
          <div className="max-w-4xl space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-white">Uploaded Documents ({documents.length})</h3>
              <button onClick={() => setShowUploadModal(true)} className="px-4 py-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-lg text-sm font-medium hover:bg-blue-500/20 transition-colors flex items-center gap-2">
                <Upload size={14} /> Upload Document
              </button>
            </div>
            {documents.length === 0 ? (
              <div className="p-8 rounded-xl border border-dashed border-white/10 text-center">
                <FileText size={32} className="text-white/20 mx-auto mb-3" />
                <p className="text-white/40 text-sm">No documents uploaded yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {documents.map((doc) => (
                  <div key={doc.id} className="p-4 rounded-xl bg-white/[0.02] border border-white/10 hover:border-white/20 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <FileText size={20} className="text-blue-400" />
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        doc.is_verified ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'
                      }`}>
                        {doc.is_verified ? 'Verified' : 'Pending'}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-white mb-1">{doc.document_type?.replace(/_/g, ' ')}</p>
                    {doc.document_number && <p className="text-xs text-white/40 mb-2">No: {doc.document_number}</p>}
                    <div className="flex gap-2 mt-3">
                      <button onClick={() => documentAPI.downloadDocument(doc.id)}
                        className="flex-1 px-3 py-1.5 bg-white/5 text-white/60 rounded-lg text-xs hover:bg-white/10 transition-colors">
                        <Download size={12} className="inline mr-1" /> Download
                      </button>
                      {!doc.is_verified && (
                        <button onClick={() => handleVerifyDocument(doc.id)}
                          className="flex-1 px-3 py-1.5 bg-green-500/10 text-green-400 rounded-lg text-xs hover:bg-green-500/20 transition-colors">
                          <CheckCircle size={12} className="inline mr-1" /> Verify
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "employment" && (
          <div className="max-w-4xl space-y-6">
            <InfoSection title="Employment Details">
              <InfoItem label="Employee ID" value={employee.employee_id} />
              <InfoItem label="Employment Type" value={employee.employment_type} />
              <InfoItem label="Date of Joining" value={formatDate(employee.date_of_joining)} />
              <InfoItem label="Probation End" value={formatDate(employee.probation_end_date)} />
              <InfoItem label="Confirmation Date" value={formatDate(employee.confirmation_date)} />
              <InfoItem label="Notice Period" value={`${employee.notice_period_days} days`} />
            </InfoSection>

            <InfoSection title="Organization">
              <InfoItem label="Department" value={employee.department_name} />
              <InfoItem label="Designation" value={employee.designation_name} />
              <InfoItem label="Work Location" value={employee.location_name} />
              <InfoItem label="Grade" value={employee.grade} />
              <InfoItem label="Band" value={employee.band} />
              <InfoItem label="Reporting Manager" value={employee.reporting_manager_name} />
              <InfoItem label="Work Shift" value={employee.work_shift} />
            </InfoSection>

            {/* Actions */}
            <div className="p-6 rounded-xl bg-gradient-to-br from-blue-500/5 to-transparent border border-blue-500/10">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Actions</h3>
              <div className="flex flex-wrap gap-3">
                {employee.status === 'ONBOARDING' && (
                  <button onClick={handleConfirmProbation} disabled={confirmingProbation}
                    className="px-4 py-2 bg-green-500/10 border border-green-500/20 text-green-400 rounded-lg text-sm font-medium hover:bg-green-500/20 transition-colors flex items-center gap-2">
                    {confirmingProbation ? <Loader size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                    {confirmingProbation ? 'Confirming...' : 'Confirm Probation'}
                  </button>
                )}
                <button onClick={() => navigate(`/hr/admin/employees/${id}/edit`)} className="px-4 py-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-lg text-sm font-medium hover:bg-blue-500/20 transition-colors flex items-center gap-2">
                  <Edit size={14} /> Edit Employee
                </button>
                <button onClick={() => navigate(`/hr/admin/payroll/revisions?employee=${id}`)} className="px-4 py-2 bg-orange-500/10 border border-orange-500/20 text-orange-400 rounded-lg text-sm font-medium hover:bg-orange-500/20 transition-colors flex items-center gap-2">
                  <Briefcase size={14} /> Assign Salary
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Upload Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="bg-zinc-900 border border-white/10 rounded-xl p-6 w-full max-w-md mx-4">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-white">Upload Document</h3>
                <button onClick={() => { setShowUploadModal(false); setUploadFile(null); }} className="text-white/40 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-white/60 mb-2">Document Type</label>
                  <select value={uploadDocType} onChange={(e) => setUploadDocType(e.target.value)}
                    className="w-full px-3 py-2 bg-black border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500/50">
                    {DOCUMENT_TYPE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-2">File</label>
                  <input type="file" onChange={(e) => setUploadFile(e.target.files[0])}
                    className="w-full text-sm text-white/60 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-500/10 file:text-blue-400 hover:file:bg-blue-500/20 file:cursor-pointer cursor-pointer" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={() => { setShowUploadModal(false); setUploadFile(null); }}
                    className="flex-1 px-4 py-2 bg-white/5 text-white/60 rounded-lg text-sm font-medium hover:bg-white/10 transition-colors">
                    Cancel
                  </button>
                  <button onClick={handleUploadDocument} disabled={!uploadFile || uploading}
                    className="flex-1 px-4 py-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-lg text-sm font-medium hover:bg-blue-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                    {uploading ? <Loader size={14} className="animate-spin" /> : <Upload size={14} />}
                    {uploading ? "Uploading..." : "Upload"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
