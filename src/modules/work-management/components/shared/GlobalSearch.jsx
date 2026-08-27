import React, { useState, useCallback, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Search, X, Loader2, ArrowRight, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const ISSUE_TYPE_COLORS = {
  EPIC: "text-purple-400 bg-purple-500/10",
  STORY: "text-green-400 bg-green-500/10",
  TASK: "text-blue-400 bg-blue-500/10",
  BUG: "text-red-400 bg-red-500/10",
  DEAL: "text-amber-400 bg-amber-500/10",
  TICKET: "text-cyan-400 bg-cyan-500/10",
};

const GlobalSearch = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [grouped, setGrouped] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const debounceRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery("");
      setResults([]);
      setGrouped([]);
      setTotal(0);
    }
  }, [isOpen]);

  const doSearch = useCallback(async (q) => {
    if (q.length < 2) {
      setResults([]);
      setGrouped([]);
      setTotal(0);
      return;
    }
    setLoading(true);
    try {
      const { data } = await axios.get("/api/work/dashboard/global_search/", { params: { q } });
      setResults(data.results || []);
      setGrouped(data.grouped || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(val), 300);
  };

  const handleSelect = (item) => {
    onClose();
    navigate(item.url);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] bg-black/60 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-800">
          <Search size={16} className="text-white/30 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Search work items by title, key, or description..."
            className="flex-1 bg-transparent text-sm text-white placeholder:text-white/30 outline-none"
          />
          {loading && <Loader2 size={14} className="animate-spin text-white/30" />}
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-zinc-800 text-white/40 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
          {query.length < 2 ? (
            <div className="p-8 text-center">
              <Search size={32} className="mx-auto text-white/10 mb-3" />
              <p className="text-sm text-white/30">Type at least 2 characters to search</p>
            </div>
          ) : grouped.length === 0 && !loading ? (
            <div className="p-8 text-center">
              <p className="text-sm text-white/40">No results for "{query}"</p>
            </div>
          ) : (
            <div className="p-2">
              <p className="px-3 py-1.5 text-[10px] text-white/30 font-medium uppercase tracking-wider">
                {total} result{total !== 1 ? "s" : ""} for "{query}"
              </p>
              {grouped.map((group) => (
                <div key={group.project_key} className="mb-2">
                  <p className="px-3 py-1 text-[10px] text-white/40 font-mono font-bold">
                    {group.project_key} / {group.project_name}
                  </p>
                  {group.items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(item)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-zinc-800/60 transition-colors text-left group"
                    >
                      <span className="text-[10px] font-mono text-white/30 w-20 shrink-0">{item.key}</span>
                      <span className={cn(
                        "px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider shrink-0",
                        ISSUE_TYPE_COLORS[item.issue_type] || "text-zinc-400 bg-zinc-500/10"
                      )}>
                        {item.issue_type}
                      </span>
                      <span className="flex-1 text-sm text-white truncate">{item.title}</span>
                      <span className="text-[10px] text-white/30 mr-2">{item.project_key}</span>
                      <ArrowRight size={14} className="text-white/20 group-hover:text-blue-400 transition-colors opacity-0 group-hover:opacity-100" />
                    </button>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GlobalSearch;
