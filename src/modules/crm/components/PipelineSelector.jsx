import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Plus, Layout, Search, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const PipelineSelector = ({ pipelines, selectedPipeline, onSelect, onCreateNew, onSearch }) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const totalRef = useRef(pipelines.length);
  const debounceRef = useRef(null);
  const inputRef = useRef(null);
  const showSearch = totalRef.current > 10;

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setIsSearching(true);
      Promise.resolve(onSearch ? onSearch(val) : Promise.resolve()).finally(() => setIsSearching(false));
    }, 300);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setIsSearching(true);
    Promise.resolve(onSearch ? onSearch('') : Promise.resolve()).finally(() => setIsSearching(false));
  };

  useEffect(() => {
    if (open) {
      totalRef.current = pipelines.length;
      if (inputRef.current) {
        setTimeout(() => inputRef.current?.focus(), 50);
      }
    } else {
      setSearchQuery('');
      setIsSearching(false);
      if (onSearch) onSearch('');
    }
  }, [open]);

  return (
    <div className="flex items-center gap-3">
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger className="w-64 bg-white/5 border border-white/10 !h-10 px-4 rounded-md flex items-center justify-between text-[10px] font-normal uppercase tracking-widest text-white hover:bg-white/10 transition-all outline-none focus:ring-0 focus:border-white/20">
            <span className={cn("truncate", selectedPipeline?.pipeline_type === 'retarget' ? "text-orange-400" : selectedPipeline?.pipeline_type === 'sales' && "text-blue-400")}>{selectedPipeline ? selectedPipeline.name : "Select Pipeline"}</span>
            <ChevronDown size={14} className="opacity-40" />
          </DropdownMenuTrigger>
        
        <DropdownMenuContent align="end" onCloseAutoFocus={(e) => e.preventDefault()} className="w-64 bg-zinc-900 border border-zinc-800 p-1.5">
          {showSearch && (
          <div className="sticky top-0 z-10 bg-zinc-900 border-b border-zinc-800 p-1.5 -mx-1.5 -mt-1.5 px-1.5">
            <div className="relative flex items-center" onPointerDown={(e) => e.stopPropagation()}>
              <Search size={12} className="absolute left-2.5 text-white/30 pointer-events-none" />
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                onKeyDown={(e) => e.stopPropagation()}
                placeholder="Search pipelines..."
                className="w-full h-8 bg-white/5 border border-white/10 rounded pl-7 pr-7 text-[10px] text-white placeholder:text-white/20 outline-none focus:border-white/20 transition-colors"
              />
              {isSearching ? (
                <Loader2 size={12} className="absolute right-2 text-blue-400 animate-spin pointer-events-none" />
              ) : searchQuery ? (
                <button onClick={clearSearch} className="absolute right-2 text-white/30 hover:text-white cursor-pointer">
                  <X size={12} />
                </button>
              ) : null}
            </div>
          </div>
          )}

          {/* Pipeline list */}
          <div className="max-h-[300px] overflow-y-auto custom-scrollbar p-1.5">
            {pipelines.length === 0 ? (
              <div className="text-[10px] py-2.5 px-3 uppercase tracking-widest text-white/40">
                No Pipelines
              </div>
            ) : (
              pipelines.map((p) => (
                <DropdownMenuItem 
                  key={p.id} 
                  onClick={() => { onSelect(p); setOpen(false); }}
                  className={cn(
                    "cursor-pointer text-[10px] py-2.5 uppercase tracking-widest font-normal transition-colors",
                    selectedPipeline?.id === p.id ? "bg-white/10 text-white" : "text-white/60 hover:bg-white/5 hover:text-white",
                    p.pipeline_type === 'retarget' ? "text-orange-400" : p.pipeline_type === 'sales' && "text-blue-400"
                  )}
                >
                  {p.name}
                </DropdownMenuItem>
              ))
            )}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default PipelineSelector;
