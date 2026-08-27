import React, { useState, useRef, useEffect } from "react";
import {
  Mail,
  Phone,
  User,
  Building2,
  Users,
  Calendar,
  CheckCircle,
  XCircle,
  Shield,
  Copy,
  Check,
  Badge as BadgeIcon,
  Power,
  Loader2,
  Plus,
  ChevronDown,
} from "lucide-react";
import { formatISO, parseISO, format } from "date-fns";
import { TbEdit } from "react-icons/tb";
import { Trash2 } from "lucide-react";
import UserMenusPanel from "./UserMenusPanel";

const ROLE_STYLES = {
  Superadmin: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  Admin: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  Manager: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  Staff: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  Vendor: "bg-pink-500/10 text-pink-400 border-pink-500/20",
  User: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
};

const Field = ({ icon: Icon, label, value, actions }) => {
  return (
    <div className="flex items-start gap-3 py-2 border-b border-white/5 last:border-0">
      <div className="w-7 h-7 rounded-md bg-white/5 flex items-center justify-center text-white/30 shrink-0 mt-0.5">
        <Icon size={13} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-white/30 mb-0.5 uppercase tracking-widest">{label}</p>
        {typeof value === 'string' ? (
          <p className="text-sm text-white truncate">{value || "nil"}</p>
        ) : (
          value || "nil"
        )}
      </div>
      {actions && <div className="flex items-center gap-1 shrink-0">{actions}</div>}
    </div>
  );
};

const InputField = ({ icon: Icon, label, value, onChange, type = "text", options = [], disabled = false }) => {
  const [showSelectDropdown, setShowSelectDropdown] = useState(false);
  const selectRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setShowSelectDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const disabledInputClass = "w-full bg-white/[0.01] border border-zinc-800/50 rounded-lg px-3 py-2 text-sm text-white/30 cursor-not-allowed";

  if (type === "select") {
    return (
      <div ref={selectRef} className="relative flex items-start gap-3 py-2 border-b border-white/5 last:border-0">
        <div className="w-7 h-7 rounded-md bg-white/5 flex items-center justify-center text-white/30 shrink-0 mt-0.5">
          <Icon size={13} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] text-white/30 mb-0.5 uppercase tracking-widest">{label}</p>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (!disabled) setShowSelectDropdown(!showSelectDropdown);
            }}
            disabled={disabled}
            className={`w-full border rounded-lg px-3 py-2 text-sm outline-none transition-all text-left flex items-center justify-between ${
              disabled
                ? "bg-white/[0.01] border-zinc-800/50 text-white/30 cursor-not-allowed"
                : "bg-white/5 border-white/10 text-white focus:border-white/20"
            }`}
          >
            <span>{value || "Select"}</span>
            <ChevronDown size={14} className="text-white/40" />
          </button>
          {showSelectDropdown && !disabled && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-900/95 border border-white/5 rounded-lg shadow-2xl z-50 max-h-48 overflow-y-auto backdrop-blur-sm">
              {options.map((opt) => (
                <button
                  key={opt}
                  onClick={() => {
                    onChange(opt);
                    setShowSelectDropdown(false);
                  }}
                  className={`w-full px-4 py-2.5 text-left text-xs transition-all duration-150 ${
                    value === opt 
                      ? 'text-blue-400 bg-blue-500/10 border-l-2 border-blue-500' 
                      : 'text-white/70 hover:text-white hover:bg-white/5 border-l-2 border-transparent'
                  }`}
                >
                  {opt || "None"}
                </button>
              ))}
            </div>
          )}
          {disabled && (
            <p className="text-[8px] text-white/15 mt-1 uppercase tracking-widest">Protected field</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 py-2 border-b border-white/5 last:border-0">
      <div className="w-7 h-7 rounded-md bg-white/5 flex items-center justify-center text-white/30 shrink-0 mt-0.5">
        <Icon size={13} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-white/30 mb-0.5 uppercase tracking-widest">{label}</p>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={disabled ? disabledInputClass : "w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-white/20 transition-all"}
        />
        {disabled && (
          <p className="text-[8px] text-white/15 mt-1 uppercase tracking-widest">Protected field</p>
        )}
      </div>
    </div>
  );
};

const CopyButton = ({ text }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button onClick={handleCopy} className="p-1.5 rounded-md hover:bg-blue-500/10 text-blue-500/60 hover:text-blue-400 transition-colors" title="Copy">
      {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
    </button>
  );
};

const UserDetail = ({ user, departments = [], initialEditMode = false, onClose, onDelete, onToggleActive, onSave, onOpenAssignModal, isToggling = false, isSaving = false }) => {
  const [isEditing, setIsEditing] = useState(initialEditMode);
  const [editedUser, setEditedUser] = useState(user);
  const [showGroupDropdown, setShowGroupDropdown] = useState(false);
  const [isAssigningGroup, setIsAssigningGroup] = useState(false);
  const dropdownRef = useRef(null);
  
  const getCurrentDepartments = () => {
    if (isEditing) {
      return editedUser.departments || [];
    }
    return user.departments || [];
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date =
        typeof dateString === "string" ? parseISO(dateString) : dateString;
      return format(date, "MMMM d, yyyy h:mm a");
    } catch {
      return dateString;
    }
  };

  const handleSave = async () => {
    const userToSave = { ...user, ...editedUser };
    userToSave.department_ids = (editedUser.departments || []).map(d => d.id);
    
    console.log("UserDetail.handleSave: userToSave =", userToSave);
    
    await onSave(userToSave);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedUser(user);
    setIsEditing(false);
  };

  const toggleDepartment = (department) => {
    const currentDepts = getCurrentDepartments();
    const isSelected = currentDepts.some(d => d.id === department.id);
    
    let newDepts;
    if (isSelected) {
      newDepts = currentDepts.filter(d => d.id !== department.id);
    } else {
      newDepts = [...currentDepts, department];
    }
    
    setEditedUser(prev => ({ ...prev, departments: newDepts }));
  };

  const handleGroupSelect = async (department) => {
    console.log("UserDetail.handleGroupSelect: department =", department, "isEditing =", isEditing);
    setShowGroupDropdown(false);
    if (isEditing) {
      toggleDepartment(department);
    } else {
      setIsAssigningGroup(true);
      const currentDepts = user.departments || [];
      const isSelected = currentDepts.some(d => d.id === department.id);
      let newDepts;
      if (isSelected) {
        newDepts = currentDepts.filter(d => d.id !== department.id);
      } else {
        newDepts = [...currentDepts, department];
      }
      const userToSave = { ...user, departments: newDepts, department_ids: newDepts.map(d => d.id) };
      console.log("UserDetail.handleGroupSelect: userToSave (non-edit) =", userToSave);
      const serverResponse = await onSave(userToSave);
      console.log("UserDetail.handleGroupSelect: serverResponse =", serverResponse);
      setIsAssigningGroup(false);
    }
  };

  useEffect(() => {
    if (initialEditMode) {
      setEditedUser(JSON.parse(JSON.stringify(user)));
    }
    setIsEditing(initialEditMode);
  }, [initialEditMode]);

  useEffect(() => {
    if (!isEditing) {
      setEditedUser(user);
    }
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowGroupDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative w-full max-w-3xl bg-zinc-950 border border-zinc-800 rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
      {/* Header */}
      <div className="px-8 pt-8 pb-6 border-b border-white/5 shrink-0">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 text-2xl font-bold shrink-0">
              {(isEditing ? editedUser : user).first_name?.charAt(0).toUpperCase()}
              {(isEditing ? editedUser : user).last_name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">
                {(isEditing ? editedUser : user).first_name} {(isEditing ? editedUser : user).last_name}
              </h2>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-[10px] font-mono text-white/20 uppercase tracking-widest">{user.account_id}</span>
                {!isEditing && (
                  <>
                    <span className="text-[11px] px-3 py-1 rounded-md border font-semibold uppercase tracking-wider border-zinc-700/50 bg-zinc-900/30 text-zinc-400">
                      {user.role}
                    </span>
                    {user.is_active ? (
                      <span className="text-[11px] px-3 py-1 rounded-md border font-semibold uppercase tracking-wider border-green-500/20 bg-green-500/10 text-green-400">
                        Active
                      </span>
                    ) : (
                      <span className="text-[11px] px-3 py-1 rounded-md border font-semibold uppercase tracking-wider border-red-500/20 bg-red-500/10 text-red-400">
                        Inactive
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isEditing && (
              <button
                onClick={onToggleActive}
                disabled={isToggling}
                className="p-2 rounded-lg transition-colors z-10"
                title={user.is_active ? "Deactivate" : "Activate"}
              >
                {isToggling ? (
                  <Loader2 size={18} className="text-white/40 animate-spin" />
                ) : (
                  <Power
                    size={18}
                    className={user.is_active ? "text-red-400 hover:bg-red-500/10" : "text-green-400 hover:bg-green-500/10"}
                  />
                )}
              </button>
            )}
            {!isEditing && (
              <button
                onClick={() => {
                  setEditedUser(JSON.parse(JSON.stringify(user)));
                  setIsEditing(true);
                }}
                className="p-2 rounded-lg transition-colors z-10"
                title="Edit"
              >
                <TbEdit size={21} className="text-blue-400 hover:bg-blue-500/10" />
              </button>
            )}
            {isEditing ? (
              <>
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 bg-white/5 border border-white/10 text-white/60 rounded-md text-xs uppercase tracking-widest hover:bg-white/10 transition-all z-10"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-4 py-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-md text-xs uppercase tracking-widest hover:bg-blue-500/20 transition-all flex items-center gap-2 disabled:opacity-50 z-10"
                >
                  {isSaving && <Loader2 size={14} className="animate-spin" />}
                  Save
                </button>
              </>
            ) : (
              <button
                onClick={onDelete}
                className="p-2 rounded-lg transition-colors z-10"
                title="Delete"
              >
                <Trash2 size={19} className="text-red-400 hover:bg-red-500/10" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden flex min-h-0">
        {/* Left Column */}
        <div className="w-1/2 border-r border-white/5 overflow-y-auto custom-scrollbar">
          <div className="px-8 py-4">
            <h3 className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-4">Primary Identity</h3>
            
            {isEditing ? (
              <>
                <InputField
                  icon={User}
                  label="First Name"
                  value={editedUser.first_name}
                  onChange={(val) => setEditedUser(prev => ({ ...prev, first_name: val }))}
                />
                <InputField
                  icon={User}
                  label="Last Name"
                  value={editedUser.last_name}
                  onChange={(val) => setEditedUser(prev => ({ ...prev, last_name: val }))}
                />
                <InputField
                  icon={Mail}
                  label="Email"
                  value={editedUser.email}
                  onChange={(val) => setEditedUser(prev => ({ ...prev, email: val }))}
                  type="email"
                  disabled={user.role === "Superadmin"}
                />
                <InputField
                  icon={Phone}
                  label="Phone"
                  value={editedUser.mobile || ""}
                  onChange={(val) => setEditedUser(prev => ({ ...prev, mobile: val }))}
                />
                <InputField
                  icon={User}
                  label="Gender"
                  value={editedUser.gender || ""}
                  onChange={(val) => setEditedUser(prev => ({ ...prev, gender: val }))}
                  type="select"
                  options={["", "Male", "Female", "Other"]}
                />
                <InputField
                  icon={Shield}
                  label="Role"
                  value={editedUser.role}
                  onChange={(val) => setEditedUser(prev => ({ ...prev, role: val }))}
                  type="select"
                  options={["Superadmin", "Admin", "Manager", "Staff", "Vendor", "User", "Others"]}
                  disabled={user.role === "Superadmin"}
                />
              </>
            ) : (
              <>
                <Field
                  icon={User}
                  label="Full Name"
                  value={`${user.first_name} ${user.last_name}`}
                />
                <Field
                  icon={Mail}
                  label="Email"
                  value={user.email}
                  actions={<CopyButton text={user.email} />}
                />
                <Field
                  icon={Phone}
                  label="Phone"
                  value={user.mobile}
                  actions={user.mobile && <CopyButton text={user.mobile} />}
                />
                <Field
                  icon={User}
                  label="Gender"
                  value={user.gender}
                />
                <Field
                  icon={Shield}
                  label="Role"
                  value={user.role}
                />
              </>
            )}
          </div>

          <div ref={dropdownRef} className="px-8 py-4 border-t border-white/5 relative">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Groups</h3>
              {user.role !== "Superadmin" && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowGroupDropdown(!showGroupDropdown);
                  }}
                  className="p-1.5 rounded-md border border-blue-500/30 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors"
                  title="Add Group"
                >
                  <Plus size={14} />
                </button>
              )}
            </div>
            
            {isEditing ? (
              <>
                <div className="py-2 border-b border-white/5 last:border-0">
                  <div className="flex flex-wrap gap-2 mb-2">
                    {getCurrentDepartments().length > 0 ? (
                      getCurrentDepartments().map(dept => (
                        <div 
                          key={dept.id} 
                          className="px-2 py-1 bg-blue-500/10 border border-blue-500/20 rounded-md text-xs text-blue-400 flex items-center gap-1"
                        >
                          {dept.name}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleDepartment(dept);
                            }}
                            className="text-blue-400/50 hover:text-blue-400"
                          >
                            &times;
                          </button>
                        </div>
                      ))
                    ) : (
                      <span className="text-sm text-white/20">No groups</span>
                    )}
                  </div>
                  {user.role !== "Superadmin" && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowGroupDropdown(!showGroupDropdown);
                      }}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-white/20 transition-all text-left flex items-center justify-between"
                    >
                      <span className="text-white/30">Add group...</span>
                      <ChevronDown size={14} className="text-white/40" />
                    </button>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="py-2 border-b border-white/5 last:border-0">
                  {isAssigningGroup ? (
                    <div className="flex items-center gap-2">
                      <Loader2 size={12} className="animate-spin text-blue-400" />
                      <span className="text-sm text-white/40">Updating...</span>
                    </div>
                  ) : (getCurrentDepartments().length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {getCurrentDepartments().map(dept => (
                        <div 
                          key={dept.id} 
                          className="px-2 py-1 bg-blue-500/10 border border-blue-500/20 rounded-md text-xs text-blue-400"
                        >
                          {dept.name}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-white/20">nil</p>
                  ))}
                </div>
              </>
            )}
            
            {showGroupDropdown && (
              <div className="absolute z-50 left-0 right-0 mt-2 bg-zinc-900/95 border border-white/5 rounded-lg shadow-2xl max-h-48 overflow-y-auto backdrop-blur-sm">
                {departments.map((dept) => {
                  const isSelected = getCurrentDepartments().some(d => d.id === dept.id);
                  return (
                    <button
                      key={dept.id}
                      onClick={() => {
                        if (isEditing) {
                          toggleDepartment(dept);
                        } else {
                          handleGroupSelect(dept);
                        }
                        setShowGroupDropdown(false);
                      }}
                      className={`w-full px-4 py-2.5 text-left text-xs transition-all duration-150 ${
                        isSelected 
                          ? 'text-blue-400 bg-blue-500/10 border-l-2 border-blue-500' 
                          : 'text-white/70 hover:text-white hover:bg-white/5 border-l-2 border-transparent'
                      }`}
                    >
                      {dept.name}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="w-1/2 overflow-y-auto custom-scrollbar">
          <div className="px-8 py-6">
            <h3 className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-6">Account Details</h3>
            <Field
              icon={BadgeIcon}
              label="Account ID"
              value={user.account_id}
              actions={<CopyButton text={user.account_id} />}
            />
          </div>

          <div className="px-8 py-6 border-t border-white/5">
            <h3 className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-6">Account Timeline</h3>
            <Field
              icon={Calendar}
              label="Account Created"
              value={formatDate(user.created_at)}
            />
            <Field
              icon={Calendar}
              label="Last Updated"
              value={formatDate(user.updated_at)}
            />
            <Field
              icon={BadgeIcon}
              label="Last Login"
              value={user.last_login ? formatDate(user.last_login) : "Never"}
            />
          </div>

          {/* ── Menu Access Summary ─────────────────────────────── */}
          {user.role !== "Superadmin" && (
            <UserMenusPanel
              user={user}
              onOpenAssignModal={onOpenAssignModal}
            />
          )}

          <div className="px-8 py-5 border-t border-white/5">
            <h3 className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-4">Verification Status</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between py-2.5 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-md bg-white/5 flex items-center justify-center text-white/30 shrink-0">
                    <CheckCircle size={13} className={user.email_verified ? "text-green-400" : "text-white/20"} />
                  </div>
                  <span className="text-[10px] text-white/30 uppercase tracking-widest">Email Verified</span>
                </div>
                <span className={`text-xs font-semibold ${user.email_verified ? "text-green-400" : "text-red-400"}`}>
                  {user.email_verified ? "Yes" : "No"}
                </span>
              </div>
              <div className="flex items-center justify-between py-2.5">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-md bg-white/5 flex items-center justify-center text-white/30 shrink-0">
                    <CheckCircle size={13} className={user.mobile_verified ? "text-green-400" : "text-white/20"} />
                  </div>
                  <span className="text-[10px] text-white/30 uppercase tracking-widest">Phone Verified</span>
                </div>
                <span className={`text-xs font-semibold ${user.mobile_verified ? "text-green-400" : "text-red-400"}`}>
                  {user.mobile_verified ? "Yes" : "No"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-8 py-6 border-t border-white/5 bg-white/[0.005] shrink-0 flex items-center justify-between">
        <div className="text-[10px] text-white/20 font-mono uppercase tracking-widest">
          Account ID: {user.account_id}
        </div>
        <button
          onClick={onClose}
          className="px-6 py-2 rounded-md bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white transition-all text-xs uppercase tracking-widest"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default UserDetail;
