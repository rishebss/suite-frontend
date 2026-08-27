import React, { useState, useEffect } from "react";
import { Users, Plus, Search, Users as UsersIcon, Trash2 } from "lucide-react";
import { useUsers, useAuditLog, useDepartments } from "../../hooks/useUsers";
import UserTable from "./UserTable";
import CreateUserForm from "./CreateUserForm";
import CreateGroupForm from "./CreateGroupForm";
import UserDetail from "./UserDetail";
import AuditLog from "./AuditLog";
import DepartmentList from "./DepartmentList";
import UserFilters from "./UserFilters";
import BulkActions from "./BulkActions";
import ConfirmDeleteDialog from "../../../../components/ConfirmDeleteDialog";
import SearchDialog from "./SearchDialog";
import GroupUserModal from "./GroupUserModal";
import UserMenuAssignModal from "./UserMenuAssignModal";
import ProfileTab from "./ProfileTab";
import RingLoader from "@/components/ui/RingLoader";
import { cn } from "@/lib/utils";
import UserService from "../../services/userService";

const UserList = () => {
  const {
    users,
    loading,
    error,
    pagination,
    setPagination,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    bulkUpdateUsers,
    bulkDeleteUsers,
  } = useUsers();
  const { departments, loading: deptsLoading, error: deptsError, refetch: refetchDepts, deleteDepartment, isDeletingDepartment, createDepartment, isCreatingDepartment } = useDepartments();
  const [selectedUsers, setSelectedUsers] = useState(new Set());
  const [selectedDepartments, setSelectedDepartments] = useState(new Set());
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showCreateGroupForm, setShowCreateGroupForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [wasDeletingDepartment, setWasDeletingDepartment] = useState(false);
  const [startInEditMode, setStartInEditMode] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    role: "",
    department: "",
    status: "",
  });
  const [isBulkDelete, setIsBulkDelete] = useState(false);
  const [isTogglingActive, setIsTogglingActive] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [isRemovingUser, setIsRemovingUser] = useState(null);
  const [isAddingUser, setIsAddingUser] = useState(null);
  const [isAssigning, setIsAssigning] = useState(false);
  const [isRemovingUsers, setIsRemovingUsers] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [isSearchDialogOpen, setIsSearchDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [menuAssignUser, setMenuAssignUser] = useState(null);

  useEffect(() => {
    fetchUsers(filters);
  }, [pagination.page, filters, fetchUsers]);

  useEffect(() => {
    if (selectedUser && users.length > 0) {
      const updatedUserFromList = users.find(u => u.id === selectedUser.id);
      if (updatedUserFromList) {
        setSelectedUser(updatedUserFromList);
      }
    }
  }, [users, selectedUser?.id]);

  useEffect(() => {
    if (isDeletingDepartment !== null) {
      setWasDeletingDepartment(true);
    } else if (wasDeletingDepartment && selectedDepartment) {
      setSelectedDepartment(null);
      setWasDeletingDepartment(false);
    }
  }, [isDeletingDepartment, selectedDepartment, wasDeletingDepartment]);

  useEffect(() => {
    if (showBulkDeleteConfirm && isDeletingDepartment === null && selectedDepartments.size === 0) {
      setShowBulkDeleteConfirm(false);
    }
  }, [isDeletingDepartment, showBulkDeleteConfirm, selectedDepartments.size]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleCreateUser = async (userData) => {
    try {
      await createUser(userData, filters);
      setShowCreateForm(false);
    } catch (err) {
      console.error("Error creating user:", err);
    }
  };

  const handleCreateGroup = async (groupData) => {
    try {
      await createDepartment(groupData);
      setShowCreateGroupForm(false);
      await fetchUsers(filters);
    } catch (err) {
      console.error("Error creating group:", err);
    }
  };

  const handleSelectUser = (userId) => {
    setSelectedUsers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };

  const handleEditUser = (user) => {
    setStartInEditMode(true);
    setSelectedUser(user);
  };

  const handleSelectAll = () => {
    if (selectedUsers.size === users.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(users.map(u => u.id)));
    }
  };

  const handleSaveUser = async (updatedUser) => {
    console.log("UserList.handleSaveUser: updatedUser =", updatedUser);
    setIsSavingEdit(true);
    try {
      const serverResponse = await updateUser(updatedUser.id, updatedUser, filters);
      console.log("UserList.handleSaveUser: serverResponse =", serverResponse);
      setSelectedUser(serverResponse.data || serverResponse);
    } catch (err) {
      console.error("Error updating user:", err);
      throw err;
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    console.log('handleDeleteUser called with userId:', userId);
    setIsDeleting(true);
    try {
      await deleteUser(userId, filters);
      setShowDeleteConfirm(null);
    } catch (err) {
      console.error("Error deleting user:", err);
      // Special handling for "User is already inactive" error
      if (err.message && err.message.includes("User is already inactive")) {
        setShowDeleteConfirm(null);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleActive = async () => {
    if (!selectedUser) return;
    console.log('handleToggleActive called for user:', selectedUser.id, 'current status:', selectedUser.is_active);
    setIsTogglingActive(true);
    try {
      const serverResponse = await updateUser(selectedUser.id, {
        is_active: !selectedUser.is_active,
      }, filters);
      console.log('handleToggleActive: serverResponse =', serverResponse);
      setSelectedUser(serverResponse.data || serverResponse);
      console.log('Toggle active successful!');
    } catch (err) {
      console.error("Error toggling user active status:", err);
    } finally {
      setIsTogglingActive(false);
    }
  };

  const handleBulkUpdate = async (updates) => {
    try {
      await bulkUpdateUsers(Array.from(selectedUsers), updates, filters);
      setSelectedUsers(new Set());
    } catch (err) {
      console.error("Error bulk updating users:", err);
    }
  };

  const handleBulkDelete = async () => {
    console.log('handleBulkDelete called with user IDs:', Array.from(selectedUsers));
    setIsDeleting(true);
    try {
      await bulkDeleteUsers(Array.from(selectedUsers), filters);
      setSelectedUsers(new Set());
      setShowDeleteConfirm(null);
      setIsBulkDelete(false);
    } catch (err) {
      console.error("Error bulk deleting users:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const handleRemoveUser = async (userId) => {
    setIsRemovingUser(userId);
    try {
      const user = users.find(u => u.id === userId);
      const newDepartments = user?.departments?.filter(d => d.id !== selectedDepartment.id).map(d => d.id) || [];
      await updateUser(userId, { department_ids: newDepartments }, filters);
      await fetchUsers(filters);
    } catch (err) {
      console.error("Error removing user from group:", err);
    } finally {
      setIsRemovingUser(null);
    }
  };

  const handleAddUser = async (userId) => {
    setIsAddingUser(userId);
    try {
      const user = users.find(u => u.id === userId);
      const newDepartments = [...(user?.departments?.map(d => d.id) || []), selectedDepartment.id];
      await updateUser(userId, { department_ids: newDepartments }, filters);
      await fetchUsers(filters);
    } catch (err) {
      console.error("Error adding user to group:", err);
    } finally {
      setIsAddingUser(null);
    }
  };

  const handleAssignUsers = async (userIds) => {
    setIsAssigning(true);
    try {
      // Fire all updates in parallel to avoid sequential re-fetches
      await Promise.all(userIds.map(async (userId) => {
        const user = users.find(u => u.id === userId);
        if (user) {
          const newDepartments = [...(user?.departments?.map(d => d.id) || []), selectedDepartment.id];
          await UserService.updateUser(userId, { department_ids: newDepartments });
        }
      }));
      // Single fetch after all updates are done
      await fetchUsers(filters);
    } catch (err) {
      console.error("Error assigning users to group:", err);
    } finally {
      setIsAssigning(false);
    }
  };

  const handleRemoveUsers = async (userIds) => {
    setIsRemovingUsers(true);
    try {
      await Promise.all(userIds.map(async (userId) => {
        const user = users.find(u => u.id === userId);
        if (user) {
          const newDepartments = user?.departments?.filter(d => d.id !== selectedDepartment.id).map(d => d.id) || [];
          await UserService.updateUser(userId, { department_ids: newDepartments });
        }
      }));
      await fetchUsers(filters);
    } catch (err) {
      console.error("Error removing users from group:", err);
    } finally {
      setIsRemovingUsers(false);
    }
  };

  const handleSelectDepartmentCard = (deptId) => {
    setSelectedDepartments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(deptId)) {
        newSet.delete(deptId);
      } else {
        newSet.add(deptId);
      }
      return newSet;
    });
  };

  const handleDeleteDepartment = async () => {
    if (!selectedDepartment) return;
    try {
      await deleteDepartment(selectedDepartment.id);
    } catch (err) {
      console.error("Error deleting department:", err);
    }
  };

  const handleBulkDeleteDepartments = async () => {
    if (selectedDepartments.size === 0) return;
    try {
      const deptsToDelete = Array.from(selectedDepartments);
      for (const deptId of deptsToDelete) {
        await deleteDepartment(deptId);
      }
      setSelectedDepartments(new Set());
    } catch (err) {
      console.error("Error bulk deleting departments:", err);
    }
  };

  return (
    <div className="flex flex-col bg-black h-full">
      <header className="px-10 py-8 flex justify-between items-center border-b border-white/5 relative z-20 bg-black/50 backdrop-blur-xl shrink-0">
        <div className="space-y-0.5">
          {activeTab === 'users' && (
            <>
              <h1 className="text-2xl font-semibold text-white">Users</h1>
              <p className="text-sm text-white/40">Create, manage, and monitor user accounts</p>
            </>
          )}
          {activeTab === 'groups' && (
            <>
              <h1 className="text-2xl font-semibold text-white">Groups</h1>
              <p className="text-sm text-white/40">Organize users into departments and teams</p>
            </>
          )}
          {activeTab === 'audit' && (
            <>
              <h1 className="text-2xl font-semibold text-white">Audit Log</h1>
              <p className="text-sm text-white/40">Track all user activities and system changes</p>
            </>
          )}
          {activeTab === 'profile' && (
            <>
              <h1 className="text-2xl font-semibold text-white">Profile</h1>
              <p className="text-sm text-white/40">View and update your account details</p>
            </>
          )}
        </div>


      </header>

      <main className="flex-1 px-10 pt-5 pb-5 relative z-10 overflow-hidden flex flex-col gap-0 min-h-0">
        {error && (
          <div className="p-4 bg-red-900/20 border border-red-500/20 rounded-xl text-red-400 text-sm mb-4">
            {error}
          </div>
        )}

        <div className="flex items-center shrink-0 pb-4">
          <div className="relative flex items-center p-1 bg-white/[0.02] border border-white/20 rounded-md">
            <div 
              className={cn(
                "absolute inset-y-0 shadow-[0_0_15px_rgba(59,130,246,0.1)] transition-all duration-300 ease-out z-0",
                activeTab === 'profile' 
                  ? "left-0 w-1/4 rounded-l rounded-r-none bg-blue-500/20" 
                  : activeTab === 'users'
                  ? "left-1/4 w-1/4 bg-blue-500/20"
                  : activeTab === 'groups'
                  ? "left-1/2 w-1/4 bg-blue-500/20"
                  : "left-3/4 w-1/4 rounded-r rounded-l-none bg-blue-500/20"
              )}
            />
            <button
              onClick={() => setActiveTab('profile')}
              className={cn(
                "relative z-10 px-6 py-1.5 rounded text-[10px] font-medium uppercase tracking-[0.2em] transition-all duration-300 flex items-center justify-center text-center w-1/4 whitespace-nowrap",
                activeTab === 'profile' ? "text-blue-400" : "text-white/50 hover:text-white/80"
              )}
            >
              Profile
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={cn(
                "relative z-10 px-6 py-1.5 rounded text-[10px] font-medium uppercase tracking-[0.2em] transition-all duration-300 flex items-center justify-center text-center w-1/4 whitespace-nowrap",
                activeTab === 'users' ? "text-blue-400" : "text-white/50 hover:text-white/80"
              )}
            >
              Users
            </button>
            <button
              onClick={() => setActiveTab('groups')}
              className={cn(
                "relative z-10 px-6 py-1.5 rounded text-[10px] font-medium uppercase tracking-[0.2em] transition-all duration-300 flex items-center justify-center text-center w-1/4 whitespace-nowrap",
                activeTab === 'groups' ? "text-blue-400" : "text-white/50 hover:text-white/80"
              )}
            >
              Groups
            </button>
            <button
              onClick={() => setActiveTab('audit')}
              className={cn(
                "relative z-10 px-6 py-1.5 rounded text-[10px] font-medium uppercase tracking-[0.2em] transition-all duration-300 flex items-center justify-center text-center w-1/4 whitespace-nowrap",
                activeTab === 'audit' ? "text-blue-400" : "text-white/50 hover:text-white/80"
              )}
            >
              Audit Log
            </button>
          </div>
          {activeTab === 'users' && (
            <div className="ml-auto flex items-center gap-3">
              {selectedUsers.size > 0 && (
                <button
                  onClick={() => {
                    setIsBulkDelete(true);
                    setShowDeleteConfirm({});
                  }}
                  disabled={isDeleting}
                  className="h-8 w-8 rounded-md bg-zinc-900/50 border border-zinc-800 text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all flex items-center justify-center group disabled:opacity-50"
                  title="Delete Selected Users"
                >
                  <Trash2 size={16} />
                </button>
              )}
              <button
                onClick={() => setIsSearchDialogOpen(true)}
                className="h-8 w-8 rounded-md bg-zinc-900/50 border border-zinc-800 text-white/40 hover:text-white hover:bg-zinc-800 transition-all flex items-center justify-center group"
                title="Search Users"
              >
                <Search size={16} />
              </button>
              <button
                onClick={() => setShowCreateForm(true)}
                className="h-8 w-8 rounded-md bg-zinc-900/50 border border-zinc-800 text-white/40 hover:text-white hover:bg-zinc-800 transition-all flex items-center justify-center group"
                title="Create User"
              >
                <Plus size={16} />
              </button>
            </div>
          )}
          {activeTab === 'groups' && (
            <div className="ml-auto flex items-center gap-3">
              {selectedDepartments.size > 0 ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedDepartments(new Set())}
                    className="h-8 w-8 rounded-md bg-zinc-900/50 border border-zinc-800 text-white/40 hover:text-white hover:bg-zinc-800 transition-all flex items-center justify-center"
                    title="Clear Selection"
                  >
                    <span className="text-lg leading-none">&times;</span>
                  </button>
                  <button
                    onClick={() => setShowBulkDeleteConfirm(true)}
                    className="h-8 w-8 rounded-md bg-zinc-900/50 border border-zinc-800 text-red-400 hover:text-red-300 hover:bg-red-500/10 hover:border-red-500/30 transition-all flex items-center justify-center"
                    title="Delete Selected Groups"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ) : (
                <>
                  <button
                    // TODO: Add group search dialog later
                    className="h-8 w-8 rounded-md bg-zinc-900/50 border border-zinc-800 text-white/40 hover:text-white hover:bg-zinc-800 transition-all flex items-center justify-center group"
                    title="Search Groups"
                  >
                    <Search size={16} />
                  </button>
                  <button
                    onClick={() => setShowCreateGroupForm(true)}
                    className="h-8 w-8 rounded-md bg-zinc-900/50 border border-zinc-800 text-white/40 hover:text-white hover:bg-zinc-800 transition-all flex items-center justify-center group"
                    title="Create Group"
                  >
                    <Plus size={16} />
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        <div className="flex-1 overflow-hidden flex flex-col min-h-0 pt-4">
          {activeTab === 'users' && (
            loading ? (
              <div className="flex-1 flex items-center justify-center">
                <RingLoader className="mx-auto" />
              </div>
            ) : (
              <UserTable
                users={users}
                selectedUsers={selectedUsers}
                onSelectUser={handleSelectUser}
                onSelectAll={handleSelectAll}
                onDelete={(user) => setShowDeleteConfirm(user)}
                onViewDetails={(user) => {
                  setStartInEditMode(false);
                  setSelectedUser(user);
                }}
                onEditUser={handleEditUser}
                onAssignMenu={setMenuAssignUser}
                currentPage={pagination.page}
                totalPages={Math.ceil(pagination.count / pagination.pageSize)}
                onPageChange={handlePageChange}
                pagination={pagination}
              />
            )
          )}

          {activeTab === 'groups' && (
            <DepartmentList
              departments={departments}
              loading={deptsLoading}
              error={deptsError}
              onSelectDepartment={setSelectedDepartment}
              onDeleteDepartment={deleteDepartment}
              isDeletingDepartment={isDeletingDepartment}
              selectedDepartments={selectedDepartments}
              onSelectDepartmentCard={handleSelectDepartmentCard}
            />
          )}

          {activeTab === 'audit' && (
            <AuditLog />
          )}

          {activeTab === 'profile' && (
            <ProfileTab />
          )}
        </div>
      </main>

      {showCreateForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowCreateForm(false)} />
          <CreateUserForm
            onSubmit={handleCreateUser}
            onCancel={() => setShowCreateForm(false)}
          />
        </div>
      )}

      {showCreateGroupForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowCreateGroupForm(false)} />
          <CreateGroupForm
            onSubmit={handleCreateGroup}
            onCancel={() => setShowCreateGroupForm(false)}
            users={users}
          />
        </div>
      )}

      {selectedUser && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => {
            setSelectedUser(null);
            setStartInEditMode(false);
          }} />
          <UserDetail
            user={selectedUser}
            departments={departments}
            initialEditMode={startInEditMode}
            onClose={() => {
              setSelectedUser(null);
              setStartInEditMode(false);
            }}
            onDelete={() => { 
              setShowDeleteConfirm(selectedUser); 
              setSelectedUser(null);
              setStartInEditMode(false);
            }}
            onToggleActive={handleToggleActive}
            onSave={handleSaveUser}
            onOpenAssignModal={() => {
              setMenuAssignUser(selectedUser);
            }}
            isToggling={isTogglingActive}
            isSaving={isSavingEdit}
          />
        </div>
      )}

      <SearchDialog
        isOpen={isSearchDialogOpen}
        onClose={() => setIsSearchDialogOpen(false)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSelect={(user) => {
          setSelectedUser(user);
          setIsSearchDialogOpen(false);
        }}
      />
      {menuAssignUser && (
        <UserMenuAssignModal
          user={menuAssignUser}
          onClose={() => setMenuAssignUser(null)}
          onSuccess={() => {
            // Refresh users to reflect any changes
            fetchUsers(filters);
          }}
        />
      )}

      <GroupUserModal
        department={selectedDepartment}
        users={users}
        loading={loading}
        onViewDetails={(user) => {
          setStartInEditMode(false);
          setSelectedUser(user);
        }}
        onRemoveUser={handleRemoveUser}
        isRemovingUser={isRemovingUser}
        onAddUser={handleAddUser}
        isAddingUser={isAddingUser}
        onAssignUsers={handleAssignUsers}
        isAssigning={isAssigning}
        onRemoveUsers={handleRemoveUsers}
        isRemovingUsers={isRemovingUsers}
        onDeleteDepartment={handleDeleteDepartment}
        isDeletingDepartment={isDeletingDepartment}
        onClose={() => setSelectedDepartment(null)}
      />
      <ConfirmDeleteDialog
        isOpen={!!showDeleteConfirm}
        title={isBulkDelete ? "Delete Selected Users" : "Delete User"}
        description={
          isBulkDelete 
            ? `Are you sure you want to delete ${selectedUsers.size} selected user${selectedUsers.size !== 1 ? 's' : ''}? This action cannot be undone.`
            : `Are you sure you want to delete ${showDeleteConfirm?.first_name || 'this user'} ${showDeleteConfirm?.last_name || ''}? This action cannot be undone.`
        }
        onConfirm={() => {
          console.log('ConfirmDeleteDialog onConfirm called!');
          if (isBulkDelete) {
            handleBulkDelete();
          } else if (showDeleteConfirm) {
            handleDeleteUser(showDeleteConfirm.id);
          }
        }}
        onClose={() => {
          setShowDeleteConfirm(null);
          setIsBulkDelete(false);
        }}
        isDeleting={isDeleting}
      />

      {/* Bulk Delete Groups Dialog */}
      <ConfirmDeleteDialog
        isOpen={showBulkDeleteConfirm}
        title="Delete Selected Groups"
        description={`Are you sure you want to delete ${selectedDepartments.size} selected group${selectedDepartments.size !== 1 ? 's' : ''}? This will unassign all users from these groups. This action cannot be undone.`}
        onConfirm={() => {
          handleBulkDeleteDepartments();
        }}
        onClose={() => {
          if (!isDeletingDepartment) {
            setShowBulkDeleteConfirm(false);
          }
        }}
        isDeleting={isDeletingDepartment !== null}
      />
    </div>
  );
};

export default UserList;
