/**
 * User Row Component
 * Individual row in user table with actions
 */

import React from "react";
import { Edit2, Trash2, Eye, Badge, Clock } from "lucide-react";
import { formatDistanceToNow, parseISO } from "date-fns";

const UserRow = ({
  user,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
  onViewDetails,
}) => {
  const getStatusColor = (isActive) => {
    return isActive ? "text-green-400" : "text-red-400";
  };

  const getRoleBadgeColor = (role) => {
    const colors = {
      Superadmin: "bg-purple-900/30 text-purple-300 border-purple-500",
      Admin: "bg-blue-900/30 text-blue-300 border-blue-500",
      Manager: "bg-orange-900/30 text-orange-300 border-orange-500",
      Staff: "bg-yellow-900/30 text-yellow-300 border-yellow-500",
      Vendor: "bg-pink-900/30 text-pink-300 border-pink-500",
      User: "bg-gray-900/30 text-gray-300 border-gray-500",
    };
    return colors[role] || "bg-gray-900/30 text-gray-300 border-gray-500";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Never";
    try {
      const date =
        typeof dateString === "string" ? parseISO(dateString) : dateString;
      return formatDistanceToNow(date, { addSuffix: true });
    } catch {
      return dateString;
    }
  };

  return (
    <tr className="hover:bg-white/[0.02] transition-all duration-300 border-b border-zinc-800">
      <td className="px-6 py-4">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => onSelect(e.target.checked)}
          className="cursor-pointer"
        />
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.first_name}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
              <span className="text-xs font-semibold text-blue-300">
                {user.first_name?.[0]}
                {user.last_name?.[0]}
              </span>
            </div>
          )}
          <div>
            <p className="text-white font-medium">
              {user.first_name} {user.last_name}
            </p>
            <p className="text-white/40 text-xs">{user.account_id}</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <p className="text-white/60 text-sm">{user.email}</p>
      </td>
      <td className="px-6 py-4">
        <span
          className={`px-3 py-1 rounded-full border text-xs font-semibold ${getRoleBadgeColor(user.role)}`}
        >
          {user.role}
        </span>
      </td>
      <td className="px-6 py-4">
        <p className="text-white/60 text-sm">{user.department_name || "-"}</p>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${user.is_active ? "bg-green-500" : "bg-red-500"}`}
          />
          <span
            className={`text-sm font-semibold ${getStatusColor(user.is_active)}`}
          >
            {user.is_active ? "Active" : "Inactive"}
          </span>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-1 text-white/60 text-sm">
          <Clock className="w-4 h-4" />
          {formatDate(user.last_login)}
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex justify-end gap-2">
          <button
            onClick={onViewDetails}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-200 text-white/60 hover:text-white"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={onEdit}
            className="p-2 hover:bg-blue-500/20 rounded-lg transition-colors duration-200 text-blue-400 hover:text-blue-300"
            title="Edit"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 hover:bg-red-500/20 rounded-lg transition-colors duration-200 text-red-400 hover:text-red-300"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default UserRow;
