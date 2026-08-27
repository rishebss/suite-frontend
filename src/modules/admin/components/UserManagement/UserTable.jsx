import React from "react";
import { Trash2, Mail, Phone, User, CheckSquare, Square, ChevronLeft, ChevronRight } from "lucide-react";
import { TbEdit } from "react-icons/tb";
import { RiMenuAddLine } from "react-icons/ri";
import { cn } from "@/lib/utils";

const UserTable = ({
  users,
  selectedUsers,
  onSelectUser,
  onSelectAll,
  onDelete,
  onViewDetails,
  onEditUser,
  onAssignMenu,
  currentPage,
  totalPages,
  onPageChange,
  pagination,
}) => {
  const toggleSelectAll = () => {
    if (selectedUsers.size > 0 && selectedUsers.size === users.length) {
      onSelectAll(false);
    } else {
      onSelectAll(true);
    }
  };

  const toggleSelect = (id, e) => {
    e.stopPropagation();
    const isSelected = selectedUsers.has(id);
    onSelectUser(id, !isSelected);
  };

  return (
    <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl overflow-hidden divide-y divide-zinc-800 shadow-xl relative flex flex-col min-h-0 flex-1">
      <div className="px-8 py-3 bg-zinc-900/20 border-b border-zinc-800 shrink-0 select-none">
        <div className="grid grid-cols-12 gap-4 text-xs font-medium text-white/30 items-center">
          <div className="col-span-1 flex items-center gap-3">
            <button onClick={toggleSelectAll} className="hover:text-blue-400 transition-colors">
              {selectedUsers.size > 0 && selectedUsers.size === users.length ? <CheckSquare size={14} className="text-blue-500" /> : <Square size={14} />}
            </button>
            <span>#</span>
          </div>
          <div className="col-span-3">Name</div>
          <div className="col-span-3">Email</div>
          <div className="col-span-2">Role</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-1 text-right">Actions</div>
        </div>
      </div>

      {users.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-20">
          <div className="w-14 h-14 rounded-full bg-white/[0.02] border border-zinc-800 flex items-center justify-center text-white/10 mb-4">
            <User size={28} />
          </div>
          <p className="text-sm text-white/20">No users found</p>
        </div>
      ) : (
        <div className="divide-y divide-zinc-800 overflow-y-auto custom-scrollbar flex-1">
          {users.map((user, index) => {
            const isSelected = selectedUsers.has(user.id);
            return (
              <div
                key={user.id}
                onClick={() => onViewDetails(user)}
                className="grid grid-cols-12 gap-4 px-8 py-3.5 transition-all items-center group cursor-pointer border-l-2 border-transparent hover:bg-white/[0.02]"
              >
                <div className="col-span-1 flex items-center gap-3">
                  <button
                    onClick={(e) => toggleSelect(user.id, e)}
                    className={cn("transition-colors", isSelected ? "text-blue-500" : "text-white/10 group-hover:text-white/30")}
                  >
                    {isSelected ? <CheckSquare size={14} /> : <Square size={14} />}
                  </button>
                  <span className="text-xs text-white/25">{(currentPage - 1) * 20 + index + 1}</span>
                </div>

                <div className="col-span-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full border bg-white/5 border-white/10 text-white/40 group-hover:border-blue-500/20 group-hover:bg-blue-500/5 group-hover:text-blue-400 flex items-center justify-center text-xs font-medium shrink-0 transition-all">
                    {user.first_name?.charAt(0).toUpperCase()}{user.last_name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm transition-colors truncate text-white group-hover:text-blue-400">
                    {user.first_name} {user.last_name}
                  </span>
                </div>

                <div className="col-span-3 flex items-center gap-2 text-white/40">
                  <Mail size={11} className="shrink-0" />
                  <span className="text-xs truncate">{user.email || '—'}</span>
                </div>

                <div className="col-span-2">
                  <span className="text-xs text-white/60 capitalize">{user.role}</span>
                </div>

                <div className="col-span-2">
                  <span className={`text-xs font-medium ${user.is_active ? 'text-green-500' : 'text-red-500'}`}>
                    {user.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="col-span-1 flex items-center justify-end gap-1">
                  {user.role !== 'Superadmin' && (
                    <button
                      className="p-1.5 rounded-lg hover:bg-emerald-500/10 text-white/20 hover:text-emerald-400 transition-colors"
                      title="Assign Menus"
                      onClick={(e) => { e.stopPropagation(); onAssignMenu && onAssignMenu(user); }}
                    >
                      <RiMenuAddLine size={14} />
                    </button>
                  )}
                  <button
                    className="p-1.5 rounded-lg hover:bg-blue-500/10 text-white/20 hover:text-blue-400 transition-colors"
                    title="Edit"
                    onClick={(e) => { e.stopPropagation(); onEditUser && onEditUser(user); }}
                  >
                    <TbEdit size={14} />
                  </button>
                  <button
                    className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-500/50 hover:text-red-400 transition-colors"
                    title="Delete"
                    onClick={(e) => { e.stopPropagation(); onDelete(user); }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="px-6 py-3 bg-white/[0.02] flex items-center justify-between shrink-0">
        <p className="text-xs text-white/30">
          Page {currentPage} of {Math.max(1, totalPages)}
        </p>
        <div className="flex items-center gap-1.5">
          <button 
            disabled={currentPage === 1 || !pagination.previous} 
            onClick={() => onPageChange(currentPage - 1)}
            className="p-2 rounded-xs bg-white/5 border border-white/5 text-white disabled:opacity-20 hover:bg-white/10 transition-all"
          >
            <ChevronLeft size={14} />
          </button>
          <div className="flex items-center gap-1 px-1">
            {(() => {
              const start = Math.max(1, currentPage - 2);
              const end = Math.min(totalPages, currentPage + 2);
              return [...Array(end - start + 1)].map((_, i) => {
                const pageNum = start + i;
                return (
                  <button 
                    key={pageNum} 
                    onClick={() => onPageChange(pageNum)}
                    className={cn(
                      "w-8 h-8 rounded-xs text-xs transition-all",
                      currentPage === pageNum 
                        ? "bg-white text-black font-semibold" 
                        : "text-white/40 hover:bg-white/5"
                    )}
                  >
                    {pageNum}
                  </button>
                );
              });
            })()}
          </div>
          <button 
            disabled={currentPage === totalPages || totalPages === 0 || !pagination.next} 
            onClick={() => onPageChange(currentPage + 1)}
            className="p-2 rounded-xs bg-white/5 border border-white/5 text-white disabled:opacity-20 hover:bg-white/10 transition-all"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserTable;
