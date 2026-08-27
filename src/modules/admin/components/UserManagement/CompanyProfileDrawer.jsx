import React, { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { X, Save, Loader2, Building2, Banknote, Palette } from "lucide-react";
import { companyProfileApi } from "@/modules/invoice/api/invoiceApi";
import BrandingUpload from "@/modules/invoice/components/AdminPanel/CompanyProfile/BrandingUpload";
import { cn } from "@/lib/utils";

const TABS = [
  { label: "Company Info", key: "info", icon: Building2 },
  { label: "Bank Details", key: "bank", icon: Banknote },
  { label: "Branding", key: "branding", icon: Palette },
];

const inputClass =
  "w-full px-3.5 py-2.5 bg-white/[0.03] backdrop-blur-md border border-zinc-800 rounded-md text-sm text-white placeholder:text-white/20 outline-none transition-all duration-200 focus:bg-white/[0.05] focus:border-zinc-700";

const labelClass =
  "text-[9px] font-medium text-white/30 uppercase tracking-widest mb-1.5 block";

const CompanyProfileDrawer = ({ open, onClose, onUpdate }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [form, setForm] = useState({
    company_name: "",
    company_address: "",
    gstin: "",
    pan_number: "",
    phone: "",
    email: "",
    website: "",
    state: "",
    state_code: "",
    bank_name: "",
    bank_account: "",
    bank_ifsc: "",
    bank_branch: "",
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState(null);
  const [profile, setProfile] = useState(null);

  const fetchProfile = useCallback(async () => {
    if (!open) return;
    setLoading(true);
    try {
      const res = await companyProfileApi.get();
      const data = res.data?.data || {};
      setProfile(data);
      setForm((prev) => ({ ...prev, ...data }));
    } catch {
      // Profile may not exist yet — leave defaults
    } finally {
      setLoading(false);
    }
  }, [open]);

  const uploadAsset = async (type, file) => {
    const formData = new FormData();
    formData.append("image", file);
    try {
      let res;
      if (type === "logo") res = await companyProfileApi.uploadLogo(formData);
      else if (type === "signature") res = await companyProfileApi.uploadSignature(formData);
      else res = await companyProfileApi.uploadSeal(formData);
      await fetchProfile();
      if (onUpdate) onUpdate();
      return { success: true, message: res.data?.message };
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.errors?.image?.[0] || "Upload failed.";
      return { success: false, message: msg };
    }
  };

  const removeAsset = async (type) => {
    try {
      if (type === "logo") await companyProfileApi.removeLogo();
      else if (type === "signature") await companyProfileApi.removeSignature();
      else await companyProfileApi.removeSeal();
      await fetchProfile();
      if (onUpdate) onUpdate();
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || "Remove failed." };
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Reset tab when drawer opens
  useEffect(() => {
    if (open) {
      setActiveTab(0);
      setSaveMsg(null);
    }
  }, [open]);

  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const handleSave = async () => {
    setSaving(true);
    setSaveMsg(null);
    try {
      const res = await companyProfileApi.update(form, true);
      setSaveMsg({ type: "success", text: res.data?.message || "Saved." });
      if (onUpdate) onUpdate();
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.errors
          ? Object.entries(err.response.data.errors)
              .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
              .join(" | ")
          : "Save failed.";
      setSaveMsg({ type: "error", text: msg });
    } finally {
      setSaving(false);
    }
  };

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <>
      <div
        className="fixed inset-0 z-[1040] bg-black/50 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]"
        onClick={onClose}
      />
      <div className="fixed top-0 right-0 bottom-0 z-[1050] w-[min(420px,90vw)] bg-zinc-950 border-l border-zinc-800 shadow-2xl flex flex-col animate-[slideInRight_0.25s_ease-out]">
        {/* Header */}
        <div className="shrink-0 px-5 py-4 border-b border-zinc-800 bg-white/[0.02] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
              <Building2 size={14} className="text-blue-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight uppercase">
                Company Profile
              </h3>
              <p className="text-[9px] text-white/30 uppercase tracking-widest font-medium mt-0.5">
                Edit company details for invoices
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-sm bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-all"
          >
            <X size={14} />
          </button>
        </div>

        {/* Tabs */}
        <div className="shrink-0 px-5 border-b border-zinc-800">
          <div className="flex items-center gap-1 -mb-px">
            {TABS.map((tab, idx) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(idx)}
                className={cn(
                  "px-4 py-3 text-[9px] font-bold uppercase tracking-widest transition-all border-b-2 flex items-center gap-2",
                  activeTab === idx
                    ? "text-blue-400 border-blue-500"
                    : "text-white/30 border-transparent hover:text-white/60"
                )}
              >
                <tab.icon size={13} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0 p-5">
          {loading ? (
            <div className="flex flex-col items-center justify-center flex-1 text-white/20 min-h-0 py-20">
              <Loader2 size={20} className="text-white/40 animate-spin" />
            </div>
          ) : (
            <>
              {/* Company Info Tab */}
              {activeTab === 0 && (
                <div className="space-y-4">
                  <div>
                    <label className={labelClass}>Company Name *</label>
                    <input
                      type="text"
                      className={inputClass}
                      value={form.company_name || ""}
                      onChange={(e) => set("company_name", e.target.value)}
                      placeholder="Company Name"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Company Address *</label>
                    <textarea
                      className={cn(inputClass, "resize-none")}
                      rows={3}
                      value={form.company_address || ""}
                      onChange={(e) => set("company_address", e.target.value)}
                      placeholder="Street, City, State, PIN"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>GSTIN *</label>
                      <input
                        type="text"
                        className={inputClass}
                        value={form.gstin || ""}
                        onChange={(e) =>
                          set("gstin", e.target.value.toUpperCase())
                        }
                        placeholder="22AAAAA0000A1Z5"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>PAN Number</label>
                      <input
                        type="text"
                        className={inputClass}
                        value={form.pan_number || ""}
                        onChange={(e) =>
                          set("pan_number", e.target.value.toUpperCase())
                        }
                        placeholder="AAAAA0000A"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Phone</label>
                      <input
                        type="tel"
                        className={inputClass}
                        value={form.phone || ""}
                        onChange={(e) => set("phone", e.target.value)}
                        placeholder="+91 98765 43210"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Email</label>
                      <input
                        type="email"
                        className={inputClass}
                        value={form.email || ""}
                        onChange={(e) => set("email", e.target.value)}
                        placeholder="billing@company.com"
                      />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Website</label>
                    <input
                      type="url"
                      className={inputClass}
                      value={form.website || ""}
                      onChange={(e) => set("website", e.target.value)}
                      placeholder="https://company.com"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>State</label>
                      <input
                        type="text"
                        className={inputClass}
                        value={form.state || ""}
                        onChange={(e) => set("state", e.target.value)}
                        placeholder="Kerala"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>State Code</label>
                      <input
                        type="text"
                        className={inputClass}
                        value={form.state_code || ""}
                        onChange={(e) => set("state_code", e.target.value)}
                        placeholder="32"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Bank Details Tab */}
              {activeTab === 1 && (
                <div className="space-y-4">
                  <div>
                    <label className={labelClass}>Bank Name</label>
                    <input
                      type="text"
                      className={inputClass}
                      value={form.bank_name || ""}
                      onChange={(e) => set("bank_name", e.target.value)}
                      placeholder="HDFC Bank"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Account Number</label>
                    <input
                      type="text"
                      className={inputClass}
                      value={form.bank_account || ""}
                      onChange={(e) => set("bank_account", e.target.value)}
                      placeholder="00000000000000"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>IFSC Code</label>
                      <input
                        type="text"
                        className={inputClass}
                        value={form.bank_ifsc || ""}
                        onChange={(e) =>
                          set("bank_ifsc", e.target.value.toUpperCase())
                        }
                        placeholder="HDFC0001234"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Branch</label>
                      <input
                        type="text"
                        className={inputClass}
                        value={form.bank_branch || ""}
                        onChange={(e) => set("bank_branch", e.target.value)}
                        placeholder="Ernakulam Main"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Branding Tab */}
              {activeTab === 2 && (
                <BrandingUpload
                  profile={profile}
                  uploadAsset={uploadAsset}
                  removeAsset={removeAsset}
                />
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 px-5 py-3 border-t border-zinc-800 bg-black/30 flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            {saveMsg && (
              <p
                className={cn(
                  "text-[9px] font-medium uppercase tracking-widest truncate",
                  saveMsg.type === "success"
                    ? "text-green-400"
                    : "text-red-400"
                )}
              >
                {saveMsg.text}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-sm bg-white/5 border border-white/10 text-[9px] font-bold uppercase tracking-widest text-white/40 hover:text-white hover:bg-white/10 transition-all"
            >
              Close
            </button>
            {activeTab !== 2 && (
              <button
                onClick={handleSave}
                disabled={saving || loading}
                className={cn(
                  "px-4 py-1.5 rounded-sm border text-[9px] font-bold uppercase tracking-widest transition-all flex items-center gap-1.5",
                  saving
                    ? "bg-blue-500/10 border-blue-500/30 text-blue-400 opacity-60 cursor-not-allowed"
                    : "bg-blue-500/20 border-blue-500/30 text-blue-400 hover:bg-blue-500/30 hover:border-blue-500/50"
                )}
              >
                {saving ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <Save size={12} />
                )}
                Save
              </button>
            )}
          </div>
        </div>
      </div>
    </>,
    document.body
  );
};

export default CompanyProfileDrawer;
