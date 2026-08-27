import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import gmailIcon from "@/assets/gmail.svg";
import {
  Mail,
  KeyRound,
  Loader2,
  Check,
  IdCard,
  Phone,
  User as UserIcon,
  Building2,
  MapPin,
  Landmark,
  FileText,
  Globe,
  Pencil,
} from "lucide-react";
import { FaArrowUpRightFromSquare } from "react-icons/fa6";
import { cn } from "@/lib/utils";
import Tooltip from "@/components/ui/tooltip";
import CompanyProfileDrawer from "./CompanyProfileDrawer";
import EditAccountDrawer from "./EditAccountDrawer";

const ROLE_STYLES = {
  Superadmin: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  Admin: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  Manager: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  Staff: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  Vendor: "bg-pink-500/10 text-pink-400 border-pink-500/20",
  Finance: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  User: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
  Others: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
};

const Card = ({ title, subtitle, icon, headerRight, children }) => {
  const IconComp = icon;
  return (
  <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 overflow-hidden">
    <div className="px-6 py-4 border-b border-white/5 flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
        <IconComp size={15} />
      </div>
      <div>
        <h3 className="text-xs font-semibold text-white uppercase tracking-wider">{title}</h3>
        {subtitle && <p className="text-[10px] text-white/30 mt-0.5">{subtitle}</p>}
      </div>
      {headerRight && <div className="ml-auto shrink-0">{headerRight}</div>}
    </div>
    <div className="p-6">{children}</div>
  </div>
  );
};

const FieldLabel = ({ children }) => (
  <label className="text-[10px] font-medium text-white/40 uppercase tracking-widest mb-1.5 block">
    {children}
  </label>
);

const InfoRow = ({ icon, label, value }) => {
  const IconComp = icon;
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-white/5 last:border-0">
      <div className="w-7 h-7 rounded-md bg-white/5 flex items-center justify-center text-white/30 shrink-0">
        <IconComp size={13} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-white/30 uppercase tracking-widest mb-0.5">{label}</p>
        <p className="text-sm text-white truncate">{value || "—"}</p>
      </div>
    </div>
  );
};

const inputClass =
  "w-full px-3.5 py-2.5 bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-md text-sm text-white placeholder:text-white/20 outline-none transition-all duration-200 focus:bg-white/[0.05] focus:border-white/20";

const ProfileTab = () => {
  const { user } = useAuth();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  // Company profile state (read-only, from /api/company-profile/)
  const [company, setCompany] = useState(null);

  // Change-password form state
  const [pwd, setPwd] = useState({ current_password: "", new_password: "" });
  const [isSavingPwd, setIsSavingPwd] = useState(false);
  const [pwdMsg, setPwdMsg] = useState(null);
  const [pwdSuccess, setPwdSuccess] = useState(false);
  // Current-password verification gate
  const [isVerifying, setIsVerifying] = useState(false);
  const [pwdVerified, setPwdVerified] = useState(false);
  const [verifyMsg, setVerifyMsg] = useState(null);

  // Company profile drawer
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Edit account drawer
  const [accountDrawerOpen, setAccountDrawerOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    axios
      .get("/api/auth/profile/")
      .then((response) => {
        if (cancelled) return;
        const data = response.data?.data || {};
        setProfile(data);
      })
      .catch((err) => {
        if (cancelled) return;
        setLoadError(err.response?.data?.message || "Failed to load profile");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Fetch company profile (same endpoint as Company Profile admin page)
  useEffect(() => {
    let cancelled = false;
    axios
      .get("/api/company-profile/")
      .then((response) => {
        if (cancelled) return;
        setCompany(response.data?.data || {});
      })
      .catch(() => {
        if (cancelled) return;
        setCompany(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleVerifyPassword = async () => {
    setIsVerifying(true);
    setVerifyMsg(null);
    setPwdMsg(null);
    setPwdSuccess(false);
    try {
      const response = await axios.post("/api/auth/verify-password/", { password: pwd.current_password });
      setPwdVerified(true);
      setVerifyMsg({ type: "success", text: response.data?.message || "Current password verified" });
    } catch (err) {
      setPwdVerified(false);
      setVerifyMsg({ type: "error", text: err.response?.data?.message || "Current password is incorrect" });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResetPwd = () => {
    setPwd({ current_password: "", new_password: "" });
    setPwdVerified(false);
    setVerifyMsg(null);
    setPwdMsg(null);
    setPwdSuccess(false);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setIsSavingPwd(true);
    setPwdMsg(null);
    setPwdSuccess(false);
    try {
      await axios.post("/api/auth/change-password/", pwd);
      setPwd({ current_password: "", new_password: "" });
      setPwdVerified(false);
      setVerifyMsg(null);
      setPwdSuccess(true);
    } catch (err) {
      setPwdMsg({
        type: "error",
        text: err.response?.data?.message || err.response?.data?.errors?.current_password?.[0] || "Failed to change password",
      });
    } finally {
      setIsSavingPwd(false);
    }
  };

  const data = profile || user || {};
  const isSubmitDisabled = !pwdSuccess && (!pwdVerified || !pwd.new_password || isSavingPwd);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 size={20} className="text-white/40 animate-spin" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="p-4 bg-red-900/20 border border-red-500/20 rounded-xl text-red-400 text-sm">
          {loadError}
        </div>
      </div>
    );
  }

  const fullName = [data.first_name, data.last_name].filter(Boolean).join(" ") || data.email || "User";
  const initials = `${data.first_name?.charAt(0) || ""}${data.last_name?.charAt(0) || ""}`.toUpperCase() || "U";
  const roleClass = ROLE_STYLES[data.role] || ROLE_STYLES.User;

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar">
      <div className="w-full pr-4 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* ── Left column: identity + change password ─────────────── */}
        <div className="space-y-6">
        {/* ── Identity Header ─────────────────────────────────────── */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-6 flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="w-16 h-16 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 text-2xl font-bold shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-semibold text-white">{fullName}</h2>
            <p className="text-sm text-white/40 mt-1.5 flex items-center gap-2">
              <Mail size={13} className="text-white/20" /> {data.email}
            </p>
            <p className="text-[11px] font-mono text-white/25 mt-1.5 uppercase tracking-widest flex items-center gap-2">
              <IdCard size={13} className="text-white/20" /> {data.account_id || "—"}
            </p>
          </div>
        </div>

          {/* ── Change Password ───────────────────────────────────── */}
          <Card title="Change Password" subtitle="Keep your account secure" icon={KeyRound}>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label
                  className={cn(
                    "text-[10px] font-medium uppercase tracking-widest mb-1.5 block transition-colors",
                    verifyMsg?.type === "success"
                      ? "text-green-400"
                      : verifyMsg?.type === "error"
                      ? "text-red-400"
                      : "text-white/40"
                  )}
                >
                  {verifyMsg?.type === "success"
                    ? "Password Verified"
                    : verifyMsg?.type === "error"
                    ? "Password Incorrect"
                    : "Current Password"}
                </label>
                <div className="flex items-stretch gap-2">
                  <input
                    type="password"
                    className={cn(inputClass, "flex-1 min-w-0")}
                    value={pwd.current_password}
                    onChange={(e) => {
                      setPwd((p) => ({ ...p, current_password: e.target.value }));
                      // Editing invalidates any previous verification/result
                      if (pwdVerified) setPwdVerified(false);
                      if (pwdSuccess) setPwdSuccess(false);
                      setVerifyMsg(null);
                    }}
                    placeholder="••••••••"
                    disabled={isVerifying}
                    required
                  />
                  <button
                    type="button"
                    onClick={handleVerifyPassword}
                    disabled={!pwd.current_password || isVerifying || pwdVerified}
                    title={pwdVerified ? "Current password verified" : "Verify current password"}
                    className={cn(
                      "w-11 shrink-0 rounded-md border flex items-center justify-center transition-all",
                      pwdVerified
                        ? "bg-green-500/10 border-green-500/30 text-green-400"
                        : "bg-blue-500/20 border-blue-500/30 text-blue-400 hover:bg-blue-500/30",
                      (!pwd.current_password || isVerifying) && "opacity-40 cursor-not-allowed"
                    )}
                  >
                    {isVerifying ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                  </button>
                </div>
              </div>
              <div>
                <FieldLabel>New Password</FieldLabel>
                <input
                  type="password"
                  className={cn(inputClass, !pwdVerified && "opacity-40 cursor-not-allowed")}
                  value={pwd.new_password}
                  onChange={(e) => {
                    setPwd((p) => ({ ...p, new_password: e.target.value }));
                    if (pwdSuccess) setPwdSuccess(false);
                  }}
                  placeholder={pwdVerified ? "At least 8 characters" : "Verify current password first"}
                  disabled={!pwdVerified}
                  required
                />
              </div>

              {pwdMsg?.type === "error" && (
                <div className="px-3.5 py-2.5 rounded-md text-xs flex items-center gap-2 bg-red-900/20 border border-red-500/20 text-red-400">
                  <span>⚠</span>
                  {pwdMsg.text}
                </div>
              )}

              <div className="flex items-stretch gap-2 w-full">
                <div className="w-[35%] flex">
                  <Tooltip content="Reset through mail verification not available for custom users" wide>
                    <button
                      type="button"
                      onClick={handleResetPwd}
                      className="w-full h-full px-3 rounded-md bg-white/5 border border-white/10 flex items-center justify-center gap-2 hover:bg-white/10 hover:border-white/20 transition-all text-[11px] font-semibold text-white/60 uppercase tracking-wider"
                    >
                      <img src={gmailIcon} alt="Gmail" className="h-4 w-auto" />
                      Reset
                    </button>
                  </Tooltip>
                </div>
                <button
                  type="submit"
                  disabled={isSubmitDisabled}
                  className={cn(
                    "w-[65%] px-4 py-2.5 rounded-md border transition-all text-xs font-semibold uppercase tracking-widest flex items-center justify-center",
                    pwdSuccess
                      ? "bg-green-500/10 border-green-500/30 text-green-400"
                      : isSubmitDisabled
                      ? "bg-blue-500/20 border-blue-500/30 text-blue-400 opacity-40 cursor-not-allowed"
                      : "bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10"
                  )}
                >
                  {isSavingPwd ? <Loader2 size={16} className="animate-spin" /> : "Update"}
                </button>
              </div>
            </form>
          </Card>
        </div>

          {/* ── Account ───────────────────────────────────────────── */}
          <Card
            title="Account"
            subtitle="Your account information"
            icon={IdCard}
            headerRight={
              <button
                onClick={() => setAccountDrawerOpen(true)}
                className="self-start p-1.5 rounded-md border border-blue-500/20 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 hover:border-blue-500/30 transition-all"
                title="Edit Account"
              >
                <Pencil size={13} />
              </button>
            }
          >
            <InfoRow icon={UserIcon} label="Full Name" value={fullName} />
            <InfoRow icon={Mail} label="Email" value={data.email} />
            <InfoRow icon={Phone} label="Mobile" value={data.mobile} />
            <InfoRow icon={UserIcon} label="Gender" value={data.gender} />
            <InfoRow icon={UserIcon} label="Role" value={data.role || "User"} />
            <InfoRow icon={IdCard} label="Account ID" value={data.account_id} />
          </Card>

          {/* ── Company Details (from /api/company-profile/) ──────────── */}
          <Card
            title="Company"
            subtitle="Company information"
            icon={Building2}
            headerRight={
              <button
                onClick={() => setDrawerOpen(true)}
                className="self-start flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-blue-500/20 bg-blue-500/20 text-[10px] font-semibold uppercase tracking-wider text-blue-400 hover:bg-blue-500/30 hover:border-blue-500/30 transition-all"
              >
                View
                <FaArrowUpRightFromSquare size={10} />
              </button>
            }
          >
            <InfoRow icon={Building2} label="Company Name" value={company?.company_name} />
            <InfoRow icon={MapPin} label="Address" value={company?.company_address} />
            <InfoRow icon={Landmark} label="GSTIN" value={company?.gstin} />
            <InfoRow icon={FileText} label="PAN Number" value={company?.pan_number} />
            <InfoRow icon={Globe} label="Website" value={company?.website} />
            <InfoRow icon={MapPin} label="State" value={company?.state} />
          </Card>
        </div>
      </div>

      {/* Company Profile Drawer */}
      <CompanyProfileDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onUpdate={() => {
          // Re-fetch company profile after save
          axios
            .get("/api/company-profile/")
            .then((res) => setCompany(res.data?.data || null))
            .catch(() => {});
        }}
      />

      {/* Edit Account Drawer */}
      <EditAccountDrawer
        key={accountDrawerOpen ? `edit-${Date.now()}` : "edit-closed"}
        open={accountDrawerOpen}
        onClose={() => setAccountDrawerOpen(false)}
        user={data}
        onUpdate={() => {
          // Re-fetch profile after save
          axios
            .get("/api/auth/profile/")
            .then((res) => {
              const d = res.data?.data || {};
              setProfile(d);
            })
            .catch(() => {});
        }}
      />
    </div>
  );
};

export default ProfileTab;
