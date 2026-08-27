import React, { useState, useEffect, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import { Users, X, CheckCircle2, Circle, User, Mail, Shield, Loader2, ChevronDown, ChevronRight, Search, Zap, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import CRMApiService from "../services/crmService";
import axios from "axios";

const AssignTab = ({ selectedPipeline, assignmentType, setAssignmentType }) => {
  const [expandedType, setExpandedType] = useState(null);
  const [stats, setStats] = useState(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [isTriggering, setIsTriggering] = useState(false);
  const [triggerResult, setTriggerResult] = useState(null);
  const [selectedSingleUser, setSelectedSingleUser] = useState("");

  const fetchStats = useCallback(async () => {
    if (!selectedPipeline?.id) return;
    setIsLoadingStats(true);
    try {
      const res = await axios.get(`/api/crm/pipelines/${selectedPipeline.id}/assignment-stats/`);
      setStats(res.data);
    } catch (err) {
      console.error("Error fetching assignment stats:", err);
    } finally {
      setIsLoadingStats(false);
    }
  }, [selectedPipeline?.id]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleTrigger = async (strategy, targetUserId = null) => {
    if (!selectedPipeline?.id) return;
    setIsTriggering(true);
    setTriggerResult(null);
    try {
      const payload = { strategy };
      if (targetUserId) {
        payload.target_user_id = targetUserId;
      }
      const res = await axios.post(`/api/crm/pipelines/${selectedPipeline.id}/trigger-assignment/`, payload);
      setTriggerResult(res.data);
      await fetchStats(); // refresh stats
    } catch (err) {
      setTriggerResult({ error: err.response?.data?.error || err.message });
    } finally {
      setIsTriggering(false);
    }
  };

  const toggleExpand = (typeId) => {
    setExpandedType(expandedType === typeId ? null : typeId);
  };

  const types = [
    { id: 'round_robin', label: 'Round Robin', description: 'Distribute deals evenly across users' },
    { id: 'least_loaded', label: 'Least Loaded', description: 'Assign to user with fewest deals' },
    { id: 'single_user', label: 'Single User', description: 'Assign all unassigned deals to a specific user' }
  ];

  return (
    <div className="space-y-3">
      {types.map((type) => {
        const isSelected = assignmentType === type.id;
        const isExpanded = expandedType === type.id;
        const canExpand = true;

        return (
          <div
            key={type.id}
            className={cn(
              "rounded-lg border transition-all overflow-hidden",
              isSelected
                ? "bg-blue-500/10 border-blue-500/30"
                : "bg-zinc-900/30 border-zinc-800 hover:bg-zinc-900/50"
            )}
          >
            {/* Header */}
            <div
              className="flex items-center gap-3 p-4 cursor-pointer"
              onClick={() => {
                setAssignmentType(type.id);
                if (canExpand) toggleExpand(type.id);
              }}
            >
              {isSelected ? (
                <CheckCircle2 size={18} className="text-blue-400 shrink-0" />
              ) : (
                <Circle size={18} className="text-white/30 shrink-0" />
              )}
              <div className="flex-1">
                <h4 className={cn("text-sm font-medium", isSelected ? "text-blue-400" : "text-white/80")}>
                  {type.label}
                </h4>
                <p className="text-xs text-white/40 mt-1">{type.description}</p>
              </div>
              {canExpand && (
                <div className="shrink-0">
                  {isExpanded ? (
                    <ChevronDown size={16} className="text-white/30" />
                  ) : (
                    <ChevronRight size={16} className="text-white/30" />
                  )}
                </div>
              )}
            </div>

            {/* Expanded Content */}
            {canExpand && isExpanded && (
              <div className="border-t border-zinc-800/50 px-4 py-4">
                {isLoadingStats ? (
                  <div className="flex items-center justify-center py-6">
                    <Loader2 size={18} className="animate-spin text-white/30" />
                  </div>
                ) : stats ? (
                  <div className="space-y-4">
                    {type.id === 'round_robin' && (
                      <>
                        {/* Deal breakdown */}
                        <div className="grid grid-cols-3 gap-3">
                          <div className="p-3 rounded-md bg-zinc-950/50 border border-zinc-800 text-center">
                            <p className="text-lg font-semibold text-white">{stats.total_deals}</p>
                            <p className="text-[9px] text-white/30 uppercase tracking-widest mt-1">Total Deals</p>
                          </div>
                          <div className="p-3 rounded-md bg-zinc-950/50 border border-zinc-800 text-center">
                            <p className="text-lg font-semibold text-white">{stats.assigned_deals}</p>
                            <p className="text-[9px] text-white/30 uppercase tracking-widest mt-1">Assigned</p>
                          </div>
                          <div className="p-3 rounded-md bg-zinc-950/50 border border-zinc-800 text-center">
                            <p className="text-lg font-semibold text-white">{stats.unassigned_deals}</p>
                            <p className="text-[9px] text-white/30 uppercase tracking-widest mt-1">Unassigned</p>
                          </div>
                        </div>

                        {/* User distribution preview */}
                        {stats.user_loads.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-[9px] text-white/30 uppercase tracking-widest font-medium">Current Distribution</p>
                            {stats.user_loads.map(user => (
                              <div key={user.id} className="flex items-center gap-3 px-3 py-2 rounded-md bg-zinc-950/30 border border-zinc-800/50">
                                <div className="w-6 h-6 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0">
                                  <User size={10} className="text-white/40" />
                                </div>
                                <span className="text-xs text-white/70 flex-1 truncate">{user.name}</span>
                                <span className="text-xs font-medium text-blue-400">{user.deal_count} deals</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Trigger button */}
                        <button
                          onClick={() => handleTrigger('round_robin')}
                          disabled={isTriggering || stats.unassigned_deals === 0}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-md bg-blue-500/20 border border-blue-500/30 text-blue-400 text-[10px] font-bold uppercase tracking-widest hover:bg-blue-500/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          {isTriggering ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />}
                          {stats.unassigned_deals === 0
                            ? "All Deals Assigned"
                            : `Distribute ${stats.unassigned_deals} Unassigned Deals`}
                        </button>
                      </>
                    )}

                    {type.id === 'least_loaded' && (
                      <>
                        {/* User load table */}
                        {stats.user_loads.length > 0 ? (
                          <div className="space-y-2">
                            <p className="text-[9px] text-white/30 uppercase tracking-widest font-medium">User Load — Lowest First</p>
                            {stats.user_loads.map((user, i) => (
                              <div key={user.id} className="flex items-center gap-3 px-3 py-2 rounded-md bg-zinc-950/30 border border-zinc-800/50">
                                <span className={cn(
                                  "text-[9px] font-bold w-5 text-center",
                                  i === 0 ? "text-emerald-400" : "text-white/20"
                                )}>
                                  #{i + 1}
                                </span>
                                <div className="w-6 h-6 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0">
                                  <User size={10} className="text-white/40" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <span className="text-xs text-white/70 truncate block">{user.name}</span>
                                  <span className="text-[10px] text-white/30 truncate block">{user.email}</span>
                                </div>
                                <div className="text-right shrink-0">
                                  <span className="text-xs font-medium text-blue-400">{user.deal_count}</span>
                                  <span className="text-[9px] text-white/30 ml-1">deals</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-[10px] text-white/20 uppercase tracking-widest text-center py-4">
                            No eligible users in assigned groups
                          </p>
                        )}

                        {/* Unassigned count */}
                        <div className="p-3 rounded-md bg-zinc-950/50 border border-zinc-800 flex items-center justify-between">
                          <span className="text-[10px] text-white/40 uppercase tracking-widest font-medium">Unassigned Deals</span>
                          <span className="text-sm font-semibold text-white">{stats.unassigned_deals}</span>
                        </div>

                        {/* Trigger button */}
                        <button
                          onClick={() => handleTrigger('least_loaded')}
                          disabled={isTriggering || stats.unassigned_deals === 0 || stats.user_loads.length === 0}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-md bg-blue-500/20 border border-blue-500/30 text-blue-400 text-[10px] font-bold uppercase tracking-widest hover:bg-blue-500/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          {isTriggering ? <Loader2 size={14} className="animate-spin" /> : <BarChart3 size={14} />}
                          {stats.unassigned_deals === 0
                            ? "All Deals Assigned"
                            : `Assign ${stats.unassigned_deals} to Least Loaded`}
                        </button>
                      </>
                    )}

                    {/* Result feedback */}
                    {type.id === 'single_user' && (
                      <>
                        <div className="space-y-2">
                          <p className="text-[9px] text-white/30 uppercase tracking-widest font-medium">Select Target User</p>
                          {stats.user_loads.length > 0 ? (
                            <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-2">
                              {stats.user_loads.map((user) => (
                                <div
                                  key={user.id}
                                  onClick={() => setSelectedSingleUser(user.id)}
                                  className={cn(
                                    "flex items-center gap-3 px-3 py-2 rounded-md border cursor-pointer transition-all",
                                    selectedSingleUser === user.id
                                      ? "bg-blue-500/20 border-blue-500/50 shadow-[0_0_10px_rgba(59,130,246,0.1)]"
                                      : "bg-zinc-950/30 border-zinc-800/50 hover:bg-zinc-900/50 hover:border-zinc-700"
                                  )}
                                >
                                  <div className={cn(
                                    "w-6 h-6 rounded-full border flex items-center justify-center shrink-0",
                                    selectedSingleUser === user.id
                                      ? "bg-blue-500/20 border-blue-500/50"
                                      : "bg-zinc-800 border-zinc-700"
                                  )}>
                                    <User size={10} className={selectedSingleUser === user.id ? "text-blue-400" : "text-white/40"} />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <span className={cn(
                                      "text-xs truncate block font-medium",
                                      selectedSingleUser === user.id ? "text-blue-400" : "text-white/70"
                                    )}>{user.name}</span>
                                    <span className="text-[10px] text-white/30 truncate block">{user.email}</span>
                                  </div>
                                  <div className="text-right shrink-0">
                                    <span className={cn(
                                      "text-xs font-medium",
                                      selectedSingleUser === user.id ? "text-blue-400" : "text-white/60"
                                    )}>{user.deal_count}</span>
                                    <span className="text-[9px] text-white/30 ml-1">deals</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-[10px] text-white/20 uppercase tracking-widest text-center py-4 border border-zinc-800/50 rounded-md">
                              No eligible users in assigned groups
                            </p>
                          )}
                        </div>

                        <div className="p-3 rounded-md bg-zinc-950/50 border border-zinc-800 flex items-center justify-between mt-4">
                          <span className="text-[10px] text-white/40 uppercase tracking-widest font-medium">Unassigned Deals</span>
                          <span className="text-sm font-semibold text-white">{stats.unassigned_deals}</span>
                        </div>

                        <button
                          onClick={() => handleTrigger('single_user', selectedSingleUser)}
                          disabled={isTriggering || stats.unassigned_deals === 0 || !selectedSingleUser}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-md bg-blue-500/20 border border-blue-500/30 text-blue-400 text-[10px] font-bold uppercase tracking-widest hover:bg-blue-500/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed mt-4"
                        >
                          {isTriggering ? <Loader2 size={14} className="animate-spin" /> : <User size={14} />}
                          {stats.unassigned_deals === 0
                            ? "All Deals Assigned"
                            : `Assign ${stats.unassigned_deals} to Selected User`}
                        </button>
                      </>
                    )}

                    {triggerResult && (
                      <div className={cn(
                        "p-3 rounded-md text-center text-[10px] font-medium uppercase tracking-widest",
                        triggerResult.error
                          ? "bg-red-500/10 border border-red-500/20 text-red-400"
                          : "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                      )}>
                        {triggerResult.error || triggerResult.message}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-[10px] text-white/20 uppercase tracking-widest text-center py-4">
                    Unable to load stats
                  </p>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

const UserPipelineManager = ({ 
  isOpen, 
  onClose, 
  departments = [], 
  users = [],
  selectedPipeline = null,
  onPipelineUpdated
}) => {
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [expandedDepartments, setExpandedDepartments] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('groups');
  const [searchQuery, setSearchQuery] = useState('');
  const [assignmentType, setAssignmentType] = useState('manual');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (selectedPipeline) {
      setSelectedDepartments(selectedPipeline.departments || []);
      setAssignmentType(selectedPipeline.assignment_type || 'manual');
    }
  }, [selectedPipeline]);

  const toggleDepartment = (e, dept) => {
    e.stopPropagation();
    const isSelected = selectedDepartments.some(d => d.id === dept.id);
    if (isSelected) {
      setSelectedDepartments(selectedDepartments.filter(d => d.id !== dept.id));
    } else {
      setSelectedDepartments([...selectedDepartments, dept]);
    }
  };

  const toggleExpand = (dept) => {
    const isExpanded = expandedDepartments.some(d => d.id === dept.id);
    if (isExpanded) {
      setExpandedDepartments(expandedDepartments.filter(d => d.id !== dept.id));
    } else {
      setExpandedDepartments([...expandedDepartments, dept]);
    }
  };

  const getDeptUsers = (dept) => {
    return users.filter(user => 
      user.departments?.some(d => d.id === dept.id)
    );
  };

  // Filter groups and users based on search
  const filteredDepartments = useMemo(() => {
    if (!searchQuery) return departments;
    return departments.filter(dept => 
      dept.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [departments, searchQuery]);

  // Get unique users from selected departments
  const uniqueSelectedUsers = useMemo(() => {
    const userMap = new Map();
    selectedDepartments.forEach(dept => {
      const deptUsers = users.filter(user => 
        user.departments?.some(d => d.id === dept.id)
      );
      deptUsers.forEach(user => {
        if (!userMap.has(user.id)) {
          userMap.set(user.id, user);
        }
      });
    });
    return Array.from(userMap.values());
  }, [selectedDepartments, users]);

  const filteredUsers = useMemo(() => {
    if (!searchQuery) return uniqueSelectedUsers;
    return uniqueSelectedUsers.filter(user => 
      (user.first_name + ' ' + user.last_name).toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [uniqueSelectedUsers, searchQuery]);

  const handleSave = async () => {
    if (!selectedPipeline) return;
    
    setIsSaving(true);
    try {
      const data = {
        department_ids: selectedDepartments.map(d => d.id),
        assignment_type: assignmentType
      };
      
      await CRMApiService.updatePipeline(selectedPipeline.id, data);
      
      if (onPipelineUpdated) {
        onPipelineUpdated();
      }
    } catch (err) {
      console.error("Error updating pipeline:", err);
      setError(err.message || "Failed to update pipeline. Please check your connection.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-8 pt-8 pb-3 border-b border-zinc-800 bg-white/[0.02] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Users size={20} />
            </div>
            <div>
              <h2 className="text-base font-medium text-white uppercase tracking-wider">Manage Pipeline Users</h2>
              <p className="text-[10px] text-white/40 uppercase tracking-widest font-medium">
                Assign groups to {selectedPipeline?.name || "pipeline"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="h-9 w-9 rounded-md bg-zinc-900/50 border border-zinc-800 text-white/40 hover:text-white hover:bg-zinc-800 transition-all flex items-center justify-center"
          >
            <X size={16} />
          </button>
        </div>

        {/* Subheader with Search and Tabs */}
        <div className="px-8 py-4 border-b border-zinc-800 bg-zinc-900/10 shrink-0">
          <div className="flex items-center gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={14} />
              <input
                type="text"
                placeholder={activeTab === 'groups' ? "Search groups..." : "Search users..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-950/50 border border-zinc-800 rounded-md pl-10 pr-4 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-blue-500/50 focus:bg-zinc-950 transition-all"
              />
            </div>

            {/* Tabs */}
            <div className="relative flex items-center p-1 bg-white/[0.02] border border-white/20 rounded-md">
              <div 
                className={cn(
                  "absolute inset-y-0 shadow-[0_0_15px_rgba(59,130,246,0.1)] transition-all duration-300 ease-out z-0",
                  activeTab === 'groups' 
                    ? "left-0 w-1/3 rounded-l rounded-r-none bg-blue-500/20" 
                    : activeTab === 'users'
                    ? "left-1/3 w-1/3 bg-blue-500/20"
                    : "left-2/3 w-1/3 rounded-r rounded-l-none bg-blue-500/20"
                )}
              />
              <button
                onClick={() => setActiveTab('groups')}
                className={cn(
                  "relative z-10 px-4 py-1.5 rounded text-[10px] font-medium uppercase tracking-[0.2em] transition-all duration-300 w-1/3",
                  activeTab === 'groups' ? "text-blue-400" : "text-white/50 hover:text-white/80"
                )}
              >
                Groups
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={cn(
                  "relative z-10 px-4 py-1.5 rounded text-[10px] font-medium uppercase tracking-[0.2em] transition-all duration-300 w-1/3",
                  activeTab === 'users' ? "text-blue-400" : "text-white/50 hover:text-white/80"
                )}
              >
                Users
              </button>
              <button
                onClick={() => setActiveTab('assign')}
                className={cn(
                  "relative z-10 px-4 py-1.5 rounded text-[10px] font-medium uppercase tracking-[0.2em] transition-all duration-300 w-1/3",
                  activeTab === 'assign' ? "text-blue-400" : "text-white/50 hover:text-white/80"
                )}
              >
                Assign
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
          {selectedPipeline ? (
            activeTab === 'groups' ? (
              // Groups Tab
              <div className="space-y-3">
                {filteredDepartments.map((dept) => {
                  const isSelected = selectedDepartments.some(d => d.id === dept.id);
                  const isExpanded = expandedDepartments.some(d => d.id === dept.id);
                  const deptUsers = getDeptUsers(dept);

                  return (
                    <div 
                      key={dept.id}
                      className={`rounded-lg border transition-all ${
                        isSelected 
                          ? "bg-blue-500/10 border-blue-500/30" 
                          : "bg-zinc-900/30 border-zinc-800 hover:bg-zinc-900/50"
                      }`}
                    >
                      {/* Group Header */}
                      <div 
                        className="flex items-center gap-3 p-4 cursor-pointer"
                        onClick={() => toggleExpand(dept)}
                      >
                        <button
                          onClick={(e) => toggleDepartment(e, dept)}
                          className="shrink-0"
                        >
                          {isSelected ? (
                            <CheckCircle2 size={18} className="text-blue-400" />
                          ) : (
                            <Circle size={18} className="text-white/30" />
                          )}
                        </button>
                        
                        <div className="flex-1 text-left">
                          <h4 className="text-sm font-medium text-white">{dept.name}</h4>
                          <p className="text-xs text-white/40">{dept.user_count || 0} users</p>
                        </div>

                        <button
                          className="shrink-0"
                        >
                          {isExpanded ? (
                            <ChevronDown size={16} className="text-white/30" />
                          ) : (
                            <ChevronRight size={16} className="text-white/30" />
                          )}
                        </button>
                      </div>

                      {/* Users List */}
                      {isExpanded && (
                        <div className="border-t border-zinc-800/50 px-4 py-3">
                          {deptUsers.length === 0 ? (
                            <p className="text-xs text-white/20 uppercase tracking-widest py-2 text-center">
                              No users in this group
                            </p>
                          ) : (
                            <div className="space-y-2 max-h-52 overflow-y-auto custom-scrollbar">
                              {deptUsers.map((user) => (
                                <div 
                                  key={user.id} 
                                  className="flex items-center gap-3 p-3 rounded-md bg-zinc-900/30"
                                >
                                  <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0">
                                    <User size={12} className="text-white/40" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h5 className="text-sm font-medium text-white truncate">
                                      {user.first_name} {user.last_name}
                                    </h5>
                                    <div className="flex items-center gap-2 mt-1">
                                      <Mail size={9} className="text-white/40 shrink-0" />
                                      <p className="text-[10px] text-white/40 truncate">{user.email}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Shield size={9} className={
                                      user.role === 'Superadmin' ? "text-purple-400" :
                                      user.role === 'Admin' ? "text-blue-400" :
                                      "text-white/40"
                                    } />
                                    <span className={`text-[9px] uppercase tracking-widest font-medium ${
                                      user.role === 'Superadmin' ? "text-purple-400" :
                                      user.role === 'Admin' ? "text-blue-400" :
                                      "text-white/40"
                                    }`}>
                                      {user.role}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : activeTab === 'users' ? (
              // Users Tab
              <div className="space-y-3">
                {filteredUsers.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-[10px] text-white/20 uppercase tracking-widest font-medium">
                      {searchQuery ? "No users found" : (selectedDepartments.length === 0 ? "Select groups to see users" : "No users in selected groups")}
                    </p>
                  </div>
                ) : (
                  filteredUsers.map((user) => (
                    <div 
                      key={user.id} 
                      className="p-4 rounded-lg bg-zinc-900/30 border border-zinc-800"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0">
                          <User size={16} className="text-white/40" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-white truncate">
                            {user.first_name} {user.last_name}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Mail size={10} className="text-white/40 shrink-0" />
                            <p className="text-xs text-white/40 truncate">{user.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Shield size={10} className={
                            user.role === 'Superadmin' ? "text-purple-400" :
                            user.role === 'Admin' ? "text-blue-400" :
                            "text-white/40"
                          } />
                          <span className={`text-[10px] uppercase tracking-widest font-medium ${
                            user.role === 'Superadmin' ? "text-purple-400" :
                            user.role === 'Admin' ? "text-blue-400" :
                            "text-white/40"
                          }`}>
                            {user.role}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              // Assign Tab
              <AssignTab
                selectedPipeline={selectedPipeline}
                assignmentType={assignmentType}
                setAssignmentType={setAssignmentType}
              />
            )
          ) : (
            <div className="text-center py-12">
              <p className="text-[10px] text-white/20 uppercase tracking-widest font-medium">
                Select a pipeline first in the top-right selector
              </p>
            </div>
          )}
          
          {error && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-md">
              <p className="text-[10px] text-red-400 font-medium uppercase tracking-wider text-center">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-4 border-t border-zinc-800 bg-white/[0.01] flex items-center justify-end shrink-0 gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-zinc-900 border border-zinc-800 text-[9px] font-medium text-white/40 hover:text-white hover:bg-zinc-800 hover:border-zinc-700 uppercase tracking-widest transition-all rounded-md cursor-pointer"
          >
            Close
          </button>
          {selectedPipeline && (
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 bg-blue-500/20 border border-blue-500/30 text-[9px] font-medium text-blue-400 hover:text-blue-300 hover:bg-blue-500/30 hover:border-blue-500/40 uppercase tracking-widest transition-all rounded-md cursor-pointer disabled:opacity-50 flex items-center gap-2"
            >
              {isSaving ? <Loader2 size={14} className="animate-spin" /> : null}
              Save
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default UserPipelineManager;
