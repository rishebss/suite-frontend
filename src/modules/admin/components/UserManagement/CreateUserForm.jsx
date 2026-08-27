import React, { useState } from "react";
import { Mail, Lock, User, Phone, Shield, Building2, Loader2, ChevronDown } from "lucide-react";
import { useDepartments } from "../../hooks/useUsers";

const InputField = ({ icon: Icon, label, value, onChange, type = "text", options = [], name }) => {
  const [showSelectDropdown, setShowSelectDropdown] = useState(false);

  if (type === "select") {
    return (
      <div className="relative py-2 border-b border-white/5 last:border-0">
        <p className="text-[10px] text-white/30 mb-0.5 uppercase tracking-widest">{label}</p>
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30">
            <Icon size={14} />
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowSelectDropdown(!showSelectDropdown);
            }}
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-3 py-2 text-sm text-white outline-none focus:border-white/20 transition-all text-left flex items-center justify-between"
          >
            <span>{value ? options.find(o => (o.value || o) === value)?.label || value : "Select"}</span>
            <ChevronDown size={14} className="text-white/40" />
          </button>
          {showSelectDropdown && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-900/95 border border-white/5 rounded-lg shadow-2xl z-50 max-h-48 overflow-y-auto backdrop-blur-sm">
              {options.map((opt) => (
                <button
                  key={opt.value || opt}
                  onClick={() => {
                    onChange({ target: { name, value: opt.value || opt } });
                    setShowSelectDropdown(false);
                  }}
                  className={`w-full px-4 py-2.5 text-left text-xs transition-all duration-150 ${
                    value === (opt.value || opt) 
                      ? 'text-blue-400 bg-blue-500/10 border-l-2 border-blue-500' 
                      : 'text-white/70 hover:text-white hover:bg-white/5 border-l-2 border-transparent'
                  }`}
                >
                  {opt.label || opt || "None"}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="py-2 border-b border-white/5 last:border-0">
      <p className="text-[10px] text-white/30 mb-0.5 uppercase tracking-widest">{label}</p>
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30">
          <Icon size={14} />
        </div>
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-3 py-2 text-sm text-white outline-none focus:border-white/20 transition-all"
        />
      </div>
    </div>
  );
};

const CreateUserForm = ({ onSubmit, onCancel }) => {
  const { departments, loading: loadingDeps } = useDepartments();
  const [formData, setFormData] = useState({
    email: "",
    first_name: "",
    last_name: "",
    mobile: "",
    password: "",
    password_confirm: "",
    role: "User",
    gender: "",
    department_id: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const roles = [
    { value: "User", label: "User" },
    { value: "Staff", label: "Staff" },
    { value: "Manager", label: "Manager" },
    { value: "Admin", label: "Admin" },
    { value: "Vendor", label: "Vendor" },
    { value: "Superadmin", label: "Superadmin" },
  ];
  const genders = [
    { value: "", label: "Select Gender" },
    { value: "Male", label: "Male" },
    { value: "Female", label: "Female" },
    { value: "Other", label: "Other" },
  ];
  const deptOptions = [
    { value: "", label: "No Group" },
    ...(departments || []).map(dept => ({ value: dept.id, label: dept.name }))
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.first_name || !formData.last_name) {
      setError("Email, first name, and last name are required");
      return;
    }

    if (formData.password !== formData.password_confirm) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    try {
      const submissionData = { ...formData };
      if (!submissionData.department_id) delete submissionData.department_id;
      if (!submissionData.gender) delete submissionData.gender;

      await onSubmit(submissionData);
    } catch (err) {
      setError(err.message || "Error creating user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full max-w-3xl bg-zinc-950 border border-zinc-800 rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
      <div className="px-8 pt-8 pb-6 border-b border-white/5 shrink-0">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-white">Create New User</h2>
            <p className="text-sm text-white/40 mt-2">Fill in the details to add a new user</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col min-h-0">
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="px-8 py-4">
            <h3 className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-4">Primary Identity</h3>
            
            {error && (
              <div className="p-4 bg-red-900/20 border border-red-500/20 rounded-lg text-red-400 text-sm mb-4">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <InputField
                icon={User}
                label="First Name"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
              />
              <InputField
                icon={User}
                label="Last Name"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <InputField
                icon={Mail}
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
              />
              <InputField
                icon={Phone}
                label="Phone"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <InputField
                icon={User}
                label="Gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                type="select"
                options={genders}
              />
              <InputField
                icon={Shield}
                label="Role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                type="select"
                options={roles}
              />
            </div>
          </div>

          <div className="px-8 py-4 border-t border-white/5">
            <h3 className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-4">Organization</h3>
            <InputField
              icon={Building2}
              label="Group / Department"
              name="department_id"
              value={formData.department_id}
              onChange={handleChange}
              type="select"
              options={deptOptions}
            />
          </div>

          <div className="px-8 py-4 border-t border-white/5">
            <h3 className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-4">Account Security</h3>
            <div className="grid grid-cols-2 gap-4">
              <InputField
                icon={Lock}
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
              />
              <InputField
                icon={Lock}
                label="Confirm Password"
                name="password_confirm"
                type="password"
                value={formData.password_confirm}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        <div className="px-8 py-6 border-t border-white/5 flex justify-end gap-2 shrink-0">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-white/5 border border-white/10 text-white/60 rounded-md text-xs uppercase tracking-widest hover:bg-white/10 transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-md text-xs uppercase tracking-widest hover:bg-blue-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : null}
            {loading ? "Creating..." : "Create User"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateUserForm;
