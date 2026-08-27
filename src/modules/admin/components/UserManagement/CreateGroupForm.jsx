import React, { useState } from "react";
import { Users, Loader2, Check } from "lucide-react";

const CreateGroupForm = ({ onSubmit, onCancel, users = [] }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    user_ids: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredUsers = users.filter(user => 
    `${user.first_name} ${user.last_name} ${user.email}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggleUser = (userId) => {
    setFormData(prev => ({
      ...prev,
      user_ids: prev.user_ids.includes(userId)
        ? prev.user_ids.filter(id => id !== userId)
        : [...prev.user_ids, userId]
    }));
  };

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

    if (!formData.name) {
      setError("Group name is required");
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
    } catch (err) {
      console.error("Error creating group:", err);
      setError(err.message || "Error creating group");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-lg shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
      <div className="px-6 pt-6 pb-4 border-b border-white/5 shrink-0">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-white">Create New Group</h2>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col min-h-0">
        <div className="px-6 py-4">
          {error && (
            <div className="p-3 bg-red-900/20 border border-red-500/20 rounded-lg text-red-400 text-sm mb-3">
              {error}
            </div>
          )}
          
          {/* Group Name */}
          <div className="mb-4">
            <p className="text-[10px] text-white/30 mb-1 uppercase tracking-widest">Group Name</p>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30">
                <Users size={12} />
              </div>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 rounded-md pl-9 pr-3 py-1.5 text-sm text-white outline-none focus:border-white/20 transition-all"
                placeholder="Enter group name"
              />
            </div>
          </div>

          {/* Assign Users */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] text-white/30 uppercase tracking-widest">Assign Users</p>
              {formData.user_ids.length > 0 && (
                <span className="text-xs text-white/50">
                  {formData.user_ids.length} selected
                </span>
              )}
            </div>
            
            {/* Search input */}
            <div className="mb-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search users..."
                className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-1.5 text-sm text-white outline-none focus:border-white/20 transition-all"
              />
            </div>

            {/* Users container */}
            <div className="bg-zinc-900/50 border border-white/10 rounded-md p-2 max-h-60 overflow-y-auto custom-scrollbar">
              {filteredUsers.length === 0 ? (
                <div className="text-center py-4 text-white/40 text-xs">
                  {searchQuery ? "No users found" : "No users available"}
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredUsers.map(user => (
                    <div
                      key={user.id}
                      onClick={() => handleToggleUser(user.id)}
                      className={`flex items-center justify-between px-2.5 py-1.5 rounded cursor-pointer transition-all ${
                        formData.user_ids.includes(user.id) 
                          ? "bg-blue-500/10 border border-blue-500/20 text-blue-400" 
                          : "bg-white/5 border border-transparent hover:bg-white/10 text-white/80"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs font-medium">
                          {user.first_name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-medium leading-tight">
                            {user.first_name} {user.last_name}
                          </div>
                          <div className="text-[10px] text-white/50 leading-tight">{user.email}</div>
                        </div>
                      </div>
                      {formData.user_ids.includes(user.id) && (
                        <Check size={14} />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-white/5 flex justify-end gap-2 shrink-0">
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1.5 bg-white/5 border border-white/10 text-white/60 rounded text-xs uppercase tracking-widest hover:bg-white/10 transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded text-xs uppercase tracking-widest hover:bg-blue-500/20 transition-all flex items-center gap-1.5 disabled:opacity-50"
          >
            {loading ? <Loader2 size={12} className="animate-spin" /> : null}
            {loading ? "Creating..." : "Create Group"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateGroupForm;
