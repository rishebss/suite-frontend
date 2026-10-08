import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Search, X, Plus, GitBranch, Layout, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import axios from "axios";
import RingLoader from "@/components/ui/RingLoader";

const TYPE_STYLES = {
  sales: "text-blue-400",
  retarget: "text-orange-400",
  clients: "text-emerald-400",
};

/**
 * Inner picker — remounts on every open, so its initial state is
 * already the reset state (no reset effect needed). `loading` is
 * derived (`results.query !== debounced`) rather than stored, so
 * every setState happens inside async callbacks (debounce timer /
 * fetch promises / form submit), matching the other drawers' pattern.
 */
function PipelineSelectContent({ onClose, onSelect }) {
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [results, setResults] = useState({
    query: null,
    list: [],
    hasMore: false,
  });
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const searchRef = useRef(null);

  // Inline create form (lives inside this modal, not a separate one).
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const loading = results.query !== debounced;
  const pipelines = results.list;
  const hasMore = results.hasMore;

  // Debounce the search box (setState inside the timer callback).
  useEffect(() => {
    const t = setTimeout(() => setDebounced(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  // Page 1 (or first search page).
  useEffect(() => {
    let cancelled = false;
    const params = { page: 1, page_size: 20 };
    if (debounced) params.search = debounced;
    axios
      .get("/api/crm/pipelines/", { params })
      .then((res) => {
        if (cancelled) return;
        const d = res.data || {};
        const list = d.results || d || [];
        setResults({
          query: debounced,
          list: Array.isArray(list) ? list : [],
          hasMore: !!d.next,
        });
        setPage(1);
      })
      .catch(() => {
        if (!cancelled) setResults({ query: debounced, list: [], hasMore: false });
      });
    return () => {
      cancelled = true;
    };
  }, [debounced]);

  // Focus search on mount.
  useEffect(() => {
    const t = setTimeout(() => searchRef.current?.focus(), 100);
    return () => clearTimeout(t);
  }, []);

  // Esc to close.
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const loadMore = () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    const params = { page: nextPage, page_size: 20 };
    if (debounced) params.search = debounced;
    axios
      .get("/api/crm/pipelines/", { params })
      .then((res) => {
        const d = res.data || {};
        const list = d.results || d || [];
        setResults((prev) => ({
          ...prev,
          list: [...prev.list, ...(Array.isArray(list) ? list : [])],
          hasMore: !!d.next,
        }));
        setPage(nextPage);
      })
      .catch(() => {})
      .finally(() => setLoadingMore(false));
  };

  const cancelForm = () => {
    setShowForm(false);
    setName("");
    setDescription("");
    setError("");
  };

  // Create the pipeline, then auto-select it for the payment rule.
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim() || isSubmitting) return;
    setIsSubmitting(true);
    setError("");
    try {
      const res = await axios.post("/api/crm/pipelines/", {
        name: name.trim(),
        description: description.trim(),
      });
      onSelect(res.data);
    } catch {
      setError("Failed to create pipeline.");
      setIsSubmitting(false);
    }
  };

  return (
    <>
    <div className="fixed inset-0 z-[510] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[70vh] animate-in zoom-in-95 duration-200">
        <div className="px-8 py-6 border-b border-zinc-800 bg-white/[0.02] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <GitBranch size={18} />
            </div>
            <div>
              <h2 className="text-base font-medium text-white uppercase tracking-wider">
                {showForm ? "New Pipeline" : "Create Payment Rule"}
              </h2>
              <p className="text-[10px] text-white/40 uppercase tracking-widest font-medium">
                {showForm
                  ? "Define the pipeline for this rule"
                  : "Select a pipeline to attach the rule to"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/20 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {showForm ? (
          /* ---------- Inline create form ---------- */
          <form
            onSubmit={handleCreate}
            className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-5 min-h-0 animate-in fade-in slide-in-from-top-4 duration-500"
          >
            <div className="space-y-2">
              <label className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/30 block">
                Pipeline Name
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Enterprise Sales"
                className="bg-white/5 border-zinc-800 h-12 text-sm text-white placeholder:text-white/10 focus:border-blue-500/40 focus:ring-0 focus-visible:ring-0 outline-none transition-all font-medium rounded-md"
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/30 block">
                Details (Optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Define workflow objectives..."
                className="w-full bg-white/5 border border-zinc-800 rounded-md p-4 text-sm text-white placeholder:text-white/10 focus:border-blue-500/40 focus:ring-0 outline-none min-h-[100px] resize-none font-medium transition-all"
              />
            </div>
            {error && (
              <p className="text-[10px] text-red-500 font-medium uppercase tracking-wider">
                {error}
              </p>
            )}
            <div className="flex gap-3 pt-2 pb-1">
              <button
                type="button"
                onClick={cancelForm}
                className="flex-1 h-12 bg-zinc-900/50 border border-zinc-800 text-[10px] font-bold text-white/40 hover:text-white hover:bg-zinc-800 uppercase tracking-widest transition-all rounded-lg cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !name.trim()}
                className="flex-1 h-12 bg-blue-500/10 hover:bg-blue-500/20 disabled:bg-zinc-900/50 disabled:text-white/10 disabled:border-zinc-800/50 border border-blue-500/30 hover:border-blue-500/50 text-blue-400 disabled:text-white/20 font-medium text-[10px] uppercase tracking-[0.3em] rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Layout size={14} />
                )}
                {isSubmitting ? "Creating…" : "Create & Select"}
              </button>
            </div>
          </form>
        ) : (
          /* ---------- Search + list ---------- */
          <>
            <div className="px-8 py-4 border-b border-zinc-800 shrink-0">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none"
                  />
                  <input
                    ref={searchRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search pipelines..."
                    className="w-full h-9 bg-white/5 border border-zinc-800 rounded-md pl-9 pr-8 text-xs text-white placeholder:text-white/20 outline-none focus:border-blue-500/40 transition-colors"
                  />
                  {query ? (
                    <button
                      onClick={() => setQuery("")}
                      className="absolute right-2.5 text-white/30 hover:text-white"
                    >
                      <X size={13} />
                    </button>
                  ) : null}
                </div>
                <button
                  onClick={() => setShowForm(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 hover:border-blue-500/50 rounded-md text-[10px] font-medium uppercase tracking-widest transition-all whitespace-nowrap shrink-0"
                >
                  <Plus size={14} />
                  Add
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-2 min-h-0">
              {loading && pipelines.length === 0 ? (
                <div className="flex items-center justify-center py-16">
                  <RingLoader />
                </div>
              ) : pipelines.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center py-16">
                  <div className="w-12 h-12 rounded-full bg-white/[0.02] border border-zinc-800 flex items-center justify-center text-white/10 mb-3">
                    <GitBranch size={22} />
                  </div>
                  <p className="text-sm text-white/20">No pipelines found</p>
                </div>
              ) : (
                pipelines.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => onSelect(p)}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-white/[0.04] transition-colors text-left"
                  >
                    <div className="w-8 h-8 rounded-md bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-white/30 shrink-0">
                      <GitBranch size={13} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p
                        className={cn(
                          "text-xs font-semibold truncate",
                          TYPE_STYLES[p.pipeline_type] || "text-white"
                        )}
                      >
                        {p.name}
                      </p>
                      <p className="text-[10px] text-white/25 uppercase tracking-widest mt-0.5">
                        {p.pipeline_type || "sales"}
                        {typeof p.deals_count === "number"
                          ? ` · ${p.deals_count} deals`
                          : ""}
                      </p>
                    </div>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-white/20">
                      Select
                    </span>
                  </button>
                ))
              )}
              {hasMore && (
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="w-full py-2.5 mt-1 border border-zinc-800 rounded-lg text-[10px] font-bold uppercase tracking-widest text-blue-400 hover:bg-white/5 transition-all disabled:opacity-50"
                >
                  {loadingMore ? "Loading…" : "Load more"}
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
    </>
  );
}

/**
 * Pipeline picker for the Payments "Rules" tab.
 *
 * The payments page has no active-pipeline context (unlike the CRM board),
 * so "Create Rule" lands here first: pick a pipeline, then the
 * PaymentActionsModal opens with that pipeline preloaded. "+ Add"
 * swaps in an inline create form — the new pipeline is created and
 * auto-selected for the payment rule in one step.
 */
export default function PipelineSelectModal({ open, onClose, onSelect }) {
  if (!open) return null;
  return createPortal(
    <PipelineSelectContent onClose={onClose} onSelect={onSelect} />,
    document.body
  );
}