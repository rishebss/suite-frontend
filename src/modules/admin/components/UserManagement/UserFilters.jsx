/**
 * User Filters Component
 * Filtering and search controls for user list
 */

import React, { useState } from "react";
import { Search, Filter, X } from "lucide-react";
import { useDepartments } from "../../hooks/useUsers";

const UserFilters = ({ filters, onFilterChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { departments } = useDepartments();

  const handleChange = (field, value) => {
    const newFilters = { ...filters, [field]: value };
    onFilterChange(newFilters);
  };

  const handleClearFilters = () => {
    onFilterChange({
      search: "",
      role: "",
      department: "",
      status: "",
    });
  };

  const roles = ["User", "Staff", "Manager", "Admin", "Vendor", "Superadmin"];
  const statuses = [
    { value: "true", label: "Active" },
    { value: "false", label: "Inactive" },
  ];

  const hasActiveFilters = Object.values(filters).some((v) => v !== "");

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-3.5 w-5 h-5 text-white/40 pointer-events-none" />
        <input
          type="text"
          placeholder="Search by email, name, or account ID..."
          value={filters.search}
          onChange={(e) => handleChange("search", e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500 transition-colors duration-200"
        />
      </div>

      {/* Filter Toggle and Pill Display */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors duration-200"
        >
          <Filter className="w-4 h-4" />
          Filters
        </button>

        {hasActiveFilters && (
          <button
            onClick={handleClearFilters}
            className="flex items-center gap-1 px-3 py-1 text-sm text-white/60 hover:text-white transition-colors duration-200"
          >
            <X className="w-4 h-4" />
            Clear Filters
          </button>
        )}
      </div>

      {/* Filter Panel */}
      {isOpen && (
        <div className="p-4 bg-zinc-800/30 border border-zinc-700 rounded-lg space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Role Filter */}
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Role
              </label>
              <select
                value={filters.role}
                onChange={(e) => handleChange("role", e.target.value)}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
              >
                <option value="">All Roles</option>
                {roles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleChange("status", e.target.value)}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
              >
                <option value="">All Status</option>
                {statuses.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Department Filter */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Group / Department
            </label>
            <select
              value={filters.department}
              onChange={(e) => handleChange("department", e.target.value)}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
            >
              <option value="">All Groups</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.name}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Active Filter Pills */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.role && (
            <div className="px-3 py-1 bg-blue-900/30 border border-blue-500 rounded-full text-white text-sm flex items-center gap-2">
              Role: {filters.role}
              <button
                onClick={() => handleChange("role", "")}
                className="hover:text-blue-200"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
          {filters.status && (
            <div className="px-3 py-1 bg-blue-900/30 border border-blue-500 rounded-full text-white text-sm flex items-center gap-2">
              Status: {filters.status === "true" ? "Active" : "Inactive"}
              <button
                onClick={() => handleChange("status", "")}
                className="hover:text-blue-200"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
          {filters.department && (
            <div className="px-3 py-1 bg-emerald-900/30 border border-emerald-500 rounded-full text-white text-sm flex items-center gap-2">
              Group: {filters.department}
              <button
                onClick={() => handleChange("department", "")}
                className="hover:text-emerald-200"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserFilters;
