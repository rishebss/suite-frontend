import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Search, X, Phone, Mail, ChevronRight } from 'lucide-react';
import axios from 'axios';
import RingLoader from '@/components/ui/RingLoader';
import { cn } from '@/lib/utils';

const STATUS_STYLES = {
  Lead: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
  Prospect: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
  Customer: 'bg-green-500/10 border-green-500/20 text-green-400',
  Inactive: 'bg-zinc-500/10 border-zinc-500/20 text-zinc-400',
  Retarget: 'bg-amber-500/10 border-amber-500/20 text-amber-400'
};

const PRIORITY_STYLES = {
  High: 'border-red-500/30 bg-red-500/10 text-red-400',
  Medium: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
  Low: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
};

const SearchDialog = ({ isOpen, onClose, searchQuery, setSearchQuery, pipelineId, pipelines = [], onSelect }) => {
  const inputRef = useRef(null);
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const pipelineMap = useMemo(() => {
    const map = {};
    pipelines.forEach((p) => { map[p.id] = p; });
    return map;
  }, [pipelines]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const searchDeals = async () => {
      if (!searchQuery.trim()) {
        setResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const response = await axios.get('/api/crm/pipeline/', {
          params: {
            search: searchQuery,
            search_by: 'name,email,phone',
            ...(pipelineId ? { pipeline: pipelineId } : {})
          }
        });
        setResults(response.data.results || response.data);
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        setIsSearching(false);
      }
    };

    const debounceTimer = setTimeout(searchDeals, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, pipelineId, isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[500] flex items-start justify-center pt-[12vh] px-4">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />

      <div className="relative w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[75vh] animate-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="px-8 py-6 border-b border-zinc-800 bg-white/[0.02] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Search size={18} />
            </div>
            <div>
              <h2 className="text-base font-medium text-white uppercase tracking-wider">Pipeline Search</h2>
              <p className="text-[10px] text-white/40 uppercase tracking-widest font-medium">
                Registry: <span className="text-blue-400 font-semibold">{pipelineMap[pipelineId]?.name || 'ALL PIPELINES'}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/20 hover:text-white rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Search Input */}
        <div className="px-8 py-4 border-b border-zinc-800 shrink-0">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search by name, email or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') onClose();
              }}
              className="w-full bg-white/5 border border-zinc-800 rounded-md py-2 pl-9 pr-4 text-[11px] text-white placeholder:text-white/10 focus:border-blue-500/40 outline-none transition-all font-medium tracking-wide"
            />
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-6 space-y-2 bg-black/40">
          {isSearching ? (
            <div className="py-14 flex flex-col items-center justify-center gap-4">
              <RingLoader className="scale-75" />
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/20 animate-pulse">Scanning Registry...</p>
            </div>
          ) : !searchQuery.trim() ? (
            <div className="py-14 text-center">
              <Search size={36} className="mx-auto mb-4 text-white/5" />
              <p className="text-[10px] text-white/20 uppercase tracking-[0.2em] font-medium">Awaiting Input Parameters</p>
            </div>
          ) : results.length === 0 ? (
            <div className="py-14 text-center">
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/20">No Matching Records Found</p>
              <p className="text-[9px] text-white/10 mt-1 uppercase tracking-widest">Adjust query parameters and retry</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between pb-1">
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/30">
                  Results · {results.length}
                </p>
              </div>
              {results.map((deal) => {
                const contactName = deal.contact_details?.name || 'Unnamed Contact';
                const contactEmail = deal.contact_details?.email;
                const contactPhone = deal.contact_details?.phone;
                const status = deal.contact_details?.status;
                const pipelineName = pipelineMap[deal.pipeline]?.name;
                const stageName = deal.stage_details?.name;
                const priority = deal.priority;

                return (
                  <button
                    key={deal.id}
                    onClick={() => onSelect?.(deal)}
                    className="w-full group flex items-center gap-3 rounded-lg bg-white/[0.02] border border-zinc-900 hover:border-blue-500/30 px-3 py-2.5 text-left transition-all duration-200 hover:bg-white/[0.04]"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="truncate text-xs font-semibold text-white uppercase tracking-wide">{contactName}</h4>
                        {status && (
                          <span className={cn(
                            "shrink-0 px-1.5 py-0.5 rounded border text-[8px] font-bold uppercase tracking-[0.15em]",
                            STATUS_STYLES[status] || 'border-white/10 bg-white/5 text-white/40'
                          )}>
                            {status}
                          </span>
                        )}
                      </div>
                      <div className="mt-1 flex items-center gap-3 text-[10px] text-white/40">
                        {contactEmail && (
                          <span className="flex items-center gap-1 truncate">
                            <Mail size={9} className="shrink-0" />
                            {contactEmail}
                          </span>
                        )}
                        {contactPhone && (
                          <span className="flex items-center gap-1 truncate">
                            <Phone size={9} className="shrink-0" />
                            {contactPhone}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-1.5">
                      {pipelineName && (
                        <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[8px] font-bold uppercase tracking-[0.15em] text-white/50">
                          {pipelineName}
                        </span>
                      )}
                      {stageName && (
                        <span className="px-2 py-0.5 rounded bg-blue-500/5 border border-blue-500/20 text-[8px] font-bold uppercase tracking-[0.15em] text-blue-400">
                          {stageName}
                        </span>
                      )}
                      {priority && (
                        <span className={cn(
                          "px-2 py-0.5 rounded border text-[8px] font-bold uppercase tracking-[0.15em]",
                          PRIORITY_STYLES[priority] || 'border-white/10 bg-white/5 text-white/40'
                        )}>
                          {priority}
                        </span>
                      )}
                      <ChevronRight size={12} className="ml-0.5 text-white/15 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </button>
                );
              })}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-4 border-t border-zinc-800 bg-white/[0.01] flex items-center justify-between shrink-0 text-[9px] font-bold uppercase tracking-[0.2em] text-white/20">
          <span className="flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-zinc-800 text-white/40">Select</kbd>
            Open Record
          </span>
          <span className="flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-zinc-800 text-white/40">Esc</kbd>
            Dismiss
          </span>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default SearchDialog;
