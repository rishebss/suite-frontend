import React, { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { Users, User, Mail, Shield, Loader2, Plus, Search, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import UserService from "../../services/userService";
import ConfirmDeleteDialog from "@/components/ConfirmDeleteDialog";
import RingLoader from "@/components/ui/RingLoader";

const GroupUserModal = ({
  department,
  users: initialUsers,
  loading: usersLoading,
  onViewDetails,
  onRemoveUser,
  isRemovingUser,
  onRemoveUsers,
  isRemovingUsers,
  onAddUser,
  isAddingUser,
  onAssignUsers,
  isAssigning,
  onDeleteDepartment,
  isDeletingDepartment,
  onClose,
}) => {
  if (!department) return null;

  const [activeTab, setActiveTab] = useState('users');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchQueryChanged, setSearchQueryChanged] = useState(false);
  const [fetchedUsers, setFetchedUsers] = useState(initialUsers);
  const [isSearching, setIsSearching] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState(new Set());

  useEffect(() => {
    if (showDeleteConfirm && isDeletingDepartment === null) {
      setShowDeleteConfirm(false);
    }
  }, [isDeletingDepartment]);

  const fetchUsersWithSearch = useCallback(async (query) => {
    setIsSearching(true);
    try {
      const params = query ? { search: query, page_size: 100 } : { page_size: 100 };
      const result = await UserService.getUsers(params);
      setFetchedUsers(result.results || []);
    } catch (err) {
      console.error("Error searching users:", err);
      setFetchedUsers(initialUsers);
    } finally {
      setIsSearching(false);
    }
  }, [initialUsers]);

  useEffect(() => {
    if (searchQueryChanged) {
      const debounceTimer = setTimeout(() => {
        fetchUsersWithSearch(searchQuery);
      }, 300);

      return () => clearTimeout(debounceTimer);
    }
  }, [searchQuery, fetchUsersWithSearch, searchQueryChanged]);

  useEffect(() => {
    setFetchedUsers(initialUsers);
    setSearchQuery('');
    setSearchQueryChanged(false);
  }, [initialUsers]);

  // Reset selection when switching tabs or searching
  useEffect(() => {
    setSelectedUserIds(new Set());
  }, [activeTab, searchQuery]);
  
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setSearchQueryChanged(true);
  };

  const isUserInGroup = (user) => user.departments?.some(d => d.id === department.id);
  
  // When searching, show all users; when not, use tab filtering
  const displayUsers = searchQuery 
    ? fetchedUsers 
    : (activeTab === 'users' 
        ? fetchedUsers.filter(user => isUserInGroup(user))
        : fetchedUsers.filter(user => !isUserInGroup(user))
      );

  const handleToggleSelectUser = (userId) => {
    setSelectedUserIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    const selectableUsers = displayUsers.filter(user => 
      activeTab === 'users' ? isUserInGroup(user) : !isUserInGroup(user)
    );
    if (selectedUserIds.size === selectableUsers.length) {
      setSelectedUserIds(new Set());
    } else {
      setSelectedUserIds(new Set(selectableUsers.map(u => u.id)));
    }
  };

  const handleAssignSelected = () => {
    if (selectedUserIds.size > 0 && onAssignUsers) {
      onAssignUsers(Array.from(selectedUserIds));
    }
  };

  const handleRemoveSelected = () => {
    if (selectedUserIds.size > 0 && onRemoveUsers) {
      onRemoveUsers(Array.from(selectedUserIds));
    }
  };

  // Clear selection after assignment completes
  useEffect(() => {
    if (!isAssigning && selectedUserIds.size > 0) {
      setSelectedUserIds(new Set());
    }
  }, [isAssigning]);

  // Clear selection after removal completes
  useEffect(() => {
    if (!isRemovingUsers && selectedUserIds.size > 0) {
      setSelectedUserIds(new Set());
    }
  }, [isRemovingUsers]);

  return createPortal(
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-8 py-6 border-b border-zinc-800 bg-white/[0.02] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Users size={20} />
            </div>
            <div>
              <h2 className="text-base font-medium text-white uppercase tracking-wider">{department.name}</h2>
              <p className="text-[10px] text-white/40 uppercase tracking-widest font-medium">
                {searchQuery 
                  ? `${displayUsers.length} User${displayUsers.length !== 1 ? 's' : ''} found`
                  : activeTab === 'users' 
                    ? `${fetchedUsers.filter(u => isUserInGroup(u)).length} Users in this group` 
                    : `${fetchedUsers.filter(u => !isUserInGroup(u)).length} Users available`
                }
              </p>
            </div>
          </div>
          
          {/* Delete Group Button */}
          <button
            onClick={() => setShowDeleteConfirm(true)}
            disabled={isDeletingDepartment === department.id}
            className="h-9 w-9 rounded-md bg-zinc-900/50 border border-zinc-800 text-red-400 hover:text-red-300 hover:bg-red-500/10 hover:border-red-500/30 transition-all flex items-center justify-center group disabled:opacity-50"
            title="Delete Group"
          >
            {isDeletingDepartment === department.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
          </button>
        </div>

        {/* Sub-header with Search and Tabs */}
        <div className="px-8 py-4 border-b border-zinc-800 bg-zinc-900/10 shrink-0 flex items-center gap-4">
          {/* Search Bar */}
          <div className="flex-1 relative">
            {isSearching ? (
              <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 animate-spin" size={14} />
            ) : (
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={14} />
            )}
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full bg-zinc-950/50 border border-zinc-800 rounded-md pl-10 pr-4 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-blue-500/50 focus:bg-zinc-950 transition-all"
            />
          </div>
          
          {/* Tabs */}
          <div className="relative flex items-center p-1 bg-white/[0.02] border border-white/20 rounded-md">
            <div 
              className={cn(
                "absolute inset-y-0 shadow-[0_0_15px_rgba(59,130,246,0.1)] transition-all duration-300 ease-out z-0",
                activeTab === 'users' 
                  ? "left-0 w-1/2 rounded-l rounded-r-none bg-blue-500/20" 
                  : "left-1/2 w-1/2 rounded-r rounded-l-none bg-blue-500/20"
              )}
            />
            <button
              onClick={() => setActiveTab('users')}
              className={cn(
                "relative z-10 px-6 py-1.5 rounded text-[10px] font-medium uppercase tracking-[0.2em] transition-all duration-300",
                activeTab === 'users' ? "text-blue-400" : "text-white/50 hover:text-white/80"
              )}
            >
              Users
            </button>
            <button
              onClick={() => setActiveTab('add-users')}
              className={cn(
                "relative z-10 px-6 py-1.5 rounded text-[10px] font-medium uppercase tracking-[0.2em] transition-all duration-300",
                activeTab === 'add-users' ? "text-blue-400" : "text-white/50 hover:text-white/80"
              )}
            >
              Add Users
            </button>
          </div>
        </div>

        {/* Table Header */}
        <div className="px-8 py-4 border-b border-zinc-800 bg-zinc-900/10 shrink-0">
          <div className="grid grid-cols-12 gap-4 items-center">
            <div className="col-span-1">
              <button
                onClick={handleSelectAll}
                className="w-4 h-4 rounded border border-zinc-700 flex items-center justify-center transition-all hover:border-blue-500/50"
                title="Select all available users"
              >
                {(() => {
                  const selectableCount = displayUsers.filter(u => activeTab === 'users' ? isUserInGroup(u) : !isUserInGroup(u)).length;
                  if (selectableCount > 0 && selectedUserIds.size === selectableCount) {
                    return <div className="w-2 h-2 rounded-sm bg-blue-400" />;
                  } else if (selectedUserIds.size > 0) {
                    return <div className="w-2 h-2 rounded-sm bg-blue-400/50" />;
                  }
                  return null;
                })()}
              </button>
            </div>
            <div className="col-span-3">
              <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/30">User</span>
            </div>
            <div className="col-span-4">
              <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/30">Email</span>
            </div>
            <div className="col-span-2">
              <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/30">Role</span>
            </div>
            <div className="col-span-2 text-right">
              <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/30">Action</span>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-0">
          {usersLoading ? (
            <div className="p-12 flex items-center justify-center">
              <RingLoader />
            </div>
          ) : displayUsers.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-[10px] text-white/20 uppercase tracking-[0.2em] font-medium">
                {searchQuery ? 'No users found' : (activeTab === 'users' ? 'No users in this group' : 'All users are already in this group')}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-800/50">
              {displayUsers.map((user) => {
                const isSelectable = activeTab === 'users' ? isUserInGroup(user) : !isUserInGroup(user);
                const isSelected = selectedUserIds.has(user.id);
                return (
                <div 
                  key={user.id} 
                  className={cn(
                    "px-8 py-4 grid grid-cols-12 gap-4 items-center transition-colors",
                    isSelectable
                      ? activeTab === 'users'
                        ? "hover:bg-red-500/[0.03]"
                        : "hover:bg-blue-500/[0.03]"
                      : "hover:bg-white/[0.02]"
                  )}
                >
                  {isSelectable && (
                    <div className="col-span-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleSelectUser(user.id);
                        }}
                        className="w-4 h-4 rounded border border-zinc-700 flex items-center justify-center transition-all hover:border-red-500/50"
                      >
                        {isSelected ? (
                          <div className="w-2 h-2 rounded-sm bg-blue-400" />
                        ) : null}
                      </button>
                    </div>
                  )}
                  <div className={cn("flex items-center gap-3 cursor-pointer", isSelectable ? 'col-span-3' : 'col-span-4')} onClick={() => onViewDetails(user)}>
                    <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0">
                      <User size={14} className="text-white/40" />
                    </div>
                    <h3 className="text-sm font-medium text-white uppercase tracking-wider truncate">
                      {user.first_name} {user.last_name}
                    </h3>
                  </div>
                  
                  <div className="col-span-4 cursor-pointer overflow-hidden" onClick={() => onViewDetails(user)}>
                    <div className="flex items-center gap-1 text-[10px] text-white/40 uppercase tracking-widest">
                      <Mail size={10} className="shrink-0" />
                      <span className="truncate">{user.email}</span>
                    </div>
                  </div>
                  
                  <div className="col-span-2 cursor-pointer" onClick={() => onViewDetails(user)}>
                    <div className="flex items-center gap-1 text-[10px] uppercase tracking-widest">
                      <Shield size={10} className={cn(
                        "shrink-0",
                        user.role === 'Superadmin' ? "text-purple-400" :
                        user.role === 'Admin' ? "text-blue-400" :
                        "text-white/40"
                      )} />
                      <span className={cn(
                        user.role === 'Superadmin' ? "text-purple-400" :
                        user.role === 'Admin' ? "text-blue-400" :
                        "text-white/40"
                      )}>{user.role}</span>
                    </div>
                  </div>
                  
                  <div className="col-span-2 flex justify-end">
                    {isUserInGroup(user) ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveUser(user.id);
                        }}
                        disabled={isRemovingUser === user.id}
                        className="px-3 py-1 rounded-md border border-zinc-700 hover:bg-red-500/10 hover:border-red-500/30 text-[10px] uppercase tracking-widest text-zinc-600 hover:text-red-400 transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center"
                        title="Remove from group"
                      >
                        {isRemovingUser === user.id ? <Loader2 size={14} className="animate-spin" /> : "Remove"}
                      </button>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddUser(user.id);
                        }}
                        disabled={isAddingUser === user.id}
                        className="px-3 py-1 rounded-md border border-zinc-700 hover:bg-blue-500/10 hover:border-blue-500/30 text-[10px] uppercase tracking-widest text-zinc-600 hover:text-blue-400 transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center"
                        title="Add to group"
                      >
                        {isAddingUser === user.id ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                      </button>
                    )}
                  </div>
                </div>
              );})}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-4 border-t border-zinc-800 bg-white/[0.01] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <span className="text-[9px] font-medium text-white/30 uppercase tracking-widest">
              {searchQuery 
                ? `${displayUsers.length} User${displayUsers.length === 1 ? '' : 's'} found`
                : activeTab === 'users' 
                  ? `${fetchedUsers.filter(u => isUserInGroup(u)).length} User${fetchedUsers.filter(u => isUserInGroup(u)).length === 1 ? '' : 's'}` 
                  : `${fetchedUsers.filter(u => !isUserInGroup(u)).length} User${fetchedUsers.filter(u => !isUserInGroup(u)).length === 1 ? '' : 's'} available`
              }
            </span>
            {selectedUserIds.size > 0 && (
              <span className="text-[9px] text-blue-400 font-medium uppercase tracking-widest">
                {selectedUserIds.size} selected
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {(selectedUserIds.size > 0 || isRemovingUsers) && activeTab === 'users' && (
              <button
                onClick={handleRemoveSelected}
                disabled={isRemovingUsers}
                className="px-4 py-2 bg-red-500/10 border border-red-500/20 text-[9px] font-medium text-red-400 hover:bg-red-500/20 hover:border-red-500/30 uppercase tracking-widest transition-all rounded-md flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRemovingUsers ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <Trash2 size={12} />
                )}
                Remove
              </button>
            )}
            {(selectedUserIds.size > 0 || isAssigning) && activeTab === 'add-users' && (
              <button
                onClick={handleAssignSelected}
                disabled={isAssigning}
                className="px-4 py-2 bg-blue-500/10 border border-blue-500/20 text-[9px] font-medium text-blue-400 hover:bg-blue-500/20 hover:border-blue-500/30 uppercase tracking-widest transition-all rounded-md flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAssigning ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <Plus size={12} />
                )}
                Assign
              </button>
            )}
            <button 
              onClick={onClose}
              className="px-4 py-2 bg-zinc-900 border border-zinc-800 text-[9px] font-medium text-white/40 hover:text-white hover:bg-zinc-800 hover:border-zinc-700 uppercase tracking-widest transition-all rounded-md cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Delete Department Confirmation */}
      <ConfirmDeleteDialog
        isOpen={showDeleteConfirm}
        onClose={() => {
          if (isDeletingDepartment !== department.id) {
            setShowDeleteConfirm(false);
          }
        }}
        onConfirm={() => {
          onDeleteDepartment();
        }}
        isLoading={isDeletingDepartment === department.id}
        title="Delete Group"
        description={`Are you sure you want to delete "${department.name}"? This will unassign all users from this group. This action cannot be undone.`}
      />
    </div>
  , document.body);
};

export default GroupUserModal;
