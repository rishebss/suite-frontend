import React, { useEffect, useRef, useState } from 'react';
import { Search, X, User, Phone, Mail, ChevronRight, Building2, Shield } from 'lucide-react';
import RingLoader from '@/components/ui/RingLoader';
import UserService from '../../services/userService';
import { cn } from '@/lib/utils';

const SearchDialog = ({ isOpen, onClose, searchQuery, setSearchQuery, onSelect }) => {
  const inputRef = useRef(null);
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    const searchUsers = async () => {
      if (!searchQuery.trim()) {
        setResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const response = await UserService.getUsers({ search: searchQuery });
        setResults(response.results || response.data || []);
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        setIsSearching(false);
      }
    };

    const debounceTimer = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-md animate-in fade-in duration-300" 
        onClick={onClose} 
      />
      
      <div className="relative w-full max-w-2xl bg-zinc-950 border border-white/10 rounded-lg shadow-[0_30px_60px_-15px_rgba(0,0,0,1)] overflow-hidden animate-in zoom-in-95 slide-in-from-top-4 duration-300">
        <div className="flex items-center px-6 h-16 border-b border-white/10 bg-white/[0.02]">
          <Search size={20} className="text-white/40 mr-4" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search users by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') onClose();
            }}
            className="flex-1 bg-transparent border-none outline-none text-lg text-white placeholder:text-white/20 font-medium"
          />
          <div className="flex items-center gap-3">
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white/5 rounded-lg text-white/20 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-4 max-h-[60vh] overflow-y-auto custom-scrollbar bg-black">
          {isSearching ? (
            <div className="py-12 flex flex-col items-center justify-center gap-4">
              <RingLoader className="scale-75" />
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/20 animate-pulse">Searching users...</p>
            </div>
          ) : searchQuery ? (
            <div className="space-y-1">
              <div className="flex items-center justify-between px-2 pb-2">
                <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/20">Search Results ({results.length})</p>
              </div>
              
              {results.length > 0 ? (
                <div className="space-y-1">
                  {results.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => onSelect?.(user)}
                      className="w-full flex items-center gap-4 p-3 rounded-lg hover:bg-white/[0.03] border border-transparent hover:border-white/5 transition-all group text-left"
                    >
                      <div className="w-10 h-10 rounded-md bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white/40 group-hover:text-blue-400 group-hover:border-blue-500/30 transition-colors">
                        <User size={18} />
                      </div>
                      
                      <div className="flex-1 min-w-0 space-y-1">
                        <h4 className="text-sm font-medium text-white truncate">{user.first_name} {user.last_name}</h4>
                        
                        <div className="flex items-center gap-4 text-[10px] text-white/30 font-medium uppercase tracking-wider">
                          <span className="flex items-center gap-1">
                            <Mail size={10} />
                            {user.email}
                          </span>
                          {user.mobile && (
                            <>
                              <span className="flex items-center gap-1 text-white/10">•</span>
                              <span className="flex items-center gap-1">
                                <Phone size={10} />
                                {user.mobile}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1.5 ml-4">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-[9px] font-medium uppercase tracking-wider text-blue-400">
                            {user.role}
                          </span>
                          {user.department?.name && (
                            <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[9px] font-medium uppercase tracking-wider text-white/40">
                              {user.department.name}
                            </span>
                          )}
                        </div>
                      </div>

                      <ChevronRight size={14} className="text-white/10 group-hover:text-white/40 group-hover:translate-x-1 transition-all ml-2" />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/20">No matching users found</p>
                </div>
              )}
            </div>
          ) : (
            <div className="py-12 text-center">
              <Search size={40} className="mx-auto mb-4 text-white/5" />
              <p className="text-xs text-white/20 uppercase tracking-[0.2em] font-medium">Search Users</p>
              <p className="text-[10px] text-white/10 mt-1 uppercase tracking-widest font-medium">Awaiting Search Query</p>
            </div>
          )}
        </div>

        <div className="px-6 py-3 bg-white/[0.02] border-t border-white/10 flex items-center justify-between text-[10px] text-white/20 uppercase tracking-[0.2em] font-medium">
          <span className="flex items-center gap-1.5">
            <span className="px-1 py-0.5 rounded border border-white/10 bg-white/5 text-white/40">Select</span>
            to view user details
          </span>
          <span className="flex items-center gap-1.5">
            <span className="px-1 py-0.5 rounded border border-white/10 bg-white/5 text-white/40">Esc</span>
            to close
          </span>
        </div>
      </div>
    </div>
  );
};

export default SearchDialog;
