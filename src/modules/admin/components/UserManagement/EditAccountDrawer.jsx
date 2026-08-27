import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Save,
  Loader2,
  User,
  Mail,
  Phone,
  IdCard,
  Shield,
} from "lucide-react";
import axios from "axios";
import { cn } from "@/lib/utils";

const inputClass =
  "w-full px-3.5 py-2.5 bg-white/[0.03] backdrop-blur-md border border-zinc-800 rounded-md text-sm text-white placeholder:text-white/20 outline-none transition-all duration-200 focus:bg-white/[0.05] focus:border-zinc-700";

const disabledInputClass =
  "w-full px-3.5 py-2.5 bg-white/[0.01] border border-zinc-800/50 rounded-md text-sm text-white/30 cursor-not-allowed";

const labelClass =
  "text-[9px] font-medium text-white/30 uppercase tracking-widest mb-1.5 block";

const GENDERS = ["Male", "Female", "Other"];

const EditAccountDrawer = ({ open, onClose, user, onUpdate }) => {
  const [form, setForm] = useState(() => ({
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    mobile: user?.mobile || "",
    gender: user?.gender || "",
  }));
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState(null);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const handleSave = async () => {
    setSaving(true);
    setSaveMsg(null);
    try {
      const res = await axios.put("/api/auth/profile/update/", form);
      setSaveMsg({
        type: "success",
        text: res.data?.message || "Profile updated.",
      });
      if (onUpdate) onUpdate();
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        (err.response?.data?.errors
          ? Object.entries(err.response.data.errors)
              .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
              .join(" | ")
          : "Save failed.");
      setSaveMsg({ type: "error", text: msg });
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[1040] bg-black/50 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed top-0 right-0 bottom-0 z-[1050] w-[min(420px,90vw)] bg-zinc-950 border-l border-zinc-800 shadow-2xl flex flex-col animate-[slideInRight_0.25s_ease-out]">
        {/* Header */}
        <div className="shrink-0 px-5 py-4 border-b border-zinc-800 bg-white/[0.02] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
              <User size={14} className="text-blue-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight uppercase">
                Edit Account
              </h3>
              <p className="text-[9px] text-white/30 uppercase tracking-widest font-medium mt-0.5">
                Update your personal details
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

        {/* Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0 p-5">
          <div className="space-y-4">
            {/* Email (disabled) */}
            <div>
              <label className={labelClass}>
                <span className="flex items-center gap-1.5">
                  <Mail size={10} className="text-white/20" />
                  Email
                </span>
              </label>
              <input
                type="email"
                className={disabledInputClass}
                value={user?.email || ""}
                disabled
              />
              <p className="text-[8px] text-white/15 mt-1 uppercase tracking-widest">
                Cannot be changed
              </p>
            </div>

            {/* Account ID (disabled) */}
            <div>
              <label className={labelClass}>
                <span className="flex items-center gap-1.5">
                  <IdCard size={10} className="text-white/20" />
                  Account ID
                </span>
              </label>
              <input
                type="text"
                className={disabledInputClass}
                value={user?.account_id || ""}
                disabled
              />
              <p className="text-[8px] text-white/15 mt-1 uppercase tracking-widest">
                System-generated
              </p>
            </div>

            {/* Role (disabled) */}
            <div>
              <label className={labelClass}>
                <span className="flex items-center gap-1.5">
                  <Shield size={10} className="text-white/20" />
                  Role
                </span>
              </label>
              <input
                type="text"
                className={disabledInputClass}
                value={user?.role || "User"}
                disabled
              />
              <p className="text-[8px] text-white/15 mt-1 uppercase tracking-widest">
                Assigned by administrator
              </p>
            </div>

            {/* First Name */}
            <div>
              <label className={labelClass}>
                <span className="flex items-center gap-1.5">
                  <User size={10} className="text-white/20" />
                  First Name
                </span>
              </label>
              <input
                type="text"
                className={inputClass}
                value={form.first_name}
                onChange={(e) => set("first_name", e.target.value)}
                placeholder="First name"
              />
            </div>

            {/* Last Name */}
            <div>
              <label className={labelClass}>
                <span className="flex items-center gap-1.5">
                  <User size={10} className="text-white/20" />
                  Last Name
                </span>
              </label>
              <input
                type="text"
                className={inputClass}
                value={form.last_name}
                onChange={(e) => set("last_name", e.target.value)}
                placeholder="Last name"
              />
            </div>

            {/* Mobile */}
            <div>
              <label className={labelClass}>
                <span className="flex items-center gap-1.5">
                  <Phone size={10} className="text-white/20" />
                  Mobile
                </span>
              </label>
              <input
                type="tel"
                className={inputClass}
                value={form.mobile}
                onChange={(e) => set("mobile", e.target.value)}
                placeholder="9876543210"
              />
            </div>

            {/* Gender */}
            <div>
              <label className={labelClass}>
                <span className="flex items-center gap-1.5">
                  <User size={10} className="text-white/20" />
                  Gender
                </span>
              </label>
              <select
                className={inputClass}
                value={form.gender}
                onChange={(e) => set("gender", e.target.value)}
              >
                <option value="">Select Gender</option>
                {GENDERS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
          </div>
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
            <button
              onClick={handleSave}
              disabled={saving}
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
          </div>
        </div>
      </div>
    </>,
    document.body
  );
};

export default EditAccountDrawer;
