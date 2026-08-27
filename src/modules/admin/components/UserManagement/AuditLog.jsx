/**
 * Audit Log Component
 * Display user activities and audit log in table format
 */

import React, { useEffect, useState, useRef } from "react";
import { useAuditLog } from "../../hooks/useUsers";
import {
  Activity,
  Shield,
  Key,
  Mail,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { formatDistanceToNow, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import RingLoader from "@/components/ui/RingLoader";

const getActionIcon = (action) => {
  const icons = {
    login: <Shield className="w-3.5 h-3.5 text-blue-400" />,
    logout: <Shield className="w-3.5 h-3.5 text-gray-400" />,
    password_change: <Key className="w-3.5 h-3.5 text-orange-400" />,
    email_verify: <Mail className="w-3.5 h-3.5 text-green-400" />,
    user_create: <Shield className="w-3.5 h-3.5 text-purple-400" />,
    user_update: <Shield className="w-3.5 h-3.5 text-blue-400" />,
    user_delete: <Shield className="w-3.5 h-3.5 text-red-400" />,
    profile_update: <Shield className="w-3.5 h-3.5 text-cyan-400" />,
    user_activate: <Shield className="w-3.5 h-3.5 text-emerald-400" />,
    user_role_change: <Shield className="w-3.5 h-3.5 text-amber-400" />,
  };
  return icons[action] || <Activity className="w-3.5 h-3.5 text-white/40" />;
};

const getActionLabel = (action) => {
  const labels = {
    login: "Login",
    logout: "Logout",
    password_change: "Password Changed",
    email_verify: "Email Verified",
    user_create: "User Created",
    user_update: "User Updated",
    user_delete: "User Deleted",
    profile_update: "Profile Updated",
    user_activate: "User Activated",
    user_role_change: "Role Changed",
    user_department_change: "Department Changed",
    user_supervisor_change: "Supervisor Changed",
  };
  return (
    labels[action] ||
    action
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase())
  );
};

const formatDate = (dateString) => {
  try {
    const date =
      typeof dateString === "string" ? parseISO(dateString) : dateString;
    return formatDistanceToNow(date, { addSuffix: true });
  } catch {
    return dateString;
  }
};

const AuditLog = ({ userId = null }) => {
  const {
    activities,
    loading,
    error,
    pagination,
    setPagination,
    fetchUserActivities,
    fetchAllActivities,
  } = useAuditLog();

  const [expandedRow, setExpandedRow] = useState(null);
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    if (userId) {
      fetchUserActivities(userId);
    } else {
      fetchAllActivities();
    }
  }, [userId]);

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
    setExpandedRow(null);
    // Reset scroll to top immediately before loading new page
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: "instant" });
    }
    // Fetch new page
    if (userId) {
      fetchUserActivities(userId, { page: newPage, page_size: pagination.pageSize });
    } else {
      fetchAllActivities({ page: newPage, page_size: pagination.pageSize });
    }
  };

  const toggleExpand = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  const currentPage = pagination.page;
  const totalPages = Math.ceil(pagination.count / pagination.pageSize);

  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-sm text-red-400">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl overflow-hidden divide-y divide-zinc-800 shadow-xl relative flex flex-col min-h-0 flex-1">

      {/* Loading overlay — covers entire table like ContactsTable */}
      {loading && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[4px] z-50 flex items-center justify-center">
          <RingLoader />
        </div>
      )}

      {/* Header */}
      <div className="px-8 py-3 bg-zinc-900/20 border-b border-zinc-800 shrink-0 select-none">
        <div className="grid grid-cols-12 gap-4 text-xs font-medium text-white/30 items-center">
          <div className="col-span-1">Type</div>
          <div className="col-span-3">Action</div>
          <div className="col-span-2">Performed By</div>
          <div className="col-span-2">Target</div>
          <div className="col-span-1">Status</div>
          <div className="col-span-3">Timestamp</div>
        </div>
      </div>

      {/* Content */}
      <div className="min-h-[200px] flex-1 flex flex-col">
        {activities.length === 0 && !loading ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-20">
            <div className="w-14 h-14 rounded-full bg-white/[0.02] border border-zinc-800 flex items-center justify-center text-white/10 mb-4">
              <Activity size={28} />
            </div>
            <p className="text-sm text-white/20">No audit logs found</p>
          </div>
        ) : (
          <div ref={scrollContainerRef} className="divide-y divide-zinc-800 overflow-y-auto custom-scrollbar flex-1">
            {activities.map((activity) => {
            const hasChanges =
              activity.target_changes &&
              Object.keys(activity.target_changes).length > 0;
            const isExpanded = expandedRow === activity.id;
            return (
              <React.Fragment key={activity.id}>
                <div
                  onClick={() =>
                    hasChanges ? toggleExpand(activity.id) : null
                  }
                  className={cn(
                    "grid grid-cols-12 gap-4 px-8 py-3.5 transition-all items-center group border-l-2 border-transparent hover:bg-white/[0.02]",
                    hasChanges && "cursor-pointer",
                    !hasChanges && "cursor-default",
                    isExpanded && "border-l-blue-500/50 bg-white/[0.02]",
                  )}
                >
                  {/* Icon */}
                  <div className="col-span-1 flex items-center">
                    <div className="w-7 h-7 rounded-full border bg-white/5 border-white/10 flex items-center justify-center shrink-0">
                      {getActionIcon(activity.action)}
                    </div>
                  </div>

                  {/* Action */}
                  <div className="col-span-3 flex items-center gap-2 min-w-0">
                    <span className="text-sm text-white group-hover:text-blue-400 transition-colors truncate">
                      {getActionLabel(activity.action)}
                    </span>
                    {hasChanges && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleExpand(activity.id);
                        }}
                        className="shrink-0 text-white/20 hover:text-white/60 transition-colors"
                      >
                        {isExpanded ? (
                          <ChevronDown size={12} />
                        ) : (
                          <ChevronRight size={12} />
                        )}
                      </button>
                    )}
                  </div>

                  {/* Performed By */}
                  <div className="col-span-2 flex items-center min-w-0">
                    <span className="text-xs text-white/60 truncate">
                      {activity.user_name ||
                        activity.user_email ||
                        "\u2014"}
                    </span>
                  </div>

                  {/* Target */}
                  <div className="col-span-2 flex items-center min-w-0">
                    <span className="text-xs text-white/50 truncate">
                      {activity.action_target_name ||
                        activity.action_target_email ||
                        "\u2014"}
                    </span>
                  </div>

                  {/* Status */}
                  <div className="col-span-1">
                    <span
                      className={cn(
                        "inline-block text-xs font-medium px-2 py-0.5 rounded",
                        activity.status === "success"
                          ? "bg-green-900/30 text-green-400"
                          : activity.status === "failed"
                            ? "bg-red-900/30 text-red-400"
                            : "bg-yellow-900/30 text-yellow-400",
                      )}
                    >
                      {activity.status}
                    </span>
                  </div>

                  {/* Timestamp + IP */}
                  <div className="col-span-3 flex items-center gap-3 min-w-0">
                    <span className="text-xs text-white/40 whitespace-nowrap">
                      {formatDate(activity.created_at)}
                    </span>
                    {activity.ip_address && (
                      <span className="text-[10px] text-white/20 hidden xl:inline truncate">
                        {activity.ip_address}
                      </span>
                    )}
                  </div>
                </div>

                {/* Expanded target_changes */}
                {isExpanded && hasChanges && (
                  <div className="px-8 py-3 bg-zinc-900/40 border-b border-zinc-800/50">
                    <div className="ml-[calc(100%/12)] space-y-1.5">
                      <p className="text-[10px] uppercase tracking-wider text-white/20 font-medium mb-2">
                        Changes
                      </p>
                      {Object.entries(activity.target_changes).map(
                        ([field, change]) => (
                          <div
                            key={field}
                            className="flex items-center gap-2 text-xs"
                          >
                            <span className="text-white/50 font-medium min-w-[100px]">
                              {field}:
                            </span>
                            {change.old !== undefined && (
                              <>
                                <span className="text-red-400 line-through">
                                  {String(change.old)}
                                </span>
                                <span className="text-white/20">\u2192</span>
                              </>
                            )}
                            <span className="text-green-400">
                              {String(change.new ?? "")}
                            </span>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
        )}
      </div>

      {/* Pagination */}
      <div className="px-6 py-3 bg-white/[0.02] flex items-center justify-between shrink-0">
        <p className="text-xs text-white/30">
          Page {currentPage} of {Math.max(1, totalPages)}
        </p>
        <div className="flex items-center gap-1.5">
          <button
            disabled={currentPage === 1 || !pagination.previous || loading}
            onClick={() => handlePageChange(currentPage - 1)}
            className="p-2 rounded-xs bg-white/5 border border-white/5 text-white disabled:opacity-20 hover:bg-white/10 transition-all"
          >
            <ChevronLeft size={14} />
          </button>
          <div className="flex items-center gap-1 px-1">
            {(() => {
              const start = Math.max(1, currentPage - 2);
              const end = Math.min(totalPages, currentPage + 2);
              const pages = [];
              for (let i = start; i <= end; i++) {
                pages.push(i);
              }
              return pages.map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={cn(
                    "w-8 h-8 rounded-xs text-xs transition-all",
                    currentPage === pageNum
                      ? "bg-white text-black font-semibold"
                      : "text-white/40 hover:bg-white/5",
                  )}
                >
                  {pageNum}
                </button>
              ));
            })()}
          </div>
          <button
            disabled={
              currentPage === totalPages || totalPages === 0 || !pagination.next || loading
            }
            onClick={() => handlePageChange(currentPage + 1)}
            className="p-2 rounded-xs bg-white/5 border border-white/5 text-white disabled:opacity-20 hover:bg-white/10 transition-all"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuditLog;
