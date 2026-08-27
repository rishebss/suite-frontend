import React, { useState, useEffect, useRef } from 'react';
import { X, Users, Loader2, Search, UserCheck, ShieldCheck, ShieldOff } from 'lucide-react';
import axios from 'axios';
import { mediaApi } from '../api/mediaApi';

const CreatorGroupPanel = ({ onClose, onSaved }) => {
  const [allGroups, setAllGroups] = useState([]);
  const [creatorRecords, setCreatorRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [toggling, setToggling] = useState(null);

  const creatorGroupIds = new Set(creatorRecords.map((r) => r.department_id));

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      // Fetch all departments (groups) and creator groups in parallel
      const [deptRes, creatorRes] = await Promise.all([
        axios.get('/api/auth/departments/', { params: { page_size: 100 } }),
        mediaApi.listCreatorGroups(),
      ]);

      const departments = deptRes.data?.results || deptRes.data || [];
      const creators = creatorRes.data?.data || [];

      setAllGroups(departments);
      setCreatorRecords(creators);
    } catch (err) {
      setError('Failed to load groups. Make sure the server is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggle = async (deptId) => {
    setToggling(deptId);
    setError('');
    try {
      const isCurrentlyCreator = creatorGroupIds.has(deptId);
      if (isCurrentlyCreator) {
        const record = creatorRecords.find((c) => c.department_id === deptId);
        if (record) {
          await mediaApi.removeCreatorGroup(record.id);
          setCreatorRecords((prev) => prev.filter((r) => r.id !== record.id));
        }
      } else {
        const res = await mediaApi.addCreatorGroup(deptId);
        const newRecord = res.data?.data;
        if (newRecord) {
          setCreatorRecords((prev) => [...prev, newRecord]);
        }
      }
      onSaved?.();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update group permission.');
    } finally {
      setToggling(null);
    }
  };

  const filteredGroups = searchQuery.trim()
    ? allGroups.filter(
        (g) =>
          g.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          g.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : allGroups;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md mx-4 bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-500/10">
              <UserCheck size={18} className="text-purple-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Collection Creators</h2>
              <p className="text-xs text-white/40">Toggle which groups can create collections</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Search filter */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter groups by name..."
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/20 transition-all"
            />
          </div>

          {error && (
            <div className="px-4 py-2.5 bg-red-500/10 border border-red-500/20 rounded-xl">
              <p className="text-xs text-red-400 font-medium">{error}</p>
            </div>
          )}

          {/* Groups list */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-[11px] font-bold uppercase tracking-widest text-white/40">
                All Groups
              </label>
              <span className="text-[10px] text-white/20 font-medium">
                {creatorGroupIds.size} with creator access
              </span>
            </div>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 size={18} className="text-white/20 animate-spin" />
              </div>
            ) : filteredGroups.length === 0 ? (
              <p className="text-xs text-white/30 text-center py-12">
                {searchQuery.trim()
                  ? 'No groups match your filter.'
                  : 'No groups found. Create one in User Management first.'}
              </p>
            ) : (
              <div className="space-y-1 max-h-72 overflow-y-auto custom-scrollbar pr-1">
                {filteredGroups.map((group) => {
                  const hasAccess = creatorGroupIds.has(group.id);
                  const isToggling = toggling === group.id;
                  return (
                    <div
                      key={group.id}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all ${
                        hasAccess
                          ? 'bg-purple-500/10 border-purple-500/20'
                          : 'bg-white/5 border-white/5 hover:bg-white/[0.07]'
                      }`}
                    >
                      <div className={`p-1.5 rounded-lg ${hasAccess ? 'bg-purple-500/20' : 'bg-white/5'}`}>
                        <Users size={14} className={hasAccess ? 'text-purple-400' : 'text-white/30'} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold truncate ${hasAccess ? 'text-purple-200' : 'text-white/70'}`}>
                          {group.name}
                        </p>
                        {group.description && (
                          <p className="text-[10px] text-white/30 truncate">{group.description}</p>
                        )}
                      </div>
                      <button
                        onClick={() => handleToggle(group.id)}
                        disabled={isToggling}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all shrink-0 ${
                          hasAccess
                            ? 'bg-purple-500/20 text-purple-300 hover:bg-purple-500/30'
                            : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/70'
                        }`}
                        title={hasAccess ? 'Remove creator access' : 'Grant creator access'}
                      >
                        {isToggling ? (
                          <Loader2 size={11} className="animate-spin" />
                        ) : hasAccess ? (
                          <ShieldCheck size={11} />
                        ) : (
                          <ShieldOff size={11} />
                        )}
                        {isToggling ? '...' : hasAccess ? 'Active' : 'Grant'}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex pt-2">
            <button
              onClick={onClose}
              className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold text-white/60 bg-white/5 hover:bg-white/10 transition-all"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatorGroupPanel;
