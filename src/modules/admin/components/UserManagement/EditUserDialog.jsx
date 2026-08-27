/**
 * Edit User Dialog Component
 * Modal for editing user details
 */

import React, { useState } from "react";
import { Save, X, User, Phone, Shield, Building2 } from "lucide-react";
import Input from "../../../../components/Input";
import { useDepartments } from "../../hooks/useUsers";

const EditUserDialog = ({ user, onSubmit, onCancel }) => {
  const { departments } = useDepartments();
  const [formData, setFormData] = useState({
    first_name: user.first_name || "",
    last_name: user.last_name || "",
    mobile: user.mobile || "",
    gender: user.gender || "",
    role: user.role || "User",
    department_id: user.department?.id || "",
    is_active: user.is_active ?? true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const roles = ["User", "Staff", "Manager", "Admin", "Vendor", "Superadmin"];
  const genders = ["Male", "Female", "Other"];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.first_name || !formData.last_name) {
      setError("First name and last name are required");
      return;
    }

    setLoading(true);
    try {
      const submissionData = { ...formData };
      if (!submissionData.department_id) submissionData.department_id = null;

      await onSubmit(user.id, submissionData);
    } catch (err) {
      setError(err.message || "Error updating user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="sticky top-0 px-8 py-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50 backdrop-blur">
          <h2 className="text-2xl font-black text-white tracking-tight">Edit User</h2>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-200"
          >
            <X className="w-5 h-5 text-white/60" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="p-4 bg-red-900/20 border border-red-500 rounded-lg text-red-300 text-sm">
              {error}
            </div>
          )}

          {/* User ID (Read-only) */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-white/60 mb-2">
                Account ID
              </label>
              <div className="px-4 py-2 bg-zinc-800/50 border border-zinc-700 rounded-lg text-white/40">
                {user.account_id}
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-white/60 mb-2">
                Email
              </label>
              <div className="px-4 py-2 bg-zinc-800/50 border border-zinc-700 rounded-lg text-white/40">
                {user.email}
              </div>
            </div>
          </div>

          {/* Name Row */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="First Name"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              placeholder="John"
              icon={User}
              required
            />
            <Input
              label="Last Name"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              placeholder="Doe"
              icon={User}
              required
            />
          </div>

          {/* Contact Row */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Mobile"
              name="mobile"
              value={formData.mobile}
              onChange={handleChange}
              placeholder="9876543210"
              icon={Phone}
            />
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Gender
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500 transition-colors"
              >
                <option value="">Select Gender</option>
                {genders.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Role & Department Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-white mb-2 flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-400" />
                User Role
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500 transition-colors"
                required
              >
                {roles.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-white mb-2 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-400" />
                Group / Department
              </label>
              <select
                name="department_id"
                value={formData.department_id}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500 transition-colors"
              >
                <option value="">No Group</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>
          </div>


          {/* Status */}
          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
                className="cursor-pointer"
              />
              <span className="text-sm font-semibold text-white">
                {formData.is_active ? "Account Active" : "Account Inactive"}
              </span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-6 border-t border-zinc-700">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg font-semibold transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white rounded-lg font-semibold transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUserDialog;
