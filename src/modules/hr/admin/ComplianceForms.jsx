import React, { useEffect, useState, useCallback } from "react";
import {
  FileText,
  ChevronLeft,
  Loader,
  Shield,
  CheckCircle2,
  XCircle,
  Upload,
  ExternalLink,
  Plus,
  Search,
  Filter,
  Download,
  Edit3,
  Clock,
  Globe,
  Briefcase,
  DollarSign,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { statutoryFormsAPI, employeeAPI } from "../services/hrAPI";
import { formatDate } from "../utils/helpers";

const TABS = [
  { id: "pf-forms", label: "PF Forms", icon: FileText, desc: "Form 2, 10C, 10D, 19, 31" },
  { id: "esi-cards", label: "ESI Cards", icon: Shield, desc: "IP Number & Card Management" },
  { id: "form-15gh", label: "Form 15G/15H", icon: Download, desc: "Lower Deduction Certificates" },
  { id: "vpf", label: "VPF", icon: DollarSign, desc: "Voluntary PF Contributions" },
  { id: "pt-enroll", label: "PT Enrollments", icon: Briefcase, desc: "Professional Tax Enrollment" },
  { id: "form-12ba", label: "Form 12BA", icon: FileText, desc: "Perquisite Statement" },
  { id: "form-24q", label: "Form 24Q", icon: Clock, desc: "TDS Quarterly Returns" },
  { id: "iw", label: "Intl. Workers", icon: Globe, desc: "International Workers PF" },
];

const StatutoryFormsDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("pf-forms");
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState([]);

  // Data states
  const [pfStatements, setPFStatements] = useState([]);
  const [esiCards, setESICards] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [vpfContributions, setVPFContributions] = useState([]);
  const [ptEnrollments, setPTEnrollments] = useState([]);
  const [form12ba, setForm12BA] = useState([]);
  const [form24q, setForm24Q] = useState([]);
  const [intlWorkers, setIntlWorkers] = useState([]);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [formData, setFormData] = useState({});

  // Filter state
  const [searchTerm, setSearchTerm] = useState("");

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [
        pfRes, esiRes, certRes, vpfRes, ptRes,
        f12baRes, f24qRes, iwRes, empRes
      ] = await Promise.all([
        statutoryFormsAPI.getPFStatements().catch(() => ({ data: [] })),
        statutoryFormsAPI.getESICards().catch(() => ({ data: [] })),
        statutoryFormsAPI.getCertificates().catch(() => ({ data: [] })),
        statutoryFormsAPI.getVPFContributions().catch(() => ({ data: [] })),
        statutoryFormsAPI.getPTEnrollments().catch(() => ({ data: [] })),
        statutoryFormsAPI.getForm12BA().catch(() => ({ data: [] })),
        statutoryFormsAPI.getForm24QReturns().catch(() => ({ data: [] })),
        statutoryFormsAPI.getInternationalWorkers().catch(() => ({ data: [] })),
        employeeAPI.getEmployees({ status: "ACTIVE" }).catch(() => ({ data: [] })),
      ].map((p) => p.then((r) => ({ data: r.data?.results || r.data || [] })).catch((e) => ({ data: [] }))));

      // Handle API response format differences
      const extractData = (res) => {
        if (Array.isArray(res.data)) return res.data;
        if (res.data?.results) return res.data.results;
        return [];
      };

      setPFStatements(extractData(pfRes));
      setESICards(extractData(esiRes));
      setCertificates(extractData(certRes));
      setVPFContributions(extractData(vpfRes));
      setPTEnrollments(extractData(ptRes));
      setForm12BA(extractData(f12baRes));
      setForm24Q(extractData(f24qRes));
      setIntlWorkers(extractData(iwRes));
      setEmployees(Array.isArray(empRes?.data) ? empRes.data : empRes?.data?.results || []);
    } catch (err) {
      console.error("Failed to load forms data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Modal handlers
  const openModal = (type, item = null) => {
    setModalType(type);
    setEditItem(item);
    setFormData(item || {});
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      if (modalType === "pf-forms") {
        if (editItem) {
          const fd = new FormData();
          Object.entries(formData).forEach(([k, v]) => fd.append(k, v));
          await statutoryFormsAPI.updatePFStatement(editItem.id, fd);
        } else {
          const fd = new FormData();
          Object.entries(formData).forEach(([k, v]) => fd.append(k, v));
          await statutoryFormsAPI.createPFStatement(fd);
        }
      } else if (modalType === "esi-cards") {
        if (editItem) await statutoryFormsAPI.updateESICard(editItem.id, formData);
        else await statutoryFormsAPI.createESICard(formData);
      } else if (modalType === "form-15gh") {
        if (editItem) await statutoryFormsAPI.updateCertificate(editItem.id, formData);
        else await statutoryFormsAPI.createCertificate(formData);
      } else if (modalType === "vpf") {
        if (editItem) await statutoryFormsAPI.updateVPFContribution(editItem.id, formData);
        else await statutoryFormsAPI.createVPFContribution(formData);
      } else if (modalType === "pt-enroll") {
        if (editItem) await statutoryFormsAPI.updatePTEnrollment(editItem.id, formData);
        else await statutoryFormsAPI.createPTEnrollment(formData);
      } else if (modalType === "form-12ba") {
        if (editItem) await statutoryFormsAPI.updateForm12BAEntry(editItem.id, formData);
        else await statutoryFormsAPI.createForm12BAEntry(formData);
      } else if (modalType === "form-24q") {
        if (editItem) await statutoryFormsAPI.updateForm24QReturn(editItem.id, formData);
        else await statutoryFormsAPI.createForm24QReturn(formData);
      } else if (modalType === "iw") {
        if (editItem) await statutoryFormsAPI.updateInternationalWorker(editItem.id, formData);
        else await statutoryFormsAPI.createInternationalWorker(formData);
      }
      setShowModal(false);
      fetchAll();
    } catch (err) {
      console.error("Save failed:", err);
    }
  };

  const handleStatusAction = async (type, id, data) => {
    try {
      if (type === "pf-forms") await statutoryFormsAPI.updatePFStatementStatus(id, data);
      else if (type === "esi-cards") await statutoryFormsAPI.verifyESICard(id);
      else if (type === "form-15gh") await statutoryFormsAPI.verifyCertificate(id, data.remarks || "");
      else if (type === "form-24q") await statutoryFormsAPI.markForm24QFiled(id, data);
      fetchAll();
    } catch (err) {
      console.error("Status update failed:", err);
    }
  };

  const StatusBadge = ({ status, type = "default" }) => {
    const colors = {
      PENDING: "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20",
      SUBMITTED: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
      ACKNOWLEDGED: "bg-purple-500/10 text-purple-400 border border-purple-500/20",
      COMPLETED: "bg-green-500/10 text-green-400 border border-green-500/20",
      REJECTED: "bg-red-500/10 text-red-400 border border-red-500/20",
      FILED: "bg-green-500/10 text-green-400 border border-green-500/20",
      CORRECTED: "bg-orange-500/10 text-orange-400 border border-orange-500/20",
      true: "bg-green-500/10 text-green-400",
      false: "bg-yellow-500/10 text-yellow-400",
    };
    return (
      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${colors[status] || colors.false}`}>
        {status || "N/A"}
      </span>
    );
  };

  const Input = ({ label, name, type = "text", required = false, options = null }) => (
    <div className="space-y-1">
      <label className="text-xs font-medium text-white/60">{label}{required && " *"}</label>
      {options ? (
        <select
          name={name}
          value={formData[name] || ""}
          onChange={(e) => setFormData({ ...formData, [name]: e.target.value })}
          className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500/50"
          required={required}
        >
          <option value="">Select {label}</option>
          {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      ) : (
        <input
          type={type}
          name={name}
          value={formData[name] || ""}
          onChange={(e) => setFormData({ ...formData, [name]: e.target.value })}
          className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500/50"
          required={required}
        />
      )}
    </div>
  );

  // Render PF Forms tab
  const renderPFForms = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-white">PF Statutory Forms</h2>
        <button onClick={() => openModal("pf-forms")} className="px-4 py-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg text-sm font-medium hover:bg-blue-500/30 transition-all flex items-center gap-2">
          <Plus size={16} /> Add PF Form
        </button>
      </div>
      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full bg-[#0a0a0a]">
          <thead>
            <tr className="border-b border-white/10">
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-white/40">Employee</th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-white/40">Form Type</th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-white/40">Date</th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-white/40">EPFO Ref</th>
              <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider text-white/40">Status</th>
              <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider text-white/40">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {pfStatements.length === 0 ? (
              <tr><td colSpan="6" className="px-4 py-12 text-center text-white/40">No PF forms found. Add a new form to get started.</td></tr>
            ) : (
              pfStatements.map((pf) => (
                <tr key={pf.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3 text-white text-sm">{pf.employee_name || pf.employee_id_field} <span className="text-white/40 text-xs">({pf.employee_id_field})</span></td>
                  <td className="px-4 py-3"><span className="text-sm text-blue-400 font-medium">{pf.form_type_display || pf.form_type}</span></td>
                  <td className="px-4 py-3 text-white/60 text-sm">{formatDate(pf.form_date)}</td>
                  <td className="px-4 py-3 text-white/60 text-sm">{pf.epfo_reference || "—"}</td>
                  <td className="px-4 py-3 text-center"><StatusBadge status={pf.status} /></td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => openModal("pf-forms", pf)} className="p-1.5 hover:bg-white/5 rounded-lg transition-colors"><Edit3 size={14} className="text-white/40" /></button>
                      <select
                        onChange={(e) => e.target.value && handleStatusAction("pf-forms", pf.id, { status: e.target.value, epfo_reference: pf.epfo_reference })}
                        className="text-xs bg-black/40 border border-white/10 rounded px-2 py-1 text-white/60"
                      >
                        <option value="">Update Status</option>
                        <option value="SUBMITTED">Mark Submitted</option>
                        <option value="ACKNOWLEDGED">Acknowledged</option>
                        <option value="COMPLETED">Completed</option>
                      </select>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  // Render ESI Cards tab
  const renderESICards = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-white">ESI Cards & IP Numbers</h2>
        <button onClick={() => openModal("esi-cards")} className="px-4 py-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg text-sm font-medium hover:bg-blue-500/30 transition-all flex items-center gap-2">
          <Plus size={16} /> Add ESI Card
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {esiCards.length === 0 ? (
          <div className="col-span-full text-center py-12 text-white/40">No ESI cards registered.</div>
        ) : (
          esiCards.map((card) => (
            <div key={card.id} className="p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-sm font-medium text-white">{card.employee_name}</p>
                  <p className="text-xs text-white/40">{card.employee_id_field}</p>
                </div>
                <StatusBadge status={card.is_verified ? "true" : "false"} />
              </div>
              <div className="space-y-1 text-xs text-white/60">
                <p><span className="text-white/40">IP Number:</span> <span className="text-white font-mono">{card.ip_number}</span></p>
                <p><span className="text-white/40">Issued:</span> {formatDate(card.issue_date)}</p>
                {card.expiry_date && <p><span className="text-white/40">Expires:</span> {formatDate(card.expiry_date)}</p>}
              </div>
              {!card.is_verified && (
                <button onClick={() => handleStatusAction("esi-cards", card.id)} className="mt-3 w-full py-1.5 bg-green-500/10 text-green-400 rounded-lg text-xs font-medium hover:bg-green-500/20 transition-colors">
                  Verify Card
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );

  // Render Form 15G/15H tab
  const renderForm15GH = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-white">Form 15G / 15H — Lower Deduction Certificates</h2>
        <button onClick={() => openModal("form-15gh")} className="px-4 py-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg text-sm font-medium hover:bg-blue-500/30 transition-all flex items-center gap-2">
          <Plus size={16} /> Add Certificate
        </button>
      </div>
      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full bg-[#0a0a0a]">
          <thead>
            <tr className="border-b border-white/10">
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-white/40">Employee</th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-white/40">Type</th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-white/40">FY</th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-white/40">Submitted</th>
              <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider text-white/40">Verified</th>
              <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider text-white/40">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {certificates.length === 0 ? (
              <tr><td colSpan="6" className="px-4 py-12 text-center text-white/40">No certificates submitted.</td></tr>
            ) : (
              certificates.map((cert) => (
                <tr key={cert.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3 text-white text-sm">{cert.employee_name}</td>
                  <td className="px-4 py-3"><span className="text-sm text-purple-400 font-medium">{cert.certificate_type_display || cert.certificate_type}</span></td>
                  <td className="px-4 py-3 text-white/60 text-sm">{cert.financial_year}</td>
                  <td className="px-4 py-3 text-white/60 text-sm">{formatDate(cert.submitted_date)}</td>
                  <td className="px-4 py-3 text-center"><StatusBadge status={cert.is_verified ? "true" : "false"} /></td>
                  <td className="px-4 py-3 text-center">
                    {!cert.is_verified && (
                      <button onClick={() => handleStatusAction("form-15gh", cert.id, { remarks: "Verified by HR" })} className="px-3 py-1 bg-green-500/10 text-green-400 rounded text-xs font-medium hover:bg-green-500/20">
                        Verify
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  // Render VPF tab
  const renderVPF = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-white">Voluntary PF (VPF) Contributions</h2>
        <button onClick={() => openModal("vpf")} className="px-4 py-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg text-sm font-medium hover:bg-blue-500/30 transition-all flex items-center gap-2">
          <Plus size={16} /> Add VPF
        </button>
      </div>
      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full bg-[#0a0a0a]">
          <thead>
            <tr className="border-b border-white/10">
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-white/40">Employee</th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-white/40">Period</th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-white/40">VPF %</th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-white/40">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {vpfContributions.length === 0 ? (
              <tr><td colSpan="4" className="px-4 py-12 text-center text-white/40">No VPF contributions recorded.</td></tr>
            ) : (
              vpfContributions.map((vpf) => (
                <tr key={vpf.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3 text-white text-sm">{vpf.employee_name}</td>
                  <td className="px-4 py-3 text-white/60 text-sm">{vpf.month}/{vpf.year}</td>
                  <td className="px-4 py-3"><span className="text-blue-400 font-medium">{vpf.vpf_percentage}%</span></td>
                  <td className="px-4 py-3 text-green-400 font-medium">₹{parseFloat(vpf.vpf_amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  // Render PT Enrollments tab
  const renderPTEnroll = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-white">Professional Tax Enrollments</h2>
        <button onClick={() => openModal("pt-enroll")} className="px-4 py-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg text-sm font-medium hover:bg-blue-500/30 transition-all flex items-center gap-2">
          <Plus size={16} /> Add Enrollment
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ptEnrollments.length === 0 ? (
          <div className="col-span-full text-center py-12 text-white/40">No PT enrollments recorded.</div>
        ) : (
          ptEnrollments.map((pt) => (
            <div key={pt.id} className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-sm font-medium text-white">{pt.employee_name}</p>
                  <p className="text-xs text-white/40">{pt.employee_id_field}</p>
                </div>
                <span className="text-xs bg-orange-500/10 text-orange-400 px-2 py-0.5 rounded font-medium">{pt.state}</span>
              </div>
              <div className="text-xs text-white/60 space-y-1">
                {pt.enrollment_number && <p><span className="text-white/40">Enroll No:</span> {pt.enrollment_number}</p>}
                <p><span className="text-white/40">Issued:</span> {formatDate(pt.issue_date)}</p>
                {pt.expiry_date && <p><span className="text-white/40">Expires:</span> {formatDate(pt.expiry_date)}</p>}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  // Render Form 12BA tab
  const renderForm12BA = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-white">Form 12BA — Perquisite Statement</h2>
        <button onClick={() => openModal("form-12ba")} className="px-4 py-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg text-sm font-medium hover:bg-blue-500/30 transition-all flex items-center gap-2">
          <Plus size={16} /> Add Perquisite
        </button>
      </div>
      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full bg-[#0a0a0a]">
          <thead>
            <tr className="border-b border-white/10">
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-white/40">Employee</th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-white/40">Perquisite Type</th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-white/40">FY</th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-white/40">Amount</th>
              <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider text-white/40">Taxable</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {form12ba.length === 0 ? (
              <tr><td colSpan="5" className="px-4 py-12 text-center text-white/40">No perquisite entries.</td></tr>
            ) : (
              form12ba.map((p) => (
                <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3 text-white text-sm">{p.employee_name}</td>
                  <td className="px-4 py-3"><span className="text-sm text-purple-400 font-medium">{p.perquisite_type_display || p.perquisite_type}</span></td>
                  <td className="px-4 py-3 text-white/60 text-sm">{p.financial_year}</td>
                  <td className="px-4 py-3 text-white font-medium">₹{parseFloat(p.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs font-medium ${p.is_taxable ? "text-red-400" : "text-green-400"}`}>{p.is_taxable ? "Yes" : "No"}</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  // Render Form 24Q tab
  const renderForm24Q = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-white">Form 24Q — TDS Quarterly Returns</h2>
        <button onClick={() => openModal("form-24q")} className="px-4 py-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg text-sm font-medium hover:bg-blue-500/30 transition-all flex items-center gap-2">
          <Plus size={16} /> Add Return
        </button>
      </div>
      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full bg-[#0a0a0a]">
          <thead>
            <tr className="border-b border-white/10">
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-white/40">Financial Year</th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-white/40">Quarter</th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-white/40">Due Date</th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-white/40">Token</th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-white/40">TDS Deducted</th>
              <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider text-white/40">Status</th>
              <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider text-white/40">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {form24q.length === 0 ? (
              <tr><td colSpan="7" className="px-4 py-12 text-center text-white/40">No Form 24Q returns.</td></tr>
            ) : (
              form24q.map((q) => (
                <tr key={q.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3 text-white text-sm">{q.financial_year}</td>
                  <td className="px-4 py-3"><span className="text-sm text-blue-400 font-medium">{q.quarter_display || q.quarter}</span></td>
                  <td className="px-4 py-3 text-white/60 text-sm">{formatDate(q.due_date)}</td>
                  <td className="px-4 py-3 text-white/60 text-sm font-mono">{q.token_number || "—"}</td>
                  <td className="px-4 py-3 text-white text-sm">₹{parseFloat(q.total_tds_deducted || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                  <td className="px-4 py-3 text-center"><StatusBadge status={q.status} /></td>
                  <td className="px-4 py-3 text-center">
                    {q.status === "PENDING" && (
                      <button onClick={() => handleStatusAction("form-24q", q.id, { filing_date: new Date().toISOString().split("T")[0] })} className="px-3 py-1 bg-green-500/10 text-green-400 rounded text-xs font-medium hover:bg-green-500/20">
                        Mark Filed
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  // Render International Workers tab
  const renderIW = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-white">International Workers</h2>
        <button onClick={() => openModal("iw")} className="px-4 py-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg text-sm font-medium hover:bg-blue-500/30 transition-all flex items-center gap-2">
          <Plus size={16} /> Add Worker
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {intlWorkers.length === 0 ? (
          <div className="col-span-full text-center py-12 text-white/40">No international workers registered.</div>
        ) : (
          intlWorkers.map((iw) => (
            <div key={iw.id} className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-sm font-medium text-white">{iw.employee_name}</p>
                  <p className="text-xs text-white/40">{iw.employee_id_field}</p>
                </div>
                <span className="flex items-center gap-1 text-xs bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded">
                  <Globe size={12} /> {iw.country_of_origin}
                </span>
              </div>
              <div className="text-xs text-white/60 space-y-1">
                <p><span className="text-white/40">Passport:</span> {iw.passport_number}</p>
                {iw.visa_type && <p><span className="text-white/40">Visa:</span> {iw.visa_type}</p>}
                <p><span className="text-white/40">PF:</span> Employee {iw.employee_pf_pct}% | Employer {iw.employer_pf_pct}%</p>
                {iw.has_ssa && <p className="text-green-400">SSA with {iw.ssa_country}</p>}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  // Modal render
  const Modal = () => {
    if (!showModal) return null;

    const formFields = {
      "pf-forms": () => (
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="text-xs font-medium text-white/60">Employee *</label>
            <select
              value={formData.employee || ""}
              onChange={(e) => setFormData({ ...formData, employee: e.target.value })}
              className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-white text-sm"
              required
            >
              <option value="">Select Employee</option>
              {employees.map((emp) => <option key={emp.id} value={emp.id}>{emp.full_name} ({emp.employee_id})</option>)}
            </select>
          </div>
          <Input label="Form Type" name="form_type" required options={[
            { value: "FORM_2", label: "Form 2 - PF Nomination" },
            { value: "FORM_10C", label: "Form 10C - EPS Withdrawal" },
            { value: "FORM_10D", label: "Form 10D - Pension Claim" },
            { value: "FORM_19", label: "Form 19 - PF Withdrawal" },
            { value: "FORM_31", label: "Form 31 - PF Advance" },
            { value: "FORM_13", label: "Form 13 - Transfer Claim" },
            { value: "FORM_11", label: "Form 11 - New Emp Declaration" },
          ]} />
          <Input label="Form Date" name="form_date" type="date" required />
          <Input label="EPFO Reference" name="epfo_reference" />
          <Input label="Status" name="status" options={[
            { value: "PENDING", label: "Pending" },
            { value: "SUBMITTED", label: "Submitted" },
            { value: "ACKNOWLEDGED", label: "Acknowledged" },
            { value: "COMPLETED", label: "Completed" },
          ]} />
          <div className="col-span-2">
            <label className="text-xs font-medium text-white/60">Remarks</label>
            <textarea
              value={formData.remarks || ""}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-white text-sm"
              rows={2}
            />
          </div>
        </div>
      ),
      "esi-cards": () => (
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="text-xs font-medium text-white/60">Employee *</label>
            <select value={formData.employee || ""} onChange={(e) => setFormData({ ...formData, employee: e.target.value })} className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-white text-sm" required>
              <option value="">Select Employee</option>
              {employees.map((emp) => <option key={emp.id} value={emp.id}>{emp.full_name} ({emp.employee_id})</option>)}
            </select>
          </div>
          <Input label="IP Number" name="ip_number" required />
          <Input label="Name as per Card" name="name_as_per_card" />
          <Input label="Issue Date" name="issue_date" type="date" required />
          <Input label="Expiry Date" name="expiry_date" type="date" />
        </div>
      ),
      "form-15gh": () => (
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="text-xs font-medium text-white/60">Employee *</label>
            <select value={formData.employee || ""} onChange={(e) => setFormData({ ...formData, employee: e.target.value })} className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-white text-sm" required>
              <option value="">Select Employee</option>
              {employees.map((emp) => <option key={emp.id} value={emp.id}>{emp.full_name} ({emp.employee_id})</option>)}
            </select>
          </div>
          <Input label="Certificate Type" name="certificate_type" required options={[
            { value: "FORM_15G", label: "Form 15G (Below 60)" },
            { value: "FORM_15H", label: "Form 15H (Senior 60+)" },
          ]} />
          <Input label="Financial Year" name="financial_year" required placeholder="e.g. 2025-2026" />
          <Input label="Est. Total Income" name="estimated_total_income" type="number" />
          <Input label="Est. Tax Due" name="estimated_tax_due" type="number" />
          <div className="col-span-2">
            <label className="text-xs font-medium text-white/60">Reason for No/Lower Tax</label>
            <textarea value={formData.reason_for_no_tax || ""} onChange={(e) => setFormData({ ...formData, reason_for_no_tax: e.target.value })} className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-white text-sm" rows={2} />
          </div>
          <Input label="Submitted Date" name="submitted_date" type="date" required />
        </div>
      ),
      "vpf": () => (
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="text-xs font-medium text-white/60">Employee *</label>
            <select value={formData.employee || ""} onChange={(e) => setFormData({ ...formData, employee: e.target.value })} className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-white text-sm" required>
              <option value="">Select Employee</option>
              {employees.map((emp) => <option key={emp.id} value={emp.id}>{emp.full_name} ({emp.employee_id})</option>)}
            </select>
          </div>
          <Input label="Month" name="month" type="number" min="1" max="12" required />
          <Input label="Year" name="year" type="number" required />
          <Input label="VPF % (above 12%)" name="vpf_percentage" type="number" step="0.01" required />
          <Input label="Notes" name="notes" />
        </div>
      ),
      "pt-enroll": () => (
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="text-xs font-medium text-white/60">Employee *</label>
            <select value={formData.employee || ""} onChange={(e) => setFormData({ ...formData, employee: e.target.value })} className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-white text-sm" required>
              <option value="">Select Employee</option>
              {employees.map((emp) => <option key={emp.id} value={emp.id}>{emp.full_name} ({emp.employee_id})</option>)}
            </select>
          </div>
          <Input label="State" name="state" required />
          <Input label="Enrollment Number" name="enrollment_number" />
          <Input label="Issue Date" name="issue_date" type="date" required />
          <Input label="Expiry Date" name="expiry_date" type="date" />
        </div>
      ),
      "form-12ba": () => (
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="text-xs font-medium text-white/60">Employee *</label>
            <select value={formData.employee || ""} onChange={(e) => setFormData({ ...formData, employee: e.target.value })} className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-white text-sm" required>
              <option value="">Select Employee</option>
              {employees.map((emp) => <option key={emp.id} value={emp.id}>{emp.full_name} ({emp.employee_id})</option>)}
            </select>
          </div>
          <Input label="Financial Year" name="financial_year" required placeholder="e.g. 2025-2026" />
          <Input label="Perquisite Type" name="perquisite_type" required options={[
            { value: "RENT_FREE_ACCOMMODATION", label: "Rent-Free Accommodation" },
            { value: "CONCESSIONAL_RENT", label: "Concessional Rent" },
            { value: "MOTOR_CAR", label: "Motor Car" },
            { value: "EDUCATION", label: "Children Education" },
            { value: "TRANSPORT", label: "Transport Facility" },
            { value: "SUNDRY", label: "Other Sundry Perquisites" },
          ]} />
          <Input label="Amount (₹)" name="amount" type="number" required />
          <Input label="Is Taxable?" name="is_taxable" options={[{ value: true, label: "Yes" }, { value: false, label: "No" }]} />
          <div className="col-span-2">
            <label className="text-xs font-medium text-white/60">Description</label>
            <textarea value={formData.description || ""} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-white text-sm" rows={2} />
          </div>
        </div>
      ),
      "form-24q": () => (
        <div className="grid grid-cols-2 gap-4">
          <Input label="Financial Year" name="financial_year" required placeholder="e.g. 2025-2026" />
          <Input label="Quarter" name="quarter" required options={[
            { value: "Q1", label: "Q1 (Apr-Jun)" },
            { value: "Q2", label: "Q2 (Jul-Sep)" },
            { value: "Q3", label: "Q3 (Oct-Dec)" },
            { value: "Q4", label: "Q4 (Jan-Mar)" },
          ]} />
          <Input label="Filing Date" name="filing_date" type="date" required />
          <Input label="Due Date" name="due_date" type="date" required />
          <Input label="Total Deductees" name="total_deductees" type="number" />
          <Input label="Total TDS Deducted" name="total_tds_deducted" type="number" />
        </div>
      ),
      "iw": () => (
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="text-xs font-medium text-white/60">Employee *</label>
            <select value={formData.employee || ""} onChange={(e) => setFormData({ ...formData, employee: e.target.value })} className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-white text-sm" required>
              <option value="">Select Employee</option>
              {employees.map((emp) => <option key={emp.id} value={emp.id}>{emp.full_name} ({emp.employee_id})</option>)}
            </select>
          </div>
          <Input label="Passport Number" name="passport_number" required />
          <Input label="Country of Origin" name="country_of_origin" required />
          <Input label="Visa Type" name="visa_type" />
          <Input label="Visa Expiry" name="visa_expiry_date" type="date" />
          <Input label="Employee PF %" name="employee_pf_pct" type="number" />
          <Input label="Employer PF %" name="employer_pf_pct" type="number" />
          <Input label="SSA Country" name="ssa_country" />
          <Input label="Has SSA?" name="has_ssa" options={[{ value: true, label: "Yes" }, { value: false, label: "No" }]} />
          <div className="col-span-2">
            <label className="text-xs font-medium text-white/60">Notes</label>
            <textarea value={formData.notes || ""} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-white text-sm" rows={2} />
          </div>
        </div>
      ),
    };

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
          <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">
              {editItem ? "Edit" : "Add"} — {TABS.find((t) => t.id === modalType)?.label}
            </h3>
            <button onClick={() => setShowModal(false)} className="text-white/40 hover:text-white transition-colors"><XCircle size={20} /></button>
          </div>
          <div className="p-6 space-y-4">
            {formFields[modalType]?.()}
          </div>
          <div className="p-6 border-t border-zinc-800 flex justify-end gap-3">
            <button onClick={() => setShowModal(false)} className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm hover:bg-white/10 transition-colors">Cancel</button>
            <button onClick={handleSave} className="px-4 py-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg text-sm font-medium hover:bg-blue-500/30 transition-colors">
              {editItem ? "Update" : "Create"}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "pf-forms": return renderPFForms();
      case "esi-cards": return renderESICards();
      case "form-15gh": return renderForm15GH();
      case "vpf": return renderVPF();
      case "pt-enroll": return renderPTEnroll();
      case "form-12ba": return renderForm12BA();
      case "form-24q": return renderForm24Q();
      case "iw": return renderIW();
      default: return renderPFForms();
    }
  };

  return (
    <div className="h-full flex flex-col bg-black">
      {/* Header */}
      <header className="px-10 py-8 flex justify-between items-end border-b border-white/5 shrink-0 bg-black/50 backdrop-blur-xl z-10 sticky top-0">
        <div className="space-y-1">
          <button onClick={() => navigate('/hr/admin/compliance')} className="flex items-center gap-2 text-white/40 hover:text-white mb-4 transition-colors text-sm">
            <ChevronLeft size={16} /> Back to Compliance Dashboard
          </button>
          <h1 className="text-4xl font-bold tracking-tight text-white flex items-center gap-3">
            <FileText size={32} className="text-purple-500" />
            Statutory Forms & Certificates
          </h1>
          <p className="text-sm text-white/40 font-medium">
            PF forms, ESI cards, Form 15G/15H, VPF, PT enrollments, perquisites, TDS returns, and international workers.
          </p>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="px-10 py-4 border-b border-white/5">
        <div className="flex gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/5 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                  : "text-white/50 hover:text-white hover:bg-white/5"
              }`}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-10 py-8 custom-scrollbar">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader size={24} className="text-purple-500 animate-spin mr-2" />
            <span className="text-white/40">Loading compliance forms data...</span>
          </div>
        ) : (
          renderTabContent()
        )}
      </div>

      {/* Modal */}
      <Modal />
    </div>
  );
};

export default StatutoryFormsDashboard;
