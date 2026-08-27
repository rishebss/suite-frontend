import React, { useState, useEffect } from "react";
import { Users, User, Edit2, Trash2, Loader2, CheckCircle2, Circle } from "lucide-react";
import RingLoader from "@/components/ui/RingLoader";
import ConfirmDeleteDialog from "@/components/ConfirmDeleteDialog";
import { cn } from "@/lib/utils";

const DepartmentList = ({ 
  departments, 
  loading, 
  error, 
  onSelectDepartment, 
  onDeleteDepartment, 
  isDeletingDepartment,
  selectedDepartments,
  onSelectDepartmentCard
}) => {
  const [deptToDelete, setDeptToDelete] = useState(null);

  useEffect(() => {
    if (deptToDelete && isDeletingDepartment === null) {
      setDeptToDelete(null);
    }
  }, [isDeletingDepartment]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <RingLoader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center gap-3">
        <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500/50">
          <Users size={24} />
        </div>
        <p className="text-sm text-white/30">Failed to load groups</p>
      </div>
    );
  }

  if (!departments.length) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center gap-3">
        <div className="w-12 h-12 rounded-full bg-white/[0.02] border border-zinc-800 flex items-center justify-center text-white/10">
          <Users size={24} />
        </div>
        <p className="text-sm text-white/20">No groups found</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.map((dept) => (
            <div
              key={dept.id}
              onClick={() => onSelectDepartment && onSelectDepartment(dept)}
              className={cn(
                "bg-zinc-900/30 border border-zinc-800 rounded-xl p-5 hover:bg-white/[0.02] transition-all group cursor-pointer relative",
                selectedDepartments?.has(dept.id) && "border-blue-500/50 bg-blue-500/5"
              )}
            >
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:bg-blue-500/15 group-hover:border-blue-500/30 transition-all">
                  <Users size={18} />
                </div>
                <div className="flex gap-1">
                  <button 
                    className="p-1.5 rounded-lg hover:bg-white/5 text-white/20 hover:text-white/50 transition-colors" 
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Edit2 size={14} />
                  </button>
                  <button 
                    className="p-1.5 rounded-lg hover:bg-red-500/10 hover:text-red-400 text-white/20 transition-colors" 
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeptToDelete(dept);
                    }}
                    disabled={isDeletingDepartment === dept.id}
                  >
                    {isDeletingDepartment === dept.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                  </button>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <h3 className="font-medium text-white truncate">{dept.name}</h3>
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2 text-xs text-white/30">
                    <Users size={11} />
                    <span>
                      {dept.user_count || 0} user{(dept.user_count || 0) !== 1 ? 's' : ''} assigned
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectDepartmentCard(dept.id);
                    }}
                    className="p-1.5 rounded-lg hover:bg-white/5 text-white/30 hover:text-white/60 transition-colors"
                  >
                    {selectedDepartments?.has(dept.id) ? (
                      <CheckCircle2 size={16} className="text-blue-400" />
                    ) : (
                      <Circle size={16} />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {deptToDelete && (
        <ConfirmDeleteDialog
          isOpen={!!deptToDelete}
          onClose={() => {
            if (!isDeletingDepartment) {
              setDeptToDelete(null);
            }
          }}
          onConfirm={() => {
            onDeleteDepartment(deptToDelete.id);
          }}
          isLoading={isDeletingDepartment === deptToDelete.id}
          title="Delete Group"
          description={`Are you sure you want to delete "${deptToDelete.name}"? This will unassign all users from this group. This action cannot be undone.`}
        />
      )}
    </>
  );
};

export default DepartmentList;
